import { OpenLibraryProvider } from '../providers/OpenLibraryProvider.js';
import { GoogleBooksProvider } from '../providers/GoogleBooksProvider.js';
import { deduplicateBooks } from '../utils/deduplicateBooks.js';
import { prisma } from '../db.js';

const SUFFICIENT_RESULTS = 5;
const CACHE = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCached(key) {
    const entry = CACHE.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        CACHE.delete(key);
        return null;
    }
    return entry.data;
}

function setCache(key, data) {
    CACHE.set(key, { data, timestamp: Date.now() });
}

export class BookService {
    constructor() {
        this.openLibrary = new OpenLibraryProvider();
        this.googleBooks = new GoogleBooksProvider();
    }

    async search(query, maxResults = 20, startIndex = 0) {
        const cacheKey = `search:${query}:${maxResults}:${startIndex}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        // Open Library is the primary source - try it first
        const olBooks = await this.openLibrary.search(query, maxResults, startIndex);
        let merged = [...olBooks];

        // Only fall back to Google Books if Open Library returned insufficient results
        if (olBooks.length < SUFFICIENT_RESULTS) {
            try {
                const gbBooks = await this.googleBooks.search(query, maxResults, startIndex);
                if (gbBooks.length > 0) {
                    merged = deduplicateBooks([...olBooks, ...gbBooks]);
                }
            } catch (err) {
                console.warn('[BookService] Google Books search fallback error:', err.message);
            }
        }

        const totalItems = Math.max(olBooks.length, merged.length);
        const result = { books: merged, totalItems };
        setCache(cacheKey, result);
        return result;
    }

    async searchTrending(query = '', maxResults = 15, startIndex = 0) {
        const clean = String(query).toLowerCase().trim();
        if (!clean || clean.includes('trending') || clean.includes('popular') || clean.includes('bestsell')) {
            const cacheKey = `trending:weekly:${maxResults}:${startIndex}`;
            const cached = getCached(cacheKey);
            if (cached) return cached;

            const trending = await this.openLibrary.getTrending('weekly', maxResults + startIndex);
            const sliced = trending.slice(startIndex, startIndex + maxResults);
            const result = { books: sliced, totalItems: trending.length };
            setCache(cacheKey, result);
            return result;
        }

        return this.search(query, maxResults, startIndex);
    }

    async getById(id) {
        if (!id) return null;
        const cleanId = String(id).trim();
        const cacheKey = `book:${cleanId}`;
        const cached = getCached(cacheKey);
        if (cached) return cached;

        const isOlId = cleanId.startsWith('OL') || cleanId.startsWith('/works/') || cleanId.startsWith('/books/');

        // 1. If Open Library ID, query Open Library first
        if (isOlId) {
            const olBook = await this.openLibrary.getById(cleanId);
            if (olBook) {
                setCache(cacheKey, olBook);
                return olBook;
            }
        } else {
            // 2. Try Google Books for non-OL IDs
            try {
                const gbBook = await this.googleBooks.getById(cleanId);
                if (gbBook) {
                    setCache(cacheKey, gbBook);
                    return gbBook;
                }
            } catch (err) {
                console.warn(`[BookService] Google Books lookup failed for ${cleanId}:`, err.message);
            }

            // Also check Open Library in case ID is an ISBN / custom identifier
            const olBook = await this.openLibrary.getById(cleanId);
            if (olBook) {
                setCache(cacheKey, olBook);
                return olBook;
            }
        }

        // 3. Fallback: Check local Database (BookLogs & Favorites)
        try {
            const logEntry = await prisma.bookLog.findFirst({
                where: { bookId: cleanId },
                select: { bookId: true, bookTitle: true, author: true, coverUrl: true }
            });
            if (logEntry && logEntry.bookTitle) {
                const fallbackBook = {
                    id: logEntry.bookId,
                    title: logEntry.bookTitle,
                    author: logEntry.author || 'Unknown Author',
                    coverUrl: logEntry.coverUrl || '',
                    description: '',
                    rating: 0,
                    publishedDate: '',
                    pages: 0,
                    genre: [],
                };
                setCache(cacheKey, fallbackBook);
                return fallbackBook;
            }

            const favEntry = await prisma.favorite.findFirst({
                where: { bookId: cleanId },
                select: { bookId: true, bookTitle: true, author: true, coverUrl: true }
            });
            if (favEntry && favEntry.bookTitle) {
                const fallbackBook = {
                    id: favEntry.bookId,
                    title: favEntry.bookTitle,
                    author: favEntry.author || 'Unknown Author',
                    coverUrl: favEntry.coverUrl || '',
                    description: '',
                    rating: 0,
                    publishedDate: '',
                    pages: 0,
                    genre: [],
                };
                setCache(cacheKey, fallbackBook);
                return fallbackBook;
            }
        } catch (_) { /* non-blocking */ }

        return null;
    }
}
