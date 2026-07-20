import type { CreateFavoriteInput } from '../schemas/favorites.schema.js';
export declare class FavoritesService {
    getUserFavorites(userId: number): Promise<{
        userId: number;
        id: number;
        bookId: string;
        bookTitle: string | null;
        coverUrl: string | null;
        author: string | null;
        addedAt: Date;
    }[]>;
    isFavorite(userId: number, bookId: string): Promise<boolean>;
    addFavorite(userId: number, data: CreateFavoriteInput): Promise<{
        userId: number;
        id: number;
        bookId: string;
        bookTitle: string | null;
        coverUrl: string | null;
        author: string | null;
        addedAt: Date;
    }>;
    removeFavorite(userId: number, bookId: string): Promise<void>;
}
//# sourceMappingURL=FavoritesService.d.ts.map