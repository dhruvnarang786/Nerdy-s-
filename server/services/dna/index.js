import { DnaMetricsEngine } from './DnaMetricsEngine.js';
import { DnaPersonalityEngine } from './DnaPersonalityEngine.js';
import { DnaBadgeEngine } from './DnaBadgeEngine.js';
import { DnaNarrationEngine } from './DnaNarrationEngine.js';
import { DnaEventService } from './DnaEventService.js';
import { DnaComputeService } from './DnaComputeService.js';
import { DnaQueryService } from './DnaQueryService.js';

// Singleton instances
const dnaComputeService = new DnaComputeService();
const dnaEventService = new DnaEventService(dnaComputeService);
const dnaQueryService = new DnaQueryService();

export {
  dnaComputeService,
  dnaEventService,
  dnaQueryService,
  DnaMetricsEngine,
  DnaPersonalityEngine,
  DnaBadgeEngine,
  DnaNarrationEngine,
};
