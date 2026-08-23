import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// In-memory cache for public stats (5-minute TTL)
let statsCache = null;
let lastFetched = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

// GET /api/stats/public — Real platform statistics
router.get('/public', async (_req, res) => {
    try {
        const now = Date.now();
        if (statsCache && now - lastFetched < CACHE_TTL_MS) {
            return res.json(statsCache);
        }

        const [totalLogs, totalReviews, totalUsers, totalFavorites] = await Promise.all([
            prisma.bookLog.count(),
            prisma.bookLog.count({ where: { notes: { not: '' } } }),
            prisma.user.count(),
            prisma.favorite.count(),
        ]);

        statsCache = {
            totalLogs,
            totalReviews,
            totalUsers,
            totalFavorites,
            updatedAt: new Date().toISOString(),
        };
        lastFetched = now;

        res.json(statsCache);
    } catch (err) {
        console.error('Public stats error:', err);
        res.json({
            totalLogs: 0,
            totalReviews: 0,
            totalUsers: 0,
            totalFavorites: 0,
        });
    }
});

export default router;
