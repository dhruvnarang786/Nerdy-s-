import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export function setupSocketHandlers(io, prisma) {
    // Auth middleware for Socket.io
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication required'));
        try {
            const payload = jwt.verify(token, JWT_SECRET);
            socket.userId = payload.userId;
            next();
        } catch {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket) => {
        // Fetch user info
        const user = await prisma.user.findUnique({
            where: { id: socket.userId },
            select: { id: true, username: true }
        });
        if (!user) return socket.disconnect();

        socket.user = user;
        console.log(`🟢 ${user.username} connected`);

        // Join a chat room
        socket.on('join_room', async (slug) => {
            // Leave previous rooms (except socket's own room)
            for (const room of socket.rooms) {
                if (room !== socket.id) socket.leave(room);
            }

            const room = await prisma.chatRoom.findUnique({ where: { slug } });
            if (!room) return socket.emit('error', 'Room not found');

            socket.currentRoom = room;
            socket.join(slug);

            // Send last 50 messages
            const history = await prisma.message.findMany({
                where: { roomId: room.id },
                orderBy: { createdAt: 'asc' },
                take: 50,
                include: { user: { select: { username: true } } },
            });
            socket.emit('message_history', history.map(formatMessage));

            // Announce to room
            const roomSize = io.sockets.adapter.rooms.get(slug)?.size || 0;
            io.to(slug).emit('room_stats', { onlineCount: roomSize });

            console.log(`📚 ${user.username} joined #${slug}`);
        });

        // Send a message
        socket.on('send_message', async (content) => {
            if (!socket.currentRoom) return;
            if (!content?.trim()) return;
            if (content.length > 1000) return socket.emit('error', 'Message too long');

            try {
                const message = await prisma.message.create({
                    data: {
                        content: content.trim(),
                        userId: user.id,
                        roomId: socket.currentRoom.id,
                    },
                    include: { user: { select: { username: true } } },
                });
                io.to(socket.currentRoom.slug).emit('new_message', formatMessage(message));
            } catch (err) {
                console.error('Message save error:', err);
            }
        });

        // Typing indicator
        socket.on('typing_start', () => {
            if (socket.currentRoom) {
                socket.to(socket.currentRoom.slug).emit('user_typing', { username: user.username });
            }
        });

        socket.on('typing_stop', () => {
            if (socket.currentRoom) {
                socket.to(socket.currentRoom.slug).emit('user_stop_typing', { username: user.username });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔴 ${user.username} disconnected`);
            if (socket.currentRoom) {
                const roomSize = io.sockets.adapter.rooms.get(socket.currentRoom.slug)?.size || 0;
                io.to(socket.currentRoom.slug).emit('room_stats', { onlineCount: Math.max(0, roomSize) });
            }
        });
    });
}

function formatMessage(msg) {
    return {
        id: msg.id,
        content: msg.content,
        username: msg.user.username,
        createdAt: msg.createdAt,
    };
}
