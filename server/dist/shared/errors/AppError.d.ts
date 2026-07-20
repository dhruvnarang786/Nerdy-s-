export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    constructor(message: string, statusCode: number, code: string, details?: unknown);
}
//# sourceMappingURL=AppError.d.ts.map