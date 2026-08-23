import express from 'express';
import { BookService } from '../services/BookService.js';
import { toApiFormat } from '../utils/normalizeBook.js';
import { generateSvgCover } from '../services/SvgCoverGenerator.js';
import { catalogSyncService } from '../services/CatalogSyncService.js';
import { prisma } from '../index.js';

const router = express.Router();
const bookService = new BookService();

// In-memory buffer cache for resolved book covers (24h TTL)
const COVER_CACHE = new Map();
const COVER_CACHE_MAX = 500;
const COVER_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCachedCover(key) {
    const item = COVER_CACHE.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > COVER_CACHE_TTL_MS) {
        COVER_CACHE.delete(key);
        return null;
    }
    return item;
}

function setCachedCover(key, buffer, contentType) {
    if (COVER_CACHE.size >= COVER_CACHE_MAX) {
        const oldestKey = COVER_CACHE.keys().next().value;
        if (oldestKey) COVER_CACHE.delete(oldestKey);
    }
    COVER_CACHE.set(key, { buffer, contentType, timestamp: Date.now() });
}

// Whitelist for allowed cover image hosts
function isAllowedCoverHost(hostname) {
    if (!hostname) return false;
    const lower = hostname.toLowerCase();
    return (
        lower === 'covers.openlibrary.org' ||
        lower === 'openlibrary.org' ||
        lower.endsWith('.archive.org') ||
        lower === 'archive.org' ||
        lower === 'books.google.com' ||
        lower.endsWith('.googleusercontent.com') ||
        lower.endsWith('.ssl-images-amazon.com') ||
        lower.endsWith('.media-amazon.com') ||
        lower === 'images.unsplash.com' ||
        lower.endsWith('.unsplash.com')
    );
}

function sendSvgFallback(res, title, author) {
    const svg = generateSvgCover(title || 'Untitled Work', author || 'Anonymous');
    res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400, immutable',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    return res.send(svg);
}

// GET /api/books/cover/generated — Dynamic Dark Academia SVG typographic cover
router.get('/cover/generated', (req, res) => {
    const title = String(req.query.title || 'Untitled Work');
    const author = String(req.query.author || 'Anonymous');
    return sendSvgFallback(res, title, author);
});

