import express from 'express';
import { applyGatewayMiddleware } from './gateway/index.js';
export function createApp() {
    const app = express();
    applyGatewayMiddleware(app);
    return app;
}
//# sourceMappingURL=app.js.map