import { type Book } from './api';

export const STARTER_BOOKS: Record<string, Book[]> = {
    'Fiction': [
        {
            id: 'z-u_EAAAQBAJ',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            description: 'A classic of American literature, exploring themes of wealth, love, and the American Dream.',
            coverUrl: 'http://books.google.com/books/content?id=z-u_EAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            rating: 4.5,
            publishedDate: '1925',
            pages: 180,
            genre: ['Fiction', 'Classic']
        },
        {
            id: '3-mBEAAAQBAJ',
            title: 'Normal People',
            author: 'Sally Rooney',
            description: 'A story of mutual fascination, friendship and love.',
            coverUrl: 'http://books.google.com/books/content?id=3-mBEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            rating: 4.2,
            publishedDate: '2018',
            pages: 288,
            genre: ['Fiction', 'Contemporary']
        },
        {
            id: 'pD6REAAAQBAJ',
            title: 'The Midnight Library',
            author: 'Matt Haig',
            description: 'Between life and death there is a library, and within that library, the shelves go on forever.',
            coverUrl: 'http://books.google.com/books/content?id=pD6REAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            rating: 4.0,
            publishedDate: '2020',
            pages: 304,
            genre: ['Fiction', 'Fantasy']
        }
    ],
    'Mystery & Thriller': [
        {
            id: 'P9cHEAAAQBAJ',
            title: 'The Silent Patient',
            author: 'Alex Michaelides',
            description: 'Alicia Berenson’s life is seemingly perfect. A famous painter married to an in-demand fashion photographer...',
            coverUrl: 'http://books.google.com/books/content?id=P9cHEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            rating: 4.7,
            publishedDate: '2019',
            pages: 336,
            genre: ['Thriller', 'Mystery']
        },
        {
            id: 'yv_2DwAAQBAJ',
            title: 'Gone Girl',
            author: 'Gillian Flynn',
            description: 'Marriage can be a real killer.',
            coverUrl: 'http://books.google.com/books/content?id=yv_2DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            rating: 4.5,
            publishedDate: '2012',
            pages: 415,
            genre: ['Mystery', 'Thriller']
        }
    ],
    'Science Fiction': [
        {
            id: 'S0_XAwAAQBAJ',
            title: 'Project Hail Mary',
            author: 'Andy Weir',
            description: 'Ryland Grace is the sole survivor on a desperate, last-chance mission.',
            coverUrl: 'http://books.google.com/books/content?id=S0_XAwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            rating: 4.9,
            publishedDate: '2021',
            pages: 496,
            genre: ['Sci-Fi', 'Adventure']
        },
        {
            id: 'mO47EAAAQBAJ',
            title: 'Dune',
            author: 'Frank Herbert',
            description: 'Set in the far future amidst a sprawling feudal interstellar empire.',
            coverUrl: 'http://books.google.com/books/content?id=mO47EAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            rating: 4.8,
            publishedDate: '1965',
            pages: 617,
            genre: ['Sci-Fi', 'Classic']
        }
    ],
    'Fantasy': [
        {
            id: 'yH_YDAAAQBAJ',
            title: 'A Court of Thorns and Roses',
            author: 'Sarah J. Maas',
            description: 'Feyre\'s survival rests upon her ability to hunt and kill in a cold, bleak forest.',
            coverUrl: 'http://books.google.com/books/content?id=yH_YDAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            rating: 4.6,
            publishedDate: '2015',
            pages: 432,
            genre: ['Fantasy', 'Romance']
        },
        {
            id: 'v_u_EAAAQBAJ',
            title: 'The Hobbit',
            author: 'J.R.R. Tolkien',
            description: 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life.',
            coverUrl: 'http://books.google.com/books/content?id=v_u_EAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            rating: 4.9,
            publishedDate: '1937',
            pages: 310,
            genre: ['Fantasy', 'Classic']
        }
    ]
};
