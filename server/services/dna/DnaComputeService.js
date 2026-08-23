import { prisma } from '../../index.js';
import { DnaMetricsEngine } from './DnaMetricsEngine.js';
import { DnaPersonalityEngine } from './DnaPersonalityEngine.js';
import { DnaBadgeEngine } from './DnaBadgeEngine.js';
import { DnaNarrationEngine } from './DnaNarrationEngine.js';
import { getCalibrationVersion, getBadgeVersion, loadBadges } from './DnaConfig.js';

export class DnaComputeService {
  constructor() {
    this.metricsEngine = new DnaMetricsEngine();
    this.personalityEngine = new DnaPersonalityEngine();
    this.badgeEngine = new DnaBadgeEngine();
    this.narrationEngine = new DnaNarrationEngine();
  }

  /**
   * Full recompute for a user — reads all logs from DB.
   * Used for first snapshot creation and manual refresh.
   */
  async fullRecompute(userId) {
    const startTime = Date.now();

    const [logs, favorites, existingSnapshot] = await Promise.all([
      prisma.bookLog.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      prisma.favorite.findMany({ where: { userId } }),
      prisma.dNASnapshot.findUnique({ where: { userId } }),
    ]);

    const totalLogs = logs.length;
    const currentYear = new Date().getFullYear();
    const booksThisYear = logs.filter(l => l.dateRead?.startsWith(String(currentYear))).length;
    const avgRating = totalLogs > 0
      ? logs.reduce((s, l) => s + l.rating, 0) / totalLogs
      : 0;
    const currentStreak = this._computeStreak(logs);
    const bestStreak = Math.max(existingSnapshot?.bestStreak || 0, currentStreak);
    const totalFavorites = favorites.length;
    const spoilerRatio = totalLogs > 0
      ? logs.filter(l => l.hasSpoilers).length / totalLogs
      : 0;

    // Compute all metrics from full data
    const metrics = await this.metricsEngine.fullRecomputeFromLogs(logs, {}, 3.5);
    metrics.totalLogs = totalLogs;

    // Compute genre affinity
    const genreCounts = {};
    for (const log of logs) {
      if (log.genre) genreCounts[log.genre] = (genreCounts[log.genre] || 0) + 1;
    }

    // Personality
    const uniqueBooksCount = new Set(logs.map(l => l.bookId)).size;
    const uniqueBooksToTotalRatio = totalLogs > 0 ? uniqueBooksCount / totalLogs : 1;
    const personality = this.personalityEngine.classify(metrics, {
      currentStreak,
      uniqueBooksToTotalRatio,
    });

    // Badges
    const existingBadges = {};
    if (existingSnapshot?.badgeSummary) {
      // Load existing badge states
      const dbBadges = await prisma.badge.findMany({ where: { userId } });
      for (const b of dbBadges) existingBadges[b.badgeId] = b;
    }

    const badgeResult = this.badgeEngine.evaluate(
      userId, metrics, personality,
      { currentStreak, genreCounts, personalityHistory: existingSnapshot?.personality?.history || [] },
      existingBadges
    );

    // Narration — let the engine decide if regeneration is needed
    const narration = await this.narrationEngine.generate(existingSnapshot, personality, { totalLogs, avgRating, currentStreak });

    // Compute heatmap and trends
    const heatmap = this._computeHeatmap(logs, currentYear);
    const trends = this._computeTrends(logs);

    // Persist
    const snapshot = await prisma.dNASnapshot.upsert({
      where: { userId },
      create: {
        userId,
        version: 1,
        computedAt: new Date(),
        staleAfter: new Date(Date.now() + 15 * 60 * 1000),
        totalLogs, booksThisYear, avgRating, currentStreak, bestStreak,
        level: Math.max(1, Math.floor(totalLogs / 5)),
        xp: existingSnapshot?.xp || 0,
        totalFavorites, spoilerRatio,
        metrics: JSON.parse(JSON.stringify(metrics)),
        heatmap,
        trends,
        personality,
        narration,
        badgeSummary: { totalEarned: 0, recentUnlocks: badgeResult.changes.slice(0, 3) },
        genreSummary: this._computeGenreSummary(genreCounts),
        dataVersion: getCalibrationVersion(),
        badgeDefVersion: getBadgeVersion(),
      },
      update: {
        version: { increment: 1 },
        computedAt: new Date(),
        staleAfter: new Date(Date.now() + 15 * 60 * 1000),
        totalLogs, booksThisYear, avgRating, currentStreak, bestStreak,
        level: Math.max(1, Math.floor(totalLogs / 5)),
        totalFavorites, spoilerRatio,
        metrics: JSON.parse(JSON.stringify(metrics)),
        heatmap,
        trends,
        personality,
        narration: narration || undefined,
        badgeSummary: { totalEarned: 0, recentUnlocks: badgeResult.changes.slice(0, 3) },
        genreSummary: this._computeGenreSummary(genreCounts),
        dataVersion: getCalibrationVersion(),
        badgeDefVersion: getBadgeVersion(),
      },
    });

    // Persist badge states
    for (const [badgeId, state] of Object.entries(badgeResult.badges)) {
      const family = badgeId.includes('.') ? badgeId.split('.')[0] : badgeId.split('_')[0];
      const tier = state.tier || '';
      await prisma.badge.upsert({
        where: { userId_badgeId: { userId, badgeId } },
        create: { userId, badgeId, family, tier, unlocked: state.unlocked, progress: state.progress / 100, progressLabel: state.progressLabel, unlockedAt: state.unlockedAt ? new Date(state.unlockedAt) : null },
        update: { unlocked: state.unlocked, tier, progress: state.progress / 100, progressLabel: state.progressLabel, unlockedAt: state.unlockedAt ? new Date(state.unlockedAt) : undefined },
      });
    }

    // Persist genre affinities
    const totalGenreCount = Object.values(genreCounts).reduce((s, c) => s + c, 0) || 1;
    for (const [genre, count] of Object.entries(genreCounts)) {
      await prisma.genreAffinity.upsert({
        where: { userId_genre: { userId, genre } },
        create: { userId, genre, affinity: count / totalGenreCount, count },
        update: { affinity: count / totalGenreCount, count },
      });
    }

    // Record activity event
    await prisma.dnaActivityEvent.create({
      data: {
        userId,
        eventType: 'snapshot.computed',
        payload: { version: snapshot.version, duration: Date.now() - startTime, type: 'full' },
        timestamp: new Date(),
        processedSnapshotVersion: snapshot.version,
      },
    }).catch(() => {}); // Non-critical

    return { version: snapshot.version, newBadges: badgeResult.changes };
  }

