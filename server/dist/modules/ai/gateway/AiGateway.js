import { MAX_RETRIES, BASE_RETRY_DELAY_MS } from './AiProvider.interface.js';
import { logger } from '../../../infra/logger/logger.js';
import { ExternalServiceError } from '../../../shared/errors/ExternalServiceError.js';
export class AiGateway {
    providerManager;
    constructor(providerManager) {
        this.providerManager = providerManager;
    }
    async chat(intent, params, meta) {
        const chain = this.providerManager.getFallbackChain(intent);
        if (chain.length === 0) {
            throw new ExternalServiceError(`No available providers for intent: ${intent}`);
        }
        const startTime = Date.now();
        let lastError = null;
        let fallbackUsed = false;
        for (let i = 0; i < chain.length; i++) {
            const link = chain[i];
            const provider = link.provider;
            const modelDef = link.modelDef;
            const providerLabel = i === 0 ? 'primary' : `fallback-${i}`;
            try {
                const result = await this.executeWithRetry(provider.name, params);
                const latencyMs = Date.now() - startTime;
                this.providerManager.recordSuccess(provider.name);
                const telemetry = {
                    requestId: meta?.requestId || 'unknown',
                    userId: meta?.userId,
                    provider: provider.name,
                    model: result.model,
                    intent,
                    promptTokens: result.usage.promptTokens,
                    completionTokens: result.usage.completionTokens,
                    latencyMs,
                    cached: false,
                    fallbackUsed,
                };
                logger.info({
                    ...telemetry,
                    providerLabel,
                    latencyMs,
                }, 'AI chat request completed');
                return {
                    content: result.content,
                    finishReason: result.finishReason,
                    usage: result.usage,
                    provider: provider.name,
                    model: result.model,
                    fallbackUsed,
                    telemetry,
                };
            }
            catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                this.providerManager.recordFailure(provider.name);
                fallbackUsed = true;
                logger.warn({
                    provider: provider.name,
                    providerLabel,
                    error: lastError.message,
                    intent,
                    attempt: i + 1,
                    remaining: chain.length - i - 1,
                }, 'AI provider failed, checking fallback');
                if (i === chain.length - 1) {
                    const latencyMs = Date.now() - startTime;
                    const telemetry = {
                        requestId: meta?.requestId || 'unknown',
                        userId: meta?.userId,
                        provider: provider.name,
                        model: modelDef.model,
                        intent,
                        promptTokens: 0,
                        completionTokens: 0,
                        latencyMs,
                        cached: false,
                        fallbackUsed: true,
                        error: lastError.message,
                    };
                    logger.error({ ...telemetry, err: lastError }, 'All AI providers failed');
                    throw lastError;
                }
            }
        }
        throw lastError || new ExternalServiceError('No providers available');
    }
    async *chatStream(intent, params, meta) {
        const chain = this.providerManager.getFallbackChain(intent);
        if (chain.length === 0) {
            throw new ExternalServiceError(`No available providers for intent: ${intent}`);
        }
        const startTime = Date.now();
        let lastError = null;
        let fallbackUsed = false;
        let totalTokens = 0;
        for (let i = 0; i < chain.length; i++) {
            const link = chain[i];
            const provider = link.provider;
            const modelDef = link.modelDef;
            const providerLabel = i === 0 ? 'primary' : `fallback-${i}`;
            try {
                const stream = provider.chatStream(params);
                let chunkCount = 0;
                for await (const chunk of stream) {
                    chunkCount++;
                    if (chunk.token)
                        totalTokens += chunk.token.length;
                    yield chunk;
                }
                const latencyMs = Date.now() - startTime;
                this.providerManager.recordSuccess(provider.name);
                const telemetry = {
                    requestId: meta?.requestId || 'unknown',
                    userId: meta?.userId,
                    provider: provider.name,
                    model: modelDef.model,
                    intent,
                    promptTokens: 0,
                    completionTokens: totalTokens,
                    latencyMs,
                    cached: false,
                    fallbackUsed,
                };
                logger.info({ ...telemetry, providerLabel, chunkCount, latencyMs }, 'AI stream request completed');
                return;
            }
            catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                this.providerManager.recordFailure(provider.name);
                fallbackUsed = true;
                logger.warn({
                    provider: provider.name,
                    providerLabel,
                    error: lastError.message,
                    intent,
                    attempt: i + 1,
                    remaining: chain.length - i - 1,
                }, 'AI stream provider failed, checking fallback');
                if (i === chain.length - 1) {
                    logger.error({ err: lastError, intent }, 'All AI stream providers failed');
                    throw lastError;
                }
            }
        }
        throw lastError || new ExternalServiceError('No providers available');
    }
    async executeWithRetry(providerName, params) {
        const provider = this.providerManager.getProvider(providerName);
        if (!provider)
            throw new ExternalServiceError(`Provider not found: ${providerName}`);
        let lastError = null;
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                return await provider.chat(params);
            }
            catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                if (attempt < MAX_RETRIES) {
                    const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
                    logger.warn({
                        provider: providerName,
                        attempt: attempt + 1,
                        maxRetries: MAX_RETRIES + 1,
                        delayMs: delay,
                        error: lastError.message,
                    }, 'Retrying AI provider request');
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        throw lastError || new ExternalServiceError(`Request failed after ${MAX_RETRIES + 1} attempts`);
    }
}
//# sourceMappingURL=AiGateway.js.map