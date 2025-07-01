/**
 * Base Component Class
 * Provides common functionality for all UI components including event handling,
 * lifecycle management, and standardized patterns
 */

class BaseComponent {
    constructor(options = {}) {
        // Component configuration
        this.options = {
            autoInit: true,
            destroyOnUnmount: false,
            debugMode: Config.development.debug.enabled,
            ...options
        };

        // Component state
        this.state = {
            initialized: false,
            mounted: false,
            destroyed: false,
            visible: false,
            loading: false,
            disabled: false,
            ...options.initialState
        };

        // Component properties
        this.id = options.id || Utils.generateId(this.constructor.name.toLowerCase());
        this.element = null;
        this.container = options.container || document.body;
        this.template = options.template || null;
        this.className = options.className || '';

        // Event handling
        this.eventListeners = new Map();
        this.boundMethods = new Map();
        this.componentEvents = eventBus.namespace(this.id);

        // Lifecycle hooks
        this.hooks = {
            beforeInit: options.beforeInit || (() => {}),
            afterInit: options.afterInit || (() => {}),
            beforeMount: options.beforeMount || (() => {}),
            afterMount: options.afterMount || (() => {}),
            beforeUpdate: options.beforeUpdate || (() => {}),
            afterUpdate: options.afterUpdate || (() => {}),
            beforeUnmount: options.beforeUnmount || (() => {}),
            afterUnmount: options.afterUnmount || (() => {}),
            beforeDestroy: options.beforeDestroy || (() => {}),
            afterDestroy: options.afterDestroy || (() => {})
        };

        // Bind common methods
        this.bindMethods();

        // Auto-initialize if enabled
        if (this.options.autoInit) {
            this.init();
        }
    }

    /**
     * Initialize the component
     */
    async init() {
        if (this.state.initialized) {
            console.warn(`Component ${this.id} is already initialized`);
            return this;
        }

        try {
            await this.hooks.beforeInit.call(this);
            
            // Create element if template provided
            if (this.template && !this.element) {
                this.createElement();
            }

            // Set up event listeners
            this.setupEventListeners();

            // Initialize component-specific logic
            await this.onInit();

            this.state.initialized = true;
            
            await this.hooks.afterInit.call(this);
            
            this.emit('init', { component: this });
            
            if (this.options.debugMode) {
                console.log(`[${this.constructor.name}] Initialized:`, this.id);
            }

        } catch (error) {
            console.error(`Error initializing component ${this.id}:`, error);
            this.emit('error', { type: 'init', error });
            throw error;
        }

        return this;
    }

    /**
     * Mount the component to the DOM
     * @param {HTMLElement} container - Container element
     */
    async mount(container = null) {
        if (this.state.mounted) {
            console.warn(`Component ${this.id} is already mounted`);
            return this;
        }

        if (!this.state.initialized) {
            await this.init();
        }

        try {
            await this.hooks.beforeMount.call(this);

            if (container) {
                this.container = container;
            }

            if (this.element && this.container) {
                this.container.appendChild(this.element);
            }

            // Mount component-specific logic
            await this.onMount();

            this.state.mounted = true;
            
            await this.hooks.afterMount.call(this);
            
            this.emit('mount', { component: this });
            
            if (this.options.debugMode) {
                console.log(`[${this.constructor.name}] Mounted:`, this.id);
            }

        } catch (error) {
            console.error(`Error mounting component ${this.id}:`, error);
            this.emit('error', { type: 'mount', error });
            throw error;
        }

        return this;
    }

    /**
     * Unmount the component from the DOM
     */
    async unmount() {
        if (!this.state.mounted) {
            console.warn(`Component ${this.id} is not mounted`);
            return this;
        }

        try {
            await this.hooks.beforeUnmount.call(this);

            // Unmount component-specific logic
            await this.onUnmount();

            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }

            this.state.mounted = false;
            
            await this.hooks.afterUnmount.call(this);
            
            this.emit('unmount', { component: this });

            if (this.options.destroyOnUnmount) {
                await this.destroy();
            }
            
            if (this.options.debugMode) {
                console.log(`[${this.constructor.name}] Unmounted:`, this.id);
            }

        } catch (error) {
            console.error(`Error unmounting component ${this.id}:`, error);
            this.emit('error', { type: 'unmount', error });
            throw error;
        }

