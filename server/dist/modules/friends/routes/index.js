import { Router } from 'express';
import { addFriendSchema } from '../schemas/friends.schema.js';
import { validate } from '../../../shared/middleware/validate.js';
import { requireAuth } from '../../../shared/middleware/require-auth.js';
import { asyncHandler } from '../../../shared/utils/async-handler.js';
export function createFriendsRoutes(friendsService) {
    const router = Router();
    router.get('/', requireAuth(), asyncHandler(async (req, res) => {
        const friends = await friendsService.getFriends(req.user.id);
        res.json({ data: { friends }, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    router.post('/add', requireAuth(), validate(addFriendSchema), asyncHandler(async (req, res) => {
        const result = await friendsService.addFriend(req.user.id, req.body.username, req.user.username);
        res.json({ data: result, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    return router;
}
//# sourceMappingURL=index.js.map