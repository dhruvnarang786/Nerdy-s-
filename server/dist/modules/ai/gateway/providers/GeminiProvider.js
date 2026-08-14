import { AI_PROVIDER_TIMEOUT_MS, AI_STREAM_TIMEOUT_MS } from '../AiProvider.interface.js';
import { config } from '../../../../infra/config/config.js';
import { logger } from '../../../../infra/logger/logger.js';
export class GeminiProvider {
    name = 'gemini';
    apiKey;
    available = true;
    usage = {
        totalRequests: 0,
        failedRequests: 0,
        totalTokens: 0,
        lastErrorAt: null,
    };
    constructor() {
        this.apiKey = config.GEMINI_API_KEY || '';
        if (!this.apiKey) {
            this.available = false;
            logger.warn('Gemini API key not configured — provider marked unavailable');
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
        const model = 'gemini-2.0-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
        const systemInstruction = params.messages.filter(m => m.role === 'system');
        const contents = params.messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));
        const body = {
            contents,
            generationConfig: {
                temperature: params.temperature ?? 0.7,
                maxOutputTokens: params.maxTokens ?? 2048,
            },
        };
        if (systemInstruction.length > 0) {
            body.systemInstruction = {
                parts: [{ text: systemInstruction.map(m => m.content).join('\n') }],
            };
        }
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: params.signal ?? AbortSignal.timeout(AI_PROVIDER_TIMEOUT_MS),
        });
        if (!response.ok) {
            const errBody = await response.text().catch(() => '');
            this.usage.totalRequests++;
            this.usage.failedRequests++;
            this.usage.lastErrorAt = Date.now();
            throw new Error(`Gemini API error ${response.status}: ${errBody}`);
        }
        const data = await response.json();
        const candidate = data.candidates?.[0];
        this.usage.totalRequests++;
        if (data.usageMetadata) {
            this.usage.totalTokens += data.usageMetadata.totalTokenCount;
        }
        return {
            content: candidate?.content?.parts?.map(p => 'text' in p ? p.text : '').join('') || '',
            finishReason: this.mapFinishReason(candidate?.finishReason),
            usage: {
                promptTokens: data.usageMetadata?.promptTokenCount || 0,
                completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
                totalTokens: data.usageMetadata?.totalTokenCount || 0,
            },
            provider: this.name,
            model,
        };
    }
    async *chatStream(params) {
        const model = 'gemini-2.0-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${this.apiKey}`;
        const systemInstruction = params.messages.filter(m => m.role === 'system');
        const contents = params.messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));
        const body = {
            contents,
            generationConfig: {
                temperature: params.temperature ?? 0.7,
                maxOutputTokens: params.maxTokens ?? 2048,
            },
        };
        if (systemInstruction.length > 0) {
            body.systemInstruction = {
                parts: [{ text: systemInstruction.map(m => m.content).join('\n') }],
            };
        }
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: params.signal ?? AbortSignal.timeout(AI_STREAM_TIMEOUT_MS),
        });
        if (!response.ok) {
            const errBody = await response.text().catch(() => '');
            this.usage.totalRequests++;
            this.usage.failedRequests++;
            this.usage.lastErrorAt = Date.now();
            throw new Error(`Gemini stream error ${response.status}: ${errBody}`);
        }
        const reader = response.body?.getReader();
        if (!reader)
            throw new Error('Gemini stream response has no body');
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
                        const candidate = chunk.candidates?.[0];
                        const text = candidate?.content?.parts?.map(p => 'text' in p ? p.text : '').join('') || '';
                        if (text) {
                            yield {
                                token: text,
                                index: index++,
                                finishReason: null,
                            };
                        }
                        if (candidate?.finishReason) {
                            yield {
                                token: '',
                                index: index++,
                                finishReason: this.mapFinishReason(candidate.finishReason),
                            };
                        }
                    }
                    catch {
                        // Skip malformed JSON
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
        }
        this.usage.totalRequests++;
    }
    mapFinishReason(reason) {
        if (reason === 'STOP')
            return 'stop';
        if (reason === 'MAX_TOKENS')
            return 'length';
        return 'error';
    }
}
//# sourceMappingURL=GeminiProvider.js.map