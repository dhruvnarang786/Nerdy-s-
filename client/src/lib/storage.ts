import { api } from '@/lib/apiClient';
import type { Book } from './api';

export interface BookLog {
    id?: number;
    bookId: string;
    bookTitle?: string;
    coverUrl?: string;
    author?: string;
    rating: number;
    dateRead: string;
    notes: string;
    hasSpoilers?: boolean;
    createdAt: string;
    username?: string;
    // used in community feed response
    user?: { username: string };
}

// ── Book Logs ────────────────────────────────────────────────────
export async function saveBookLog(log: Omit<BookLog, 'id' | 'createdAt'>): Promise<boolean> {
    try {
        await api.post('/api/logs', log);
        return true;
    } catch (err) {
        console.error('saveBookLog error:', err);
        return false;
    }
}

export async function getUserLogs(_username: string): Promise<BookLog[]> {
    // For the current user — auth token is auto-sent
    try {
        const data = await api.get<{ logs: BookLog[] }>('/api/logs');
        return data.logs;
    } catch { return []; }
}

export async function getAllLogs(): Promise<BookLog[]> {
    try {
        const data = await api.get<{ logs: BookLog[] }>('/api/logs/community');
        return data.logs;
    } catch { return []; }
}

export async function getBookLogs(bookId: string): Promise<BookLog[]> {
    try {
        const data = await api.get<{ logs: BookLog[] }>('/api/logs');
        return data.logs.filter(l => l.bookId === bookId);
    } catch { return []; }
}

export async function getBookCommunityLogs(bookId: string): Promise<BookLog[]> {
    try {
        const data = await api.get<{ logs: BookLog[] }>(`/api/logs/book/${bookId}/community`);
        return data.logs;
    } catch { return []; }
}

// ── Favorites ──────────────────────────────────────────────────
export async function getFavorites(): Promise<Book[]> {
    try {
        const data = await api.get<{ favorites: Array<{ bookId: string; bookTitle?: string; coverUrl?: string; author?: string }> }>('/api/favorites');
        return data.favorites.map(f => ({
            id: f.bookId,
            title: f.bookTitle || '',
            author: f.author || '',
            coverUrl: f.coverUrl || '',
            description: '',
            publishedDate: '',
            rating: 0,
            pages: 0,
            genre: [],
        }));
    } catch { return []; }
}

export async function isFavorite(bookId: string): Promise<boolean> {
    try {
        const books = await getFavorites();
        return books.some(b => b.id === bookId);
    } catch { return false; }
}

export async function toggleFavorite(book: Book): Promise<boolean> {
    try {
        if (await isFavorite(book.id)) {
            await api.delete(`/api/favorites/${book.id}`);
            return false; // removed
        } else {
            await api.post('/api/favorites', {
                bookId: book.id,
                bookTitle: book.title,
                coverUrl: book.coverUrl,
                author: book.author,
            });
            return true; // added
        }
    } catch (err) {
        console.error('toggleFavorite error:', err);
        return false;
    }
}
