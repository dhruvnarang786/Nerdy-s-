import { loadBadges } from './DnaConfig.js';
export class DnaBadgeEngine {
    evaluate(_userId, metrics, personality, extras, existingBadges = {}) {
        const config = loadBadges();
        const badges = {};
        const newUnlocks = [];
        const now = new Date().toISOString();
        for (const [familyId, family] of Object.entries(config.families)) {
            if (family.perGenre) {
                const genreCounts = extras.genreCounts || {};
                for (const [genre, count] of Object.entries(genreCounts)) {
                    for (const [tier, tierDef] of Object.entries(family.tiers)) {
                        const badgeId = `${familyId}.${genre}.${tier}`;
                        const existing = existingBadges[badgeId];
                        const threshold = tierDef.threshold;
                        const isUnlocked = count >= threshold;
                        const qualifier = tierDef.qualifier;
                        const qualifierPassed = !qualifier || (metrics[qualifier.metric] || 0) >= qualifier.threshold;
                        badges[badgeId] = this._buildBadgeState(badgeId, familyId, tier, isUnlocked && qualifierPassed, count, threshold, existing, now, newUnlocks);
                    }
                }
            }
            else {
                const metricValue = metrics[family.metric] ?? 0;
                for (const [tier, tierDef] of Object.entries(family.tiers)) {
                    const badgeId = `${familyId}_${tier}`;
                    const existing = existingBadges[badgeId];
                    const threshold = tierDef.threshold;
                    let value = metricValue;
                    if (family.metric === 'currentStreak')
                        value = extras.currentStreak || 0;
                    const isUnlocked = value >= threshold;
                    const qualifier = tierDef.qualifier;
                    const qualifierPassed = !qualifier || (metrics[qualifier.metric] || 0) >= qualifier.threshold;
                    badges[badgeId] = this._buildBadgeState(badgeId, familyId, tier, isUnlocked && qualifierPassed, value, threshold, existing, now, newUnlocks);
                }
            }
        }
        const personalityHistory = extras.personalityHistory || [];
        const primaryId = personality?.primary?.id;
        for (const pb of config.personalityBadges || []) {
            const badgeId = pb.id;
            const existing = existingBadges[badgeId];
            const isStable = primaryId === pb.archetype &&
                personalityHistory.filter(h => h.primary === pb.archetype).length >= pb.requiredConsecutiveSnapshots;
            badges[badgeId] = this._buildBadgeStateSimple(badgeId, isStable, existing, now, newUnlocks);
        }
        for (const hb of config.hiddenBadges || []) {
            const badgeId = hb.id;
            const existing = existingBadges[badgeId];
            const conditionMet = this._evaluateHiddenCondition(hb.condition, metrics, extras);
            badges[badgeId] = {
                unlocked: conditionMet,
                progress: conditionMet ? 100 : (existing?.unlocked ? 100 : 0),
                progressLabel: null,
                tier: null,
                unlockedAt: conditionMet && !existing?.unlocked ? now : (existing?.unlockedAt || null),
            };
            if (conditionMet && !existing?.unlocked) {
                newUnlocks.push(badgeId);
            }
        }
        const cappedUnlocks = newUnlocks.slice(0, 3);
        const deferredUnlocks = newUnlocks.slice(3);
        return { badges, changes: cappedUnlocks, deferred: deferredUnlocks };
    }
    _buildBadgeState(badgeId, _family, tier, isUnlocked, value, threshold, existing, now, newUnlocks) {
        const progress = Math.min(value / threshold, 1);
        const wasAlreadyUnlocked = existing?.unlocked || false;
        const finalUnlocked = isUnlocked || wasAlreadyUnlocked;
        if (isUnlocked && !wasAlreadyUnlocked)
            newUnlocks.push(badgeId);
        return {
            unlocked: finalUnlocked,
            tier: finalUnlocked ? tier : null,
            progress: finalUnlocked ? 100 : Math.round(progress * 100),
            progressLabel: finalUnlocked ? null : `${Math.min(value, threshold)}/${threshold}`,
            unlockedAt: finalUnlocked ? (wasAlreadyUnlocked ? existing.unlockedAt : now) : null,
        };
    }
    _buildBadgeStateSimple(badgeId, isUnlocked, existing, now, newUnlocks) {
        const wasAlreadyUnlocked = existing?.unlocked || false;
        const finalUnlocked = isUnlocked || wasAlreadyUnlocked;
        if (isUnlocked && !wasAlreadyUnlocked)
            newUnlocks.push(badgeId);
        return {
            unlocked: finalUnlocked,
            tier: finalUnlocked ? 'platinum' : null,
            progress: finalUnlocked ? 100 : 0,
            progressLabel: null,
            unlockedAt: finalUnlocked ? (wasAlreadyUnlocked ? existing.unlockedAt : now) : null,
        };
    }
    _evaluateHiddenCondition(condition, _metrics, extras) {
        if (condition === 'totalLogs == 100')
            return extras.totalLogs === 100;
        if (condition === 'uniqueGenres >= 7') {
            const genreCounts = extras.genreCounts;
            return (genreCounts ? Object.keys(genreCounts).length : 0) >= 7;
        }
        return false;
    }
}
//# sourceMappingURL=DnaBadgeEngine.js.map