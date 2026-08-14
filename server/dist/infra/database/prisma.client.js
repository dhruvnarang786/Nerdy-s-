import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from '../config/config.js';
import { logger } from '../logger/logger.js';
const { Pool } = pg;
let prisma;
export function getPrismaClient() {
    if (!prisma) {
        const pool = new Pool({
            connectionString: config.DATABASE_URL,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
        logger.info('Prisma client initialized');
    }
    return prisma;
}
export async function connectDatabase() {
    const client = getPrismaClient();
    await client.$connect();
    logger.info('Database connected');
}
export async function disconnectDatabase() {
    if (prisma) {
        await prisma.$disconnect();
        logger.info('Database disconnected');
    }
}
//# sourceMappingURL=prisma.client.js.map