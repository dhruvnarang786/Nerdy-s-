import { type BoostDef, type RebuttalDef } from './DnaConfig.js';
export interface PersonalityInput {
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
}
export interface PersonalityResult {
    primary: {
        id: string;
        label: string;
        confidence?: number;
        confidenceLabel?: string;
    } | null;
    secondary: {
        id: string;
        label: string;
        confidence?: number | null;
    } | null;
    confidence: number | null;
    allScores: Record<string, number> | null;
    reason?: string;
    explanation?: {
        topContributors: {
            metric: string;
            score: number;
            contribution: number;
        }[];
        boostsApplied: BoostDef[];
        rebuttalsApplied: RebuttalDef[];
        gatesPassed: number;
        competingArchetypes: {
            id: string;
            score: number;
            delta: number;
        }[];
    };
}
export declare class DnaPersonalityEngine {
    classify(metrics: PersonalityInput, extras?: {
        currentStreak?: number;
        uniqueBooksToTotalRatio?: number;
    }): PersonalityResult;
}
//# sourceMappingURL=DnaPersonalityEngine.d.ts.map