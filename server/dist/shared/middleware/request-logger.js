import { logger } from '../../infra/logger/logger.js';
export function requestLogger() {
    return (req, res, next) => {
        const start = Date.now();
        logger.info({
            reqId: req.requestId,
            method: req.method,
            path: req.path,
            query: req.query,
            userId: req.user?.id,
        }, 'incoming request');
        res.on('finish', () => {
            const duration = Date.now() - start;
            logger.info({
                reqId: req.requestId,
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                durationMs: duration,
            }, 'request complete');
        });
        next();
    };
}
//# sourceMappingURL=request-logger.js.map