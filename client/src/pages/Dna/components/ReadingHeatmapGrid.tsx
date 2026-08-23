import { useState, useMemo } from 'react';
import { Calendar, Flame, BookCheck } from 'lucide-react';
import type { BookLog } from '@/lib/storage';

interface ReadingHeatmapGridProps {
  logs: BookLog[];
}

interface DayCell {
  date: string;
  count: number;
  level: number;
  formattedDate: string;
  dayOfWeek: number; // 0 = Mon, 6 = Sun
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ReadingHeatmapGrid({ logs }: ReadingHeatmapGridProps) {
  const [hoveredCell, setHoveredCell] = useState<DayCell | null>(null);

  // Build daily count map from logs
  const dailyCounts = useMemo(() => {
    const map: Record<string, number> = {};
    logs.forEach(log => {
      const d = log.dateRead || (log.createdAt ? log.createdAt.split('T')[0] : null);
      if (d) {
        map[d] = (map[d] || 0) + 1;
      }
    });
    return map;
  }, [logs]);

  // Generate 52 weeks (365 days) grid ending today
  const { weeks, monthLabels, totalYearCount, activeDaysCount } = useMemo(() => {
    const today = new Date();
    // End date is today
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Start date is exactly 52 weeks before today, aligned to start on Monday
    const startDate = new Date(endDate);
    const dayOffset = (endDate.getDay() + 6) % 7; // Convert Sun(0)..Sat(6) to Mon(0)..Sun(6)
    startDate.setDate(startDate.getDate() - (52 * 7) + (6 - dayOffset));

    const weeksArr: DayCell[][] = [];
    let currentWeek: DayCell[] = [];
    let totalCount = 0;
    let activeDays = 0;

    const monthsMap: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    const curr = new Date(startDate);
    let weekIdx = 0;

    while (curr <= endDate || currentWeek.length > 0) {
      const dateStr = curr.toISOString().split('T')[0];
      const count = dailyCounts[dateStr] || 0;
      totalCount += count;
      if (count > 0) activeDays++;

      const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count <= 4 ? 3 : 4;

      const formatted = curr.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const dayOfWeek = (curr.getDay() + 6) % 7;

      const cell: DayCell = {
        date: dateStr,
        count,
        level,
        formattedDate: formatted,
        dayOfWeek,
      };

      currentWeek.push(cell);

      // Track month labels at start of each month
      if (curr.getMonth() !== lastMonth && currentWeek.length === 1) {
        lastMonth = curr.getMonth();
        const mName = curr.toLocaleDateString(undefined, { month: 'short' });
        monthsMap.push({ label: mName, weekIndex: weekIdx });
      }

      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
        weekIdx++;
      }

      curr.setDate(curr.getDate() + 1);
      if (weeksArr.length >= 53) break;
    }

    if (currentWeek.length > 0) {
      weeksArr.push(currentWeek);
    }

    return {
      weeks: weeksArr,
      monthLabels: monthsMap,
      totalYearCount: totalCount,
      activeDaysCount: activeDays,
    };
  }, [dailyCounts]);

  return (
    <div className="lb-heatmap-card">
      {/* Header with Stats */}
      <div className="lb-heatmap-header">
        <div className="lb-heatmap-title-wrap">
          <Calendar size={16} className="lb-green-icon" />
          <h3 className="lb-heatmap-title">365-DAY READING ACTIVITY HEATMAP</h3>
        </div>

        <div className="lb-heatmap-meta-stats">
          <div className="lb-heatmap-meta-item">
            <BookCheck size={13} className="lb-green-icon" />
            <span><strong>{totalYearCount}</strong> books logged</span>
          </div>
          <div className="lb-heatmap-meta-item">
            <Flame size={13} style={{ color: '#22c55e' }} />
            <span><strong>{activeDaysCount}</strong> active reading days</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="lb-heatmap-scroll-wrap">
        <div className="lb-heatmap-inner-grid">
          {/* Top Month Labels */}
          <div className="lb-heatmap-months-row">
            <div className="lb-heatmap-day-label-space" />
            <div className="lb-heatmap-months-track">
              {monthLabels.map((m, idx) => (
                <span
                  key={idx}
                  className="lb-heatmap-month-label"
                  style={{ left: `${(m.weekIndex / weeks.length) * 100}%` }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          {/* Days Labels & Weekly Grid */}
          <div className="lb-heatmap-body-row">
            {/* All 7 Days of Week (Mon, Tue, Wed, Thu, Fri, Sat, Sun) */}
            <div className="lb-heatmap-days-col">
              {DAYS_OF_WEEK.map((d, idx) => (
                <span key={idx} className="lb-heatmap-day-label">{d}</span>
              ))}
            </div>

            {/* 52 Columns */}
            <div className="lb-heatmap-columns-wrap">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="lb-heatmap-week-col">
                  {week.map((cell, dIdx) => (
                    <div
                      key={dIdx}
                      className={`lb-heatmap-cell lb-cell-green-lvl-${cell.level}`}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${cell.count} ${cell.count === 1 ? 'book' : 'books'} on ${cell.formattedDate}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Tooltip & Green Legend */}
      <div className="lb-heatmap-footer">
        <div className="lb-heatmap-hover-info">
          {hoveredCell ? (
            <span className="lb-heatmap-tooltip-text lb-tooltip-green">
              <strong>{hoveredCell.count}</strong> {hoveredCell.count === 1 ? 'book logged' : 'books logged'} on{' '}
              {hoveredCell.formattedDate}
            </span>
          ) : (
            <span className="lb-heatmap-tooltip-muted">Hover over any day to inspect reading logs</span>
          )}
        </div>

        <div className="lb-heatmap-legend">
          <span className="lb-legend-text">Less</span>
          <div className="lb-heatmap-cell lb-cell-green-lvl-0" />
          <div className="lb-heatmap-cell lb-cell-green-lvl-1" />
          <div className="lb-heatmap-cell lb-cell-green-lvl-2" />
          <div className="lb-heatmap-cell lb-cell-green-lvl-3" />
          <div className="lb-heatmap-cell lb-cell-green-lvl-4" />
          <span className="lb-legend-text">More</span>
        </div>
      </div>
    </div>
  );
}
