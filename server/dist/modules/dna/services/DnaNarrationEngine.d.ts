interface SnapshotNarration {
    personalityId: string;
    computedAt: string;
    model?: string;
    identity?: string;
    explanation?: string;
}
interface PersonalityInfo {
    primary?: {
        id: string;
        label?: string;
    };
}
interface NarrationStats {
    totalLogs: number;
    avgRating: number;
    currentStreak: number;
}
interface NarrationResult {
    version: string;
    computedAt: string;
    personalityId: string;
    generatedBy: {
        model: string;
        promptTokens: number;
        completionTokens: number;
    };
    identity: string;
    strengths: string[];
    explanation: string;
    explorationSuggestion: string;
}
export declare class DnaNarrationEngine {
    generate(snapshot: {
        narration?: SnapshotNarration | null;
    } | null, personality: PersonalityInfo | null, stats: NarrationStats): Promise<NarrationResult | null>;
}
export {};
//# sourceMappingURL=DnaNarrationEngine.d.ts.map