import { useState, useCallback, memo } from 'react';
import { getDirectCoverUrl, getProxiedCoverUrl, getGeneratedCoverUrl } from '@/lib/bookCover';

interface BookCoverImageProps {
    bookId?: string | null;
    coverUrl?: string | null;
    title?: string | null;
    author?: string | null;
    alt?: string;
    className?: string;
    priority?: boolean;
}

export const BookCoverImage = memo(function BookCoverImage({
    bookId,
    coverUrl,
    title,
    author,
    alt,
    className = 'book-card-cover',
    priority = false,
}: BookCoverImageProps) {
    // 0 = Direct Edge CDN, 1 = Backend Reverse Proxy, 2 = Generated Dark Academia SVG
    const [stage, setStage] = useState<0 | 1 | 2>(0);
    const [isLoaded, setIsLoaded] = useState(false);

    // Compute current source based on resolution stage
    const currentSrc = (() => {
        if (stage === 0) return getDirectCoverUrl(bookId, coverUrl, title, author);
        if (stage === 1) return getProxiedCoverUrl(bookId, coverUrl, title, author);
        return getGeneratedCoverUrl(title, author);
    })();

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);

    const handleError = useCallback(() => {
        setIsLoaded(false);
        setStage(prev => {
            if (prev === 0) return 1;
            if (prev === 1) return 2;
            return 2;
        });
    }, []);

    return (
        <div className="book-cover-wrap-progressive">
            {/* Shimmer Placeholder (visible while loading) */}
            {!isLoaded && <div className="book-cover-shimmer" />}

            <img
                src={currentSrc}
                alt={alt || title || 'Book Cover'}
                className={`${className} ${isLoaded ? 'book-cover-loaded' : 'book-cover-loading'}`}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
});
