import { normalizeOpenLibraryBook, normalizeOpenLibraryBookDetail } from '../normalize.js';
import { logger } from '../../../../infra/logger/logger.js';
const SEARCH_URL = 'https://openlibrary.org/search.json';
const WORKS_URL = 'https://openlibrary.org/works';
const FETCH_TIMEOUT_MS = 10000;
export class OpenLibraryProvider {
    name = 'openlibrary';
    async search(query, limit, offset) {
        try {
            const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
            const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
            if (!response.ok) {
                logger.warn({ status: response.status, query }, 'OpenLibrary API error');
                return [];
            }
            const data = await response.json();
            const docs = data.docs || [];
            return docs.map(doc => normalizeOpenLibraryBook(doc));
        }
        catch (err) {
            logger.warn({ err, query }, 'OpenLibrary search error');
            return [];
        }
    }
    async getById(id) {
        try {
            const response = await fetch(`${WORKS_URL}/${id}.json`, {
                signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            });
            if (!response.ok)
                return null;
            const data = await response.json();
            return await normalizeOpenLibraryBookDetail(data);
        }
        catch (err) {
            logger.warn({ err, id }, 'OpenLibrary detail error');
            return null;
        }
    }
}
//# sourceMappingURL=OpenLibraryProvider.js.map