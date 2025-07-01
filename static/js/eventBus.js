/**
 * Event Bus System
 * Centralized event management for component communication and loose coupling
 */

// Prevent redeclaration errors on multiple script loads
if (typeof window.EventBus === 'undefined') {
    console.log('🔧 Initializing EventBus...');
    
    class EventBus {
        constructor() {
            this.events = new Map();
            this.onceEvents = new Map();
            this.maxListeners = 50;
        this.debug = false;
    }

    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function
     * @param {Object} options - Additional options
     * @returns {Function} Unsubscribe function
     */
    on(eventName, callback, options = {}) {
        if (!this._isValidCallback(callback)) {
            console.error('EventBus: Invalid callback provided');
            return () => {};
        }

        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        const listeners = this.events.get(eventName);
        
        // Check max listeners limit
        if (listeners.length >= this.maxListeners) {
            console.warn(`EventBus: Maximum listeners (${this.maxListeners}) reached for event: ${eventName}`);
        }

        const listener = {
            callback,
            priority: options.priority || 0,
            context: options.context || null,
            once: false,
            id: this._generateListenerId()
        };

        // Insert based on priority (higher priority first)
        const insertIndex = listeners.findIndex(l => l.priority < listener.priority);
        if (insertIndex === -1) {
            listeners.push(listener);
        } else {
            listeners.splice(insertIndex, 0, listener);
        }

        if (this.debug) {
            console.log(`EventBus: Subscribed to '${eventName}' (listeners: ${listeners.length})`);
        }

        // Return unsubscribe function
        return () => this.off(eventName, callback);
    }

    /**
     * Subscribe to an event once
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function
     * @param {Object} options - Additional options
     * @returns {Function} Unsubscribe function
     */
    once(eventName, callback, options = {}) {
        if (!this._isValidCallback(callback)) {
            console.error('EventBus: Invalid callback provided');
            return () => {};
        }

        const onceCallback = (...args) => {
            this.off(eventName, onceCallback);
            callback.apply(options.context || null, args);
        };

        return this.on(eventName, onceCallback, options);
    }

    /**
     * Unsubscribe from an event
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function to remove
     */
    off(eventName, callback) {
        if (!this.events.has(eventName)) {
            return;
        }

        const listeners = this.events.get(eventName);
        const index = listeners.findIndex(listener => listener.callback === callback);
        
        if (index !== -1) {
            listeners.splice(index, 1);
            
            if (this.debug) {
                console.log(`EventBus: Unsubscribed from '${eventName}' (listeners: ${listeners.length})`);
            }

            // Clean up empty event arrays
            if (listeners.length === 0) {
                this.events.delete(eventName);
            }
        }
    }

    /**
     * Remove all listeners for an event
     * @param {string} eventName - Name of the event
     */
    removeAllListeners(eventName) {
        if (eventName) {
            this.events.delete(eventName);
            if (this.debug) {
                console.log(`EventBus: Removed all listeners for '${eventName}'`);
            }
        } else {
            // Remove all listeners for all events
            this.events.clear();
            if (this.debug) {
                console.log('EventBus: Removed all listeners');
            }
        }
    }

    /**
     * Emit an event
     * @param {string} eventName - Name of the event
     * @param {...any} args - Arguments to pass to listeners
     * @returns {boolean} True if event had listeners
     */
    emit(eventName, ...args) {
        if (!this.events.has(eventName)) {
            if (this.debug) {
                console.log(`EventBus: No listeners for event '${eventName}'`);
            }
            return false;
        }

        const listeners = this.events.get(eventName).slice(); // Create copy to avoid issues with modifications during emit
        
        if (this.debug) {
            console.log(`EventBus: Emitting '${eventName}' to ${listeners.length} listeners`, args);
        }

        let hasError = false;

        listeners.forEach(listener => {
            try {
                if (listener.context) {
                    listener.callback.apply(listener.context, args);
                } else {
                    listener.callback(...args);
                }
            } catch (error) {
                console.error(`EventBus: Error in listener for '${eventName}':`, error);
                hasError = true;
                
                // Emit error event
                this._emitError(eventName, error, listener);
            }
        });

        return !hasError;
    }

    /**
     * Emit an event asynchronously
     * @param {string} eventName - Name of the event
     * @param {...any} args - Arguments to pass to listeners
     * @returns {Promise<boolean>} Promise that resolves when all listeners complete
     */
    async emitAsync(eventName, ...args) {
        if (!this.events.has(eventName)) {
            return false;
        }

        const listeners = this.events.get(eventName).slice();
        
        if (this.debug) {
            console.log(`EventBus: Emitting async '${eventName}' to ${listeners.length} listeners`, args);
        }

        const promises = listeners.map(async listener => {
            try {
                const result = listener.context 
                    ? listener.callback.apply(listener.context, args)
                    : listener.callback(...args);
                
                // Handle both sync and async callbacks
                return await Promise.resolve(result);
            } catch (error) {
                console.error(`EventBus: Error in async listener for '${eventName}':`, error);
                this._emitError(eventName, error, listener);
                throw error;
            }
        });

        try {
            await Promise.all(promises);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get the number of listeners for an event
     * @param {string} eventName - Name of the event
     * @returns {number} Number of listeners
     */
    listenerCount(eventName) {
        return this.events.has(eventName) ? this.events.get(eventName).length : 0;
    }

    /**
     * Get all event names that have listeners
     * @returns {string[]} Array of event names
     */
    eventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * Check if event has any listeners
     * @param {string} eventName - Name of the event
     * @returns {boolean} True if event has listeners
     */
    hasListeners(eventName) {
        return this.listenerCount(eventName) > 0;
    }

    /**
     * Set maximum number of listeners per event
     * @param {number} max - Maximum number of listeners
     */
    setMaxListeners(max) {
        this.maxListeners = max;
    }

    /**
     * Enable or disable debug logging
     * @param {boolean} enabled - Whether to enable debug logging
     */
    setDebug(enabled) {
        this.debug = enabled;
    }

    /**
     * Create a namespaced event bus
     * @param {string} namespace - Namespace prefix
     * @returns {Object} Namespaced event methods
     */
    namespace(namespace) {
        return {
            on: (event, callback, options) => this.on(`${namespace}:${event}`, callback, options),
            once: (event, callback, options) => this.once(`${namespace}:${event}`, callback, options),
            off: (event, callback) => this.off(`${namespace}:${event}`, callback),
            emit: (event, ...args) => this.emit(`${namespace}:${event}`, ...args),
            emitAsync: (event, ...args) => this.emitAsync(`${namespace}:${event}`, ...args),
            removeAllListeners: () => {
                const events = this.eventNames().filter(name => name.startsWith(`${namespace}:`));
                events.forEach(event => this.removeAllListeners(event));
            }
        };
    }

    /**
     * Get statistics about the event bus
     * @returns {Object} Event bus statistics
     */
    getStats() {
        const events = this.eventNames();
        const totalListeners = events.reduce((total, event) => total + this.listenerCount(event), 0);
        
        return {
            totalEvents: events.length,
            totalListeners,
            maxListeners: this.maxListeners,
            events: events.map(event => ({
                name: event,
                listeners: this.listenerCount(event)
            }))
        };
    }

    // Private methods
    _isValidCallback(callback) {
        return typeof callback === 'function';
    }

    _generateListenerId() {
        return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    _emitError(eventName, error, listener) {
        // Emit error event (avoid infinite loops)
        if (eventName !== 'error') {
            this.emit('error', {
                originalEvent: eventName,
                error,
                listener: {
                    id: listener.id,
                    priority: listener.priority
                }
            });
        }
    }
}

    // Create global event bus instance
    window.EventBus = EventBus;
    window.eventBus = new EventBus();

    // Helper functions for common event patterns
    window.EventHelpers = {
        /**
         * Create a disposable event subscription
         * @param {string} eventName - Event name
         * @param {Function} callback - Callback function
         * @param {Object} options - Options
         * @returns {Object} Disposable object with dispose method
         */
        createDisposable(eventName, callback, options = {}) {
            const unsubscribe = window.eventBus.on(eventName, callback, options);
            return {
            dispose: unsubscribe,
            disposed: false,
            [Symbol.dispose]: unsubscribe // Support for future JS dispose syntax
        };
    },

    /**
     * Create a promise that resolves when an event is emitted
     * @param {string} eventName - Event name
     * @param {number} timeout - Optional timeout in ms
     * @returns {Promise} Promise that resolves with event data
     */
    waitForEvent(eventName, timeout = null) {
        return new Promise((resolve, reject) => {
            let timeoutId;
            
            const unsubscribe = eventBus.once(eventName, (...args) => {
                if (timeoutId) clearTimeout(timeoutId);
                resolve(args.length === 1 ? args[0] : args);
            });

            if (timeout) {
                timeoutId = setTimeout(() => {
                    unsubscribe();
                    reject(new Error(`Event '${eventName}' timeout after ${timeout}ms`));
                }, timeout);
            }
        });
    },

    /**
     * Debounce event emissions
     * @param {string} eventName - Event name
     * @param {number} delay - Debounce delay in ms
     * @returns {Function} Debounced emit function
     */
    debounceEmit(eventName, delay = 300) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                eventBus.emit(eventName, ...args);
            }, delay);
        };
    },

    /**
     * Throttle event emissions
     * @param {string} eventName - Event name
     * @param {number} limit - Throttle limit in ms
     * @returns {Function} Throttled emit function
     */
    throttleEmit(eventName, limit = 1000) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                eventBus.emit(eventName, ...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

    // Export for module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { EventBus, eventBus, EventHelpers };
    } else {
        // Make available globally
        window.EventBus = EventBus;
        window.eventBus = eventBus;
        window.EventHelpers = EventHelpers;
    }
    
    console.log('✅ EventBus created and initialized successfully');
} else {
    console.log('ℹ️ EventBus already exists, skipping redeclaration');
}
