import { Router } from 'express';
import { createLogSchema } from '../schemas/logs.schema.js';
import { validate } from '../../../shared/middleware/validate.js';
import { requireAuth } from '../../../shared/middleware/require-auth.js';
import { asyncHandler } from '../../../shared/utils/async-handler.js';
export function createLogsRoutes(logsService) {
    const router = Router();
    router.get('/', requireAuth(), asyncHandler(async (req, res) => {
        const logs = await logsService.getUserLogs(req.user.id);
        res.json({ data: { logs }, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    router.get('/community', asyncHandler(async (_req, res) => {
        const logs = await logsService.getCommunityLogs();
        res.json({ data: { logs }, meta: { requestId: _req.requestId, timestamp: new Date().toISOString() } });
    }));
    router.get('/book/:bookId', requireAuth(), asyncHandler(async (req, res) => {
        const logs = await logsService.getBookLogs(req.user.id, req.params.bookId);
        res.json({ data: { logs }, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    router.get('/book/:bookId/community', asyncHandler(async (req, res) => {
        const logs = await logsService.getBookCommunityLogs(req.params.bookId);
        res.json({ data: { logs }, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    router.get('/user/:username', asyncHandler(async (req, res) => {
        const result = await logsService.getUserProfileLogs(req.params.username);
        res.json({ data: result, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    router.post('/', requireAuth(), validate(createLogSchema), asyncHandler(async (req, res) => {
        const log = await logsService.createLog(req.user.id, req.body);
        res.status(201).json({ data: { log }, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    router.delete('/:id', requireAuth(), asyncHandler(async (req, res) => {
        const result = await logsService.deleteLog(Number(req.params.id), req.user.id);
        res.json({ data: result, meta: { requestId: req.requestId, timestamp: new Date().toISOString() } });
    }));
    return router;
}
//# sourceMappingURL=index.js.map