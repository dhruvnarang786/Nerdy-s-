import { BookService } from './BookService.js';
import { toApiFormat } from '../utils/normalizeBook.js';

const bookService = new BookService();

export const GENRE_CATEGORIES = [
    { genre: 'Fiction', query: 'subject:fiction' },
    { genre: 'Mystery & Thriller', query: 'subject:mystery' },
    { genre: 'Science Fiction', query: 'subject:science_fiction' },
    { genre: 'Fantasy', query: 'subject:fantasy' },
    { genre: 'Romance', query: 'subject:romance' },
    { genre: 'History', query: 'subject:history' },
    { genre: 'Biography', query: 'subject:biography' },
    { genre: 'Self-Help', query: 'subject:self-help' },
];

class CatalogSyncService {
    constructor() {
        this.genreCache = {};
        this.bestsellersCache = [];
        this.dailyBookCache = null;
        this.lastSync = 0;
        this.isSyncing = false;
        this.syncIntervalMs = 4 * 60 * 60 * 1000; // 4 hours
    }

    /**
     * Start background sync worker
     */
    start() {
        console.log('🚀 [CatalogSyncService] Initializing background catalog worker...');
        // Run initial sync asynchronously (fire-and-forget so server boots instantly)
        this.syncCatalog().catch(err => {
            console.error('⚠️ [CatalogSyncService] Initial sync error:', err.message);
        });

        // Set interval for periodic refresh
        setInterval(() => {
            this.syncCatalog().catch(err => {
                console.error('⚠️ [CatalogSyncService] Periodic sync error:', err.message);
            });
        }, this.syncIntervalMs);
    }

    /**
     * Core ingestion pipeline that fetches live trending books
     */
    async syncCatalog() {
        if (this.isSyncing) return;
        this.isSyncing = true;
        const startTime = Date.now();
        console.log('🔄 [CatalogSyncService] Ingesting latest trending books from catalog providers...');

        try {
            // 1. Fetch Bestsellers / Popular This Week (20 top titles)
            const popularRes = await bookService.search('bestseller', 20, 0);
            if (popularRes && popularRes.books && popularRes.books.length > 0) {
                this.bestsellersCache = popularRes.books.map(toApiFormat);
            }

            // 2. Compute Book of the Day
            if (this.bestsellersCache.length > 0) {
                const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
                const pickIndex = dayOfYear % this.bestsellersCache.length;
                this.dailyBookCache = this.bestsellersCache[pickIndex];
            }

            // 3. Fetch all 8 Trending Genres in parallel batches
            const updatedGenres = {};
            await Promise.all(GENRE_CATEGORIES.map(async ({ genre, query }) => {
                try {
                    const res = await bookService.search(query, 18, 0);
                    if (res && res.books && res.books.length > 0) {
                        updatedGenres[genre] = res.books.map(toApiFormat);
                    }
                } catch (err) {
                    console.error(`[CatalogSyncService] Failed to sync genre "${genre}":`, err.message);
                }
            }));

            if (Object.keys(updatedGenres).length > 0) {
                this.genreCache = { ...this.genreCache, ...updatedGenres };
            }

            this.lastSync = Date.now();
            console.log(`✅ [CatalogSyncService] Catalog sync complete in ${Date.now() - startTime}ms (${Object.keys(this.genreCache).length} genres, ${this.bestsellersCache.length} bestsellers)`);
        } catch (err) {
            console.error('❌ [CatalogSyncService] Catalog sync failure:', err.message);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Get pre-computed trending genre feeds (sub-1ms response)
     */
    getTrendingGenres() {
        return this.genreCache;
    }

    /**
     * Get pre-computed popular bestsellers (sub-1ms response)
     */
    getBestsellers() {
        return this.bestsellersCache;
    }

    /**
     * Get rotating Book of the Day
     */
    getBookOfTheDay() {
        return this.dailyBookCache || (this.bestsellersCache[0] || null);
    }
}

export const catalogSyncService = new CatalogSyncService();
