import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user exists
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] }
        });
        if (existing) {
            return res.status(409).json({
                error: existing.email === email ? 'Email already in use' : 'Username already taken'
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { username, email, passwordHash },
            select: { id: true, username: true, email: true, createdAt: true }
        });

        const token = generateToken(user.id);
        res.status(201).json({ user, token });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = generateToken(user.id);
        res.json({
            user: { id: user.id, username: user.username, email: user.email },
            token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token' });
        }
        const token = authHeader.slice(7);
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, username: true, email: true, createdAt: true }
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;
