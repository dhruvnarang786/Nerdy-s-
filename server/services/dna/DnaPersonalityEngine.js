import { loadCalibration } from './DnaConfig.js';

const DERIVED_METRICS = ['currentStreak', 'totalLogs', 'uniqueBooksToTotalRatio'];

export class DnaPersonalityEngine {
  /**
   * Classify a user's personality from metric scores.
   * @param {Object} metrics - { genreDiversity, authorDiversity, ..., totalLogs }
   * @param {Object} extras - { currentStreak, uniqueBooksToTotalRatio }
   * @returns {Object} { primary, secondary, confidence, allScores, explanation }
   */
  classify(metrics, extras = {}) {
    const config = loadCalibration();
    const { archetypes, minLogsForClassification, confidenceThresholds } = config;
    const totalLogs = metrics.totalLogs || 0;

    // Stage 1: Gate check
    if (totalLogs < minLogsForClassification) {
      return {
        primary: null,
        secondary: null,
        confidence: null,
        allScores: null,
        reason: 'INSUFFICIENT_DATA',
      };
    }

    // Build full metric vector
    const metricKeys = Object.keys(archetypes.curator.weights).filter(k => !DERIVED_METRICS.includes(k));
    const vector = {};
    for (const key of metricKeys) {
      vector[key] = metrics[key] != null ? metrics[key] : 0;
    }
    // Add derived
    vector.currentStreak = extras.currentStreak || 0;
    vector.totalLogs = totalLogs;
    vector.uniqueBooksToTotalRatio = extras.uniqueBooksToTotalRatio != null
      ? extras.uniqueBooksToTotalRatio * 100
      : 100;

    const result = {};

    for (const [archetypeId, archetypeDef] of Object.entries(archetypes)) {
      // Per-archetype gate check
      const gates = archetypeDef.gates || {};
      let gateFailed = false;
      for (const [gateMetric, gateThreshold] of Object.entries(gates)) {
        const value = vector[gateMetric];
        if (gateThreshold.min != null && value < gateThreshold.min) {
          gateFailed = true;
          break;
        }
      }
      if (gateFailed) {
        result[archetypeId] = { score: -Infinity, reason: 'gate_failed' };
        continue;
      }

      // Stage 2: Core score
      const weights = archetypeDef.weights || {};
      let rawScore = 0;
      const contributions = {};
      for (const [metric, weight] of Object.entries(weights)) {
        const val = vector[metric] || 0;
        rawScore += val * weight;
        if (weight > 0) contributions[metric] = { score: val, weight, contribution: val * weight };
      }

      // Stage 3: Boosts
      let boostFactor = 0;
      const boostsApplied = [];
      for (const boost of archetypeDef.boosts || []) {
        const metricVal = vector[boost.metric];
        if (metricVal >= boost.threshold) {
          boostFactor += boost.multiplier - 1;
          boostsApplied.push({ metric: boost.metric, threshold: boost.threshold, multiplier: boost.multiplier });
        }
      }
      rawScore = rawScore * (1 + boostFactor);

      // Stage 4: Rebuttals
      let penaltyFactor = 0;
      const rebuttalsApplied = [];
      for (const rebuttal of archetypeDef.rebuttals || []) {
        const metricVal = vector[rebuttal.metric];
        if (metricVal >= rebuttal.threshold) {
          penaltyFactor += rebuttal.penalty;
          rebuttalsApplied.push({ metric: rebuttal.metric, threshold: rebuttal.threshold, penalty: rebuttal.penalty });
        }
      }
      const finalScore = rawScore * (1 + penaltyFactor);

      result[archetypeId] = {
        score: Math.round(finalScore * 100) / 100,
        boostsApplied,
        rebuttalsApplied,
        contributions,
        label: archetypeDef.label,
      };
    }

    // Stage 5: Primary/secondary assignment
    const sorted = Object.entries(result)
      .filter(([, v]) => v.score > -Infinity)
      .sort((a, b) => b[1].score - a[1].score);

    if (sorted.length === 0 || sorted[0][1].score < 10) {
      return {
        primary: null,
        secondary: null,
        confidence: null,
        allScores: null,
        reason: 'NO_DOMINANT_PROFILE',
      };
    }

    const primary = { id: sorted[0][0], ...sorted[0][1] };
    const secondary = sorted.length > 1 && sorted[1][1].score >= 10
      ? { id: sorted[1][0], ...sorted[1][1] }
      : null;

    // Stage 6: Confidence
    const totalVotes = sorted.reduce((s, [, v]) => s + v.score, 0);
    const confidence = totalVotes > 0 ? primary.score / totalVotes : 0;
    const roundedConfidence = Math.round(confidence * 100) / 100;

    // Confidence label
    let confidenceLabel = 'Weak';
    if (roundedConfidence >= confidenceThresholds.strong) confidenceLabel = 'Strong';
    else if (roundedConfidence >= confidenceThresholds.moderate) confidenceLabel = 'Moderate';
    else if (roundedConfidence >= confidenceThresholds.lean) confidenceLabel = 'Lean';

    // Stage 7: Tiebreaker - if delta < 0.05 with secondary, favor higher weight sum
    let finalPrimary = primary;
    let finalSecondary = secondary;
    if (secondary && (primary.score - secondary.score) < 0.05) {
      // Compare total weight sum
      const primaryWeightSum = Object.values(archetypes[primary.id].weights || {}).reduce((s, w) => s + Math.abs(w), 0);
      const secondaryWeightSum = Object.values(archetypes[secondary.id].weights || {}).reduce((s, w) => s + Math.abs(w), 0);
      if (secondaryWeightSum > primaryWeightSum) {
        finalPrimary = secondary;
        finalSecondary = primary;
      }
    }

    // Build explanation (top 3 contributors)
    const topContributors = Object.entries(primary.contributions || {})
      .sort((a, b) => b[1].contribution - a[1].contribution)
      .slice(0, 3)
      .map(([metric, data]) => ({
        metric,
        score: data.score,
        contribution: Math.round(data.contribution * 100) / 100,
      }));

    const configArchetype = archetypes[finalPrimary.id] || {};

    return {
      primary: {
        id: finalPrimary.id,
        label: configArchetype.label || finalPrimary.id,
        confidence: roundedConfidence,
        confidenceLabel,
      },
      secondary: finalSecondary
        ? {
            id: finalSecondary.id,
            label: archetypes[finalSecondary.id]?.label || finalSecondary.id,
            confidence: secondary ? Math.round((finalSecondary.score / totalVotes) * 100) / 100 : null,
          }
        : null,
      allScores: Object.fromEntries(sorted.map(([id, v]) => [id, v.score])),
      explanation: {
        topContributors,
        boostsApplied: primary.boostsApplied || [],
        rebuttalsApplied: primary.rebuttalsApplied || [],
        gatesPassed: sorted.length,
        competingArchetypes: sorted.slice(1, 4).map(([id, v]) => ({
          id,
          score: v.score,
          delta: Math.round((primary.score - v.score) * 100) / 100,
        })),
      },
    };
  }
}
