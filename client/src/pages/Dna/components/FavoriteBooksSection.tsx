import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { Book } from '@/lib/apiClient';
import { getBookCoverUrl } from '@/lib/bookCover';

interface FavoriteBooksSectionProps {
  favorites: Book[];
  onViewAll?: () => void;
}

export function FavoriteBooksSection({ favorites, onViewAll }: FavoriteBooksSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const hasFavorites = favorites && favorites.length > 0;
  const emptySlotsCount = Math.max(0, 4 - (favorites?.length || 0));

  return (
    <section className="lb-profile-section lb-favorites-section">
      <div className="lb-profile-section-header">
        <div className="flex items-center gap-2">
          <h2 className="lb-profile-section-title">
            <Heart size={14} className="lb-gold-icon" style={{ fill: '#d4af37' }} />
            FAVORITE BOOKS SPOTLIGHT
          </h2>
          {hasFavorites && (
            <span className="lb-profile-section-sub">({favorites.length})</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onViewAll && favorites.length > 4 && (
            <button onClick={onViewAll} className="lb-link-more">
              ALL ({favorites.length}) →
            </button>
          )}

          {hasFavorites && favorites.length > 4 && (
            <div className="lb-scroll-controls">
              <button
                onClick={() => scroll('left')}
                className="lb-scroll-btn"
                aria-label="Scroll favorites left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                className="lb-scroll-btn"
                aria-label="Scroll favorites right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="lb-fav-scroll-container" ref={scrollContainerRef}>
        <div className="lb-fav-scroll-track">
          {favorites.map((book, index) => {
            const cover = getBookCoverUrl(book.id, book.coverUrl);
            return (
              <Link
                key={book.id || index}
                to={`/book/${book.id}`}
                className="lb-fav-scroll-card"
                title={`${book.title} by ${book.author}`}
              >
                <div className="lb-fav-poster-img-wrap">
                  <img
                    src={cover}
                    alt={book.title}
                    className="lb-fav-poster-img"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  {/* Dynamic Fallback if image fails */}
                  <div className="lb-poster-cover-fallback" style={{ display: 'none' }}>
                    <span className="lb-fallback-title">{book.title}</span>
                    <span className="lb-fallback-author">{book.author}</span>
                  </div>

                  <div className="lb-fav-poster-overlay">
                    <span className="lb-fav-poster-title">{book.title}</span>
                    <span className="lb-fav-poster-author">{book.author}</span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Fill remaining slots up to 4 with interactive Add Favorite placeholders */}
          {Array.from({ length: emptySlotsCount }).map((_, idx) => (
            <Link
              key={`empty-slot-${idx}`}
              to="/search"
              className="lb-fav-scroll-card lb-fav-slot-empty"
              title="Add a favorite book to your spotlight"
            >
              <div className="lb-fav-slot-empty-inner">
                <div className="lb-fav-slot-icon-box">
                  <Plus size={20} className="lb-fav-slot-plus" />
                </div>
                <span className="lb-fav-slot-label">Add Favorite</span>
                <span className="lb-fav-slot-sub">Spotlight #{favorites.length + idx + 1}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
