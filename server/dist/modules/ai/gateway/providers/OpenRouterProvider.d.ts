import type { AiProvider } from '../AiProvider.interface.js';
import type { ChatParams, ChatResult, ChatChunk, ProviderHealth, ProviderUsage } from '../../types/ai.types.js';
export declare class OpenRouterProvider implements AiProvider {
    readonly name = "openrouter";
    private apiKey;
    private baseUrl;
    private available;
    private usage;
    constructor();
    isAvailable(): boolean;
    getHealth(): ProviderHealth;
    getUsage(): ProviderUsage;
    resetUsage(): void;
    chat(params: ChatParams): Promise<ChatResult>;
    chatStream(params: ChatParams): AsyncIterable<ChatChunk>;
    private getHeaders;
    private mapFinishReason;
}
//# sourceMappingURL=OpenRouterProvider.d.ts.map