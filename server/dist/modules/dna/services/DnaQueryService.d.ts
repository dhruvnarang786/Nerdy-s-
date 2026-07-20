interface SnapshotResult {
    exists: boolean;
    stale?: boolean;
    snapshot?: Record<string, unknown>;
    stats?: Record<string, unknown>;
    personality?: Record<string, unknown>;
    archetype?: string | null;
    archetypeLabel?: string | null;
    confidence?: number | null;
    explanation?: Record<string, unknown> | null;
    narration?: Record<string, unknown> | null;
    narrative?: string | null;
    metrics?: Record<string, unknown>;
    heatmap?: unknown;
    trends?: Record<string, unknown>;
    badgeSummary?: Record<string, unknown>;
    genreSummary?: Record<string, unknown>;
    badges?: Record<string, unknown>[];
    genres?: Record<string, unknown>[];
}
export declare class DnaQueryService {
    getSnapshot(userId: number, fields?: string[]): Promise<SnapshotResult>;
    compare(userId: number, friendUserId: number): Promise<Record<string, unknown> | null>;
    private _extractComparisonData;
}
export {};
//# sourceMappingURL=DnaQueryService.d.ts.map