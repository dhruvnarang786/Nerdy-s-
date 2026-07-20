import type { AiGateway, AiGatewayResult } from '../gateway/AiGateway.js';
import type { ChatChunk } from '../types/ai.types.js';
export declare class AiChatService {
    private aiGateway;
    constructor(aiGateway: AiGateway);
    chat(messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>, meta?: {
        requestId?: string;
        userId?: number;
    }): Promise<AiGatewayResult>;
    chatStream(messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>, meta?: {
        requestId?: string;
        userId?: number;
    }): AsyncIterable<ChatChunk>;
    recommend(mood: string, time?: string, meta?: {
        requestId?: string;
        userId?: number;
    }): Promise<AiGatewayResult>;
    generateBook(prompt: string, style?: string, meta?: {
        requestId?: string;
        userId?: number;
    }): Promise<AiGatewayResult>;
    generateBookStream(prompt: string, style?: string, meta?: {
        requestId?: string;
        userId?: number;
    }): AsyncIterable<ChatChunk>;
    generateQuiz(bookTitle: string, count: number, meta?: {
        requestId?: string;
        userId?: number;
    }): Promise<AiGatewayResult>;
    generateQuizStream(bookTitle: string, count: number, meta?: {
        requestId?: string;
        userId?: number;
    }): AsyncIterable<ChatChunk>;
    summarize(bookTitle: string, spoilers: boolean, meta?: {
        requestId?: string;
        userId?: number;
    }): Promise<AiGatewayResult>;
    summarizeStream(bookTitle: string, spoilers: boolean, meta?: {
        requestId?: string;
        userId?: number;
    }): AsyncIterable<ChatChunk>;
    generateFlashcards(bookTitle: string, count: number, meta?: {
        requestId?: string;
        userId?: number;
    }): Promise<AiGatewayResult>;
    generateFlashcardsStream(bookTitle: string, count: number, meta?: {
        requestId?: string;
        userId?: number;
    }): AsyncIterable<ChatChunk>;
    private needsSystemPrompt;
}
//# sourceMappingURL=AiChatService.d.ts.map