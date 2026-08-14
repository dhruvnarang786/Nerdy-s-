import { getIntentConfig } from './ModelRegistry.js';
import { logger } from '../../../infra/logger/logger.js';
const HEALTH_CHECK_INTERVAL_MS = 60000;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_RESET_MS = 60000;
export class ProviderManager {
    providers = new Map();
    circuitStates = new Map();
    healthCache = new Map();
    healthInterval = null;
    registerProvider(provider) {
        this.providers.set(provider.name, provider);
        this.circuitStates.set(provider.name, {
            failures: 0,
            lastFailureAt: 0,
            open: false,
            openedAt: null,
        });
        logger.info({ provider: provider.name }, 'AI provider registered');
    }
    getProvider(name) {
        return this.providers.get(name);
    }
    getRegisteredProviders() {
        return [...this.providers.keys()];
    }
    getProvidersForIntent(intent) {
        const config = getIntentConfig(intent);
        const providers = [];
        const primary = this.providers.get(config.primary.provider);
        if (primary && this.isProviderUsable(primary.name)) {
            providers.push(primary);
        }
        for (const fallback of config.fallbacks) {
            const provider = this.providers.get(fallback.provider);
            if (provider && this.isProviderUsable(provider.name)) {
                providers.push(provider);
            }
        }
        return providers;
    }
    getFallbackChain(intent) {
        const config = getIntentConfig(intent);
        const chain = [];
        const primaryProvider = this.providers.get(config.primary.provider);
        if (primaryProvider && this.isProviderUsable(config.primary.provider)) {
            chain.push({ provider: primaryProvider, modelDef: config.primary });
        }
        for (const fallback of config.fallbacks) {
            const provider = this.providers.get(fallback.provider);
            if (provider && this.isProviderUsable(fallback.provider)) {
                chain.push({ provider, modelDef: fallback });
            }
        }
        return chain;
    }
    recordFailure(providerName) {
        const state = this.circuitStates.get(providerName);
        if (!state)
            return;
        state.failures++;
        state.lastFailureAt = Date.now();
        if (state.failures >= CIRCUIT_BREAKER_THRESHOLD) {
            state.open = true;
            state.openedAt = Date.now();
            logger.warn({ provider: providerName, failures: state.failures }, 'Circuit breaker opened for AI provider');
        }
    }
    recordSuccess(providerName) {
        const state = this.circuitStates.get(providerName);
        if (!state)
            return;
        state.failures = 0;
        if (state.open) {
            state.open = false;
            state.openedAt = null;
            logger.info({ provider: providerName }, 'Circuit breaker closed for AI provider');
        }
    }
    startHealthChecks() {
        if (this.healthInterval)
            return;
        this.runHealthCheck();
        this.healthInterval = setInterval(() => this.runHealthCheck(), HEALTH_CHECK_INTERVAL_MS);
        this.healthInterval.unref();
        logger.info('AI provider health checks started (interval: 60s)');
    }
    stopHealthChecks() {
        if (this.healthInterval) {
            clearInterval(this.healthInterval);
            this.healthInterval = null;
        }
    }
    getAllHealth() {
        const result = {};
        for (const [name, provider] of this.providers) {
            const cached = this.healthCache.get(name);
            result[name] = cached ?? provider.getHealth();
        }
        return result;
    }
    async runHealthCheck() {
        for (const [name, provider] of this.providers) {
            const start = Date.now();
            try {
                const health = provider.getHealth();
                health.lastChecked = Date.now();
                health.latencyMs = Date.now() - start;
                this.healthCache.set(name, health);
            }
            catch (err) {
                this.healthCache.set(name, {
                    healthy: false,
                    lastChecked: Date.now(),
                    latencyMs: Date.now() - start,
                    error: String(err),
                });
            }
        }
    }
    isProviderUsable(providerName) {
        const provider = this.providers.get(providerName);
        if (!provider || !provider.isAvailable())
            return false;
        const circuit = this.circuitStates.get(providerName);
        if (!circuit)
            return false;
        if (circuit.open) {
            const elapsed = Date.now() - (circuit.openedAt ?? 0);
            if (elapsed >= CIRCUIT_BREAKER_RESET_MS) {
                circuit.open = false;
                circuit.openedAt = null;
                circuit.failures = Math.floor(CIRCUIT_BREAKER_THRESHOLD / 2);
                logger.info({ provider: providerName }, 'Circuit breaker half-open (reset timer elapsed)');
                return true;
            }
            return false;
        }
        return true;
    }
}
//# sourceMappingURL=ProviderManager.js.map