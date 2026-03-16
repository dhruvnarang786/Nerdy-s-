
import { useState } from 'react';
import { Star, Calendar, MessageSquare, X, CheckCircle } from 'lucide-react';
import { saveBookLog, type BookLog } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';
import '@/styles/components.css';

interface LogBookProps {
    bookId: string;
    bookTitle: string;
    onClose: () => void;
    onSave: () => void;
}

export function LogBook({ bookId, bookTitle, onClose, onSave }: LogBookProps) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [dateRead, setDateRead] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [hasSpoilers, setHasSpoilers] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [saved, setSaved] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newLog: BookLog = {
            bookId,
            bookTitle,
            rating,
            dateRead,
            notes,
            hasSpoilers,
            createdAt: new Date().toISOString(),
            username: user?.username || 'Anonymous',
        };

        const success = await saveBookLog(newLog);
        if (success) {
            setSaved(true);
            onSave();
            setTimeout(() => {
                onClose();
            }, 1200);
        }
    };

    return (
        <div className="logbook-backdrop">
            <div className="logbook-box">
                {saved ? (
                    <div className="logbook-success">
                        <CheckCircle className="logbook-success-icon" />
                        <h3 className="logbook-success-title">Logged!</h3>
                        <p className="logbook-success-sub">Your entry has been saved.</p>
                    </div>
                ) : (
                    <>
                        <div className="logbook-header">
                            <div>
                                <p className="logbook-pre">Logging</p>
                                <h2 className="logbook-title">"{bookTitle}"</h2>
                            </div>
                            <button onClick={onClose} className="logbook-close" aria-label="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="logbook-form">
                            {/* Rating */}
                            <div className="logbook-field">
                                <label className="logbook-label">
                                    <Star className="logbook-label-icon" />
                                    Your Rating
                                </label>
                                <div className="logbook-stars">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="logbook-star-btn"
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            onClick={() => setRating(star)}
                                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                        >
                                            <Star
                                                className={`logbook-star ${star <= (hoverRating || rating) ? 'logbook-star-filled' : ''}`}
                                            />
                                        </button>
                                    ))}
                                    {rating > 0 && (
                                        <span className="logbook-rating-label">{rating}/5</span>
                                    )}
                                </div>
                            </div>

                            {/* Date Read */}
                            <div className="logbook-field">
                                <label className="logbook-label">
                                    <Calendar className="logbook-label-icon" />
                                    Date Read
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={dateRead}
                                    onChange={(e) => setDateRead(e.target.value)}
                                    className="logbook-input"
                                />
                            </div>

                            {/* Notes */}
                            <div className="logbook-field">
                                <label className="logbook-label">
                                    <MessageSquare className="logbook-label-icon" />
                                    Your Thoughts <span className="logbook-optional">(optional)</span>
                                </label>
                                <textarea
                                    placeholder="How did this book make you feel? What stood out?"
                                    rows={4}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="logbook-textarea"
                                />

                                <label className="spoiler-toggle-wrapper">
                                    <input
                                        type="checkbox"
                                        className="spoiler-checkbox"
                                        checked={hasSpoilers}
                                        onChange={(e) => setHasSpoilers(e.target.checked)}
                                    />
                                    <span className="text-sm font-medium text-slate-300">This review contains spoilers</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={rating === 0}
                                className="logbook-submit"
                            >
                                {rating === 0 ? 'Select a rating to continue' : 'Save to My Journal'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
