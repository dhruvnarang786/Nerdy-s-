import type { ChatParams, ChatResult, ChatChunk, ProviderHealth, ProviderUsage } from '../../types/ai.types.js';
import type { AiProvider } from '../AiProvider.interface.js';
export declare class GeminiProvider implements AiProvider {
    readonly name = "gemini";
    private apiKey;
    private available;
    private usage;
    constructor();
    isAvailable(): boolean;
    getHealth(): ProviderHealth;
    getUsage(): ProviderUsage;
    resetUsage(): void;
    chat(params: ChatParams): Promise<ChatResult>;
    chatStream(params: ChatParams): AsyncIterable<ChatChunk>;
    private mapFinishReason;
}
//# sourceMappingURL=GeminiProvider.d.ts.map