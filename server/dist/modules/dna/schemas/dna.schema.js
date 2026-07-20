import { z } from 'zod';
export const dnaQuerySchema = z.object({
    fields: z.string().optional(),
});
export const dnaQueryParamsSchema = z.object({
    username: z.string(),
});
//# sourceMappingURL=dna.schema.js.map