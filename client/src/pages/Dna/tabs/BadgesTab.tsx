import { useState } from 'react';
import { Zap, Lock, Check } from 'lucide-react';
import { useDnaBadges } from '../hooks';
import { DnaEmptyState } from '../DnaEmptyState';
import type { DnaResponse } from '@/lib/dnaApi';

interface BadgesTabProps {
  enabled: boolean;
}

const FAMILIES = ['all', 'exploration', 'reviewer', 'discovery', 'dedication', 'genre', 'personality', 'hidden'];

const FAMILY_COLORS: Record<string, string> = {
  exploration: '#f43f5e',
  reviewer: '#0ea5e9',
  discovery: '#8b5cf6',
  dedication: '#4ade80',
  genre: '#f59e0b',
  personality: '#6366f1',
  hidden: '#f97316',
};

function BadgeCard({ badge }: { badge: NonNullable<DnaResponse['badges']>['items'][number] }) {
  const color = FAMILY_COLORS[badge.family] || '#64748b';
  return (
    <div
      className={`dna-badge-card ${badge.unlocked ? 'unlocked' : ''}`}
      style={{ '--badge-color': color } as React.CSSProperties}
    >
      <div className="dna-badge-icon-wrap" style={{ background: badge.unlocked ? `${color}25` : 'rgba(255,255,255,0.05)' }}>
        <Zap size={24} color={badge.unlocked ? color : '#475569'} />
        {badge.unlocked ? (
          <span className="dna-badge-check"><Check size={10} /></span>
        ) : (
          <span className="dna-badge-lock-icon"><Lock size={10} /></span>
        )}
      </div>
      <div className="dna-badge-info">
        <span className="dna-badge-name">{badge.label || badge.id.replace(/_/g, ' ')}</span>
        <span className="dna-badge-tier">{badge.tier}</span>
        {!badge.unlocked && badge.progressLabel && (
          <span className="dna-badge-progress-text">{badge.progressLabel}</span>
        )}
      </div>
      {badge.unlocked && (
        <div className="dna-badge-glow" style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)` }} />
      )}
    </div>
  );
}

export function BadgesTab({ enabled }: BadgesTabProps) {
  const [familyFilter, setFamilyFilter] = useState('all');
  const { data, isLoading, error } = useDnaBadges(enabled);

  if (isLoading) {
    return <div className="dna-tab-loading" role="status" aria-label="Loading badges">Loading badges...</div>;
  }

  if (error) {
    return <p className="dna-empty-text">Failed to load badges</p>;
  }

  const badges = data?.badges?.items || [];
  const filtered = familyFilter === 'all' ? badges : badges.filter(b => b.family === familyFilter);
  const unlockedCount = badges.filter(b => b.unlocked).length;

  if (badges.length === 0) {
    return <DnaEmptyState.NoBadgesYet />;
  }

  return (
    <div className="dna-badges-tab">
      <div className="dna-badges-header">
        <h3 className="dna-card-title">Badges</h3>
        <span className="dna-badges-count">{unlockedCount} / {badges.length} Earned</span>
      </div>

      <div className="dna-badge-filters" role="tablist" aria-label="Filter badges by family">
        {FAMILIES.map(f => (
          <button
            key={f}
            className={`dna-badge-filter ${familyFilter === f ? 'active' : ''}`}
            role="tab"
            aria-selected={familyFilter === f}
            onClick={() => setFamilyFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="dna-badge-gallery">
        {filtered.map(b => (
          <BadgeCard key={b.id} badge={b} />
        ))}
        {filtered.length === 0 && (
          <p className="dna-empty-text">No badges in this category</p>
        )}
      </div>
    </div>
  );
}
