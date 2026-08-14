import { AppError } from './AppError.js';
export class ForbiddenError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'FORBIDDEN');
    }
}
//# sourceMappingURL=ForbiddenError.js.map