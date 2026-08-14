import { z } from 'zod';
export declare const createLogSchema: z.ZodObject<{
    bookId: z.ZodString;
    bookTitle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    coverUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    author: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    rating: z.ZodNumber;
    dateRead: z.ZodOptional<z.ZodString>;
    notes: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    hasSpoilers: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    bookId: string;
    rating: number;
    notes: string;
    hasSpoilers: boolean;
    bookTitle?: string | null | undefined;
    coverUrl?: string | null | undefined;
    author?: string | null | undefined;
    dateRead?: string | undefined;
}, {
    bookId: string;
    rating: number;
    bookTitle?: string | null | undefined;
    coverUrl?: string | null | undefined;
    author?: string | null | undefined;
    dateRead?: string | undefined;
    notes?: string | undefined;
    hasSpoilers?: boolean | undefined;
}>;
export type CreateLogInput = z.infer<typeof createLogSchema>;
export declare const logIdSchema: z.ZodObject<{
    id: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: number;
}, {
    id: number;
}>;
//# sourceMappingURL=logs.schema.d.ts.map