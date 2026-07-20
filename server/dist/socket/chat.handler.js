import jwt from 'jsonwebtoken';
import { config } from '../infra/config/config.js';
import { logger } from '../infra/logger/logger.js';
import { getPrismaClient } from '../infra/database/prisma.client.js';
function formatMessage(msg) {
    return { id: msg.id, content: msg.content, username: msg.user.username, createdAt: msg.createdAt };
}
export function setupSocketHandlers(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token)
            return next(new Error('Authentication required'));
        try {
            const payload = jwt.verify(token, config.JWT_SECRET);
            socket.userId = payload.userId;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', async (socket) => {
        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({
            where: { id: socket.userId },
            select: { id: true, username: true },
        });
        if (!user) {
            socket.disconnect();
            return;
        }
        ;
        socket.user = user;
        logger.info({ username: user.username }, 'Socket connected');
        socket.on('join_room', async (slug) => {
            for (const room of socket.rooms) {
                if (room !== socket.id)
                    socket.leave(room);
            }
            const room = await prisma.chatRoom.findUnique({ where: { slug } });
            if (!room) {
                socket.emit('error', 'Room not found');
                return;
            }
            ;
            socket.currentRoom = room;
            socket.join(slug);
            const history = await prisma.message.findMany({
                where: { roomId: room.id },
                orderBy: { createdAt: 'asc' },
                take: 50,
                include: { user: { select: { username: true } } },
            });
            socket.emit('message_history', history.map(formatMessage));
            const roomSize = io.sockets.adapter.rooms.get(slug)?.size || 0;
            io.to(slug).emit('room_stats', { onlineCount: roomSize });
        });
        socket.on('send_message', async (content) => {
            const currentRoom = socket.currentRoom;
            if (!currentRoom)
                return;
            if (!content?.trim())
                return;
            if (content.length > 1000) {
                socket.emit('error', 'Message too long');
                return;
            }
            try {
                const message = await prisma.message.create({
                    data: { content: content.trim(), userId: user.id, roomId: currentRoom.id },
                    include: { user: { select: { username: true } } },
                });
                io.to(currentRoom.slug).emit('new_message', formatMessage(message));
            }
            catch (err) {
                logger.error({ err }, 'Message save error');
            }
        });
        socket.on('typing_start', () => {
            const currentRoom = socket.currentRoom;
            if (currentRoom)
                socket.to(currentRoom.slug).emit('user_typing', { username: user.username });
        });
        socket.on('typing_stop', () => {
            const currentRoom = socket.currentRoom;
            if (currentRoom)
                socket.to(currentRoom.slug).emit('user_stop_typing', { username: user.username });
        });
        socket.on('disconnect', () => {
            logger.info({ username: user.username }, 'Socket disconnected');
            const currentRoom = socket.currentRoom;
            if (currentRoom) {
                const roomSize = io.sockets.adapter.rooms.get(currentRoom.slug)?.size || 0;
                io.to(currentRoom.slug).emit('room_stats', { onlineCount: Math.max(0, roomSize) });
            }
        });
    });
}
//# sourceMappingURL=chat.handler.js.map