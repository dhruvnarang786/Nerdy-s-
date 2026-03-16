
export interface Book {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
    rating: number;
    description: string;
    genre: string[];
    pages: number;
    publishedDate: string;
    reviews?: Review[];
}

export interface Review {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
}

export const mockBooks: Book[] = [
    {
        id: '1',
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1597695864i/54493401.jpg',
        rating: 4.8,
        description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish. Except that right now, he doesn\'t know that. He can\'t even remember his own name, let alone the nature of his assignment or how to complete it.',
        genre: ['Science Fiction', 'Thriller'],
        pages: 496,
        publishedDate: '2021-05-04',
        reviews: [
            { id: 'r1', userId: 'u1', userName: 'Alice', rating: 5, comment: 'Absolutely mind-blowing!', date: '2023-01-15' },
            { id: 'r2', userId: 'u2', userName: 'Bob', rating: 4, comment: 'Great science, fun read.', date: '2023-02-20' }
        ]
    },
    {
        id: '2',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1602190253i/52578297.jpg',
        rating: 4.1,
        description: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices . . .',
        genre: ['Fiction', 'Fantasy', 'Contemporary'],
        pages: 304,
        publishedDate: '2020-08-13',
        reviews: [
            { id: 'r3', userId: 'u3', userName: 'Charlie', rating: 3, comment: 'Interesting concept but felt repetitive.', date: '2023-03-10' }
        ]
    },
    {
        id: '3',
        title: 'Tomorrow, and Tomorrow, and Tomorrow',
        author: 'Gabrielle Zevin',
        coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1636975674i/58784475.jpg',
        rating: 4.3,
        description: 'In this exhilarating novel, two friends—often in love, but never lovers—come together as creative partners in the world of video game design, where success brings them fame, joy, tragedy, duplicity, and, ultimately, a kind of immortality.',
        genre: ['Fiction', 'Romance', 'Contemporary'],
        pages: 401,
        publishedDate: '2022-07-05',
    },
    {
        id: '4',
        title: 'Dune',
        author: 'Frank Herbert',
        coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1555447414i/44767458.jpg',
        rating: 4.7,
        description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange, a drug capable of extending life and enhancing consciousness.',
        genre: ['Science Fiction', 'Classic'],
        pages: 688,
        publishedDate: '1965-08-01',
    },
    {
        id: '5',
        title: 'Atomic Habits',
        author: 'James Clear',
        coverUrl: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385i/40121378.jpg',
        rating: 4.6,
        description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
        genre: ['Non-fiction', 'Self Help'],
        pages: 320,
        publishedDate: '2018-10-16',
    }
];
