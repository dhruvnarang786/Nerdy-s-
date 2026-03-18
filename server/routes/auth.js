import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

// Verify a Google Identity Services (GSI) credential JWT
async function verifyGoogleToken(credential) {
    const certsRes = await fetch('https://www.googleapis.com/oauth2/v3/certs');
    const { keys } = await certsRes.json();

    const [headerB64] = credential.split('.');
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());

    const key = keys.find(k => k.kid === header.kid);
    if (!key) throw new Error('No matching Google key found');

    const { createPublicKey } = await import('crypto');
    const pubKey = createPublicKey({ key, format: 'jwk' });
    const pem = pubKey.export({ type: 'spki', format: 'pem' });

    const payload = jwt.verify(credential, pem, { algorithms: ['RS256'] });
    return payload;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Basic email format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
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

        // Google-only accounts have no password hash
        if (!user.passwordHash) {
            return res.status(401).json({ error: 'This account uses Google Sign-In. Please click "Continue with Google".' });
        }

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

// POST /api/auth/google — Sign in or sign up via Google
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ error: 'Google credential required' });

        const payload = await verifyGoogleToken(credential);
        const { email, name, sub: googleId } = payload;

        if (!email) return res.status(400).json({ error: 'No email from Google' });

        // Find existing user or create new one
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // New user — create with Google info
            // Generate a unique username from their name
            const baseUsername = (name || email.split('@')[0])
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .slice(0, 20) || 'user';

            // Ensure username is unique by appending part of googleId if needed
            let username = baseUsername;
            const existingUsername = await prisma.user.findUnique({ where: { username } });
            if (existingUsername) {
                username = `${baseUsername}${googleId.slice(-4)}`;
            }

            user = await prisma.user.create({
                data: {
                    username,
                    email,
                    passwordHash: null,  // No password for Google accounts
                    googleId,
                },
                select: { id: true, username: true, email: true }
            });
        }

        const token = generateToken(user.id);
        res.json({
            user: { id: user.id, username: user.username, email: user.email },
            token
        });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
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
