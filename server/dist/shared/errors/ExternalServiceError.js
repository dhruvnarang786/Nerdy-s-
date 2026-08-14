import { AppError } from './AppError.js';
export class ExternalServiceError extends AppError {
    constructor(message = 'External service unavailable', details) {
        super(message, 502, 'EXTERNAL_SERVICE_ERROR', details);
    }
}
//# sourceMappingURL=ExternalServiceError.js.map