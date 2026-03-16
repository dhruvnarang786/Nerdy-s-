import express from 'express';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/friends
router.get('/', requireAuth, async (req, res) => {
    try {
        const userWithFriends = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                friends: {
                    select: {
                        id: true,
                        username: true,
                        bio: true,
                        _count: {
                            select: { logs: true }
                        }
                    }
                }
            }
        });

        res.json({ friends: userWithFriends?.friends || [] });
    } catch (err) {
        console.error('Error fetching friends:', err);
        res.status(500).json({ error: 'Server error fetching friends' });
    }
});

// POST /api/friends/add
router.post('/add', requireAuth, async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        if (username.toLowerCase() === req.user.username.toLowerCase()) {
            return res.status(400).json({ error: 'You cannot add yourself as a friend' });
        }

        const friend = await prisma.user.findUnique({
            where: { username }
        });

        if (!friend) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Connect them (uni-directional for simplicity, or bi-directional)
        // Let's make it a mutual connection for UX simplicity in this prototype
        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                friends: {
                    connect: { id: friend.id }
                }
            }
        });
        await prisma.user.update({
            where: { id: friend.id },
            data: {
                friends: {
                    connect: { id: req.user.id }
                }
            }
        });

        res.json({ success: true, message: 'Friend added successfully!' });
    } catch (err) {
        console.error('Error adding friend:', err);
        res.status(500).json({ error: 'Server error adding friend' });
    }
});

export default router;
