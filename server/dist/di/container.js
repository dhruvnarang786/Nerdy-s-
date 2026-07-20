class Container {
    modules = [];
    singletons = new Map();
    register(key, instance) {
        if (this.singletons.has(key)) {
            throw new Error(`Dependency already registered: ${key}`);
        }
        this.singletons.set(key, instance);
    }
    resolve(key) {
        if (!this.singletons.has(key)) {
            throw new Error(`Dependency not found: ${key}`);
        }
        return this.singletons.get(key);
    }
    has(key) {
        return this.singletons.has(key);
    }
    loadModule(module) {
        this.modules.push(module);
    }
    registerModuleRoutes(app) {
        for (const mod of this.modules) {
            if (mod.registerMiddleware) {
                mod.registerMiddleware(app);
            }
            mod.registerRoutes(app);
        }
    }
    getModuleNames() {
        return this.modules.map(m => m.name);
    }
}
export const container = new Container();
//# sourceMappingURL=container.js.map