import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Loader2 } from 'lucide-react';
import { getCurrentUserLogs, type BookLog } from '@/lib/storage';
import { getBookCoverUrl } from '@/lib/bookCover';

interface BooksTabProps {
  enabled: boolean;
}

export function BooksTab({ enabled }: BooksTabProps) {
  const [logs, setLogs] = useState<BookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    if (!enabled) return;
    getCurrentUserLogs()
      .then(userLogs => {
        setLogs(userLogs);
      })
      .catch(err => console.error('Failed to load books tab:', err))
      .finally(() => setLoading(false));
  }, [enabled]);

  const filtered = logs.filter(l => {
    if (filterRating === 'all') return true;
    return l.rating === filterRating;
  });

  if (loading) {
    return (
      <div className="dna-tab-loading">
        <Loader2 className="animate-spin inline mr-2" size={18} />
        Retrieving your logged books...
      </div>
    );
  }

  return (
    <div className="lb-tab-books-container">
      {/* Filters Toolbar */}
      <div className="lb-books-toolbar">
        <div className="lb-books-count-label">
          <BookOpen size={16} className="lb-gold-icon" />
          <span>{filtered.length} {filtered.length === 1 ? 'Book' : 'Books'} Logged</span>
        </div>

        <div className="lb-rating-filter-pills">
          <button
            className={`lb-filter-pill ${filterRating === 'all' ? 'active' : ''}`}
            onClick={() => setFilterRating('all')}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map(stars => (
            <button
              key={stars}
              className={`lb-filter-pill ${filterRating === stars ? 'active' : ''}`}
              onClick={() => setFilterRating(stars)}
            >
              {stars} ★
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="lb-empty-tab-state">
          <BookOpen size={36} className="lb-empty-icon" />
          <p>No books found for this selection.</p>
          <Link to="/search" className="btn btn-primary btn-sm mt-3">
            Search & Log Books
          </Link>
        </div>
      ) : (
        <div className="lb-books-posters-grid">
          {filtered.map((log, i) => {
            const cover = getBookCoverUrl(log.bookId, log.coverUrl);
            return (
              <div key={log.id || i} className="lb-book-poster-card">
                <Link to={`/book/${log.bookId}`} className="lb-book-poster-img-wrap">
                  <img
                    src={cover}
                    alt={log.bookTitle || 'Book cover'}
                    className="lb-book-poster-img"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="lb-poster-cover-fallback" style={{ display: 'none' }}>
                    <BookOpen size={22} className="lb-fallback-icon" />
                    <span className="lb-fallback-title">{log.bookTitle || 'Book'}</span>
                    <span className="lb-fallback-author">{log.author || 'Author'}</span>
                  </div>
                  <div className="lb-book-poster-stars-badge">
                    <Star size={11} style={{ fill: '#d4af37', color: '#d4af37' }} />
                    <span>{log.rating}</span>
                  </div>
                </Link>

                <div className="lb-book-poster-info">
                  <Link to={`/book/${log.bookId}`} className="lb-book-poster-title">
                    {log.bookTitle || 'Unknown Title'}
                  </Link>
                  <span className="lb-book-poster-author">{log.author || ''}</span>
                  <span className="lb-book-poster-date">{log.dateRead || 'Logged'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
