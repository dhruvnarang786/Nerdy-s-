import { Router } from 'express';
import { updateProfileSchema } from '../schemas/profile.schema.js';
import { validate } from '../../../shared/middleware/validate.js';
import { requireAuth } from '../../../shared/middleware/require-auth.js';
import { asyncHandler } from '../../../shared/utils/async-handler.js';
export function createProfileRoutes(profileService) {
    const router = Router();
    router.put('/', requireAuth(), validate(updateProfileSchema), asyncHandler(async (req, res) => {
        const result = await profileService.updateBio(req.user.id, req.body.bio);
        res.json({ data: result, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    return router;
}
//# sourceMappingURL=index.js.map