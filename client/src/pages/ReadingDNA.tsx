import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar, XAxis } from 'recharts';
import { api } from '@/lib/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { Check, Flame, Star, Moon, Sun, BookHeart, Library, Edit3, UserPlus, Shield, Zap, Lock } from 'lucide-react';
import '@/styles/dna-gaming.css';

interface DNAStats {
    stats: {
        booksReadThisYear: number;
        avgRating: string | number;
        currentStreak: number;
        totalLogs: number;
        heatmap: number[];
    };
    badges: {
        nightOwl: boolean;
        weekendWarrior: boolean;
        sevenDayStreak: boolean;
        thirtyDayStreak: boolean;
    };
    genres: { name: string; value: number }[];
    recentBooks?: { id: string; title: string; author: string; coverUrl: string }[];
}

interface Friend {
    id: number;
    username: string;
    bio: string | null;
    _count: { logs: number };
}

// ─── Motivational badge card ───────────────────────────────────────────────
interface BadgeCardProps {
    value: number;
    max: number;
    label: string;
    active: boolean;
    color: string;
    glow: string;
    bg: string;
    Icon: React.ComponentType<{ size?: number; color?: string }>;
    motivation: string;
}

function BadgeCard({ value, max, label, active, color, glow, bg, Icon, motivation }: BadgeCardProps) {
    const radius = 34;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(value / max, 1);
    const dashOffset = circumference - progress * circumference;
    const iconSize = 78;   // SVG canvas
    const iconPad = 8;     // padding inside SVG for progress ring

    return (
        <div
            className={`gaming-achievement-card ${active ? 'unlocked' : ''}`}
            style={{
                '--badge-color': color,
                '--badge-glow': glow,
                '--badge-bg': bg,
            } as React.CSSProperties}
        >
            {/* label */}
            <p className="gaming-achiever-label">{label}</p>

            {/* icon + progress ring */}
            <div className="gaming-badge-icon-wrap" style={{ width: 78, height: 78 }}>
                {/* sparkle dot */}
                {active && <span className="gaming-badge-sparkle" />}

                {/* progress ring drawn as SVG around the icon */}
                <svg
                    className="gaming-badge-progress-svg"
                    width={iconSize + iconPad * 2}
                    height={iconSize + iconPad * 2}
                    viewBox={`0 0 ${iconSize + iconPad * 2} ${iconSize + iconPad * 2}`}
                >
                    <circle
                        className="gaming-badge-ring-bg"
                        cx={(iconSize + iconPad * 2) / 2}
                        cy={(iconSize + iconPad * 2) / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        className="gaming-badge-ring-fill"
                        cx={(iconSize + iconPad * 2) / 2}
                        cy={(iconSize + iconPad * 2) / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                    />
                </svg>

                <Icon size={32} color={active ? color : '#475569'} />

                {/* check / lock indicator */}
                {active
                    ? <span className="gaming-badge-check">✓</span>
                    : <span className="gaming-badge-lock"><Lock size={10} /></span>
                }
            </div>

            {/* value progress */}
            <div className="gaming-badge-progress-text">{value}</div>
            <div className="gaming-badge-max-text">of {max}</div>

            {/* motivational tagline shown on hover */}
            <div className="gaming-badge-motivation">{motivation}</div>
        </div>
    );
}

export function ReadingDNA() {
    const { isAuthenticated, user, loading: authLoading } = useAuth();
    const [dna, setDna] = useState<DNAStats | null>(null);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    // Bio Edit State
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bioText, setBioText] = useState("I love reading and track my progress here!");

    // Friend Add State
    const [friendUsername, setFriendUsername] = useState('');
    const [friendMsg, setFriendMsg] = useState('');

    useEffect(() => {
        if (!isAuthenticated || authLoading) return;

        const fetchData = async () => {
            try {
                const res = await api.get<DNAStats>('/api/dna');
                setDna(res);

                const fRes = await api.get<{ friends: Friend[] }>('/api/friends');
                setFriends(fRes.friends);
            } catch (err) {
                console.error("Failed to fetch DNA stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated, authLoading]);

    const handleSaveBio = async () => {
        try {
            await api.post('/api/profile', { bio: bioText });
            setIsEditingBio(false);
        } catch (e: any) {
            console.error(e);
            alert("Failed to save bio");
        }
    };

    const handleAddFriend = async (e: React.FormEvent) => {
        e.preventDefault();
        setFriendMsg('');
        try {
            await api.post('/api/friends/add', { username: friendUsername });
            setFriendMsg('Friend added!');
            setFriendUsername('');
            const fRes = await api.get<{ friends: Friend[] }>('/api/friends');
            setFriends(fRes.friends);
        } catch (e: any) {
            setFriendMsg(e.message || 'Error adding friend');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="lb-page-container flex-center" style={{ minHeight: '80vh' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="lb-page-container flex-center" style={{ minHeight: '80vh' }}>
                <div className="auth-prompt-box glass-panel text-center">
                    <h2 className="lb-section-title">Unlock Your Analytics</h2>
                    <p className="lb-body-text">Sign in to view your real-time reading stats and achievements.</p>
                </div>
            </div>
        );
    }

    if (!dna) return null;

    const { stats, badges, genres, recentBooks = [] } = dna;
    const activeBook = recentBooks[0];
    const topBooks = recentBooks.slice(1, 5);

    const historyData = [
        { name: 'Mon', hours: 1.2 },
        { name: 'Tue', hours: 2.5 },
        { name: 'Wed', hours: 1.8 },
        { name: 'Thu', hours: 3.5 },
        { name: 'Fri', hours: 2.0 },
        { name: 'Sat', hours: 5.2 },
        { name: 'Sun', hours: 4.8 },
    ];

    const allBadges = [
        { id: 'b10', name: '10 Books', desc: 'Read 10 books this year', earned: stats.booksReadThisYear >= 10, icon: BookHeart, color: '#f43f5e' },
        { id: 'b50', name: '50 Reviews', desc: 'Log 50 total books', earned: stats.totalLogs >= 50, icon: Shield, color: '#0ea5e9' },
        { id: 's7', name: '1 Week Streak', desc: 'Read 7 days in a row', earned: badges.sevenDayStreak, icon: Flame, color: '#f97316' },
        { id: 's30', name: '1 Month Streak', desc: 'Read 30 days in a row', earned: badges.thirtyDayStreak, icon: Zap, color: '#eab308' },
        { id: 'n1', name: 'Night Owl', desc: 'Read mostly late at night', earned: badges.nightOwl, icon: Moon, color: '#8b5cf6' },
        { id: 'w1', name: 'Weekender', desc: 'Read mostly on weekends', earned: badges.weekendWarrior, icon: Sun, color: '#f59e0b' },
    ];

    // Rank item definitions with glow colours
    const rankItems = [
        {
            icon: <Flame size={32} color={stats.currentStreak > 0 ? "#f97316" : "#475569"} />,
            title: 'Current Streak',
            sub: `${stats.currentStreak} Days`,
            glowColor: 'rgba(249,115,22,0.45)',
            tooltip: stats.currentStreak > 0 ? `🔥 ${stats.currentStreak}-day reading streak! Keep it up!` : 'Log a book today to start your streak!',
        },
        {
            icon: <Star size={32} color="#0ea5e9" />,
            title: 'Avg Rating',
            sub: `${stats.avgRating} ★`,
            glowColor: 'rgba(14,165,233,0.45)',
            tooltip: `⭐ Your average rating across all logs`,
        },
        {
            icon: <Moon size={32} color={badges.nightOwl ? "#8b5cf6" : "#475569"} />,
            title: 'Night Owl',
            sub: badges.nightOwl ? "Unlocked" : "Locked",
            glowColor: 'rgba(139,92,246,0.45)',
            tooltip: badges.nightOwl ? '🦉 You read late into the night!' : 'Read often after 10 PM to unlock',
        },
        {
            icon: <Sun size={32} color={badges.weekendWarrior ? "#f59e0b" : "#475569"} />,
            title: 'Weekender',
            sub: badges.weekendWarrior ? "Unlocked" : "Locked",
            glowColor: 'rgba(245,158,11,0.45)',
            tooltip: badges.weekendWarrior ? '☀️ Weekend reading champion!' : 'Read mostly on weekends to unlock',
        },
    ];

    // Badge card definitions
    const badgeCards = [
        {
            value: stats.booksReadThisYear, max: 10,
            label: '10 Books Read',
            active: stats.booksReadThisYear >= 10,
            color: '#f43f5e', glow: 'rgba(244,63,94,0.4)', bg: 'rgba(244,63,94,0.12)',
            Icon: BookHeart,
            motivation: stats.booksReadThisYear >= 10 ? '🎉 Bookworm unlocked!' : `${10 - stats.booksReadThisYear} more to unlock!`,
        },
        {
            value: stats.totalLogs, max: 50,
            label: '50 Reviews',
            active: stats.totalLogs >= 50,
            color: '#0ea5e9', glow: 'rgba(14,165,233,0.4)', bg: 'rgba(14,165,233,0.12)',
            Icon: Shield,
            motivation: stats.totalLogs >= 50 ? '🏆 Legendary reviewer!' : `${50 - stats.totalLogs} logs to go!`,
        },
        {
            value: stats.currentStreak, max: 7,
            label: '7 Day Streak',
            active: badges.sevenDayStreak,
            color: '#f97316', glow: 'rgba(249,115,22,0.4)', bg: 'rgba(249,115,22,0.12)',
            Icon: Flame,
            motivation: badges.sevenDayStreak ? '🔥 One week strong!' : 'Read every day this week!',
        },
        {
            value: stats.currentStreak, max: 30,
            label: '30 Day Streak',
            active: badges.thirtyDayStreak,
            color: '#eab308', glow: 'rgba(234,179,8,0.4)', bg: 'rgba(234,179,8,0.12)',
            Icon: Zap,
            motivation: badges.thirtyDayStreak ? '⚡ Month-long legend!' : 'Stay consistent for 30 days!',
        },
    ];

    return (
        <div className="gaming-dna-wrapper animate-fade-in">
            <div className="gaming-dashboard">
                {/* Header Banner */}
                <div className="gaming-hero-banner">
                    <div className="gaming-overlay"></div>
                    <div className="gaming-nav">
                        <div className="flex items-center gap-3">
                            <Library size={24} color="#e2e8f0" />
                            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Nerdy's Analytics</span>
                        </div>
                        <div className="gaming-nav-links">
                            {['Overview', 'Stats', 'Friends', 'Achievements'].map(tab => (
                                <span key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                                    {tab}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Profile Avatar & Info */}
                <div className="gaming-profile-header">
                    <div className="gaming-avatar-wrapper">
                        <div className="gaming-avatar-ring"></div>
                        <div className="gaming-avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="gaming-user-info pb-2" style={{ flex: 1 }}>
                        <div className="flex justify-between items-center w-full">
                            <h1>
                                {user.username}
                                <span className="gaming-friends-pill">
                                    <Check size={14} /> ACTIVE
                                </span>
                            </h1>
                        </div>
                        <div className="gaming-status">
                            Explorer Level <strong>{Math.max(1, Math.floor(stats.totalLogs / 5))}</strong>
                        </div>
                        <div className="gaming-level">
                            {stats.booksReadThisYear} Books Read This Year
                        </div>
                    </div>
                </div>

                {/* Main Split Layout */}
                <div className="gaming-main">

                    {/* Left Column */}
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <p className="gaming-bio mb-0">{bioText}</p>
                            <button onClick={() => setIsEditingBio(true)} className="gaming-edit-btn" title="Edit Bio">
                                <Edit3 size={14} />
                            </button>
                        </div>

                        <h3 className="gaming-section-title mt-8">Activity</h3>
                        {activeBook ? (
                            <div className="gaming-activity-card">
                                {/* ── Book cover: always try to show img, fall back to emoji ── */}
                                {activeBook.coverUrl && !activeBook.coverUrl.includes('placeholder') ? (
                                    <img
                                        src={activeBook.coverUrl}
                                        alt={activeBook.title}
                                        onError={(e) => {
                                            const img = e.currentTarget as HTMLImageElement;
                                            img.style.display = 'none';
                                            const fallback = img.nextElementSibling as HTMLElement | null;
                                            if (fallback) fallback.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className="gaming-activity-cover-placeholder"
                                    style={{ display: (!activeBook.coverUrl || activeBook.coverUrl.includes('placeholder')) ? 'flex' : 'none' }}
                                >
                                    📚
                                </div>
                                <div className="gaming-activity-details">
                                    <div className="gaming-activity-tag">Recently Logged</div>
                                    <h4 className="gaming-activity-title">{activeBook.title}</h4>
                                    <div className="gaming-activity-meta">By {activeBook.author}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="gaming-activity-card" style={{ background: '#232833' }}>
                                <div className="gaming-activity-details">
                                    <h4 className="gaming-activity-title text-gray-400">No recent activity</h4>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Overview' && (
                            <>
                                <h3 className="gaming-section-title">Top Books</h3>
                                <div className="gaming-top-games">
                                    {topBooks.map((b, i) => (
                                        <div key={i} className="gaming-top-game" style={{ backgroundImage: `url(${b.coverUrl})` }}></div>
                                    ))}
                                    {[...Array(Math.max(0, 4 - topBooks.length))].map((_, i) => (
                                        <div key={`empty-${i}`} className="gaming-top-game" style={{ background: '#232833', border: '1px dashed #334155' }}></div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Column */}
                    <div>
                        {activeTab === 'Overview' && (
                            <>
                                {/* ── Ranks with glow hover + tooltip ── */}
                                <h3 className="gaming-section-title">Ranks</h3>
                                <div className="gaming-ranks-row">
                                    {rankItems.map((r, i) => (
                                        <div
                                            key={i}
                                            className="gaming-rank-item"
                                            style={{ '--rank-glow': r.glowColor } as React.CSSProperties}
                                        >
                                            {/* Tooltip bubble */}
                                            <div className="gaming-rank-tooltip">{r.tooltip}</div>
                                            <div className="gaming-rank-icon">{r.icon}</div>
                                            <h4 className="gaming-rank-title">{r.title}</h4>
                                            <span className="gaming-rank-sub">{r.sub}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Latest Achievements — motivational badge cards ── */}
                                <h3 className="gaming-section-title">Latest Achievements</h3>
                                <div className="gaming-achievements-row">
                                    {badgeCards.map((bc, i) => (
                                        <BadgeCard key={i} {...bc} />
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'Stats' && (
                            <>
                                {/* Stat summary cards */}
                                <div className="dna-stats-cards">
                                    <div className="dna-stat-card">
                                        <div className="dna-stat-icon" style={{ color: '#4ade80', background: 'rgba(74,222,128,0.1)' }}>📖</div>
                                        <div className="dna-stat-value">{stats.booksReadThisYear}</div>
                                        <div className="dna-stat-label">Books This Year</div>
                                    </div>
                                    <div className="dna-stat-card">
                                        <div className="dna-stat-icon" style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}>⭐</div>
                                        <div className="dna-stat-value">{stats.avgRating || '—'}</div>
                                        <div className="dna-stat-label">Avg Rating</div>
                                    </div>
                                    <div className="dna-stat-card">
                                        <div className="dna-stat-icon" style={{ color: '#f97316', background: 'rgba(249,115,22,0.1)' }}>🔥</div>
                                        <div className="dna-stat-value">{stats.currentStreak}</div>
                                        <div className="dna-stat-label">Day Streak</div>
                                    </div>
                                    <div className="dna-stat-card">
                                        <div className="dna-stat-icon" style={{ color: '#0ea5e9', background: 'rgba(14,165,233,0.1)' }}>📝</div>
                                        <div className="dna-stat-value">{stats.totalLogs}</div>
                                        <div className="dna-stat-label">Total Reviews</div>
                                    </div>
                                </div>

                                <h3 className="gaming-section-title">Reading Heatmap ({new Date().getFullYear()})</h3>
                                <div className="mb-8 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                    <div className="heatmap-month-labels">
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                                            <div key={m} className="heatmap-month-label">{m}</div>
                                        ))}
                                    </div>
                                    <div className="heatmap-container">
                                        {(stats.heatmap || Array(12).fill(0)).map((count, i) => {
                                            const lev = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : 3;
                                            return (
                                                <div key={i} className={`heatmap-cell level-${lev}`} title={`${count} books`}>
                                                    {count > 0 && <span className="heatmap-count">{count}</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-4 justify-end">
                                        <span>Less</span>
                                        <div className="heatmap-cell" style={{ width: '16px', height: '16px' }}></div>
                                        <div className="heatmap-cell level-1" style={{ width: '16px', height: '16px' }}></div>
                                        <div className="heatmap-cell level-2" style={{ width: '16px', height: '16px' }}></div>
                                        <div className="heatmap-cell level-3" style={{ width: '16px', height: '16px' }}></div>
                                        <span>More</span>
                                    </div>
                                </div>

                                <h3 className="gaming-section-title">Performance Metrics</h3>
                                <div className="gaming-stats-row">
                                    <div>
                                        <h4 className="gaming-rank-title mb-4" style={{ color: '#94a3b8', letterSpacing: '0.1em' }}>READING ACTIVITY (MOCK TRACK)</h4>
                                        <div className="gaming-stat-chart">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={historyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                                    <Area type="monotone" dataKey="hours" stroke="#4ade80" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="gaming-rank-title mb-1 text-center" style={{ color: '#94a3b8', letterSpacing: '0.1em' }}>TOP GENRES</h4>
                                        <div className="gaming-stat-chart" style={{ height: '180px' }}>
                                            {genres.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="60%" data={genres}>
                                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                                        <PolarAngleAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9 }} />
                                                        <Radar name="Count" dataKey="value" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-xs text-slate-500">Log more books to see genre data</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'Friends' && (
                            <>
                                <h3 className="gaming-section-title">Add Friend</h3>
                                <form onSubmit={handleAddFriend} className="friend-add-bar">
                                    <input
                                        type="text"
                                        className="gaming-input !mb-0"
                                        placeholder="Enter unique username..."
                                        value={friendUsername}
                                        onChange={e => setFriendUsername(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="gaming-btn" style={{ width: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <UserPlus size={18} /> Add
                                    </button>
                                </form>
                                {friendMsg && <p className="text-sm text-green-400 mb-6">{friendMsg}</p>}

                                <h3 className="gaming-section-title">Your Network ({friends.length})</h3>
                                {friends.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                                        You haven't added any friends yet.
                                    </div>
                                ) : (
                                    <div className="friends-grid">
                                        {friends.map(f => (
                                            <div key={f.id} className="friend-card">
                                                <div className="friend-avatar">
                                                    {f.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold mb-1">{f.username}</h4>
                                                    <p className="text-xs text-slate-400">Level {Math.max(1, Math.floor(f._count.logs / 5))} • {f._count.logs} Logs</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeTab === 'Achievements' && (
                            <>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="gaming-section-title mb-0">Total Badges</h3>
                                    <span className="text-sm text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full">
                                        {allBadges.filter(b => b.earned).length} / {allBadges.length} Earned
                                    </span>
                                </div>
                                <div className="badge-gallery">
                                    {allBadges.map(badge => (
                                        <div key={badge.id} className={`badge-item ${badge.earned ? 'earned' : ''}`}>
                                            <div className="badge-icon-wrap" style={{ background: `${badge.color}20`, color: badge.color }}>
                                                <badge.icon size={28} />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm mb-1">{badge.name}</h4>
                                                <p className="text-xs text-slate-400">{badge.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Bio Modal */}
            {isEditingBio && (
                <div className="gaming-modal-overlay">
                    <div className="gaming-modal animate-fade-in-up">
                        <h3 className="lb-section-title mb-4">Edit Profile</h3>
                        <textarea
                            className="gaming-input"
                            rows={4}
                            value={bioText}
                            onChange={e => setBioText(e.target.value)}
                            placeholder="Tell us about your reading habits..."
                        />
                        <div className="flex gap-3 mt-2">
                            <button className="gaming-btn" style={{ background: 'transparent', border: '1px solid #334155', color: '#e2e8f0' }} onClick={() => setIsEditingBio(false)}>Cancel</button>
                            <button className="gaming-btn" onClick={handleSaveBio}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
