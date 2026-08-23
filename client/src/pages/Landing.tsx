import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Users, Star, Heart, Edit3, LayoutGrid, ChevronDown } from 'lucide-react';
import { getBookCoverUrl } from '@/lib/bookCover';
import { FALLBACK_COVER } from '@/lib/constants';
import '@/styles/pages.css';
import '@/styles/bento.css';
import '@/styles/landing.css';

const MARQUEE_BOOKS = [
    { id: 'OL27479W', title: '1984', cover: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg' },
    { id: 'OL82536W', title: 'The Great Gatsby', cover: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg' },
    { id: 'OL27516W', title: 'The Hobbit', cover: 'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg' },
    { id: 'OL45804W', title: 'Pride and Prejudice', cover: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg' },
    { id: 'OL15125W', title: 'To Kill a Mockingbird', cover: 'https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg' },
    { id: 'OL81613W', title: 'The Alchemist', cover: 'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg' },
    { id: 'OL12345W', title: 'Atomic Habits', cover: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg' },
    { id: 'OL27258W', title: 'Dune', cover: 'https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg' },
    { id: 'OL17075704W', title: 'Sapiens', cover: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg' },
    { id: 'OL17930368W', title: 'Project Hail Mary', cover: 'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg' },
    { id: 'OL20644253W', title: 'The Midnight Library', cover: 'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg' },
    { id: 'OL82563W', title: 'The Night Circus', cover: 'https://covers.openlibrary.org/b/isbn/9780307744432-L.jpg' },
];

export function Landing() {
    // Duplicate array for seamless infinite loop
    const marqueeItems = [...MARQUEE_BOOKS, ...MARQUEE_BOOKS];

    return (
        <div className="home-wrapper" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
            {/* ── HERO SECTION ─────────────────────────────────── */}
            <section className="landing-hero">
                {/* Infinite Book Marquee */}
                <div className="landing-marquee-wrapper">
                    <div className="landing-marquee-track">
                        {marqueeItems.map((book, i) => (
                            <Link key={`${book.id}-${i}`} to={`/book/${book.id}`} className="landing-marquee-item">
                                <img
                                    src={getBookCoverUrl(book.id, book.cover)}
                                    alt={book.title}
                                    loading="lazy"
                                    onError={(e) => {
                                        e.currentTarget.src = FALLBACK_COVER;
                                    }}
                                />
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
                    <div className="nerdys-feature-card animate-fade-in-up delay-100">
                        <div className="nerdys-feature-icon-wrapper">
                            <Star className="nerdys-feature-icon" />
                        </div>
                        <p>Rate each book on a five-star scale to record and share your reaction</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-200">
                        <div className="nerdys-feature-icon-wrapper">
                            <Users className="nerdys-feature-icon" />
                        </div>
                        <p>Join book clubs and communities to discuss your reads with fellow book lovers</p>
                    </div>
                    <div className="nerdys-feature-card animate-fade-in-up delay-300">
                        <div className="nerdys-feature-icon-wrapper">
                            <LayoutGrid className="nerdys-feature-icon" />
                        </div>
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
