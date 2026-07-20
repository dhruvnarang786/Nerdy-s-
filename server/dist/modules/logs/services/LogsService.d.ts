import type { CreateLogInput } from '../schemas/logs.schema.js';
export declare class LogsService {
    getUserLogs(userId: number): Promise<{
        userId: number;
        id: number;
        createdAt: Date;
        bookId: string;
        bookTitle: string | null;
        coverUrl: string | null;
        author: string | null;
        rating: number;
        dateRead: string;
        notes: string;
        hasSpoilers: boolean;
    }[]>;
    getBookLogs(userId: number, bookId: string): Promise<{
        userId: number;
        id: number;
        createdAt: Date;
        bookId: string;
        bookTitle: string | null;
        coverUrl: string | null;
        author: string | null;
        rating: number;
        dateRead: string;
        notes: string;
        hasSpoilers: boolean;
    }[]>;
    getCommunityLogs(): Promise<({
        user: {
            username: string;
        };
    } & {
        userId: number;
        id: number;
        createdAt: Date;
        bookId: string;
        bookTitle: string | null;
        coverUrl: string | null;
        author: string | null;
        rating: number;
        dateRead: string;
        notes: string;
        hasSpoilers: boolean;
    })[]>;
    getBookCommunityLogs(bookId: string): Promise<({
        user: {
            username: string;
        };
    } & {
        userId: number;
        id: number;
        createdAt: Date;
        bookId: string;
        bookTitle: string | null;
        coverUrl: string | null;
        author: string | null;
        rating: number;
        dateRead: string;
        notes: string;
        hasSpoilers: boolean;
    })[]>;
    getUserProfileLogs(username: string): Promise<{
        user: {
            id: number;
            username: string;
            createdAt: Date;
        };
        logs: {
            userId: number;
            id: number;
            createdAt: Date;
            bookId: string;
            bookTitle: string | null;
            coverUrl: string | null;
            author: string | null;
            rating: number;
            dateRead: string;
            notes: string;
            hasSpoilers: boolean;
        }[];
    }>;
    createLog(userId: number, data: CreateLogInput): Promise<{
        userId: number;
        id: number;
        createdAt: Date;
        bookId: string;
        bookTitle: string | null;
        coverUrl: string | null;
        author: string | null;
        rating: number;
        dateRead: string;
        notes: string;
        hasSpoilers: boolean;
    }>;
    deleteLog(logId: number, userId: number): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=LogsService.d.ts.map