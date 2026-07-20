import { getPrismaClient } from '../../../infra/database/prisma.client.js';
import { logger } from '../../../infra/logger/logger.js';
export class RefreshTokenStore {
    async save(record) {
        const prisma = getPrismaClient();
        await prisma.refreshToken.upsert({
            where: { jti: record.jti },
            update: { revoked: record.revoked, expiresAt: record.expiresAt },
            create: { jti: record.jti, userId: record.userId, expiresAt: record.expiresAt, revoked: record.revoked },
        });
    }
    async findByJti(jti) {
        const prisma = getPrismaClient();
        const record = await prisma.refreshToken.findUnique({ where: { jti } });
        if (!record)
            return null;
        if (Date.now() > record.expiresAt.getTime() || record.revoked) {
            return null;
        }
        return { jti: record.jti, userId: record.userId, expiresAt: record.expiresAt, revoked: record.revoked };
    }
    async revoke(jti) {
        const prisma = getPrismaClient();
        await prisma.refreshToken.update({
            where: { jti },
            data: { revoked: true },
        }).catch(() => { });
    }
    async revokeAllForUser(userId) {
        const prisma = getPrismaClient();
        const { count } = await prisma.refreshToken.updateMany({
            where: { userId, revoked: false },
            data: { revoked: true },
        });
        logger.info({ userId, count }, 'All refresh tokens revoked for user');
    }
    async cleanupExpired() {
        const prisma = getPrismaClient();
        const { count } = await prisma.refreshToken.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
        if (count > 0)
            logger.info({ count }, 'Expired refresh tokens cleaned up');
        return count;
    }
}
//# sourceMappingURL=RefreshTokenStore.js.map