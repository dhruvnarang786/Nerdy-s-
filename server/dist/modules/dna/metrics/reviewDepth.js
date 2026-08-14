function wordCount(text) {
    if (!text || typeof text !== 'string')
        return 0;
    const trimmed = text.trim();
    if (trimmed.length === 0)
        return 0;
    const words = trimmed.split(/\s+/);
    const alphaWords = words.filter(w => /[a-zA-Z0-9]/.test(w));
    return alphaWords.length;
}
export { wordCount };
export function computeReviewDepth(accum) {
    const { sumWordCount = 0, countReviews = 0 } = accum || {};
    if (countReviews === 0)
        return { score: 0, accum };
    const avg = sumWordCount / countReviews;
    const score = Math.round(Math.min(avg / 100, 1) * 100);
    return { score, accum };
}
export function applyReviewDepthDelta(accum, log, isCreate) {
    const a = { ...(accum || { sumWordCount: 0, countReviews: 0 }) };
    const wc = wordCount(log.notes);
    if (isCreate) {
        if (wc > 0) {
            a.sumWordCount += wc;
            a.countReviews++;
        }
    }
    else {
        if (wc > 0) {
            a.sumWordCount = Math.max(0, a.sumWordCount - wc);
            a.countReviews = Math.max(0, a.countReviews - 1);
        }
    }
    return a;
}
//# sourceMappingURL=reviewDepth.js.map