import { Star } from 'lucide-react';
import type { BookLog } from '@/lib/storage';

interface RatingHistogramProps {
  logs: BookLog[];
}

export function RatingHistogram({ logs }: RatingHistogramProps) {
  // Count frequency for 1, 2, 3, 4, 5 stars
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  logs.forEach(l => {
    const r = Math.round(l.rating);
    if (r >= 1 && r <= 5) {
      counts[r] = (counts[r] || 0) + 1;
    }
  });

  const maxCount = Math.max(...Object.values(counts), 1);
  const totalRated = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="lb-sidebar-card lb-rating-histogram-card">
      <div className="lb-sidebar-header">
        <h3 className="lb-sidebar-title">
          <Star size={13} className="lb-gold-icon" style={{ fill: '#d4af37' }} />
          RATINGS DISTRIBUTION
        </h3>
        <span className="lb-sidebar-sub">{totalRated} rated</span>
      </div>

      <div className="lb-histogram-bars">
        {[1, 2, 3, 4, 5].map(stars => {
          const count = counts[stars];
          const heightPct = Math.max((count / maxCount) * 100, 4);

          return (
            <div key={stars} className="lb-histogram-col" title={`${count} books rated ${stars}★`}>
              <div className="lb-histogram-bar-track">
                <div
                  className="lb-histogram-bar-fill"
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="lb-histogram-star-label">{stars}★</span>
              <span className="lb-histogram-count">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
