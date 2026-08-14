export interface CalibrationConfig {
    version: string;
    createdAt: string;
    minLogsForClassification: number;
    minLogsForNarration: number;
    confidenceThresholds: {
        strong: number;
        moderate: number;
        lean: number;
    };
    archetypes: Record<string, ArchetypeDef>;
}
export interface ArchetypeDef {
    label: string;
    description: string;
    emoji: string;
    color: string;
    tagline: string;
    gates: Record<string, {
        min?: number;
    }>;
    weights: Record<string, number>;
    boosts: BoostDef[];
    rebuttals: RebuttalDef[];
}
export interface BoostDef {
    metric: string;
    threshold: number;
    multiplier: number;
}
export interface RebuttalDef {
    metric: string;
    threshold: number;
    penalty: number;
}
export interface BadgesConfig {
    version: string;
    createdAt: string;
    families: Record<string, BadgeFamilyDef>;
    personalityBadges: PersonalityBadgeDef[];
    hiddenBadges: HiddenBadgeDef[];
}
export interface BadgeFamilyDef {
    label: string;
    icon: string;
    description: string;
    metric: string;
    perGenre?: boolean;
    qualifier?: {
        metric: string;
        threshold: number;
    };
    tiers: Record<string, TierDef>;
}
export interface TierDef {
    threshold: number;
    label: string;
    xpReward: number;
    qualifier?: {
        metric: string;
        threshold: number;
    };
}
export interface PersonalityBadgeDef {
    id: string;
    label: string;
    icon: string;
    archetype: string;
    requiredConsecutiveSnapshots: number;
    xpReward: number;
}
export interface HiddenBadgeDef {
    id: string;
    label: string;
    icon: string;
    description: string;
    condition: string;
    xpReward: number;
}
export declare function loadCalibration(): CalibrationConfig;
export declare function loadBadges(): BadgesConfig;
export declare function getCalibrationVersion(): string;
export declare function getBadgeVersion(): string;
//# sourceMappingURL=DnaConfig.d.ts.map