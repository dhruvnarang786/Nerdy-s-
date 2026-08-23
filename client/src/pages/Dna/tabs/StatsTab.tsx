import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { BarChart2, Zap, Loader2 } from 'lucide-react';
import { useDnaStats } from '../hooks';
import { ReadingHeatmapGrid } from '../components/ReadingHeatmapGrid';
import { getCurrentUserLogs, type BookLog } from '@/lib/storage';
import { useState, useEffect } from 'react';
import type { DnaResponse } from '@/lib/dnaApi';

interface StatsTabProps {
  enabled: boolean;
}

function GenreRadarChart({ genres }: { genres?: { genre: string; affinity: number }[] }) {
  if (!genres || genres.length === 0) return null;

  const data = genres.slice(0, 6).map(g => ({
    name: g.genre,
    value: Math.round(g.affinity * 100),
  }));

  return (
    <div className="lb-sidebar-card">
      <div className="lb-sidebar-header">
        <h3 className="lb-sidebar-title">
          <BarChart2 size={14} className="lb-gold-icon" />
          GENRE AFFINITY RADAR
        </h3>
      </div>
      <div className="dna-radar-container" style={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
            <PolarGrid stroke="rgba(212, 175, 55, 0.18)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#a89f91', fontSize: 11 }} />
            <Radar name="Affinity" dataKey="value" stroke="#d4af37" fill="#d4af37" fillOpacity={0.25} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricDetailCards({ stats }: { stats?: DnaResponse['stats'] }) {
  if (!stats) return null;
  const items = [
    { label: 'Total Books Logged', value: stats.totalLogs, key: 'totalLogs', max: 50 },
    { label: 'Books Logged This Year', value: stats.booksThisYear, key: 'booksThisYear', max: 25 },
    { label: 'Average Book Rating', value: stats.avgRating, key: 'avgRating', max: 5 },
    { label: 'Current Streak (Days)', value: stats.currentStreak, key: 'currentStreak', max: 30 },
    { label: 'Best Streak Ever', value: stats.bestStreak, key: 'bestStreak', max: 60 },
    { label: 'Favorites Saved', value: stats.totalFavorites, key: 'totalFavorites', max: 20 },
  ];
  return (
    <div className="lb-sidebar-card">
      <div className="lb-sidebar-header">
        <h3 className="lb-sidebar-title">
          <Zap size={14} className="lb-gold-icon" />
          KEY METRICS
        </h3>
      </div>
      <div className="dna-metric-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {items.map(it => (
          <div key={it.key} className="dna-metric-row">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>{it.label}</span>
              <span style={{ color: '#d4af37', fontWeight: 700 }}>{it.value}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min((Number(it.value) / it.max) * 100, 100)}%`,
                  background: '#d4af37',
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsTab({ enabled }: StatsTabProps) {
  const { data: statsData, isLoading } = useDnaStats(enabled);
  const [logs, setLogs] = useState<BookLog[]>([]);

  useEffect(() => {
    if (!enabled) return;
    getCurrentUserLogs().then(setLogs).catch(console.error);
  }, [enabled]);

  if (isLoading) {
    return (
      <div className="dna-tab-loading">
        <Loader2 className="animate-spin inline mr-2" size={18} />
        Analyzing reading metrics and telemetry...
      </div>
    );
  }

  return (
    <div className="lb-tab-stats-container">
      {/* 1. 365-Day Green Contribution Heatmap */}
      <ReadingHeatmapGrid logs={logs} />

      {/* 2. Radar & Metrics Breakdown */}
      <div className="lb-stats-two-col">
        <GenreRadarChart genres={statsData?.genres} />
        <MetricDetailCards stats={statsData?.stats} />
      </div>
    </div>
  );
}
