import { Router } from 'express';
import { DnaQueryService } from '../services/DnaQueryService.js';
import { requireAuth } from '../../../shared/middleware/require-auth.js';
import { asyncHandler } from '../../../shared/utils/async-handler.js';
import { getPrismaClient } from '../../../infra/database/prisma.client.js';
export function createDnaRoutes(dnaComputeService) {
    const router = Router();
    const dnaQueryService = new DnaQueryService();
    router.get('/', requireAuth(), asyncHandler(async (req, res) => {
        const fields = typeof req.query.fields === 'string'
            ? req.query.fields.split(',').map(f => f.trim())
            : [];
        let result = await dnaQueryService.getSnapshot(req.user.id, fields);
        if (!result.exists) {
            try {
                await dnaComputeService.fullRecompute(req.user.id);
                result = await dnaQueryService.getSnapshot(req.user.id, fields);
            }
            catch {
                res.status(404).json({
                    error: 'DNA_NOT_FOUND',
                    message: 'Your DNA hasn\'t formed yet. Log your first book to start building your reading identity.',
                });
                return;
            }
        }
        res.json(result);
    }));
    router.post('/refresh', requireAuth(), asyncHandler(async (req, res) => {
        const result = await dnaComputeService.fullRecompute(req.user.id);
        res.json({ ok: true, version: result.version, newBadges: result.newBadges });
    }));
    router.get('/events', requireAuth(), asyncHandler(async (req, res) => {
        const prisma = getPrismaClient();
        const page = parseInt(typeof req.query.page === 'string' ? req.query.page : '1', 10);
        const limit = Math.min(parseInt(typeof req.query.limit === 'string' ? req.query.limit : '20', 10), 100);
        const skip = (page - 1) * limit;
        const [events, total] = await Promise.all([
            prisma.dnaActivityEvent.findMany({
                where: { userId: req.user.id },
                orderBy: { timestamp: 'desc' },
                skip,
                take: limit,
            }),
            prisma.dnaActivityEvent.count({ where: { userId: req.user.id } }),
        ]);
        res.json({
            events: events.map(e => ({
                id: e.id,
                type: e.eventType,
                payload: e.payload,
                timestamp: e.timestamp.toISOString(),
                processedSnapshotVersion: e.processedSnapshotVersion,
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    }));
    router.get('/comparison/:username', requireAuth(), asyncHandler(async (req, res) => {
        const prisma = getPrismaClient();
        const friend = await prisma.user.findUnique({
            where: { username: req.params.username },
            select: { id: true },
        });
        if (!friend) {
            res.status(404).json({ error: 'FRIEND_NOT_FOUND', message: 'User not found.' });
            return;
        }
        const comparison = await dnaQueryService.compare(req.user.id, friend.id);
        if (!comparison) {
            res.status(404).json({ error: 'FRIEND_NO_DNA', message: 'Friend hasn\'t unlocked DNA yet.' });
            return;
        }
        res.json(comparison);
    }));
    router.get('/badges', requireAuth(), asyncHandler(async (req, res) => {
        const prisma = getPrismaClient();
        const badges = await prisma.badge.findMany({
            where: { userId: req.user.id },
            select: { badgeId: true, unlocked: true, progress: true, progressLabel: true, tier: true, unlockedAt: true, family: true },
        });
        res.json({ badges });
    }));
    router.get('/health', asyncHandler(async (_req, res) => {
        const prisma = getPrismaClient();
        const snapshotCount = await prisma.dNASnapshot.count();
        const staleCount = await prisma.dNASnapshot.count({
            where: { staleAfter: { lt: new Date() } },
        });
        res.json({
            snapshots: { total: snapshotCount, stale: staleCount },
            providers: [{ name: 'template', state: 'closed', successRate: 1.0 }],
        });
    }));
    return router;
}
//# sourceMappingURL=index.js.map