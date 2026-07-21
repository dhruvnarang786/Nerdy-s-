import express from 'express';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// PUT /api/profile
router.put('/', requireAuth, async (req, res) => {
    try {
        const { bio, username } = req.body;
        
        // Validate input
        if (!bio && !username) {
            return res.status(400).json({ error: 'At least one field to update is required' });
        }
        
        // Check if username is already taken (if updating username)
        if (username && username !== req.user.username) {
            const existingUser = await prisma.user.findFirst({
                where: { username, id: { not: req.user.id } }
            });
            if (existingUser) {
                return res.status(409).json({ error: 'Username already taken' });
            }
        }

        const updateData = {
            ...(bio !== undefined && { bio: bio || '' }),
            ...(username && { username }),
        };

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: { id: true, username: true, email: true, bio: true, createdAt: true }
        });

        res.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

// GET /api/profile
router.get('/', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, username: true, email: true, bio: true, createdAt: true }
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ user });
    } catch (err) {
        console.error('Error fetching profile:', err);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

export default router;
