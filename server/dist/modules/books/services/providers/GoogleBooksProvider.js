import { normalizeGoogleBook } from '../normalize.js';
import { config } from '../../../../infra/config/config.js';
import { logger } from '../../../../infra/logger/logger.js';
const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
const FETCH_TIMEOUT_MS = 8000;
export class GoogleBooksProvider {
    name = 'googlebooks';
    apiKey;
    constructor() {
        this.apiKey = config.GOOGLE_BOOKS_API_KEY || '';
    }
    async search(query, limit, offset) {
        try {
            const keyParam = this.apiKey ? `&key=${this.apiKey}` : '';
            const url = `${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&maxResults=${limit}&startIndex=${offset}&orderBy=relevance&langRestrict=en${keyParam}`;
            const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
            if (!response.ok) {
                logger.warn({ status: response.status, query }, 'GoogleBooks API error');
                return [];
            }
            const data = await response.json();
            const items = data.items || [];
            return items.map(item => normalizeGoogleBook(item));
        }
        catch (err) {
            logger.warn({ err, query }, 'GoogleBooks search error');
            return [];
        }
    }
    async getById(id) {
        try {
            const keyParam = this.apiKey ? `?key=${this.apiKey}` : '';
            const url = `${GOOGLE_BOOKS_URL}/${id}${keyParam}`;
            const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
            if (!response.ok) {
                logger.warn({ status: response.status, id }, 'GoogleBooks detail error');
                return null;
            }
            const data = await response.json();
            return normalizeGoogleBook(data);
        }
        catch (err) {
            logger.warn({ err, id }, 'GoogleBooks detail error');
            return null;
        }
    }
}
//# sourceMappingURL=GoogleBooksProvider.js.map