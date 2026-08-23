import express from 'express';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';
import { dnaComputeService, dnaEventService, dnaQueryService } from '../services/dna/index.js';

const router = express.Router();
const inFlightRecomputes = new Map();

async function deduplicatedRecompute(userId) {
  if (inFlightRecomputes.has(userId)) {
    return inFlightRecomputes.get(userId);
  }
  const promise = dnaComputeService.fullRecompute(userId)
    .finally(() => inFlightRecomputes.delete(userId));
  inFlightRecomputes.set(userId, promise);
  return promise;
}

// GET /api/dna — composable endpoint for all DNA data
router.get('/', requireAuth, async (req, res) => {
  try {
    const fields = req.query.fields
      ? req.query.fields.split(',').map(f => f.trim())
      : [];

    let result = await dnaQueryService.getSnapshot(req.user.id, fields);

    if (!result.exists) {
      // No snapshot yet — compute one on demand (first visit)
      try {
        await deduplicatedRecompute(req.user.id);
        result = await dnaQueryService.getSnapshot(req.user.id, fields);
      } catch (computeErr) {
        console.error('[DNA] First-time compute failed:', computeErr.message);
        return res.status(404).json({ error: 'DNA_NOT_FOUND', message: 'Your DNA hasn\'t formed yet. Log your first book to start building your reading identity.' });
      }
    }

    res.json(result);
  } catch (err) {
    console.error('[DNA] GET error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Something went wrong loading your DNA.' });
  }
});

// POST /api/dna/refresh — manually trigger full recompute
router.post('/refresh', requireAuth, async (req, res) => {
  try {
    const result = await dnaComputeService.fullRecompute(req.user.id);
    res.json({ ok: true, version: result.version, newBadges: result.newBadges });
  } catch (err) {
    console.error('[DNA] Refresh error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR', message: 'DNA refresh failed.' });
  }
});

// GET /api/dna/events — paginated activity event log
router.get('/events', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
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
  } catch (err) {
    console.error('[DNA] Events error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /api/dna/comparison/:username — compare with another user
router.get('/comparison/:username', requireAuth, async (req, res) => {
  try {
    const friend = await prisma.user.findUnique({
      where: { username: req.params.username },
      select: { id: true },
    });

    if (!friend) {
      return res.status(404).json({ error: 'FRIEND_NOT_FOUND', message: 'User not found.' });
    }

    const comparison = await dnaQueryService.compare(req.user.id, friend.id);
    if (!comparison) {
      return res.status(404).json({ error: 'FRIEND_NO_DNA', message: 'Friend hasn\'t unlocked DNA yet.' });
    }

    res.json(comparison);
  } catch (err) {
    console.error('[DNA] Comparison error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /api/dna/badges — full badge details
router.get('/badges', requireAuth, async (req, res) => {
  try {
    const badges = await prisma.badge.findMany({
      where: { userId: req.user.id },
      select: { badgeId: true, unlocked: true, progress: true, progressLabel: true, tier: true, unlockedAt: true, family: true },
    });
    res.json({ badges });
  } catch (err) {
    console.error('[DNA] Badges error:', err.message);
    res.status(500).json({ error: 'INTERNAL_ERROR' });
  }
});

// GET /api/dna/health — DNA system health (admin)
router.get('/health', async (req, res) => {
  const snapshotCount = await prisma.dNASnapshot.count();
  const staleCount = await prisma.dNASnapshot.count({
    where: { staleAfter: { lt: new Date() } },
  });
  res.json({
    snapshots: { total: snapshotCount, stale: staleCount },
    providers: [{ name: 'template', state: 'closed', successRate: 1.0 }],
  });
});

export default router;
