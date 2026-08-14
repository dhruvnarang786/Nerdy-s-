import type { NormalizedBook } from '../../types/books.types.js';
export interface BookProvider {
    readonly name: string;
    search(query: string, limit: number, offset: number): Promise<NormalizedBook[]>;
    getById(id: string): Promise<NormalizedBook | null>;
}
export declare const SUFFICIENT_RESULTS = 5;
//# sourceMappingURL=BookProvider.interface.d.ts.map