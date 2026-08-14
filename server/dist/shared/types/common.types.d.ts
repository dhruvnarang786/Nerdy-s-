export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface ApiResponse<T> {
    data: T;
    meta?: {
        requestId: string;
        timestamp: string;
        pagination?: PaginationMeta;
    };
}
export interface ApiError {
    error: {
        code: string;
        message: string;
        details?: unknown;
        requestId: string;
    };
}
export interface HealthCheck {
    status: 'ok' | 'degraded' | 'down';
    uptime: number;
    timestamp: string;
    version: string;
    checks: {
        database: HealthCheckResult;
        redis?: HealthCheckResult;
        aiProviders?: HealthCheckResult;
    };
}
export interface HealthCheckResult {
    status: 'healthy' | 'unhealthy';
    latencyMs?: number;
    error?: string;
}
//# sourceMappingURL=common.types.d.ts.map