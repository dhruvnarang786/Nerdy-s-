import { AppError } from '../shared/errors/AppError.js';
import { logger } from '../infra/logger/logger.js';
export function errorHandler() {
    return (err, req, res, _next) => {
        const requestId = req.requestId || 'unknown';
        if (err instanceof AppError) {
            logger.warn({
                err,
                requestId,
                code: err.code,
                statusCode: err.statusCode,
            }, err.message);
            res.status(err.statusCode).json({
                error: {
                    code: err.code,
                    message: err.message,
                    details: err.details,
                    requestId,
                },
            });
            return;
        }
        logger.error({
            err,
            requestId,
        }, 'Unhandled error');
        res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Something went wrong',
                requestId,
            },
        });
    };
}
//# sourceMappingURL=error-handler.js.map