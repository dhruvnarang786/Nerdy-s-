
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Calendar, BookOpen, Loader2, Plus, Quote, LogIn, X } from 'lucide-react';
import { getBookDetails, type Book } from '@/lib/api';
import { getBookLogs, getBookCommunityLogs, type BookLog, isFavorite, toggleFavorite } from '@/lib/storage';
import { LogBook } from '@/components/features/LogBook';
import { useAuth } from '@/lib/AuthContext';
import '@/styles/pages.css';

export function BookDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [book, setBook] = useState<Book | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLogModal, setShowLogModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [logs, setLogs] = useState<BookLog[]>([]);
    const [communityLogs, setCommunityLogs] = useState<BookLog[]>([]);
    const [isFav, setIsFav] = useState(false);

    // Spoiler reveals
    const [revealSummary, setRevealSummary] = useState(false);
    const [revealedLogs, setRevealedLogs] = useState<Record<number, boolean>>({});

    const toggleRevealLog = (logId?: number) => {
        if (!logId) return;
        setRevealedLogs(prev => ({ ...prev, [logId]: true }));
    };

    const refreshLogs = async () => {
        if (id) {
            const [personal, community] = await Promise.all([
                getBookLogs(id),
                getBookCommunityLogs(id)
            ]);
            setLogs(personal);
            setCommunityLogs(community);
        }
    };

    useEffect(() => {
        const fetchBook = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getBookDetails(id);
                setBook(data);
                await refreshLogs();
                const favResult = await isFavorite(id);
                setIsFav(favResult);

                // Track recent views in localStorage
                const recentKey = 'nerdys_recent_views';
                const recent: string[] = JSON.parse(localStorage.getItem(recentKey) || '[]');
                const filtered = recent.filter(rid => rid !== id);
                filtered.unshift(id);
                localStorage.setItem(recentKey, JSON.stringify(filtered.slice(0, 10)));
            } catch (error) {
                console.error("Failed to fetch book details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();

    }, [id]);

    const handleToggleFav = () => {
        if (book) {
            toggleFavorite(book);
            setIsFav(!isFav);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!book) {
        return <div className="text-center py-20 text-2xl">Book not found</div>;
    }

    return (
        <div className="book-details-container relative">
            {/* Log Book Modal */}
            {showLogModal && (
                <LogBook
                    bookId={book.id}
                    bookTitle={book.title}
                    onClose={() => setShowLogModal(false)}
                    onSave={refreshLogs}
                />
            )}

            {/* Auth Required Modal Overlay */}
            {showAuthModal && (
                <div className="auth-modal-backdrop" onClick={() => setShowAuthModal(false)}>
                    <div className="auth-modal-box" onClick={e => e.stopPropagation()}>
                        <button className="auth-modal-close" onClick={() => setShowAuthModal(false)} aria-label="Close">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="auth-modal-icon-wrap">
                            <LogIn className="auth-modal-icon" />
                        </div>
                        <h3 className="auth-modal-title">Sign in to log books</h3>
                        <p className="auth-modal-desc">
                            Create a free account to track your reading, rate books, and leave reviews. Join thousands of book lovers on Nerdy's!
                        </p>
                        <div className="auth-modal-actions">
                            <button
                                className="btn btn-primary auth-modal-btn"
                                onClick={() => navigate('/register')}
                            >
                                Get started — it's free!
                            </button>
                            <button
                                className="btn btn-secondary auth-modal-btn"
                                onClick={() => navigate('/login')}
                            >
                                Log In
                            </button>
                        </div>
                        <p className="auth-modal-footer">
                            Already have an account? <Link to="/login" className="auth-modal-link">Sign in here</Link>
                        </p>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="book-details-header">
                <div className="flex-shrink-0 mx-auto md:mx-0">
                    <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="book-cover-large"
                    />
                </div>
                <div className="book-info">
                    <h1 className="book-title">{book.title}</h1>
                    <h2 className="book-author">{book.author}</h2>

                    <div className="book-meta">
                        <div className="meta-item">
                            <Star className="meta-icon fill-primary text-primary" />
                            <span className="rating-value">{book.rating || 'N/A'}</span>/5
                        </div>
                        <div className="meta-item">
                            <BookOpen className="meta-icon" />
                            <span>{book.pages} pages</span>
                        </div>
                        <div className="meta-item">
                            <Calendar className="meta-icon" />
                            <span>{book.publishedDate}</span>
                        </div>
                    </div>

                    <div className="tags-container">
                        {book.genre && book.genre.map((g) => (
                            <span key={g} className="tag">
                                {g}
                            </span>
                        ))}
                    </div>

                    <div className={`spoiler-container mb-6 ${revealSummary ? 'spoiler-revealed' : ''}`}>
                        {!revealSummary && (
                            <div className="spoiler-overlay" onClick={() => setRevealSummary(true)}>
                                <button className="spoiler-btn">
                                    Reveal Summary (May Contain Spoilers)
                                </button>
                            </div>
                        )}
                        <div className="book-description spoiler-blur" dangerouslySetInnerHTML={{ __html: book.description }} />
                    </div>

                    <div className="book-actions">
                        <button
                            onClick={() => {
                                if (!isAuthenticated) {
                                    setShowAuthModal(true);
                                } else {
                                    setShowLogModal(true);
                                }
                            }}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Log this Book
                        </button>
                        <button
                            onClick={handleToggleFav}
                            className={`btn ${isFav ? 'bg-red-500 hover:bg-red-600 text-white' : 'btn-secondary'}`}
                        >
                            {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Section */}
            <div className="reviews-section">
                <h3 className="reviews-title flex items-center gap-2">
                    Your Journal
                    {logs.length > 0 && <span className="text-sm font-normal text-muted-foreground ml-2">({logs.length} entries)</span>}
                </h3>

                {logs.length > 0 ? (
                    <div className="space-y-4">
                        {logs.map((log, index) => {
                            const isRevealed = log.id ? revealedLogs[log.id] : false;
                            const isSpoiler = log.hasSpoilers;

                            return (
                                <div key={index} className="review-card">
                                    <div className="review-header">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-primary/20 p-2 rounded-full">
                                                <Quote className="w-4 h-4 text-primary" />
                                            </div>
                                            <span className="text-sm text-muted-foreground">{log.dateRead}</span>
                                        </div>
                                        <div className="review-rating">
                                            <Star className="star-icon" />
                                            <span className="text-sm font-bold">{log.rating}</span>
                                        </div>
                                    </div>
                                    <div className={`mt-3 ${isSpoiler ? 'spoiler-container' : ''} ${isRevealed ? 'spoiler-revealed' : ''}`}>
                                        {isSpoiler && !isRevealed && (
                                            <div className="spoiler-overlay" style={{ background: 'transparent' }} onClick={() => toggleRevealLog(log.id)}>
                                                <button className="spoiler-btn">Reveal Spoiler Paragraph</button>
                                            </div>
                                        )}
                                        <p className={`review-comment italic text-lg text-foreground/90 ${isSpoiler ? 'spoiler-blur' : ''}`}>
                                            "{log.notes}"
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-secondary/30 border border-border rounded-xl p-8 text-center space-y-3">
                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground" />
                        <h4 className="text-lg font-semibold">Start your collection</h4>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            You haven't logged this book yet. Click "Log this Book" to add your dates, rating, and thoughts.
                        </p>
                    </div>
                )}

                {/* Community Reviews Section */}
                <h3 className="reviews-title flex items-center gap-2 mt-12">
                    Community Reviews
                    {communityLogs.length > 0 && <span className="text-sm font-normal text-muted-foreground ml-2">({communityLogs.length} entries)</span>}
                </h3>

                {communityLogs.length > 0 ? (
                    <div className="space-y-4">
                        {communityLogs.map((log, index) => {
                            const isRevealed = log.id ? revealedLogs[log.id] : false;
                            const isSpoiler = log.hasSpoilers;

                            return (
                                <div key={index} className="review-card">
                                    <div className="review-header">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-primary/20 p-2 rounded-full">
                                                <Quote className="w-4 h-4 text-primary" />
                                            </div>
                                            {log.user && <span className="text-sm font-bold ml-1 text-white">{log.user.username}</span>}
                                            <span className="text-sm text-muted-foreground">{log.dateRead}</span>
                                        </div>
                                        <div className="review-rating">
                                            <Star className="star-icon" />
                                            <span className="text-sm font-bold">{log.rating}</span>
                                        </div>
                                    </div>
                                    <div className={`mt-3 ${isSpoiler ? 'spoiler-container' : ''} ${isRevealed ? 'spoiler-revealed' : ''}`}>
                                        {isSpoiler && !isRevealed && (
                                            <div className="spoiler-overlay" style={{ background: 'transparent' }} onClick={() => toggleRevealLog(log.id)}>
                                                <button className="spoiler-btn">Reveal Spoiler Paragraph</button>
                                            </div>
                                        )}
                                        <p className={`review-comment italic text-lg text-foreground/90 ${isSpoiler ? 'spoiler-blur' : ''}`}>
                                            "{log.notes}"
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-muted-foreground italic mt-4">No community reviews yet.</div>
                )}
            </div>
        </div>
    );
}
