import { Flame, Star, BookOpen, Award } from 'lucide-react';
import CountUp from 'react-countup';

interface DnaStatCardsProps {
  booksThisYear: number;
  avgRating: number;
  currentStreak: number;
  totalBadges: number;
}

export function DnaStatCards({ booksThisYear, avgRating, currentStreak, totalBadges }: DnaStatCardsProps) {
  const cards = [
    {
      icon: BookOpen,
      value: booksThisYear,
      label: 'Books Logged This Year',
      color: 'var(--primary)',
      glow: 'rgba(212, 175, 55, 0.25)',
      decimals: 0,
    },
    {
      icon: Star,
      value: typeof avgRating === 'number' ? parseFloat(avgRating.toFixed(1)) : 0,
      label: 'Average Rating',
      color: '#eab308',
      glow: 'rgba(234, 179, 8, 0.25)',
      decimals: 1,
    },
    {
      icon: Flame,
      value: currentStreak,
      label: 'Current Reading Streak',
      color: '#f97316',
      glow: 'rgba(249, 115, 34, 0.25)',
      pulsing: currentStreak > 0,
      decimals: 0,
    },
    {
      icon: Award,
      value: totalBadges,
      label: 'Trophies Unlocked',
      color: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.25)',
      decimals: 0,
    },
  ];

  return (
    <div className="dna-stat-cards-row">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`dna-stat-card-compact ${card.pulsing ? 'dna-pulse-glow' : ''}`}
          style={{ '--stat-glow': card.glow } as React.CSSProperties}
        >
          <div className="dna-stat-icon-wrapper">
            <card.icon size={20} color={card.color} />
          </div>
          <div className="dna-stat-details">
            <span className="dna-stat-number">
              <CountUp end={card.value} decimals={card.decimals} duration={1.5} separator="," />
            </span>
            <span className="dna-stat-label-compact">{card.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
