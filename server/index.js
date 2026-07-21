import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import authRoutes from './routes/auth.js';
import logsRoutes from './routes/logs.js';
import favoritesRoutes from './routes/favorites.js';
import chatRoutes from './routes/chat.js';
import aiRoutes from './routes/aiRoutes.js';
import dnaRoutes from './routes/dna.js';
import profileRoutes from './routes/profile.js';
import friendsRoutes from './routes/friends.js';
import booksRoutes from './routes/books.js';
import { setupSocketHandlers } from './socket/chat.js';

const { Pool } = pg;

// Initialize Prisma with connection pooling
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

const app = express();
const httpServer = createServer(app);

// Configure CORS with specific origins for security
const corsOptions = {
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(o => o.trim()) : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const io = new Server(httpServer, {
  cors: corsOptions,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: false,
  },
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dna', dnaRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/books', booksRoutes);

// Health check / keep-alive endpoint
app.get('/ping', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage().heapUsed / 1024 / 1024,
  });
});
app.get('/', (_req, res) => res.json({ message: "Nerdy's API is running" }));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// 404 handler for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.io
setupSocketHandlers(io, prisma);

// Seed default chat rooms
async function seedChatRooms() {
    const rooms = [
        { name: 'General', slug: 'general', description: 'Open community chat for all book lovers', emoji: '📢' },
        { name: 'Currently Reading', slug: 'currently-reading', description: 'Share what you\'re reading right now', emoji: '📖' },
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
    console.log('✅ Chat rooms seeded');
}

const PORT = process.env.PORT || 5000;

// Graceful shutdown handler
function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    httpServer.close(async () => {
        console.log('HTTP server closed');
        
        try {
            await prisma.$disconnect();
            console.log('Database connection closed');
            console.log('✅ Server shutdown complete');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

async function main() {
    try {
        await prisma.$connect();
        console.log('✅ Database connected');
        
        await seedChatRooms();
        
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🔌 Socket.io ready for live chat`);

            // Keep-alive: ping ourselves every 14 minutes to prevent Render free-tier sleep
            const selfUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
            setInterval(async () => {
                try {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 5000);
                    await fetch(`${selfUrl}/ping`, { signal: controller.signal });
                    clearTimeout(timeout);
                    console.log('💓 Keep-alive ping sent');
                } catch (e) {
                    console.warn('Keep-alive ping failed:', e.message);
                }
            }, 14 * 60 * 1000); // every 14 minutes
        });
    } catch (e) {
        console.error('❌ Server failed to start:', e);
        process.exit(1);
    }
}

main();
