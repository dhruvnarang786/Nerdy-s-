import { OpenLibraryProvider } from '../providers/OpenLibraryProvider.js';
import { toApiFormat } from '../utils/normalizeBook.js';

const openLibrary = new OpenLibraryProvider();

export const GENRE_CATEGORIES = [
    { genre: 'Fiction', subject: 'fiction' },
    { genre: 'Mystery & Thriller', subject: 'thriller' },
    { genre: 'Science Fiction', subject: 'science_fiction' },
    { genre: 'Fantasy', subject: 'fantasy' },
    { genre: 'Romance', subject: 'romance' },
    { genre: 'History', subject: 'historical_fiction' },
    { genre: 'Biography', subject: 'biography' },
    { genre: 'Self-Help', subject: 'self-help' },
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
     * Core ingestion pipeline that fetches live trending books from Open Library
     * (Letterboxd / Netflix discovery architecture)
     */
    async syncCatalog() {
        if (this.isSyncing) return;
        this.isSyncing = true;
        const startTime = Date.now();
        console.log('🔄 [CatalogSyncService] Ingesting live trending books from Open Library discovery stream...');

        try {
            // 1. Fetch live trending books across millions of readers (Weekly Popular)
            const weeklyTrending = await openLibrary.getTrending('weekly', 30);
            if (weeklyTrending && weeklyTrending.length > 0) {
                this.bestsellersCache = weeklyTrending.map(toApiFormat);
            }

            // 2. Fetch daily trending books for dynamic Book of the Day selection
            const dailyTrending = await openLibrary.getTrending('daily', 15);
            if (dailyTrending && dailyTrending.length > 0) {
                const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
                const pickIndex = dayOfYear % dailyTrending.length;
                this.dailyBookCache = toApiFormat(dailyTrending[pickIndex]);
            } else if (this.bestsellersCache.length > 0) {
                this.dailyBookCache = this.bestsellersCache[0];
            }

            // 3. Fetch 8 trending genre rows in parallel (Netflix category feeds)
            const updatedGenres = {};
            await Promise.all(GENRE_CATEGORIES.map(async ({ genre, subject }) => {
                try {
                    const books = await openLibrary.getBySubject(subject, 18);
                    if (books && books.length > 0) {
                        updatedGenres[genre] = books.map(toApiFormat);
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

