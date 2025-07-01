/**
 * Theme Controller Component
 * Manages application theme switching, persistence, and system preferences
 */

class ThemeController extends BaseComponent {
    constructor(options = {}) {
        const defaultOptions = {
            themes: ['light', 'dark', 'auto'],
            defaultTheme: 'light',
            storageKey: Constants.CONFIG.STORAGE_KEYS.THEME,
            systemPreference: true,
            transitions: true,
            transitionDuration: 300,
            autoInit: true,
            className: 'theme-controller',
            selectors: {
                toggleButton: '[data-theme-toggle]',
                themeOptions: '[data-theme]',
                themeIndicator: '[data-theme-indicator]'
            }
        };

        super({ ...defaultOptions, ...options });

        // Theme controller properties
        this.currentTheme = null;
        this.systemTheme = null;
        this.mediaQuery = null;
        this.themes = new Map();
        this.observers = new Set();
        this.transitionClass = 'theme-transition';

        // Initialize themes
        this.initializeThemes();
        
        // Setup system preference detection
        this.setupSystemPreferenceDetection();
    }

    /**
     * Initialize theme controller
     */
    async onInit() {
        // Load saved theme or use default
        await this.loadTheme();
        
        // Apply initial theme
        await this.applyTheme(this.currentTheme);
        
        // Setup theme controls
        this.setupThemeControls();
        
        // Setup event listeners
        this.setupThemeListeners();

        if (this.options.debugMode) {
            console.log('[ThemeController] Initialized with theme:', this.currentTheme);
        }
    }

    /**
     * Initialize available themes
     */
    initializeThemes() {
        const defaultThemes = [
            {
                name: 'light',
                label: 'Light',
                icon: '☀️',
                cssClass: 'theme-light',
                properties: {
                    '--primary-bg': '#ffffff',
                    '--secondary-bg': '#f8f9fa',
                    '--text-color': '#333333',
                    '--border-color': '#dee2e6'
                }
            },
            {
                name: 'dark',
                label: 'Dark',
                icon: '🌙',
                cssClass: 'theme-dark',
                properties: {
                    '--primary-bg': '#1a1a1a',
                    '--secondary-bg': '#2d2d2d',
                    '--text-color': '#ffffff',
                    '--border-color': '#444444'
                }
            },
            {
                name: 'auto',
                label: 'Auto',
                icon: '🔄',
                cssClass: 'theme-auto',
                followsSystem: true
            }
        ];

        defaultThemes.forEach(theme => {
            this.themes.set(theme.name, theme);
        });
    }

    /**
     * Setup system preference detection
     */
    setupSystemPreferenceDetection() {
        if (!this.options.systemPreference || !window.matchMedia) return;

        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.systemTheme = this.mediaQuery.matches ? 'dark' : 'light';

        // Listen for system preference changes
        this.mediaQuery.addEventListener('change', this.handleSystemPreferenceChange.bind(this));
    }

    /**
     * Handle system preference changes
     * @param {MediaQueryListEvent} e - Media query event
     */
    handleSystemPreferenceChange(e) {
        this.systemTheme = e.matches ? 'dark' : 'light';
        
        // If current theme is auto, apply system theme
        if (this.currentTheme === 'auto') {
            this.applySystemTheme();
        }

        this.emit('systemPreferenceChange', { 
            systemTheme: this.systemTheme,
            currentTheme: this.currentTheme 
        });
    }

    /**
     * Load theme from storage or detect system preference
     */
    async loadTheme() {
        try {
            // Try to load from storage
            const savedTheme = localStorage.getItem(this.options.storageKey);
            
            if (savedTheme && this.themes.has(savedTheme)) {
                this.currentTheme = savedTheme;
            } else if (this.options.systemPreference && this.systemTheme) {
                // Use system preference if no saved theme
                this.currentTheme = 'auto';
            } else {
                // Fallback to default theme
                this.currentTheme = this.options.defaultTheme;
            }

            this.emit('themeLoaded', { theme: this.currentTheme });
            
        } catch (error) {
            console.warn('Error loading theme from storage:', error);
            this.currentTheme = this.options.defaultTheme;
        }
    }

