interface RatingVarianceAccum {
    mean: number;
    M2: number;
    count: number;
}
export declare function computeRatingVariance(accum: RatingVarianceAccum): {
    score: number | null;
    accum: RatingVarianceAccum;
};
export declare function applyRatingVarianceCreate(accum: RatingVarianceAccum | undefined, rating: number): RatingVarianceAccum;
export declare function applyRatingVarianceDelete(accum: RatingVarianceAccum | undefined, rating: number): RatingVarianceAccum;
export {};
//# sourceMappingURL=ratingVariance.d.ts.map