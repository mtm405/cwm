/**
 * Event Bus for inter-component communication
 * Provides a centralized event system for the application
 */
export class EventBus {
    constructor() {
        this.events = {};
    }
    
    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event callback for ${event}:`, error);
                }
            });
        }
    }
    
    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {function} callback - Callback function to remove
     */
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
    
    /**
     * Subscribe to an event once
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    once(event, callback) {
        const oneTimeCallback = (data) => {
            callback(data);
            this.off(event, oneTimeCallback);
        };
        this.on(event, oneTimeCallback);
    }
    
    /**
     * Clear all listeners for an event
     * @param {string} event - Event name
     */
    clear(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }
}

// Create global event bus instance
const eventBus = new EventBus();

// Export both class and instance
export { eventBus };
export default eventBus;
