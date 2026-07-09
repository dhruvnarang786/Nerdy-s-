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
      label: 'Books This Year',
      color: '#4ade80',
      glow: 'rgba(74,222,128,0.35)',
    },
    {
      icon: Star,
      value: typeof avgRating === 'number' ? parseFloat(avgRating.toFixed(1)) : 0,
      label: 'Avg Rating',
      color: '#f59e0b',
      glow: 'rgba(245,158,11,0.35)',
    },
    {
      icon: Flame,
      value: currentStreak,
      label: 'Day Streak',
      color: '#f97316',
      glow: 'rgba(249,115,22,0.35)',
      pulsing: currentStreak > 0,
    },
    {
      icon: Award,
      value: totalBadges,
      label: 'Badges',
      color: '#8b5cf6',
      glow: 'rgba(139,92,246,0.35)',
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
          <card.icon size={20} color={card.color} />
          <span className="dna-stat-number">
            <CountUp end={card.value} duration={2} separator="," />
          </span>
          <span className="dna-stat-label-compact">{card.label}</span>
        </div>
      ))}
    </div>
  );
}
