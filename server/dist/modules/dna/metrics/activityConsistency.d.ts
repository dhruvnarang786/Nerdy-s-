interface ActivityAccum {
    weeklyBuckets: Record<string, number>;
}
declare function getISOWeek(dateStr: string | Date | null | undefined): string | null;
export { getISOWeek };
export declare function computeActivityConsistency(accum: ActivityAccum): {
    score: number | null;
    accum: ActivityAccum;
};
export declare function applyActivityDelta(accum: ActivityAccum | undefined, log: {
    dateRead?: string | Date | null;
    createdAt?: string | Date | null;
}, isCreate: boolean): ActivityAccum;
//# sourceMappingURL=activityConsistency.d.ts.map