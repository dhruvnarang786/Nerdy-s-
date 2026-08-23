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
 * Get Direct High-Speed Edge CDN URL (-M.jpg ~20KB thumbnail for grids & carousels)
 * Enables 100% parallel browser downloading directly from Open Library / Google CDN.
 */
export function getDirectCoverUrl(
  bookId?: string | null,
  coverUrl?: string | null,
  title?: string | null,
  author?: string | null
): string {
  if (coverUrl && typeof coverUrl === 'string' && coverUrl.trim().length > 0) {
    let clean = coverUrl.trim();
    if (clean.startsWith('http://')) clean = clean.replace('http://', 'https://');
    // Normalize Open Library cover sizes to -M.jpg (~180px, 20KB) for fast grid rendering
    if (clean.includes('covers.openlibrary.org') && clean.endsWith('-L.jpg')) {
      clean = clean.replace('-L.jpg', '-M.jpg');
    }
    return clean;
  }

  if (bookId && typeof bookId === 'string' && bookId.trim().length > 0) {
    const id = bookId.trim();

    // Open Library ID
    if (id.startsWith('OL') || id.includes('/works/OL')) {
      const cleanOlid = id.replace('/works/', '').replace('/books/', '');
      return `https://covers.openlibrary.org/b/olid/${cleanOlid}-M.jpg`;
    }

    // Google Books ID
    if (!id.includes(' ') && id.length >= 4) {
      return `https://books.google.com/books/content?id=${encodeURIComponent(id)}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;
    }
  }

  return getGeneratedCoverUrl(title, author);
}

/**
 * Get Server-Side Reverse Proxy Fallback URL
 * Used when direct CDN requests fail due to regional ISP blockades or 404s.
 */
export function getProxiedCoverUrl(
  bookId?: string | null,
  coverUrl?: string | null,
  title?: string | null,
  author?: string | null
): string {
  const metaParams = `title=${encodeURIComponent(title || '')}&author=${encodeURIComponent(author || '')}`;

  if (coverUrl && typeof coverUrl === 'string' && coverUrl.trim().length > 0) {
    let clean = coverUrl.trim();
    if (clean.startsWith('http://')) clean = clean.replace('http://', 'https://');
    try {
      const b64 = btoa(unescape(encodeURIComponent(clean)));
      return `${BASE_URL}/api/books/cover/b64/${encodeURIComponent(b64)}?${metaParams}`;
    } catch {
      return `${BASE_URL}/api/books/cover?url=${encodeURIComponent(clean)}&${metaParams}`;
    }
  }

  if (bookId && typeof bookId === 'string' && bookId.trim().length > 0) {
    const id = bookId.trim();
    if (id.startsWith('OL') || id.includes('/works/OL')) {
      const cleanOlid = id.replace('/works/', '').replace('/books/', '');
      const directUrl = `https://covers.openlibrary.org/b/olid/${cleanOlid}-M.jpg`;
      return `${BASE_URL}/api/books/cover?url=${encodeURIComponent(directUrl)}&${metaParams}`;
    }
  }

  return getGeneratedCoverUrl(title, author);
}

/**
 * Universal Book Cover URL Resolver (defaults to Direct CDN)
 */
export function getBookCoverUrl(
  bookId?: string | null,
  coverUrl?: string | null,
  title?: string | null,
  author?: string | null
): string {
  return getDirectCoverUrl(bookId, coverUrl, title, author);
}

