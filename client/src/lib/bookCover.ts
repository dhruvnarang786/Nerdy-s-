import { FALLBACK_COVER } from './constants';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Universal Book Cover URL Resolver
 * Resolves Google Books, Open Library (proxied to bypass ISP/CORS blocks), and fallback covers
 */
export function getBookCoverUrl(bookId?: string | null, coverUrl?: string | null): string {
  if (coverUrl && typeof coverUrl === 'string' && coverUrl.trim().length > 0) {
    let clean = coverUrl.trim();

    // If OpenLibrary or archive.org, route through backend proxy to bypass regional ISP blockades & CORS issues
    if (clean.includes('covers.openlibrary.org') || clean.includes('archive.org')) {
      // Use base64-in-path form to avoid adblockers that match blocked hostnames in the query string
      // Encode the URL as base64 and URL-encode it for safe path usage
      try {
        const b64 = btoa(unescape(encodeURIComponent(clean)));
        return `${BASE_URL}/api/books/cover/b64/${encodeURIComponent(b64)}`;
      } catch {
        return `${BASE_URL}/api/books/cover?url=${encodeURIComponent(clean)}`;
      }
    }

    // Upgrade http to https to prevent mixed-content blocking
    if (clean.startsWith('http://')) {
      clean = clean.replace('http://', 'https://');
    }
    return clean;
  }

  if (bookId && typeof bookId === 'string' && bookId.trim().length > 0) {
    const id = bookId.trim();

    // Open Library OLID — route through backend proxy
    if (id.startsWith('OL') || id.includes('/works/OL')) {
      const cleanOlid = id.replace('/works/', '').replace('/books/', '');
      const directUrl = `https://covers.openlibrary.org/b/olid/${cleanOlid}-M.jpg`;
      return `${BASE_URL}/api/books/cover?url=${encodeURIComponent(directUrl)}`;
    }

    // Google Books ID (alphanumeric string without spaces)
    if (!id.includes(' ') && id.length >= 4) {
      return `https://books.google.com/books/content?id=${encodeURIComponent(id)}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
    }
  }

  return FALLBACK_COVER;
}
