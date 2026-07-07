import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, MessageSquare, Users, Library, Star, Target, ArrowRight, Bookmark, CheckCircle, Smartphone, Edit3 } from 'lucide-react';
import '@/styles/pages.css';
import '@/styles/bento.css';
const FEATURED_BOOKS = [
    { 
        id: 'iVl6DwAAQBAJ', 
        title: 'The Seven Husbands of Evelyn Hugo', 
        author: 'Taylor Jenkins Reid',
        rating: 4.6,
        reviews: '12.4K',
        quote: '"A spellbinding novel about love, glamour, and the cost of fame."',
        secondQuote: 'People think that intimacy is about sex. But intimacy is about truth. When you realize you can tell someone your truth, when you can show yourself to them, when you stand in front of them bare and their response is "you\'re safe with me"- that\'s intimacy.',
        cover: 'https://books.google.com/books/content?id=iVl6DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api' 
    },
    { 
        id: 'cdncEAAAQBAJ', 
        title: 'The Midnight Library', 
        author: 'Matt Haig',
        rating: 4.3,
        reviews: '9.8K',
        quote: '"Between life and death there is a library, and within that library, the shelves go on forever."',
        secondQuote: 'The only way to learn is to live.',
        cover: 'https://books.google.com/books/content?id=cdncEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api' 
    },
    { 
        id: 'r1sFv9W59R0C', 
        title: 'The Fault in Our Stars', 
        author: 'John Green',
        rating: 4.7,
        reviews: '15.2K',
        quote: '"You don\'t get to choose if you get hurt in this world, but you do have some say in who hurts you."',
        secondQuote: 'Some infinities are bigger than other infinities.',
        cover: 'https://books.google.com/books/content?id=r1sFv9W59R0C&printsec=frontcover&img=1&zoom=1&source=gbs_api' 
    },
];

