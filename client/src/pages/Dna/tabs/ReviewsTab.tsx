import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, Loader2, Quote } from 'lucide-react';
import { getCurrentUserLogs, type BookLog } from '@/lib/storage';
import { getBookCoverUrl } from '@/lib/bookCover';

interface ReviewsTabProps {
  enabled: boolean;
}

export function ReviewsTab({ enabled }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<BookLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    getCurrentUserLogs()
      .then(userLogs => {
        const withReviews = userLogs.filter(l => l.notes && l.notes.trim().length > 0);
        withReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(withReviews);
      })
      .catch(err => console.error('Failed to load reviews tab:', err))
      .finally(() => setLoading(false));
  }, [enabled]);

  if (loading) {
    return (
      <div className="dna-tab-loading">
        <Loader2 className="animate-spin inline mr-2" size={18} />
        Compiling your written reviews...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="lb-empty-tab-state">
        <MessageSquare size={36} className="lb-empty-icon" />
        <p>You haven't written any book reviews yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Log a book with your review notes to see them here.</p>
        <Link to="/search" className="btn btn-primary btn-sm mt-3">
          Review a Book
        </Link>
      </div>
    );
  }

  return (
    <div className="lb-tab-reviews-container">
      <div className="lb-books-toolbar">
        <div className="lb-books-count-label">
          <MessageSquare size={16} className="lb-gold-icon" />
          <span>{reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'} Written</span>
        </div>
      </div>

      <div className="lb-reviews-list">
        {reviews.map((rev, i) => {
          const cover = getBookCoverUrl(rev.bookId, rev.coverUrl);
          return (
            <div key={rev.id || i} className="lb-review-item-card">
              <Link to={`/book/${rev.bookId}`} className="lb-review-cover-link">
                <img
                  src={cover}
                  alt={rev.bookTitle || 'Book cover'}
                  className="lb-review-cover-img"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </Link>

              <div className="lb-review-content">
                <div className="lb-review-header">
                  <div>
                    <Link to={`/book/${rev.bookId}`} className="lb-review-book-title">
                      {rev.bookTitle || 'Unknown Book'}
                    </Link>
                    <span className="lb-review-book-author">by {rev.author || 'Unknown Author'}</span>
                  </div>

                  <div className="lb-review-stars-date">
                    <div className="lb-review-stars">
                      {Array.from({ length: rev.rating }).map((_, si) => (
                        <Star key={si} size={13} style={{ fill: '#d4af37', color: '#d4af37' }} />
                      ))}
                    </div>
                    <span className="lb-review-date">{rev.dateRead || 'Recently'}</span>
                  </div>
                </div>

                <div className="lb-review-quote-body">
                  <Quote size={14} className="lb-review-quote-icon" />
                  <p className="lb-review-text">"{rev.notes}"</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
