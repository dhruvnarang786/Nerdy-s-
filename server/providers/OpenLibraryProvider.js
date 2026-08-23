import { normalizeOpenLibraryBook, normalizeOpenLibraryBookDetail } from '../utils/normalizeBook.js';

const SEARCH_URL = 'https://openlibrary.org/search.json';
const FETCH_TIMEOUT_MS = 10000;

export class OpenLibraryProvider {
    constructor() {
        this.name = 'openlibrary';
    }

    async search(query, maxResults = 20, startIndex = 0) {
        try {
            const url = `${SEARCH_URL}?q=${encodeURIComponent(query)}&limit=${maxResults}&offset=${startIndex}`;
            const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

            if (!response.ok) {
                console.warn(`Open Library API error ${response.status} for "${query}"`);
                return [];
            }

            const data = await response.json();
            const docs = data.docs || [];

            return docs.map(normalizeOpenLibraryBook);
        } catch (err) {
            console.error('Open Library search error:', err);
            return [];
        }
    }

    async getById(id) {
        try {
            const cleanId = String(id).replace('/works/', '').replace('/books/', '').trim();
            
            // Check whether it's an Edition (M) or Work (W) or other identifier
            const isEdition = cleanId.endsWith('M');
            const primaryUrl = isEdition 
                ? `https://openlibrary.org/books/${cleanId}.json`
                : `https://openlibrary.org/works/${cleanId}.json`;

            let response = await fetch(primaryUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

            // If not found, try alternate endpoint
            if (!response.ok) {
                const secondaryUrl = isEdition
                    ? `https://openlibrary.org/works/${cleanId}.json`
                    : `https://openlibrary.org/books/${cleanId}.json`;
                response = await fetch(secondaryUrl, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
            }

            if (!response.ok) return null;

            const data = await response.json();
            return await normalizeOpenLibraryBookDetail(data);
        } catch (err) {
            console.error('Open Library detail error:', err);
            return null;
        }
    }
}
