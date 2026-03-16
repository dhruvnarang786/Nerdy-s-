
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Wifi, WifiOff, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useChatRoom } from '@/lib/socket';
import { useAuth } from '@/lib/AuthContext';
import '@/styles/components.css';

interface ChatRoomProps {
    slug: string;
    name: string;
    emoji: string;
    description?: string;
    compact?: boolean; // for embedding in BookDetails
}

const AVATAR_COLORS = [
    'linear-gradient(135deg, #7c3aed, #a855f7)',
    'linear-gradient(135deg, #0891b2, #06b6d4)',
    'linear-gradient(135deg, #e11d48, #f43f5e)',
    'linear-gradient(135deg, #d97706, #f59e0b)',
    'linear-gradient(135deg, #059669, #10b981)',
];

function avatarColor(username: string): string {
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatRoom({ slug, name, emoji, description, compact = false }: ChatRoomProps) {
    const [input, setInput] = useState('');
    const { user } = useAuth();
    const { messages, onlineCount, connected, typingUsers, sendMessage, startTyping, stopTyping } = useChatRoom(slug);
    const bottomRef = useRef<HTMLDivElement>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = useCallback(() => {
        if (!input.trim()) return;
        sendMessage(input.trim());
        setInput('');
        stopTyping();
    }, [input, sendMessage, stopTyping]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
        startTyping();
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(stopTyping, 1500);
    };

    return (
        <div className={`chatroom ${compact ? 'chatroom-compact' : ''}`}>
            {/* Header */}
            <div className="chatroom-header">
                <div className="chatroom-header-info">
                    <span className="chatroom-emoji">{emoji}</span>
                    <div>
                        <h3 className="chatroom-name">{name}</h3>
                        {description && !compact && <p className="chatroom-desc">{description}</p>}
                    </div>
                </div>
                <div className="chatroom-meta">
                    <span className="chatroom-online">
                        <Users className="w-3 h-3" /> {onlineCount} online
                    </span>
                    <span className={`chatroom-status ${connected ? 'chatroom-status-connected' : 'chatroom-status-disconnected'}`}>
                        {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {connected ? 'Live' : 'Connecting...'}
                    </span>
                </div>
            </div>

            {/* Messages */}
            <div className="chatroom-messages">
                {messages.length === 0 && (
                    <div className="chatroom-empty">
                        <span style={{ fontSize: '2rem' }}>{emoji}</span>
                        <p>No messages yet. Be the first to say something!</p>
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isOwn = msg.username === user?.username;
                    const prevMsg = messages[i - 1];
                    const showAvatar = !prevMsg || prevMsg.username !== msg.username;

                    return (
                        <div key={msg.id || i} className={`chatmsg ${isOwn ? 'chatmsg-own' : ''}`}>
                            {showAvatar && !isOwn && (
                                <Link to={`/user/${msg.username}`} className="chatmsg-avatar" style={{ background: avatarColor(msg.username) }} title={msg.username}>
                                    {msg.username[0].toUpperCase()}
                                </Link>
                            )}
                            {!showAvatar && !isOwn && <div className="chatmsg-avatar-placeholder" />}
                            <div className="chatmsg-bubble-wrap">
                                {showAvatar && (
                                    <div className="chatmsg-header">
                                        <Link to={`/user/${msg.username}`} className="chatmsg-username">{msg.username}</Link>
                                        <span className="chatmsg-time">{formatTime(msg.createdAt)}</span>
                                    </div>
                                )}
                                <div className={`chatmsg-bubble ${isOwn ? 'chatmsg-bubble-own' : ''}`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {typingUsers.length > 0 && (
                    <div className="chatroom-typing">
                        <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…</span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="chatroom-input-area">
                <input
                    type="text"
                    className="chatroom-input"
                    placeholder={`Message #${name.toLowerCase()}…`}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    maxLength={1000}
                    disabled={!connected}
                />
                <button
                    className="chatroom-send-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || !connected}
                    aria-label="Send message"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
