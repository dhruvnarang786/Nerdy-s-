export interface CacheService {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlMs: number): Promise<void>;
    del(key: string): Promise<void>;
    delPattern(pattern: string): Promise<void>;
    exists(key: string): Promise<boolean>;
}
export declare class InMemoryCache implements CacheService {
    private store;
    private hitCount;
    private missCount;
    private maxSize;
    constructor(maxSize?: number);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttlMs: number): Promise<void>;
    del(key: string): Promise<void>;
    delPattern(pattern: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    getStats(): {
        size: number;
        hitCount: number;
        missCount: number;
        hitRate: number;
    };
    private evictExpired;
    private evictLRU;
}
export declare function createCacheService(): CacheService;
//# sourceMappingURL=cache.service.d.ts.map