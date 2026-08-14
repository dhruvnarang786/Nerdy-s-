import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
const configSchema = z.object({
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    HOST: z.string().default('0.0.0.0'),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(16),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),
    GOOGLE_CLIENT_ID: z.string().optional(),
    CLIENT_URL: z.string().min(1).refine((val) => val.split(',').map(s => s.trim()).every(u => z.string().url().safeParse(u).success), { message: 'CLIENT_URL must be a valid URL or comma-separated list of URLs' }),
    REDIS_URL: z.string().url().optional(),
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GEMINI_API_KEY: z.string().optional(),
    OPENROUTER_API_KEY: z.string().optional(),
    OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
    GOOGLE_BOOKS_API_KEY: z.string().optional(),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug']).default('info'),
    SENTRY_DSN: z.string().url().optional(),
});
function loadConfig() {
    const result = configSchema.safeParse(process.env);
    if (!result.success) {
        const flattened = result.error.flatten();
        const fieldErrors = flattened.fieldErrors;
        console.error('Configuration validation failed:');
        for (const [key, errors] of Object.entries(fieldErrors)) {
            if (errors && errors.length > 0) {
                console.error(`  ${key}: ${errors.join(', ')}`);
            }
        }
        process.exit(1);
    }
    return result.data;
}
export const config = loadConfig();
//# sourceMappingURL=config.js.map