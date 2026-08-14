function def(key) {
    return MODELS[key];
}
const MODELS = {
    'openrouter:auto': {
        provider: 'openrouter',
        model: 'openrouter/auto',
        maxTokens: 4096,
        supportsStreaming: true,
        costPer1KPromptTokens: 0,
        costPer1KCompletionTokens: 0,
    },
    'gemini:flash': {
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        maxTokens: 8192,
        supportsStreaming: true,
        costPer1KPromptTokens: 0.075,
        costPer1KCompletionTokens: 0.3,
    },
    'gemini:pro': {
        provider: 'gemini',
        model: 'gemini-2.0-pro-exp-02-05',
        maxTokens: 8192,
        supportsStreaming: true,
        costPer1KPromptTokens: 0.15,
        costPer1KCompletionTokens: 0.6,
    },
};
const INTENT_CONFIGS = {
    chat: {
        primary: def('openrouter:auto'),
        fallbacks: [def('gemini:flash')],
    },
    recommend: {
        primary: def('openrouter:auto'),
        fallbacks: [def('gemini:flash')],
    },
    narration: {
        primary: def('openrouter:auto'),
        fallbacks: [def('gemini:pro')],
    },
    moderate: {
        primary: def('gemini:flash'),
        fallbacks: [],
    },
    'book-gen': {
        primary: def('openrouter:auto'),
        fallbacks: [def('gemini:pro')],
    },
    quiz: {
        primary: def('openrouter:auto'),
        fallbacks: [def('gemini:flash')],
    },
    summary: {
        primary: def('openrouter:auto'),
        fallbacks: [def('gemini:flash')],
    },
    flashcard: {
        primary: def('openrouter:auto'),
        fallbacks: [def('gemini:flash')],
    },
};
export function getIntentConfig(intent) {
    return INTENT_CONFIGS[intent];
}
export function getModelDefinition(key) {
    return MODELS[key];
}
export function registerModelDefinition(key, def_) {
    MODELS[key] = def_;
}
export function registerIntentConfig(intent, config) {
    INTENT_CONFIGS[intent] = config;
}
export function getAllModels() {
    return Object.keys(MODELS);
}
//# sourceMappingURL=ModelRegistry.js.map