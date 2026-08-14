import { wordCount } from './reviewDepth.js';
export function computeReviewFrequency(accum) {
    const { logsWithNotes = 0, totalLogs = 0 } = accum || {};
    if (totalLogs === 0)
        return { score: 0, accum };
    const score = Math.round((logsWithNotes / totalLogs) * 100);
    return { score, accum };
}
export function applyReviewFrequencyDelta(accum, log, isCreate) {
    const a = { ...(accum || { logsWithNotes: 0, totalLogs: 0 }) };
    const hasNotes = wordCount(log.notes) > 0;
    if (isCreate) {
        a.totalLogs++;
        if (hasNotes)
            a.logsWithNotes++;
    }
    else {
        a.totalLogs = Math.max(0, a.totalLogs - 1);
        if (hasNotes)
            a.logsWithNotes = Math.max(0, a.logsWithNotes - 1);
    }
    return a;
}
//# sourceMappingURL=reviewFrequency.js.map