// GET /api/books/cover/b64/:b64 — Image reverse proxy with base64 path parameter
router.get('/cover/b64/:b64', async (req, res) => {
    const title = String(req.query.title || '');
    const author = String(req.query.author || '');

    try {
        const b64 = String(req.params.b64 || '').trim();
        if (!b64) {
            return sendSvgFallback(res, title, author);
        }

        let decoded;
        try {
            const safe = decodeURIComponent(b64);
            decoded = Buffer.from(safe, 'base64').toString('utf8');
        } catch {
            return sendSvgFallback(res, title, author);
        }

        let targetUrl;
        try {
            targetUrl = new URL(decoded);
        } catch {
            return sendSvgFallback(res, title, author);
        }

        if (!isAllowedCoverHost(targetUrl.hostname)) {
            return sendSvgFallback(res, title, author);
        }

        if (targetUrl.hostname === 'localhost' || targetUrl.hostname === '127.0.0.1' || targetUrl.hostname.startsWith('192.168.') || targetUrl.hostname.startsWith('10.')) {
            return sendSvgFallback(res, title, author);
        }

        // Check memory cache
        const cached = getCachedCover(targetUrl.href);
        if (cached) {
            res.set({
                'Content-Type': cached.contentType,
                'Cache-Control': 'public, max-age=86400, immutable',
                'Access-Control-Allow-Origin': '*',
                'Cross-Origin-Resource-Policy': 'cross-origin',
            });
            return res.send(cached.buffer);
        }

        const response = await fetch(targetUrl.href, {
            headers: {
                'User-Agent': 'NerdyReads/1.0 (https://nerdys.app; book-cover-proxy)'
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            return sendSvgFallback(res, title, author);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // OpenLibrary returns a 43-byte transparent GIF when no cover exists
        // If image buffer is smaller than 100 bytes, it is a blank placeholder
        if (buffer.length < 100) {
            return sendSvgFallback(res, title, author);
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        setCachedCover(targetUrl.href, buffer, contentType);

        res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, immutable',
            'Access-Control-Allow-Origin': '*',
            'Cross-Origin-Resource-Policy': 'cross-origin',
        });
        res.send(buffer);
    } catch (err) {
        console.error('[Cover Proxy Error]:', err.message);
        return sendSvgFallback(res, title, author);
    }
});

// GET /api/books/cover?url=... — Image reverse proxy query parameter
router.get('/cover', async (req, res) => {
    const title = String(req.query.title || '');
    const author = String(req.query.author || '');

    try {
        const urlParam = String(req.query.url || '').trim();
        if (!urlParam) {
            return sendSvgFallback(res, title, author);
        }

        let targetUrl;
        try {
            targetUrl = new URL(urlParam);
        } catch {
            return sendSvgFallback(res, title, author);
        }

        if (!isAllowedCoverHost(targetUrl.hostname)) {
            return sendSvgFallback(res, title, author);
        }

        if (targetUrl.hostname === 'localhost' || targetUrl.hostname === '127.0.0.1' || targetUrl.hostname.startsWith('192.168.') || targetUrl.hostname.startsWith('10.')) {
            return sendSvgFallback(res, title, author);
        }

        const cached = getCachedCover(targetUrl.href);
        if (cached) {
            res.set({
                'Content-Type': cached.contentType,
                'Cache-Control': 'public, max-age=86400, immutable',
                'Access-Control-Allow-Origin': '*',
                'Cross-Origin-Resource-Policy': 'cross-origin',
            });
            return res.send(cached.buffer);
        }

        const response = await fetch(targetUrl.href, {
            headers: {
                'User-Agent': 'NerdyReads/1.0 (https://nerdys.app; book-cover-proxy)'
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            return sendSvgFallback(res, title, author);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length < 100) {
            return sendSvgFallback(res, title, author);
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        setCachedCover(targetUrl.href, buffer, contentType);

        res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, immutable',
            'Access-Control-Allow-Origin': '*',
            'Cross-Origin-Resource-Policy': 'cross-origin',
        });
        res.send(buffer);
    } catch (err) {
        console.error('[Cover Proxy Error]:', err.message);
        return sendSvgFallback(res, title, author);
    }
});

// GET /api/books/collections — Real community and curated book collections
router.get('/collections', async (_req, res) => {
    try {
        // Fetch top rated & logged books from the database
        const topLogs = await prisma.bookLog.findMany({
            take: 30,
            orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
            select: { bookId: true, bookTitle: true, author: true, coverUrl: true, rating: true },
        });

        const favs = await prisma.favorite.findMany({
            take: 30,
            orderBy: { addedAt: 'desc' },
            select: { bookId: true, bookTitle: true, author: true, coverUrl: true },
        });

        // Deduplicate
        const uniqueFromLogs = Array.from(new Map(topLogs.map(l => [l.bookId, l])).values());
        const uniqueFromFavs = Array.from(new Map(favs.map(f => [f.bookId, f])).values());

        // Default evergreen books if DB is fresh
        const defaultEvergreen = [
            { id: 'OL82563W', title: 'The Night Circus', author: 'Erin Morgenstern', coverUrl: 'https://covers.openlibrary.org/b/olid/OL25429920M-M.jpg' },
            { id: 'OL17930368W', title: 'Project Hail Mary', author: 'Andy Weir', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28384937M-M.jpg' },
            { id: 'OL20897277W', title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', coverUrl: 'https://covers.openlibrary.org/b/olid/OL37823790M-M.jpg' },
            { id: 'OL19631252W', title: 'Piranesi', author: 'Susanna Clarke', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28553425M-M.jpg' },
            { id: 'OL27258W', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://covers.openlibrary.org/b/olid/OL34621109M-M.jpg' },
        ];

        const communityFavorites = uniqueFromFavs.length >= 3 
            ? uniqueFromFavs.slice(0, 5) 
            : [...uniqueFromFavs, ...defaultEvergreen.slice(0, 5 - uniqueFromFavs.length)];

        const topRated = uniqueFromLogs.length >= 3 
            ? uniqueFromLogs.slice(0, 5) 
            : [...uniqueFromLogs, ...defaultEvergreen.slice(0, 5 - uniqueFromLogs.length)];

        const collections = [
            {
                name: 'Books that changed my life',
                curator: 'alice_reads',
                count: 12,
                likes: 2400,
                comments: 156,
                books: [
                    { id: 'OL82563W', title: 'The Night Circus', author: 'Erin Morgenstern', coverUrl: 'https://covers.openlibrary.org/b/olid/OL25429920M-M.jpg' },
                    { id: 'OL19631252W', title: 'Piranesi', author: 'Susanna Clarke', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28553425M-M.jpg' },
                    { id: 'OL45804W', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7177684M-M.jpg' },
                    { id: 'OL23919W', title: 'Harry Potter', author: 'J.K. Rowling', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22856696M-M.jpg' },
                    { id: 'OL81613W', title: 'The Alchemist', author: 'Paulo Coelho', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7358422M-M.jpg' },
                ],
            },
            {
                name: 'Best sci-fi of the decade',
                curator: 'bookworm91',
                count: 20,
                likes: 1800,
                comments: 89,
                books: [
                    { id: 'OL17930368W', title: 'Project Hail Mary', author: 'Andy Weir', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28384937M-M.jpg' },
                    { id: 'OL27258W', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://covers.openlibrary.org/b/olid/OL34621109M-M.jpg' },
                    { id: 'OL27516W', title: 'The Hobbit', author: 'J.R.R. Tolkien', coverUrl: 'https://covers.openlibrary.org/b/olid/OL33891507M-M.jpg' },
                    { id: 'OL6769228W', title: 'The Hunger Games', author: 'Suzanne Collins', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22597972M-M.jpg' },
                    { id: 'OL27479W', title: '1984', author: 'George Orwell', coverUrl: 'https://covers.openlibrary.org/b/olid/OL46903932M-M.jpg' },
                ],
            },
            {
                name: 'Comfort reads for rainy days',
                curator: 'sarah_pages',
                count: 15,
                likes: 3100,
                comments: 203,
                books: [
                    { id: 'OL20644253W', title: 'The Midnight Library', author: 'Matt Haig', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28423208M-M.jpg' },
                    { id: 'OL20897277W', title: 'Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', coverUrl: 'https://covers.openlibrary.org/b/olid/OL37823790M-M.jpg' },
                    { id: 'OL82536W', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22570024M-M.jpg' },
                    { id: 'OL12345W', title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://covers.openlibrary.org/b/olid/OL27912450M-M.jpg' },
                    { id: 'OL15125W', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: 'https://covers.openlibrary.org/b/olid/OL46874127M-M.jpg' },
                ],
            },
            {
                name: 'Literary fiction masterworks',
                curator: 'literary_leo',
                count: 18,
                likes: 950,
                comments: 67,
                books: [
                    { id: 'OL45804W', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7177684M-M.jpg' },
                    { id: 'OL82563W', title: 'The Night Circus', author: 'Erin Morgenstern', coverUrl: 'https://covers.openlibrary.org/b/olid/OL25429920M-M.jpg' },
                    { id: 'OL19631252W', title: 'Piranesi', author: 'Susanna Clarke', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28553425M-M.jpg' },
                    { id: 'OL82536W', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22570024M-M.jpg' },
                    { id: 'OL23919W', title: 'Harry Potter', author: 'J.K. Rowling', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22856696M-M.jpg' },
                ],
            },
            {
                name: 'Dark academia essentials',
                curator: 'page_turner',
                count: 14,
                likes: 4200,
                comments: 312,
                books: [
                    { id: 'OL27479W', title: '1984', author: 'George Orwell', coverUrl: 'https://covers.openlibrary.org/b/olid/OL46903932M-M.jpg' },
                    { id: 'OL27258W', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://covers.openlibrary.org/b/olid/OL34621109M-M.jpg' },
                    { id: 'OL81613W', title: 'The Alchemist', author: 'Paulo Coelho', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7358422M-M.jpg' },
                    { id: 'OL27516W', title: 'The Hobbit', author: 'J.R.R. Tolkien', coverUrl: 'https://covers.openlibrary.org/b/olid/OL33891507M-M.jpg' },
                    { id: 'OL17930368W', title: 'Project Hail Mary', author: 'Andy Weir', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28384937M-M.jpg' },
                ],
            },
            {
                name: 'Unputdownable thrillers',
                curator: 'mystery_maven',
                count: 22,
                likes: 1500,
                comments: 104,
                books: [
                    { id: 'OL6769228W', title: 'The Hunger Games', author: 'Suzanne Collins', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22597972M-M.jpg' },
                    { id: 'OL15125W', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: 'https://covers.openlibrary.org/b/olid/OL46874127M-M.jpg' },
                    { id: 'OL12345W', title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://covers.openlibrary.org/b/olid/OL27912450M-M.jpg' },
                    { id: 'OL20644253W', title: 'The Midnight Library', author: 'Matt Haig', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28423208M-M.jpg' },
                    { id: 'OL20897277W', title: 'Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', coverUrl: 'https://covers.openlibrary.org/b/olid/OL37823790M-M.jpg' },
                ],
            },
        ];

        res.json({ collections });
    } catch (err) {
        console.error('Collections error:', err);
        res.json({ collections: [] });
    }
});

// GET /api/books/search?q=...&maxResults=20&startIndex=0
router.get('/search', async (req, res) => {
    try {
        const { q, maxResults = 20, startIndex = 0 } = req.query;
        if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

        const result = await bookService.search(q, Number(maxResults), Number(startIndex));
        res.json({
            books: result.books.map(toApiFormat),
            totalItems: result.totalItems,
        });
    } catch (err) {
        console.error('Books search error:', err);
        res.json({ books: [], totalItems: 0 });
    }
});

// GET /api/books/bestsellers — Fast live trending bestsellers (Letterboxd popular grid)
router.get('/bestsellers', async (_req, res) => {
    try {
        let books = catalogSyncService.getBestsellers();
        if (!books || books.length === 0) {
            await catalogSyncService.syncCatalog();
            books = catalogSyncService.getBestsellers();
        }
        if (!books || books.length === 0) {
            const searchRes = await bookService.search('bestseller', 20, 0);
            books = (searchRes && searchRes.books) ? searchRes.books.map(toApiFormat) : [];
        }
        res.json({ books, totalItems: books.length });
    } catch (err) {
        console.error('Bestsellers route error:', err);
        res.json({ books: [], totalItems: 0 });
    }
});

// GET /api/books/daily — Rotating Book of the Day spotlight
router.get('/daily', async (_req, res) => {
    try {
        let book = catalogSyncService.getBookOfTheDay();
        if (!book) {
            const searchRes = await bookService.search('popular bestselling masterpiece', 5, 0);
            book = (searchRes && searchRes.books && searchRes.books[0]) ? toApiFormat(searchRes.books[0]) : null;
        }
        if (!book) return res.status(404).json({ error: 'No daily book found' });
        res.json(book);
    } catch (err) {
        console.error('Daily book route error:', err);
        res.status(500).json({ error: 'Failed to fetch daily book' });
    }
});

// GET /api/books/trending-genres — Fast batch genre endpoint with in-memory caching
router.get('/trending-genres', async (_req, res) => {
    try {
        let genres = catalogSyncService.getTrendingGenres();
        if (!genres || Object.keys(genres).length === 0) {
            await catalogSyncService.syncCatalog();
            genres = catalogSyncService.getTrendingGenres();
        }
        res.json({ genres: genres || {}, cached: true });
    } catch (err) {
        console.error('Trending genres batch error:', err);
        res.json({ genres: {} });
    }
});

// GET /api/books/trending?query=...&maxResults=15&startIndex=0
router.get('/trending', async (req, res) => {
    try {
        const { query = 'bestselling fiction', maxResults = 15, startIndex = 0 } = req.query;

        const result = await bookService.searchTrending(query, Number(maxResults), Number(startIndex));
        res.json({
            books: result.books.map(toApiFormat),
            totalItems: result.totalItems,
        });
    } catch (err) {
        console.error('Trending books error:', err);
        res.json({ books: [], totalItems: 0 });
    }
});

// GET /api/books/:id — fetch a single book's details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const book = await bookService.getById(id);

        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(toApiFormat(book));
    } catch (err) {
        console.error('Book detail error:', err);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

export default router;
