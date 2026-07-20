import { z } from 'zod';
const chatMessageSchema = z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().min(1),
});
export const chatSchema = z.object({
    messages: z.array(chatMessageSchema).min(1),
    temperature: z.number().min(0).max(2).optional(),
    maxTokens: z.number().int().min(1).max(8192).optional(),
    stream: z.boolean().optional().default(false),
});
export const chatStreamSchema = chatSchema.extend({
    stream: z.literal(true),
});
export const recommendSchema = z.object({
    mood: z.string().min(1),
    time: z.string().optional(),
});
export const bookGenSchema = z.object({
    prompt: z.string().min(10, 'Book idea must be at least 10 characters'),
    style: z.string().optional(),
});
export const quizSchema = z.object({
    bookTitle: z.string().min(1),
    count: z.coerce.number().int().min(3).max(20).optional().default(5),
    stream: z.boolean().optional().default(false),
});
export const summarySchema = z.object({
    bookTitle: z.string().min(1),
    spoilers: z.boolean().optional().default(false),
    stream: z.boolean().optional().default(false),
});
export const flashcardSchema = z.object({
    bookTitle: z.string().min(1),
    count: z.coerce.number().int().min(3).max(30).optional().default(10),
    stream: z.boolean().optional().default(false),
});
//# sourceMappingURL=ai.schema.js.map