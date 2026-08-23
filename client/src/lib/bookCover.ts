const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Procedurally generated Dark Academia SVG cover URL
 */
export function getGeneratedCoverUrl(title?: string | null, author?: string | null): string {
  const safeTitle = encodeURIComponent(title || 'Untitled Work');
  const safeAuthor = encodeURIComponent(author || 'Anonymous');
  return `${BASE_URL}/api/books/cover/generated?title=${safeTitle}&author=${safeAuthor}`;
}

/**
 * Universal Book Cover URL Resolver
 * Resolves Google Books, Open Library (proxied to bypass ISP/CORS blocks and 1x1 blanks),
 * and generates high-aesthetic Dark Academia SVG typographic covers when artwork is absent.
 */
export function getBookCoverUrl(
  bookId?: string | null,
  coverUrl?: string | null,
  title?: string | null,
  author?: string | null
): string {
  const metaParams = `title=${encodeURIComponent(title || '')}&author=${encodeURIComponent(author || '')}`;

  if (coverUrl && typeof coverUrl === 'string' && coverUrl.trim().length > 0) {
    let clean = coverUrl.trim();

    // If OpenLibrary or archive.org, route through backend proxy to bypass regional ISP blockades & CORS issues
    if (clean.includes('covers.openlibrary.org') || clean.includes('archive.org')) {
      try {
        const b64 = btoa(unescape(encodeURIComponent(clean)));
        return `${BASE_URL}/api/books/cover/b64/${encodeURIComponent(b64)}?${metaParams}`;
      } catch {
        return `${BASE_URL}/api/books/cover?url=${encodeURIComponent(clean)}&${metaParams}`;
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

    // Open Library OLID — route through backend proxy with title/author fallback
    if (id.startsWith('OL') || id.includes('/works/OL')) {
      const cleanOlid = id.replace('/works/', '').replace('/books/', '');
      const directUrl = `https://covers.openlibrary.org/b/olid/${cleanOlid}-M.jpg`;
      return `${BASE_URL}/api/books/cover?url=${encodeURIComponent(directUrl)}&${metaParams}`;
    }

    // Google Books ID (alphanumeric string without spaces)
    if (!id.includes(' ') && id.length >= 4) {
      return `https://books.google.com/books/content?id=${encodeURIComponent(id)}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
    }
  }

  // Fallback to generated Dark Academia SVG cover
  return getGeneratedCoverUrl(title, author);
}
