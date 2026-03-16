import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import jwt from 'jsonwebtoken';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function debug() {
    await prisma.$connect();
    const user = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!user) return console.log('no user');

    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    try {
        const res = await fetch('http://localhost:5000/api/dna', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        console.log('STATUS:', res.status);
        const text = await res.text();
        console.log('BODY:', text);
    } catch (e) {
        console.log('ERR', e);
    }
    await prisma.$disconnect();
    process.exit(0);
}
debug();
