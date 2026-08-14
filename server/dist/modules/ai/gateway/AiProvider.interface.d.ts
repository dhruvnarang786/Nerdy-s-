import type { ChatParams, ChatResult, ChatChunk, ProviderHealth, ProviderUsage } from '../types/ai.types.js';
export interface AiProvider {
    readonly name: string;
    chat(params: ChatParams): Promise<ChatResult>;
    chatStream(params: ChatParams): AsyncIterable<ChatChunk>;
    isAvailable(): boolean;
    getHealth(): ProviderHealth;
    getUsage(): ProviderUsage;
    resetUsage(): void;
}
export declare const AI_PROVIDER_TIMEOUT_MS = 15000;
export declare const AI_STREAM_TIMEOUT_MS = 30000;
export declare const MAX_RETRIES = 2;
export declare const BASE_RETRY_DELAY_MS = 1000;
//# sourceMappingURL=AiProvider.interface.d.ts.map