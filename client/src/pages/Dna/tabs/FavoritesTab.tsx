import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { getFavorites } from '@/lib/storage';
import type { Book } from '@/lib/apiClient';
import { getBookCoverUrl } from '@/lib/bookCover';

interface FavoritesTabProps {
  enabled: boolean;
}

export function FavoritesTab({ enabled }: FavoritesTabProps) {
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    getFavorites()
      .then(favs => setFavorites(favs))
      .catch(err => console.error('Failed to load favorites tab:', err))
      .finally(() => setLoading(false));
  }, [enabled]);

  if (loading) {
    return (
      <div className="dna-tab-loading">
        <Loader2 className="animate-spin inline mr-2" size={18} />
        Opening your treasure vault...
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="lb-empty-tab-state">
        <Heart size={36} className="lb-empty-icon" style={{ color: '#f43f5e' }} />
        <p>No favorite books saved yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Click the heart icon on any book page to pin it to your favorites.</p>
        <Link to="/trending" className="btn btn-primary btn-sm mt-3">
          Discover Popular Books
        </Link>
      </div>
    );
  }

  return (
    <div className="lb-tab-books-container">
      <div className="lb-books-toolbar">
        <div className="lb-books-count-label">
          <Heart size={16} className="lb-rose-icon" style={{ fill: '#f43f5e' }} />
          <span>{favorites.length} {favorites.length === 1 ? 'Favorite Book' : 'Favorite Books'}</span>
        </div>
      </div>

      <div className="lb-books-posters-grid">
        {favorites.map((book, i) => {
          const cover = getBookCoverUrl(book.id, book.coverUrl);
          return (
            <div key={book.id || i} className="lb-book-poster-card">
              <Link to={`/book/${book.id}`} className="lb-book-poster-img-wrap">
                <img
                  src={cover}
                  alt={book.title || 'Book cover'}
                  className="lb-book-poster-img"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </Link>

              <div className="lb-book-poster-info">
                <Link to={`/book/${book.id}`} className="lb-book-poster-title">
                  {book.title || 'Unknown Title'}
                </Link>
                <span className="lb-book-poster-author">{book.author || ''}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
