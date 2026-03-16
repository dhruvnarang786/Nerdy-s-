import { useEffect, useState } from 'react';
import { BookCard } from '@/components/ui/BookCard';
import { getFavorites } from '@/lib/storage';
import { type Book } from '@/lib/api';
import { Heart, BookOpen, Sparkles, TrendingUp, Star, Search } from 'lucide-react';
import '@/styles/pages.css';
import '@/styles/favorites.css';

export function Favorites() {
    const [favorites, setFavorites] = useState<Book[]>([]);

    useEffect(() => {
        getFavorites()
            .then(favs => setFavorites(favs))
            .catch(() => { });
    }, []);

    return (
        <div className="page-container">
            {/* ── Header ── */}
            <div className="page-header" style={{ textAlign: 'center' }}>
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                    <h1 className="page-title m-0">Your Favorites</h1>
                </div>
                <p className="page-description">The books you've fallen in love with.</p>
            </div>

            {favorites.length > 0 ? (
                <div className="books-grid">
                    {favorites.map((book) => (
                        <BookCard key={book.id} book={book} />
                    ))}
                </div>
            ) : (
                /* ── Empty State ── */
                <div className="fav-empty-state">

                    {/* Decorative floating thumbnails */}
                    <div className="fav-deco-grid" aria-hidden="true">
                        {['📖', '📚', '🔖', '📕', '📗', '📘'].map((emoji, i) => (
                            <div key={i} className="fav-deco-card" style={{ animationDelay: `${i * 0.4}s` }}>
                                <span>{emoji}</span>
                            </div>
                        ))}
                    </div>

                    {/* Central glow icon */}
                    <div className="fav-icon-ring">
                        <div className="fav-icon-inner">
                            <Heart className="w-10 h-10" style={{ color: '#f43f5e', fill: '#f43f5e' }} />
                        </div>
                    </div>

                    {/* Headline */}
                    <h2 className="fav-empty-title">No favorites yet</h2>
                    <p className="fav-empty-desc">
                        Start exploring and heart the books you love<br />to build your personal collection.
                    </p>

                    {/* Feature pills */}
                    <div className="fav-pills">
                        <div className="fav-pill">
                            <Star size={14} />
                            Rate books you love
                        </div>
                        <div className="fav-pill">
                            <BookOpen size={14} />
                            Track your reads
                        </div>
                        <div className="fav-pill">
                            <Sparkles size={14} />
                            Get recommendations
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="fav-cta-row">
                        <a href="/trending" className="fav-btn-primary">
                            <TrendingUp size={16} />
                            Explore Trending
                        </a>
                        <a href="/search" className="fav-btn-secondary">
                            <Search size={16} />
                            Search Books
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
