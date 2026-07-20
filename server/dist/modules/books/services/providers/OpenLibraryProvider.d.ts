import type { NormalizedBook } from '../../types/books.types.js';
import type { BookProvider } from './BookProvider.interface.js';
export declare class OpenLibraryProvider implements BookProvider {
    readonly name = "openlibrary";
    search(query: string, limit: number, offset: number): Promise<NormalizedBook[]>;
    getById(id: string): Promise<NormalizedBook | null>;
}
//# sourceMappingURL=OpenLibraryProvider.d.ts.map