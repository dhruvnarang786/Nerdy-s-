import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, setToken, clearToken, wakeUpServer } from '@/lib/apiClient';

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    loginWithGoogle: (credential: string) => Promise<boolean>;
    register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Wake up the Render server as early as possible (fire-and-forget)
    useEffect(() => {
        wakeUpServer();
    }, []);

    // Restore session on mount
    useEffect(() => {
        const token = localStorage.getItem('nerdys_token');
        if (!token) { setLoading(false); return; }

        api.get<{ user: User }>('/api/auth/me')
            .then(({ user }) => setUser(user))
            .catch(() => clearToken())
            .finally(() => setLoading(false));
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        const { user, token } = await api.post<{ user: User; token: string }>('/api/auth/login', { email, password });
        setToken(token);
        setUser(user);
        return true;
    };

    const loginWithGoogle = async (credential: string): Promise<boolean> => {
        try {
            const { user, token } = await api.post<{ user: User; token: string }>('/api/auth/google', { credential });
            setToken(token);
            setUser(user);
            return true;
        } catch {
            return false;
        }
    };

    const register = async (username: string, email: string, password: string) => {
        try {
            const { user, token } = await api.post<{ user: User; token: string }>('/api/auth/register', { username, email, password });
            setToken(token);
            setUser(user);
            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            return { success: false, error: message };
        }
    };

    const logout = () => {
        clearToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            loginWithGoogle,
            register,
            logout,
            isAuthenticated: !!user,
            loading,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
