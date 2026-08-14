import type { BookProvider } from './providers/BookProvider.interface.js';
import type { CacheService } from '../../../infra/cache/cache.service.js';
import type { Book } from '../types/books.types.js';
export declare class BookService {
    private primaryProvider;
    private fallbackProvider;
    private cache;
    constructor(primaryProvider: BookProvider, fallbackProvider: BookProvider, cache: CacheService);
    search(query: string, limit: number, offset: number): Promise<{
        books: Book[];
        totalItems: number;
    }>;
    getById(id: string): Promise<Book | null>;
}
//# sourceMappingURL=BookService.d.ts.map