import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const token = authHeader.slice(7);
        const payload = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, username: true, email: true }
        });
        if (!user) return res.status(401).json({ error: 'User not found' });
        req.user = user;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
