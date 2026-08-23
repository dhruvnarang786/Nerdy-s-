/**
 * Genre Diversity — Full recompute
 * Formula: (1 - HHI) × 100, clamp at 95 → linear map to 0–100
 * HHI = Σ(genreRatio_i²)
 * Each book maps to one genre (stored as string tag).
 */

export function computeGenreDiversity(logs) {
  if (!logs || logs.length === 0) return 0;
  if (logs.length === 1) return 0; // no diversity with one log

  const genreCounts = {};
  let totalWithGenre = 0;

  for (const log of logs) {
    const genre = log.genre;
    if (!genre) continue;
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    totalWithGenre++;
  }

  if (totalWithGenre <= 1) return 0;

  let hhi = 0;
  for (const count of Object.values(genreCounts)) {
    const ratio = count / totalWithGenre;
    hhi += ratio * ratio;
  }

  const raw = (1 - hhi) * 100;
  const clamped = Math.min(raw, 95);
  const score = Math.round((clamped / 95) * 100);
  return score;
}
