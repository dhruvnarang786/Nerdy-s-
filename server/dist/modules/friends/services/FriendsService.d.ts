export declare class FriendsService {
    getFriends(userId: number): Promise<{
        id: number;
        username: string;
        _count: {
            logs: number;
        };
    }[]>;
    addFriend(userId: number, username: string, currentUsername: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=FriendsService.d.ts.map