const LIBRARIAN_PROMPT = `You are Nerdy, a friendly and knowledgeable AI book librarian. You help readers find their next great book, discuss literature, and explore reading. You're warm, enthusiastic, and deeply knowledgeable about books across all genres. Keep responses conversational and focused on books and reading. When recommending books, explain why each book might appeal to the reader based on what they've told you.`;
const BOOK_GEN_PROMPT = `You are a creative writing assistant that helps users develop book ideas. Given a book concept, generate a compelling book description, a suggested table of contents (5-8 chapters), and a brief sample chapter opening. Be creative but structured. Output in clear markdown format.`;
const QUIZ_PROMPT = `You are a quiz generator for book lovers. Given a book title, generate a multiple-choice quiz that tests knowledge of that book's plot, characters, themes, and settings. Each question must have 4 options with exactly one correct answer. Output as a JSON array of objects with fields: question (string), options (string array of 4), correctIndex (0-3).`;
const SUMMARY_PROMPT = `You are a book summarizer. Given a book title, provide a concise, well-structured summary covering: the premise, main characters, central conflict, themes, and why it matters. Keep summaries spoiler-free unless explicitly requested. Output in clear markdown sections.`;
const FLASHCARD_PROMPT = `You are a flashcard creator for readers and students. Given a book title, generate a set of flashcards covering key characters, plot points, themes, symbols, and important quotes. Each card has a front (question/prompt) and back (answer/explanation). Output as a JSON array of objects with fields: front (string), back (string).`;
const RECOMMEND_PROMPT = `You are a book recommendation expert. Given a reader's current mood and available time, recommend specific books they would enjoy. For each recommendation, explain why it matches their mood. Consider genre, tone, pacing, and reading level. Return a JSON array of objects with fields: title (string), author (string), reason (string), genre (string).`;
export class AiChatService {
    aiGateway;
    constructor(aiGateway) {
        this.aiGateway = aiGateway;
    }
    async chat(messages, meta) {
        const fullMessages = this.needsSystemPrompt(messages)
            ? [{ role: 'system', content: LIBRARIAN_PROMPT }, ...messages]
            : messages;
        return this.aiGateway.chat('chat', { messages: fullMessages }, meta);
    }
    async *chatStream(messages, meta) {
        const fullMessages = this.needsSystemPrompt(messages)
            ? [{ role: 'system', content: LIBRARIAN_PROMPT }, ...messages]
            : messages;
        yield* this.aiGateway.chatStream('chat', { messages: fullMessages }, meta);
    }
    async recommend(mood, time, meta) {
        const timeContext = time ? ` I have about ${time} to read.` : '';
        return this.aiGateway.chat('recommend', {
            messages: [
                { role: 'system', content: RECOMMEND_PROMPT },
                { role: 'user', content: `My current mood: ${mood}.${timeContext} What books should I read?` },
            ],
            temperature: 0.3,
            maxTokens: 1000,
        }, meta);
    }
    async generateBook(prompt, style, meta) {
        const styleContext = style ? ` The preferred style/genre is: ${style}.` : '';
        return this.aiGateway.chat('book-gen', {
            messages: [
                { role: 'system', content: BOOK_GEN_PROMPT },
                { role: 'user', content: `Book idea: ${prompt}.${styleContext} Please generate a description, table of contents, and sample chapter.` },
            ],
            temperature: 0.8,
            maxTokens: 2048,
        }, meta);
    }
    async *generateBookStream(prompt, style, meta) {
        const styleContext = style ? ` The preferred style/genre is: ${style}.` : '';
        yield* this.aiGateway.chatStream('book-gen', {
            messages: [
                { role: 'system', content: BOOK_GEN_PROMPT },
                { role: 'user', content: `Book idea: ${prompt}.${styleContext} Please generate a description, table of contents, and sample chapter.` },
            ],
            temperature: 0.8,
            maxTokens: 2048,
        }, meta);
    }
    async generateQuiz(bookTitle, count, meta) {
        return this.aiGateway.chat('quiz', {
            messages: [
                { role: 'system', content: QUIZ_PROMPT },
                { role: 'user', content: `Generate a ${count}-question quiz about the book "${bookTitle}". Return only valid JSON.` },
            ],
            temperature: 0.2,
            maxTokens: 2048,
        }, meta);
    }
    async *generateQuizStream(bookTitle, count, meta) {
        yield* this.aiGateway.chatStream('quiz', {
            messages: [
                { role: 'system', content: QUIZ_PROMPT },
                { role: 'user', content: `Generate a ${count}-question quiz about the book "${bookTitle}". Return only valid JSON.` },
            ],
            temperature: 0.2,
            maxTokens: 2048,
        }, meta);
    }
    async summarize(bookTitle, spoilers, meta) {
        const spoilerInstruction = spoilers
            ? 'Spoilers are allowed — include key plot details and ending information.'
            : 'Keep it spoiler-free — no major plot reveals or ending details.';
        return this.aiGateway.chat('summary', {
            messages: [
                { role: 'system', content: SUMMARY_PROMPT },
                { role: 'user', content: `Summarize the book "${bookTitle}". ${spoilerInstruction}` },
            ],
            temperature: 0.3,
            maxTokens: 1024,
        }, meta);
    }
    async *summarizeStream(bookTitle, spoilers, meta) {
        const spoilerInstruction = spoilers
            ? 'Spoilers are allowed — include key plot details and ending information.'
            : 'Keep it spoiler-free — no major plot reveals or ending details.';
        yield* this.aiGateway.chatStream('summary', {
            messages: [
                { role: 'system', content: SUMMARY_PROMPT },
                { role: 'user', content: `Summarize the book "${bookTitle}". ${spoilerInstruction}` },
            ],
            temperature: 0.3,
            maxTokens: 1024,
        }, meta);
    }
    async generateFlashcards(bookTitle, count, meta) {
        return this.aiGateway.chat('flashcard', {
            messages: [
                { role: 'system', content: FLASHCARD_PROMPT },
                { role: 'user', content: `Generate ${count} flashcards for the book "${bookTitle}". Return only valid JSON.` },
            ],
            temperature: 0.3,
            maxTokens: 2048,
        }, meta);
    }
    async *generateFlashcardsStream(bookTitle, count, meta) {
        yield* this.aiGateway.chatStream('flashcard', {
            messages: [
                { role: 'system', content: FLASHCARD_PROMPT },
                { role: 'user', content: `Generate ${count} flashcards for the book "${bookTitle}". Return only valid JSON.` },
            ],
            temperature: 0.3,
            maxTokens: 2048,
        }, meta);
    }
    needsSystemPrompt(messages) {
        return !messages.some(m => m.role === 'system');
    }
}
//# sourceMappingURL=AiChatService.js.map