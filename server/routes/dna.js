import express from 'express';
import { prisma } from '../index.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to check if two dates are the same day
function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

// GET /api/dna - Get all the derived stats for the Reading DNA page
router.get('/', requireAuth, async (req, res) => {
    try {
        const logs = await prisma.bookLog.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });

        const currentYear = new Date().getFullYear();
        let booksReadThisYear = 0;
        let totalRating = 0;
        let ratingCount = 0;

        // Heatmap: count of books read per month [Jan, Feb, ..., Dec] for the current year
        const heatmap = Array(12).fill(0);

        // Calculate basic stats
        logs.forEach(log => {
            if (log.dateRead && log.dateRead.startsWith(String(currentYear))) {
                booksReadThisYear++;
                // Parse month from YYYY-MM-DD
                const parts = log.dateRead.split('-');
                if (parts.length >= 2) {
                    const monthIndex = parseInt(parts[1], 10) - 1;
                    if (monthIndex >= 0 && monthIndex < 12) {
                        heatmap[monthIndex]++;
                    }
                }
            }
            if (log.rating) {
                totalRating += log.rating;
                ratingCount++;
            }
        });

        const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0;

        // Calculate "Night Owl" - If > 30% of their logs were created between 11PM and 4AM
        let lateNightLogs = 0;
        let weekendLogs = 0;

        // Streak Calculation
        let currentStreak = 0;
        let lastLogDate = null;

        // Sort logs by dateRead (descending) to calculate streak cleanly
        // Using createdAt for badges, dateRead for streak
        const sortedByCreation = [...logs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const sortedByDateRead = [...logs]
            .map(log => ({ ...log, parsedDate: new Date(log.dateRead) }))
            .filter(log => !isNaN(log.parsedDate))
            .sort((a, b) => b.parsedDate - a.parsedDate);

        sortedByCreation.forEach(log => {
            const date = new Date(log.createdAt);
            const hour = date.getHours();
            const day = date.getDay(); // 0 is Sunday, 6 is Saturday

            if (hour >= 23 || hour <= 4) lateNightLogs++;
            if (day === 0 || day === 6) weekendLogs++;
        });

        // Streak logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let checkDate = new Date(today);

        // Does the user have a log for today or yesterday to even have a streak?
        let hasRecentLog = false;

        for (let i = 0; i < sortedByDateRead.length; i++) {
            const logDate = sortedByDateRead[i].parsedDate;
            logDate.setHours(0, 0, 0, 0);

            if (i === 0) {
                // Determine if the most recent log counts towards an active streak (today or yesterday)
                const diffTime = Math.abs(today - logDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 1) {
                    currentStreak = 1;
                    checkDate = new Date(logDate);
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break; // Streak broken
                }
            } else {
                // Continue checking backwards
                if (isSameDay(logDate, checkDate)) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else if (logDate < checkDate) {
                    break; // Gap found
                }
                // If it's the exact same day as the *previous* log in the loop, we just ignore and continue
            }
        }

        const isNightOwl = logs.length > 0 && (lateNightLogs / logs.length) >= 0.3;
        const isWeekendWarrior = logs.length > 0 && (weekendLogs / logs.length) >= 0.5;

        // Mocked Genre Data (until Schema supports it)
        const allGenres = [
            'Fantasy', 'Science Fiction', 'Mystery',
            'Thriller', 'Romance', 'Historical Fiction',
            'Non-fiction', 'Biography', 'Self-Help'
        ];

        // Generate pseudo-random deterministic distribution based on user ID and log count
        // So the chart doesn't totally jump around on reload
        let mockGenres = [];
        if (logs.length > 0) {
            let hash = req.user.id + logs.length;
            const topGenreIdx = hash % allGenres.length;
            const secondGenreIdx = (hash + 3) % allGenres.length;
            const thirdGenreIdx = (hash + 5) % allGenres.length;

            mockGenres = [
                { name: allGenres[topGenreIdx], value: Math.max(1, Math.floor(logs.length * 0.5)) },
                { name: allGenres[secondGenreIdx], value: Math.max(1, Math.floor(logs.length * 0.3)) },
                { name: allGenres[thirdGenreIdx], value: Math.max(1, Math.floor(logs.length * 0.2)) }
            ];
        }

        res.json({
            stats: {
                booksReadThisYear,
                avgRating,
                currentStreak,
                totalLogs: logs.length,
                heatmap
            },
            badges: {
                nightOwl: isNightOwl,
                weekendWarrior: isWeekendWarrior,
                sevenDayStreak: currentStreak >= 7,
                thirtyDayStreak: currentStreak >= 30
            },
            genres: mockGenres,
            recentBooks: logs.slice(0, 5).map(l => ({
                id: l.bookId,
                title: l.bookTitle,
                author: l.author,
                coverUrl: l.coverUrl || 'https://via.placeholder.com/150x220?text=No+Cover'
            }))
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
