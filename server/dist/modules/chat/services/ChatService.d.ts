export declare class ChatService {
    listRooms(): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        slug: string;
        description: string | null;
        emoji: string | null;
    }[]>;
    getRoom(slug: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        slug: string;
        description: string | null;
        emoji: string | null;
    }>;
    getRoomMessages(slug: string): Promise<({
        user: {
            username: string;
        };
    } & {
        userId: number;
        id: number;
        createdAt: Date;
        content: string;
        roomId: number;
    })[]>;
}
//# sourceMappingURL=ChatService.d.ts.map