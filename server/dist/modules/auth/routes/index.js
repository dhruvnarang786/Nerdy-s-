import { Router } from 'express';
import { registerSchema, loginSchema, googleAuthSchema, refreshSchema, logoutSchema } from '../schemas/auth.schema.js';
import { validate } from '../../../shared/middleware/validate.js';
import { requireAuth } from '../../../shared/middleware/require-auth.js';
import { asyncHandler } from '../../../shared/utils/async-handler.js';
export function createAuthRoutes(authService) {
    const router = Router();
    router.post('/register', validate(registerSchema), asyncHandler(async (req, res) => {
        const { username, email, password } = req.body;
        const result = await authService.register(username, email, password);
        res.status(201).json({
            data: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                expiresIn: result.tokens.expiresIn,
            },
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    router.post('/login', validate(loginSchema), asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json({
            data: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                expiresIn: result.tokens.expiresIn,
            },
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    router.post('/google', validate(googleAuthSchema), asyncHandler(async (req, res) => {
        const { credential } = req.body;
        const result = await authService.googleAuth(credential);
        res.json({
            data: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                refreshToken: result.tokens.refreshToken,
                expiresIn: result.tokens.expiresIn,
            },
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    router.post('/refresh', validate(refreshSchema), asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;
        const tokens = await authService.refreshToken(refreshToken);
        res.json({
            data: tokens,
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    router.post('/logout', validate(logoutSchema), asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;
        await authService.logout(refreshToken);
        res.json({
            data: { message: 'Logged out successfully' },
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    router.get('/me', requireAuth(), asyncHandler(async (req, res) => {
        const user = await authService.getMe(req.user.id);
        res.json({
            data: user,
            meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
        });
    }));
    return router;
}
//# sourceMappingURL=index.js.map