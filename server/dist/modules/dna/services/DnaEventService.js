import { eventBus } from '../../../shared/events/event-bus.js';
export class DnaEventService {
    dnaComputeService;
    pendingRecomputes = new Set();
    constructor(dnaComputeService) {
        this.dnaComputeService = dnaComputeService;
        this.registerHandlers();
    }
    registerHandlers() {
        eventBus.on('log.created', (payload) => this.scheduleRecompute(payload.userId, 'incremental', { eventType: 'log.created', log: payload.log }));
        eventBus.on('log.deleted', (payload) => this.scheduleRecompute(payload.userId, 'incremental', { eventType: 'log.deleted', log: payload.log }));
        eventBus.on('log.updated', (payload) => this.scheduleRecompute(payload.userId, 'incremental', { eventType: 'log.updated', previous: payload.previous, current: payload.current }));
        eventBus.on('favorite.added', (payload) => this.scheduleRecompute(payload.userId, 'badgeOnly', { eventType: 'favorite.added' }));
        eventBus.on('favorite.removed', (payload) => this.scheduleRecompute(payload.userId, 'badgeOnly', { eventType: 'favorite.removed' }));
    }
    scheduleRecompute(userId, scope, event) {
        if (this.pendingRecomputes.has(userId))
            return;
        this.pendingRecomputes.add(userId);
        setImmediate(async () => {
            try {
                if (scope === 'badgeOnly') {
                    await this.dnaComputeService.badgeOnlyRecompute(userId, event);
                }
                else {
                    await this.dnaComputeService.incrementalRecompute(userId, event);
                }
            }
            catch (err) {
                console.error(`[DnaEventService] Recompute failed for user ${userId}:`, err.message);
            }
            finally {
                this.pendingRecomputes.delete(userId);
            }
        });
    }
}
//# sourceMappingURL=DnaEventService.js.map