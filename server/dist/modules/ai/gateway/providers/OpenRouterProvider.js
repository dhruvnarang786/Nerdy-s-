import { AI_PROVIDER_TIMEOUT_MS, AI_STREAM_TIMEOUT_MS } from '../AiProvider.interface.js';
import { config } from '../../../../infra/config/config.js';
import { logger } from '../../../../infra/logger/logger.js';
export class OpenRouterProvider {
    name = 'openrouter';
    apiKey;
    baseUrl;
    available = true;
    usage = {
        totalRequests: 0,
        failedRequests: 0,
        totalTokens: 0,
        lastErrorAt: null,
    };
    constructor() {
        this.apiKey = config.OPENROUTER_API_KEY || '';
        this.baseUrl = config.OPENROUTER_BASE_URL;
        if (!this.apiKey) {
            this.available = false;
            logger.warn('OpenRouter API key not configured — provider marked unavailable');
        }
    }
    isAvailable() {
        return this.available && !!this.apiKey;
    }
    getHealth() {
        return {
            healthy: this.isAvailable(),
            lastChecked: Date.now(),
            latencyMs: 0,
            error: !this.apiKey ? 'API key not configured' : undefined,
        };
    }
    getUsage() {
        return { ...this.usage };
    }
    resetUsage() {
        this.usage = { totalRequests: 0, failedRequests: 0, totalTokens: 0, lastErrorAt: null };
    }
    async chat(params) {
        const model = 'openrouter/auto';
        const body = {
            model,
            messages: params.messages.map(m => ({ role: m.role, content: m.content })),
            temperature: params.temperature ?? 0.7,
            max_tokens: params.maxTokens ?? 2048,
        };
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
            signal: params.signal ?? AbortSignal.timeout(AI_PROVIDER_TIMEOUT_MS),
        });
        if (!response.ok) {
            const errBody = await response.text().catch(() => '');
            this.usage.totalRequests++;
            this.usage.failedRequests++;
            this.usage.lastErrorAt = Date.now();
            throw new Error(`OpenRouter API error ${response.status}: ${errBody}`);
        }
        const data = await response.json();
        const choice = data.choices?.[0];
        this.usage.totalRequests++;
        if (data.usage) {
            this.usage.totalTokens += data.usage.total_tokens;
        }
        return {
            content: choice?.message?.content || '',
            finishReason: this.mapFinishReason(choice?.finish_reason),
            usage: {
                promptTokens: data.usage?.prompt_tokens || 0,
                completionTokens: data.usage?.completion_tokens || 0,
                totalTokens: data.usage?.total_tokens || 0,
            },
            provider: this.name,
            model: data.model || model,
        };
    }
    async *chatStream(params) {
        const model = 'openrouter/auto';
        const body = {
            model,
            messages: params.messages.map(m => ({ role: m.role, content: m.content })),
            temperature: params.temperature ?? 0.7,
            max_tokens: params.maxTokens ?? 2048,
            stream: true,
        };
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
            signal: params.signal ?? AbortSignal.timeout(AI_STREAM_TIMEOUT_MS),
        });
        if (!response.ok) {
            const errBody = await response.text().catch(() => '');
            this.usage.totalRequests++;
            this.usage.failedRequests++;
            this.usage.lastErrorAt = Date.now();
            throw new Error(`OpenRouter stream error ${response.status}: ${errBody}`);
        }
        const reader = response.body?.getReader();
        if (!reader)
            throw new Error('OpenRouter stream response has no body');
        const decoder = new TextDecoder();
        let buffer = '';
        let index = 0;
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data: '))
                        continue;
                    const jsonStr = trimmed.slice(6);
                    if (jsonStr === '[DONE]')
                        return;
                    try {
                        const chunk = JSON.parse(jsonStr);
                        const delta = chunk.choices?.[0];
                        if (delta?.delta?.content) {
                            yield {
                                token: delta.delta.content,
                                index: index++,
                                finishReason: delta.finish_reason,
                            };
                        }
                        if (delta?.finish_reason) {
                            yield {
                                token: '',
                                index: index++,
                                finishReason: this.mapFinishReason(delta.finish_reason),
                            };
                        }
                    }
                    catch {
                        // Skip malformed JSON lines
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
        this.usage.totalRequests++;
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
        };
        headers['HTTP-Referer'] = config.CLIENT_URL || 'http://localhost:5173';
        headers['X-Title'] = "Nerdy's";
        return headers;
    }
    mapFinishReason(reason) {
        if (reason === 'stop')
            return 'stop';
        if (reason === 'length')
            return 'length';
        return 'error';
    }
}
//# sourceMappingURL=OpenRouterProvider.js.map