    /**
     * Save theme to storage
     * @param {string} theme - Theme name
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.options.storageKey, theme);
            
            // Save to user preferences if authenticated
            if (typeof authService !== 'undefined' && authService.isUserAuthenticated()) {
                const preferences = this.getUserPreferences();
                preferences.theme = theme;
                authService.saveUserPreferences(preferences);
            }
            
        } catch (error) {
            console.warn('Error saving theme to storage:', error);
        }
    }

    /**
     * Apply theme to document
     * @param {string} themeName - Theme name to apply
     */
    async applyTheme(themeName) {
        if (!this.themes.has(themeName)) {
            console.warn(`Theme '${themeName}' not found`);
            return;
        }

        const theme = this.themes.get(themeName);
        const actualTheme = this.resolveTheme(theme);
        
        try {
            // Add transition class if enabled
            if (this.options.transitions) {
                this.addTransitionClass();
            }

            // Remove previous theme classes
            this.removeThemeClasses();
            
            // Apply new theme
            await this.applyThemeProperties(actualTheme);
            
            // Add theme class
            if (actualTheme.cssClass) {
                document.documentElement.classList.add(actualTheme.cssClass);
            }
            
            // Set theme attribute
            document.documentElement.setAttribute('data-theme', actualTheme.name);
            
            // Update theme controls
            this.updateThemeControls(themeName);
            
            // Notify observers
            this.notifyObservers(themeName, actualTheme);
            
            // Remove transition class after animation
            if (this.options.transitions) {
                setTimeout(() => {
                    this.removeTransitionClass();
                }, this.options.transitionDuration);
            }

            this.emit('themeApplied', { 
                requestedTheme: themeName,
                appliedTheme: actualTheme 
            });

            if (this.options.debugMode) {
                console.log(`[ThemeController] Applied theme: ${actualTheme.name}`);
            }
            
        } catch (error) {
            console.error('Error applying theme:', error);
            this.emit('themeError', { theme: themeName, error });
        }
    }

    /**
     * Resolve theme (handle auto theme)
     * @param {Object} theme - Theme object
     * @returns {Object} Resolved theme
     */
    resolveTheme(theme) {
        if (theme.followsSystem && this.systemTheme) {
            return this.themes.get(this.systemTheme) || theme;
        }
        return theme;
    }

