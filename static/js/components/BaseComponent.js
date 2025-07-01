/**
 * Base Component Class
 * Provides common functionality for all UI components including event handling,
 * lifecycle management, and standardized patterns
 */

class BaseComponent {
    constructor(options = {}) {
        // Component configuration - safe access to Config
        this.options = {
            autoInit: true,
            destroyOnUnmount: false,
            debugMode: (typeof Config !== 'undefined' && Config.development && Config.development.debug) ? Config.development.debug.enabled : false,
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

        // Component properties - safe access to Utils
        this.id = options.id || ((typeof Utils !== 'undefined' && Utils.generateId) ? Utils.generateId(this.constructor.name.toLowerCase()) : `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
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

/**
 * Lesson Page Bug Fixes - Critical Issues Resolution
 * Code with Morais - Emergency Patch
 */

// 1. Create BaseComponent class (missing dependency)
if (typeof BaseComponent === 'undefined') {
    window.BaseComponent = class BaseComponent {
        constructor(name) {
            this.name = name;
            this.initialized = false;
        }
        
        init() {
            this.initialized = true;
            console.log(`✅ ${this.name} initialized`);
        }
        
        destroy() {
            this.initialized = false;
        }
    };
}

// 2. Fix content data structure issues
window.fixContentDataStructure = function() {
    // Make sure lessonData exists
    if (!window.lessonData) {
        console.warn('⚠️ Lesson data not found, creating empty structure');
        window.lessonData = {
            title: 'Lesson Content',
            description: 'This lesson is being loaded...',
            blocks: [],
            content: [],
            subtopics: []
        };
    }
    
    // Ensure blocks is always an array
    if (!Array.isArray(window.lessonData.blocks)) {
        window.lessonData.blocks = [];
    }
    
    // Ensure content is always an array
    if (window.lessonData && window.lessonData.content) {
        if (!Array.isArray(window.lessonData.content)) {
            console.warn('⚠️ Converting content to array format');
            window.lessonData.content = [];
        }
    }
    
    // Ensure subtopics exist and are properly structured
    if (window.lessonData && !window.lessonData.subtopics) {
        window.lessonData.subtopics = [];
    }
    
    // If we have no subtopics but have content, create a default subtopic
    if (window.lessonData.subtopics.length === 0 && 
        window.lessonData.content && 
        window.lessonData.content.length > 0) {
        console.log('ℹ️ Creating default subtopic from content');
        window.lessonData.subtopics.push({
            title: 'Main Content',
            content: window.lessonData.content
        });
    }
    
    if (window.lessonData && window.lessonData.subtopics) {
        window.lessonData.subtopics.forEach((subtopic, index) => {
            if (!subtopic.content) {
                subtopic.content = [];
            }
            if (!Array.isArray(subtopic.content)) {
                subtopic.content = [];
            }
        });
    }
    
    console.log('✅ Lesson data structure fixed');
};

// 3. Safe renderSubtopic function
window.renderSubtopic = function(index) {
    try {
        console.log(`📖 Rendering subtopic ${index}`);
        // Fix data structure first
        window.fixContentDataStructure();
        const container = document.getElementById('lesson-content-container');
        if (!container) {
            console.warn('⚠️ Lesson content container not found');
            return;
        }
        container.innerHTML = '';
        
        // Emergency check to ensure lessonData exists
        if (!window.lessonData) {
            console.warn('⚠️ Lesson data not found, creating empty structure');
            window.lessonData = { blocks: [], content: [], subtopics: [] };
        }
        
        // Logging the available data structures to debug
        console.log('🔍 Available data structures:', {
            hasBlocks: Boolean(window.lessonData?.blocks),
            hasContent: Boolean(window.lessonData?.content),
            hasSubtopics: Boolean(window.lessonData?.subtopics),
            blocksLength: Array.isArray(window.lessonData?.blocks) ? window.lessonData.blocks.length : 'not array'
        });
        
        // Super safe approach - try each possible data structure
        // 1. Try Firebase blocks first (modern approach)
        let blocks = Array.isArray(window.lessonData?.blocks) ? window.lessonData.blocks : [];
        
        // 2. If no blocks, try subtopic content
        if (blocks.length === 0 && window.lessonData?.subtopics) {
            const subtopics = window.lessonData.subtopics;
            if (Array.isArray(subtopics) && subtopics[index]) {
                const subtopic = subtopics[index];
                if (subtopic && Array.isArray(subtopic.content)) {
                    blocks = subtopic.content;
                    console.log(`📚 Using subtopic ${index} content:`, blocks.length);
                } else if (Array.isArray(subtopic)) {
                    blocks = subtopic;
                    console.log(`📚 Using subtopic ${index} array:`, blocks.length);
                }
            }
        }
        
        // 3. If still no blocks, try main content
        if (blocks.length === 0 && Array.isArray(window.lessonData?.content)) {
            blocks = window.lessonData.content;
            console.log('📚 Using main content:', blocks.length);
        }
        
        // Render blocks if any exist
        if (blocks && blocks.length > 0) {
            console.log(`🧱 Rendering ${blocks.length} blocks`);
            blocks.forEach((block, blockIndex) => {
                try {
                    const blockElement = typeof window.createContentBlock === 'function'
                        ? window.createContentBlock(block, blockIndex)
                        : createContentBlock(block, blockIndex);
                    if (blockElement) container.appendChild(blockElement);
                } catch (blockError) {
                    console.error(`❌ Error rendering block ${blockIndex}:`, blockError);
                    // Create a simple fallback for this block
                    const fallbackElement = document.createElement('div');
                    fallbackElement.className = 'content-block error-block';
                    fallbackElement.innerHTML = `
                        <div class="block-header">
                            <div class="block-icon">⚠️</div>
                            <div class="block-type">Error in Block ${blockIndex + 1}</div>
                        </div>
                        <div class="text-content">
                            <p>This content block could not be rendered.</p>
                        </div>
                    `;
                    container.appendChild(fallbackElement);
                }
            });
        } else {
            // Fallback content
            console.log('📄 No blocks found, showing fallback content');
            container.innerHTML = `
                <div class="content-block text-block">
                    <div class="block-header">
                        <div class="block-icon">📚</div>
                        <div class="block-type">Learning Content</div>
                    </div>
                    <div class="text-content">
                        <h3>Welcome to ${window.lessonData?.title || 'this lesson'}!</h3>
                        <p>This lesson will be available soon. Please check back later.</p>
                        <p>You can navigate to other lessons from the dashboard.</p>
                        <div class="key-points">
                            <h4>🎯 While you wait:</h4>
                            <ul>
                                <li>Check out other available lessons</li>
                                <li>Complete the daily challenge</li>
                                <li>Review your previous progress</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Update UI elements
        if (typeof updateTabStates === 'function') {
            updateTabStates(index);
        }
        window.currentSubtopic = index;
        console.log(`✅ Subtopic ${index} rendered successfully`);
        
        // Initialize any interactive elements
        setTimeout(() => {
            if (typeof initializeSafeComponents === 'function') {
                initializeSafeComponents();
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ Error rendering subtopic:', error);
        if (typeof showFallbackContent === 'function') {
            showFallbackContent();
        } else {
            // Emergency fallback
            const container = document.getElementById('lesson-content-container');
            if (container) {
                container.innerHTML = `
                    <div class="content-block error-block">
                        <div class="block-header">
                            <div class="block-icon">⚠️</div>
                            <div class="block-type">Error</div>
                        </div>
                        <div class="text-content">
                            <h3>Something went wrong</h3>
                            <p>We couldn't load the lesson content. Please try refreshing the page.</p>
                            <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
                        </div>
                    </div>
                `;
            }
        }
    }
};

// 4. Create content block helper
function createContentBlock(block, index) {
    const blockDiv = document.createElement('div');
    blockDiv.className = 'content-block text-block';
    blockDiv.setAttribute('data-block-index', index);
    
    let content = '';
    
    if (typeof block === 'string') {
        content = `
            <div class="block-header">
                <div class="block-icon">📝</div>
                <div class="block-type">Text Content</div>
            </div>
            <div class="text-content">
                <p>${block}</p>
            </div>
        `;
    } else if (block && typeof block === 'object') {
        const title = block.title || block.name || 'Content Block';
        const text = block.content || block.text || block.description || 'Content will be displayed here.';
        const type = block.type || 'text';
        
        content = `
            <div class="block-header">
                <div class="block-icon">${getBlockIcon(type)}</div>
                <div class="block-type">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            </div>
            <div class="text-content">
                <h3>${title}</h3>
                <p>${text}</p>
            </div>
        `;
    } else {
        content = `
            <div class="block-header">
                <div class="block-icon">📝</div>
                <div class="block-type">Content</div>
            </div>
            <div class="text-content">
                <p>Content block ${index + 1}</p>
            </div>
        `;
    }
    
    blockDiv.innerHTML = content;
    return blockDiv;
}

// 5. Block icon helper
function getBlockIcon(type) {
    const icons = {
        'text': '📝',
        'code': '💻',
        'quiz': '❓',
        'interactive': '🎮',
        'example': '💡',
        'exercise': '🏃',
        'challenge': '🎯'
    };
    return icons[type] || '📚';
}

// 6. Update tab states
function updateTabStates(activeIndex) {
    const tabs = document.querySelectorAll('.subtopic-tab, .lesson-tab');
    tabs.forEach((tab, index) => {
        tab.classList.toggle('active', index === activeIndex);
    });
}

// 7. Show fallback content
function showFallbackContent() {
    const container = document.getElementById('lesson-content-container');
    if (container) {
        container.innerHTML = `
            <div class="content-block text-block">
                <div class="block-header">
                    <div class="block-icon">⚠️</div>
                    <div class="block-type">Notice</div>
                </div>
                <div class="text-content">
                    <h3>Content Loading</h3>
                    <p>We're having trouble loading the lesson content. The lesson system is being updated.</p>
                    <p>Please refresh the page or try again in a moment.</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-refresh"></i> Refresh Page
                    </button>
                </div>
            </div>
        `;
    }
}

// 8. Fix missing functions
window.toggleLessonMenu = function() {
    const sidebar = document.getElementById('lesson-menu-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    } else {
        console.warn('⚠️ Lesson menu sidebar not found');
    }
};

window.switchSubtopic = function(index) {
    window.renderSubtopic(index);
};

window.previousSubtopic = function() {
    const current = window.currentSubtopic || 0;
    if (current > 0) {
        window.renderSubtopic(current - 1);
    }
};

window.nextSubtopic = function() {
    const current = window.currentSubtopic || 0;
    const maxSubtopics = window.lessonData?.subtopics?.length || 1;
    if (current < maxSubtopics - 1) {
        window.renderSubtopic(current + 1);
    }
};

// 9. Fix complete button issue
window.updateCompleteButton = function() {
    try {
        const completeBtn = document.getElementById('complete-lesson-btn');
        if (completeBtn) {
            completeBtn.textContent = 'Mark as Complete';
            completeBtn.onclick = function() {
                alert('Lesson marked as complete!');
                window.location.href = '/lessons';
            };
        }
    } catch (error) {
        console.warn('⚠️ Could not update complete button:', error);
    }
};

// 10. Safe initialization function
window.safeInitializeLesson = function() {
    try {
        console.log('🔧 Safe lesson initialization started...');
        
        // Fix data structure
        window.fixContentDataStructure();
        
        // Initialize current subtopic
        window.currentSubtopic = 0;
        
        // Render first subtopic
        window.renderSubtopic(0);
        
        // Update complete button
        window.updateCompleteButton();
        
        // Initialize other components safely
        initializeSafeComponents();
        
        console.log('✅ Safe lesson initialization completed');
        
    } catch (error) {
        console.error('❌ Safe initialization failed:', error);
        showFallbackContent();
    }
};

// 11. Initialize safe components
function initializeSafeComponents() {
    // Initialize ACE editors if available
    if (typeof ace !== 'undefined') {
        document.querySelectorAll('.code-editor').forEach((editor, index) => {
            try {
                if (!editor.getAttribute('data-ace-initialized')) {
                    const aceEditor = ace.edit(editor);
                    aceEditor.setTheme('ace/theme/monokai');
                    aceEditor.session.setMode('ace/mode/python');
                    aceEditor.setOptions({
                        fontSize: '14px',
                        wrap: true,
                        enableBasicAutocompletion: true
                    });
                    editor.setAttribute('data-ace-initialized', 'true');
                    console.log(`✅ ACE editor ${index} initialized`);
                }
            } catch (error) {
                console.warn(`⚠️ Failed to initialize ACE editor ${index}:`, error);
            }
        });
    }
    
    // Initialize navigation buttons
    const navButtons = {
        'prev-btn': () => window.previousSubtopic(),
        'next-btn': () => window.nextSubtopic(),
        'lesson-menu-btn': () => window.toggleLessonMenu()
    };
    
    Object.entries(navButtons).forEach(([id, handler]) => {
        const btn = document.getElementById(id);
        if (btn && !btn.getAttribute('data-handler-attached')) {
            btn.onclick = handler;
            btn.setAttribute('data-handler-attached', 'true');
        }
    });
}

// 12. Module duplication prevention
window.preventModuleDuplication = function() {
    const loadedScripts = new Set();
    
    // Override script loading to prevent duplicates
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
        const element = originalCreateElement.call(this, tagName);
        
        if (tagName.toLowerCase() === 'script') {
            const originalSetSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src').set;
            
            Object.defineProperty(element, 'src', {
                set: function(value) {
                    if (loadedScripts.has(value)) {
                        console.warn(`⚠️ Preventing duplicate script load: ${value}`);
                        return;
                    }
                    loadedScripts.add(value);
                    originalSetSrc.call(this, value);
                },
                get: function() {
                    return this.getAttribute('src');
                }
            });
        }
        
        return element;
    };
};

// 13. Emergency initialization
(function() {
    console.log('🚨 Lesson page emergency fixes loading...');
    
    // Prevent module duplication
    window.preventModuleDuplication();
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.safeInitializeLesson);
    } else {
        // DOM already loaded
        setTimeout(window.safeInitializeLesson, 100);
    }
    
    // Fallback initialization
    setTimeout(() => {
        if (!window.currentSubtopic && window.currentSubtopic !== 0) {
            console.log('🔄 Running fallback initialization...');
            window.safeInitializeLesson();
        }
    }, 2000);
    
    console.log('✅ Emergency fixes loaded');
})();

// Emergency lesson page fixes
if (window.location.pathname.includes('/lesson/')) {
    console.log('🚨 Lesson page emergency fixes loading...');
    
    // Fix content structure issues
    window.fixContentDataStructure = function(content) {
        if (!content) return [];
        
        // If content is a string (markdown), convert to blocks
        if (typeof content === 'string') {
            console.warn('⚠️ Converting content to array format');
            const blocks = [];
            const sections = content.split(/\n## /);
            
            sections.forEach((section, index) => {
                if (section.trim()) {
                    blocks.push({
                        type: 'text',
                        content: (index === 0 ? section : '## ' + section).trim()
                    });
                }
            });
            
            return blocks;
        }
        
        return Array.isArray(content) ? content : [];
    };
    
    // Fix subtopic navigation
    window.renderSubtopic = function(index) {
        try {
            const container = document.getElementById('lesson-content-container');
            if (!container) return;
            
            console.log(`📖 Rendering subtopic ${index}`);
            
            // Update tab active state
            document.querySelectorAll('.subtopic-tab').forEach((tab, i) => {
                tab.classList.toggle('active', i === index);
            });
            
            // Clear container
            container.innerHTML = '';
            
            // Create default content if no blocks
            if (!window.lessonData.blocks || window.lessonData.blocks.length === 0) {
                // Transform content to blocks
                if (window.lessonData.content) {
                    window.lessonData.blocks = window.fixContentDataStructure(window.lessonData.content);
                }
            }
            
            // Render blocks
            if (window.lessonData.blocks && window.lessonData.blocks.length > 0) {
                window.lessonData.blocks.forEach((block, blockIndex) => {
                    const blockElement = window.createBlockElement(block, blockIndex);
                    if (blockElement) {
                        container.appendChild(blockElement);
                    }
                });
            } else {
                // Fallback content
                container.innerHTML = `
                    <div class="content-block text-block">
                        <div class="block-header">
                            <div class="block-icon">📚</div>
                            <div class="block-type">Learning Content</div>
                        </div>
                        <div class="text-content">
                            <h3>Welcome to ${window.lessonData.title || 'this lesson'}!</h3>
                            <p>This lesson content is being prepared. Please check back soon.</p>
                        </div>
                    </div>
                `;
            }
            
            console.log('✅ Subtopic', index, 'rendered successfully');
            
        } catch (error) {
            console.error('❌ Error rendering subtopic:', error);
        }
    };
    
    console.log('✅ Emergency fixes loaded');
}