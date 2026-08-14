import pino from 'pino';
import { config } from '../config/config.js';
const transport = config.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss.l', ignore: 'pid,hostname' } }
    : undefined;
export const logger = pino({
    level: config.LOG_LEVEL,
    transport,
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.body.password',
            'req.body.credential',
            'req.body.token',
            'body.password',
            'body.credential',
        ],
        censor: '[REDACTED]',
    },
    serializers: {
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res,
        err: pino.stdSerializers.err,
    },
    base: {
        env: config.NODE_ENV,
        service: 'nerdys-api',
    },
});
//# sourceMappingURL=logger.js.map