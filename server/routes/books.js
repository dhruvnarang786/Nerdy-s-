import express from 'express';

const router = express.Router();

const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
const CACHE = new Map(); // Simple in-memory cache
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

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

// GET /api/books/search?q=...&maxResults=20
router.get('/search', async (req, res) => {
    try {
        const { q, maxResults = 20 } = req.query;
        if (!q) return res.status(400).json({ error: 'Query parameter q is required' });

        const cacheKey = `search:${q}:${maxResults}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        const url = `${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(q)}&maxResults=${maxResults}&orderBy=relevance&langRestrict=en`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Google Books API error: ${response.status}`);

        const data = await response.json();
        const books = (data.items || []).map(formatBook);
        setCache(cacheKey, books);
        res.json(books);
    } catch (err) {
        console.error('Books search error:', err);
        res.status(500).json({ error: 'Failed to fetch books', books: [] });
    }
});

// GET /api/books/trending/:genre?query=...
router.get('/trending', async (req, res) => {
    try {
        const { query = 'bestselling fiction', maxResults = 15 } = req.query;

        const cacheKey = `trending:${query}:${maxResults}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        const url = `${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance&langRestrict=en`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Google Books API error: ${response.status}`);

        const data = await response.json();
        const books = (data.items || []).map(formatBook);
        setCache(cacheKey, books);
        res.json(books);
    } catch (err) {
        console.error('Trending books error:', err);
        res.status(500).json({ error: 'Failed to fetch trending books', books: [] });
    }
});

// GET /api/books/:id — fetch a single book's details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = `book:${id}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        const url = `${GOOGLE_BOOKS_URL}/${id}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Google Books API error: ${response.status}`);

        const data = await response.json();
        const book = formatBook(data);
        setCache(cacheKey, book);
        res.json(book);
    } catch (err) {
        console.error('Book detail error:', err);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

function formatBook(item) {
    const v = item.volumeInfo || {};
    return {
        id: item.id,
        title: v.title || 'Unknown Title',
        author: v.authors ? v.authors.join(', ') : 'Unknown Author',
        description: v.description || 'No description available.',
        coverUrl: v.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        rating: v.averageRating || 0,
        publishedDate: v.publishedDate || 'Unknown',
        pages: v.pageCount || 0,
        genre: v.categories || [],
    };
}

export default router;
