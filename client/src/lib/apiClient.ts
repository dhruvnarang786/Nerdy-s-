const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds — generous for Render cold start
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 2000;

function getToken(): string | null {
    return localStorage.getItem('nerdys_token');
}

export function setToken(token: string): void {
    localStorage.setItem('nerdys_token', token);
}

export function clearToken(): void {
    localStorage.removeItem('nerdys_token');
}

function isRetryableError(err: unknown): boolean {
    if (err instanceof Error) {
        if (err.name === 'AbortError') return true;          // timeout
        if (err.message === 'Failed to fetch') return true;  // network error
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

    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const res = await fetch(`${BASE_URL}${path}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: res.statusText }));
                throw new Error(err.error || 'Request failed');
            }
            return res.json();
        } catch (err: unknown) {
            clearTimeout(timeoutId);
            lastError = err;

            // Only retry on timeout / network errors, not HTTP errors
            if (isRetryableError(err) && attempt < MAX_RETRIES - 1) {
                const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
                await wait(backoff);
                continue;
            }

            if (err instanceof Error && err.name === 'AbortError') {
                throw new Error('Server is starting up, please try again in a moment.');
            }
            throw err;
        }
    }

    throw lastError;
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
