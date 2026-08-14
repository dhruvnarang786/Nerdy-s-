import { templateFallback } from './TemplateFallback.js';
import { loadCalibration } from './DnaConfig.js';
export class DnaNarrationEngine {
    async generate(snapshot, personality, stats) {
        const { minLogsForNarration } = loadCalibration();
        if (!personality?.primary || (stats?.totalLogs || 0) < minLogsForNarration) {
            return null;
        }
        const previousNarration = snapshot?.narration;
        const personalityChanged = previousNarration?.personalityId !== personality.primary.id;
        const twentyFourHoursElapsed = previousNarration?.computedAt
            ? Date.now() - new Date(previousNarration.computedAt).getTime() > 24 * 60 * 60 * 1000
            : true;
        if (!personalityChanged && !twentyFourHoursElapsed && previousNarration?.model) {
            return null;
        }
        const template = templateFallback(personality.primary.id);
        return {
            version: 'v1',
            computedAt: new Date().toISOString(),
            personalityId: personality.primary.id,
            generatedBy: { model: 'template', promptTokens: 0, completionTokens: 0 },
            identity: template.identity,
            strengths: template.strengths,
            explanation: template.explanation,
            explorationSuggestion: template.explorationSuggestion,
        };
    }
}
//# sourceMappingURL=DnaNarrationEngine.js.map