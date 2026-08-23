
import { useEffect, useState } from 'react';
import { api, searchBooks, type Book } from '@/lib/apiClient';
import { GENRE_CONFIG } from '@/lib/genreConfig';
import { GenreScrollRow } from '@/components/ui/GenreScrollRow';
import { Filter, TrendingUp } from 'lucide-react';
import '@/styles/pages.css';

type FilterOption = 'all' | string;
const TRENDING_CACHE_KEY = 'nerdys_trending_genre_cache_v4';

export function Trending() {
    // 1. Initial State from browser's local cache (0ms if previously visited)
    const [genreBooks, setGenreBooks] = useState<Record<string, Book[]>>(() => {
        try {
            const saved = localStorage.getItem(TRENDING_CACHE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && Object.keys(parsed).length > 0) return parsed;
            }
        } catch { /* ignore */ }
        return {};
    });

    const [activeFilter, setActiveFilter] = useState<FilterOption>('all');

    // 2. Dynamic Live Sync from Server Background Ingestion Worker
    useEffect(() => {
        let isMounted = true;

        api.get<{ genres: Record<string, Book[]> }>('/api/books/trending-genres')
            .then(({ genres }) => {
                if (!isMounted || !genres || Object.keys(genres).length === 0) return;
                setGenreBooks(prev => {
                    const merged = { ...prev, ...genres };
                    try {
                        localStorage.setItem(TRENDING_CACHE_KEY, JSON.stringify(merged));
                    } catch { /* ignore */ }
                    return merged;
                });
            })
            .catch(() => {
                // Fallback: search individual genres if batch fails
                GENRE_CONFIG.forEach(async ({ genre, query }) => {
                    try {
                        const { books } = await searchBooks(query, 0, 16);
                        if (isMounted && books && books.length > 0) {
                            setGenreBooks(prev => {
                                const next = { ...prev, [genre]: books };
                                try {
                                    localStorage.setItem(TRENDING_CACHE_KEY, JSON.stringify(next));
                                } catch { /* ignore */ }
                                return next;
                            });
                        }
                    } catch { /* ignore */ }
                });
            });

        return () => { isMounted = false; };
    }, []);


    const visibleGenres = activeFilter === 'all'
        ? GENRE_CONFIG
        : GENRE_CONFIG.filter(g => g.genre === activeFilter);

    return (
        <div className="page-container-inner">
            {/* Header */}
            <div className="trending-header animate-fade-in-up">
                <div>
                    <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
                        <TrendingUp style={{ display: 'inline', width: '1.5rem', height: '1.5rem', marginRight: '0.5rem', verticalAlign: 'middle', color: 'var(--primary)' }} />
                        Trending Books
                    </h1>
                    <p className="page-description">Top picks across every genre, updated daily. Scroll sideways to see more in each genre.</p>
                </div>
            </div>

            {/* Genre Filter Pills */}
            <div className="genre-filter-bar animate-fade-in-up delay-200 glass-panel" style={{ padding: '1rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                <Filter className="genre-filter-icon" />
                <div className="genre-filter-pills">
                    <button
                        className={`genre-pill ${activeFilter === 'all' ? 'genre-pill-active' : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All Genres
                    </button>
                    {GENRE_CONFIG.map(({ genre, emoji }) => (
                        <button
                            key={genre}
                            className={`genre-pill ${activeFilter === genre ? 'genre-pill-active' : ''}`}
                            onClick={() => setActiveFilter(genre)}
                        >
                            {emoji} {genre}
                        </button>
                    ))}
                </div>
            </div>

            {/* Genre Rows */}
            <div className="trending-rows animate-fade-in-up delay-400">
                {visibleGenres.map(({ genre, emoji }) => (
                    <GenreScrollRow
                        key={genre}
                        genre={genre}
                        emoji={emoji}
                        books={genreBooks[genre] || []}
                        loading={!genreBooks[genre] || genreBooks[genre].length === 0}
                    />
                ))}
            </div>
        </div>
    );
}
