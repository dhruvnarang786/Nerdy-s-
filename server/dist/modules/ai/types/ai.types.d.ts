export type Intent = 'chat' | 'recommend' | 'narration' | 'moderate' | 'book-gen' | 'quiz' | 'summary' | 'flashcard';
export type Role = 'system' | 'user' | 'assistant';
export interface ChatMessage {
    role: Role;
    content: string;
}
export interface ChatParams {
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    signal?: AbortSignal;
}
export interface ChatChunk {
    token: string;
    index: number;
    finishReason: 'stop' | 'length' | 'error' | null;
}
export interface ChatResult {
    content: string;
    finishReason: 'stop' | 'length' | 'error';
    usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    provider: string;
    model: string;
}
export interface ProviderHealth {
    healthy: boolean;
    lastChecked: number;
    latencyMs: number;
    error?: string;
}
export interface ProviderUsage {
    totalRequests: number;
    failedRequests: number;
    totalTokens: number;
    lastErrorAt: number | null;
}
export interface ProviderCircuitState {
    failures: number;
    lastFailureAt: number;
    open: boolean;
    openedAt: number | null;
}
export interface AiTelemetry {
    requestId: string;
    userId?: number;
    provider: string;
    model: string;
    intent: Intent;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    cached: boolean;
    fallbackUsed: boolean;
    error?: string;
}
export interface ModelDefinition {
    provider: string;
    model: string;
    maxTokens: number;
    supportsStreaming: boolean;
    costPer1KPromptTokens: number;
    costPer1KCompletionTokens: number;
}
export interface IntentModelConfig {
    primary: ModelDefinition;
    fallbacks: ModelDefinition[];
}
//# sourceMappingURL=ai.types.d.ts.map