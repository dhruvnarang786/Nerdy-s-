import { EventEmitter } from 'events';

export class DnaEventService {
  constructor(dnaComputeService) {
    this.emitter = new EventEmitter();
    this.dnaComputeService = dnaComputeService;
    this.pendingRecomputes = new Set();
    this.registerHandlers();
  }

  registerHandlers() {
    this.emitter.on('log.created', ({ userId, log }) =>
      this.scheduleRecompute(userId, 'incremental', { eventType: 'log.created', log }));

    this.emitter.on('log.deleted', ({ userId, log }) =>
      this.scheduleRecompute(userId, 'incremental', { eventType: 'log.deleted', log }));

    this.emitter.on('log.updated', ({ userId, previous, current }) =>
      this.scheduleRecompute(userId, 'incremental', { eventType: 'log.updated', previous, current }));

    this.emitter.on('favorite.added', ({ userId, favorite }) =>
      this.scheduleRecompute(userId, 'badgeOnly', { eventType: 'favorite.added', favorite }));

    this.emitter.on('favorite.removed', ({ userId, favorite }) =>
      this.scheduleRecompute(userId, 'badgeOnly', { eventType: 'favorite.removed', favorite }));
  }

  emit(eventType, payload) {
    this.emitter.emit(eventType, payload);
  }

  scheduleRecompute(userId, scope, event) {
    if (this.pendingRecomputes.has(userId)) return;
    this.pendingRecomputes.add(userId);

    setImmediate(async () => {
      try {
        if (scope === 'badgeOnly') {
          await this.dnaComputeService.badgeOnlyRecompute(userId, event);
        } else {
          await this.dnaComputeService.incrementalRecompute(userId, event);
        }
      } catch (err) {
        console.error(`[DnaEventService] Recompute failed for user ${userId}:`, err.message);
      } finally {
        this.pendingRecomputes.delete(userId);
      }
    });
  }
}
