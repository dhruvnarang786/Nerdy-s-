import { z } from 'zod';
export declare const createFavoriteSchema: z.ZodObject<{
    bookId: z.ZodString;
    bookTitle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    coverUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    author: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    bookId: string;
    bookTitle?: string | null | undefined;
    coverUrl?: string | null | undefined;
    author?: string | null | undefined;
}, {
    bookId: string;
    bookTitle?: string | null | undefined;
    coverUrl?: string | null | undefined;
    author?: string | null | undefined;
}>;
export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>;
export declare const bookIdSchema: z.ZodObject<{
    bookId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    bookId: string;
}, {
    bookId: string;
}>;
//# sourceMappingURL=favorites.schema.d.ts.map