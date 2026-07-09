import { computeAuthorDiversity, applyAuthorDelta } from './metrics/authorDiversity.js';
import { computeRatingGenerosity, applyRatingDelta as applyRatingGenDelta, setGlobalMeanRating } from './metrics/ratingGenerosity.js';
import { computeRatingVariance, applyRatingVarianceCreate, applyRatingVarianceDelete } from './metrics/ratingVariance.js';
import { computeReviewDepth, applyReviewDepthDelta } from './metrics/reviewDepth.js';
import { computeReviewFrequency, applyReviewFrequencyDelta } from './metrics/reviewFrequency.js';
import { computeActivityConsistency, applyActivityDelta } from './metrics/activityConsistency.js';
import { computeGenreDiversity } from './metrics/genreDiversity.js';
import { computeCountryDiversity } from './metrics/countryDiversity.js';
import { computeDiscoveryScore, applyDiscoveryDelta } from './metrics/discoveryScore.js';

export class DnaMetricsEngine {
  /**
   * Apply a single event delta to incremental metric accumulators.
   * Returns updated accum object.
   */
  applyDelta(accum, event) {
    const { eventType, log, previous, current } = event;
    let a = { ...(accum || {}) };

    const isCreate = eventType === 'log.created' || (eventType === 'log.updated' && previous && current);
    const isDelete = eventType === 'log.deleted';
    const isUpdate = eventType === 'log.updated';

    if (eventType === 'log.created') {
      a.authorDiversity = applyAuthorDelta(a.authorDiversity, log, true);
      a.ratingGenerosity = applyRatingGenDelta(a.ratingGenerosity, log, true);
      a.ratingVariance = applyRatingVarianceCreate(a.ratingVariance, log.rating || 0);
      a.reviewDepth = applyReviewDepthDelta(a.reviewDepth, log, true);
      a.reviewFrequency = applyReviewFrequencyDelta(a.reviewFrequency, log, true);
      a.activityConsistency = applyActivityDelta(a.activityConsistency, log, true);
    } else if (eventType === 'log.deleted') {
      a.authorDiversity = applyAuthorDelta(a.authorDiversity, log, false);
      a.ratingGenerosity = applyRatingGenDelta(a.ratingGenerosity, log, false);
      a.ratingVariance = applyRatingVarianceDelete(a.ratingVariance, log.rating || 0);
      a.reviewDepth = applyReviewDepthDelta(a.reviewDepth, log, false);
      a.reviewFrequency = applyReviewFrequencyDelta(a.reviewFrequency, log, false);
      a.activityConsistency = applyActivityDelta(a.activityConsistency, log, false);
    } else if (eventType === 'log.updated') {
      // Rollback old, apply new
      a = this.applyDelta(a, { eventType: 'log.deleted', log: previous, previous: null, current: null });
      a = this.applyDelta(a, { eventType: 'log.created', log: current, previous: null, current: null });
    }

    return a;
  }

  /**
   * Compute all 9 metric scores from accumulators + optionally full-scan data.
   * accum: the saved _accum object from snapshot
   * logs: array of BookLog rows (needed for full-recompute metrics)
   * options: { authorCountryMap, globalMeanRating }
   */
  computeAll(accum, logs, options = {}) {
    if (options.globalMeanRating) setGlobalMeanRating(options.globalMeanRating);

    const a = accum || {};

    const authorRes = computeAuthorDiversity(a.authorDiversity || {});
    const generosityRes = computeRatingGenerosity(a.ratingGenerosity || {});
    const varianceRes = computeRatingVariance(a.ratingVariance || {});
    const depthRes = computeReviewDepth(a.reviewDepth || {});
    const freqRes = computeReviewFrequency(a.reviewFrequency || {});
    const consistencyRes = computeActivityConsistency(a.activityConsistency || {});

    const genreDiversity = logs ? computeGenreDiversity(logs) : null;
    const countryDiversity = logs ? computeCountryDiversity(logs, options.authorCountryMap || {}) : null;

    const discoveryRes = computeDiscoveryScore(a.discoveryScore || {}, accum?.reviewFrequency?.totalLogs || logs?.length || 0);

    const totalLogs = accum?.reviewFrequency?.totalLogs || logs?.length || 0;

    return {
      genreDiversity,
      authorDiversity: authorRes.score,
      countryDiversity,
      ratingGenerosity: generosityRes.score,
      ratingVariance: varianceRes.score,
      reviewDepth: depthRes.score,
      reviewFrequency: freqRes.score,
      discoveryScore: discoveryRes.score,
      activityConsistency: consistencyRes.score,
      totalLogs,
      _accum: {
        authorDiversity: authorRes.accum,
        ratingGenerosity: generosityRes.accum,
        ratingVariance: varianceRes.accum,
        reviewDepth: depthRes.accum,
        reviewFrequency: freqRes.accum,
        activityConsistency: consistencyRes.accum,
        discoveryScore: discoveryRes.accum,
      },
    };
  }

  /**
   * Full recompute: scan all logs, initialize accumulators from scratch.
   */
  async fullRecomputeFromLogs(logs, authorCountryMap, globalMeanRating) {
    let accum = {};

    for (const log of logs) {
      accum.authorDiversity = applyAuthorDelta(accum.authorDiversity, log, true);
      accum.ratingGenerosity = applyRatingGenDelta(accum.ratingGenerosity, log, true);
      accum.ratingVariance = applyRatingVarianceCreate(accum.ratingVariance, log.rating || 0);
      accum.reviewDepth = applyReviewDepthDelta(accum.reviewDepth, log, true);
      accum.reviewFrequency = applyReviewFrequencyDelta(accum.reviewFrequency, log, true);
      accum.activityConsistency = applyActivityDelta(accum.activityConsistency, log, true);

      // For Discovery Score, platform percentile comparison happens externally
      // Here we assume isObscure is determined per-log by the caller
    }

    return this.computeAll(accum, logs, { authorCountryMap, globalMeanRating });
  }
}
