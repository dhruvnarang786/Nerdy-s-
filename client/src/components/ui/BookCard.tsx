import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { type Book } from '@/lib/apiClient';
import { getBookCoverUrl } from '@/lib/bookCover';
import '@/styles/components.css';

interface BookCardProps {
    book: Book;
}

export const BookCard = memo(function BookCard({ book }: BookCardProps) {
    const [imgError, setImgError] = useState(false);
    const coverUrl = getBookCoverUrl(book.id, book.coverUrl, book.title, book.author);

    return (
        <Link to={`/book/${book.id}`} className="book-card group">
            <div className="book-cover-container">
                <img
                    src={imgError ? getBookCoverUrl(book.id, null, book.title, book.author) : coverUrl}
                    alt={book.title}
                    className="book-card-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                />
            </div>
            <div className="book-card-info">
                <h3 className="book-card-title">
                    {book.title}
                </h3>
                <p className="book-card-author">{book.author}</p>
                <div className="book-card-rating">
                    <Star className="star-icon" />
                    <span>{book.rating}</span>
                </div>
            </div>
        </Link>
    );
});
