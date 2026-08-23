import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BookService } from '../services/BookService.js';
import { toApiFormat } from '../utils/normalizeBook.js';

const router = express.Router();
const bookService = new BookService();

// Initialize Google Gemini if API key is provided
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || process.env.GOOGLE_API_KEY;
let genAI = null;
if (GEMINI_KEY && !GEMINI_KEY.startsWith('your_')) {
    try {
        genAI = new GoogleGenerativeAI(GEMINI_KEY);
    } catch (e) {
        console.warn('[AI Librarian] Failed to initialize GoogleGenerativeAI:', e.message);
    }
}

const LIBRARIAN_SYSTEM_INSTRUCTION = `You are the Head AI Librarian of Nerdy's — an atmospheric, deeply knowledgeable literary sanctuary and social reading platform designed with Dark Academia elegance.

Your persona:
- Eloquent, intellectual, and welcoming to all readers from beginners to voracious bibliophiles.
- Passionate about literature across all genres (Classic, Sci-Fi, Fantasy, Mystery/Thriller, Romance, History, Philosophy, Memoir, Non-Fiction).
- When recommending books, ALWAYS include the full Book Title and Author.
- Format responses cleanly with Markdown (bold titles, bullet points, concise paragraphs, and fitting literary emojis).
- Keep replies engaging, insightful, and conversational (usually 2-4 focused paragraphs or a well-structured list).
`;

// ─── Mood Recommender ─────────────────────────────────────────────────────────
const MOOD_TO_QUERY = {
    'romantic and hopeful': 'romance love story bestseller',
    'sad and melancholic': 'emotional literary fiction grief healing',
    'nostalgic and sentimental': 'nostalgic classic coming of age memoir',
    'anxious and need comfort': 'cozy comforting feel good book',
    'inspired and motivated': 'inspiring motivational success biography',
    'adventurous and bold': 'adventure action thriller bestseller',
    'want to travel the world through books': 'travel adventure world exploration',
    'craving fantasy and magic': 'fantasy magic epic bestseller',
    'sci-fi curious and futuristic': 'science fiction space future technology',
    'mysterious and suspenseful': 'mystery thriller suspense detective',
    'curious and want to learn something new': 'popular science nonfiction discovery',
    'philosophical and want a deep read': 'philosophy existential literary fiction',
    'focused on self improvement': 'self help personal development productivity',
    'interested in history and biography': 'history biography true story',
    'want to understand people better': 'psychology behaviour human nature',
    'cozy and relaxed': 'cozy mystery cottage village gentle fiction',
    'want something funny and lighthearted': 'comedy humor funny fiction',
    'bored and need excitement': 'fast paced thriller action page turner',
    'want a feel good uplifting story': 'uplifting feel good heartwarming fiction',
    'just want a quick fun read': 'short novella fun light quick read',
    'dark and edgy mood': 'dark literary fiction psychological drama',
    'tense and want a thriller': 'psychological thriller suspense bestseller',
    'want a horror story': 'horror supernatural scary ghost',
    'angry and want something fierce and powerful': 'powerful rebellion fierce dystopian',
};

const TIME_TO_PAGES = {
    'an hour or two': 8,
    'a weekend': 10,
    'a week': 12,
    'two weeks': 15,
    'a month': 15,
    'no rush, an epic saga is fine': 15,
};

router.post('/recommend', async (req, res) => {
    const { mood, time } = req.body;
    const query = MOOD_TO_QUERY[mood?.toLowerCase()] || mood || 'bestseller fiction';
    const limit = TIME_TO_PAGES[time?.toLowerCase()] || 8;
    try {
        const result = await bookService.search(query, limit * 2, 0);
        const books = result.books.slice(0, limit).map(toApiFormat);
        res.json(books);
    } catch (error) {
        console.error('AI recommend error:', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// Fallback search-assisted response generator when Gemini key is absent
async function generateLiveCatalogReply(userMessage) {
    const clean = userMessage.trim();
    
    // Extract keywords for real catalog search
    const searchTerms = clean
        .replace(/recommend|suggest|what should i read|books like|books about|tell me about/gi, '')
        .trim();

    try {
        const result = await bookService.search(searchTerms || clean, 4, 0);
        if (result.books.length > 0) {
            const recommendations = result.books
                .slice(0, 3)
                .map(b => `📖 **${b.title}** by ${b.author || 'Unknown'}\n${b.description ? b.description.slice(0, 140) + '...' : 'A celebrated title in our collection.'}`)
                .join('\n\n');

            return `Greetings, fellow reader! 📚 Here are curated recommendations matching your query from our catalog:\n\n${recommendations}\n\nWould you like me to explore any of these titles further, or search for a different mood or genre?`;
        }
    } catch {
        /* fallback */
    }

    return `Welcome to Nerdy's Literary Codex! 📚 I am your AI reading companion. Ask me for recommendations across any genre (such as *"Recommend a gripping sci-fi novel"* or *"Books like Piranesi"*), character breakdowns, or summaries. What shall we explore today?`;
}

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Try Gemini API first if configured
    if (genAI) {
        try {
            // Use gemini-1.5-flash or gemini-2.0-flash with system instruction
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: LIBRARIAN_SYSTEM_INSTRUCTION,
            });

            // Format past conversation history if provided
            const contents = [];
            if (Array.isArray(history)) {
                for (const h of history.slice(-6)) {
                    if (h.role && h.content) {
                        contents.push({
                            role: h.role === 'model' ? 'model' : 'user',
                            parts: [{ text: h.content }],
                        });
                    }
                }
            }
            contents.push({ role: 'user', parts: [{ text: message.trim() }] });

            const response = await model.generateContent({ contents });
            const replyText = response.response.text();
            if (replyText && replyText.trim()) {
                return res.json({ reply: replyText.trim() });
            }
        } catch (err) {
            console.warn('[Gemini API Error, falling back to live catalog]:', err.message);
        }
    }

    // Fallback to live catalog synthesis
    const liveReply = await generateLiveCatalogReply(message);
    res.json({ reply: liveReply });
});

export default router;
