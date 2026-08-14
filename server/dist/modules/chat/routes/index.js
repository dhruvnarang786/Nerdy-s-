import { Router } from 'express';
import { asyncHandler } from '../../../shared/utils/async-handler.js';
export function createChatRoutes(chatService) {
    const router = Router();
    router.get('/rooms', asyncHandler(async (_req, res) => {
        const rooms = await chatService.listRooms();
        res.json({ data: { rooms }, meta: { requestId: _req.requestId, timestamp: new Date().toISOString() } });
    }));
    router.get('/rooms/:slug', asyncHandler(async (req, res) => {
        const room = await chatService.getRoom(req.params.slug);
        res.json({ data: { room }, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    router.get('/rooms/:slug/messages', asyncHandler(async (req, res) => {
        const messages = await chatService.getRoomMessages(req.params.slug);
        res.json({ data: { messages }, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    return router;
}
//# sourceMappingURL=index.js.map