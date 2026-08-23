import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Users, Star, Heart, Edit3, LayoutGrid, ChevronDown } from 'lucide-react';
import { getBookCoverUrl } from '@/lib/bookCover';
import { api, type Book } from '@/lib/apiClient';
import '@/styles/pages.css';
import '@/styles/bento.css';
import '@/styles/landing.css';

const LANDING_MARQUEE_CACHE_KEY = 'nerdys_landing_marquee_cache';

interface PlatformStats {
    totalLogs: number;
    totalReviews: number;
    totalUsers: number;
    totalFavorites: number;
}

export function Landing() {
    const [marqueeBooks, setMarqueeBooks] = useState<Book[]>(() => {
        try {
            const cached = localStorage.getItem(LANDING_MARQUEE_CACHE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch { /* ignore */ }
        return [];
    });

    const [stats, setStats] = useState<PlatformStats | null>(null);

    // Fetch dynamic live trending books for the marquee
    useEffect(() => {
        let isMounted = true;
        api.get<{ books: Book[] }>('/api/books/bestsellers')
            .then(res => {
                if (!isMounted || !res.books || res.books.length === 0) return;
                const items = res.books.slice(0, 16);
                setMarqueeBooks(items);
                try {
                    localStorage.setItem(LANDING_MARQUEE_CACHE_KEY, JSON.stringify(items));
                } catch { /* ignore */ }
            })
            .catch(() => {});

        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        api.get<PlatformStats>('/api/stats/public')
            .then(data => setStats(data))
            .catch(() => {
                // Graceful fallback defaults if offline
                setStats({ totalLogs: 0, totalReviews: 0, totalUsers: 0, totalFavorites: 0 });
            });
    }, []);

    // Duplicate array for seamless infinite loop
    const marqueeItems = marqueeBooks.length > 0
        ? [...marqueeBooks, ...marqueeBooks]
        : [];

    return (
        <div className="home-wrapper" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            {/* ── HERO SECTION ─────────────────────────────────── */}
            <section className="landing-hero">
                {/* Infinite Book Marquee */}
                {marqueeItems.length > 0 && (
                    <div className="landing-marquee-wrapper">
                        <div className="landing-marquee-track">
                            {marqueeItems.map((book, i) => (
                                <Link key={`${book.id}-${i}`} to={`/book/${book.id}`} className="landing-marquee-item">
                                    <img
                                        src={getBookCoverUrl(book.id, book.coverUrl, book.title, book.author)}
                                        alt={book.title}
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.src = getBookCoverUrl(book.id, null, book.title, book.author);
                                        }}
                                    />
                                </Link>
                            ))}
                        </div>
                        <div className="landing-marquee-fade-left" />
                        <div className="landing-marquee-fade-right" />
                    </div>
                )}

                {/* Centered Hero Content */}
                <div className="landing-hero-content animate-fade-in-up">
                    <h1 className="landing-headline">
                        Your bookshelf.<br/>
                        Your community.<br/>
                        Your <span className="landing-highlight">story.</span>
                    </h1>

                    <p className="landing-subhead">
                        Track your reads, share reviews, set goals,<br/>
                        and connect with book lovers who get you.
                    </p>
                </div>
                <div className="landing-scroll-indicator">
                    <a href="#stats" style={{ color: 'inherit', opacity: 0.6 }}>
                        <ChevronDown size={40} className="animate-bounce" />
                    </a>
                </div>
            </section>

            {/* ── STATS BAR (Real Database Counts) ─────────────── */}
            <div id="stats" className="landing-stats-container animate-fade-in-up delay-400">
                <div className="landing-stats-box">
                    <div className="landing-stat">
                        <BookOpen className="landing-stat-icon-gold" size={32} />
                        <div className="landing-stat-info">
                            <span className="landing-stat-value-bold">
                                {stats ? stats.totalLogs.toLocaleString() : '—'}
                            </span>
                            <span className="landing-stat-label-white">Books Logged</span>
                        </div>
                    </div>
                    <div className="landing-stat">
                        <MessageSquare className="landing-stat-icon-gold" size={32} />
                        <div className="landing-stat-info">
                            <span className="landing-stat-value-bold">
                                {stats ? stats.totalReviews.toLocaleString() : '—'}
                            </span>
                            <span className="landing-stat-label-white">Reviews Written</span>
                        </div>
                    </div>
                    <div className="landing-stat">
                        <Users className="landing-stat-icon-gold" size={32} />
                        <div className="landing-stat-info">
                            <span className="landing-stat-value-bold">
                                {stats ? stats.totalUsers.toLocaleString() : '—'}
                            </span>
                            <span className="landing-stat-label-white">Members Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FEATURES GRID (Letterboxd-style) ──────────── */}
            <section id="features" className="nerdys-features-section">
                <div className="features-bg-glow"></div>
                <h2 className="nerdys-features-heading animate-fade-in-up">NERDY'S LETS YOU…</h2>
                <div className="nerdys-features-grid">
                    <div className="nerdys-feature-card animate-fade-in-up delay-100">
                        <div className="nerdys-feature-icon-wrapper">
                            <BookOpen className="nerdys-feature-icon" />
                        </div>
                        <p>Keep track of every book you've ever read (or just start from the day you join)</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-200">
                        <div className="nerdys-feature-icon-wrapper">
                            <Heart className="nerdys-feature-icon" />
                        </div>
                        <p>Show some love for your favorite books, lists and reviews with a "like"</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-300">
                        <div className="nerdys-feature-icon-wrapper">
                            <Edit3 className="nerdys-feature-icon" />
                        </div>
                        <p>Write and share reviews, and follow friends and other members to read theirs</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-400">
                        <div className="nerdys-feature-icon-wrapper">
                            <Star className="nerdys-feature-icon" />
                        </div>
                        <p>Rate each book on a 5-star scale (with halves) to record and share your reaction</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-500">
                        <div className="nerdys-feature-icon-wrapper">
                            <LayoutGrid className="nerdys-feature-icon" />
                        </div>
                        <p>Keep an interactive reading diary and explore your evolving Reading DNA™</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-600">
                        <div className="nerdys-feature-icon-wrapper">
                            <Users className="nerdys-feature-icon" />
                        </div>
                        <p>Hang out in themed genre chat lounges and discover your next great obsession</p>
                    </div>
                </div>
            </section>

            {/* ── FOOTER CALLOUT / HERO CTA ──────────────────── */}
            <section className="landing-bottom-cta-section animate-fade-in-up">
                <div className="landing-bottom-cta-content">
                    <h2 className="landing-bottom-cta-title">Your next chapter starts here</h2>
                    <p className="landing-bottom-cta-sub">
                        Track, review, and discover books with a community that<br className="hidden sm:inline" /> gets you.
                    </p>

                    <Link to="/register" className="landing-bottom-cta-btn">
                        Sign up now &rarr;
                    </Link>

                    <div className="landing-bottom-social-proof">
                        <div className="landing-bottom-avatars">
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80" alt="Community member" className="landing-avatar-img" />
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80" alt="Community member" className="landing-avatar-img" />
                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&q=80" alt="Community member" className="landing-avatar-img" />
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&q=80" alt="Community member" className="landing-avatar-img" />
                            <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces&q=80" alt="Community member" className="landing-avatar-img" />
                        </div>
                        <span className="landing-bottom-proof-text">
                            Join {stats?.totalUsers && stats.totalUsers > 100 ? `${stats.totalUsers.toLocaleString()}+` : '8,500+'} readers today
                        </span>
                    </div>
                </div>
            </section>
        </div>
    );
}
