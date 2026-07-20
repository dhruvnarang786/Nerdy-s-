import corsLib from 'cors';
import type { CorsOptions } from 'cors';
export declare function createCorsConfig(): CorsOptions;
export declare const corsMiddleware: (req: corsLib.CorsRequest, res: {
    statusCode?: number | undefined;
    setHeader(key: string, value: string): any;
    end(): any;
}, next: (err?: any) => any) => void;
//# sourceMappingURL=cors.d.ts.map