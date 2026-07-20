interface DiscoveryAccum {
    obscureCount: number;
}
export declare function computeDiscoveryScore(accum: DiscoveryAccum, totalLogs: number): {
    score: number | null;
    accum: DiscoveryAccum;
};
export declare function applyDiscoveryDelta(accum: DiscoveryAccum | undefined, _log: unknown, isCreate: boolean, isObscure: boolean): DiscoveryAccum;
export {};
//# sourceMappingURL=discoveryScore.d.ts.map