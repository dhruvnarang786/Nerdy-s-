import { getPrismaClient } from '../../../infra/database/prisma.client.js';
import { eventBus } from '../../../shared/events/event-bus.js';
export class FavoritesService {
    async getUserFavorites(userId) {
        const favorites = await getPrismaClient().favorite.findMany({
            where: { userId },
            orderBy: { addedAt: 'desc' },
        });
        return favorites;
    }
    async isFavorite(userId, bookId) {
        const count = await getPrismaClient().favorite.count({
            where: { userId, bookId },
        });
        return count > 0;
    }
    async addFavorite(userId, data) {
        const favorite = await getPrismaClient().favorite.upsert({
            where: { userId_bookId: { userId, bookId: data.bookId } },
            update: {},
            create: {
                bookId: data.bookId,
                bookTitle: data.bookTitle ?? null,
                coverUrl: data.coverUrl ?? null,
                author: data.author ?? null,
                userId,
            },
        });
        try {
            eventBus.emit('favorite.added', { userId, favorite });
        }
        catch { }
        return favorite;
    }
    async removeFavorite(userId, bookId) {
        await getPrismaClient().favorite.deleteMany({
            where: { userId, bookId },
        });
        try {
            eventBus.emit('favorite.removed', { userId, favorite: { bookId } });
        }
        catch { }
    }
}
//# sourceMappingURL=FavoritesService.js.map