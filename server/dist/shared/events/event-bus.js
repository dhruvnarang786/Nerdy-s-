import { EventEmitter } from 'events';
export const eventBus = new EventEmitter();
eventBus.setMaxListeners(50);
//# sourceMappingURL=event-bus.js.map