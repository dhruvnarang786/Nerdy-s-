const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const REQUEST_TIMEOUT_MS = 20000; // 20 seconds — accounts for Render cold start

function getToken(): string | null {
    return localStorage.getItem('nerdys_token');
}

export function setToken(token: string): void {
    localStorage.setItem('nerdys_token', token);
}

export function clearToken(): void {
    localStorage.removeItem('nerdys_token');
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
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Server is starting up, please try again in a moment.');
        }
        throw err;
    }
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
