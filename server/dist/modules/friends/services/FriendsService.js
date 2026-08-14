import { getPrismaClient } from '../../../infra/database/prisma.client.js';
import { NotFoundError } from '../../../shared/errors/NotFoundError.js';
import { ConflictError } from '../../../shared/errors/ConflictError.js';
export class FriendsService {
    async getFriends(userId) {
        const user = await getPrismaClient().user.findUnique({
            where: { id: userId },
            include: {
                friends: {
                    select: {
                        id: true,
                        username: true,
                        _count: { select: { logs: true } },
                    },
                },
            },
        });
        return user?.friends || [];
    }
    async addFriend(userId, username, currentUsername) {
        if (username.toLowerCase() === currentUsername.toLowerCase()) {
            throw new ConflictError('You cannot add yourself as a friend');
        }
        const friend = await getPrismaClient().user.findUnique({ where: { username } });
        if (!friend)
            throw new NotFoundError('User not found');
        await getPrismaClient().user.update({
            where: { id: userId },
            data: { friends: { connect: { id: friend.id } } },
        });
        await getPrismaClient().user.update({
            where: { id: friend.id },
            data: { friends: { connect: { id: userId } } },
        });
        return { success: true };
    }
}
//# sourceMappingURL=FriendsService.js.map