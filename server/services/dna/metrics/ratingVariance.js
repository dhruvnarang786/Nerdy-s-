/**
 * Rating Variance — Incremental (Welford's online algorithm)
 * Formula: (σ / 1.58) × 100
 */
export function computeRatingVariance(accum) {
  const { mean = 0, M2 = 0, count = 0 } = accum || {};
  if (count < 2) return { score: null, accum };
  const variance = M2 / (count - 1);
  const std = Math.sqrt(variance);
  const maxStd = 1.58;
  const score = Math.round((Math.min(std, maxStd) / maxStd) * 100);
  return { score, accum };
}

export function applyRatingVarianceCreate(accum, rating) {
  const a = { ...(accum || { mean: 0, M2: 0, count: 0 }) };
  a.count++;
  const delta = rating - a.mean;
  a.mean += delta / a.count;
  const delta2 = rating - a.mean;
  a.M2 += delta * delta2;
  return a;
}

export function applyRatingVarianceDelete(accum, rating) {
  const a = { ...(accum || { mean: 0, M2: 0, count: 0 }) };
  if (a.count <= 0) return a;
  const oldMean = a.mean;
  a.count--;
  if (a.count === 0) {
    a.mean = 0;
    a.M2 = 0;
    return a;
  }
  const delta = rating - oldMean;
  const newMean = oldMean - delta / (a.count + 1);
  const delta2 = rating - newMean;
  a.M2 -= delta * delta2;
  a.mean = newMean;
  a.M2 = Math.max(0, a.M2);
  return a;
}
