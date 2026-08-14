import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID, createPublicKey } from 'crypto';
import { getPrismaClient } from '../../../infra/database/prisma.client.js';
import { config } from '../../../infra/config/config.js';
import { ConflictError } from '../../../shared/errors/ConflictError.js';
import { AuthError } from '../../../shared/errors/AuthError.js';
import { ValidationError } from '../../../shared/errors/ValidationError.js';
const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY_S = 900;
const REFRESH_TOKEN_EXPIRY_S = 604800;
let googleCertsCache = null;
const GOOGLE_CERTS_CACHE_TTL_MS = 3600000;
export class AuthService {
    refreshTokenStore;
    constructor(refreshTokenStore) {
        this.refreshTokenStore = refreshTokenStore;
    }
    async register(username, email, password) {
        const prisma = getPrismaClient();
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existing) {
            const field = existing.email === email ? 'Email' : 'Username';
            throw new ConflictError(`${field} already in use`);
        }
        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const user = await prisma.user.create({
            data: { username, email, passwordHash },
            select: { id: true, username: true, email: true, createdAt: true },
        });
        const tokens = await this.generateTokenPair(user.id);
        return { user, tokens };
    }
    async login(email, password) {
        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new AuthError('Invalid credentials');
        if (!user.passwordHash) {
            throw new AuthError('This account uses Google Sign-In. Please click "Continue with Google".');
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            throw new AuthError('Invalid credentials');
        const tokens = await this.generateTokenPair(user.id);
        return {
            user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt },
            tokens,
        };
    }
    async googleAuth(credential) {
        const payload = await this.verifyGoogleToken(credential);
        const email = payload.email;
        const name = payload.name;
        const googleId = payload.sub;
        if (!email)
            throw new ValidationError('No email returned from Google');
        const prisma = getPrismaClient();
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            const baseUsername = (name || email.split('@')[0])
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .slice(0, 20) || 'user';
            let username = baseUsername;
            const existingUsername = await prisma.user.findUnique({ where: { username } });
            if (existingUsername) {
                username = `${baseUsername}${googleId.slice(-4)}`;
            }
            const created = await prisma.user.create({
                data: { username, email, passwordHash: null, googleId },
                select: { id: true, username: true, email: true, createdAt: true },
            });
            return {
                user: created,
                tokens: await this.generateTokenPair(created.id),
            };
        }
        return {
            user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt },
            tokens: await this.generateTokenPair(user.id),
        };
    }
    async refreshToken(token) {
        const decoded = this.verifyRefreshToken(token);
        const record = await this.refreshTokenStore.findByJti(decoded.jti);
        if (!record)
            throw new AuthError('Invalid or expired refresh token');
        await this.refreshTokenStore.revoke(decoded.jti);
        return this.generateTokenPair(decoded.userId);
    }
    async logout(refreshToken) {
        const decoded = this.verifyRefreshToken(refreshToken);
        await this.refreshTokenStore.revoke(decoded.jti);
    }
    async logoutAll(userId) {
        await this.refreshTokenStore.revokeAllForUser(userId);
    }
    async getMe(userId) {
        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true, email: true, createdAt: true },
        });
        return user;
    }
    verifyAccessToken(token) {
        try {
            const payload = jwt.verify(token, config.JWT_SECRET);
            if (payload.type !== 'access')
                throw new AuthError('Invalid token type');
            return payload;
        }
        catch (err) {
            if (err instanceof AuthError)
                throw err;
            throw new AuthError('Invalid or expired access token');
        }
    }
    async generateTokenPair(userId) {
        const jti = randomUUID();
        const accessToken = jwt.sign({ userId, type: 'access' }, config.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY_S });
        const refreshToken = jwt.sign({ userId, type: 'refresh', jti }, config.JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY_S });
        await this.refreshTokenStore.save({
            jti,
            userId,
            expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_S * 1000),
            revoked: false,
        });
        return { accessToken, refreshToken, expiresIn: ACCESS_TOKEN_EXPIRY_S };
    }
    verifyRefreshToken(token) {
        try {
            const payload = jwt.verify(token, config.JWT_SECRET);
            if (payload.type !== 'refresh')
                throw new AuthError('Invalid token type');
            return payload;
        }
        catch (err) {
            if (err instanceof AuthError)
                throw err;
            throw new AuthError('Invalid or expired refresh token');
        }
    }
    async fetchGoogleCerts() {
        if (googleCertsCache && Date.now() - googleCertsCache.fetchedAt < GOOGLE_CERTS_CACHE_TTL_MS) {
            return googleCertsCache.keys;
        }
        const certsRes = await fetch('https://www.googleapis.com/oauth2/v3/certs', {
            signal: AbortSignal.timeout(10000),
        });
        if (!certsRes.ok)
            throw new AuthError('Failed to fetch Google verification keys');
        const { keys } = await certsRes.json();
        googleCertsCache = { keys, fetchedAt: Date.now() };
        return keys;
    }
    async verifyGoogleToken(credential) {
        const keys = await this.fetchGoogleCerts();
        const [headerB64] = credential.split('.');
        const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString());
        const key = keys.find(k => k.kid === header.kid);
        if (!key)
            throw new AuthError('No matching Google key found');
        const pubKey = createPublicKey({ key: key, format: 'jwk' });
        const pem = pubKey.export({ type: 'spki', format: 'pem' });
        const payload = jwt.verify(credential, pem, {
            algorithms: ['RS256'],
            audience: config.GOOGLE_CLIENT_ID || undefined,
        });
        return payload;
    }
}
//# sourceMappingURL=AuthService.js.map