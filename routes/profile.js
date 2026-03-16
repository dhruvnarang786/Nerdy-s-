import express from 'express';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// PUT /api/profile
router.put('/', requireAuth, async (req, res) => {
    try {
        const { bio } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: { bio: bio || '' }
        });

        res.json({ success: true, bio: updatedUser.bio });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

export default router;
