import { Router } from 'express';
import { searchBooksSchema, getBookSchema } from '../schemas/books.schema.js';
import { validate } from '../../../shared/middleware/validate.js';
import { asyncHandler } from '../../../shared/utils/async-handler.js';
import { NotFoundError } from '../../../shared/errors/NotFoundError.js';
export function createBooksRoutes(bookService) {
    const router = Router();
    const buildProxyCoverUrl = (req, coverUrl) => {
        if (!coverUrl)
            return '';
        const protoHeader = (req.get('x-forwarded-proto') ?? req.protocol ?? 'http');
        const protocol = (protoHeader.split(',')[0] || protoHeader).trim();
        const hostHeader = (req.get('x-forwarded-host') ?? req.get('host') ?? '');
        const host = hostHeader || 'localhost';
        return `${protocol}://${host}/api/books/cover?url=${encodeURIComponent(coverUrl)}`;
    };
    const proxyBookCover = (req, book) => ({
        ...book,
        coverUrl: book.coverUrl ? buildProxyCoverUrl(req, book.coverUrl) : '',
    });
    const searchHandler = asyncHandler(async (req, res) => {
        const query = req.query;
        const limit = query.limit ?? query.maxResults ?? 20;
        const offset = query.offset ?? query.startIndex ?? 0;
        const q = query.q;
        const result = await bookService.search(q, limit, offset);
        res.json({
            data: result.books.map(book => proxyBookCover(req, book)),
            meta: {
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
                pagination: {
                    page: Math.floor(offset / limit) + 1,
                    limit,
                    total: result.totalItems,
                    totalPages: Math.ceil(result.totalItems / limit),
                },
            },
        });
    });
    router.get('/', validate(searchBooksSchema, 'query'), searchHandler);
    router.get('/search', validate(searchBooksSchema, 'query'), searchHandler);
    router.get('/cover', asyncHandler(async (req, res) => {
        const urlParam = String(req.query.url || '');
        if (!urlParam) {
            return res.status(400).json({ error: 'Cover URL is required' });
        }
        let targetUrl;
        try {
            targetUrl = new URL(urlParam);
        }
        catch {
            return res.status(400).json({ error: 'Invalid cover URL' });
        }
        const allowedHosts = new Set(['covers.openlibrary.org', 'books.google.com']);
        if (!allowedHosts.has(targetUrl.hostname)) {
            return res.status(400).json({ error: 'Unsupported cover host' });
        }
        const response = await fetch(targetUrl.href, {
            signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) {
            return res.status(502).json({ error: 'Failed to fetch cover image' });
        }
        const contentType = response.headers.get('content-type') || 'application/octet-stream';
        // Allow cross-origin embedding of proxied images from the frontend
        // This overrides Helmet's default Cross-Origin-Resource-Policy (same-origin)
        res.set({
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
            'Cross-Origin-Resource-Policy': 'cross-origin',
        });
        // If response has a readable stream (Node fetch), pipe it directly for memory efficiency
        const bodyStream = response.body;
        if (bodyStream && typeof bodyStream.pipe === 'function') {
            bodyStream.pipe(res);
            return;
        }
        // Fallback: buffer the response
        const arrayBuffer = await response.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const buffer = Buffer.from(uint8);
        res.send(buffer);
    }));
    router.get('/:id', validate(getBookSchema, 'params'), asyncHandler(async (req, res) => {
        const { id } = req.params;
        const book = await bookService.getById(id);
        if (!book) {
            throw new NotFoundError(`Book not found: ${id}`);
        }
        res.json({
            data: proxyBookCover(req, book),
            meta: {
                requestId: req.requestId,
                timestamp: new Date().toISOString(),
            },
        });
    }));
    return router;
}
//# sourceMappingURL=index.js.map