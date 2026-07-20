import { logger } from '../logger/logger.js';
export class InMemoryCache {
    store = new Map();
    hitCount = 0;
    missCount = 0;
    maxSize;
    constructor(maxSize = 500) {
        this.maxSize = maxSize;
        setInterval(() => this.evictExpired(), 60000).unref();
    }
    async get(key) {
        const entry = this.store.get(key);
        if (!entry) {
            this.missCount++;
            return null;
        }
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            this.missCount++;
            return null;
        }
        this.hitCount++;
        return entry.data;
    }
    async set(key, value, ttlMs) {
        if (this.store.size >= this.maxSize) {
            this.evictLRU();
        }
        this.store.set(key, {
            data: value,
            expiresAt: Date.now() + ttlMs,
        });
    }
    async del(key) {
        this.store.delete(key);
    }
    async delPattern(pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        for (const key of this.store.keys()) {
            if (regex.test(key)) {
                this.store.delete(key);
            }
        }
    }
    async exists(key) {
        const entry = this.store.get(key);
        if (!entry)
            return false;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return false;
        }
        return true;
    }
    getStats() {
        const total = this.hitCount + this.missCount;
        return {
            size: this.store.size,
            hitCount: this.hitCount,
            missCount: this.missCount,
            hitRate: total > 0 ? this.hitCount / total : 0,
        };
    }
    evictExpired() {
        const now = Date.now();
        for (const [key, entry] of this.store) {
            if (now > entry.expiresAt) {
                this.store.delete(key);
            }
        }
    }
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, entry] of this.store) {
            if (entry.expiresAt < oldestTime) {
                oldestTime = entry.expiresAt;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.store.delete(oldestKey);
        }
    }
}
export function createCacheService() {
    const cache = new InMemoryCache();
    logger.info('In-memory cache initialized (max 500 items)');
    return cache;
}
//# sourceMappingURL=cache.service.js.map