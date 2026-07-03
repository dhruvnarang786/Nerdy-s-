export interface GenreConfigItem {
    genre: string;
    emoji: string;
    query: string;
}

export const GENRE_CONFIG: GenreConfigItem[] = [
    { genre: 'Fiction', emoji: '✨', query: 'fiction bestsellers' },
    { genre: 'Mystery & Thriller', emoji: '🕵️', query: 'mystery thriller' },
    { genre: 'Science Fiction', emoji: '🚀', query: 'science fiction' },
    { genre: 'Fantasy', emoji: '🧙', query: 'fantasy popular' },
    { genre: 'Romance', emoji: '💕', query: 'romance novels' },
    { genre: 'History', emoji: '📜', query: 'history nonfiction' },
    { genre: 'Biography', emoji: '👤', query: 'biography memoir' },
    { genre: 'Self-Help', emoji: '💡', query: 'self help personal development' },
];