  /**
   * Incremental recompute — applies event delta to accumulators.
   */
  async incrementalRecompute(userId, event) {
    const startTime = Date.now();
    const snapshot = await prisma.dNASnapshot.findUnique({ where: { userId } });
    if (!snapshot) return this.fullRecompute(userId);

    const currentMetrics = snapshot.metrics || {};
    const accum = currentMetrics._accum || {};

    // Apply delta to accumulators
    const updatedAccum = this.metricsEngine.applyDelta(accum, event);

    // Recompute incremental metrics from accumulators
    const incMetrics = this.metricsEngine.computeAll({ ...updatedAccum, reviewFrequency: updatedAccum.reviewFrequency }, null, {});
    incMetrics._accum = updatedAccum;

    // Full recompute genre diversity (fast enough)
    const logs = await prisma.bookLog.findMany({ where: { userId }, select: { id: true, author: true, dateRead: true, rating: true, notes: true, createdAt: true, bookId: true, bookTitle: true, hasSpoilers: true } });
    incMetrics.genreDiversity = logs.length > 0 ? (await this.metricsEngine.fullRecomputeFromLogs(logs, {}, 0)).genreDiversity : 0;
    incMetrics.totalLogs = logs.length;

    // Stats
    const currentYear = new Date().getFullYear();
    const booksThisYear = logs.filter(l => l.dateRead?.startsWith(String(currentYear))).length;
    const avgRating = logs.length > 0 ? logs.reduce((s, l) => s + l.rating, 0) / logs.length : 0;
    const currentStreak = this._computeStreak(logs);
    const bestStreak = Math.max(snapshot.bestStreak || 0, currentStreak);

    // Personality
    const uniqueBooksCount = new Set(logs.map(l => l.bookId)).size;
    const uniqueBooksToTotalRatio = logs.length > 0 ? uniqueBooksCount / logs.length : 1;
    const personality = this.personalityEngine.classify(incMetrics, { currentStreak, uniqueBooksToTotalRatio });

    // Keep personality history (last 5)
    const personalityHistory = snapshot.personality?.explanation?.competition ? snapshot.personality.history || [] : [];
    if (personality?.primary) {
      personalityHistory.push({ primary: personality.primary.id, timestamp: new Date().toISOString() });
      if (personalityHistory.length > 5) personalityHistory.shift();
    }
    if (personality) personality.history = personalityHistory;

    // Badges
    const existingBadges = {};
    const dbBadges = await prisma.badge.findMany({ where: { userId } });
    for (const b of dbBadges) existingBadges[b.badgeId] = { unlocked: b.unlocked, tier: b.tier, progress: b.progress, unlockedAt: b.unlockedAt };

    const genreCounts = {};
    for (const log of logs) if (log.genre) genreCounts[log.genre] = (genreCounts[log.genre] || 0) + 1;

    const badgeResult = this.badgeEngine.evaluate(
      userId, incMetrics, personality,
      { currentStreak, genreCounts, personalityHistory, totalLogs: logs.length },
      existingBadges
    );

    // Narration
    const narration = await this.narrationEngine.generate(snapshot, personality, { totalLogs: logs.length, avgRating, currentStreak });

    // Heatmap
    const heatmap = this._computeHeatmap(logs, currentYear);

    // XP
    let xp = snapshot.xp || 0;
    for (const badgeId of badgeResult.changes) {
      const badgeState = badgeResult.badges[badgeId];
      xp += this._getBadgeXp(badgeId);
    }
    const newLevel = Math.max(1, Math.floor(xp / 100) + Math.floor(logs.length / 5));

    // Persist
    await prisma.dNASnapshot.update({
      where: { userId },
      data: {
        version: { increment: 1 },
        computedAt: new Date(),
        staleAfter: new Date(Date.now() + 15 * 60 * 1000),
        totalLogs: logs.length, booksThisYear, avgRating, currentStreak, bestStreak,
        level: newLevel, xp,
        metrics: JSON.parse(JSON.stringify(incMetrics)),
        heatmap,
        trends: this._computeTrends(logs),
        personality,
        narration: narration || undefined,
        badgeSummary: { totalEarned: badgeResult.changes.length, recentUnlocks: badgeResult.changes.slice(0, 3) },
        genreSummary: this._computeGenreSummary(genreCounts),
      },
    });

    // Persist badge updates
    for (const [badgeId, state] of Object.entries(badgeResult.badges)) {
      const family = badgeId.includes('.') ? badgeId.split('.')[0] : badgeId.split('_')[0];
      const tier = state.tier || '';
      if (existingBadges[badgeId] && existingBadges[badgeId].unlocked === state.unlocked && existingBadges[badgeId].tier === tier) continue; // Skip if unchanged
      await prisma.badge.upsert({
        where: { userId_badgeId: { userId, badgeId } },
        create: { userId, badgeId, family, tier, unlocked: state.unlocked, progress: state.progress / 100, progressLabel: state.progressLabel, unlockedAt: state.unlockedAt ? new Date(state.unlockedAt) : null },
        update: { unlocked: state.unlocked, tier, progress: state.progress / 100, progressLabel: state.progressLabel, unlockedAt: state.unlockedAt ? new Date(state.unlockedAt) : undefined },
      });
    }

    // Persist genre affinities
    const totalGenreCount = Object.values(genreCounts).reduce((s, c) => s + c, 0) || 1;
    for (const [genre, count] of Object.entries(genreCounts)) {
      await prisma.genreAffinity.upsert({
        where: { userId_genre: { userId, genre } },
        create: { userId, genre, affinity: count / totalGenreCount, count },
        update: { affinity: count / totalGenreCount, count },
      });
    }

    // Record event
    await prisma.dnaActivityEvent.create({
      data: {
        userId,
        eventType: 'snapshot.computed',
        payload: { version: null, duration: Date.now() - startTime, type: 'incremental', newBadges: badgeResult.changes },
        timestamp: new Date(),
      },
    }).catch(() => {});

    return { version: null, newBadges: badgeResult.changes };
  }

