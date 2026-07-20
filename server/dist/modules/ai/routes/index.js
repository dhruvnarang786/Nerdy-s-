import { Router } from 'express';
import { chatSchema, recommendSchema, bookGenSchema, quizSchema, summarySchema, flashcardSchema } from '../schemas/ai.schema.js';
import { validate } from '../../../shared/middleware/validate.js';
import { asyncHandler } from '../../../shared/utils/async-handler.js';
function streamResponse(res, stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    (async () => {
        try {
            for await (const chunk of stream) {
                res.write(`data: ${JSON.stringify({ token: chunk.token, index: chunk.index, finishReason: chunk.finishReason })}\n\n`);
                if (chunk.finishReason)
                    res.write('data: [DONE]\n\n');
            }
        }
        catch (err) {
            res.write(`event: error\ndata: ${JSON.stringify({ error: err instanceof Error ? err.message : 'Stream error' })}\n\n`);
        }
        res.end();
    })();
}
export function createAiRoutes(chatService) {
    const router = Router();
    router.get('/providers', asyncHandler(async (_req, res) => {
        res.json({
            data: { registered: ['openrouter', 'gemini'], message: 'Provider selection is automatic based on availability and intent' },
            meta: { requestId: _req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    // ── Chat (general book librarian) ─────────────────────────────
    router.post('/chat', validate(chatSchema), asyncHandler(async (req, res) => {
        const { messages, stream } = req.body;
        const userId = req.user?.id;
        if (stream) {
            streamResponse(res, chatService.chatStream(messages, { requestId: req.requestId, userId }));
            return;
        }
        const result = await chatService.chat(messages, { requestId: req.requestId, userId });
        res.json({
            data: { content: result.content, finishReason: result.finishReason, usage: result.usage },
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    // ── Recommend (mood-based) ────────────────────────────────────
    router.post('/recommend', validate(recommendSchema), asyncHandler(async (req, res) => {
        const { mood, time } = req.body;
        const userId = req.user?.id;
        const result = await chatService.recommend(mood, time, { requestId: req.requestId, userId });
        res.json({
            data: { recommendations: result.content, usage: result.usage },
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    // ── Book Generation ───────────────────────────────────────────
    router.post('/book', validate(bookGenSchema), asyncHandler(async (req, res) => {
        const { prompt, style } = req.body;
        const userId = req.user?.id;
        const result = await chatService.generateBook(prompt, style, { requestId: req.requestId, userId });
        res.json({
            data: { content: result.content, usage: result.usage },
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    // ── Quiz ──────────────────────────────────────────────────────
    router.post('/quiz', validate(quizSchema), asyncHandler(async (req, res) => {
        const { bookTitle, count, stream } = req.body;
        const userId = req.user?.id;
        if (stream) {
            streamResponse(res, chatService.generateQuizStream(bookTitle, count, { requestId: req.requestId, userId }));
            return;
        }
        const result = await chatService.generateQuiz(bookTitle, count, { requestId: req.requestId, userId });
        res.json({
            data: { quiz: result.content, usage: result.usage },
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    // ── Summary ───────────────────────────────────────────────────
    router.post('/summary', validate(summarySchema), asyncHandler(async (req, res) => {
        const { bookTitle, spoilers, stream } = req.body;
        const userId = req.user?.id;
        if (stream) {
            streamResponse(res, chatService.summarizeStream(bookTitle, spoilers, { requestId: req.requestId, userId }));
            return;
        }
        const result = await chatService.summarize(bookTitle, spoilers, { requestId: req.requestId, userId });
        res.json({
            data: { summary: result.content, usage: result.usage },
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    // ── Flashcards ────────────────────────────────────────────────
    router.post('/flashcards', validate(flashcardSchema), asyncHandler(async (req, res) => {
        const { bookTitle, count, stream } = req.body;
        const userId = req.user?.id;
        if (stream) {
            streamResponse(res, chatService.generateFlashcardsStream(bookTitle, count, { requestId: req.requestId, userId }));
            return;
        }
        const result = await chatService.generateFlashcards(bookTitle, count, { requestId: req.requestId, userId });
        res.json({
            data: { flashcards: result.content, usage: result.usage },
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    return router;
}
//# sourceMappingURL=index.js.map