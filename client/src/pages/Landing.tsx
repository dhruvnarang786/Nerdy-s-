import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Users, Star, Heart, Edit3, LayoutGrid, ChevronDown, Twitter, Instagram, Github } from 'lucide-react';
import '@/styles/pages.css';
import '@/styles/bento.css';
import '@/styles/landing.css';

const MARQUEE_BOOKS = [
    { id: '1', title: 'The Seven Husbands of Evelyn Hugo', cover: 'https://covers.openlibrary.org/b/id/10515129-L.jpg' },
    { id: '2', title: 'The Midnight Library', cover: 'https://covers.openlibrary.org/b/id/10543666-L.jpg' },
    { id: '3', title: 'The Fault in Our Stars', cover: 'https://covers.openlibrary.org/b/id/8259441-L.jpg' },
    { id: '4', title: 'Atomic Habits', cover: 'https://covers.openlibrary.org/b/id/12879555-L.jpg' },
    { id: '5', title: '1984', cover: 'https://covers.openlibrary.org/b/id/15325651-L.jpg' },
    { id: '6', title: 'To Kill a Mockingbird', cover: 'https://covers.openlibrary.org/b/id/14407559-L.jpg' },
    { id: '7', title: 'The Alchemist', cover: 'https://covers.openlibrary.org/b/id/12662058-L.jpg' },
    { id: '8', title: 'Harry Potter and the Sorcerer\'s Stone', cover: 'https://covers.openlibrary.org/b/id/10521270-L.jpg' },
    { id: '9', title: 'Sapiens', cover: 'https://covers.openlibrary.org/b/id/12586074-L.jpg' },
    { id: '10', title: 'Where the Crawdads Sing', cover: 'https://covers.openlibrary.org/b/id/12693892-L.jpg' },
    { id: '11', title: 'The Great Gatsby', cover: 'https://covers.openlibrary.org/b/id/12563339-L.jpg' },
    { id: '12', title: 'The Book Thief', cover: 'https://covers.openlibrary.org/b/id/10476483-L.jpg' },
];

export function Landing() {
    // Duplicate array for seamless infinite loop
    const marqueeItems = [...MARQUEE_BOOKS, ...MARQUEE_BOOKS];

    return (
        <div className="home-wrapper" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            {/* ── GLOBAL BOOKSHELF BACKGROUND ──────────────────── */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, pointerEvents: 'none' }}>
                <div className="lb-hero-bg hero-gradient-bg" style={{ position: 'absolute', inset: 0, opacity: 0.95, mixBlendMode: 'normal', backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'sepia(0.3) opacity(0.3) brightness(1.2) contrast(0.9)' }}>
                    <div className="lb-hero-overlay" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.8) 100%)' }} />
                </div>
                <div className="hero-noise-overlay" style={{ position: 'absolute', inset: 0 }}></div>
                <div className="hero-radial-glow" style={{ position: 'absolute', inset: 0 }}></div>
            </div>

            {/* ── HERO SECTION ─────────────────────────────────── */}
            <section className="landing-hero">
                {/* Infinite Book Marquee */}
                <div className="landing-marquee-wrapper">
                    <div className="landing-marquee-track">
                        {marqueeItems.map((book, i) => (
                            <Link key={`${book.id}-${i}`} to={`/book/${book.id}`} className="landing-marquee-item">
                                <img src={book.cover} alt={book.title} loading="lazy" />
                            </Link>
                        ))}
                    </div>
                    <div className="landing-marquee-fade-left" />
                    <div className="landing-marquee-fade-right" />
                </div>

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

            {/* ── STATS BAR ───────────────────────────────────── */}
            <div id="stats" className="landing-stats-container animate-fade-in-up delay-400">
                <div className="landing-stats-box">
                    <div className="landing-stat">
                        <BookOpen className="landing-stat-icon-gold" size={32} />
                        <div className="landing-stat-info">
                            <span className="landing-stat-value-bold">12,840</span>
                            <span className="landing-stat-label-white">Books Logged</span>
                        </div>
                    </div>
                    <div className="landing-stat">
                        <MessageSquare className="landing-stat-icon-gold" size={32} />
                        <div className="landing-stat-info">
                            <span className="landing-stat-value-bold">3,204</span>
                            <span className="landing-stat-label-white">Reviews Written</span>
                        </div>
                    </div>
                    <div className="landing-stat">
                        <Users className="landing-stat-icon-gold" size={32} />
                        <div className="landing-stat-info">
                            <span className="landing-stat-value-bold">8,561</span>
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
                        <BookOpen className="nerdys-feature-icon" />
                        <p>Keep track of every book you've ever read (or just start from the day you join)</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-200">
                        <Heart className="nerdys-feature-icon" />
                        <p>Show some love for your favorite books, lists and reviews with a "like"</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-300">
                        <Edit3 className="nerdys-feature-icon" />
                        <p>Write and share reviews, and follow friends and other members to read theirs</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-100">
                        <Star className="nerdys-feature-icon" />
                        <p>Rate each book on a five-star scale to record and share your reaction</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-200">
                        <Users className="nerdys-feature-icon" />
                        <p>Join book clubs and communities to discuss your reads with fellow book lovers</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-300">
                        <LayoutGrid className="nerdys-feature-icon" />
                        <p>Compile and share lists of books on any topic and keep a personal reading list</p>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ──────────────────────────────────── */}
            <section className="landing-final-cta animate-fade-in-up">
                <h2 className="landing-final-heading">Your next chapter starts here</h2>
                <p className="landing-final-sub">Track, review, and discover books with a community that gets you.</p>
                <Link to="/register" className="landing-btn" style={{ fontSize: '1.15rem', padding: '1rem 2.5rem' }}>
                    Sign up now →
                </Link>
                <div className="landing-readers" style={{ marginTop: '2rem' }}>
                    <div className="landing-avatars">
                        <img src="https://i.pravatar.cc/100?img=5" alt="Reader" className="landing-avatar" />
                        <img src="https://i.pravatar.cc/100?img=6" alt="Reader" className="landing-avatar" />
                        <img src="https://i.pravatar.cc/100?img=7" alt="Reader" className="landing-avatar" />
                        <img src="https://i.pravatar.cc/100?img=8" alt="Reader" className="landing-avatar" />
                        <img src="https://i.pravatar.cc/100?img=9" alt="Reader" className="landing-avatar" />
                    </div>
                    <div className="landing-readers-text" style={{ lineHeight: 1.2 }}>
                        Join 8,500+<br/>readers today
                    </div>
                </div>
            </section>
        </div>
    );
}
