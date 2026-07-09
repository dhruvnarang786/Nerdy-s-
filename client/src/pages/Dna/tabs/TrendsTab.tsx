import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useDnaTrends } from '../hooks';

interface TrendsTabProps {
  enabled: boolean;
}

function MomentumIndicator({ momentum }: { momentum?: string }) {
  if (!momentum) return null;

  const config: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    accelerating: { icon: <TrendingUp size={24} />, color: '#4ade80', label: 'Accelerating' },
    stable: { icon: <Minus size={24} />, color: '#f59e0b', label: 'Stable' },
    declining: { icon: <TrendingDown size={24} />, color: '#f43f5e', label: 'Declining' },
  };

  const c = config[momentum] || config.stable;

  return (
    <div className="dna-momentum-card" style={{ borderColor: c.color }}>
      <div className="dna-momentum-icon" style={{ color: c.color }}>{c.icon}</div>
      <div className="dna-momentum-info">
        <span className="dna-momentum-label">Momentum</span>
        <span className="dna-momentum-value" style={{ color: c.color }}>{c.label}</span>
      </div>
    </div>
  );
}

function VelocityChart({ velocity }: { velocity?: number }) {
  const data = [
    { week: 'W-3', count: Math.max(0, (velocity || 0) * 0.7) },
    { week: 'W-2', count: Math.max(0, (velocity || 0) * 0.9) },
    { week: 'W-1', count: Math.max(0, (velocity || 0) * 1.1) },
    { week: 'This', count: Math.max(0, velocity || 0) },
  ];

  return (
    <div className="dna-card">
      <h3 className="dna-card-title">Reading Velocity</h3>
      <div className="dna-velocity-value">{velocity?.toFixed(1) || '—'} <span className="dna-velocity-unit">books/week</span></div>
      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#velocityGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WeeklyChart({ weeklyCounts }: { weeklyCounts?: { week: string; count: number }[] }) {
  if (!weeklyCounts || weeklyCounts.length === 0) return null;

  return (
    <div className="dna-card">
      <h3 className="dna-card-title">Weekly Activity</h3>
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyCounts} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="weeklyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Area type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} fill="url(#weeklyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TrendsTab({ enabled }: TrendsTabProps) {
  const { data, isLoading } = useDnaTrends(enabled);

  if (isLoading) {
    return <div className="dna-tab-loading" role="status" aria-label="Loading trends">Loading trends...</div>;
  }

  const trends = data?.trends;
  const velocity = trends?.velocity;
  const momentum = trends?.momentum;
  const weeklyCounts = trends?.weeklyCounts;

  return (
    <div className="dna-trends-grid">
      <VelocityChart velocity={velocity} />
      <MomentumIndicator momentum={momentum} />
      <WeeklyChart weeklyCounts={weeklyCounts} />
    </div>
  );
}
