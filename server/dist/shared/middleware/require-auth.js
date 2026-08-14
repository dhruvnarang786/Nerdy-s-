import jwt from 'jsonwebtoken';
import { AuthError } from '../errors/AuthError.js';
import { config } from '../../infra/config/config.js';
import { getPrismaClient } from '../../infra/database/prisma.client.js';
function extractBearerToken(authHeader) {
    if (!authHeader?.startsWith('Bearer '))
        return null;
    return authHeader.slice(7);
}
export function requireAuth() {
    return (req, _res, next) => {
        const token = extractBearerToken(req.headers.authorization);
        if (!token)
            return next(new AuthError('Authentication required'));
        try {
            const payload = jwt.verify(token, config.JWT_SECRET);
            if (payload.type && payload.type !== 'access') {
                return next(new AuthError('Invalid token type'));
            }
            getPrismaClient()
                .user.findUnique({
                where: { id: payload.userId },
                select: { id: true, username: true, email: true },
            })
                .then(user => {
                if (!user)
                    return next(new AuthError('User not found'));
                req.user = { id: user.id, username: user.username, email: user.email };
                next();
            })
                .catch(err => {
                next(new AuthError('Failed to verify user'));
            });
        }
        catch (err) {
            next(new AuthError('Invalid or expired token'));
        }
    };
}
export function optionalAuth() {
    return (req, _res, next) => {
        const token = extractBearerToken(req.headers.authorization);
        if (!token)
            return next();
        try {
            const payload = jwt.verify(token, config.JWT_SECRET);
            getPrismaClient()
                .user.findUnique({
                where: { id: payload.userId },
                select: { id: true, username: true, email: true },
            })
                .then(user => {
                if (user) {
                    req.user = { id: user.id, username: user.username, email: user.email };
                }
                next();
            })
                .catch(() => {
                next();
            });
        }
        catch {
            next();
        }
    };
}
//# sourceMappingURL=require-auth.js.map