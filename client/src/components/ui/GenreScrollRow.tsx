import { memo, useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Book } from '@/lib/apiClient';
import { BookCard } from '@/components/ui/BookCard';
import '@/styles/components.css';

interface GenreScrollRowProps {
    genre: string;
    books: Book[];
    loading?: boolean;
    emoji?: string;
}

const LazyBookCardItem = memo(function LazyBookCardItem({ book, index }: { book: Book; index: number }) {
    const [inView, setInView] = useState(index < 5);
    const itemRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (index < 5) return;
        const el = itemRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setInView(true);
                observer.disconnect();
            }
        }, { rootMargin: '300px' });

        observer.observe(el);
        return () => observer.disconnect();
    }, [index]);

    return (
        <div ref={itemRef} className="genre-row-item fade-in-up" style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}>
            <div className="genre-rank">{index + 1}</div>
            {inView ? (
                <BookCard book={book} priority={index < 3} />
            ) : (
                <div className="book-card">
                    <div className="book-cover-container">
                        <div className="book-cover-wrap-progressive">
                            <div className="book-cover-shimmer" />
                        </div>
                    </div>
                    <div className="book-card-info">
                        <h3 className="book-card-title">{book.title}</h3>
                        <p className="book-card-author">{book.author}</p>
                    </div>
                </div>
            )}
        </div>
    );
});

export const GenreScrollRow = memo(function GenreScrollRow({ genre, books, loading, emoji = '📚' }: GenreScrollRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const amount = scrollRef.current.clientWidth * 0.75;
        scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' });
    };

    return (
        <div className="genre-row">
            <div className="genre-row-header">
                <div className="genre-row-title-wrap">
                    <span className="genre-row-emoji">{emoji}</span>
                    <h2 className="genre-row-title">{genre}</h2>
                    <span className="genre-row-count">Top {books.length}</span>
                </div>
                <div className="genre-row-nav">
                    <button className="genre-row-btn" onClick={() => scroll('left')} aria-label="Scroll left">
                        <ChevronLeft className="genre-row-btn-icon" />
                    </button>
                    <button className="genre-row-btn" onClick={() => scroll('right')} aria-label="Scroll right">
                        <ChevronRight className="genre-row-btn-icon" />
                    </button>
                </div>
            </div>

            {books.length === 0 && loading ? (
                <div className="genre-row-skeleton">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="genre-skeleton-card" />
                    ))}
                </div>
            ) : books.length === 0 ? (
                <div className="genre-no-books">
                    No books found in this category.
                </div>
            ) : (
                <div className="genre-row-scroll" ref={scrollRef}>
                    {books.map((book, index) => (
                        <LazyBookCardItem key={book.id} book={book} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
});

