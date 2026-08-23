import {
    normalizeOpenLibraryBook,
    normalizeOpenLibraryBookDetail,
    normalizeOpenLibraryTrendingWork,
} from '../utils/normalizeBook.js';

const SEARCH_URL = 'https://openlibrary.org/search.json';
const TRENDING_URL = 'https://openlibrary.org/trending';
const SUBJECT_URL = 'https://openlibrary.org/subjects';
const FETCH_TIMEOUT_MS = 10000;

export class OpenLibraryProvider {
    constructor() {
        this.name = 'openlibrary';
    }

    /**
     * Search Open Library catalog
     */
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

    /**
     * Fetch live trending books across millions of readers (weekly, daily, monthly, forever)
     */
    async getTrending(period = 'weekly', limit = 25) {
        try {
            const url = `${TRENDING_URL}/${period}.json?limit=${limit}`;
            const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

            if (!response.ok) {
                console.warn(`Open Library Trending API error ${response.status} for "${period}"`);
                return [];
            }

            const data = await response.json();
            const works = data.works || [];

            return works.map(normalizeOpenLibraryTrendingWork);
        } catch (err) {
            console.error(`Open Library trending error (${period}):`, err);
            return [];
        }
    }

    /**
     * Fetch top books in a specific subject / genre (Netflix category rows)
     */
    async getBySubject(subject, limit = 20) {
        try {
            const cleanSubject = String(subject).toLowerCase().replace(/\s+/g, '_');
            const url = `${SUBJECT_URL}/${encodeURIComponent(cleanSubject)}.json?limit=${limit}`;
            const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

            if (!response.ok) {
                console.warn(`Open Library Subject API error ${response.status} for "${subject}"`);
                return [];
            }

            const data = await response.json();
            const works = data.works || [];

            return works.map(normalizeOpenLibraryTrendingWork);
        } catch (err) {
            console.error(`Open Library subject error (${subject}):`, err);
            return [];
        }
    }

    /**
     * Fetch community ratings for an Open Library work
     */
    async getRatings(workId) {
        try {
            const cleanId = String(workId).replace('/works/', '').replace('/books/', '').trim();
            const url = `https://openlibrary.org/works/${cleanId}/ratings.json`;
            const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    }

    /**
     * Fetch detailed book information by Work or Edition ID
     */
    async getById(id) {
        try {
            const cleanId = String(id).replace('/works/', '').replace('/books/', '').trim();
            
            // Check whether it's an Edition (ends with M) or Work (ends with W)
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

            // Fetch ratings in parallel (non-blocking)
            let ratingsData = null;
            if (!isEdition || data.works?.[0]?.key) {
                const workKey = isEdition ? data.works[0].key : cleanId;
                ratingsData = await this.getRatings(workKey);
            }

            return await normalizeOpenLibraryBookDetail(data, ratingsData);
        } catch (err) {
            console.error('Open Library detail error:', err);
            return null;
        }
    }
}
