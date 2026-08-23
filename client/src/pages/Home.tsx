import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Clock, Activity, Flame, Crown, BookOpen, Heart, MessageCircle } from 'lucide-react';
import { searchBooks, getBookDetails, api, type Book } from '@/lib/apiClient';
import { getAllLogs } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';
import { displayName, userInitial, getAvatarColor } from '@/lib/displayName';
import { getBookCoverUrl } from '@/lib/bookCover';
import '@/styles/pages.css';
import '@/styles/lb-home.css';

import { Landing } from './Landing';

// Local cache keys for instant SWR rendering
const BESTSELLERS_CACHE_KEY = 'nerdys_home_bestsellers_cache_v2';
const DAILY_CACHE_KEY = 'nerdys_home_daily_cache_v2';

const SAMPLE_REVIEWS: ReviewItem[] = [
    {
        user: 'alice_reads',
        book: 'The Night Circus',
        bookId: 'OL82563W',
        rating: 5,
        comment: "Absolutely magical. One of the most atmospheric books I've ever read. The world-building is top notch.",
        date: 'Yesterday'
    },
    {
        user: 'bookworm91',
        book: 'Project Hail Mary',
        bookId: 'OL17930368W',
        rating: 5,
        comment: "Andy Weir at the peak of his craft. Couldn't put it down. Science meets heart.",
        date: 'Yesterday'
    },
    {
        user: 'literary_leo',
        book: 'Tomorrow, and Tomorrow, and Tomorrow',
        bookId: 'OL20897277W',
        rating: 4,
        comment: 'A gorgeous meditation on friendship, creativity and loss.',
        date: 'Yesterday'
    },
    {
        user: 'sarah_pages',
        book: 'Piranesi',
        bookId: 'OL19631252W',
        rating: 5,
        comment: 'Strange, beautiful, and unlike anything else. A modern classic.',
        date: 'Yesterday'
    },
    {
        user: 'readsalot',
        book: 'The Midnight Library',
        bookId: 'OL20644253W',
        rating: 4,
        comment: 'A philosophical page-turner. Made me rethink my choices.',
        date: '2 days ago'
    },
];

