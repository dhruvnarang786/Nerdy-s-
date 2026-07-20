let globalMeanRating = 3.0;
export function setGlobalMeanRating(mean) {
    globalMeanRating = mean;
}
export function computeRatingGenerosity(accum) {
    const { sumRating = 0, countRating = 0 } = accum || {};
    if (countRating < 5)
        return { score: null, accum };
    const userMean = sumRating / countRating;
    const deviation = userMean - globalMeanRating;
    const raw = 50 + deviation * 20;
    return { score: Math.round(Math.max(0, Math.min(100, raw))), accum };
}
export function applyRatingDelta(accum, log, isCreate) {
    const a = { ...(accum || { sumRating: 0, countRating: 0 }) };
    const rating = log.rating || 0;
    if (isCreate) {
        a.sumRating += rating;
        a.countRating++;
    }
    else {
        a.sumRating = Math.max(0, a.sumRating - rating);
        a.countRating = Math.max(0, a.countRating - 1);
    }
    return a;
}
//# sourceMappingURL=ratingGenerosity.js.map