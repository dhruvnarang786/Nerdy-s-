import { z } from 'zod';
export const createLogSchema = z.object({
    bookId: z.string().min(1),
    bookTitle: z.string().optional().nullable(),
    coverUrl: z.string().optional().nullable(),
    author: z.string().optional().nullable(),
    rating: z.number().int().min(1).max(5),
    dateRead: z.string().optional(),
    notes: z.string().optional().default(''),
    hasSpoilers: z.boolean().optional().default(false),
});
export const logIdSchema = z.object({
    id: z.coerce.number().int().positive(),
});
//# sourceMappingURL=logs.schema.js.map