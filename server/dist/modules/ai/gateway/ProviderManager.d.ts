import type { AiProvider } from './AiProvider.interface.js';
import type { ProviderHealth, Intent, ModelDefinition } from '../types/ai.types.js';
export declare class ProviderManager {
    private providers;
    private circuitStates;
    private healthCache;
    private healthInterval;
    registerProvider(provider: AiProvider): void;
    getProvider(name: string): AiProvider | undefined;
    getRegisteredProviders(): string[];
    getProvidersForIntent(intent: Intent): AiProvider[];
    getFallbackChain(intent: Intent): Array<{
        provider: AiProvider;
        modelDef: ModelDefinition;
    }>;
    recordFailure(providerName: string): void;
    recordSuccess(providerName: string): void;
    startHealthChecks(): void;
    stopHealthChecks(): void;
    getAllHealth(): Record<string, ProviderHealth>;
    private runHealthCheck;
    private isProviderUsable;
}
//# sourceMappingURL=ProviderManager.d.ts.map