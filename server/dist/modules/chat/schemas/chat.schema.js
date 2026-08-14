import { z } from 'zod';
export const roomSlugSchema = z.object({
    slug: z.string().min(1),
});
//# sourceMappingURL=chat.schema.js.map