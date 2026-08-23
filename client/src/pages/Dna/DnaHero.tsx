import type { DnaDataQuality } from '@/lib/dnaApi';
import CountUp from 'react-countup';

interface DnaHeroProps {
  username: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  avatar: string;
  archetypeLabel?: string | null;
  personalityLabel?: string | null;
  confidence?: number;
  identity?: string | null;
  narrative?: string | null;
  narrationVersion?: string;
  stats: {
    booksThisYear: number;
    avgRating: number;
    currentStreak: number;
    totalBadges: number;
  };
  accentColor?: string;
  strengths?: string[] | null;
  explorationSuggestion?: string | null;
  totalLogs?: number;
  sufficientData?: boolean;
  dataQuality?: DnaDataQuality;
}

export function DnaHero({
  username,
  level,
  xp,
  nextLevelXp,
  avatar,
  archetypeLabel,
  personalityLabel,
  stats,
  totalLogs,
}: DnaHeroProps) {
  const displayLabel = personalityLabel || archetypeLabel || 'Avid Reader';
  const booksCount = totalLogs !== undefined ? totalLogs : stats.booksThisYear;
  const xpPercent = Math.min((xp / Math.max(nextLevelXp, 1)) * 100, 100);

  return (
    <header className="lb-profile-hero" role="banner">
      {/* ── LEFT: AVATAR & USER IDENTITY ──────────────────────── */}
      <div className="lb-profile-identity-group">
        <div className="lb-profile-avatar" title={username}>
          <span className="lb-profile-avatar-letter">{avatar || username.charAt(0).toUpperCase()}</span>
        </div>

        <div className="lb-profile-details">
          <div className="lb-profile-name-row">
            <h1 className="lb-profile-username">{username}</h1>
          </div>

          <div className="lb-profile-badges-row">
            <span className="lb-level-badge">Level {level}</span>
            <span className="lb-archetype-badge">✦ {displayLabel}</span>
            <div className="lb-xp-pill" title={`${xp} of ${nextLevelXp} XP to Level ${level + 1}`}>
              <div className="lb-xp-track">
                <div className="lb-xp-fill" style={{ width: `${xpPercent}%` }} />
              </div>
              <span className="lb-xp-text">{xp}/{nextLevelXp} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: LETTERBOXD PROMINENT STAT COUNTERS ─────────── */}
      <div className="lb-profile-stats-counters">
        <div className="lb-stat-counter-item">
          <span className="lb-stat-number">
            <CountUp end={booksCount} duration={1.2} separator="," />
          </span>
          <span className="lb-stat-label">BOOKS</span>
        </div>

        <div className="lb-stat-divider" />

        <div className="lb-stat-counter-item">
          <span className="lb-stat-number">
            <CountUp end={stats.booksThisYear} duration={1.2} separator="," />
          </span>
          <span className="lb-stat-label">THIS YEAR</span>
        </div>

        <div className="lb-stat-divider" />

        <div className="lb-stat-counter-item">
          <span className="lb-stat-number">
            <CountUp end={stats.avgRating} decimals={1} duration={1.2} />
          </span>
          <span className="lb-stat-label">AVG RATING</span>
        </div>

        <div className="lb-stat-divider" />

        <div className="lb-stat-counter-item">
          <span className="lb-stat-number">
            <CountUp end={stats.currentStreak} duration={1.2} />
          </span>
          <span className="lb-stat-label">STREAK</span>
        </div>
      </div>
    </header>
  );
}
