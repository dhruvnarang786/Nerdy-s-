import { z } from 'zod';
export const addFriendSchema = z.object({
    username: z.string().min(1).max(30),
});
//# sourceMappingURL=friends.schema.js.map