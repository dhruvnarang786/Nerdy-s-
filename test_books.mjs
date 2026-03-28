// Using built-in fetch


const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
const q = 'subject:fiction bestselling';

async function test() {
    try {
        const url = `${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(q)}&maxResults=20&orderBy=relevance&langRestrict=en`;
        console.log('Fetching:', url);
        const response = await fetch(url);
        console.log('Status:', response.status);
        if (!response.ok) {
            const body = await response.text();
            console.error('Error body:', body);
            return;
        }
        const data = await response.json();
        console.log('Items found:', data.items ? data.items.length : 0);
        if (data.items) {
            console.log('First item title:', data.items[0].volumeInfo.title);
        }
    } catch (err) {
        console.error('Test error:', err);
    }
}

test();