export function Landing() {
    const [bookIndex, setBookIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setBookIndex(prev => (prev + 1) % FEATURED_BOOKS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const featuredBook = FEATURED_BOOKS[bookIndex];

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

            {/* ── HERO CONTENT ───────────────────────────────── */}
            <div className="landing-grid animate-fade-in-up">
                {/* Left Column */}
                <div style={{ position: 'relative' }}>
                    
                    <div className="landing-badge animate-fade-in-up delay-100">
                        <BookOpen size={14} style={{ color: '#d4af37' }} /> 
                        <span>Welcome to Nerdy's</span>
                    </div>

                    <h1 className="landing-headline">
                        Your bookshelf.<br/>
                        Your community.<br/>
                        Your <span className="landing-highlight">story.</span>
                    </h1>
                    <p className="landing-subhead">
                        Track your reads, share reviews, set goals,<br/>
                        and connect with book lovers<br/>
                        who get you.
                    </p>
                    
                    <div className="landing-action-row animate-fade-in-up delay-200">
                        <Link to="/register" className="landing-btn">
                            Get started — it's free! 🚀
                        </Link>

                        <div className="landing-readers">
                            <div className="landing-avatars">
                                <img src="https://i.pravatar.cc/100?img=1" alt="Reader" className="landing-avatar" />
                                <img src="https://i.pravatar.cc/100?img=2" alt="Reader" className="landing-avatar" />
                                <img src="https://i.pravatar.cc/100?img=3" alt="Reader" className="landing-avatar" />
                                <img src="https://i.pravatar.cc/100?img=4" alt="Reader" className="landing-avatar" />
                            </div>
                            <div className="landing-readers-text" style={{ lineHeight: 1.2 }}>
                                Join 8,561+<br/>readers today
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="animate-fade-in-up delay-300" style={{ position: 'relative' }}>
                    
                    <div className="featured-read-card">
                        <div className="featured-read-badge">
                            <Library size={14} style={{ color: '#d4af37' }} /> Featured Read
                        </div>
                        
                        <div className="featured-read-content" key={bookIndex}>
                            <img src={featuredBook.cover} alt={featuredBook.title} className="featured-read-cover fade-in-up" />
                            
                            <div className="featured-read-info fade-in-up">
                                <div>
                                    <h3 className="featured-read-title">{featuredBook.title}</h3>
                                    <p className="featured-read-author">{featuredBook.author}</p>
                                </div>
                                
                                <div className="featured-read-rating">
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={14} fill={i < Math.floor(featuredBook.rating) ? '#d4af37' : 'none'} color="#d4af37" />
                                        ))}
                                    </div>
                                    <span>{featuredBook.rating} ({featuredBook.reviews})</span>
                                </div>
                                
                                <p className="featured-read-quote">{featuredBook.quote}</p>
                                
                <Link to={`/book/${featuredBook.id}`} className="featured-read-btn">
                                    View Details <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Dynamic Quote Box */}
                    <div className="landing-gold-quote animate-fade-in-up delay-400" style={{ marginTop: '2rem' }}>
                        <div className="landing-gold-quote-content">
                            <div className="landing-gold-quote-text" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <span className="landing-gold-quote-icon" style={{ marginTop: '-0.25rem' }}>“</span>
                                <span>{featuredBook.secondQuote}</span>
                                <span className="landing-gold-quote-icon" style={{ marginTop: '-0.25rem', alignSelf: 'flex-end' }}>”</span>
                            </div>
                            <div className="landing-gold-quote-author" style={{ marginLeft: '2rem' }}>— {featuredBook.author}</div>
                        </div>
                    </div>

                </div>
            </div>

            {/* ── BOTTOM ROW ───────────────────────────────── */}
            <div className="landing-bottom-grid animate-fade-in-up delay-400" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                {/* Stats Bar */}
                <div className="landing-stats-bar-new">
                    <div className="landing-stat">
                        <BookOpen className="landing-stat-icon-yellow" size={24} />
                        <div className="landing-stat-info">
                            <span className="landing-stat-value-yellow">12,840</span>
                            <span className="landing-stat-label">Books Logged</span>
                        </div>
                    </div>
                    <div className="landing-stat">
                        <MessageSquare className="landing-stat-icon-yellow" size={24} />
                        <div className="landing-stat-info">
                            <span className="landing-stat-value-yellow">3,204</span>
                            <span className="landing-stat-label">Reviews Written</span>
                        </div>
                    </div>
                    <div className="landing-stat">
                        <Users className="landing-stat-icon-yellow" size={24} />
                        <div className="landing-stat-info">
                            <span className="landing-stat-value-yellow">8,561</span>
                            <span className="landing-stat-label">Members Active</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BENTO FEATURES GRID ──────────────────────── */}
            <section className="bento-section">
                <div className="bento-header animate-fade-in-up">
                    <h2 className="bento-title">Track your reading progress &<br/>bring your library online</h2>
                </div>

                <div className="bento-grid">
                    
                    {/* Card 1: Individual Reading Goals */}
                    <div className="bento-card bento-card-tall animate-fade-in-up delay-100">
                        <h3 className="bento-card-title">Individual reading<br/>goals</h3>
                        
                        <div className="bento-mock-progress">
                            <div className="mock-circle">
                                <span className="mock-circle-num">25</span>
                                <span className="mock-circle-label">books</span>
                            </div>
                            <div className="mock-goal-text">
                                <span className="mock-goal-year">2026</span>
                                <span className="mock-goal-desc">My Yearly Reading Goal</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Keep track & create shelves */}
                    <div className="bento-card bento-card-wide animate-fade-in-up delay-200">
                        <div style={{ display: 'flex', gap: '2rem' }}>
                            <div style={{ flex: 1 }}>
                                <h3 className="bento-card-title mb-4">Keep track of what<br/>you're reading and<br/>create shelves</h3>
                                <div className="bento-mock-list">
                                    <div className="bento-mock-item">
                                        <CheckCircle size={18} className="bento-mock-icon" /> Organize your library in shelves
                                    </div>
                                    <div className="bento-mock-item">
                                        <CheckCircle size={18} className="bento-mock-icon" /> Track your reading progress
                                    </div>
                                    <div className="bento-mock-item">
                                        <CheckCircle size={18} className="bento-mock-icon" /> All book formats welcome
                                    </div>
                                    <div className="bento-mock-item">
                                        <CheckCircle size={18} className="bento-mock-icon" /> Scan in book barcodes
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ width: '250px', display: 'flex', flexDirection: 'column' }}>
                                <div className="mock-mobile-app">
                                    <div className="mock-mobile-header">
                                        <span>9:41</span>
                                        <span>Library</span>
                                    </div>
                                    <div className="mock-mobile-tabs">
                                        <span className="active">Books</span>
                                        <span>Highlights</span>
                                    </div>
                                    <div className="mock-mobile-book">
                                        <div className="mock-mobile-book-cover" style={{background: '#1a1a1a', border: '1px solid #333'}}></div>
                                        <div className="mock-mobile-book-info">
                                            <span className="mock-mobile-book-title">The Midnight Library</span>
                                            <span className="mock-mobile-book-author">Matt Haig</span>
                                        </div>
                                    </div>
                                    <div className="mock-mobile-fade"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Import from Goodreads */}
                    <div className="bento-card animate-fade-in-up delay-300">
                        <h3 className="bento-card-title">Import from<br/>Goodreads &<br/>StoryGraph</h3>
                        <div className="bento-mock-list" style={{ marginTop: 'auto' }}>
                            <div className="bento-mock-item">
                                <Bookmark size={18} className="bento-mock-icon" /> Bring your history
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Create highlights & notes */}
                    <div className="bento-card animate-fade-in-up delay-400">
                        <h3 className="bento-card-title">Create highlights &<br/>notes</h3>
                        <div className="bento-mock-list" style={{ marginTop: 'auto' }}>
                            <div className="bento-mock-item">
                                <Edit3 size={18} className="bento-mock-icon" /> Remember what you read
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
