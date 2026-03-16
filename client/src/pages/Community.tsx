
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MessageSquare, Users, ChevronRight } from 'lucide-react';
import { api } from '@/lib/apiClient';
import { useAuth } from '@/lib/AuthContext';
import { ChatRoom } from '@/components/features/ChatRoom';
import '@/styles/pages.css';

interface Room {
    id: number;
    name: string;
    slug: string;
    description: string;
    emoji: string;
}

export function Community() {
    const { slug } = useParams<{ slug?: string }>();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        api.get<{ rooms: Room[] }>('/api/chat/rooms').then(({ rooms }) => {
            setRooms(rooms);
            if (slug) {
                const found = rooms.find(r => r.slug === slug);
                if (found) setActiveRoom(found);
            } else if (rooms.length > 0) {
                setActiveRoom(rooms[0]);
            }
        }).catch(console.error);
    }, [slug]);

    if (!isAuthenticated) {
        return (
            <div className="auth-page">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div className="auth-logo">
                        <MessageSquare className="auth-logo-icon" />
                    </div>
                    <h2 className="auth-title">Join the Conversation</h2>
                    <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
                        Sign in to chat with other book lovers in real time.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                        <Link to="/login" className="btn btn-secondary">Log In</Link>
                        <Link to="/register" className="btn btn-primary">Get Started</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="community-layout">
            {/* Sidebar */}
            <aside className="community-sidebar">
                <div className="community-sidebar-header">
                    <h2 className="community-sidebar-title">
                        <MessageSquare className="w-4 h-4" /> Chat Rooms
                    </h2>
                </div>
                <nav className="community-rooms">
                    {rooms.map(room => (
                        <button
                            key={room.id}
                            className={`community-room-btn ${activeRoom?.id === room.id ? 'community-room-btn-active' : ''}`}
                            onClick={() => setActiveRoom(room)}
                        >
                            <span className="community-room-emoji">{room.emoji}</span>
                            <div className="community-room-info">
                                <span className="community-room-name">{room.name}</span>
                                <span className="community-room-desc">{room.description}</span>
                            </div>
                            <ChevronRight className="community-room-arrow" />
                        </button>
                    ))}
                </nav>
                <div className="community-sidebar-footer">
                    <Users className="w-3.5 h-3.5" />
                    <span>Live readers are online now</span>
                </div>
            </aside>

            {/* Chat area */}
            <main className="community-main">
                {activeRoom ? (
                    <ChatRoom
                        slug={activeRoom.slug}
                        name={activeRoom.name}
                        emoji={activeRoom.emoji}
                        description={activeRoom.description}
                    />
                ) : (
                    <div className="community-empty">
                        <MessageSquare className="community-empty-icon" />
                        <p>Select a room to start chatting</p>
                    </div>
                )}
            </main>
        </div>
    );
}