    /**
     * Apply theme properties to document
     * @param {Object} theme - Theme object
     */
    async applyThemeProperties(theme) {
        if (!theme.properties) return;

        const root = document.documentElement;
        
        // Apply CSS custom properties
        Object.entries(theme.properties).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });
    }

    /**
     * Remove all theme classes from document
     */
    removeThemeClasses() {
        this.themes.forEach(theme => {
            if (theme.cssClass) {
                document.documentElement.classList.remove(theme.cssClass);
            }
        });
    }

    /**
     * Add transition class for smooth theme changes
     */
    addTransitionClass() {
        document.documentElement.classList.add(this.transitionClass);
        
        // Ensure transition styles exist
        if (!document.getElementById('theme-transitions')) {
            const style = document.createElement('style');
            style.id = 'theme-transitions';
            style.textContent = `
                .${this.transitionClass} * {
                    transition: background-color ${this.options.transitionDuration}ms ease,
                               color ${this.options.transitionDuration}ms ease,
                               border-color ${this.options.transitionDuration}ms ease,
                               box-shadow ${this.options.transitionDuration}ms ease !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Remove transition class
     */
    removeTransitionClass() {
        document.documentElement.classList.remove(this.transitionClass);
    }

    /**
     * Setup theme controls in the DOM
     */
    setupThemeControls() {
        // Find theme toggle buttons
        const toggleButtons = document.querySelectorAll(this.options.selectors.toggleButton);
        toggleButtons.forEach(button => {
            button.addEventListener('click', this.handleToggleClick.bind(this));
        });

        // Find theme option buttons
        const themeOptions = document.querySelectorAll(this.options.selectors.themeOptions);
        themeOptions.forEach(option => {
            option.addEventListener('click', this.handleThemeOptionClick.bind(this));
        });
    }

    /**
     * Setup theme-related event listeners
     */
    setupThemeListeners() {
        // Listen for theme change events
        eventBus.on('theme:change', this.setTheme.bind(this));
        eventBus.on('theme:toggle', this.toggleTheme.bind(this));
        eventBus.on('theme:reset', this.resetTheme.bind(this));

        // Listen for auth events to sync preferences
        eventBus.on(Constants.EVENTS.USER_LOGIN, this.handleUserLogin.bind(this));
        eventBus.on('preferences:loaded', this.handlePreferencesLoaded.bind(this));
    }

    /**
     * Handle toggle button clicks
     * @param {Event} e - Click event
     */
    handleToggleClick(e) {
        e.preventDefault();
        this.toggleTheme();
    }

    /**
     * Handle theme option clicks
     * @param {Event} e - Click event
     */
    handleThemeOptionClick(e) {
        e.preventDefault();
        const theme = e.currentTarget.getAttribute('data-theme');
        if (theme) {
            this.setTheme(theme);
        }
    }

    /**
     * Handle user login to sync theme preferences
     * @param {Object} data - Login event data
     */
    handleUserLogin(data) {
        if (data.status === 'success' || data.status === 'restored') {
            // Theme might be loaded from user preferences
            // This is handled by authService loading preferences
        }
    }

    /**
     * Handle loaded user preferences
     * @param {Object} preferences - User preferences
     */
    handlePreferencesLoaded(preferences) {
        if (preferences.theme && preferences.theme !== this.currentTheme) {
            this.setTheme(preferences.theme);
        }
    }

    /**
     * Set theme
     * @param {string} themeName - Theme name
     */
    async setTheme(themeName) {
        if (typeof themeName === 'object') {
            themeName = themeName.theme || themeName.themeName;
        }

        if (!this.themes.has(themeName)) {
            console.warn(`Theme '${themeName}' not available`);
            return;
        }

        if (this.currentTheme === themeName) {
            return; // No change needed
        }

        const previousTheme = this.currentTheme;
        this.currentTheme = themeName;

        // Save theme
        this.saveTheme(themeName);

        // Apply theme
        await this.applyTheme(themeName);

        this.emit('themeChanged', { 
            previousTheme,
            currentTheme: themeName 
        });

        // Emit global event
        eventBus.emit('theme:changed', { theme: themeName });
    }

    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const toggleOrder = ['light', 'dark'];
        let nextTheme;

        if (this.currentTheme === 'auto') {
            // If auto, toggle to opposite of system theme
            nextTheme = this.systemTheme === 'dark' ? 'light' : 'dark';
        } else {
            const currentIndex = toggleOrder.indexOf(this.currentTheme);
            const nextIndex = (currentIndex + 1) % toggleOrder.length;
            nextTheme = toggleOrder[nextIndex];
        }

        this.setTheme(nextTheme);
    }

    /**
     * Apply system theme (for auto theme)
     */
    applySystemTheme() {
        if (this.systemTheme) {
            const systemThemeObj = this.themes.get(this.systemTheme);
            if (systemThemeObj) {
                this.applyTheme('auto'); // This will resolve to system theme
            }
        }
    }

    /**
     * Reset theme to default
     */
    resetTheme() {
        this.setTheme(this.options.defaultTheme);
    }

    /**
     * Update theme control UI elements
     * @param {string} currentTheme - Current theme name
     */
    updateThemeControls(currentTheme) {
        // Update toggle buttons
        const toggleButtons = document.querySelectorAll(this.options.selectors.toggleButton);
        toggleButtons.forEach(button => {
            const theme = this.themes.get(currentTheme);
            if (theme) {
                button.setAttribute('aria-label', `Switch to ${this.getNextTheme(currentTheme)} theme`);
                button.title = `Current theme: ${theme.label}`;
                
                // Update icon if button has one
                const icon = button.querySelector('.theme-icon');
                if (icon && theme.icon) {
                    icon.textContent = theme.icon;
                }
            }
        });

        // Update theme options
        const themeOptions = document.querySelectorAll(this.options.selectors.themeOptions);
        themeOptions.forEach(option => {
            const optionTheme = option.getAttribute('data-theme');
            
            if (optionTheme === currentTheme) {
                Utils.dom.addClass(option, Constants.CLASSES.ACTIVE);
                option.setAttribute('aria-pressed', 'true');
            } else {
                Utils.dom.removeClass(option, Constants.CLASSES.ACTIVE);
                option.setAttribute('aria-pressed', 'false');
            }
        });

        // Update theme indicators
        const indicators = document.querySelectorAll(this.options.selectors.themeIndicator);
        indicators.forEach(indicator => {
            const theme = this.themes.get(currentTheme);
            if (theme) {
                indicator.textContent = theme.label;
                indicator.setAttribute('data-current-theme', currentTheme);
            }
        });
    }

    /**
     * Get next theme in toggle sequence
     * @param {string} currentTheme - Current theme
     * @returns {string} Next theme name
     */
    getNextTheme(currentTheme) {
        const toggleOrder = ['light', 'dark'];
        const currentIndex = toggleOrder.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % toggleOrder.length;
        return toggleOrder[nextIndex];
    }

    /**
     * Get user preferences
     * @returns {Object} User preferences
     */
    getUserPreferences() {
        try {
            const prefs = localStorage.getItem(Constants.CONFIG.STORAGE_KEYS.USER_PREFERENCES);
            return prefs ? JSON.parse(prefs) : {};
        } catch (error) {
            console.error('Error getting user preferences:', error);
            return {};
        }
    }

    /**
     * Add theme observer
     * @param {Function} callback - Observer callback
     * @returns {Function} Unsubscribe function
     */
    addObserver(callback) {
        this.observers.add(callback);
        
        // Return unsubscribe function
        return () => {
            this.observers.delete(callback);
        };
    }

    /**
     * Notify all observers of theme change
     * @param {string} themeName - Theme name
     * @param {Object} themeObj - Theme object
     */
    notifyObservers(themeName, themeObj) {
        this.observers.forEach(callback => {
            try {
                callback(themeName, themeObj);
            } catch (error) {
                console.error('Error in theme observer:', error);
            }
        });
    }

    /**
     * Register a custom theme
     * @param {Object} themeConfig - Theme configuration
     */
    registerTheme(themeConfig) {
        if (!themeConfig.name) {
            console.error('Theme name is required');
            return;
        }

        this.themes.set(themeConfig.name, {
            label: themeConfig.name,
            icon: '🎨',
            cssClass: `theme-${themeConfig.name}`,
            ...themeConfig
        });

        this.emit('themeRegistered', { theme: themeConfig });
    }

    /**
     * Unregister a theme
     * @param {string} themeName - Theme name
     */
    unregisterTheme(themeName) {
        if (this.themes.has(themeName)) {
            this.themes.delete(themeName);
            this.emit('themeUnregistered', { theme: themeName });
        }
    }

    /**
     * Get available themes
     * @returns {Array} Available themes
     */
    getAvailableThemes() {
        return Array.from(this.themes.values());
    }

    /**
     * Get current theme info
     * @returns {Object} Current theme object
     */
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            theme: this.themes.get(this.currentTheme),
            resolved: this.resolveTheme(this.themes.get(this.currentTheme))
        };
    }

    /**
     * Check if theme is available
     * @param {string} themeName - Theme name
     * @returns {boolean} Is available
     */
    isThemeAvailable(themeName) {
        return this.themes.has(themeName);
    }

    /**
     * Get system theme preference
     * @returns {string} System theme
     */
    getSystemTheme() {
        return this.systemTheme;
    }

    /**
     * Component cleanup
     */
    async onDestroy() {
        // Remove media query listener
        if (this.mediaQuery) {
            this.mediaQuery.removeEventListener('change', this.handleSystemPreferenceChange);
        }

        // Clear observers
        this.observers.clear();

        // Remove global listeners
        eventBus.off('theme:change', this.setTheme);
        eventBus.off('theme:toggle', this.toggleTheme);
        eventBus.off('theme:reset', this.resetTheme);
        eventBus.off(Constants.EVENTS.USER_LOGIN, this.handleUserLogin);
        eventBus.off('preferences:loaded', this.handlePreferencesLoaded);

        // Remove transition styles
        const transitionStyle = document.getElementById('theme-transitions');
        if (transitionStyle) {
            transitionStyle.remove();
        }
    }
}

// Create global theme controller instance
const themeController = new ThemeController({
    defaultTheme: Config.ui.theme.default,
    themes: Config.ui.theme.options,
    systemPreference: true,
    transitions: Config.ui.animations.enabled
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ThemeController, themeController };
} else {
    // Make available globally
    window.ThemeController = ThemeController;
    window.themeController = themeController;
    
    // Global convenience functions
    window.theme = {
        set: (theme) => themeController.setTheme(theme),
        toggle: () => themeController.toggleTheme(),
        get: () => themeController.getCurrentTheme(),
        reset: () => themeController.resetTheme(),
        observe: (callback) => themeController.addObserver(callback)
    };
}
