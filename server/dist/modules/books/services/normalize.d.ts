import type { NormalizedBook, Book } from '../types/books.types.js';
interface OpenLibraryDoc {
    title?: string;
    author_name?: string[];
    first_sentence?: string[];
    cover_i?: number;
    isbn?: string[];
    first_publish_year?: number;
    subject?: string[];
    language?: string[];
    number_of_pages_median?: number;
    key: string;
    ratings_average?: number;
    ratings_count?: number;
}
export declare function normalizeOpenLibraryBook(doc: OpenLibraryDoc): NormalizedBook;
interface OpenLibraryDetail {
    title?: string;
    authors?: Array<{
        author?: {
            key?: string;
        };
    }>;
    description?: string | {
        value?: string;
    };
    covers?: number[];
    isbn_13?: string[];
    isbn_10?: string[];
    first_publish_date?: string;
    subjects?: string[];
    key?: string;
}
export declare function normalizeOpenLibraryBookDetail(data: OpenLibraryDetail): Promise<NormalizedBook>;
interface GoogleVolumeInfo {
    title?: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
        thumbnail?: string;
    };
    industryIdentifiers?: Array<{
        type: string;
        identifier: string;
    }>;
    publishedDate?: string;
    categories?: string[];
    language?: string;
    pageCount?: number;
    averageRating?: number;
    ratingsCount?: number;
}
export declare function normalizeGoogleBook(item: {
    volumeInfo?: GoogleVolumeInfo;
    id: string;
}): NormalizedBook;
export declare function toApiFormat(book: NormalizedBook): Book;
export {};
//# sourceMappingURL=normalize.d.ts.map