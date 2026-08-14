import { z } from 'zod';
export const registerSchema = z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric'),
    email: z.string().email().max(255),
    password: z.string().min(8).max(128),
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});
export const googleAuthSchema = z.object({
    credential: z.string().min(1),
});
export const refreshSchema = z.object({
    refreshToken: z.string().min(1),
});
export const logoutSchema = z.object({
    refreshToken: z.string().min(1),
});
//# sourceMappingURL=auth.schema.js.map