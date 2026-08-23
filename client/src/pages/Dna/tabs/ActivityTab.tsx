import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Star, Heart, Award, MessageSquare, Loader2, Quote } from 'lucide-react';
import { getCurrentUserLogs, getFavorites } from '@/lib/storage';
import { useDnaBadges } from '../hooks';
import type { Book } from '@/lib/apiClient';
import { getBookCoverUrl } from '@/lib/bookCover';

interface ActivityTabProps {
  enabled: boolean;
}

interface MergedActivityItem {
  id: string;
  type: 'log' | 'review' | 'favorite' | 'badge';
  title: string;
  subtitle?: string;
  date: Date;
  dateStr: string;
  bookId?: string;
  coverUrl?: string;
  rating?: number;
  notes?: string;
  badgeTier?: string;
}

export function ActivityTab({ enabled }: ActivityTabProps) {
  const [items, setItems] = useState<MergedActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: badgesData } = useDnaBadges(enabled);

  useEffect(() => {
    if (!enabled) return;

    Promise.all([
      getCurrentUserLogs(),
      getFavorites(),
    ])
      .then(([logs, favorites]) => {
        const merged: MergedActivityItem[] = [];

        // 1. Logs & Reviews
        logs.forEach(log => {
          const logDate = new Date(log.createdAt || log.dateRead || Date.now());
          const dateStr = logDate.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          // If it has notes, treat as Review milestone
          if (log.notes && log.notes.trim().length > 0) {
            merged.push({
              id: `rev-${log.id}`,
              type: 'review',
              title: `Reviewed ${log.bookTitle || 'a book'}`,
              subtitle: `Rated ${log.rating}★ · ${log.author || 'Unknown Author'}`,
              date: logDate,
              dateStr,
              bookId: log.bookId,
              coverUrl: log.coverUrl,
              rating: log.rating,
              notes: log.notes,
            });
          } else {
            merged.push({
              id: `log-${log.id}`,
              type: 'log',
              title: `Logged ${log.bookTitle || 'a book'}`,
              subtitle: `Rated ${log.rating}★ · ${log.author || 'Unknown Author'}`,
              date: logDate,
              dateStr,
              bookId: log.bookId,
              coverUrl: log.coverUrl,
              rating: log.rating,
            });
          }
        });

        // 2. Favorites
        favorites.forEach((fav: Book) => {
          const favDate = new Date();
          merged.push({
            id: `fav-${fav.id}`,
            type: 'favorite',
            title: `Pinned ${fav.title} to Favorites`,
            subtitle: `by ${fav.author || 'Unknown Author'}`,
            date: favDate,
            dateStr: 'Pinned Favorite',
            bookId: fav.id,
            coverUrl: fav.coverUrl,
          });
        });

        // 3. Badges unlocked
        const badges = badgesData?.badges?.items || [];
        badges
          .filter(b => b.unlocked)
          .forEach(b => {
            const bDate = b.unlockedAt ? new Date(b.unlockedAt) : new Date();
            merged.push({
              id: `badge-${b.id}`,
              type: 'badge',
              title: `Unlocked "${b.label || b.id}" Achievement`,
              subtitle: `${b.tier} Tier Badge`,
              date: bDate,
              dateStr: b.unlockedAt
                ? bDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Achievement Unlocked',
              badgeTier: b.tier,
            });
          });

        // Sort descending by timestamp
        merged.sort((a, b) => b.date.getTime() - a.date.getTime());
        setItems(merged);
      })
      .catch(err => console.error('Failed to compile activity milestones:', err))
      .finally(() => setLoading(false));
  }, [enabled, badgesData]);

  if (loading) {
    return (
      <div className="dna-tab-loading">
        <Loader2 className="animate-spin inline mr-2" size={18} />
        Compiling your reading milestones and history...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="lb-empty-tab-state">
        <Clock size={36} className="lb-empty-icon" />
        <p>No reading activity recorded yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Log books, write reviews, and unlock achievements to build your timeline.</p>
        <Link to="/search" className="btn btn-primary btn-sm mt-3">
          Explore Books to Log
        </Link>
      </div>
    );
  }

  return (
    <div className="lb-tab-activity-container">
      <div className="lb-books-toolbar">
        <div className="lb-books-count-label">
          <Clock size={16} className="lb-gold-icon" />
          <span>{items.length} Reading Milestones</span>
        </div>
      </div>

      <div className="lb-activity-timeline-list">
        {items.map((item) => (
          <div key={item.id} className="lb-activity-milestone-card">
            {/* Left Icon / Badge */}
            <div className="lb-activity-type-icon">
              {item.type === 'log' && <BookOpen size={16} className="text-blue-400" />}
              {item.type === 'review' && <MessageSquare size={16} className="text-emerald-400" />}
              {item.type === 'favorite' && <Heart size={16} className="text-rose-400" style={{ fill: '#fb7185' }} />}
              {item.type === 'badge' && <Award size={18} style={{ color: '#d4af37' }} />}
            </div>

            {/* Book Cover Thumbnail (if applicable) */}
            {item.bookId && (
              <Link to={`/book/${item.bookId}`} className="lb-activity-thumb-link">
                <img
                  src={getBookCoverUrl(item.bookId, item.coverUrl)}
                  alt={item.title}
                  className="lb-activity-thumb-img"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="lb-poster-cover-fallback" style={{ display: 'none' }}>
                  <BookOpen size={14} className="lb-fallback-icon" />
                </div>
              </Link>
            )}

            {/* Main Content */}
            <div className="lb-activity-info">
              <div className="lb-activity-title-row">
                <span className="lb-activity-title-text">{item.title}</span>
                {item.rating && (
                  <div className="lb-activity-stars">
                    {Array.from({ length: item.rating }).map((_, si) => (
                      <Star key={si} size={11} style={{ fill: '#d4af37', color: '#d4af37' }} />
                    ))}
                  </div>
                )}
                {item.badgeTier && (
                  <span className="lb-activity-tier-badge">{item.badgeTier}</span>
                )}
              </div>

              {item.subtitle && (
                <span className="lb-activity-subtitle">{item.subtitle}</span>
              )}

              {item.notes && (
                <div className="lb-activity-quote">
                  <Quote size={12} className="lb-gold-icon flex-shrink-0 mt-0.5" />
                  <p className="lb-activity-quote-text">"{item.notes}"</p>
                </div>
              )}
            </div>

            {/* Right Timestamp */}
            <div className="lb-activity-timestamp-badge">
              <span>{item.dateStr}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
