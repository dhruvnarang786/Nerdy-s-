import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { type Book } from '@/lib/apiClient';
import { BookCoverImage } from '@/components/ui/BookCoverImage';
import '@/styles/components.css';

interface BookCardProps {
    book: Book;
    priority?: boolean;
}

export const BookCard = memo(function BookCard({ book, priority = false }: BookCardProps) {
    return (
        <Link to={`/book/${book.id}`} className="book-card group">
            <div className="book-cover-container">
                <BookCoverImage
                    bookId={book.id}
                    coverUrl={book.coverUrl}
                    title={book.title}
                    author={book.author}
                    alt={book.title}
                    priority={priority}
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

