import { getPrismaClient } from '../../../infra/database/prisma.client.js';
import { DnaMetricsEngine } from './DnaMetricsEngine.js';
import { DnaPersonalityEngine } from './DnaPersonalityEngine.js';
import { DnaBadgeEngine } from './DnaBadgeEngine.js';
import { DnaNarrationEngine } from './DnaNarrationEngine.js';
import { getCalibrationVersion, getBadgeVersion, loadBadges } from './DnaConfig.js';
/* eslint-disable @typescript-eslint/no-explicit-any */
export class DnaComputeService {
    metricsEngine = new DnaMetricsEngine();
    personalityEngine = new DnaPersonalityEngine();
    badgeEngine = new DnaBadgeEngine();
    narrationEngine = new DnaNarrationEngine();
    async fullRecompute(userId) {
        const startTime = Date.now();
        const prisma = getPrismaClient();
        const logs = await prisma.bookLog.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
        const favorites = await prisma.favorite.findMany({ where: { userId } });
        const existingSnapshot = await prisma.dNASnapshot.findUnique({ where: { userId } });
        const totalLogs = logs.length;
        const currentYear = new Date().getFullYear();
        const booksThisYear = logs.filter((l) => l.dateRead?.startsWith(String(currentYear))).length;
        const avgRating = totalLogs > 0 ? logs.reduce((s, l) => s + l.rating, 0) / totalLogs : 0;
        const currentStreak = this._computeStreak(logs);
        const bestStreak = Math.max(existingSnapshot?.bestStreak || 0, currentStreak);
        const totalFavorites = favorites.length;
        const spoilerRatio = totalLogs > 0 ? logs.filter((l) => l.hasSpoilers).length / totalLogs : 0;
        const metrics = await this.metricsEngine.fullRecomputeFromLogs(logs, {}, 3.5);
        metrics.totalLogs = totalLogs;
        const genreCounts = {};
        for (const log of logs) {
            if (log.genre)
                genreCounts[log.genre] = (genreCounts[log.genre] || 0) + 1;
        }
        const uniqueBooksCount = new Set(logs.map((l) => l.bookId)).size;
        const uniqueBooksToTotalRatio = totalLogs > 0 ? uniqueBooksCount / totalLogs : 1;
        const personality = this.personalityEngine.classify(metrics, { currentStreak, uniqueBooksToTotalRatio });
        const existingBadges = {};
        if (existingSnapshot?.badgeSummary) {
            const dbBadges = await prisma.badge.findMany({ where: { userId } });
            for (const b of dbBadges) {
                existingBadges[b.badgeId] = { unlocked: b.unlocked, tier: b.tier, progress: b.progress, unlockedAt: b.unlockedAt?.toISOString() || null };
            }
        }
        const badgeResult = this.badgeEngine.evaluate(userId, metrics, personality, {
            currentStreak,
            genreCounts,
            personalityHistory: existingSnapshot?.personality?.personalityHistory || [],
        }, existingBadges);
        const narration = await this.narrationEngine.generate(existingSnapshot, personality, { totalLogs, avgRating, currentStreak });
        const heatmap = this._computeHeatmap(logs, currentYear);
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
                trends: {},
                personality: personality,
                narration: (narration ?? undefined),
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
                personality: personality,
                narration: (narration ?? undefined),
                badgeSummary: { totalEarned: 0, recentUnlocks: badgeResult.changes.slice(0, 3) },
                genreSummary: this._computeGenreSummary(genreCounts),
                dataVersion: getCalibrationVersion(),
                badgeDefVersion: getBadgeVersion(),
            },
        });
        for (const [badgeId, state] of Object.entries(badgeResult.badges)) {
            const family = badgeId.includes('.') ? badgeId.split('.')[0] : badgeId.split('_')[0];
            const tier = state.tier || '';
            await prisma.badge.upsert({
                where: { userId_badgeId: { userId, badgeId } },
                create: { userId, badgeId, family, tier, unlocked: state.unlocked, progress: state.progress / 100, progressLabel: state.progressLabel, unlockedAt: state.unlockedAt ? new Date(state.unlockedAt) : null },
                update: { unlocked: state.unlocked, tier, progress: state.progress / 100, progressLabel: state.progressLabel, unlockedAt: state.unlockedAt ? new Date(state.unlockedAt) : undefined },
            });
        }
        const totalGenreCount = Object.values(genreCounts).reduce((s, c) => s + c, 0) || 1;
        for (const [genre, count] of Object.entries(genreCounts)) {
            await prisma.genreAffinity.upsert({
                where: { userId_genre: { userId, genre } },
                create: { userId, genre: genre, affinity: count / totalGenreCount, count },
                update: { affinity: count / totalGenreCount, count },
            });
        }
        await prisma.dnaActivityEvent.create({
            data: {
                userId,
                eventType: 'snapshot.computed',
                payload: { version: snapshot.version, duration: Date.now() - startTime, type: 'full' },
                timestamp: new Date(),
                processedSnapshotVersion: snapshot.version,
            },
        }).catch(() => { });
        return { version: snapshot.version, newBadges: badgeResult.changes };
    }
    async incrementalRecompute(userId, event) {
        const startTime = Date.now();
        const prisma = getPrismaClient();
        const snapshot = await prisma.dNASnapshot.findUnique({ where: { userId } });
        if (!snapshot)
            return this.fullRecompute(userId);
        const currentMetrics = (snapshot.metrics || {});
        const accum = (currentMetrics._accum || {});
        const updatedAccum = this.metricsEngine.applyDelta(accum, event);
        const incMetrics = this.metricsEngine.computeAll({ ...updatedAccum, reviewFrequency: updatedAccum.reviewFrequency }, null, {});
        incMetrics._accum = updatedAccum;
        const logs = await prisma.bookLog.findMany({
            where: { userId },
        });
        incMetrics.genreDiversity = logs.length > 0
            ? (await this.metricsEngine.fullRecomputeFromLogs(logs, {}, 0)).genreDiversity
            : null;
        incMetrics.totalLogs = logs.length;
        const currentYear = new Date().getFullYear();
        const booksThisYear = logs.filter((l) => l.dateRead?.startsWith(String(currentYear))).length;
        const avgRating = logs.length > 0 ? logs.reduce((s, l) => s + l.rating, 0) / logs.length : 0;
        const currentStreak = this._computeStreak(logs);
        const bestStreak = Math.max(snapshot.bestStreak || 0, currentStreak);
        const uniqueBooksCount = new Set(logs.map((l) => l.bookId)).size;
        const uniqueBooksToTotalRatio = logs.length > 0 ? uniqueBooksCount / logs.length : 1;
        const personality = this.personalityEngine.classify(incMetrics, { currentStreak, uniqueBooksToTotalRatio });
        const personalityHistory = snapshot.personality?.history || [];
        if (personality?.primary) {
            personalityHistory.push({ primary: personality.primary.id, timestamp: new Date().toISOString() });
            if (personalityHistory.length > 5)
                personalityHistory.shift();
        }
        ;
        personality.history = personalityHistory;
        const existingBadges = {};
        const dbBadges = await prisma.badge.findMany({ where: { userId } });
        for (const b of dbBadges) {
            existingBadges[b.badgeId] = { unlocked: b.unlocked, tier: b.tier, progress: b.progress, unlockedAt: b.unlockedAt?.toISOString() || null };
        }
        const genreCounts = {};
        for (const log of logs)
            if (log.genre)
                genreCounts[log.genre] = (genreCounts[log.genre] || 0) + 1;
        const badgeResult = this.badgeEngine.evaluate(userId, incMetrics, personality, { currentStreak, genreCounts, personalityHistory, totalLogs: logs.length }, existingBadges);
        const narration = await this.narrationEngine.generate(snapshot, personality, { totalLogs: logs.length, avgRating, currentStreak });
        const heatmap = this._computeHeatmap(logs, currentYear);
        let xp = snapshot.xp || 0;
        for (const badgeId of badgeResult.changes) {
            xp += this._getBadgeXp(badgeId);
        }
        const newLevel = Math.max(1, Math.floor(xp / 100) + Math.floor(logs.length / 5));
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
                personality: personality,
                narration: (narration ?? undefined),
                badgeSummary: { totalEarned: badgeResult.changes.length, recentUnlocks: badgeResult.changes.slice(0, 3) },
                genreSummary: this._computeGenreSummary(genreCounts),
            },
        });
        for (const [badgeId, state] of Object.entries(badgeResult.badges)) {
            const family = badgeId.includes('.') ? badgeId.split('.')[0] : badgeId.split('_')[0];
            const tier = state.tier || '';
            if (existingBadges[badgeId] && existingBadges[badgeId].unlocked === state.unlocked && existingBadges[badgeId].tier === tier)
                continue;
            await prisma.badge.upsert({
                where: { userId_badgeId: { userId, badgeId } },
                create: { userId, badgeId, family, tier, unlocked: state.unlocked, progress: state.progress / 100, progressLabel: state.progressLabel, unlockedAt: state.unlockedAt ? new Date(state.unlockedAt) : null },
                update: { unlocked: state.unlocked, tier, progress: state.progress / 100, progressLabel: state.progressLabel, unlockedAt: state.unlockedAt ? new Date(state.unlockedAt) : undefined },
            });
        }
        const totalGenreCount = Object.values(genreCounts).reduce((s, c) => s + c, 0) || 1;
        for (const [genre, count] of Object.entries(genreCounts)) {
            await prisma.genreAffinity.upsert({
                where: { userId_genre: { userId, genre } },
                create: { userId, genre: genre, affinity: count / totalGenreCount, count },
                update: { affinity: count / totalGenreCount, count },
            });
        }
        await prisma.dnaActivityEvent.create({
            data: {
                userId,
                eventType: 'snapshot.computed',
                payload: { version: null, duration: Date.now() - startTime, type: 'incremental', newBadges: badgeResult.changes },
                timestamp: new Date(),
            },
        }).catch(() => { });
        return { version: null, newBadges: badgeResult.changes };
    }
    async badgeOnlyRecompute(userId, _event) {
        const prisma = getPrismaClient();
        const snapshot = await prisma.dNASnapshot.findUnique({ where: { userId } });
        if (!snapshot)
            return;
        const totalFavorites = await prisma.favorite.count({ where: { userId } });
        await prisma.dNASnapshot.update({ where: { userId }, data: { totalFavorites } });
    }
    _computeStreak(logs) {
        if (!logs.length)
            return 0;
        const sorted = logs
            .map((l) => new Date(l.dateRead))
            .filter((d) => !isNaN(d.getTime()))
            .sort((a, b) => b.getTime() - a.getTime());
        if (sorted.length === 0)
            return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const mostRecent = new Date(sorted[0]);
        mostRecent.setHours(0, 0, 0, 0);
        const diffDays = Math.round((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 1)
            return 0;
        let streak = 1;
        const checkDate = new Date(mostRecent);
        checkDate.setDate(checkDate.getDate() - 1);
        for (let i = 1; i < sorted.length; i++) {
            const logDate = new Date(sorted[i]);
            logDate.setHours(0, 0, 0, 0);
            if (logDate.getTime() === checkDate.getTime()) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
            else if (logDate.getTime() < checkDate.getTime()) {
                break;
            }
        }
        return streak;
    }
    _computeHeatmap(logs, year) {
        const months = Array(12).fill(0);
        for (const log of logs) {
            if (log.dateRead?.startsWith(String(year))) {
                const parts = String(log.dateRead).split('-');
                if (parts.length >= 2) {
                    const monthIdx = parseInt(parts[1], 10) - 1;
                    if (monthIdx >= 0 && monthIdx < 12)
                        months[monthIdx]++;
                }
            }
        }
        return { year, months };
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
                    if (badgeId.includes(`.${tier}`))
                        return def.xpReward || 0;
                }
            }
            else {
                for (const [tier, def] of Object.entries(family.tiers)) {
                    if (badgeId.endsWith(`_${tier}`))
                        return def.xpReward || 0;
                }
            }
        }
        for (const pb of config.personalityBadges || []) {
            if (badgeId === pb.id)
                return pb.xpReward || 0;
        }
        for (const hb of config.hiddenBadges || []) {
            if (badgeId === hb.id)
                return hb.xpReward || 0;
        }
        return 0;
    }
}
//# sourceMappingURL=DnaComputeService.js.map