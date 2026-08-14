import { z } from 'zod';
export declare const searchBooksSchema: z.ZodObject<{
    q: z.ZodString;
    limit: z.ZodOptional<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
    maxResults: z.ZodOptional<z.ZodNumber>;
    startIndex: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    q: string;
    limit?: number | undefined;
    offset?: number | undefined;
    maxResults?: number | undefined;
    startIndex?: number | undefined;
}, {
    q: string;
    limit?: number | undefined;
    offset?: number | undefined;
    maxResults?: number | undefined;
    startIndex?: number | undefined;
}>;
export type SearchBooksInput = z.infer<typeof searchBooksSchema>;
export declare const getBookSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type GetBookInput = z.infer<typeof getBookSchema>;
//# sourceMappingURL=books.schema.d.ts.map