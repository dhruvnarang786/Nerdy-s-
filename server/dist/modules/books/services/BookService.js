import { SUFFICIENT_RESULTS } from './providers/BookProvider.interface.js';
import { deduplicateBooks } from './deduplicate.js';
import { toApiFormat } from './normalize.js';
const SEARCH_CACHE_TTL = 10 * 60 * 1000;
const DETAIL_CACHE_TTL = 60 * 60 * 1000;
export class BookService {
    primaryProvider;
    fallbackProvider;
    cache;
    constructor(primaryProvider, fallbackProvider, cache) {
        this.primaryProvider = primaryProvider;
        this.fallbackProvider = fallbackProvider;
        this.cache = cache;
    }
    async search(query, limit, offset) {
        const cacheKey = `books:search:${query}:${limit}:${offset}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const olBooks = await this.primaryProvider.search(query, limit, offset);
        let merged = [...olBooks];
        if (olBooks.length < SUFFICIENT_RESULTS) {
            const gbBooks = await this.fallbackProvider.search(query, limit, offset);
            if (gbBooks.length > 0) {
                merged = deduplicateBooks([...olBooks, ...gbBooks]);
            }
        }
        const totalItems = Math.max(olBooks.length, merged.length);
        const books = merged.map(toApiFormat);
        const result = { books, totalItems };
        await this.cache.set(cacheKey, result, SEARCH_CACHE_TTL);
        return result;
    }
    async getById(id) {
        const cacheKey = `books:detail:${id}`;
        const cached = await this.cache.get(cacheKey);
        if (cached)
            return cached;
        const olBook = await this.primaryProvider.getById(id);
        if (olBook) {
            const book = toApiFormat(olBook);
            await this.cache.set(cacheKey, book, DETAIL_CACHE_TTL);
            return book;
        }
        const gbBook = await this.fallbackProvider.getById(id);
        if (gbBook) {
            const book = toApiFormat(gbBook);
            await this.cache.set(cacheKey, book, DETAIL_CACHE_TTL);
            return book;
        }
        return null;
    }
}
//# sourceMappingURL=BookService.js.map