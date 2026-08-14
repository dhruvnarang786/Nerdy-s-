import corsLib from 'cors';
import { config } from '../infra/config/config.js';
export function createCorsConfig() {
    const allowedOrigins = config.CLIENT_URL
        ? config.CLIENT_URL.split(',').map(s => s.trim())
        : ['http://localhost:5173', 'http://localhost:5000'];
    const isAllowedOrigin = (origin) => {
        if (!origin)
            return true;
        if (allowedOrigins.includes(origin))
            return true;
        return origin.endsWith('.vercel.app');
    };
    return {
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
            }
            else {
                callback(null, false);
            }
        },
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
        maxAge: 86400,
    };
}
export const corsMiddleware = corsLib(createCorsConfig());
//# sourceMappingURL=cors.js.map