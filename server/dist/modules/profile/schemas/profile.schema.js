import { z } from 'zod';
export const updateProfileSchema = z.object({
    bio: z.string().max(500).optional().default(''),
});
//# sourceMappingURL=profile.schema.js.map