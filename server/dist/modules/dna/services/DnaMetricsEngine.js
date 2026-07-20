import { computeAuthorDiversity, applyAuthorDelta } from '../metrics/authorDiversity.js';
import { computeRatingGenerosity, applyRatingDelta as applyRatingGenDelta, setGlobalMeanRating } from '../metrics/ratingGenerosity.js';
import { computeRatingVariance, applyRatingVarianceCreate, applyRatingVarianceDelete } from '../metrics/ratingVariance.js';
import { computeReviewDepth, applyReviewDepthDelta } from '../metrics/reviewDepth.js';
import { computeReviewFrequency, applyReviewFrequencyDelta } from '../metrics/reviewFrequency.js';
import { computeActivityConsistency, applyActivityDelta } from '../metrics/activityConsistency.js';
import { computeGenreDiversity } from '../metrics/genreDiversity.js';
import { computeCountryDiversity } from '../metrics/countryDiversity.js';
import { computeDiscoveryScore } from '../metrics/discoveryScore.js';
export class DnaMetricsEngine {
    applyDelta(accum, event) {
        const { eventType, log, previous, current } = event;
        let a = { ...(accum || {}) };
        if (eventType === 'log.created') {
            a.authorDiversity = applyAuthorDelta(a.authorDiversity, log, true);
            a.ratingGenerosity = applyRatingGenDelta(a.ratingGenerosity, log, true);
            a.ratingVariance = applyRatingVarianceCreate(a.ratingVariance, log?.rating || 0);
            a.reviewDepth = applyReviewDepthDelta(a.reviewDepth, log, true);
            a.reviewFrequency = applyReviewFrequencyDelta(a.reviewFrequency, log, true);
            a.activityConsistency = applyActivityDelta(a.activityConsistency, log, true);
        }
        else if (eventType === 'log.deleted') {
            a.authorDiversity = applyAuthorDelta(a.authorDiversity, log, false);
            a.ratingGenerosity = applyRatingGenDelta(a.ratingGenerosity, log, false);
            a.ratingVariance = applyRatingVarianceDelete(a.ratingVariance, log?.rating || 0);
            a.reviewDepth = applyReviewDepthDelta(a.reviewDepth, log, false);
            a.reviewFrequency = applyReviewFrequencyDelta(a.reviewFrequency, log, false);
            a.activityConsistency = applyActivityDelta(a.activityConsistency, log, false);
        }
        else if (eventType === 'log.updated') {
            a = this.applyDelta(a, { eventType: 'log.deleted', log: previous });
            a = this.applyDelta(a, { eventType: 'log.created', log: current });
        }
        return a;
    }
    computeAll(accum, logs, options = {}) {
        if (options.globalMeanRating != null)
            setGlobalMeanRating(options.globalMeanRating);
        const a = accum || {};
        const authorRes = computeAuthorDiversity(a.authorDiversity);
        const generosityRes = computeRatingGenerosity(a.ratingGenerosity);
        const varianceRes = computeRatingVariance(a.ratingVariance);
        const depthRes = computeReviewDepth(a.reviewDepth);
        const freqRes = computeReviewFrequency(a.reviewFrequency);
        const consistencyRes = computeActivityConsistency(a.activityConsistency);
        const genreDiversity = logs ? computeGenreDiversity(logs) : null;
        const countryDiversity = logs ? computeCountryDiversity(logs, options.authorCountryMap || {}) : null;
        const totalLogs = a.reviewFrequency?.totalLogs || logs?.length || 0;
        const discoveryRes = computeDiscoveryScore(a.discoveryScore, totalLogs);
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
    async fullRecomputeFromLogs(logs, _authorCountryMap, _globalMeanRating) {
        let accum = {};
        for (const log of logs) {
            accum.authorDiversity = applyAuthorDelta(accum.authorDiversity, log, true);
            accum.ratingGenerosity = applyRatingGenDelta(accum.ratingGenerosity, log, true);
            accum.ratingVariance = applyRatingVarianceCreate(accum.ratingVariance, log.rating || 0);
            accum.reviewDepth = applyReviewDepthDelta(accum.reviewDepth, log, true);
            accum.reviewFrequency = applyReviewFrequencyDelta(accum.reviewFrequency, log, true);
            accum.activityConsistency = applyActivityDelta(accum.activityConsistency, log, true);
        }
        return this.computeAll(accum, logs, { authorCountryMap: _authorCountryMap, globalMeanRating: _globalMeanRating });
    }
}
//# sourceMappingURL=DnaMetricsEngine.js.map