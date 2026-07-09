import { DnaNarration } from './DnaNarration';
import { DnaStatCards } from './DnaStatCards';
import { Lightbulb } from 'lucide-react';
import type { DnaDataQuality } from '@/lib/dnaApi';

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

function XpBar({ xp, nextLevelXp }: { xp: number; nextLevelXp: number }) {
  const progress = Math.min(xp / Math.max(nextLevelXp, 1), 1);
  return (
    <div className="dna-xp-bar-track" role="progressbar" aria-valuenow={xp} aria-valuemin={0} aria-valuemax={nextLevelXp} aria-label={`${xp} of ${nextLevelXp} XP to next level`}>
      <div className="dna-xp-bar-fill" style={{ width: `${progress * 100}%` }} />
    </div>
  );
}

function StrengthsList({ strengths }: { strengths: string[] }) {
  if (!strengths || strengths.length === 0) return null;
  return (
    <div className="dna-narration-strengths">
      <span className="dna-strength-badge"><Lightbulb size={12} /> Your Strengths</span>
      {strengths.map((s, i) => (
        <div key={i} className="dna-narration-strength-item">{s}</div>
      ))}
    </div>
  );
}

function ExplorationSuggestion({ suggestion }: { suggestion: string }) {
  return (
    <div className="dna-card" style={{ marginTop: '1rem', borderLeft: '2px solid var(--dna-accent)' }}>
      <p className="dna-narration-text" style={{ fontSize: '0.85rem', fontStyle: 'normal' }}>
        <span style={{ color: 'var(--dna-accent)', fontWeight: 600 }}>Based on your DNA: </span>
        {suggestion}
      </p>
    </div>
  );
}

function InsufficientDataInline({ totalLogs = 0 }: { totalLogs: number }) {
  const progress = Math.min(totalLogs / 5, 1);
  return (
    <div className="dna-narration-box" style={{ borderLeft: '2px solid var(--dna-accent)' }}>
      <p className="dna-narration-text" style={{ fontStyle: 'normal', marginBottom: '0.75rem' }}>
        Your reading identity becomes clear after you log 5 books.
        You're {totalLogs}/5 of the way!
      </p>
      <div className="dna-progress-track" style={{ height: 8, maxWidth: '100%' }}>
        <div className="dna-progress-fill" style={{ width: `${progress * 100}%` }} role="progressbar" aria-valuenow={totalLogs} aria-valuemin={0} aria-valuemax={5} aria-label={`${totalLogs} of 5 books logged`} />
      </div>
      <span className="dna-progress-label" style={{ marginTop: 6 }}>{totalLogs} / 5 books logged</span>
    </div>
  );
}

export function DnaHero({
  username, level, xp, nextLevelXp, avatar,
  archetypeLabel, personalityLabel, confidence,
  identity, narrative, narrationVersion,
  stats, accentColor,
  strengths, explorationSuggestion,
  totalLogs, sufficientData,
}: DnaHeroProps) {
  const levelProgress = Math.min(xp / Math.max(nextLevelXp, 1), 1);
  const circumference = 2 * Math.PI * 54;
  const displayLabel = personalityLabel || archetypeLabel;

  return (
    <header className="dna-hero" role="banner" style={{ '--dna-accent': accentColor || '#d4af37' } as React.CSSProperties}>
      <div className="dna-hero-gradient" />
      <div className="dna-hero-content">
        <div className="dna-identity-section" aria-labelledby="identity-heading">
          <h2 id="identity-heading" className="dna-sr-only">Reader Identity</h2>

          <div className="dna-avatar-block">
            <div className="dna-avatar-ring-container">
              <svg className="dna-avatar-ring-svg" width="128" height="128" viewBox="0 0 128 128">
                <circle
                  cx="64" cy="64" r="54"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="4"
                />
                <circle
                  cx="64" cy="64" r="54"
                  fill="none"
                  stroke="var(--dna-accent)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - levelProgress)}
                  className="dna-level-ring"
                  transform="rotate(-90 64 64)"
                />
              </svg>
              <div className="dna-avatar-letter" style={{ color: 'var(--dna-accent)' }}>
                {avatar || username.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="dna-identity-info">
            <h1 className="dna-username">{username}</h1>
            <div className="dna-personality-tag">
              {displayLabel && (
                <span className="dna-personality-badge">
                  {displayLabel}
                </span>
              )}
              <span className="dna-level-tag">Level {level}</span>
              {confidence !== undefined && (
                <span className="dna-breakdown-confidence" style={{ background: 'color-mix(in srgb, var(--dna-accent) 10%, var(--card))' }}>
                  {confidence >= 0.7 ? 'Strong' : confidence >= 0.4 ? 'Moderate' : 'Lean'}
                </span>
              )}
            </div>
            <XpBar xp={xp} nextLevelXp={nextLevelXp} />
            <div className="dna-xp-text">{xp} / {nextLevelXp} XP</div>
          </div>
        </div>

        {sufficientData === false ? (
          <InsufficientDataInline totalLogs={totalLogs} />
        ) : (
          <>
            <DnaNarration
              identity={identity}
              archetypeLabel={displayLabel}
              version={narrationVersion}
            />
            <StrengthsList strengths={strengths || []} />
            {explorationSuggestion && (
              <ExplorationSuggestion suggestion={explorationSuggestion} />
            )}
          </>
        )}
      </div>

      {sufficientData !== false && (
        <div className="dna-hero-stats-section" aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="dna-sr-only">Reading Statistics</h2>
          <DnaStatCards
            booksThisYear={stats.booksThisYear}
            avgRating={stats.avgRating}
            currentStreak={stats.currentStreak}
            totalBadges={stats.totalBadges}
          />
        </div>
      )}
    </header>
  );
}
