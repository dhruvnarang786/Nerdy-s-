import type { IntentModelConfig, ModelDefinition, Intent } from '../types/ai.types.js';
export declare function getIntentConfig(intent: Intent): IntentModelConfig;
export declare function getModelDefinition(key: string): ModelDefinition | undefined;
export declare function registerModelDefinition(key: string, def_: ModelDefinition): void;
export declare function registerIntentConfig(intent: Intent, config: IntentModelConfig): void;
export declare function getAllModels(): string[];
//# sourceMappingURL=ModelRegistry.d.ts.map