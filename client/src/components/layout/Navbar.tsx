
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Menu, X, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import '@/styles/layout.css';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Trending', href: '/trending' },
        { name: 'Favorites', href: '/favorites' },
        { name: 'Community', href: '/community' },
        { name: 'My Journal', href: '/journal' },
        { name: 'My DNA', href: '/dna' },
    ];

    return (
        <nav className="navbar animate-fade-in-up">
            <div className="navbar-container">
                <div className="navbar-content">
                    <div className="flex items-center">
                        <Link to="/" className="navbar-brand">
                            <BookOpen className="navbar-logo" />
                            <span className="navbar-title">Nerdy's</span>
                        </Link>
                    </div>

                    <div className="navbar-links">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`nav-link hover-underline-animation delay-${(index + 1) * 100}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="navbar-search">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search books..."
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    </div>

                    {/* Auth Controls */}
                    <div className="navbar-auth">
                        {isAuthenticated ? (
                            <div className="auth-user-info">
                                <div className="auth-avatar">
                                    <User className="auth-avatar-icon" />
                                </div>
                                <span className="auth-username">{user?.username}</span>
                                <button onClick={handleLogout} className="auth-btn auth-btn-logout" title="Logout">
                                    <LogOut className="auth-btn-icon" />
                                </button>
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="auth-btn auth-btn-login">
                                    <LogIn className="auth-btn-icon" />
                                    <span>Login</span>
                                </Link>
                                <Link to="/register" className="auth-btn auth-btn-register">
                                    <UserPlus className="auth-btn-icon" />
                                    <span>Register</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="mobile-menu-btn"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="mobile-menu">
                    {/* Mobile Search Bar */}
                    <div className="mobile-search-wrap">
                        <form onSubmit={handleSearch} className="mobile-search-form">
                            <Search className="mobile-search-icon" />
                            <input
                                type="text"
                                placeholder="Search books..."
                                className="mobile-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="mobile-search-btn">Search</button>
                        </form>
                    </div>
                    <div className="mobile-menu-links">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={() => setIsOpen(false)}
                                className="mobile-nav-link"
                            >
                                {link.name}
                            </Link>
                        ))}
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="mobile-nav-link" style={{ textAlign: 'left', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', width: '100%', padding: 0 }}>
                                Logout ({user?.username})
                            </button>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="mobile-nav-link">Login</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="mobile-nav-link">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
