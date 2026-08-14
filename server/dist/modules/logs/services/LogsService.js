import { getPrismaClient } from '../../../infra/database/prisma.client.js';
import { NotFoundError } from '../../../shared/errors/NotFoundError.js';
import { ForbiddenError } from '../../../shared/errors/ForbiddenError.js';
import { eventBus } from '../../../shared/events/event-bus.js';
export class LogsService {
    async getUserLogs(userId) {
        return getPrismaClient().bookLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getBookLogs(userId, bookId) {
        return getPrismaClient().bookLog.findMany({
            where: { userId, bookId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getCommunityLogs() {
        return getPrismaClient().bookLog.findMany({
            where: { notes: { not: '' } },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: { user: { select: { username: true } } },
        });
    }
    async getBookCommunityLogs(bookId) {
        return getPrismaClient().bookLog.findMany({
            where: { bookId, notes: { not: '' } },
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: { user: { select: { username: true } } },
        });
    }
    async getUserProfileLogs(username) {
        const user = await getPrismaClient().user.findUnique({
            where: { username },
            select: { id: true, username: true, createdAt: true },
        });
        if (!user)
            throw new NotFoundError('User not found');
        const logs = await getPrismaClient().bookLog.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        return { user, logs };
    }
    async createLog(userId, data) {
        const log = await getPrismaClient().bookLog.create({
            data: {
                bookId: data.bookId,
                bookTitle: data.bookTitle ?? null,
                coverUrl: data.coverUrl ?? null,
                author: data.author ?? null,
                rating: data.rating,
                dateRead: (data.dateRead || new Date().toISOString().split('T')[0]),
                notes: data.notes ?? '',
                hasSpoilers: data.hasSpoilers ?? false,
                userId,
            },
        });
        try {
            eventBus.emit('log.created', { userId, log });
        }
        catch { }
        return log;
    }
    async deleteLog(logId, userId) {
        const log = await getPrismaClient().bookLog.findUnique({ where: { id: logId } });
        if (!log)
            throw new NotFoundError('Log not found');
        if (log.userId !== userId)
            throw new ForbiddenError('Not allowed');
        await getPrismaClient().bookLog.delete({ where: { id: logId } });
        try {
            eventBus.emit('log.deleted', { userId, log });
        }
        catch { }
        return { success: true };
    }
}
//# sourceMappingURL=LogsService.js.map