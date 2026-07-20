import { AppError } from './AppError.js';
export class RateLimitError extends AppError {
    constructor(message = 'Too many requests, please try again later') {
        super(message, 429, 'RATE_LIMITED');
    }
}
//# sourceMappingURL=RateLimitError.js.map