import express from 'express';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';
import { dnaEventService } from '../services/dna/index.js';

const router = express.Router();

// GET /api/favorites — current user's favorites
router.get('/', requireAuth, async (req, res) => {
    try {
        const favorites = await prisma.favorite.findMany({
            where: { userId: req.user.id },
            orderBy: { addedAt: 'desc' },
        });
        res.json({ favorites });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/favorites — add a favorite (idempotent)
router.post('/', requireAuth, async (req, res) => {
    try {
        const { bookId, bookTitle, coverUrl, author } = req.body;
        if (!bookId) return res.status(400).json({ error: 'bookId required' });

        const favorite = await prisma.favorite.upsert({
            where: { userId_bookId: { userId: req.user.id, bookId } },
            update: {},
            create: { bookId, bookTitle, coverUrl, author, userId: req.user.id },
        });
        try { dnaEventService.emit('favorite.added', { userId: req.user.id, favorite }); } catch (_) {}
        res.status(201).json({ favorite });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/favorites/:bookId — remove a favorite
router.delete('/:bookId', requireAuth, async (req, res) => {
    try {
        await prisma.favorite.deleteMany({
            where: { userId: req.user.id, bookId: req.params.bookId }
        });
        try { dnaEventService.emit('favorite.removed', { userId: req.user.id, favorite: { bookId: req.params.bookId } }); } catch (_) {}
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
