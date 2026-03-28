import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, BookOpen, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import '@/styles/pages.css';

export function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [warmingUp, setWarmingUp] = useState(false);
    const warmupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clean up timers on unmount
    useEffect(() => () => {
        if (warmupTimer.current) clearTimeout(warmupTimer.current);
    }, []);

    const isColdStartError = (msg: string) =>
        msg.toLowerCase().includes('starting up') ||
        msg.toLowerCase().includes('failed to fetch') ||
        msg.toLowerCase().includes('network');

    const handleRetry = () => {
        if (email && password) {
            handleSubmit(new Event('submit') as unknown as React.FormEvent);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setWarmingUp(false);

        // Show "warming up" hint after 5 seconds
        warmupTimer.current = setTimeout(() => setWarmingUp(true), 5000);

        try {
            const success = await login(email, password);
            if (success) {
                navigate('/');
            } else {
                setError('Invalid email or password. Please check your credentials.');
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Could not connect to server.';
            setError(msg);
        } finally {
            if (warmupTimer.current) clearTimeout(warmupTimer.current);
            setLoading(false);
            setWarmingUp(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <BookOpen className="auth-logo-icon" />
                    </div>
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Sign in to your Nerdy's account</p>
                </div>

                {error && (
                    <div className="auth-error" style={isColdStartError(error) ? { background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.4)', color: '#d4af37' } : undefined}>
                        <AlertCircle className="auth-error-icon" />
                        <div style={{ flex: 1 }}>
                            {isColdStartError(error) ? (
                                <>
                                    <span>Our server is waking up (free hosting) — this usually takes ~30 seconds on first visit.</span>
                                    <button
                                        type="button"
                                        onClick={handleRetry}
                                        disabled={loading}
                                        style={{
                                            display: 'inline-block',
                                            marginLeft: '0.5rem',
                                            padding: '0.2rem 0.7rem',
                                            borderRadius: '0.5rem',
                                            border: '1px solid rgba(212, 175, 55, 0.5)',
                                            background: 'rgba(212, 175, 55, 0.18)',
                                            color: '#d4af37',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {loading ? 'Retrying…' : 'Try Again'}
                                    </button>
                                </>
                            ) : (
                                <span>{error}</span>
                            )}
                        </div>
                    </div>
                )}

                <GoogleLoginButton onSuccess={() => navigate('/')} />

                <div className="auth-divider">
                    <span className="auth-divider-text">or continue with email</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">
                            <Mail className="form-label-icon" />
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <Lock className="form-label-icon" />
                            Password
                        </label>
                        <div className="password-input-wrap">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-eye-btn"
                                onClick={() => setShowPassword(v => !v)}
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="password-eye-icon" /> : <Eye className="password-eye-icon" />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="auth-btn-loading">
                                <span className="auth-spinner" />
                                {warmingUp ? 'Server warming up…' : 'Signing in…'}
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-switch-link">Create one</Link>
                </p>
            </div>
        </div>
    );
}
