import { ValidationError } from '../errors/ValidationError.js';
export function validate(schema, source = 'body') {
    return (req, _res, next) => {
        const result = schema.safeParse(req[source]);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            next(new ValidationError('Invalid request', fieldErrors));
            return;
        }
        if (source === 'query') {
            Object.defineProperty(req, 'query', {
                value: result.data,
                writable: true,
                configurable: true,
            });
        }
        else {
            req[source] = result.data;
        }
        next();
    };
}
//# sourceMappingURL=validate.js.map