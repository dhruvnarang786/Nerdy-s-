import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Star, Users, Zap, TrendingUp, Clock, Activity, Flame, Crown, Heart, MessageCircle } from 'lucide-react';
import CountUp from 'react-countup';
import { searchBooks, getBookDetails, type Book } from '@/lib/apiClient';
import { getFavorites, getAllLogs, getCurrentUserLogs } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';
import { FALLBACK_COVER } from '@/lib/constants';
import '@/styles/pages.css';
import '@/styles/lb-home.css';

import { Landing } from './Landing';

const SAMPLE_REVIEWS = [
    { user: 'alice_reads', book: 'The Night Circus', bookId: '', rating: 5, comment: 'Absolutely magical. One of the most atmospheric books I\'ve ever read. The world-building is top notch.' },
    { user: 'bookworm91', book: 'Project Hail Mary', bookId: '', rating: 5, comment: 'Andy Weir at the peak of his craft. Couldn\'t put it down. Science meets heart.' },
    { user: 'literary_leo', book: 'Tomorrow, and Tomorrow, and Tomorrow', bookId: '', rating: 4, comment: 'A gorgeous meditation on friendship, creativity and loss.' },
    { user: 'sarah_pages', book: 'Piranesi', bookId: '', rating: 5, comment: 'Strange, beautiful, and unlike anything else. A modern classic.' },
    { user: 'readsalot', book: 'The Midnight Library', bookId: '', rating: 4, comment: 'A philosophical page-turner. Made me rethink my choices.' },
];

const POPULAR_LISTS = [
    { name: 'Books that changed my life', curator: 'alice_reads', count: 12, likes: 2400, comments: 156, coverIndices: [0, 3, 7, 9, 12] },
    { name: 'Best sci-fi of the decade', curator: 'bookworm91', count: 20, likes: 1800, comments: 89, coverIndices: [1, 5, 10, 14, 8] },
    { name: 'Comfort reads for rainy days', curator: 'sarah_pages', count: 15, likes: 3100, comments: 203, coverIndices: [4, 2, 6, 11, 13] },
    { name: 'Literary fiction masterworks', curator: 'literary_leo', count: 18, likes: 950, comments: 67, coverIndices: [7, 0, 3, 6, 9] },
    { name: 'Dark academia essentials', curator: 'page_turner', count: 14, likes: 4200, comments: 312, coverIndices: [8, 5, 12, 10, 1] },
    { name: 'Unputdownable thrillers', curator: 'mystery_maven', count: 22, likes: 1500, comments: 104, coverIndices: [14, 13, 11, 4, 2] },
];

