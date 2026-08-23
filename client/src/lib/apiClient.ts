// Book type definition
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

// API Response types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// Configuration constants
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds — generous for Render cold start
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 2000;
const BOOK_FETCH_TIMEOUT_MS = 60000;
const MAX_BOOK_RETRIES = 2;

function getToken(): string | null {
    return localStorage.getItem('nerdys_token');
}

export function setToken(token: string): void {
    localStorage.setItem('nerdys_token', token);
}

export function clearToken(): void {
    localStorage.removeItem('nerdys_token');
}

// Utility functions
function isRetryableError(err: unknown): boolean {
    if (err instanceof Error) {
        if (err.name === 'AbortError') return true;
        if (err.message === 'Failed to fetch') return true;
        if (err.message.includes('NetworkError')) return true;
    }
    return false;
}

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Fire-and-forget ping to wake the Render server as early as possible */
export function wakeUpServer(): void {
    fetch(`${BASE_URL}/ping`, { method: 'GET' }).catch(() => { /* silent */ });
}

/**
 * Generic fetch with retry logic
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {number} customTimeout - Custom timeout in ms
 * @param {number} maxRetries - Maximum retry attempts
 * @returns {Promise<Response>} The fetch response
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    customTimeout: number = REQUEST_TIMEOUT_MS,
    maxRetries: number = MAX_RETRIES
): Promise<Response> {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), customTimeout);

        try {
            const res = await fetch(url, {
                ...options,
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (res.ok) return res;
            
            // Retry on server errors
            if (res.status >= 500 && attempt < maxRetries - 1) {
                const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
                await wait(backoff);
                continue;
            }
            
            return res;
        } catch (err: unknown) {
            clearTimeout(timeoutId);
            lastError = err;

            if (isRetryableError(err) && attempt < maxRetries - 1) {
                const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
                await wait(backoff);
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}

/**
 * Authenticated API request with automatic token injection
 * @param {string} path - API path (e.g., '/api/auth/login')
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<T>} Parsed response data
 */
async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetchWithRetry(`${BASE_URL}${path}`, {
        ...options,
        headers,
    }, REQUEST_TIMEOUT_MS, MAX_RETRIES);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Request failed');
    }
    return res.json();
}

export async function searchBooks(query: string, startIndex = 0, maxResults = 20): Promise<{ books: Book[]; totalItems: number }> {
    if (!query) return { books: [], totalItems: 0 };
    const url = `${BASE_URL}/api/books/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}`;
    try {
        const res = await fetchWithRetry(url, {}, BOOK_FETCH_TIMEOUT_MS, MAX_BOOK_RETRIES);
        if (!res.ok) {
            return { books: [], totalItems: 0 };
        }
        const data = await res.json();
        return data;
    } catch {
        return { books: [], totalItems: 0 };
    }
}

export async function getBookDetails(id: string): Promise<Book | null> {
    try {
        const res = await fetchWithRetry(`${BASE_URL}/api/books/${id}`, {}, BOOK_FETCH_TIMEOUT_MS, MAX_BOOK_RETRIES);
        if (!res.ok) {
            return null;
        }
        return await res.json();
    } catch {
        return null;
    }
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
