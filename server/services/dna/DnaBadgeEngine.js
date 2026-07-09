import { loadBadges } from './DnaConfig.js';

export class DnaBadgeEngine {
  /**
   * Evaluate all badges for a user given current metrics and personality.
   * @param {number} userId
   * @param {Object} metrics - normalized metric scores (0–100) + totalLogs
   * @param {Object} personality - { primary, secondary, allScores } from personality engine
   * @param {Object} extras - { currentStreak, genreCounts, personaHistory }
   * @param {Object} existingBadges - { [badgeId]: { unlocked, tier, progress } }
   * @returns {Object} { badges: { [badgeId]: { unlocked, tier, progress, progressLabel, unlockedAt } }, changes: string[] }
   */
  evaluate(userId, metrics, personality, extras, existingBadges = {}) {
    const config = loadBadges();
    const badges = {};
    const newUnlocks = [];
    const now = new Date().toISOString();

    // 1. Evaluate metric-based families
    for (const [familyId, family] of Object.entries(config.families)) {
      if (family.perGenre) {
        // Genre badges: evaluate per-genre
        const genreCounts = extras.genreCounts || {};
        for (const [genre, count] of Object.entries(genreCounts)) {
          for (const [tier, tierDef] of Object.entries(family.tiers)) {
            const badgeId = `${familyId}.${genre}.${tier}`;
            const existing = existingBadges[badgeId];
            const threshold = tierDef.threshold;
            const isUnlocked = count >= threshold;
            const qualifier = tierDef.qualifier;
            const qualifierPassed = !qualifier || (metrics[qualifier.metric] || 0) >= qualifier.threshold;

            const finalUnlocked = isUnlocked && qualifierPassed;
            badges[badgeId] = this._buildBadgeState(badgeId, familyId, tier, finalUnlocked, count, threshold, existing, now, newUnlocks);
          }
        }
      } else {
        // Standard metric-based badge
        const metricValue = metrics[family.metric];
        for (const [tier, tierDef] of Object.entries(family.tiers)) {
          const badgeId = `${familyId}_${tier}`;
          const existing = existingBadges[badgeId];
          const threshold = tierDef.threshold;
          const isUnlocked = metricValue >= threshold;
          const qualifier = tierDef.qualifier;
          const qualifierPassed = !qualifier || (metrics[qualifier.metric] || 0) >= qualifier.threshold;

          // For streak-based badges, use extras
          let value = metricValue;
          if (family.metric === 'currentStreak') value = extras.currentStreak || 0;

          const finalUnlocked = isUnlocked && qualifierPassed;
          badges[badgeId] = this._buildBadgeState(badgeId, familyId, tier, finalUnlocked, value, threshold, existing, now, newUnlocks);
        }
      }
    }

    // 2. Evaluate personality badges
    const personalityHistory = extras.personalityHistory || [];
    const primaryId = personality?.primary?.id;
    for (const pb of config.personalityBadges || []) {
      const badgeId = pb.id;
      const existing = existingBadges[badgeId];
      const isStable = primaryId === pb.archetype &&
        personalityHistory.filter(h => h.primary === pb.archetype).length >= pb.requiredConsecutiveSnapshots;
      badges[badgeId] = this._buildBadgeStateSimple(badgeId, 'personality', isStable, existing, now, newUnlocks);
    }

    // 3. Evaluate hidden badges
    for (const hb of config.hiddenBadges || []) {
      const badgeId = hb.id;
      const existing = existingBadges[badgeId];
      const conditionMet = this._evaluateHiddenCondition(hb.condition, metrics, extras);
      badges[badgeId] = {
        unlocked: conditionMet,
        progress: conditionMet ? 100 : (existing?.unlocked ? 100 : 0),
        progressLabel: existing?.unlocked ? null : null, // Never show progress for hidden
        tier: null,
        unlockedAt: conditionMet && !existing?.unlocked ? now : (existing?.unlockedAt || null),
      };
      if (conditionMet && !existing?.unlocked) {
        newUnlocks.push(badgeId);
      }
    }

    // Apply XP cap: max 3 new unlocks per recompute
    const cappedUnlocks = newUnlocks.slice(0, 3);
    const deferredUnlocks = newUnlocks.slice(3);

    return { badges, changes: cappedUnlocks, deferred: deferredUnlocks };
  }

  _buildBadgeState(badgeId, family, tier, isUnlocked, value, threshold, existing, now, newUnlocks) {
    const progress = Math.min(value / threshold, 1);
    const wasAlreadyUnlocked = existing?.unlocked || false;
    const finalUnlocked = isUnlocked || wasAlreadyUnlocked; // Once unlocked, stays unlocked
    if (isUnlocked && !wasAlreadyUnlocked) newUnlocks.push(badgeId);

    return {
      unlocked: finalUnlocked,
      tier: finalUnlocked ? tier : null,
      progress: finalUnlocked ? 100 : Math.round(progress * 100),
      progressLabel: finalUnlocked ? null : `${Math.min(value, threshold)}/${threshold}`,
      unlockedAt: finalUnlocked ? (wasAlreadyUnlocked ? existing.unlockedAt : now) : null,
    };
  }

  _buildBadgeStateSimple(badgeId, family, isUnlocked, existing, now, newUnlocks) {
    const wasAlreadyUnlocked = existing?.unlocked || false;
    const finalUnlocked = isUnlocked || wasAlreadyUnlocked;
    if (isUnlocked && !wasAlreadyUnlocked) newUnlocks.push(badgeId);

    return {
      unlocked: finalUnlocked,
      tier: finalUnlocked ? 'platinum' : null,
      progress: finalUnlocked ? 100 : 0,
      progressLabel: finalUnlocked ? null : null,
      unlockedAt: finalUnlocked ? (wasAlreadyUnlocked ? existing.unlockedAt : now) : null,
    };
  }

  _evaluateHiddenCondition(condition, metrics, extras) {
    // Simple condition evaluation for known patterns
    if (condition === 'totalLogs == 100') return extras.totalLogs === 100;
    if (condition === 'uniqueGenres >= 7') return (extras.genreCounts ? Object.keys(extras.genreCounts).length : 0) >= 7;
    if (condition === 'consecutiveLogsWithReviewLongerThanTitle >= 10') return false; // Not yet tracked
    if (condition.startsWith('log.createdAt.hour')) {
      // Evaluate hour ranges
      const hourMatch = condition.match(/hour\s*(>=|<|<=|>|==)\s*(\d+)/);
      if (hourMatch) return false; // Would need per-log evaluation
    }
    if (condition.startsWith('bookTitle contains')) {
      return false; // Would need per-log evaluation
    }
    return false;
  }
}
