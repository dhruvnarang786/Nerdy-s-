import { z } from 'zod';
export declare const chatSchema: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["system", "user", "assistant"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
        role: "user" | "system" | "assistant";
    }, {
        content: string;
        role: "user" | "system" | "assistant";
    }>, "many">;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    messages: {
        content: string;
        role: "user" | "system" | "assistant";
    }[];
    stream: boolean;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
}, {
    messages: {
        content: string;
        role: "user" | "system" | "assistant";
    }[];
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    stream?: boolean | undefined;
}>;
export type ChatInput = z.infer<typeof chatSchema>;
export declare const chatStreamSchema: z.ZodObject<{
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<["system", "user", "assistant"]>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
        role: "user" | "system" | "assistant";
    }, {
        content: string;
        role: "user" | "system" | "assistant";
    }>, "many">;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
} & {
    stream: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    messages: {
        content: string;
        role: "user" | "system" | "assistant";
    }[];
    stream: true;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
}, {
    messages: {
        content: string;
        role: "user" | "system" | "assistant";
    }[];
    stream: true;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
}>;
export type ChatStreamInput = z.infer<typeof chatStreamSchema>;
export declare const recommendSchema: z.ZodObject<{
    mood: z.ZodString;
    time: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    mood: string;
    time?: string | undefined;
}, {
    mood: string;
    time?: string | undefined;
}>;
export type RecommendInput = z.infer<typeof recommendSchema>;
export declare const bookGenSchema: z.ZodObject<{
    prompt: z.ZodString;
    style: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    prompt: string;
    style?: string | undefined;
}, {
    prompt: string;
    style?: string | undefined;
}>;
export type BookGenInput = z.infer<typeof bookGenSchema>;
export declare const quizSchema: z.ZodObject<{
    bookTitle: z.ZodString;
    count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    bookTitle: string;
    count: number;
    stream: boolean;
}, {
    bookTitle: string;
    count?: number | undefined;
    stream?: boolean | undefined;
}>;
export type QuizInput = z.infer<typeof quizSchema>;
export declare const summarySchema: z.ZodObject<{
    bookTitle: z.ZodString;
    spoilers: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    bookTitle: string;
    stream: boolean;
    spoilers: boolean;
}, {
    bookTitle: string;
    stream?: boolean | undefined;
    spoilers?: boolean | undefined;
}>;
export type SummaryInput = z.infer<typeof summarySchema>;
export declare const flashcardSchema: z.ZodObject<{
    bookTitle: z.ZodString;
    count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    bookTitle: string;
    count: number;
    stream: boolean;
}, {
    bookTitle: string;
    count?: number | undefined;
    stream?: boolean | undefined;
}>;
export type FlashcardInput = z.infer<typeof flashcardSchema>;
//# sourceMappingURL=ai.schema.d.ts.map