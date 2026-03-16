import { io, type Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

let socket: Socket | null = null;

export function getSocket(): Socket {
    if (!socket) {
        const token = localStorage.getItem('nerdys_token');
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        socket = io(API_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            autoConnect: true,
        });
    }
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

export interface ChatMessage {
    id: number;
    content: string;
    username: string;
    createdAt: string;
}

export function useChatRoom(slug: string) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [connected, setConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const s = getSocket();
        socketRef.current = s;

        s.on('connect', () => setConnected(true));
        s.on('disconnect', () => setConnected(false));

        s.on('message_history', (history: ChatMessage[]) => {
            setMessages(history);
        });

        s.on('new_message', (msg: ChatMessage) => {
            setMessages(prev => [...prev, msg]);
        });

        s.on('room_stats', ({ onlineCount }: { onlineCount: number }) => {
            setOnlineCount(onlineCount);
        });

        s.on('user_typing', ({ username }: { username: string }) => {
            setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username]);
        });

        s.on('user_stop_typing', ({ username }: { username: string }) => {
            setTypingUsers(prev => prev.filter(u => u !== username));
        });

        // Join the room
        if (s.connected) {
            s.emit('join_room', slug);
        } else {
            s.once('connect', () => s.emit('join_room', slug));
        }

        return () => {
            s.off('connect');
            s.off('disconnect');
            s.off('message_history');
            s.off('new_message');
            s.off('room_stats');
            s.off('user_typing');
            s.off('user_stop_typing');
        };
    }, [slug]);

    const sendMessage = (content: string) => {
        socketRef.current?.emit('send_message', content);
    };

    const startTyping = () => socketRef.current?.emit('typing_start');
    const stopTyping = () => socketRef.current?.emit('typing_stop');

    return { messages, onlineCount, connected, typingUsers, sendMessage, startTyping, stopTyping };
}
