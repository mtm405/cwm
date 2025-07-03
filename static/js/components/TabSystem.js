/**
 * TabSystem - Isolated, reusable tab navigation system
 * Code with Morais - UI Component
 * 
 * This standalone module provides tab functionality that can be safely reused across
 * the application without being affected by changes to other JS files.
 */

// Use an IIFE to avoid polluting the global scope except for the TabSystem object
(function() {
    'use strict';
    
    // Check if already defined to prevent duplicate initialization
    if (window.TabSystem) {
        console.log('TabSystem already initialized');
        return;
    }
    
    /**
     * TabSystem class - Manages tab navigation
     */
    class TabSystem {
        /**
         * Create a new TabSystem
         * @param {Object} options - Configuration options
         */
        constructor(options = {}) {
            this.options = {
                // Default selector for tab containers
                tabContainerSelector: '[data-tab-container]',
                // Default selector for tab buttons
                tabButtonSelector: '[data-tab-button]',
                // Default selector for tab content panes
                tabContentSelector: '[data-tab-content]',
                // Default active tab class
                activeClass: 'active',
                // Default tab attribute name for data-tab-id
                tabAttribute: 'data-tab-id',
                // Whether to use URL hash for deep linking
                useUrlHash: true,
                // Whether to persist active tab in localStorage
                persistActiveTab: false,
                // Storage key for persisted tabs
                storagePrefix: 'cwm_active_tab_',
                // Default tab to activate if none is active
                defaultTab: null,
                // Callback when tab is changed
                onTabChange: null,
                // Override any defaults with provided options
                ...options
            };
            
            // Store initialized containers to prevent duplicate initialization
            this.initializedContainers = new Map();
            
            // Internal event tracking
            this._events = {};
            
            // Initialize automatically if DOM is ready
            if (document.readyState !== 'loading') {
                this.init();
            } else {
                document.addEventListener('DOMContentLoaded', () => this.init());
            }
        }
        
        /**
         * Initialize all tab containers in the document
         */
        init() {
            // Find all tab containers
            const containers = document.querySelectorAll(this.options.tabContainerSelector);
            
            if (containers.length === 0) {
                // No containers found, nothing to initialize
                return;
            }
            
            console.log(`TabSystem: Found ${containers.length} tab containers`);
            
            // Initialize each container
            containers.forEach(container => {
                this.initializeContainer(container);
            });
            
            // Handle URL hash if enabled
            if (this.options.useUrlHash && window.location.hash) {
                const tabId = window.location.hash.substring(1);
                this.activateTabById(tabId);
            }
            
            // Debug info
            console.log('TabSystem: Initialization complete');
        }
        
        /**
         * Initialize a specific tab container
         * @param {HTMLElement} container - The tab container element
         */
        initializeContainer(container) {
            // Skip if already initialized
            if (this.initializedContainers.has(container)) {
                return;
            }
            
            // Get container ID or generate one
            const containerId = container.id || `tab-container-${Math.random().toString(36).substring(2, 9)}`;
            if (!container.id) {
                container.id = containerId;
            }
            
            // Find tab buttons and content panes
            const buttons = container.querySelectorAll(this.options.tabButtonSelector);
            const contents = container.querySelectorAll(this.options.tabContentSelector);
            
            if (buttons.length === 0 || contents.length === 0) {
                console.warn(`TabSystem: Container ${containerId} has no buttons or content panes`);
                return;
            }
            
            console.log(`TabSystem: Initializing container ${containerId} with ${buttons.length} buttons and ${contents.length} content panes`);
            
            // Add event listeners to tab buttons
            buttons.forEach(button => {
                // Get tab ID from attribute or text content
                const tabId = button.getAttribute(this.options.tabAttribute) || 
                               button.dataset.tabId || 
                               button.textContent.trim().toLowerCase().replace(/\s+/g, '-');
                
                // Set tab ID if not already set
                if (!button.getAttribute(this.options.tabAttribute)) {
                    button.setAttribute(this.options.tabAttribute, tabId);
                }
                
                // Set ARIA attributes for accessibility
                button.setAttribute('role', 'tab');
                button.setAttribute('aria-selected', button.classList.contains(this.options.activeClass) ? 'true' : 'false');
                
                // Add click event listener
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.activateTab(button, container);
                });
                
                // Add keyboard support
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        button.click();
                    }
                });
            });
            
            // Set tab content ARIA attributes
            contents.forEach(content => {
                content.setAttribute('role', 'tabpanel');
                content.setAttribute('aria-hidden', !content.classList.contains(this.options.activeClass));
            });
            
            // If no tab is active, activate the default one or the first one
            if (!container.querySelector(`${this.options.tabButtonSelector}.${this.options.activeClass}`)) {
                // Check if there's a stored active tab for this container
                let activeTabId = null;
                
                if (this.options.persistActiveTab) {
                    activeTabId = localStorage.getItem(this.options.storagePrefix + containerId);
                }
                
                // If no stored tab or it doesn't exist, use default or first
                if (!activeTabId || !container.querySelector(`[${this.options.tabAttribute}="${activeTabId}"]`)) {
                    activeTabId = this.options.defaultTab || 
                                  buttons[0].getAttribute(this.options.tabAttribute);
                }
                
                // Activate the tab
                const tabToActivate = container.querySelector(`[${this.options.tabAttribute}="${activeTabId}"]`);
                if (tabToActivate) {
                    this.activateTab(tabToActivate, container);
                }
            }
            
            // Mark container as initialized
            this.initializedContainers.set(container, {
                id: containerId,
                buttons,
                contents
            });
        }
        
        /**
         * Activate a specific tab
         * @param {HTMLElement} tabButton - The tab button to activate
         * @param {HTMLElement} container - The tab container (optional, will try to find it)
         */
        activateTab(tabButton, container = null) {
            // Find container if not provided
            if (!container) {
                container = this.findContainerForTab(tabButton);
                if (!container) {
                    console.error('TabSystem: Cannot find container for tab', tabButton);
                    return;
                }
            }
            
            // Get the tab ID
            const tabId = tabButton.getAttribute(this.options.tabAttribute);
            if (!tabId) {
                console.error('TabSystem: Tab button has no ID attribute', tabButton);
                return;
            }
            
            // Get container data
            const containerData = this.initializedContainers.get(container);
            if (!containerData) {
                console.error('TabSystem: Container not initialized', container);
                return;
            }
            
            // Find the target content pane
            const targetContent = container.querySelector(`[${this.options.tabAttribute}="${tabId}"]${this.options.tabContentSelector}`);
            if (!targetContent) {
                console.error(`TabSystem: Cannot find content for tab ${tabId}`);
                return;
            }
            
            console.log(`TabSystem: Activating tab ${tabId} in container ${containerData.id}`);
            
            // Deactivate all tabs and content panes in this container
            containerData.buttons.forEach(button => {
                button.classList.remove(this.options.activeClass);
                button.setAttribute('aria-selected', 'false');
            });
            
            containerData.contents.forEach(content => {
                content.classList.remove(this.options.activeClass);
                content.setAttribute('aria-hidden', 'true');
            });
            
            // Activate the selected tab and content
            tabButton.classList.add(this.options.activeClass);
            tabButton.setAttribute('aria-selected', 'true');
            
            targetContent.classList.add(this.options.activeClass);
            targetContent.setAttribute('aria-hidden', 'false');
            
            // Update URL hash if enabled
            if (this.options.useUrlHash) {
                history.replaceState(null, null, `#${tabId}`);
            }
            
            // Persist active tab if enabled
            if (this.options.persistActiveTab) {
                localStorage.setItem(this.options.storagePrefix + containerData.id, tabId);
            }
            
            // Trigger callback if provided
            if (typeof this.options.onTabChange === 'function') {
                this.options.onTabChange(tabId, tabButton, targetContent, container);
            }
            
            // Trigger custom event
            this.trigger('tabChange', {
                tabId,
                tabButton,
                tabContent: targetContent,
                container
            });
        }
        
        /**
         * Activate a tab by its ID
         * @param {string} tabId - The ID of the tab to activate
         * @param {string} containerId - The container ID (optional, will check all containers)
         */
        activateTabById(tabId, containerId = null) {
            // If container ID is provided, only check that container
            if (containerId) {
                const container = document.getElementById(containerId);
                if (container) {
                    const tabButton = container.querySelector(`[${this.options.tabAttribute}="${tabId}"]${this.options.tabButtonSelector}`);
                    if (tabButton) {
                        this.activateTab(tabButton, container);
                        return true;
                    }
                }
                return false;
            }
            
            // Check all initialized containers
            for (const [container, data] of this.initializedContainers.entries()) {
                const tabButton = container.querySelector(`[${this.options.tabAttribute}="${tabId}"]${this.options.tabButtonSelector}`);
                if (tabButton) {
                    this.activateTab(tabButton, container);
                    return true;
                }
            }
            
            // Tab not found
            console.warn(`TabSystem: Cannot find tab with ID ${tabId}`);
            return false;
        }
        
        /**
         * Find the container for a tab button
         * @param {HTMLElement} tabButton - The tab button
         * @returns {HTMLElement|null} - The container or null if not found
         */
        findContainerForTab(tabButton) {
            // Try to find the container by traversing up the DOM
            let container = tabButton.closest(this.options.tabContainerSelector);
            if (container) {
                return container;
            }
            
            // Check all initialized containers
            for (const [container, data] of this.initializedContainers.entries()) {
                if (Array.from(data.buttons).includes(tabButton)) {
                    return container;
                }
            }
            
            return null;
        }
        
        /**
         * Event system: Add an event listener
         * @param {string} event - Event name
         * @param {Function} callback - Callback function
         */
        on(event, callback) {
            if (!this._events[event]) {
                this._events[event] = [];
            }
            this._events[event].push(callback);
            return this;
        }
        
        /**
         * Event system: Remove an event listener
         * @param {string} event - Event name
         * @param {Function} callback - Callback function
         */
        off(event, callback) {
            if (!this._events[event]) return this;
            if (!callback) {
                delete this._events[event];
                return this;
            }
            this._events[event] = this._events[event].filter(cb => cb !== callback);
            return this;
        }
        
        /**
         * Event system: Trigger an event
         * @param {string} event - Event name
         * @param {Object} data - Event data
         */
        trigger(event, data = {}) {
            if (!this._events[event]) return this;
            this._events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`TabSystem: Error in event handler for ${event}:`, error);
                }
            });
            return this;
        }
        
        /**
         * Reinitialize all tab containers
         * Useful after DOM changes
         */
        reinitialize() {
            this.initializedContainers.clear();
            this.init();
        }
        
        /**
         * Destroy tab system for cleanup
         */
        destroy() {
            // Remove event listeners from all tabs
            for (const [container, data] of this.initializedContainers.entries()) {
                data.buttons.forEach(button => {
                    button.removeEventListener('click', this.activateTab);
                    button.removeEventListener('keydown', this.handleKeydown);
                });
            }
            
            // Clear initialized containers
            this.initializedContainers.clear();
            
            // Clear events
            this._events = {};
            
            console.log('TabSystem: Destroyed');
        }
    }
    
    // Create global instance
    window.TabSystem = new TabSystem();
    
    // Add automatic initialization for tabs with data-auto-init attribute
    document.addEventListener('DOMContentLoaded', () => {
        const autoInitContainers = document.querySelectorAll('[data-tab-container][data-auto-init]');
        if (autoInitContainers.length > 0) {
            console.log(`TabSystem: Auto-initializing ${autoInitContainers.length} containers`);
            autoInitContainers.forEach(container => {
                window.TabSystem.initializeContainer(container);
            });
        }
    });
    
})();

// Export for ES6 module environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.TabSystem;
}
