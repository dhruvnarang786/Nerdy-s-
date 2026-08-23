export interface GenreConfigItem {
    genre: string;
    emoji: string;
    query: string;
}

export const GENRE_CONFIG: GenreConfigItem[] = [
    { genre: 'Fiction', emoji: '✨', query: 'subject:fiction classics' },
    { genre: 'Mystery & Thriller', emoji: '🕵️', query: 'subject:mystery thriller' },
    { genre: 'Science Fiction', emoji: '🚀', query: 'subject:science_fiction space' },
    { genre: 'Fantasy', emoji: '🧙', query: 'subject:fantasy magic' },
    { genre: 'Romance', emoji: '💕', query: 'subject:romance novel' },
    { genre: 'History', emoji: '📜', query: 'subject:history narrative' },
    { genre: 'Biography', emoji: '👤', query: 'subject:biography memoir' },
    { genre: 'Self-Help', emoji: '💡', query: 'subject:self-help psychology' },
];


