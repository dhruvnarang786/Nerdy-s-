// Shared configuration constants
export const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
export const REQUEST_TIMEOUT_MS = 30000;
export const MAX_RETRIES = 3;
export const FETCH_TIMEOUT_MS = 10000;

// Database configuration
export const PRISMA_LOG_LEVELS = process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['info', 'warn', 'error'];

// Rate limiting configuration (for future use)
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_REQUESTS = 100;
