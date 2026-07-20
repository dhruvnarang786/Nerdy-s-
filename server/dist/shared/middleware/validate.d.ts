import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
export declare function validate(schema: ZodSchema, source?: 'body' | 'query' | 'params'): RequestHandler;
//# sourceMappingURL=validate.d.ts.map