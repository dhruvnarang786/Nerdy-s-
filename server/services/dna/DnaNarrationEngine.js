import { templateFallback } from './TemplateFallback.js';
import { loadCalibration } from './DnaConfig.js';

export class DnaNarrationEngine {
  /**
   * Generate narration text for a user.
   * Uses template fallback (AI integration is Phase 1).
   *
   * @param {Object} snapshot - current DNASnapshot (to check if narration needs refresh)
   * @param {Object} personality - { primary, secondary, allScores }
   * @param {Object} stats - { totalLogs, avgRating, currentStreak, topGenre }
   * @returns {Object|null} narration object or null if insufficient data
   */
  async generate(snapshot, personality, stats) {
    const { minLogsForNarration } = loadCalibration();

    if (!personality?.primary || (stats?.totalLogs || 0) < minLogsForNarration) {
      return null;
    }

    // Check if regeneration is needed
    const previousNarration = snapshot?.narration;
    const personalityChanged = previousNarration?.personalityId !== personality.primary.id;
    const twentyFourHoursElapsed = previousNarration?.computedAt
      ? Date.now() - new Date(previousNarration.computedAt).getTime() > 24 * 60 * 60 * 1000
      : true;

    if (!personalityChanged && !twentyFourHoursElapsed && previousNarration?.model) {
      return null; // No regeneration needed
    }

    const template = templateFallback(personality.primary.id);

    const narration = {
      version: 'v1',
      computedAt: new Date().toISOString(),
      personalityId: personality.primary.id,
      generatedBy: { model: 'template', promptTokens: 0, completionTokens: 0 },
      identity: template.identity,
      strengths: template.strengths,
      explanation: template.explanation,
      explorationSuggestion: template.explorationSuggestion,
    };

    return narration;
  }
}
