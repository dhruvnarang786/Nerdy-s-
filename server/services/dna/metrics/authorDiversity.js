/**
 * Author Diversity — Incremental
 * Formula: min(uniqueAuthors / logCount × 100 × dampener, 100)
 * dampener = logCount / (logCount + 2)
 */
export function computeAuthorDiversity(accum) {
  const { uniqueAuthors = 0, totalLogs = 0 } = accum || {};
  if (totalLogs === 0) return { score: 0, accum };
  const dampener = totalLogs / (totalLogs + 2);
  const raw = (uniqueAuthors / totalLogs) * 100 * dampener;
  return { score: Math.round(Math.min(raw, 100)), accum };
}

export function applyAuthorDelta(accum, log, isCreate) {
  const a = { ...(accum || { uniqueAuthors: 0, totalLogs: 0, authorLogMap: {} }) };
  const author = (log.author || '').trim().toLowerCase();
  if (isCreate) {
    a.totalLogs++;
    if (!a.authorLogMap[author]) {
      a.authorLogMap[author] = 0;
      a.uniqueAuthors++;
    }
    a.authorLogMap[author]++;
  } else {
    a.totalLogs = Math.max(0, a.totalLogs - 1);
    if (a.authorLogMap[author]) {
      a.authorLogMap[author]--;
      if (a.authorLogMap[author] <= 0) {
        delete a.authorLogMap[author];
        a.uniqueAuthors = Math.max(0, a.uniqueAuthors - 1);
      }
    }
  }
  return a;
}
