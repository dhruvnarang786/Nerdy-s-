export interface NormalizedBook {
    title: string;
    authors: string[];
    description: string;
    coverImage: string;
    isbn: string | null;
    publishedYear: number | null;
    genres: string[];
    language: string;
    pageCount: number | null;
    source: 'openlibrary' | 'googlebooks';
    sourceId: string;
    averageRating: number;
    ratingsCount: number;
}
export interface Book {
    id: string;
    title: string;
    author: string;
    description: string;
    coverUrl: string;
    rating: number;
    publishedDate: string;
    pages: number;
    genre: string[];
}
export interface BookSearchResult {
    books: NormalizedBook[];
    totalItems: number;
}
export interface BookSearchParams {
    q: string;
    limit: number;
    offset: number;
}
//# sourceMappingURL=books.types.d.ts.map