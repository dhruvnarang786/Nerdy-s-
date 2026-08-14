export declare class DnaEventService {
    private dnaComputeService;
    private pendingRecomputes;
    constructor(dnaComputeService: {
        incrementalRecompute: (userId: number, event: Record<string, unknown>) => Promise<{
            version: number | null;
            newBadges: string[];
        }>;
        badgeOnlyRecompute: (userId: number, event: Record<string, unknown>) => Promise<void>;
    });
    private registerHandlers;
    private scheduleRecompute;
}
//# sourceMappingURL=DnaEventService.d.ts.map