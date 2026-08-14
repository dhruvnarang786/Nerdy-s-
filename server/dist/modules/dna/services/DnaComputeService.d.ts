import { DnaMetricsEngine } from './DnaMetricsEngine.js';
import { DnaPersonalityEngine } from './DnaPersonalityEngine.js';
import { DnaBadgeEngine } from './DnaBadgeEngine.js';
import { DnaNarrationEngine } from './DnaNarrationEngine.js';
export declare class DnaComputeService {
    metricsEngine: DnaMetricsEngine;
    personalityEngine: DnaPersonalityEngine;
    badgeEngine: DnaBadgeEngine;
    narrationEngine: DnaNarrationEngine;
    fullRecompute(userId: number): Promise<{
        version: number;
        newBadges: string[];
    }>;
    incrementalRecompute(userId: number, event: Record<string, unknown>): Promise<{
        version: number | null;
        newBadges: string[];
    }>;
    badgeOnlyRecompute(userId: number, _event: Record<string, unknown>): Promise<void>;
    private _computeStreak;
    private _computeHeatmap;
    private _computeGenreSummary;
    private _getBadgeXp;
}
//# sourceMappingURL=DnaComputeService.d.ts.map