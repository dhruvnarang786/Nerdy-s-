import { useState } from 'react';
import { useDnaProfile, useDnaStats, useDnaEvents } from '../hooks';
import type { DnaResponse } from '@/lib/dnaApi';
import { Sparkles } from 'lucide-react';

interface OverviewTabProps {
  enabled: boolean;
}

function PersonalityBreakdown({ personality, narration }: {
  personality?: DnaResponse['personality'];
  narration?: DnaResponse['narration'];
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!personality?.primaryLabel) return null;

  const topContributors = personality.topContributors;
  const totalContribution = topContributors?.reduce((s, c) => s + c.contribution, 0) || 1;

  return (
    <div className="dna-card dna-personality-breakdown">
      <h3 className="dna-card-title">Personality Breakdown</h3>
      <div className="dna-breakdown-header">
        <span className="dna-breakdown-archetype">{personality.primaryLabel}</span>
        {personality.confidence !== undefined && (
          <span className="dna-breakdown-confidence">
            {personality.confidenceLabel || (personality.confidence >= 0.7 ? 'Strong' : personality.confidence >= 0.4 ? 'Moderate' : 'Lean')} confidence
          </span>
        )}
        {personality.secondaryLabel && (
          <span className="dna-breakdown-confidence" style={{ background: 'color-mix(in srgb, var(--dna-accent) 8%, var(--card))', color: 'var(--muted-foreground)' }}>
            Also: {personality.secondaryLabel}
          </span>
        )}
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

      {narration?.explanation && (
        <div style={{ marginTop: '1rem' }}>
          <button
            className="dna-btn-ghost"
            onClick={() => setShowExplanation(!showExplanation)}
            aria-expanded={showExplanation}
          >
            <Sparkles size={14} />
            {showExplanation ? 'Hide explanation' : 'Why this personality?'}
          </button>
          {showExplanation && (
            <div className="dna-card" style={{ marginTop: '0.5rem', padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              {narration.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GenreSummaryCard({ genres }: { genres?: { genre: string; affinity: number; count: number }[] }) {
  if (!genres || genres.length === 0) return null;
  const top = genres.slice(0, 5);
  return (
    <div className="dna-card dna-genre-summary">
      <h3 className="dna-card-title">Top Genres</h3>
      <div className="dna-genre-list">
        {top.map((g, i) => (
          <div key={i} className="dna-genre-row">
            <span className="dna-genre-name">{g.genre}</span>
            <div className="dna-genre-track">
              <div className="dna-genre-fill" style={{ width: `${g.affinity * 100}%` }} />
            </div>
            <span className="dna-genre-count">{g.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity({ events }: { events?: { type: string; payload: unknown; timestamp: string }[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="dna-card">
        <h3 className="dna-card-title">Recent Activity</h3>
        <p className="dna-empty-text">No recent activity</p>
      </div>
    );
  }
  const recent = events.slice(0, 5);
  return (
    <div className="dna-card">
      <h3 className="dna-card-title">Recent Activity</h3>
      <div className="dna-activity-list">
        {recent.map((e, i) => {
          const labels: Record<string, string> = {
            'log.created': 'Logged a book',
            'log.deleted': 'Removed a log',
            'favorite.added': 'Added a favorite',
            'favorite.removed': 'Removed a favorite',
          };
          return (
            <div key={i} className="dna-activity-item">
              <span className="dna-activity-dot" />
              <span className="dna-activity-type">{labels[e.type] || e.type}</span>
              <span className="dna-activity-time">{new Date(e.timestamp).toLocaleDateString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StrengthsCard({ strengths }: { strengths?: string[] }) {
  if (!strengths || strengths.length === 0) return null;
  return (
    <div className="dna-card">
      <h3 className="dna-card-title">Your Reading Strengths</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {strengths.map((s, i) => (
          <div key={i} className="dna-narration-strength-item" style={{ borderLeftColor: 'var(--dna-accent)' }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverviewTab({ enabled }: OverviewTabProps) {
  const { data: profileData, isLoading: profileLoading } = useDnaProfile();
  const { data: statsData, isLoading: statsLoading } = useDnaStats(enabled);
  const { data: eventsData } = useDnaEvents(1);

  if (profileLoading || statsLoading) {
    return <div className="dna-tab-loading" role="status" aria-label="Loading overview">Loading overview...</div>;
  }

  const personality = profileData?.personality;
  const narration = profileData?.narration;
  const stats = statsData?.stats || statsData || {};
  const genres = statsData?.genres || [];
  const events = eventsData?.events || [];

  return (
    <div className="dna-overview-grid">
      <PersonalityBreakdown personality={personality} narration={narration} />
      <StrengthsCard strengths={narration?.strengths || undefined} />
      <GenreSummaryCard genres={genres.length > 0 ? genres : undefined} />
      <RecentActivity events={events} />
      <div className="dna-card dna-metrics-mini">
        <h3 className="dna-card-title">Quick Stats</h3>
        <div className="dna-metrics-grid-mini">
          <div className="dna-metric-mini">
            <span className="dna-metric-mini-value">{stats.totalLogs || 0}</span>
            <span className="dna-metric-mini-label">Total Logs</span>
          </div>
          <div className="dna-metric-mini">
            <span className="dna-metric-mini-value">{stats.booksThisYear || 0}</span>
            <span className="dna-metric-mini-label">This Year</span>
          </div>
          <div className="dna-metric-mini">
            <span className="dna-metric-mini-value">{typeof stats.avgRating === 'number' ? stats.avgRating.toFixed(1) : '—'}</span>
            <span className="dna-metric-mini-label">Avg Rating</span>
          </div>
          <div className="dna-metric-mini">
            <span className="dna-metric-mini-value">{stats.currentStreak || 0}</span>
            <span className="dna-metric-mini-label">Streak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
