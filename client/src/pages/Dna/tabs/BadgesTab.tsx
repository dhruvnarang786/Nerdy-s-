import { useState } from 'react';
import { Award, Lock, Check } from 'lucide-react';
import { useDnaBadges } from '../hooks';
import { DnaEmptyState } from '../DnaEmptyState';
import type { DnaResponse } from '@/lib/dnaApi';

interface BadgesTabProps {
  enabled: boolean;
}

const FAMILIES = ['all', 'exploration', 'reviewer', 'discovery', 'dedication', 'genre', 'personality', 'hidden'];

const METALLIC_FAMILY_COLORS: Record<string, string> = {
  exploration: '#d97706', // Amber Bronze
  reviewer: '#d4af37',    // Antique Gold
  discovery: '#8b5cf6',   // Amethyst
  dedication: '#10b981',  // Library Emerald
  genre: '#eab308',       // Parchment Gold
  personality: '#6366f1', // Sapphire Indigo
  hidden: '#f43f5e',      // Crimson Garnet
};

function BadgeCard({ badge }: { badge: NonNullable<DnaResponse['badges']>['items'][number] }) {
  const color = METALLIC_FAMILY_COLORS[badge.family] || '#d4af37';
  return (
    <div
      className={`dna-badge-card dna-card ${badge.unlocked ? 'unlocked' : ''}`}
      style={{ '--badge-color': color } as React.CSSProperties}
    >
      <div className="dna-badge-icon-wrap" style={{ background: badge.unlocked ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)' }}>
        <Award size={24} color={badge.unlocked ? color : 'var(--muted-foreground)'} />
        {badge.unlocked ? (
          <span className="dna-badge-check"><Check size={10} /></span>
        ) : (
          <span className="dna-badge-lock-icon"><Lock size={10} /></span>
        )}
      </div>
      <div className="dna-badge-info">
        <span className="dna-badge-name">{badge.label || badge.id.replace(/_/g, ' ')}</span>
        <span className="dna-badge-tier">{badge.tier} Tier</span>
        {!badge.unlocked && badge.progressLabel && (
          <span className="dna-badge-progress-text">{badge.progressLabel}</span>
        )}
      </div>
    </div>
  );
}

export function BadgesTab({ enabled }: BadgesTabProps) {
  const { data, isLoading } = useDnaBadges(enabled);
  const [selectedFamily, setSelectedFamily] = useState('all');

  const badges = data?.badges?.items || [];
  const filteredBadges = selectedFamily === 'all'
    ? badges
    : badges.filter(b => b.family === selectedFamily);

  if (!isLoading && badges.length === 0) {
    return <DnaEmptyState.NoBadgesYet />;
  }

  return (
    <div className="dna-badges-panel">
      {/* Family Filters */}
      <div className="lb-books-toolbar">
        <div className="lb-books-count-label">
          <Award size={16} className="lb-gold-icon" />
          <span>{badges.filter(b => b.unlocked).length} of {badges.length} Badges Unlocked</span>
        </div>

        <div className="lb-rating-filter-pills">
          {FAMILIES.map(family => (
            <button
              key={family}
              className={`lb-filter-pill ${selectedFamily === family ? 'active' : ''}`}
              onClick={() => setSelectedFamily(family)}
            >
              {family.charAt(0).toUpperCase() + family.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="dna-badge-grid">
        {filteredBadges.map(badge => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
}
