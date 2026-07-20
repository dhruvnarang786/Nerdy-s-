import { createServer } from 'http';
import { Server } from 'socket.io';
import type { Express } from 'express';
export declare function createSocketServer(app: Express): {
    httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
    io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
};
export declare function seedChatRooms(): Promise<void>;
export declare function startKeepAlive(httpServer: ReturnType<typeof createServer>): void;
//# sourceMappingURL=index.d.ts.map