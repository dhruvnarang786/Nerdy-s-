
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, BookOpen, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { getUserLogs, type BookLog } from '@/lib/storage';
import '@/styles/pages.css';

export function UserProfile() {
    const { username } = useParams<{ username: string }>();
    const [logs, setLogs] = useState<BookLog[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!username) return;
        setLoading(true);
        getUserLogs(username)
            .then(userLogs => {
                userLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setLogs(userLogs);
            })
            .catch(err => console.error('Failed to load profile:', err))
            .finally(() => setLoading(false));
    }, [username]);

    const avgRating = logs.length
        ? (logs.reduce((s, l) => s + l.rating, 0) / logs.length).toFixed(1)
        : '—';

    const avatarColor = stringToColor(username || '');

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 style={{ width: '2rem', height: '2rem', animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div className="page-container-inner">
            {/* Back */}
            <Link to="/" className="profile-back">
                <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>

            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-avatar-lg" style={{ background: avatarColor }}>
                    {(username || '?')[0].toUpperCase()}
                </div>
                <div className="profile-info">
                    <h1 className="profile-username">@{username}</h1>
                    <p className="profile-sub">Member of Nerdy's</p>
                    <div className="profile-stats">
                        <div className="profile-stat">
                            <span className="profile-stat-val">{logs.length}</span>
                            <span className="profile-stat-lbl">Books Logged</span>
                        </div>
                        <div className="profile-stat-sep" />
                        <div className="profile-stat">
                            <span className="profile-stat-val">{avgRating}</span>
                            <span className="profile-stat-lbl">Avg Rating</span>
                        </div>
                        <div className="profile-stat-sep" />
                        <div className="profile-stat">
                            <span className="profile-stat-val">
                                {logs.filter(l => l.notes && l.notes.trim()).length}
                            </span>
                            <span className="profile-stat-lbl">Reviews Written</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs / Reviews */}
            <div>
                <h2 className="profile-section-title">
                    <BookOpen style={{ display: 'inline', width: '1.1rem', height: '1.1rem', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                    Reading Journal
                </h2>

                {logs.length === 0 ? (
                    <div className="profile-empty">
                        <BookOpen className="profile-empty-icon" />
                        <p>No logs yet. This user hasn't logged any books.</p>
                    </div>
                ) : (
                    <div className="profile-logs">
                        {logs.map((log, i) => (
                            <div key={i} className="profile-log-card">
                                <div className="profile-log-header">
                                    <div>
                                        <Link
                                            to={`/book/${log.bookId}`}
                                            className="profile-log-book-title"
                                        >
                                            {log.bookTitle || `Book #${log.bookId.slice(0, 8)}`}
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Generate a deterministic color from a string
function stringToColor(str: string): string {
    const colors = [
        'linear-gradient(135deg, #7c3aed, #a855f7)',
        'linear-gradient(135deg, #0891b2, #06b6d4)',
        'linear-gradient(135deg, #e11d48, #f43f5e)',
        'linear-gradient(135deg, #d97706, #f59e0b)',
        'linear-gradient(135deg, #059669, #10b981)',
        'linear-gradient(135deg, #7c3aed, #3b82f6)',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}
