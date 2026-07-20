import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from '../infra/config/config.js';
import { logger } from '../infra/logger/logger.js';
import { getPrismaClient } from '../infra/database/prisma.client.js';
import { setupSocketHandlers } from './chat.handler.js';
const CLIENT_URLS = config.CLIENT_URL.split(',').map(s => s.trim());
const isAllowedSocketOrigin = (origin) => {
    if (!origin)
        return true;
    return CLIENT_URLS.includes(origin) || origin.endsWith('.vercel.app');
};
export function createSocketServer(app) {
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (isAllowedSocketOrigin(origin)) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Origin not allowed'), false);
                }
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });
    setupSocketHandlers(io);
    return { httpServer, io };
}
export async function seedChatRooms() {
    const prisma = getPrismaClient();
    const rooms = [
        { name: 'General', slug: 'general', description: 'Open community chat for all book lovers', emoji: '📢' },
        { name: 'Currently Reading', slug: 'currently-reading', description: "Share what you're reading right now", emoji: '📖' },
        { name: 'Recommendations', slug: 'recommendations', description: 'Ask for and give book recommendations', emoji: '💡' },
        { name: 'Fiction', slug: 'fiction', description: 'Discuss fiction books', emoji: '✨' },
        { name: 'Mystery & Thriller', slug: 'mystery', description: 'Whodunit discussions', emoji: '🕵️' },
        { name: 'Science Fiction', slug: 'sci-fi', description: 'Sci-fi and speculative fiction chat', emoji: '🚀' },
        { name: 'Fantasy', slug: 'fantasy', description: 'Fantasy worlds and magic systems', emoji: '🧙' },
    ];
    for (const room of rooms) {
        await prisma.chatRoom.upsert({
            where: { slug: room.slug },
            update: {},
            create: room,
        });
    }
    logger.info('Chat rooms seeded');
}
export function startKeepAlive(httpServer) {
    const selfUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${config.PORT}`;
    setInterval(async () => {
        try {
            await fetch(`${selfUrl}/ping`);
        }
        catch {
            // keep-alive failures are non-critical
        }
    }, 14 * 60 * 1000).unref();
}
//# sourceMappingURL=index.js.map