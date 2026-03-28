import { type Book } from './api';

const getGoogleCover = (id: string) => `https://books.google.com/books/content?id=${id}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;

export const STARTER_BOOKS: Record<string, Book[]> = {
    'Fiction': [
        { id: 'hlb_sM1AN0gC', title: 'The Hunger Games', author: 'Suzanne Collins', description: 'In the ruins of a future North America, a young girl is forced to compete in a televised fight to the death.', coverUrl: getGoogleCover('hlb_sM1AN0gC'), rating: 4.3, publishedDate: '2008', pages: 374, genre: ['Fiction', 'YA'] },
        { id: 'icKmd-tlvPMC', title: 'Journey to the Center of the Earth', author: 'Jules Verne', description: 'An adventurous geological expedition to the center of the Earth.', coverUrl: getGoogleCover('icKmd-tlvPMC'), rating: 4.5, publishedDate: '1864', pages: 240, genre: ['Fiction', 'Classic'] },
        { id: 'KVGd-NabpW0C', title: 'The Plague', author: 'Albert Camus', description: 'A gripping tale of human resilience in the face of an epidemic.', coverUrl: getGoogleCover('KVGd-NabpW0C'), rating: 4.2, publishedDate: '1947', pages: 308, genre: ['Fiction', 'Philosophy'] },
        { id: '3oSqDwAAQBAJ', title: 'Oliver Twist', author: 'Charles Dickens', description: 'The story of an orphan boy who starts his life in a workhouse.', coverUrl: getGoogleCover('3oSqDwAAQBAJ'), rating: 4.0, publishedDate: '1837', pages: 608, genre: ['Fiction', 'Classic'] },
        { id: 'ng9iEAAAQBAJ', title: 'The Mayor of Casterbridge', author: 'Thomas Hardy', description: 'A man sells his wife and daughter at a country fair.', coverUrl: getGoogleCover('ng9iEAAAQBAJ'), rating: 3.8, publishedDate: '1886', pages: 432, genre: ['Fiction', 'Classic'] },
        { id: 'EvqJCGeqKhsC', title: 'Pride and Prejudice', author: 'Jane Austen', description: 'A classic novel of manners, marriage, and money.', coverUrl: getGoogleCover('EvqJCGeqKhsC'), rating: 4.7, publishedDate: '1813', pages: 432, genre: ['Fiction', 'Classic'] },
        { id: '6vGiDwAAQBAJ', title: 'The Picture of Dorian Gray', author: 'Oscar Wilde', description: 'A man sells his soul for eternal youth.', coverUrl: getGoogleCover('6vGiDwAAQBAJ'), rating: 4.4, publishedDate: '1890', pages: 254, genre: ['Fiction', 'Classic'] }
    ],
    'Mystery & Thriller': [
        { id: 'NGoFudTo7YsC', title: 'Cards on the Table', author: 'Agatha Christie', description: 'Hercule Poirot investigates a murder at a bridge game.', coverUrl: getGoogleCover('NGoFudTo7YsC'), rating: 4.1, publishedDate: '1936', pages: 288, genre: ['Mystery', 'Detective'] },
        { id: 'ZOMOe5CIPu8C', title: 'The Golden Ball', author: 'Agatha Christie', description: 'A collection of short stories by the Queen of Crime.', coverUrl: getGoogleCover('ZOMOe5CIPu8C'), rating: 4.0, publishedDate: '1971', pages: 240, genre: ['Mystery', 'Thriller'] },
        { id: 'A-AS46wG0p8C', title: 'The Da Vinci Code', author: 'Dan Brown', description: 'A murder in the Louvre leads to a religious conspiracy.', coverUrl: getGoogleCover('A-AS46wG0p8C'), rating: 4.5, publishedDate: '2003', pages: 454, genre: ['Thriller', 'Mystery'] },
        { id: 'SCHqme8AluYC', title: 'The Invisible Man', author: 'H.G. Wells', description: 'A scientist discovers the secret of invisibility.', coverUrl: getGoogleCover('SCHqme8AluYC'), rating: 3.9, publishedDate: '1897', pages: 200, genre: ['Mystery', 'Sci-Fi'] },
        { id: '4StOSYpeydcC', title: 'Crime and Punishment', author: 'Fyodor Dostoyevsky', description: 'A psychological thriller about guilt and redemption.', coverUrl: getGoogleCover('4StOSYpeydcC'), rating: 4.8, publishedDate: '1866', pages: 671, genre: ['Mystery', 'Classic'] },
        { id: 'L88qEAAAQBAJ', title: 'The Valley of Fear', author: 'Arthur Conan Doyle', description: 'A Sherlock Holmes mystery involving a secret society.', coverUrl: getGoogleCover('L88qEAAAQBAJ'), rating: 4.2, publishedDate: '1915', pages: 192, genre: ['Mystery', 'Detective'] }
    ],
    'Science Fiction': [
        { id: 'kPmLDQAAQBAJ', title: 'The Martian', author: 'Andy Weir', description: 'An astronaut is stranded on Mars and must survive.', coverUrl: getGoogleCover('kPmLDQAAQBAJ'), rating: 4.7, publishedDate: '2011', pages: 369, genre: ['Sci-Fi', 'Adventure'] },
        { id: '1IEhyG44uMEC', title: '20,000 Leagues Under the Sea', author: 'Jules Verne', description: 'A voyage under the oceans in the Nautilus.', coverUrl: getGoogleCover('1IEhyG44uMEC'), rating: 4.3, publishedDate: '1870', pages: 400, genre: ['Sci-Fi', 'Classic'] },
        { id: 'QMBLHMv-k6oC', title: 'Neuromancer', author: 'William Gibson', description: 'The foundation of the cyberpunk genre.', coverUrl: getGoogleCover('QMBLHMv-k6oC'), rating: 4.0, publishedDate: '1884', pages: 271, genre: ['Sci-Fi', 'Cyberpunk'] },
        { id: 'E5khWQMmrTUC', title: 'Solaris', author: 'Stanisław Lem', description: 'A planet with a sentient ocean.', coverUrl: getGoogleCover('E5khWQMmrTUC'), rating: 4.1, publishedDate: '1961', pages: 204, genre: ['Sci-Fi', 'Philosophy'] },
        { id: 'Qrz5A0KlidcC', title: 'Dirk Gently\'s Holistic Detective Agency', author: 'Douglas Adams', description: 'A "thumping good detective-ghost-horror-who-dunnit-time-travel-romantic-musical-comedy-epic".', coverUrl: getGoogleCover('Qrz5A0KlidcC'), rating: 3.9, publishedDate: '1987', pages: 247, genre: ['Sci-Fi', 'Comedy'] }
    ],
    'Fantasy': [
        { id: 'GZAoAQAAIAAJ', title: 'Harry Potter and the Deathly Hallows', author: 'J.K. Rowling', description: 'The final showdown between Harry and Voldemort.', coverUrl: getGoogleCover('GZAoAQAAIAAJ'), rating: 4.9, publishedDate: '2007', pages: 759, genre: ['Fantasy', 'YA'] },
        { id: 'hRd7dJ-9G1IC', title: 'The Wizard of Oz', author: 'L. Frank Baum', description: 'Dorothy\'s journey to the Emerald City.', coverUrl: getGoogleCover('hRd7dJ-9G1IC'), rating: 4.2, publishedDate: '1900', pages: 140, genre: ['Fantasy', 'Classic'] },
        { id: 'WdM_qxJq8T8C', title: 'Peter Pan', author: 'J.M. Barrie', description: 'The boy who wouldn\'t grow up.', coverUrl: getGoogleCover('WdM_qxJq8T8C'), rating: 4.3, publishedDate: '1911', pages: 240, genre: ['Fantasy', 'Classic'] },
        { id: 'FD72ekYZqIkC', title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', description: 'A young wizard must confront a shadow of his own making.', coverUrl: getGoogleCover('FD72ekYZqIkC'), rating: 4.5, publishedDate: '1968', pages: 205, genre: ['Fantasy', 'Classic'] },
        { id: 't_Zp_S_S', title: 'Mistborn', author: 'Brandon Sanderson', description: 'A world where ash falls from the sky and a crew attempts a heist.', coverUrl: 'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?q=80&w=1000&auto=format&fit=crop', rating: 4.6, publishedDate: '2006', pages: 541, genre: ['Fantasy', 'Epic'] }
    ],
    'Romance': [
        { id: 'SxPUCwAAQBAJ', title: 'Me Before You', author: 'Jojo Moyes', description: 'A love story between a caregiver and her patient.', coverUrl: getGoogleCover('SxPUCwAAQBAJ'), rating: 4.5, publishedDate: '2012', pages: 369, genre: ['Romance', 'Contemporary'] },
        { id: 'RNmODAAAQBAJ', title: 'The Japanese Lover', author: 'Isabel Allende', description: 'A forbidden love story spanning decades.', coverUrl: getGoogleCover('RNmODAAAQBAJ'), rating: 4.1, publishedDate: '2015', pages: 322, genre: ['Romance', 'Historical'] },
        { id: 'jPJzzQEACAAJ', title: 'Layla', author: 'Colleen Hoover', description: 'A paranormal romance about love and tragedy.', coverUrl: getGoogleCover('jPJzzQEACAAJ'), rating: 4.2, publishedDate: '2020', pages: 301, genre: ['Romance', 'Thriller'] },
        { id: 'Y12-OQ5BDjcC', title: 'Northern Lights', author: 'Nora Roberts', description: 'A detective falls in love while investigating a cold case.', coverUrl: getGoogleCover('Y12-OQ5BDjcC'), rating: 4.0, publishedDate: '2004', pages: 437, genre: ['Romance', 'Mystery'] }
    ],
    'History': [
        { id: 'DmB_AgAAQBAJ', title: 'India: The Ancient Past', author: 'Burjor Avari', description: 'A history of the Indian subcontinent from prehistory to 1200 CE.', coverUrl: getGoogleCover('DmB_AgAAQBAJ'), rating: 4.4, publishedDate: '2007', pages: 304, genre: ['History', 'India'] },
        { id: 'ScYJAQAAQBAJ', title: 'The Past Before Us', author: 'Romila Thapar', description: 'Historical traditions of early North India.', coverUrl: getGoogleCover('ScYJAQAAQBAJ'), rating: 4.3, publishedDate: '2013', pages: 784, genre: ['History', 'India'] },
        { id: 'a91-t4uw8A4C', title: 'Alberuni\'s India', author: 'Al-Biruni', description: 'An 11th-century account of Indian culture and science.', coverUrl: getGoogleCover('a91-t4uw8A4C'), rating: 4.5, publishedDate: '1030', pages: 450, genre: ['History', 'Classic'] }
    ],
    'Biography': [
        { id: 'd2WZDgAAQBAJ', title: 'Einstein: His Life and Universe', author: 'Walter Isaacson', description: 'The definitive biography of the great physicist.', coverUrl: getGoogleCover('d2WZDgAAQBAJ'), rating: 4.8, publishedDate: '2007', pages: 715, genre: ['Biography', 'Science'] },
        { id: 'JT6FCgAAQBAJ', title: 'Steve Jobs', author: 'Walter Isaacson', description: 'The story of the man who revolutionized the tech industry.', coverUrl: getGoogleCover('JT6FCgAAQBAJ'), rating: 4.7, publishedDate: '2011', pages: 656, genre: ['Biography', 'Tech'] },
        { id: '13mAEAAAQBAJ', title: 'I\'m Glad My Mom Died', author: 'Jennette McCurdy', description: 'A powerful memoir about childhood stardom and recovery.', coverUrl: getGoogleCover('13mAEAAAQBAJ'), rating: 4.9, publishedDate: '2022', pages: 320, genre: ['Biography', 'Memoir'] }
    ],
    'Self-Help': [
        { id: 'O1MInVXd_aoC', title: 'The Power of Habit', author: 'Charles Duhigg', description: 'Why we do what we do in life and business.', coverUrl: getGoogleCover('O1MInVXd_aoC'), rating: 4.6, publishedDate: '2012', pages: 371, genre: ['Self-Help', 'Psychology'] },
        { id: '6WGhDwAAQBAJ', title: 'Think and Grow Rich', author: 'Napoleon Hill', description: 'The landmark bestseller on success.', coverUrl: getGoogleCover('6WGhDwAAQBAJ'), rating: 4.7, publishedDate: '1937', pages: 384, genre: ['Self-Help', 'Finance'] },
        { id: 'A3qACgAAQBAJ', title: 'Nonviolent Communication', author: 'Marshall Rosenberg', description: 'A language of life.', coverUrl: getGoogleCover('A3qACgAAQBAJ'), rating: 4.8, publishedDate: '1999', pages: 222, genre: ['Self-Help', 'Communication'] }
    ]
};
