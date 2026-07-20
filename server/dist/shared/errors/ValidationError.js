import { AppError } from './AppError.js';
export class ValidationError extends AppError {
    constructor(message = 'Invalid request', details) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}
//# sourceMappingURL=ValidationError.js.map