interface ReviewDepthAccum {
    sumWordCount: number;
    countReviews: number;
}
declare function wordCount(text: string | null | undefined): number;
export { wordCount };
export declare function computeReviewDepth(accum: ReviewDepthAccum): {
    score: number;
    accum: ReviewDepthAccum;
};
export declare function applyReviewDepthDelta(accum: ReviewDepthAccum | undefined, log: {
    notes?: string | null;
}, isCreate: boolean): ReviewDepthAccum;
//# sourceMappingURL=reviewDepth.d.ts.map