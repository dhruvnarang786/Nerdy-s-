import { Router } from 'express';
import { createFavoriteSchema } from '../schemas/favorites.schema.js';
import { validate } from '../../../shared/middleware/validate.js';
import { requireAuth } from '../../../shared/middleware/require-auth.js';
import { asyncHandler } from '../../../shared/utils/async-handler.js';
export function createFavoritesRoutes(favoritesService) {
    const router = Router();
    router.get('/', requireAuth(), asyncHandler(async (req, res) => {
        const favorites = await favoritesService.getUserFavorites(req.user.id);
        res.json({ data: { favorites }, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    router.get('/:bookId/check', requireAuth(), asyncHandler(async (req, res) => {
        const isFavorite = await favoritesService.isFavorite(req.user.id, req.params.bookId);
        res.json({ isFavorite });
    }));
    router.post('/', requireAuth(), validate(createFavoriteSchema), asyncHandler(async (req, res) => {
        const favorite = await favoritesService.addFavorite(req.user.id, req.body);
        res.status(201).json({ data: { favorite }, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    router.delete('/:bookId', requireAuth(), asyncHandler(async (req, res) => {
        await favoritesService.removeFavorite(req.user.id, req.params.bookId);
        res.json({ data: { success: true }, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    return router;
}
//# sourceMappingURL=index.js.map