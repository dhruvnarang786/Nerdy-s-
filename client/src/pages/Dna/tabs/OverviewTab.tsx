import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Flame, Loader2, Feather, Zap, Star } from 'lucide-react';
import { useDnaProfile, useDnaStats } from '../hooks';
import { getFavorites, getCurrentUserLogs, type BookLog } from '@/lib/storage';
import type { Book } from '@/lib/apiClient';
import { FavoriteBooksSection } from '../components/FavoriteBooksSection';
import { ReadingHeatmapGrid } from '../components/ReadingHeatmapGrid';
import { RecentActivityRow } from '../components/RecentActivityRow';
import { RatingHistogram } from '../components/RatingHistogram';

interface OverviewTabProps {
  enabled: boolean;
  onNavigateTab?: (tabId: string) => void;
}

function TopAuthorsCard({ logs }: { logs: BookLog[] }) {
  const topAuthors = useMemo(() => {
    const map: Record<string, { count: number; totalRating: number }> = {};
    logs.forEach(l => {
      if (l.author && l.author.trim().length > 0 && l.author !== 'Unknown Author') {
        const a = l.author.trim();
        if (!map[a]) map[a] = { count: 0, totalRating: 0 };
        map[a].count++;
        map[a].totalRating += l.rating;
      }
    });

    return Object.entries(map)
      .map(([author, data]) => ({
        author,
        count: data.count,
        avgRating: (data.totalRating / data.count).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count || Number(b.avgRating) - Number(a.avgRating))
      .slice(0, 4);
  }, [logs]);

  if (topAuthors.length === 0) return null;

  return (
    <section className="lb-profile-section">
      <div className="lb-profile-section-header">
        <h2 className="lb-profile-section-title">
          <Feather size={14} className="lb-gold-icon" />
          FAVORITE AUTHORS & CREATORS
        </h2>
        <span className="lb-profile-section-sub">Most Read</span>
      </div>

      <div className="lb-authors-grid">
        {topAuthors.map((item, idx) => (
          <Link
            key={idx}
            to={`/search?q=${encodeURIComponent(item.author)}`}
            className="lb-author-card"
            title={`Explore books by ${item.author}`}
          >
            <div className="lb-author-avatar">
              <span>{item.author.charAt(0).toUpperCase()}</span>
            </div>
            <div className="lb-author-details">
              <span className="lb-author-name">{item.author}</span>
              <div className="lb-author-meta">
                <span className="lb-author-count">{item.count} {item.count === 1 ? 'Book' : 'Books'}</span>
                <span className="lb-author-dot">·</span>
                <span className="lb-author-rating">
                  <Star size={10} style={{ fill: '#d4af37', color: '#d4af37', display: 'inline', marginRight: 2 }} />
                  {item.avgRating}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ReadingPaceCard({ logs }: { logs: BookLog[] }) {
  const totalBooks = logs.length;
  const reviewsCount = logs.filter(l => l.notes && l.notes.trim().length > 0).length;
  const reviewRate = totalBooks > 0 ? Math.round((reviewsCount / totalBooks) * 100) : 0;
  const highRatedCount = logs.filter(l => l.rating >= 4).length;
  const highRatedRatio = totalBooks > 0 ? Math.round((highRatedCount / totalBooks) * 100) : 0;

  return (
    <div className="lb-sidebar-card">
      <div className="lb-sidebar-header">
        <h3 className="lb-sidebar-title">
          <Zap size={13} className="lb-gold-icon" />
          READING VELOCITY & METRICS
        </h3>
      </div>

      <div className="lb-pace-metrics-list">
        <div className="lb-pace-metric-item">
          <div className="lb-pace-metric-label">Review Depth Ratio</div>
          <div className="lb-pace-metric-val">{reviewRate}% of books reviewed</div>
          <div className="lb-pace-track">
            <div className="lb-pace-fill" style={{ width: `${reviewRate}%` }} />
          </div>
        </div>

        <div className="lb-pace-metric-item">
          <div className="lb-pace-metric-label">High Rating Affinity (4★+)</div>
          <div className="lb-pace-metric-val">{highRatedRatio}% high praise</div>
          <div className="lb-pace-track">
            <div className="lb-pace-fill" style={{ width: `${highRatedRatio}%`, background: '#22c55e' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PersonalityProp {
  primaryLabel?: string;
  topContributors?: { label: string; contribution: number }[];
}

function PersonalityBreakdown({ personality }: { personality?: PersonalityProp | null }) {
  if (!personality || !personality.primaryLabel) return null;
  const topContributors = personality.topContributors;
  const totalContribution = topContributors?.reduce((s, c) => s + c.contribution, 0) || 1;

  return (
    <div className="lb-sidebar-card">
      <div className="lb-sidebar-header">
        <h3 className="lb-sidebar-title">
          <Sparkles size={13} className="lb-gold-icon" />
          PERSONALITY TRAIT INFLUENCES
        </h3>
      </div>

      {topContributors && topContributors.length > 0 && (
        <div className="dna-breakdown-bars">
          {topContributors.map((c, i) => (
            <div key={i} className="dna-breakdown-row">
              <span className="dna-breakdown-label">{c.label}</span>
              <div className="dna-breakdown-track">
                <div
                  className="dna-breakdown-fill"
                  style={{ width: `${(c.contribution / totalContribution) * 100}%` }}
                />
              </div>
              <span className="dna-breakdown-value">{Math.round(c.contribution)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GenreSummaryCard({ genres }: { genres?: { genre: string; affinity: number; count: number }[] }) {
  if (!genres || genres.length === 0) return null;
  const top = genres.slice(0, 5);

  return (
    <div className="lb-sidebar-card">
      <div className="lb-sidebar-header">
        <h3 className="lb-sidebar-title">
          <BookOpen size={13} className="lb-gold-icon" />
          TOP GENRE AFFINITIES
        </h3>
      </div>

      <div className="dna-genre-list">
        {top.map((g, i) => (
          <div key={i} className="dna-genre-row">
            <span className="dna-genre-name">{g.genre}</span>
            <div className="dna-genre-track">
              <div
                className="dna-genre-fill"
                style={{ width: `${Math.round(g.affinity * 100)}%` }}
              />
            </div>
            <span className="dna-genre-count">{Math.round(g.affinity * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakSidebarCard({ streak, booksThisYear }: { streak: number; booksThisYear: number }) {
  const annualGoal = 25;
  const progressPct = Math.min((booksThisYear / annualGoal) * 100, 100);

  return (
    <div className="lb-sidebar-card">
      <div className="lb-sidebar-header">
        <h3 className="lb-sidebar-title">
          <Flame size={13} className="lb-gold-icon" style={{ fill: '#f97316', color: '#f97316' }} />
          READING MOMENTUM
        </h3>
      </div>

      <div className="lb-streak-box">
        <div className="lb-streak-number-row">
          <span className="lb-streak-val">{streak}</span>
          <span className="lb-streak-unit">Days Active Streak</span>
        </div>
        <p className="lb-streak-sub">
          {streak > 0 ? "You're on a reading roll! Keep the momentum alive." : "Log a book today to ignite your streak."}
        </p>

        <div className="lb-goal-progress-section">
          <div className="lb-goal-label-row">
            <span>2026 Reading Goal</span>
            <span className="lb-goal-val">{booksThisYear} / {annualGoal} books</span>
          </div>
          <div className="lb-goal-track">
            <div className="lb-goal-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function OverviewTab({ enabled, onNavigateTab }: OverviewTabProps) {
  const { data: profileData, isLoading: profileLoading } = useDnaProfile();
  const { data: statsData, isLoading: statsLoading } = useDnaStats(enabled);

  const [favorites, setFavorites] = useState<Book[]>([]);
  const [logs, setLogs] = useState<BookLog[]>([]);

  useEffect(() => {
    if (!enabled) return;
    getFavorites().then(setFavorites).catch(console.error);
    getCurrentUserLogs().then(setLogs).catch(console.error);
  }, [enabled]);

  if (profileLoading || statsLoading) {
    return (
      <div className="dna-tab-loading">
        <Loader2 className="animate-spin inline mr-2" size={18} />
        Assembling your reader identity...
      </div>
    );
  }

  const personality = profileData?.personality;
  const genres = statsData?.genres || [];
  const stats = statsData?.stats || {
    booksThisYear: 0,
    currentStreak: 0,
  };

  return (
    <div className="lb-profile-overview-layout">
      {/* ── LEFT MAIN COLUMN ───────────────────────────────────── */}
      <div className="lb-profile-main-column">
        {/* 1. Iconic Favorite Books Spotlight (4-Slot Showcase) */}
        <FavoriteBooksSection
          favorites={favorites}
          onViewAll={() => onNavigateTab?.('Favorites')}
        />

        {/* 2. 365-Day Reading Activity Heatmap */}
        <ReadingHeatmapGrid logs={logs} />

        {/* 3. Recent Book Logs Row */}
        <RecentActivityRow
          logs={logs}
          onViewAll={() => onNavigateTab?.('Books')}
        />

        {/* 4. Top Favorite Authors */}
        <TopAuthorsCard logs={logs} />
      </div>

      {/* ── RIGHT SIDEBAR COLUMN ───────────────────────────────── */}
      <div className="lb-profile-sidebar-column">
        {/* 1. Letterboxd Rating Distribution Histogram */}
        <RatingHistogram logs={logs} />

        {/* 2. Reading Momentum & Annual Goal */}
        <StreakSidebarCard
          streak={stats.currentStreak}
          booksThisYear={stats.booksThisYear}
        />

        {/* 3. Top Genre Affinities */}
        <GenreSummaryCard genres={genres} />

        {/* 4. Reading Velocity & Depth Ratio */}
        <ReadingPaceCard logs={logs} />

        {/* 5. Personality Breakdown Influences */}
        <PersonalityBreakdown personality={personality} />
      </div>
    </div>
  );
}
