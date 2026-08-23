/**
 * Activity Consistency — Incremental
 * Formula: 100 × (1 - min(CV, 1)) where CV = σ(weekly) / μ(weekly)
 */

function getISOWeek(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + yearStart.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

export { getISOWeek };

export function computeActivityConsistency(accum) {
  const { weeklyBuckets = {} } = accum || {};
  const counts = Object.values(weeklyBuckets);
  if (counts.length < 2) return { score: null, accum };
  const n = counts.length;
  const mean = counts.reduce((s, v) => s + v, 0) / n;
  if (mean === 0) return { score: 0, accum };
  const variance = counts.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const cv = std / mean;
  const score = Math.round((1 - Math.min(cv, 1)) * 100);
  return { score, accum };
}

export function applyActivityDelta(accum, log, isCreate) {
  const a = { ...(accum || { weeklyBuckets: {} }) };
  const week = getISOWeek(log.dateRead || log.createdAt);
  if (!week) return a;
  const buckets = { ...a.weeklyBuckets };
  if (isCreate) {
    buckets[week] = (buckets[week] || 0) + 1;
  } else {
    buckets[week] = Math.max(0, (buckets[week] || 1) - 1);
    if (buckets[week] <= 0) delete buckets[week];
  }
  a.weeklyBuckets = buckets;
  return a;
}
