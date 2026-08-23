
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, BookOpen, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import { getUserLogs, type BookLog } from '@/lib/storage';
import { displayName, userInitial, getAvatarColor } from '@/lib/displayName';
import { getBookCoverUrl } from '@/lib/bookCover';
import { useAuth } from '@/lib/AuthContext';
import '@/styles/pages.css';

export function UserProfile() {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser } = useAuth();
    const [logs, setLogs] = useState<BookLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!username) return;
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

    const isOwnProfile = currentUser?.username === username;
    const profileAvatar = isOwnProfile ? currentUser?.avatar : null;
    const avatarColor = getAvatarColor(isOwnProfile ? (currentUser?.email || currentUser?.username) : username);
    const cleanName = displayName(username);

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
                <div className="profile-avatar-lg" style={{ backgroundColor: profileAvatar ? '#1a1614' : avatarColor }}>
                    {profileAvatar ? (
                        <img
                            src={profileAvatar}
                            alt={cleanName}
                            className="profile-avatar-lg-img"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) parent.style.backgroundColor = avatarColor;
                            }}
                        />
                    ) : (
                        <span style={{ color: '#ffffff', fontWeight: 800 }}>{userInitial(username)}</span>
                    )}
                </div>
                <div className="profile-info">
                    <h1 className="profile-username">@{cleanName}</h1>
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
                            <div key={i} className="profile-log-card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                <Link to={`/book/${log.bookId}`} style={{ flexShrink: 0 }}>
                                    <img
                                        src={getBookCoverUrl(log.bookId, log.coverUrl, log.bookTitle, log.author)}
                                        alt={log.bookTitle || 'Book'}
                                        style={{ width: '48px', height: '72px', objectFit: 'cover', borderRadius: '4px' }}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = getBookCoverUrl(log.bookId, null, log.bookTitle, log.author);
                                        }}
                                    />
                                </Link>
                                <div style={{ flex: 1, minWidth: 0 }}>
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
