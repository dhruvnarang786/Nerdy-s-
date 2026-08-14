interface ReviewFrequencyAccum {
    logsWithNotes: number;
    totalLogs: number;
}
export declare function computeReviewFrequency(accum: ReviewFrequencyAccum): {
    score: number;
    accum: ReviewFrequencyAccum;
};
export declare function applyReviewFrequencyDelta(accum: ReviewFrequencyAccum | undefined, log: {
    notes?: string | null;
}, isCreate: boolean): ReviewFrequencyAccum;
export {};
//# sourceMappingURL=reviewFrequency.d.ts.map