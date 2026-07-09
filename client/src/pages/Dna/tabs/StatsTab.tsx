import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, AreaChart, Area, XAxis } from 'recharts';
import { useDnaStats } from '../hooks';
import type { DnaResponse } from '@/lib/dnaApi';

interface StatsTabProps {
  enabled: boolean;
}

function ReadingHeatmap({ year, months }: { year: number; months: number[] }) {
  return (
    <div className="dna-card">
      <h3 className="dna-card-title">Reading Heatmap ({year})</h3>
      <div className="dna-heatmap-month-labels">
        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
          <div key={m} className="dna-heatmap-label">{m}</div>
        ))}
      </div>
      <div className="dna-heatmap-grid">
        {(months || Array(12).fill(0)).map((count: number, i: number) => {
          const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : 3;
          return (
            <div
              key={i}
              className={`dna-heatmap-cell dna-heatmap-lvl-${level}`}
              title={`${count} books`}
              role="img"
              aria-label={`${count} books in month ${i + 1}`}
            >
              {count > 0 && <span className="dna-heatmap-count">{count}</span>}
            </div>
          );
        })}
      </div>
      <div className="dna-heatmap-legend">
        <span>Less</span>
        {[0, 1, 2, 3].map(l => (
          <div key={l} className={`dna-heatmap-cell dna-heatmap-lvl-${l}`} style={{ width: 16, height: 16 }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function MetricsRadar({ genres }: { genres?: DnaResponse['genres'] }) {
  if (!genres || genres.length === 0) {
    return (
      <div className="dna-card">
        <h3 className="dna-card-title">Genre Radar</h3>
        <p className="dna-empty-text">Log more books to see genre data</p>
      </div>
    );
  }
  const data = genres.map(g => ({ name: g.genre, value: Math.round(g.affinity * 100) }));
  return (
    <div className="dna-card">
      <h3 className="dna-card-title">Genre Radar</h3>
      <div className="dna-radar-container" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
            <Radar name="Affinity" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function MetricDetailCards({ stats }: { stats?: DnaResponse['stats'] }) {
  if (!stats) return null;
  const items = [
    { label: 'Total Logs', value: stats.totalLogs, key: 'totalLogs' },
    { label: 'Books This Year', value: stats.booksThisYear, key: 'booksThisYear' },
    { label: 'Avg Rating', value: stats.avgRating, key: 'avgRating' },
    { label: 'Current Streak', value: stats.currentStreak, key: 'currentStreak' },
    { label: 'Best Streak', value: stats.bestStreak, key: 'bestStreak' },
    { label: 'Favorites', value: stats.totalFavorites, key: 'totalFavorites' },
  ];
  return (
    <div className="dna-card">
      <h3 className="dna-card-title">All Metrics</h3>
      <div className="dna-metrics-detail-grid">
        {items.filter(i => i.value !== undefined).map(item => (
          <div key={item.key} className="dna-metric-detail">
            <div className="dna-metric-detail-header">
              <span className="dna-metric-detail-label">{item.label}</span>
              <span className="dna-metric-detail-score">{typeof item.value === 'number' ? (Number.isInteger(item.value) ? item.value : item.value.toFixed(1)) : item.value}</span>
            </div>
            <div className="dna-metric-detail-track">
              <div className="dna-metric-detail-fill" style={{ width: `${Math.min((item.value as number) / (item.key === 'avgRating' ? 5 : 100) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsTab({ enabled }: StatsTabProps) {
  const { data, isLoading } = useDnaStats(enabled);

  if (isLoading) {
    return <div className="dna-tab-loading" role="status" aria-label="Loading stats">Loading statistics...</div>;
  }

  const stats = data?.stats;
  const genres = data?.genres || [];
  const heatmap = data?.heatmap || { year: new Date().getFullYear(), months: [] };

  return (
    <div className="dna-stats-grid">
      <ReadingHeatmap year={heatmap.year} months={heatmap.months} />
      <MetricsRadar genres={genres.length > 0 ? genres : undefined} />
      <MetricDetailCards stats={stats} />
    </div>
  );
}