  /**
   * Badge-only recompute (favorites change doesn't affect metrics).
   */
  async badgeOnlyRecompute(userId, event) {
    const snapshot = await prisma.dNASnapshot.findUnique({ where: { userId } });
    if (!snapshot) return;

    const totalFavorites = await prisma.favorite.count({ where: { userId } });

    await prisma.dNASnapshot.update({
      where: { userId },
      data: { totalFavorites },
    });
  }

  // ── Helpers ──

  _computeStreak(logs) {
    if (!logs.length) return 0;
    const sorted = logs
      .map(l => new Date(l.dateRead))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => b - a);

    if (sorted.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mostRecent = new Date(sorted[0]);
    mostRecent.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - mostRecent) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) return 0;

    let streak = 1;
    let checkDate = new Date(mostRecent);
    checkDate.setDate(checkDate.getDate() - 1);

    for (let i = 1; i < sorted.length; i++) {
      const logDate = new Date(sorted[i]);
      logDate.setHours(0, 0, 0, 0);
      if (logDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (logDate.getTime() < checkDate.getTime()) {
        break;
      }
    }
    return streak;
  }

  _computeHeatmap(logs, year) {
    const months = Array(12).fill(0);
    for (const log of logs) {
      if (log.dateRead?.startsWith(String(year))) {
        const parts = log.dateRead.split('-');
        if (parts.length >= 2) {
          const monthIdx = parseInt(parts[1], 10) - 1;
          if (monthIdx >= 0 && monthIdx < 12) months[monthIdx]++;
        }
      }
    }
    return { year, months };
  }

  _computeTrends(logs) {
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const weekCounts = [0, 0, 0, 0]; // [W-3, W-2, W-1, This Week]

    for (const log of logs) {
      const logTime = log.dateRead ? new Date(log.dateRead).getTime() : new Date(log.createdAt).getTime();
      if (isNaN(logTime)) continue;

      const diffMs = now - logTime;
      if (diffMs < 0) continue;

      const weekIndex = Math.floor(diffMs / oneWeekMs);
      if (weekIndex === 0) weekCounts[3]++; // This week
      else if (weekIndex === 1) weekCounts[2]++; // W-1
      else if (weekIndex === 2) weekCounts[1]++; // W-2
      else if (weekIndex === 3) weekCounts[0]++; // W-3
    }

    const weeklyVelocity = [
      { week: 'W-3', count: weekCounts[0] },
      { week: 'W-2', count: weekCounts[1] },
      { week: 'W-1', count: weekCounts[2] },
      { week: 'This', count: weekCounts[3] },
    ];

    const totalLast4Weeks = weekCounts.reduce((a, b) => a + b, 0);
    const velocity = Number((totalLast4Weeks / 4).toFixed(1));

    const recent2 = weekCounts[2] + weekCounts[3];
    const prev2 = weekCounts[0] + weekCounts[1];
    let momentum = 'stable';
    if (recent2 > prev2 + 1) momentum = 'accelerating';
    else if (recent2 < prev2 - 1) momentum = 'declining';

    return {
      velocity,
      momentum,
      weeklyCounts: weeklyVelocity,
      weeklyVelocity,
    };
  }

  _computeGenreSummary(genreCounts) {
    const entries = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    return {
      topGenre: entries[0]?.[0] || null,
      topAffinity: entries.length > 0 ? entries[0][1] / (Object.values(genreCounts).reduce((s, c) => s + c, 0) || 1) : 0,
      genreCount: entries.length,
    };
  }

  _getBadgeXp(badgeId) {
    const config = loadBadges();
    for (const family of Object.values(config.families)) {
      if (family.perGenre) {
        for (const [tier, def] of Object.entries(family.tiers)) {
          if (badgeId.includes(`.${tier}`)) return def.xpReward || 0;
        }
      } else {
        for (const [tier, def] of Object.entries(family.tiers)) {
          if (badgeId.endsWith(`_${tier}`)) return def.xpReward || 0;
        }
      }
    }
    for (const pb of config.personalityBadges || []) {
      if (badgeId === pb.id) return pb.xpReward || 0;
    }
    for (const hb of config.hiddenBadges || []) {
      if (badgeId === hb.id) return hb.xpReward || 0;
    }
    return 0;
  }
}
