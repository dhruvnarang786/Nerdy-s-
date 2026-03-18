import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, BookOpen, AlertCircle, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import '@/styles/pages.css';

const REQUIREMENTS = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One number (0–9)', test: (p: string) => /[0-9]/.test(p) },
    { label: 'One special character (!@#$…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [warmingUp, setWarmingUp] = useState(false);
    const warmupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const allMet = REQUIREMENTS.every(r => r.test(password));
    const emailValid = isValidEmail(email);

    useEffect(() => () => {
        if (warmupTimer.current) clearTimeout(warmupTimer.current);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!emailValid) {
            setError('Please enter a valid email address.');
            setEmailTouched(true);
            return;
        }
        if (!allMet) {
            setError('Please meet all password requirements.');
            return;
        }

        setLoading(true);
        setWarmingUp(false);
        warmupTimer.current = setTimeout(() => setWarmingUp(true), 5000);

        try {
            const result = await register(username, email, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.error || 'Registration failed. Please try again.');
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
                    <h1 className="auth-title">Create your account</h1>
                    <p className="auth-subtitle">Join Nerdy's and track your reading journey</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <AlertCircle className="auth-error-icon" />
                        <span>{error}</span>
                    </div>
                )}

                <GoogleLoginButton onSuccess={() => navigate('/')} />

                <div className="auth-divider">
                    <span className="auth-divider-text">or continue with email</span>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">
                            <User className="form-label-icon" />
                            Username
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="bookworm42"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <Mail className="form-label-icon" />
                            Email
                        </label>
                        <input
                            type="email"
                            className={`form-input ${emailTouched && !emailValid ? 'form-input-error' : ''}`}
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onBlur={() => setEmailTouched(true)}
                            required
                            autoComplete="email"
                        />
                        {emailTouched && !emailValid && email.length > 0 && (
                            <p className="form-field-error">Please enter a valid email address.</p>
                        )}
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
                                placeholder="Create a strong password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                required
                                autoComplete="new-password"
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

                        {(passwordFocused || password.length > 0) && (
                            <ul className="password-requirements">
                                {REQUIREMENTS.map(req => {
                                    const met = req.test(password);
                                    return (
                                        <li key={req.label} className={`password-req ${met ? 'password-req-met' : 'password-req-unmet'}`}>
                                            {met
                                                ? <CheckCircle className="password-req-icon" />
                                                : <XCircle className="password-req-icon" />
                                            }
                                            {req.label}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-full"
                        disabled={loading || !allMet}
                    >
                        {loading ? (
                            <span className="auth-btn-loading">
                                <span className="auth-spinner" />
                                {warmingUp ? 'Server warming up…' : 'Creating account…'}
                            </span>
                        ) : 'Create Account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-switch-link">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
