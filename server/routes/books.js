import express from 'express';
import { BookService } from '../services/BookService.js';
import { toApiFormat } from '../utils/normalizeBook.js';

const router = express.Router();
const bookService = new BookService();

const FALLBACK_COVER_URL = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300&auto=format&fit=crop';

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

// GET /api/books/cover/b64/:b64 — Image reverse proxy that accepts a base64-encoded URL in the path
router.get('/cover/b64/:b64', async (req, res) => {
    try {
        const b64 = String(req.params.b64 || '').trim();
        if (!b64) {
            return res.status(400).json({ error: 'Encoded cover URL is required' });
        }

        let decoded;
        try {
            // decodeURIComponent because client will URL-encode the base64
            const safe = decodeURIComponent(b64);
            // atob is not available in Node - use Buffer
            decoded = Buffer.from(safe, 'base64').toString('utf8');
        } catch (e) {
            return res.status(400).json({ error: 'Invalid encoded cover URL' });
        }

        let targetUrl;
        try {
            targetUrl = new URL(decoded);
        } catch {
            return res.status(400).json({ error: 'Invalid cover URL' });
        }

        // SSRF & Hostname whitelist check
        if (!isAllowedCoverHost(targetUrl.hostname)) {
            return res.status(403).json({ error: 'Unsupported or disallowed cover host' });
        }

        // Prevent SSRF targeting internal subnets or localhost
        if (targetUrl.hostname === 'localhost' || targetUrl.hostname === '127.0.0.1' || targetUrl.hostname.startsWith('192.168.') || targetUrl.hostname.startsWith('10.')) {
            return res.status(403).json({ error: 'Disallowed destination address' });
        }

        const response = await fetch(targetUrl.href, {
            headers: {
                'User-Agent': 'NerdyReads/1.0 (https://nerdys.app; book-cover-proxy)'
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            return res.redirect(302, FALLBACK_COVER_URL);
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';

        // Cache for 24 hours and allow CORS for canvas color extraction
        res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, immutable',
            'Access-Control-Allow-Origin': '*',
            'Cross-Origin-Resource-Policy': 'cross-origin',
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.send(buffer);
    } catch (err) {
        console.error('[Cover Proxy Error]:', err.message);
        res.redirect(302, FALLBACK_COVER_URL);
    }
});

// GET /api/books/cover?url=... — Image reverse proxy to bypass ISP blocks & CORS (legacy support)
router.get('/cover', async (req, res) => {
    try {
        const urlParam = String(req.query.url || '').trim();
        if (!urlParam) {
            return res.status(400).json({ error: 'Cover URL is required' });
        }

        let targetUrl;
        try {
            targetUrl = new URL(urlParam);
        } catch {
            return res.status(400).json({ error: 'Invalid cover URL' });
        }

        // SSRF & Hostname whitelist check
        if (!isAllowedCoverHost(targetUrl.hostname)) {
            return res.status(403).json({ error: 'Unsupported or disallowed cover host' });
        }

        // Prevent SSRF targeting internal subnets or localhost
        if (targetUrl.hostname === 'localhost' || targetUrl.hostname === '127.0.0.1' || targetUrl.hostname.startsWith('192.168.') || targetUrl.hostname.startsWith('10.')) {
            return res.status(403).json({ error: 'Disallowed destination address' });
        }

        const response = await fetch(targetUrl.href, {
            headers: {
                'User-Agent': 'NerdyReads/1.0 (https://nerdys.app; book-cover-proxy)'
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            return res.redirect(302, FALLBACK_COVER_URL);
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';

        // Cache for 24 hours and allow CORS for canvas color extraction
        res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400, immutable',
            'Access-Control-Allow-Origin': '*',
            'Cross-Origin-Resource-Policy': 'cross-origin',
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        res.send(buffer);
    } catch (err) {
        console.error('[Cover Proxy Error]:', err.message);
        res.redirect(302, FALLBACK_COVER_URL);
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
