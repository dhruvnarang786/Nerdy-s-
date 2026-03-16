
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { getUserLogs, type BookLog } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';
import { getBookDetails, type Book } from '@/lib/api';
import '@/styles/pages.css';

export function Journal() {
    const { user, isAuthenticated } = useAuth();
    const [logs, setLogs] = useState<BookLog[]>([]);
    const [bookMap, setBookMap] = useState<Record<string, Book>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { setLoading(false); return; }

        (async () => {
            try {
                const userLogs = await getUserLogs(user.username);
                userLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setLogs(userLogs);

                // Fetch book details for logs that don't have a title stored
                const idsNeedingFetch = [...new Set(userLogs.filter(l => !l.bookTitle).map(l => l.bookId))];
                if (idsNeedingFetch.length > 0) {
                    const books = await Promise.all(idsNeedingFetch.map(id => getBookDetails(id)));
                    const map: Record<string, Book> = {};
                    books.forEach(b => { if (b) map[b.id] = b; });
                    setBookMap(map);
                }
            } catch (err) {
                console.error('Failed to load journal:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    if (!isAuthenticated) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div className="auth-logo">
                        <BookOpen className="auth-logo-icon" />
                    </div>
                    <h2 className="auth-title">Your Reading Journal</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>Sign in to view and manage your book logs</p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <Link to="/login" className="btn btn-secondary">Log In</Link>
                        <Link to="/register" className="btn btn-primary">Get Started</Link>
                    </div>
                </div>
            </div>
        );
    }

    const avgRating = logs.length
        ? (logs.reduce((s, l) => s + l.rating, 0) / logs.length).toFixed(1)
        : '—';

    return (
        <div className="page-container-inner">
            <div className="journal-header">
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
                        📖 My Journal
                    </h1>
                    <p className="page-description">Everything you've read and reviewed, {user?.username}.</p>
                </div>
                <Link to={`/user/${user?.username}`} className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                    View Public Profile
                </Link>
            </div>

            {/* Stats */}
            <div className="journal-stats">
                <div className="journal-stat">
                    <span className="journal-stat-val">{logs.length}</span>
                    <span className="journal-stat-lbl">Books Logged</span>
                </div>
                <div className="journal-stat-sep" />
                <div className="journal-stat">
                    <span className="journal-stat-val">{avgRating}</span>
                    <span className="journal-stat-lbl">Avg Rating</span>
                </div>
                <div className="journal-stat-sep" />
                <div className="journal-stat">
                    <span className="journal-stat-val">{logs.filter(l => l.notes?.trim()).length}</span>
                    <span className="journal-stat-lbl">Reviews Written</span>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 className="w-8 h-8 animate-spin text-primary" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
                </div>
            ) : logs.length === 0 ? (
                <div className="profile-empty">
                    <BookOpen className="profile-empty-icon" />
                    <p>You haven't logged any books yet.</p>
                    <Link to="/trending" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Trending Books</Link>
                </div>
            ) : (
                <div className="profile-logs">
                    {logs.map((log, i) => {
                        const book = bookMap[log.bookId];
                        const title = log.bookTitle || book?.title || `Book`;
                        return (
                            <div key={i} className="profile-log-card">
                                <div className="profile-log-header">
                                    <div>
                                        <Link to={`/book/${log.bookId}`} className="profile-log-book-title">
                                            {title}
                                        </Link>
                                        <div className="profile-log-meta">
                                            <Calendar className="w-3 h-3" />
                                            <span>Read on {log.dateRead}</span>
                                        </div>
                                    </div>
                                    <div className="profile-log-rating">
                                        {Array.from({ length: log.rating }).map((_, si) => (
                                            <Star key={si} className="profile-star" />
                                        ))}
                                        <span className="profile-log-rating-num">{log.rating}/5</span>
                                    </div>
                                </div>
                                {log.notes && (
                                    <p className="profile-log-notes">"{log.notes}"</p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
