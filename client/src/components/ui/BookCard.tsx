
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { type Book } from '@/lib/mockData';
import '@/styles/components.css';

interface BookCardProps {
    book: Book;
}

export function BookCard({ book }: BookCardProps) {
    return (
        <Link to={`/book/${book.id}`} className="book-card group">
            <div className="book-cover-container">
                <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="book-card-cover"
                    loading="lazy"
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
}
