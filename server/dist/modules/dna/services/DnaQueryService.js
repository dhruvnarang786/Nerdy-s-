import { getPrismaClient } from '../../../infra/database/prisma.client.js';
import { getCalibrationVersion, getBadgeVersion } from './DnaConfig.js';
export class DnaQueryService {
    async getSnapshot(userId, fields = []) {
        const prisma = getPrismaClient();
        const snapshot = await prisma.dNASnapshot.findUnique({ where: { userId } });
        if (!snapshot) {
            return { exists: false, stale: false };
        }
        const now = new Date();
        const isStale = snapshot.staleAfter < now
            || snapshot.dataVersion !== getCalibrationVersion()
            || snapshot.badgeDefVersion !== getBadgeVersion();
        const result = {
            exists: true,
            snapshot: {
                version: snapshot.version,
                computedAt: snapshot.computedAt.toISOString(),
                staleAfter: snapshot.staleAfter.toISOString(),
                stale: isStale,
                level: snapshot.level,
                xp: snapshot.xp,
            },
            stats: {
                totalLogs: snapshot.totalLogs,
                booksThisYear: snapshot.booksThisYear,
                avgRating: snapshot.avgRating,
                currentStreak: snapshot.currentStreak,
                bestStreak: snapshot.bestStreak,
                totalFavorites: snapshot.totalFavorites,
                spoilerRatio: snapshot.spoilerRatio,
            },
        };
        const fieldMap = {
            profile: ['snapshot', 'stats'],
            personality: ['personality'],
            narration: ['narration'],
            badges: ['badges'],
            genres: ['genres'],
            heatmap: ['heatmap'],
            trends: ['trends'],
            metrics: ['metrics'],
            badgeSummary: ['badgeSummary'],
            genreSummary: ['genreSummary'],
        };
        const resolvedFields = new Set();
        if (fields.length === 0 || fields.includes('all')) {
            for (const group of Object.keys(fieldMap)) {
                for (const f of fieldMap[group])
                    resolvedFields.add(f);
            }
        }
        else {
            for (const field of fields) {
                const mapped = fieldMap[field];
                if (mapped)
                    for (const f of mapped)
                        resolvedFields.add(f);
            }
        }
        if (resolvedFields.has('personality')) {
            result.personality = snapshot.personality;
            const p = (snapshot.personality || {});
            result.archetype = p.primary?.id || null;
            result.archetypeLabel = p.primary?.label || p.primary?.id || null;
            result.confidence = p.confidence || null;
            result.explanation = p.explanation || null;
        }
        if (resolvedFields.has('narration')) {
            result.narration = snapshot.narration;
            const n = (snapshot.narration || {});
            result.narrative = n.identity || n.explanation || null;
        }
        if (resolvedFields.has('metrics')) {
            const { _accum, ...metricScores } = (snapshot.metrics || {});
            void _accum;
            result.metrics = metricScores;
        }
        if (resolvedFields.has('heatmap')) {
            const hm = snapshot.heatmap;
            result.heatmap = hm?.months || hm || [];
        }
        if (resolvedFields.has('trends')) {
            result.trends = snapshot.trends;
        }
        if (resolvedFields.has('badgeSummary')) {
            result.badgeSummary = snapshot.badgeSummary;
        }
        if (resolvedFields.has('genreSummary')) {
            result.genreSummary = snapshot.genreSummary;
        }
        if (resolvedFields.has('badges')) {
            const badges = await prisma.badge.findMany({
                where: { userId },
                select: { badgeId: true, family: true, unlocked: true, progress: true, progressLabel: true, tier: true, unlockedAt: true },
            });
            result.badges = badges.map((b) => ({
                badgeId: b.badgeId,
                family: b.family,
                tier: b.tier,
                unlocked: b.unlocked,
                progress: Math.round(b.progress * 100),
                progressLabel: b.progressLabel,
                unlockedAt: b.unlockedAt?.toISOString() || null,
            }));
        }
        if (resolvedFields.has('genres')) {
            const genres = await prisma.genreAffinity.findMany({
                where: { userId },
                select: { genre: true, affinity: true, count: true, trend: true },
                orderBy: { affinity: 'desc' },
            });
            result.genres = genres;
        }
        return result;
    }
    async compare(userId, friendUserId) {
        const prisma = getPrismaClient();
        const [userSnapshot, friendSnapshot] = await Promise.all([
            prisma.dNASnapshot.findUnique({ where: { userId } }),
            prisma.dNASnapshot.findUnique({ where: { userId: friendUserId } }),
        ]);
        if (!userSnapshot || !friendSnapshot)
            return null;
        return {
            user: this._extractComparisonData(userSnapshot),
            friend: this._extractComparisonData(friendSnapshot),
        };
    }
    _extractComparisonData(snapshot) {
        const metrics = (snapshot.metrics || {});
        const { _accum, ...scores } = metrics;
        void _accum;
        return {
            stats: {
                totalLogs: snapshot.totalLogs,
                avgRating: snapshot.avgRating,
                currentStreak: snapshot.currentStreak,
                booksThisYear: snapshot.booksThisYear,
            },
            personality: snapshot.personality,
            metrics: scores,
            genreSummary: snapshot.genreSummary,
            badgeSummary: snapshot.badgeSummary,
        };
    }
}
//# sourceMappingURL=DnaQueryService.js.map