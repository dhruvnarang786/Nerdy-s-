interface RatingGenerosityAccum {
    sumRating: number;
    countRating: number;
}
export declare function setGlobalMeanRating(mean: number): void;
export declare function computeRatingGenerosity(accum: RatingGenerosityAccum): {
    score: number | null;
    accum: RatingGenerosityAccum;
};
export declare function applyRatingDelta(accum: RatingGenerosityAccum | undefined, log: {
    rating?: number | null;
}, isCreate: boolean): RatingGenerosityAccum;
export {};
//# sourceMappingURL=ratingGenerosity.d.ts.map