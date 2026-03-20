
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

// Backend API helper (for auth, logs, favorites etc.)
export const api = {
    get: async (endpoint: string) => {
        const token = localStorage.getItem('nerdys_token') || localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    },
    post: async (endpoint: string, body: unknown) => {
        const token = localStorage.getItem('nerdys_token') || localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    }
};

// ─── Book API calls — all proxied through our backend ───────────────────────
// This avoids college/corporate networks that block googleapis.com directly.

export async function searchBooks(query: string): Promise<Book[]> {
    if (!query) return [];
    try {
        const res = await fetch(`${BASE_URL}/api/books/search?q=${encodeURIComponent(query)}&maxResults=20`);
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error('Error searching books:', error);
        return [];
    }
}

export async function fetchTrendingBooks(query = 'bestselling fiction', maxResults = 15): Promise<Book[]> {
    try {
        const res = await fetch(`${BASE_URL}/api/books/trending?query=${encodeURIComponent(query)}&maxResults=${maxResults}`);
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getBookDetails(id: string): Promise<Book | null> {
    try {
        const res = await fetch(`${BASE_URL}/api/books/${id}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error('Error fetching book details:', error);
        return null;
    }
}

// Alias for legacy calls
export const fetchBookDetails = getBookDetails;
