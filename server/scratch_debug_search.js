import 'dotenv/config';
import { BookService } from './services/BookService.js';

async function test() {
    const service = new BookService();
    try {
        console.log("Searching for 'subject:fiction bestselling'...");
        const result = await service.search('subject:fiction bestselling');
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (err) {
        console.error("Error during search:", err);
    }
}
test();
