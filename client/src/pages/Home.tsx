import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp, Clock, Activity, Flame, Crown, Heart, MessageCircle } from 'lucide-react';
import { searchBooks, getBookDetails, type Book } from '@/lib/apiClient';
import { getAllLogs } from '@/lib/storage';
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
    { id: 'OL82563W', title: 'The Night Circus', author: 'Erin Morgenstern', coverUrl: 'https://covers.openlibrary.org/b/olid/OL25429920M-M.jpg', description: 'A breathtaking tale of two young magicians pitted against each other in a competition linked to a mysterious travelling circus that only appears at night. Rich with enchantment and wonder.', rating: 4.5, publishedDate: '2011', pages: 387, genre: ['Fantasy', 'Romance'] },
    { id: 'OL17930368W', title: 'Project Hail Mary', author: 'Andy Weir', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28384937M-M.jpg', description: 'A lone astronaut must save humanity from extinction in this interstellar adventure. Waking up with amnesia millions of miles from home, he must piece together his mission and find a way back.', rating: 4.7, publishedDate: '2021', pages: 476, genre: ['Sci-Fi', 'Adventure'] },
    { id: 'OL20897277W', title: 'Tomorrow, and Tomorrow, and Tomorrow', author: 'Gabrielle Zevin', coverUrl: 'https://covers.openlibrary.org/b/olid/OL37823790M-M.jpg', description: 'Two friends, connected by their love of video games, embark on a decades-long creative partnership that tests the boundaries of love, friendship, and art.', rating: 4.3, publishedDate: '2022', pages: 416, genre: ['Literary Fiction'] },
    { id: 'OL19631252W', title: 'Piranesi', author: 'Susanna Clarke', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28553425M-M.jpg', description: 'In a mysterious house of infinite halls and ocean tides, Piranesi lives alone, cataloguing its wonders. But when messages from a stranger appear, reality begins to unravel.', rating: 4.2, publishedDate: '2020', pages: 272, genre: ['Fantasy', 'Mystery'] },
    { id: 'OL20644253W', title: 'The Midnight Library', author: 'Matt Haig', coverUrl: 'https://covers.openlibrary.org/b/olid/OL28423208M-M.jpg', description: 'Between life and death lies a library where every book offers a different life Nora could have lived. A moving exploration of regret, hope, and the choices that define us.', rating: 4.1, publishedDate: '2020', pages: 304, genre: ['Fiction', 'Philosophy'] },
    { id: 'OL27258W', title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://covers.openlibrary.org/b/olid/OL34621109M-M.jpg', description: 'Set on the desert planet Arrakis, this epic saga follows Paul Atreides as he navigates politics, religion, and ecology in a fight for control of the universe\'s most valuable substance.', rating: 4.6, publishedDate: '1965', pages: 688, genre: ['Sci-Fi', 'Epic'] },
    { id: 'OL82536W', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22570024M-M.jpg', description: 'A portrait of the Jazz Age in all its decadence and excess. Jay Gatsby\'s obsessive pursuit of Daisy Buchanan reveals the dark underside of the American Dream.', rating: 4.0, publishedDate: '1925', pages: 180, genre: ['Classic', 'Literary Fiction'] },
    { id: 'OL45804W', title: 'Pride and Prejudice', author: 'Jane Austen', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7177684M-M.jpg', description: 'The witty and headstrong Elizabeth Bennet clashes with the proud Mr. Darcy in this timeless romance that skewers social class and celebrates the triumph of love over vanity.', rating: 4.5, publishedDate: '1813', pages: 432, genre: ['Classic', 'Romance'] },
    { id: 'OL27479W', title: '1984', author: 'George Orwell', coverUrl: 'https://covers.openlibrary.org/b/olid/OL46903932M-M.jpg', description: 'In a totalitarian society ruled by Big Brother, Winston Smith dares to dream of freedom. A chilling prophecy about surveillance, propaganda, and the power of language.', rating: 4.4, publishedDate: '1949', pages: 328, genre: ['Dystopian', 'Classic'] },
    { id: 'OL23919W', title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22856696M-M.jpg', description: 'An orphaned boy discovers he is a wizard and enters Hogwarts School, where he finds friendship, magic, and a dark mystery connected to his past. The book that launched a generation of readers.', rating: 4.7, publishedDate: '1997', pages: 309, genre: ['Fantasy', 'Young Adult'] },
    { id: 'OL27516W', title: 'The Hobbit', author: 'J.R.R. Tolkien', coverUrl: 'https://covers.openlibrary.org/b/olid/OL33891507M-M.jpg', description: 'Bilbo Baggins is swept into an epic quest to reclaim a lost kingdom from a fearsome dragon. A timeless adventure of courage, friendship, and the unexpected hero within us all.', rating: 4.5, publishedDate: '1937', pages: 310, genre: ['Fantasy', 'Adventure'] },
    { id: 'OL12345W', title: 'Atomic Habits', author: 'James Clear', coverUrl: 'https://covers.openlibrary.org/b/olid/OL27912450M-M.jpg', description: 'A revolutionary guide to building good habits and breaking bad ones. Small changes, remarkable results — learn how tiny behavioral shifts can transform your life completely.', rating: 4.6, publishedDate: '2018', pages: 320, genre: ['Self-Help', 'Productivity'] },
    { id: 'OL81613W', title: 'The Alchemist', author: 'Paulo Coelho', coverUrl: 'https://covers.openlibrary.org/b/olid/OL7358422M-M.jpg', description: 'A shepherd boy\'s journey from Spain to Egypt in search of treasure becomes a profound allegory about following your dreams and listening to your heart.', rating: 4.2, publishedDate: '1988', pages: 197, genre: ['Fiction', 'Philosophy'] },
    { id: 'OL15125W', title: 'To Kill a Mockingbird', author: 'Harper Lee', coverUrl: 'https://covers.openlibrary.org/b/olid/OL46874127M-M.jpg', description: 'Through the eyes of young Scout Finch, this Pulitzer Prize-winning novel explores racial injustice and moral growth in the American South during the 1930s.', rating: 4.6, publishedDate: '1960', pages: 336, genre: ['Classic', 'Literary Fiction'] },
    { id: 'OL6769228W', title: 'The Hunger Games', author: 'Suzanne Collins', coverUrl: 'https://covers.openlibrary.org/b/olid/OL22597972M-M.jpg', description: 'In a dystopian future, Katniss Everdeen volunteers to take her sister\'s place in a televised fight to the death. A gripping tale of survival, rebellion, and defiance.', rating: 4.4, publishedDate: '2008', pages: 374, genre: ['Dystopian', 'Young Adult'] },
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


    // Load real user reviews from API
    useEffect(() => {
        if (!isAuthenticated) return;
        
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
                    <div className="lb-botd-badge-center">
                        <div className="lb-botd-badge">
                            <Crown size={14} />
                            BOOK OF THE DAY
                        </div>
                    </div>
                    <Link to={`/book/${heroBook.id}`} className="lb-botd-content">
                        <div className="lb-botd-cover-wrap">
                            <img src={heroBook.coverUrl || FALLBACK_COVER} alt={heroBook.title} className="lb-botd-cover" />
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

