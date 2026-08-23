/**
 * Universal Book Cover Cache & Request Deduplication (Singleflight) Service
 * 
 * Provides:
 * 1. L1 Resolution Metadata Cache (stores resolved URLs, not binary buffers, for tiny memory footprint)
 * 2. In-Flight Singleflight Request Deduplication (concurrent requests for the same book share 1 promise)
 * 3. Negative Caching (dead/unresolvable covers cached with 24h TTL to stop upstream hammering)
 */

import crypto from 'crypto';

const RESOLVED_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const NEGATIVE_TTL_MS = 24 * 60 * 60 * 1000;      // 24 hours
const MAX_CACHE_ENTRIES = 10000;

class CoverCacheService {
    constructor() {
        // Map<string, { status: 'resolved' | 'not_found', coverUrl: string, etag: string, timestamp: number, ttl: number }>
        this.cache = new Map();
        // Map<string, Promise<any>> - In-flight deduplication map
        this.inFlight = new Map();
    }

    /**
     * Compute a canonical cache key from a book identifier or URL
     */
    getCacheKey(idOrUrl) {
        if (!idOrUrl) return '';
        const clean = String(idOrUrl).trim();
        // Clean OpenLibrary paths
        if (clean.includes('/works/')) return `ol:${clean.replace('/works/', '').replace('/books/', '')}`;
        if (clean.startsWith('OL')) return `ol:${clean}`;
        if (clean.startsWith('http://') || clean.startsWith('https://')) {
            return `url:${crypto.createHash('md5').update(clean).digest('hex')}`;
        }
        return `id:${clean}`;
    }

    /**
     * Generate a weak ETag based on key and URL
     */
    generateEtag(key, coverUrl) {
        return `W/"${crypto.createHash('md5').update(`${key}:${coverUrl}`).digest('hex').substring(0, 16)}"`;
    }

    /**
     * Retrieve cached resolution metadata
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }
        return entry;
    }

    /**
     * Store successful cover resolution metadata
     */
    setResolved(key, coverUrl, ttlMs = RESOLVED_TTL_MS) {
        this.pruneIfNeeded();
        const etag = this.generateEtag(key, coverUrl);
        const entry = {
            status: 'resolved',
            coverUrl,
            etag,
            timestamp: Date.now(),
            ttl: ttlMs,
        };
        this.cache.set(key, entry);
        return entry;
    }

    /**
     * Store negative cache entry (known missing/dead cover)
     */
    setNotFound(key, ttlMs = NEGATIVE_TTL_MS) {
        this.pruneIfNeeded();
        const etag = this.generateEtag(key, 'not_found');
        const entry = {
            status: 'not_found',
            coverUrl: null,
            etag,
            timestamp: Date.now(),
            ttl: ttlMs,
        };
        this.cache.set(key, entry);
        return entry;
    }

    /**
     * Evict oldest entries when cache capacity is reached
     */
    pruneIfNeeded() {
        if (this.cache.size >= MAX_CACHE_ENTRIES) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) this.cache.delete(firstKey);
        }
    }

    /**
     * Singleflight: Wrap resolution function so concurrent requests for the same key share 1 in-flight promise
     */
    async deduplicate(key, fetcher) {
        const cached = this.get(key);
        if (cached) return cached;

        if (this.inFlight.has(key)) {
            return this.inFlight.get(key);
        }

        const promise = (async () => {
            try {
                const result = await fetcher();
                if (result && result.coverUrl) {
                    return this.setResolved(key, result.coverUrl, result.ttlMs || RESOLVED_TTL_MS);
                }
                return this.setNotFound(key);
            } catch (err) {
                return this.setNotFound(key, 60 * 1000); // 1-minute retry on network exception
            } finally {
                this.inFlight.delete(key);
            }
        })();

        this.inFlight.set(key, promise);
        return promise;
    }
}

export const coverCacheService = new CoverCacheService();
