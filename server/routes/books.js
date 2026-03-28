import express from 'express';

const router = express.Router();

const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
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

        const url = `${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(q)}&maxResults=${maxResults}&orderBy=relevance&langRestrict=en${API_KEY ? `&key=${API_KEY}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`Google Books API error ${response.status} for query "${q}". Using fallback.`);
            const fallback = getFallbackBooks(q, maxResults);
            return res.json(fallback);
        }

        const data = await response.json();
        const books = (data.items || []).map(formatBook);

        if (books.length === 0) {
            return res.json(getFallbackBooks(q, maxResults));
        }

        setCache(cacheKey, books);
        res.json(books);
    } catch (err) {
        console.error('Books search error:', err);
        res.json(getFallbackBooks(req.query.q, req.query.maxResults || 20));
    }
});

// GET /api/books/trending/:genre?query=...
router.get('/trending', async (req, res) => {
    try {
        const { query = 'bestselling fiction', maxResults = 15 } = req.query;

        const cacheKey = `trending:${query}:${maxResults}`;
        const cached = getCached(cacheKey);
        if (cached) return res.json(cached);

        const url = `${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&orderBy=relevance&langRestrict=en${API_KEY ? `&key=${API_KEY}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.warn(`Google Books API trending error ${response.status}. Using fallback.`);
            return res.json(getFallbackBooks(query, maxResults));
        }

        const data = await response.json();
        const books = (data.items || []).map(formatBook);

        if (books.length === 0) {
            return res.json(getFallbackBooks(query, maxResults));
        }

        setCache(cacheKey, books);
        res.json(books);
    } catch (err) {
        console.error('Trending books error:', err);
        res.json(getFallbackBooks(req.query.query, req.query.maxResults || 15));
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
        coverUrl: v.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop',
        rating: v.averageRating || 0,
        publishedDate: v.publishedDate || 'Unknown',
        pages: v.pageCount || 0,
        genre: v.categories || [],
    };
}

// Fallback high-quality books in case API is down/rate-limited
function getFallbackBooks(query = '', maxResults = 20) {
    const fallbacks = [
        { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', description: 'A story of wealth, love, and the American Dream.', coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop', rating: 4.5, publishedDate: '1925', pages: 180, genre: ['Fiction', 'Classic'] },
        { id: '2', title: '1984', author: 'George Orwell', description: 'A dystopian masterpiece about surveillance and control.', coverUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=1000&auto=format&fit=crop', rating: 4.8, publishedDate: '1949', pages: 328, genre: ['Dystopian', 'Political Fiction'] },
        { id: '3', title: 'The Hobbit', author: 'J.R.R. Tolkien', description: 'Experience the journey that started it all.', coverUrl: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?q=80&w=1000&auto=format&fit=crop', rating: 4.9, publishedDate: '1937', pages: 310, genre: ['Fantasy', 'Adventure'] },
        { id: '4', title: 'Project Hail Mary', author: 'Andy Weir', description: 'A lone astronaut must save humanity.', coverUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1000&auto=format&fit=crop', rating: 4.7, publishedDate: '2021', pages: 476, genre: ['Sci-Fi', 'Thriller'] },
        { id: '5', title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', description: 'Spanning thirty years, from Cambridge, Massachusetts, to Venice Beach, California, and lands in between and far beyond.', coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000&auto=format&fit=crop', rating: 4.6, publishedDate: '2022', pages: 416, genre: ['Fiction', 'Contemporary'] },
        { id: '6', title: 'The Night Circus', author: 'Erin Morgenstern', description: 'A magical competition between two young illusionists.', coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1000&auto=format&fit=crop', rating: 4.5, publishedDate: '2011', pages: 387, genre: ['Fantasy', 'Magical Realism'] },
        { id: '7', title: 'Atomic Habits', author: 'James Clear', description: 'An easy and proven way to build good habits and break bad ones.', coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop', rating: 4.8, publishedDate: '2018', pages: 320, genre: ['Non-Fiction', 'Self-Help'] },
        { id: '8', title: 'Dune', author: 'Frank Herbert', description: 'The epic sci-fi saga of Paul Atreides.', coverUrl: 'https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=1000&auto=format&fit=crop', rating: 4.7, publishedDate: '1965', pages: 412, genre: ['Sci-Fi', 'Fantasy'] },
    ];

    // Simple filter logic to make fallbacks slightly more relevant
    const lowerQ = query.toLowerCase();
    let results = fallbacks.filter(b =>
        b.title.toLowerCase().includes(lowerQ) ||
        b.author.toLowerCase().includes(lowerQ) ||
        b.genre.some(g => g.toLowerCase().includes(lowerQ))
    );

    if (results.length === 0) results = fallbacks;
    return results.slice(0, maxResults);
}

export default router;