        return this;
    }

    /**
     * Update component state and re-render
     * @param {Object} newState - New state values
     * @param {boolean} forceRender - Force re-render even if state hasn't changed
     */
    async update(newState = {}, forceRender = false) {
        try {
            const prevState = { ...this.state };
            
            await this.hooks.beforeUpdate.call(this, newState, prevState);

            // Merge new state
            const hasChanges = this.setState(newState);

            if (hasChanges || forceRender) {
                await this.render();
            }

            await this.hooks.afterUpdate.call(this, this.state, prevState);
            
            this.emit('update', { 
                component: this, 
                state: this.state, 
                prevState,
                hasChanges 
            });

        } catch (error) {
            console.error(`Error updating component ${this.id}:`, error);
            this.emit('error', { type: 'update', error });
            throw error;
        }

        return this;
    }

    /**
     * Destroy the component and clean up resources
     */
    async destroy() {
        if (this.state.destroyed) {
            console.warn(`Component ${this.id} is already destroyed`);
            return this;
        }

        try {
            await this.hooks.beforeDestroy.call(this);

            // Unmount if still mounted
            if (this.state.mounted) {
                await this.unmount();
            }

            // Clean up event listeners
            this.removeAllEventListeners();

            // Clean up component namespace
            this.componentEvents.clear();

            // Destroy component-specific logic
            await this.onDestroy();

            this.state.destroyed = true;
            
            await this.hooks.afterDestroy.call(this);
            
            this.emit('destroy', { component: this });
            
            if (this.options.debugMode) {
                console.log(`[${this.constructor.name}] Destroyed:`, this.id);
            }

        } catch (error) {
            console.error(`Error destroying component ${this.id}:`, error);
            this.emit('error', { type: 'destroy', error });
            throw error;
        }

        return this;
    }

    /**
     * Set component state
     * @param {Object} newState - New state values
     * @returns {boolean} Whether state actually changed
     */
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        // Check if state actually changed (shallow comparison)
        return JSON.stringify(prevState) !== JSON.stringify(this.state);
    }

    /**
     * Get component state
     * @param {string} key - State key (optional)
     * @returns {*} State value or entire state
     */
    getState(key = null) {
        return key ? this.state[key] : { ...this.state };
    }

    /**
     * Create DOM element from template
     */
    createElement() {
        if (typeof this.template === 'string') {
            const div = document.createElement('div');
            div.innerHTML = this.template.trim();
            this.element = div.firstChild;
        } else if (typeof this.template === 'function') {
            this.element = this.template(this.state, this.options);
        } else if (this.template instanceof HTMLElement) {
            this.element = this.template;
        }

        if (this.element) {
            // Add component ID and class
            this.element.id = this.element.id || this.id;
            if (this.className) {
                Utils.dom.addClass(this.element, this.className);
            }

            // Add component data attribute
            this.element.setAttribute('data-component', this.constructor.name);
        }
    }

    /**
     * Render the component
     */
    async render() {
        if (!this.element) {
            console.warn(`Cannot render component ${this.id}: no element`);
            return this;
        }

        try {
            await this.onRender();
            this.emit('render', { component: this });
        } catch (error) {
            console.error(`Error rendering component ${this.id}:`, error);
            this.emit('error', { type: 'render', error });
            throw error;
        }

        return this;
    }

    /**
     * Show the component
     */
    show() {
        if (this.element) {
            Utils.dom.show(this.element);
            Utils.dom.removeClass(this.element, Constants.CLASSES.HIDDEN);
        }
        this.setState({ visible: true });
        this.emit('show', { component: this });
        return this;
    }

    /**
     * Hide the component
     */
    hide() {
        if (this.element) {
            Utils.dom.hide(this.element);
            Utils.dom.addClass(this.element, Constants.CLASSES.HIDDEN);
        }
        this.setState({ visible: false });
        this.emit('hide', { component: this });
        return this;
    }

    /**
     * Toggle component visibility
     */
    toggle() {
        return this.state.visible ? this.hide() : this.show();
    }

    /**
     * Enable the component
     */
    enable() {
        if (this.element) {
            this.element.removeAttribute('disabled');
            Utils.dom.removeClass(this.element, Constants.CLASSES.DISABLED);
        }
        this.setState({ disabled: false });
        this.emit('enable', { component: this });
        return this;
    }

    /**
     * Disable the component
     */
    disable() {
        if (this.element) {
            this.element.setAttribute('disabled', 'true');
            Utils.dom.addClass(this.element, Constants.CLASSES.DISABLED);
        }
        this.setState({ disabled: true });
        this.emit('disable', { component: this });
        return this;
    }

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoading(loading = true) {
        if (this.element) {
            if (loading) {
                Utils.dom.addClass(this.element, Constants.CLASSES.LOADING);
                this.element.setAttribute('aria-busy', 'true');
            } else {
                Utils.dom.removeClass(this.element, Constants.CLASSES.LOADING);
                this.element.removeAttribute('aria-busy');
            }
        }
        this.setState({ loading });
        this.emit('loading', { component: this, loading });
        return this;
    }

    /**
     * Add event listener
     * @param {string|HTMLElement} target - Event target or selector
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event options
     */
    addEventListener(target, event, handler, options = {}) {
        let element;

        if (typeof target === 'string') {
            element = this.element ? this.element.querySelector(target) : document.querySelector(target);
        } else {
            element = target;
        }

        if (!element) {
            console.warn(`Event target not found: ${target}`);
            return this;
        }

        // Bind handler to component context
        const boundHandler = handler.bind(this);
        
        // Store for cleanup
        const key = `${target}_${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        this.eventListeners.get(key).push({ element, handler: boundHandler, options });

        // Add listener
        element.addEventListener(event, boundHandler, options);

        return this;
    }

    /**
     * Remove event listener
     * @param {string|HTMLElement} target - Event target or selector
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    removeEventListener(target, event, handler) {
        const key = `${target}_${event}`;
        const listeners = this.eventListeners.get(key);

        if (listeners) {
            const index = listeners.findIndex(l => l.handler === handler);
            if (index !== -1) {
                const listener = listeners[index];
                listener.element.removeEventListener(event, listener.handler, listener.options);
                listeners.splice(index, 1);

                if (listeners.length === 0) {
                    this.eventListeners.delete(key);
                }
            }
        }

        return this;
    }

    /**
     * Remove all event listeners
     */
    removeAllEventListeners() {
        this.eventListeners.forEach((listeners, key) => {
            listeners.forEach(({ element, handler, options }) => {
                const [, event] = key.split('_');
                element.removeEventListener(event, handler, options);
            });
        });
        this.eventListeners.clear();
        return this;
    }

    /**
     * Emit component event
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    emit(event, data = {}) {
        const eventData = {
            ...data,
            componentId: this.id,
            componentType: this.constructor.name,
            timestamp: Date.now()
        };

        // Emit on component namespace
        this.componentEvents.emit(event, eventData);

        // Emit on global event bus
        eventBus.emit(`component:${event}`, eventData);

        return this;
    }

    /**
     * Listen to component events
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Listener options
     */
    on(event, handler, options = {}) {
        return this.componentEvents.on(event, handler, options);
    }

    /**
     * Listen to component events once
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     * @param {Object} options - Listener options
     */
    once(event, handler, options = {}) {
        return this.componentEvents.once(event, handler, options);
    }

    /**
     * Stop listening to component events
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    off(event, handler) {
        return this.componentEvents.off(event, handler);
    }

    /**
     * Find element within component
     * @param {string} selector - CSS selector
     * @returns {HTMLElement|null} Found element
     */
    $(selector) {
        return this.element ? this.element.querySelector(selector) : null;
    }

    /**
     * Find all elements within component
     * @param {string} selector - CSS selector
     * @returns {NodeList} Found elements
     */
    $$(selector) {
        return this.element ? this.element.querySelectorAll(selector) : [];
    }

    /**
     * Bind methods to component instance
     */
    bindMethods() {
        const methodNames = [
            'init', 'mount', 'unmount', 'update', 'destroy',
            'show', 'hide', 'toggle', 'enable', 'disable'
        ];

        methodNames.forEach(methodName => {
            if (typeof this[methodName] === 'function') {
                this.boundMethods.set(methodName, this[methodName].bind(this));
            }
        });
    }

    /**
     * Get bound method
     * @param {string} methodName - Method name
     * @returns {Function} Bound method
     */
    getBoundMethod(methodName) {
        return this.boundMethods.get(methodName);
    }

    // Lifecycle hooks (to be overridden by subclasses)
    async onInit() {}
    async onMount() {}
    async onUnmount() {}
    async onDestroy() {}
    async onRender() {}

    /**
     * Setup event listeners (to be overridden by subclasses)
     */
    setupEventListeners() {}

    // Static methods
    /**
     * Create multiple instances from elements
     * @param {string} selector - CSS selector
     * @param {Object} options - Component options
     * @returns {Array} Component instances
     */
    static fromElements(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements).map(element => {
            return new this({ ...options, element });
        });
    }

    /**
     * Create instance from element
     * @param {HTMLElement} element - DOM element
     * @param {Object} options - Component options
     * @returns {BaseComponent} Component instance
     */
    static fromElement(element, options = {}) {
        return new this({ ...options, element });
    }

    /**
     * Get component instance from element
     * @param {HTMLElement} element - DOM element
     * @returns {BaseComponent|null} Component instance
     */
    static getInstance(element) {
        const id = element.getAttribute('data-component-id');
        return id ? ComponentRegistry.get(id) : null;
    }
}

/**
 * Component Registry
 * Manages component instances globally
 */
class ComponentRegistry {
    static instances = new Map();

    static register(component) {
        this.instances.set(component.id, component);
        
        // Clean up when component is destroyed
        component.once('destroy', () => {
            this.unregister(component.id);
        });
    }

    static unregister(id) {
        this.instances.delete(id);
    }

    static get(id) {
        return this.instances.get(id);
    }

    static getAll() {
        return Array.from(this.instances.values());
    }

    static getByType(type) {
        return this.getAll().filter(component => 
            component.constructor.name === type
        );
    }

    static clear() {
        this.instances.clear();
    }

    static stats() {
        const stats = { total: this.instances.size, byType: {} };
        
        this.getAll().forEach(component => {
            const type = component.constructor.name;
            stats.byType[type] = (stats.byType[type] || 0) + 1;
        });

        return stats;
    }
}

// Auto-register components
BaseComponent.prototype.constructor = function(options) {
    BaseComponent.call(this, options);
    ComponentRegistry.register(this);
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BaseComponent, ComponentRegistry };
} else {
    // Make available globally
    window.BaseComponent = BaseComponent;
    window.ComponentRegistry = ComponentRegistry;
}
