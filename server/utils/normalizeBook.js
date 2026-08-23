function resolveCover(coverId, isbn, coverEditionKey) {
    if (coverId) return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    if (coverEditionKey) return `https://covers.openlibrary.org/b/olid/${coverEditionKey}-L.jpg`;
    if (isbn) return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    return '';
}

export function normalizeOpenLibraryTrendingWork(work) {
    const key = work.key ? String(work.key).replace('/works/', '').replace('/books/', '') : '';
    const coverId = work.cover_i || work.cover_id;
    const coverEditionKey = work.cover_edition_key || work.lending_edition;
    const isbn = work.editions?.docs?.[0]?.isbn || work.isbn?.[0] || null;

    let authorList = ['Unknown Author'];
    if (Array.isArray(work.author_name) && work.author_name.length > 0) {
        authorList = work.author_name;
    } else if (Array.isArray(work.authors) && work.authors.length > 0) {
        authorList = work.authors.map(a => (typeof a === 'string' ? a : (a.name || 'Unknown Author')));
    }

    let genreList = [];
    if (Array.isArray(work.subject)) {
        genreList = work.subject.slice(0, 5).map(s => typeof s === 'string' ? s.replace(/_/g, ' ') : String(s));
    }

    return {
        title: work.title || 'Unknown Title',
        authors: authorList,
        description: work.first_sentence?.[0] || (typeof work.description === 'string' ? work.description : (work.description?.value || 'Critically acclaimed work.')),
        coverImage: resolveCover(coverId, typeof isbn === 'string' ? isbn : (Array.isArray(isbn) ? isbn[0] : null), coverEditionKey),
        isbn: typeof isbn === 'string' ? isbn : (Array.isArray(isbn) ? isbn[0] : null),
        publishedYear: work.first_publish_year || null,
        genres: genreList,
        language: 'en',
        pageCount: work.number_of_pages_median || null,
        source: 'openlibrary',
        sourceId: key,
        averageRating: work.ratings_average ? Math.round(work.ratings_average * 10) / 10 : 4.5,
        ratingsCount: work.ratings_count || work.edition_count || 120,
    };
}

export function normalizeOpenLibraryBook(doc) {
    const coverId = doc.cover_i;
    const coverEditionKey = doc.cover_edition_key;
    const isbn = doc.isbn?.[0] || null;

    return {
        title: doc.title || 'Unknown Title',
        authors: doc.author_name || ['Unknown Author'],
        description: doc.first_sentence?.[0] || '',
        coverImage: resolveCover(coverId, isbn, coverEditionKey),
        isbn,
        publishedYear: doc.first_publish_year || null,
        genres: doc.subject?.slice(0, 5) || [],
        language: doc.language?.[0] || 'en',
        pageCount: doc.number_of_pages_median || null,
        source: 'openlibrary',
        sourceId: doc.key.replace('/works/', ''),
        averageRating: doc.ratings_average ? Math.round(doc.ratings_average * 10) / 10 : 0,
        ratingsCount: doc.ratings_count || 0,
    };
}

export function normalizeGoogleBook(item) {
    const v = item.volumeInfo || {};
    const isbn = v.industryIdentifiers?.find(i => i.type === 'ISBN_13' || i.type === 'ISBN_10')?.identifier || null;

    const gbCover = v.imageLinks?.thumbnail?.replace('http:', 'https:');
    const coverImage = gbCover || (isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : '');

    return {
        title: v.title || 'Unknown Title',
        authors: v.authors || ['Unknown Author'],
        description: v.description || 'No description available.',
        coverImage,
        isbn,
        publishedYear: v.publishedDate ? parseInt(v.publishedDate) || null : null,
        genres: v.categories || [],
        language: v.language || 'en',
        pageCount: v.pageCount || null,
        source: 'googlebooks',
        sourceId: item.id,
        averageRating: v.averageRating || 0,
        ratingsCount: v.ratingsCount || 0,
    };
}

export async function normalizeOpenLibraryBookDetail(data, ratingsData = null) {
    let author = 'Unknown Author';
    if (data.authors && data.authors.length > 0) {
        const authorKey = data.authors[0].author?.key || data.authors[0].key;
        if (authorKey) {
            try {
                const cleanKey = authorKey.startsWith('/') ? authorKey : `/${authorKey}`;
                const authorRes = await fetch(`https://openlibrary.org${cleanKey}.json`, { signal: AbortSignal.timeout(5000) });
                if (authorRes.ok) {
                    const authorData = await authorRes.json();
                    author = authorData.name || 'Unknown Author';
                }
            } catch {}
        } else if (data.authors[0].name) {
            author = data.authors[0].name;
        }
    }

    let description = 'No description available.';
    if (data.description) {
        description = typeof data.description === 'string' ? data.description : (data.description.value || 'No description available.');
    }

    const coverId = data.covers?.[0];
    const isbn = data.isbn_13?.[0] || data.isbn_10?.[0] || null;

    let averageRating = 0;
    let ratingsCount = 0;
    if (ratingsData?.summary) {
        averageRating = Math.round((ratingsData.summary.average || 0) * 10) / 10;
        ratingsCount = ratingsData.summary.count || 0;
    }

    return {
        title: data.title || 'Unknown Title',
        authors: [author],
        description,
        coverImage: resolveCover(coverId, isbn),
        isbn,
        publishedYear: data.first_publish_date ? parseInt(data.first_publish_date) || null : null,
        genres: data.subjects?.slice(0, 5) || [],
        language: 'en',
        pageCount: data.number_of_pages || null,
        source: 'openlibrary',
        sourceId: data.key?.replace('/works/', '').replace('/books/', '') || '',
        averageRating,
        ratingsCount,
    };
}

export function toApiFormat(book) {
    return {
        id: book.sourceId,
        title: book.title,
        author: Array.isArray(book.authors) ? book.authors.join(', ') : (book.author || 'Unknown Author'),
        description: book.description,
        coverUrl: book.coverImage,
        rating: book.averageRating,
        publishedDate: book.publishedYear ? String(book.publishedYear) : 'Unknown',
        pages: book.pageCount || 0,
        genre: book.genres,
    };
}
