import { getPrismaClient } from '../../../infra/database/prisma.client.js';
export class ProfileService {
    async updateBio(userId, bio) {
        const updatedUser = await getPrismaClient().user.update({
            where: { id: userId },
            data: { bio: bio || '' },
        });
        return { bio: updatedUser.bio };
    }
}
//# sourceMappingURL=ProfileService.js.map