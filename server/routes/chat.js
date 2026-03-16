import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// GET /api/chat/rooms — list all rooms
router.get('/rooms', async (_req, res) => {
    try {
        const rooms = await prisma.chatRoom.findMany({ orderBy: { id: 'asc' } });
        res.json({ rooms });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/chat/rooms/:slug — get room info
router.get('/rooms/:slug', async (req, res) => {
    try {
        const room = await prisma.chatRoom.findUnique({ where: { slug: req.params.slug } });
        if (!room) return res.status(404).json({ error: 'Room not found' });
        res.json({ room });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/chat/rooms/:slug/messages — message history (last 50)
router.get('/rooms/:slug/messages', async (req, res) => {
    try {
        const room = await prisma.chatRoom.findUnique({ where: { slug: req.params.slug } });
        if (!room) return res.status(404).json({ error: 'Room not found' });

        const messages = await prisma.message.findMany({
            where: { roomId: room.id },
            orderBy: { createdAt: 'asc' },
            take: 50,
            include: { user: { select: { username: true } } },
        });
        res.json({ messages });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
