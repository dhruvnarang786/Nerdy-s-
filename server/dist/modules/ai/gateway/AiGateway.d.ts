import type { ProviderManager } from './ProviderManager.js';
import type { ChatParams, ChatResult, ChatChunk, Intent, AiTelemetry } from '../types/ai.types.js';
export interface AiGatewayResult {
    content: string;
    finishReason: ChatResult['finishReason'];
    usage: ChatResult['usage'];
    provider: string;
    model: string;
    fallbackUsed: boolean;
    telemetry: AiTelemetry;
}
export declare class AiGateway {
    private providerManager;
    constructor(providerManager: ProviderManager);
    chat(intent: Intent, params: ChatParams, meta?: {
        requestId?: string;
        userId?: number;
    }): Promise<AiGatewayResult>;
    chatStream(intent: Intent, params: ChatParams, meta?: {
        requestId?: string;
        userId?: number;
    }): AsyncIterable<ChatChunk>;
    private executeWithRetry;
}
//# sourceMappingURL=AiGateway.d.ts.map