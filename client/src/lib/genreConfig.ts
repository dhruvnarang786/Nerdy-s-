export interface GenreConfigItem {
    genre: string;
    emoji: string;
    query: string;
}

export const GENRE_CONFIG: GenreConfigItem[] = [
    { genre: 'Fiction', emoji: '✨', query: 'subject:fiction bestsellers' },
    { genre: 'Mystery & Thriller', emoji: '🕵️', query: 'subject:mystery thriller suspense' },
    { genre: 'Science Fiction', emoji: '🚀', query: 'subject:science_fiction space cyberpunk' },
    { genre: 'Fantasy', emoji: '🧙', query: 'subject:fantasy magic epic' },
    { genre: 'Romance', emoji: '💕', query: 'subject:romance love contemporary' },
    { genre: 'History', emoji: '📜', query: 'subject:history narrative civilization' },
    { genre: 'Biography', emoji: '👤', query: 'subject:biography memoir autobiography' },
    { genre: 'Self-Help', emoji: '💡', query: 'subject:self-help personal_development psychology' },
];

