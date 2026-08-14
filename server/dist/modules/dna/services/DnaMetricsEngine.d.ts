export interface DnaEvent {
    eventType: string;
    log?: Record<string, unknown>;
    previous?: Record<string, unknown> | null;
    current?: Record<string, unknown> | null;
}
export interface MetricAccum {
    authorDiversity?: Record<string, unknown>;
    ratingGenerosity?: Record<string, unknown>;
    ratingVariance?: Record<string, unknown>;
    reviewDepth?: Record<string, unknown>;
    reviewFrequency?: Record<string, unknown>;
    activityConsistency?: Record<string, unknown>;
    discoveryScore?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface MetricsResult {
    genreDiversity: number | null;
    authorDiversity: number;
    countryDiversity: number | null;
    ratingGenerosity: number | null;
    ratingVariance: number | null;
    reviewDepth: number;
    reviewFrequency: number;
    discoveryScore: number | null;
    activityConsistency: number | null;
    totalLogs: number;
    _accum: MetricAccum;
}
export declare class DnaMetricsEngine {
    applyDelta(accum: MetricAccum | null | undefined, event: DnaEvent): MetricAccum;
    computeAll(accum: MetricAccum | null | undefined, logs: Record<string, unknown>[] | null, options?: {
        authorCountryMap?: Record<string, string>;
        globalMeanRating?: number;
    }): MetricsResult;
    fullRecomputeFromLogs(logs: Record<string, unknown>[], _authorCountryMap: Record<string, string>, _globalMeanRating: number): Promise<MetricsResult>;
}
//# sourceMappingURL=DnaMetricsEngine.d.ts.map