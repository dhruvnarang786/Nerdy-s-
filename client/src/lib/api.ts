
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

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

// Inter-app Backend API Helper
export const api = {
    get: async (endpoint: string) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });
        if (!res.ok) throw new Error(await res.text());
        return { data: await res.json() };
    },
    post: async (endpoint: string, body: any) => {
        const token = localStorage.getItem('token');
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

export async function fetchTrendingBooks(): Promise<Book[]> {
    try {
        const res = await fetch(`${BASE_URL}/api/books/trending`);
        if (!res.ok) throw new Error('Failed to fetch trending');
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function fetchBookDetails(id: string): Promise<Book | null> {
    try {
        const res = await fetch(`${BASE_URL}/api/books/${id}`);
        if (!res.ok) throw new Error('Failed to fetch book details');
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function searchBooks(query: string): Promise<Book[]> {
    if (!query) return [];

    try {
        const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=20`);
        const data = await response.json();

        if (!data.items) return [];

        return data.items.map((item: any) => formatBookData(item));
    } catch (error) {
        console.error("Error searching books:", error);
        return [];
    }
}

export async function getBookDetails(id: string): Promise<Book | null> {
    try {
        const response = await fetch(`${GOOGLE_BOOKS_API_URL}/${id}`);
        const data = await response.json();

        return formatBookData(data);
    } catch (error) {
        console.error("Error fetching book details:", error);
        return null;
    }
}

function formatBookData(item: any): Book {
    const volumeInfo = item.volumeInfo;
    return {
        id: item.id,
        title: volumeInfo.title || 'Unknown Title',
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
        description: volumeInfo.description || 'No description available.',
        coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || 'https://via.placeholder.com/128x192?text=No+Cover',
        rating: volumeInfo.averageRating || 0,
        publishedDate: volumeInfo.publishedDate || 'Unknown',
        pages: volumeInfo.pageCount || 0,
        genre: volumeInfo.categories || [],
    };
}
