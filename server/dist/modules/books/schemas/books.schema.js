import { z } from 'zod';
export const searchBooksSchema = z.object({
    q: z.string().min(1, 'Search query is required'),
    limit: z.coerce.number().int().min(1).max(40).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    maxResults: z.coerce.number().int().min(1).max(40).optional(),
    startIndex: z.coerce.number().int().min(0).optional(),
});
export const getBookSchema = z.object({
    id: z.string().min(1),
});
//# sourceMappingURL=books.schema.js.map