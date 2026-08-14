import { z } from 'zod';
export const createFavoriteSchema = z.object({
    bookId: z.string().min(1),
    bookTitle: z.string().optional().nullable(),
    coverUrl: z.string().optional().nullable(),
    author: z.string().optional().nullable(),
});
export const bookIdSchema = z.object({
    bookId: z.string().min(1),
});
//# sourceMappingURL=favorites.schema.js.map