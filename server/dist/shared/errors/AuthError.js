import { AppError } from './AppError.js';
export class AuthError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTH_ERROR');
    }
}
//# sourceMappingURL=AuthError.js.map