// Fallback books with Open Library covers — shown when Google Books API is rate-limited
const FALLBACK_SHOWCASE: Book[] = [
    { id: 'OL82563W', title: 'The Night Circus', author: 'Erin Morgenstern', coverUrl: 'https://covers.openlibrary.org/b/olid/OL25429920M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL17930368W', title: 'Project Hail Mary', author: 'Andy Weir', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28384937M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL20897277W', title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', coverUrl: 'https://covers.openlibrary.org/b/olid/OL37823790M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL19631252W', title: 'Piranesi', author: 'Susanna Clarke', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28553425M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL20644253W', title: 'The Midnight Library', author: 'Matt Haig', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28423208M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL27258W', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://covers.openlibrary.org/b/olid/OL34621109M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL82536W', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22570024M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL45804W', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7177684M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL27479W', title: '1984', author: 'George Orwell', coverUrl: 'https://covers.openlibrary.org/b/olid/OL46903932M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL23919W', title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22856696M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL27516W', title: 'The Hobbit', author: 'J.R.R. Tolkien', coverUrl: 'https://covers.openlibrary.org/b/olid/OL33891507M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL12345W', title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://covers.openlibrary.org/b/olid/OL27912450M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL81613W', title: 'The Alchemist', author: 'Paulo Coelho', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7358422M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL15125W', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: 'https://covers.openlibrary.org/b/olid/OL46874127M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
    { id: 'OL6769228W', title: 'The Hunger Games', author: 'Suzanne Collins', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22597972M-M.jpg', description: '', rating: 0, publishedDate: '', pages: 0, genre: [] },
];

function getDailyBook(books: Book[]): Book | null {
    if (!books.length) return null;
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return books[dayOfYear % books.length];
}

type ReviewItem = { user: string; book: string; bookId: string; rating: number; comment: string; isReal?: boolean, date?: string };

export function Home() {
    const { user, isAuthenticated } = useAuth();
    const [heroBook, setHeroBook] = useState<Book | null>(getDailyBook(FALLBACK_SHOWCASE));
    const [showcaseBooks, setShowcaseBooks] = useState<Book[]>(FALLBACK_SHOWCASE);
    const [recentBooks, setRecentBooks] = useState<Book[]>([]);
    const [communityReviews, setCommunityReviews] = useState<ReviewItem[]>(SAMPLE_REVIEWS);
    const [booksRead, setBooksRead] = useState(0);
    const [favsCount, setFavsCount] = useState(0);

    // Load real user stats and reviews from API
    useEffect(() => {
        if (!isAuthenticated) return;
        getFavorites().then(favs => setFavsCount(favs.length)).catch(() => { });
        getCurrentUserLogs().then(logs => setBooksRead(logs.length)).catch(() => { });
        
        getAllLogs().then(realLogs => {
            const withNotes = realLogs.filter(l => l.notes && l.notes.trim() && (l.username || l.user?.username));
            if (withNotes.length >= 3) {
                const sorted = [...withNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setCommunityReviews(sorted.slice(0, 10).map(l => ({
                    user: l.username || l.user?.username || 'Anonymous',
                    book: l.bookTitle || 'a book',
                    bookId: l.bookId,
                    rating: l.rating,
                    comment: l.notes,
                    isReal: true,
                    date: 'Today'
                })));
            }
        }).catch(() => { });
    }, [isAuthenticated]);

    // Fetch hero & showcase books — now 15 for bigger grid
    useEffect(() => {
        if (!isAuthenticated) return;
        (async () => {
            try {
                const bestsellers = await searchBooks('bestselling fiction 2024', 0, 20);
                if (bestsellers.books.length > 0) {
                    setHeroBook(getDailyBook(bestsellers.books));
                    setShowcaseBooks(bestsellers.books.slice(0, 15));
                }
            } catch { /* keep fallbacks */ }
        })();
    }, [isAuthenticated]);

    // Fetch recent views
    useEffect(() => {
        if (!isAuthenticated) return;
        (async () => {
            const recentIds: string[] = JSON.parse(localStorage.getItem('nerdys_recent_views') || '[]');
            if (recentIds.length > 0) {
                const fetched = await Promise.all(recentIds.slice(0, 4).map(id => getBookDetails(id)));
                setRecentBooks(fetched.filter((b): b is Book => b !== null));
            }
        })();
    }, [isAuthenticated]);

    // Render landing page for unauthenticated users
    if (!isAuthenticated) {
        return <Landing />;
    }

    return (
        <div className="home-wrapper" style={{ position: 'relative', minHeight: '100vh', paddingBottom: '4rem' }}>
            
            {/* ── COMPACT WELCOME BAR (just below navbar) ───────── */}
            <section className="lb-welcome-bar animate-fade-in-up">
                <h1 className="lb-welcome-greeting">
                    Welcome back, <span className="lb-welcome-username">{user?.username}</span>.
                </h1>
                <p className="lb-welcome-sub">Here's what your friends have been reading.</p>
            </section>

            {/* ── BOOK OF THE DAY (featured banner) ──────────────── */}
            {heroBook && (
                <section className="lb-botd-banner animate-fade-in-up delay-100">
                    <div className="lb-botd-badge">
                        <Crown size={14} />
                        BOOK OF THE DAY
                    </div>
                    <div className="lb-botd-content">
                        <Link to={`/book/${heroBook.id}`} className="lb-botd-cover-wrap">
                            <img src={heroBook.coverUrl || FALLBACK_COVER} alt={heroBook.title} className="lb-botd-cover" />
                        </Link>
                        <div className="lb-botd-info">
                            <Link to={`/book/${heroBook.id}`} className="lb-botd-title">{heroBook.title}</Link>
                            <p className="lb-botd-author">by {heroBook.author}</p>
                            {heroBook.description && (
                                <p className="lb-botd-desc">{heroBook.description.slice(0, 150)}...</p>
                            )}
                            <Link to={`/book/${heroBook.id}`} className="lb-botd-cta">
                                View Details <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ── 2-COLUMN LAYOUT ────────────────────────────────── */}
            <div className="lb-home-layout animate-fade-in-up delay-200">
                
                {/* LEFT MAIN COLUMN — Reviews */}
                <div className="lb-main-column">
                    <div className="lb-section-header">
                        <h2 className="lb-section-title">
                            <Activity style={{ display: 'inline', width: '1.1rem', height: '1.1rem', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                            NEW FROM FRIENDS
                        </h2>
                    </div>
                    
                    <div className="lb-activity-feed">
                        {communityReviews.map((r, i) => (
                            <div key={i} className="lb-activity-card">
                                <div className="lb-activity-header">
                                    <Link to={r.isReal ? `/user/${r.user}` : '#'} className="lb-activity-avatar">
                                        {r.user[0].toUpperCase()}
                                    </Link>
                                    <div className="lb-activity-meta">
                                        <div className="lb-activity-user-row">
                                            <Link to={r.isReal ? `/user/${r.user}` : '#'} className="lb-activity-user">
                                                {r.user}
                                            </Link>
                                            <span className="lb-activity-action"> reviewed </span>
                                            {r.bookId ? (
                                                <Link to={`/book/${r.bookId}`} className="lb-activity-book">{r.book}</Link>
                                            ) : (
                                                <span className="lb-activity-book">{r.book}</span>
                                            )}
                                        </div>
                                        <div className="lb-activity-stars">
                                            {Array.from({ length: r.rating }).map((_, si) => (
                                                <Star key={si} className="lb-star" size={14} />
                                            ))}
                                            <span className="lb-activity-date">{r.date || 'Yesterday'}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="lb-activity-comment">"{r.comment}"</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN — Popular This Week (bigger) */}
                <div className="lb-sidebar-column">
                    
                    {/* Popular This Week — Now 15 books in a 5-col grid */}
                    <div className="lb-sidebar-widget lb-popular-week-widget">
                        <div className="lb-section-header">
                            <h2 className="lb-section-title">
                                <TrendingUp style={{ display: 'inline', width: '1.1rem', height: '1.1rem', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                                POPULAR THIS WEEK
                            </h2>
                        </div>
                        <div className="lb-popular-grid">
                            {showcaseBooks.map(book => (
                                <Link key={book.id} to={`/book/${book.id}`} className="lb-popular-cover-link">
                                    <img src={book.coverUrl || FALLBACK_COVER} alt={book.title} className="lb-popular-cover" />
                                    <div className="lb-popular-cover-overlay">
                                        <span className="lb-popular-cover-title">{book.title}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Link to="/trending" className="lb-sidebar-more">Browse more trending books →</Link>
                    </div>

                    {/* Recently Viewed */}
                    {recentBooks.length > 0 && (
                        <div className="lb-sidebar-widget">
                            <div className="lb-section-header">
                                <h2 className="lb-section-title">
                                    <Clock style={{ display: 'inline', width: '1rem', height: '1rem', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                                    RECENTLY VIEWED
                                </h2>
                            </div>
                            <div className="lb-sidebar-grid">
                                {recentBooks.map(book => (
                                    <Link key={book.id} to={`/book/${book.id}`} className="lb-sidebar-cover-link">
                                        <img src={book.coverUrl || FALLBACK_COVER} alt={book.title} className="lb-sidebar-cover" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── POPULAR LISTS (Letterboxd style with cover previews) ── */}
            <section className="lb-popular-lists-section animate-fade-in-up delay-300">
                <div className="lb-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="lb-section-title lb-section-title-lg">
                        <Flame style={{ display: 'inline', width: '1.2rem', height: '1.2rem', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        POPULAR LISTS
                    </h2>
                    <Link to="/trending" className="lb-lists-more-link">MORE</Link>
                </div>
                <div className="lb-popular-lists-stack">
                    {POPULAR_LISTS.map((list, i) => {
                        const covers = list.coverIndices.map(idx => FALLBACK_SHOWCASE[idx]);
                        return (
                            <div key={i} className="lb-plist-card">
                                <div className="lb-plist-covers">
                                    {covers.map((book, ci) => (
                                        <div key={ci} className="lb-plist-cover-slot">
                                            <img src={book.coverUrl || FALLBACK_COVER} alt={book.title} className="lb-plist-cover-img" />
                                        </div>
                                    ))}
                                </div>
                                <div className="lb-plist-info">
                                    <h3 className="lb-plist-name">{list.name}</h3>
                                    <div className="lb-plist-curator-row">
                                        <span className="lb-plist-curator-avatar">{list.curator[0].toUpperCase()}</span>
                                        <span className="lb-plist-curator-name">{list.curator}</span>
                                    </div>
                                    <div className="lb-plist-stats">
                                        <span className="lb-plist-stat">{list.count} books</span>
                                        <span className="lb-plist-stat"><Heart size={13} /> {list.likes >= 1000 ? (list.likes / 1000).toFixed(1) + 'K' : list.likes}</span>
                                        <span className="lb-plist-stat"><MessageCircle size={13} /> {list.comments}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

