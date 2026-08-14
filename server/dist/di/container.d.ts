import type { Express } from 'express';
export interface ModuleDefinition {
    name: string;
    registerRoutes: (app: Express) => void;
    registerMiddleware?: (app: Express) => void;
}
declare class Container {
    private modules;
    private singletons;
    register<T>(key: string, instance: T): void;
    resolve<T>(key: string): T;
    has(key: string): boolean;
    loadModule(module: ModuleDefinition): void;
    registerModuleRoutes(app: Express): void;
    getModuleNames(): string[];
}
export declare const container: Container;
export {};
//# sourceMappingURL=container.d.ts.map