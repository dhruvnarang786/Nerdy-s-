import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seed() {
    try {
        await prisma.$connect();

        const user = await prisma.user.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        if (!user) {
            console.log('No user found');
            process.exit(0);
        }

        console.log('Seeding for:', user.username);
        // Clear old logs so we don't infinitely stack them
        await prisma.bookLog.deleteMany({ where: { userId: user.id } });

        const books = [
            { id: 'v1', title: 'The Secret History', author: 'Donna Tartt', rating: 5, dateRead: '2026-02-21' },
            { id: 'v2', title: 'Dune', author: 'Frank Herbert', rating: 4, dateRead: '2026-02-22' },
            { id: 'v3', title: 'If We Were Villains', author: 'M.L. Rio', rating: 5, dateRead: '2026-02-23' },
            { id: 'v4', title: 'Babel', author: 'R. F. Kuang', rating: 4, dateRead: '2026-02-24' },
            { id: 'v5', title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', rating: 5, dateRead: '2026-02-25' },
            { id: 'v6', title: 'Piranesi', author: 'Susanna Clarke', rating: 5, dateRead: '2026-02-26' },
            { id: 'v7', title: 'Project Hail Mary', author: 'Andy Weir', rating: 5, dateRead: '2026-02-27' }
        ];

        let count = 0;
        for (let i = 0; i < books.length; i++) {
            const book = books[i];
            const isNight = i % 2 === 0;
            let tDate = new Date(book.dateRead);
            tDate.setHours(isNight ? 2 : 14, 30, 0, 0);

            await prisma.bookLog.create({
                data: {
                    bookId: book.id,
                    bookTitle: book.title,
                    author: book.author,
                    rating: book.rating,
                    dateRead: book.dateRead,
                    notes: 'A fantastic read.',
                    userId: user.id,
                    createdAt: tDate
                }
            });
            count++;
        }
        console.log('Seeded ' + count + ' dummy book logs! The Reading DNA page will now show a 7-day streak and other stats.');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}
seed();
