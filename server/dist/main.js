import { createApp } from './app.js';
import { config } from './infra/config/config.js';
import { logger } from './infra/logger/logger.js';
import { getPrismaClient, connectDatabase, disconnectDatabase } from './infra/database/prisma.client.js';
import { registerModules } from './modules/index.js';
import { applyErrorHandler } from './gateway/index.js';
import { createSocketServer, seedChatRooms, startKeepAlive } from './socket/index.js';
const app = createApp();
const { httpServer } = createSocketServer(app);
app.get('/ping', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});
app.get('/health', async (_req, res) => {
    const checks = {
        database: { status: 'healthy' },
    };
    try {
        await getPrismaClient().$queryRaw `SELECT 1`;
    }
    catch {
        checks.database = { status: 'unhealthy' };
    }
    const allHealthy = Object.values(checks).every(c => c.status === 'healthy');
    res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'ok' : 'degraded',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
        checks,
    });
});
app.get('/', (_req, res) => {
    res.json({ message: "Nerdy's API" });
});
async function main() {
    logger.info("Starting Nerdy's API");
    await connectDatabase();
    await seedChatRooms();
    registerModules(app);
    applyErrorHandler(app);
    startKeepAlive(httpServer);
    httpServer.listen(config.PORT, config.HOST, () => {
        logger.info({ port: config.PORT, host: config.HOST, env: config.NODE_ENV }, 'Server listening');
    });
}
function shutdown(signal) {
    logger.info({ signal }, 'Shutdown signal received');
    httpServer.close(async () => {
        logger.info('HTTP server closed');
        try {
            await disconnectDatabase();
        }
        catch (err) {
            logger.error({ err }, 'Error disconnecting database');
        }
        logger.info('Graceful shutdown complete');
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception');
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    logger.fatal({ err: reason }, 'Unhandled rejection');
    process.exit(1);
});
main().catch((err) => {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
});
//# sourceMappingURL=main.js.map