interface ExistingBadge {
    unlocked: boolean;
    tier: string | null;
    progress: number;
    unlockedAt: string | null;
}
interface BadgeState {
    unlocked: boolean;
    tier: string | null;
    progress: number;
    progressLabel: string | null;
    unlockedAt: string | null;
}
interface BadgeResult {
    badges: Record<string, BadgeState>;
    changes: string[];
    deferred: string[];
}
interface PersonalityResult {
    primary?: {
        id: string;
    } | null;
    secondary?: {
        id: string;
    } | null;
    allScores?: Record<string, number> | null;
}
export declare class DnaBadgeEngine {
    evaluate(_userId: number, metrics: Record<string, number | null>, personality: PersonalityResult | null, extras: {
        currentStreak?: number;
        genreCounts?: Record<string, number>;
        personalityHistory?: {
            primary: string;
            timestamp: string;
        }[];
        totalLogs?: number;
    }, existingBadges?: Record<string, ExistingBadge>): BadgeResult;
    private _buildBadgeState;
    private _buildBadgeStateSimple;
    private _evaluateHiddenCondition;
}
export {};
//# sourceMappingURL=DnaBadgeEngine.d.ts.map