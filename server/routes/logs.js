import express from 'express';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/logs — current user's logs (auth required)
router.get('/', requireAuth, async (req, res) => {
    try {
        const logs = await prisma.bookLog.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/logs/community — recent public reviews with notes (public)
router.get('/community', async (_req, res) => {
    try {
        const logs = await prisma.bookLog.findMany({
            where: { notes: { not: '' } },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                user: { select: { username: true } }
            }
        });
        res.json({ logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/logs/book/:bookId/community — public reviews for a specific book
router.get('/book/:bookId/community', async (req, res) => {
    try {
        const logs = await prisma.bookLog.findMany({
            where: {
                bookId: req.params.bookId,
                notes: { not: '' }
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
                user: { select: { username: true } }
            }
        });
        res.json({ logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/logs/user/:username — public profile logs
router.get('/user/:username', async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { username: req.params.username },
            select: { id: true, username: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const logs = await prisma.bookLog.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ user, logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/logs — save a book log (auth required)
router.post('/', requireAuth, async (req, res) => {
    try {
        const { bookId, bookTitle, coverUrl, author, rating, dateRead, notes, hasSpoilers } = req.body;
        if (!bookId || !rating) {
            return res.status(400).json({ error: 'bookId and rating are required' });
        }
        const log = await prisma.bookLog.create({
            data: {
                bookId,
                bookTitle: bookTitle || null,
                coverUrl: coverUrl || null,
                author: author || null,
                rating: Number(rating),
                dateRead: dateRead || new Date().toISOString().split('T')[0],
                notes: notes || '',
                hasSpoilers: hasSpoilers || false,
                userId: req.user.id,
            }
        });
        res.status(201).json({ log });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/logs/:id
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const log = await prisma.bookLog.findUnique({ where: { id: Number(req.params.id) } });
        if (!log || log.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not allowed' });
        }
        await prisma.bookLog.delete({ where: { id: Number(req.params.id) } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
