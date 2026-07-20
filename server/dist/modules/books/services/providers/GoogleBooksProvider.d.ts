import type { NormalizedBook } from '../../types/books.types.js';
import type { BookProvider } from './BookProvider.interface.js';
export declare class GoogleBooksProvider implements BookProvider {
    readonly name = "googlebooks";
    private apiKey;
    constructor();
    search(query: string, limit: number, offset: number): Promise<NormalizedBook[]>;
    getById(id: string): Promise<NormalizedBook | null>;
}
//# sourceMappingURL=GoogleBooksProvider.d.ts.map