import { getPrismaClient } from '../../../infra/database/prisma.client.js';
import { NotFoundError } from '../../../shared/errors/NotFoundError.js';
export class ChatService {
    async listRooms() {
        return getPrismaClient().chatRoom.findMany({ orderBy: { id: 'asc' } });
    }
    async getRoom(slug) {
        const room = await getPrismaClient().chatRoom.findUnique({ where: { slug } });
        if (!room)
            throw new NotFoundError('Room not found');
        return room;
    }
    async getRoomMessages(slug) {
        const room = await getPrismaClient().chatRoom.findUnique({ where: { slug } });
        if (!room)
            throw new NotFoundError('Room not found');
        return getPrismaClient().message.findMany({
            where: { roomId: room.id },
            orderBy: { createdAt: 'asc' },
            take: 50,
            include: { user: { select: { username: true } } },
        });
    }
}
//# sourceMappingURL=ChatService.js.map