const DEFAULT_COLLECTIONS: BookCollection[] = [
    {
        name: 'Books that changed my life',
        curator: 'alice_reads',
        count: 12,
        likes: 2400,
        comments: 156,
        books: [
            { id: 'OL82563W', title: 'The Night Circus', author: 'Erin Morgenstern', coverUrl: 'https://covers.openlibrary.org/b/olid/OL25429920M-M.jpg' },
            { id: 'OL19631252W', title: 'Piranesi', author: 'Susanna Clarke', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28553425M-M.jpg' },
            { id: 'OL45804W', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7177684M-M.jpg' },
            { id: 'OL23919W', title: 'Harry Potter', author: 'J.K. Rowling', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22856696M-M.jpg' },
            { id: 'OL81613W', title: 'The Alchemist', author: 'Paulo Coelho', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7358422M-M.jpg' },
        ],
    },
    {
        name: 'Best sci-fi of the decade',
        curator: 'bookworm91',
        count: 20,
        likes: 1800,
        comments: 89,
        books: [
            { id: 'OL17930368W', title: 'Project Hail Mary', author: 'Andy Weir', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28384937M-M.jpg' },
            { id: 'OL27258W', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://covers.openlibrary.org/b/olid/OL34621109M-M.jpg' },
            { id: 'OL27516W', title: 'The Hobbit', author: 'J.R.R. Tolkien', coverUrl: 'https://covers.openlibrary.org/b/olid/OL33891507M-M.jpg' },
            { id: 'OL23919W', title: 'Harry Potter', author: 'J.K. Rowling', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22856696M-M.jpg' },
        ],
    },
    {
        name: 'Comfort reads for rainy days',
        curator: 'sarah_pages',
        count: 15,
        likes: 3100,
        comments: 203,
        books: [
            { id: 'OL20644253W', title: 'The Midnight Library', author: 'Matt Haig', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28423208M-M.jpg' },
            { id: 'OL20897277W', title: 'Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', coverUrl: 'https://covers.openlibrary.org/b/olid/OL37823790M-M.jpg' },
            { id: 'OL82536W', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22570024M-M.jpg' },
            { id: 'OL12345W', title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://covers.openlibrary.org/b/olid/OL27912450M-M.jpg' },
            { id: 'OL15125W', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: 'https://covers.openlibrary.org/b/olid/OL46874127M-M.jpg' },
        ],
    },
    {
        name: 'Literary fiction masterworks',
        curator: 'literary_leo',
        count: 18,
        likes: 950,
        comments: 67,
        books: [
            { id: 'OL45804W', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7177684M-M.jpg' },
            { id: 'OL82563W', title: 'The Night Circus', author: 'Erin Morgenstern', coverUrl: 'https://covers.openlibrary.org/b/olid/OL25429920M-M.jpg' },
            { id: 'OL19631252W', title: 'Piranesi', author: 'Susanna Clarke', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28553425M-M.jpg' },
            { id: 'OL82536W', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22570024M-M.jpg' },
            { id: 'OL23919W', title: 'Harry Potter', author: 'J.K. Rowling', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22856696M-M.jpg' },
        ],
    },
    {
        name: 'Dark academia essentials',
        curator: 'page_turner',
        count: 14,
        likes: 4200,
        comments: 312,
        books: [
            { id: 'OL27479W', title: '1984', author: 'George Orwell', coverUrl: 'https://covers.openlibrary.org/b/olid/OL46903932M-M.jpg' },
            { id: 'OL27258W', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://covers.openlibrary.org/b/olid/OL34621109M-M.jpg' },
            { id: 'OL81613W', title: 'The Alchemist', author: 'Paulo Coelho', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7358422M-M.jpg' },
            { id: 'OL27516W', title: 'The Hobbit', author: 'J.R.R. Tolkien', coverUrl: 'https://covers.openlibrary.org/b/olid/OL33891507M-M.jpg' },
            { id: 'OL17930368W', title: 'Project Hail Mary', author: 'Andy Weir', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28384937M-M.jpg' },
        ],
    },
    {
        name: 'Unputdownable thrillers',
        curator: 'mystery_maven',
        count: 22,
        likes: 1500,
        comments: 104,
        books: [
            { id: 'OL6769228W', title: 'The Hunger Games', author: 'Suzanne Collins', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22597972M-M.jpg' },
            { id: 'OL15125W', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: 'https://covers.openlibrary.org/b/olid/OL46874127M-M.jpg' },
            { id: 'OL12345W', title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://covers.openlibrary.org/b/olid/OL27912450M-M.jpg' },
            { id: 'OL20644253W', title: 'The Midnight Library', author: 'Matt Haig', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28423208M-M.jpg' },
            { id: 'OL20897277W', title: 'Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', coverUrl: 'https://covers.openlibrary.org/b/olid/OL37823790M-M.jpg' },
        ],
    },
];

interface ReviewItem {
    user: string;
    book: string;
    bookId: string;
    rating: number;
    comment: string;
    isReal?: boolean;
    date?: string;
}

interface BookCollection {
    name: string;
    description?: string;
    curator: string;
    count: number;
    likes?: number;
    comments?: number;
    books: { id: string; title: string; author?: string; coverUrl?: string }[];
}

export function Home() {
    const { user, isAuthenticated } = useAuth();

    // 1. Initial State from browser local cache (0ms instant display)
    const [heroBook, setHeroBook] = useState<Book | null>(() => {
        try {
            const saved = localStorage.getItem(DAILY_CACHE_KEY);
            if (saved) return JSON.parse(saved);
        } catch { /* ignore */ }
        return null;
    });

    const [showcaseBooks, setShowcaseBooks] = useState<Book[]>(() => {
        try {
            const saved = localStorage.getItem(BESTSELLERS_CACHE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch { /* ignore */ }
        return [];
    });

    const [recentBooks, setRecentBooks] = useState<Book[]>([]);
    const [communityReviews, setCommunityReviews] = useState<ReviewItem[]>(SAMPLE_REVIEWS);
    const [collections, setCollections] = useState<BookCollection[]>(DEFAULT_COLLECTIONS);

    // Load real user reviews from API
    useEffect(() => {
        if (!isAuthenticated) return;
        
        getAllLogs().then(realLogs => {
            const withNotes = realLogs.filter(l => l.notes && l.notes.trim() && (l.username || l.user?.username));
            if (withNotes.length > 0) {
                const sorted = [...withNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                const realItems: ReviewItem[] = sorted.slice(0, 10).map(l => ({
                    user: displayName(l.username || l.user?.username || 'Anonymous'),
                    book: l.bookTitle || 'a book',
                    bookId: l.bookId,
                    rating: l.rating,
                    comment: l.notes,
                    isReal: true,
                    date: new Date(l.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                }));
                
                // If fewer than 5 real reviews, blend with sample community reviews so the left column is always filled and balanced
                if (realItems.length < 5) {
                    setCommunityReviews([...realItems, ...SAMPLE_REVIEWS.slice(0, 5 - realItems.length)]);
                } else {
                    setCommunityReviews(realItems);
                }
            } else {
                setCommunityReviews(SAMPLE_REVIEWS);
            }
        }).catch(() => {
            setCommunityReviews(SAMPLE_REVIEWS);
        });
    }, [isAuthenticated]);

    // Fetch dynamic collections
    useEffect(() => {
        if (!isAuthenticated) return;
        api.get<{ collections: BookCollection[] }>('/api/books/collections')
            .then(res => {
                if (res.collections && res.collections.length > 0) {
                    setCollections(res.collections);
                }
            })
            .catch(() => {});
    }, [isAuthenticated]);

    // Fetch live bestsellers & daily book from server background ingestion cache (<10ms)
    useEffect(() => {
        if (!isAuthenticated) return;
        let isMounted = true;

        api.get<{ books: Book[] }>('/api/books/bestsellers')
            .then(res => {
                if (!isMounted || !res.books || res.books.length === 0) return;
                const books = res.books.slice(0, 15);
                setShowcaseBooks(books);
                try {
                    localStorage.setItem(BESTSELLERS_CACHE_KEY, JSON.stringify(books));
                } catch { /* ignore */ }
            })
            .catch(() => {
                // Fallback live search if endpoint fails
                searchBooks('bestselling popular award fiction', 0, 15).then(res => {
                    if (isMounted && res.books && res.books.length > 0) {
                        setShowcaseBooks(res.books);
                    }
                }).catch(() => {});
            });

        api.get<Book>('/api/books/daily')
            .then(book => {
                if (!isMounted || !book || !book.id) return;
                setHeroBook(book);
                try {
                    localStorage.setItem(DAILY_CACHE_KEY, JSON.stringify(book));
                } catch { /* ignore */ }
            })
            .catch(() => {});

        return () => { isMounted = false; };
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
                    Welcome back, <span className="lb-welcome-username">{displayName(user?.username)}</span>.
                </h1>
                <p className="lb-welcome-sub">Here's what your friends have been reading.</p>
            </section>

            {/* ── BOOK OF THE DAY (featured banner) ──────────────── */}
            {heroBook && (
                <section className="lb-botd-banner animate-fade-in-up delay-100">
                    <div className="lb-botd-badge-center">
                        <div className="lb-botd-badge">
                            <Crown size={14} />
                            BOOK OF THE DAY
                        </div>
                    </div>
                    <Link to={`/book/${heroBook.id}`} className="lb-botd-content">
                        <div className="lb-botd-cover-wrap">
                            <img
                                src={getBookCoverUrl(heroBook.id, heroBook.coverUrl, heroBook.title, heroBook.author)}
                                alt={heroBook.title}
                                className="lb-botd-cover"
                                onError={(e) => {
                                    e.currentTarget.src = getBookCoverUrl(heroBook.id, null, heroBook.title, heroBook.author);
                                }}
                            />
                        </div>
                        <div className="lb-botd-info">
                            <h2 className="lb-botd-title">{heroBook.title}</h2>
                            <p className="lb-botd-author">by {heroBook.author}</p>
                            <p className="lb-botd-desc">
                                {heroBook.description
                                    ? heroBook.description.slice(0, 280) + (heroBook.description.length > 280 ? '...' : '')
                                    : `Discover today's featured pick — a must-read that our community is loving right now. Dive into ${heroBook.title} and see what all the buzz is about.`
                                }
                            </p>
                            <div className="lb-botd-meta-row">
                                {heroBook.genre && heroBook.genre.length > 0 && heroBook.genre.map((g, i) => (
                                    <span key={i} className="lb-botd-genre-tag">{g}</span>
                                ))}
                                {heroBook.pages > 0 && <span className="lb-botd-meta-item">{heroBook.pages} pages</span>}
                                {heroBook.rating > 0 && (
                                    <span className="lb-botd-meta-item">
                                        <Star size={13} className="lb-botd-star" /> {heroBook.rating}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                </section>
            )}

            {/* ── 2-COLUMN LAYOUT ────────────────────────────────── */}
            <div className="lb-home-layout animate-fade-in-up delay-200">
                
                {/* LEFT MAIN COLUMN — Reviews */}
                <div className="lb-main-column">
                    <div className="lb-section-header">
                        <h2 className="lb-section-title">
                            <Activity style={{ display: 'inline', width: '1.1rem', height: '1.1rem', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                            NEW FROM FRIENDS & COMMUNITY
                        </h2>
                    </div>
                    
                    <div className="lb-activity-feed">
                        {communityReviews.length > 0 ? (
                            communityReviews.map((r, i) => (
                                <div key={i} className="lb-activity-card">
                                    <div className="lb-activity-header">
                                        <Link
                                            to={r.isReal ? `/user/${r.user}` : '#'}
                                            className="lb-activity-avatar"
                                            style={{ backgroundColor: getAvatarColor(r.user), color: '#ffffff' }}
                                        >
                                            {userInitial(r.user)}
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
                                                <span className="lb-activity-date">{r.date || 'Recently'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="lb-activity-comment">"{r.comment}"</p>
                                </div>
                            ))
                        ) : (
                            <div className="lb-activity-empty-box" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(212,175,55,0.2)' }}>
                                <BookOpen size={32} style={{ color: 'var(--primary)', margin: '0 auto 0.75rem auto', opacity: 0.8 }} />
                                <h3 style={{ color: 'var(--primary)', fontFamily: 'Cinzel, Georgia, serif', marginBottom: '0.4rem', fontSize: '1.1rem' }}>No Community Reviews Yet Today</h3>
                                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 1.25rem auto' }}>
                                    Be the first reader to write a review and share your perspective with the community!
                                </p>
                                <Link to="/trending" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                                    Discover Books to Review
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN — Popular This Week */}
                <div className="lb-sidebar-column">
                    
                    {/* Popular This Week — 15 books in a responsive grid */}
                    <div className="lb-sidebar-widget lb-popular-week-widget">
                        <div className="lb-section-header">
                            <h2 className="lb-section-title">
                                <TrendingUp style={{ display: 'inline', width: '1.1rem', height: '1.1rem', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                                POPULAR THIS WEEK
                            </h2>
                        </div>
                        <div className="lb-popular-grid">
                            {showcaseBooks.length > 0 ? (
                                showcaseBooks.map(book => (
                                    <Link key={book.id} to={`/book/${book.id}`} className="lb-popular-cover-link">
                                        <img
                                            src={getBookCoverUrl(book.id, book.coverUrl, book.title, book.author)}
                                            alt={book.title}
                                            className="lb-popular-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = getBookCoverUrl(book.id, null, book.title, book.author);
                                            }}
                                        />
                                        <div className="lb-popular-cover-overlay">
                                            <span className="lb-popular-cover-title">{book.title}</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                Array.from({ length: 15 }).map((_, i) => (
                                    <div key={i} className="lb-popular-cover-link" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', aspectRatio: '2/3', animation: 'pulse 1.5s ease-in-out infinite' }} />
                                ))
                            )}
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
                                        <img
                                            src={getBookCoverUrl(book.id, book.coverUrl, book.title, book.author)}
                                            alt={book.title}
                                            className="lb-sidebar-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = getBookCoverUrl(book.id, null, book.title, book.author);
                                            }}
                                        />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── POPULAR LISTS (Letterboxd style with cover previews) ── */}
            {collections.length > 0 && (
                <section className="lb-popular-lists-section animate-fade-in-up delay-300">
                    <div className="lb-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="lb-section-title lb-section-title-lg">
                            <Flame style={{ display: 'inline', width: '1.2rem', height: '1.2rem', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            POPULAR LISTS
                        </h2>
                        <Link to="/trending" className="lb-lists-more-link">MORE</Link>
                    </div>
                    <div className="lb-popular-lists-stack">
                        {collections.map((list, i) => (
                            <div key={i} className="lb-plist-card">
                                <div className="lb-plist-covers">
                                    {list.books.map((book, ci) => (
                                        <div key={ci} className="lb-plist-cover-slot">
                                            <img
                                                src={getBookCoverUrl(book.id, book.coverUrl, book.title, book.author)}
                                                alt={book.title}
                                                className="lb-plist-cover-img"
                                                onError={(e) => {
                                                    e.currentTarget.src = getBookCoverUrl(book.id, null, book.title, book.author);
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="lb-plist-info">
                                    <h3 className="lb-plist-name">{list.name}</h3>
                                    <div className="lb-plist-curator-row">
                                        <span
                                            className="lb-plist-curator-avatar"
                                            style={{ backgroundColor: getAvatarColor(list.curator), color: '#ffffff' }}
                                        >
                                            {userInitial(list.curator)}
                                        </span>
                                        <span className="lb-plist-curator-name">{list.curator}</span>
                                    </div>
                                    <div className="lb-plist-stats">
                                        <span className="lb-plist-stat">{list.count} books</span>
                                        <span className="lb-plist-stat">
                                            <Heart size={13} style={{ fill: '#888', color: '#888' }} /> {list.likes ? (list.likes >= 1000 ? (list.likes / 1000).toFixed(1) + 'K' : list.likes) : '2.4K'}
                                        </span>
                                        <span className="lb-plist-stat">
                                            <MessageCircle size={13} /> {list.comments || 89}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
