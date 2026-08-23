import { Link } from 'react-router-dom';
import { Star, Clock, BookOpen } from 'lucide-react';
import type { BookLog } from '@/lib/storage';
import { getBookCoverUrl } from '@/lib/bookCover';

interface RecentActivityRowProps {
  logs: BookLog[];
  onViewAll?: () => void;
}

export function RecentActivityRow({ logs, onViewAll }: RecentActivityRowProps) {
  const recentLogs = logs.slice(0, 5);

  if (recentLogs.length === 0) {
    return (
      <section className="lb-profile-section">
        <div className="lb-profile-section-header">
          <h2 className="lb-profile-section-title">
            <Clock size={14} className="lb-gold-icon" />
            RECENT ACTIVITY
          </h2>
        </div>
        <p className="lb-empty-text">No recent book logs yet. Start logging books to build your profile!</p>
      </section>
    );
  }

  return (
    <section className="lb-profile-section">
      <div className="lb-profile-section-header">
        <h2 className="lb-profile-section-title">
          <Clock size={14} className="lb-gold-icon" />
          RECENT ACTIVITY
        </h2>
        {onViewAll && (
          <button onClick={onViewAll} className="lb-link-more">
            ALL ACTIVITY →
          </button>
        )}
      </div>

      <div className="lb-recent-grid">
        {recentLogs.map((log, i) => {
          const cover = getBookCoverUrl(log.bookId, log.coverUrl);
          return (
            <div key={log.id || i} className="lb-recent-card">
              <Link to={`/book/${log.bookId}`} className="lb-recent-cover-link">
                <img
                  src={cover}
                  alt={log.bookTitle || 'Book cover'}
                  className="lb-recent-cover-img"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Dynamic Styled Cover Fallback */}
                <div className="lb-poster-cover-fallback" style={{ display: 'none' }}>
                  <BookOpen size={20} className="lb-fallback-icon" />
                  <span className="lb-fallback-title">{log.bookTitle || 'Book'}</span>
                  <span className="lb-fallback-author">{log.author || 'Author'}</span>
                </div>

                <div className="lb-recent-rating-badge">
                  <Star size={10} style={{ fill: '#d4af37', color: '#d4af37' }} />
                  <span>{log.rating}</span>
                </div>
              </Link>

              <div className="lb-recent-meta">
                <Link to={`/book/${log.bookId}`} className="lb-recent-title" title={log.bookTitle}>
                  {log.bookTitle || 'Unknown Title'}
                </Link>
                <span className="lb-recent-date">{log.dateRead || 'Recently'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
