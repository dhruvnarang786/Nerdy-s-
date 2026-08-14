import helmet from 'helmet';
import express from 'express';
import { requestId } from './request-id.js';
import { corsMiddleware } from './cors.js';
import { errorHandler } from './error-handler.js';
import { requestLogger } from '../shared/middleware/request-logger.js';
export function applyGatewayMiddleware(app) {
    app.use(helmet());
    app.use(corsMiddleware);
    app.use(requestId());
    app.use(requestLogger());
    app.use(express.json({ limit: '1mb' }));
}
export function applyErrorHandler(app) {
    app.use(errorHandler());
}
//# sourceMappingURL=index.js.map