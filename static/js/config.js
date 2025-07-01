/**
 * Application Configuration
 * Environment-specific settings and runtime configuration
 */

// Prevent redeclaration errors on multiple script loads
if (typeof window.Config === 'undefined') {
    console.log('🔧 Initializing Config object...');
    
    window.Config = {
        // Environment Detection
        environment: (function() {
            // Check if we're in development mode
            const hostname = window.location.hostname;
            const isDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev');
            const isProduction = hostname.includes('codingwithmarco') || !isDev;
            
            return {
                isDevelopment: isDev,
                isProduction: isProduction,
                current: isDev ? 'development' : 'production'
            };
        })(),

        // API Configuration
        api: {
            // Base URL configuration
            getBaseUrl() {
                const hostname = window.location.hostname;
                const isDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev');
                return window.location.origin;
            },
        
        // Request configuration
        timeout: 10000,
        retryAttempts: 3,
        retryDelay: 1000,
        
        // Headers
        defaultHeaders: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    },

    // Feature Flags
    features: {
        // Core features
        authentication: true,
        registration: true,
        passwordReset: true,
        
        // Learning features
        lessons: true,
        challenges: true,
        quizzes: true,
        progressTracking: true,
        
        // Social features
        comments: false,
        sharing: false,
        leaderboards: false,
        
        // Advanced features
        darkMode: true,
        notifications: true,
        offlineMode: false,
        analytics: true,
        
        // Admin features
        adminPanel: false,
        contentManagement: false,
        userManagement: false
    },

    // UI Configuration
    ui: {
        // Theme settings
        theme: {
            default: 'light',
            options: ['light', 'dark', 'auto'],
            storageKey: 'cwm_theme'
        },
        
        // Animation settings
        animations: {
            enabled: true,
            duration: 300,
            easing: 'ease-in-out'
        },
        
        // Responsive breakpoints
        breakpoints: {
            mobile: 768,
            tablet: 1024,
            desktop: 1200,
            wide: 1400
        },
        
        // Loading states
        loading: {
            spinnerDelay: 200,
            minimumDuration: 500,
            skeletonEnabled: true
        },
        
        // Notifications
        notifications: {
            position: 'top-right',
            duration: 5000,
            maxVisible: 5,
            autoClose: true
        }
    },

    // Performance Settings
    performance: {
        // Lazy loading
        lazyLoading: {
            enabled: true,
            threshold: 100,
            rootMargin: '50px'
        },
        
        // Debounce settings
        debounce: {
            search: 300,
            input: 500,
            scroll: 100,
            resize: 250
        },
        
        // Caching
        cache: {
            enabled: true,
            ttl: 300000, // 5 minutes
            maxSize: 100,
            storageType: 'sessionStorage'
        },
        
        // Virtual scrolling
        virtualScrolling: {
            enabled: false,
            itemHeight: 50,
            overscan: 5
        }
    },

    // Security Settings
    security: {
        // Session management
        session: {
            timeout: 3600000, // 1 hour
            warningTime: 300000, // 5 minutes before timeout
            renewThreshold: 600000 // Renew if less than 10 minutes left
        },
        
        // CSRF protection
        csrf: {
            enabled: true,
            headerName: 'X-CSRF-Token'
        },
        
        // Content Security Policy
        csp: {
            enforced: false, // Will be set after initialization
            reportOnly: true // Will be set after initialization
        }
    },

    // Storage Configuration
    storage: {
        // Local storage keys
        keys: {
            userToken: 'cwm_user_token',
            userProfile: 'cwm_user_profile',
            preferences: 'cwm_preferences',
            lessonProgress: 'cwm_lesson_progress',
            cache: 'cwm_cache'
        },
        
        // Storage quotas
        quotas: {
            localStorage: 5 * 1024 * 1024, // 5MB
            sessionStorage: 2 * 1024 * 1024, // 2MB
            indexedDB: 50 * 1024 * 1024 // 50MB
        },
        
        // Cleanup settings
        cleanup: {
            enabled: true,
            interval: 86400000, // 24 hours
            maxAge: 604800000 // 7 days
        }
    },

    // Analytics Configuration
    analytics: {
        enabled: false, // Will be set based on environment after initialization
        
        // Event tracking
        events: {
            pageViews: true,
            userActions: true,
            errors: true,
            performance: false
        },
        
        // Privacy settings
        privacy: {
            anonymizeIp: true,
            respectDoNotTrack: true,
            cookieConsent: true
        }
    },

    // Development Tools
    development: {
        // Debug settings
        debug: {
            enabled: false, // Will be set based on environment after initialization
            logLevel: 'info', // 'error', 'warn', 'info', 'debug'
            showPerformance: true,
            showReduxDevTools: false
        },
        
        // Hot reload
        hotReload: {
            enabled: false, // Will be set based on environment after initialization
            port: 3001
        },
        
        // Testing
        testing: {
            enabled: false,
            mockApi: false,
            fixtures: false
        }
    },

    // Validation Rules
    validation: {
        // Password requirements
        password: {
            minLength: 8,
            maxLength: 128,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            bannedPasswords: ['password', '123456', 'qwerty']
        },
        
        // Username requirements
        username: {
            minLength: 3,
            maxLength: 30,
            allowedChars: /^[a-zA-Z0-9_-]+$/,
            reservedNames: ['admin', 'root', 'api', 'www']
        },
        
        // Email validation
        email: {
            maxLength: 254,
            regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
    },

    // Localization
    localization: {
        defaultLocale: 'en-US',
        supportedLocales: ['en-US', 'es-ES', 'fr-FR'],
        fallbackLocale: 'en-US',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD'
    },

    // Error Handling
    errorHandling: {
        // Global error handler
        globalHandler: true,
        
        // Error reporting
        reporting: {
            enabled: false, // Will be set based on environment after initialization
            endpoint: '/api/errors',
            includeStackTrace: false, // Will be set based on environment after initialization
            maxReportsPerSession: 10
        },
        
        // Retry logic
        retry: {
            enabled: true,
            maxAttempts: 3,
            backoffFactor: 2,
            initialDelay: 1000
        }
    },

    // Utility Methods
    utils: {
        /**
         * Get feature flag value
         * @param {string} feature - Feature name
         * @returns {boolean} Feature enabled status
         */
        isFeatureEnabled(feature) {
            return this.features[feature] === true;
        },

        /**
         * Get API endpoint URL
         * @param {string} endpoint - Endpoint path
         * @returns {string} Full URL
         */
        getApiUrl(endpoint) {
            return `${this.api.getBaseUrl()}${endpoint}`;
        },

        /**
         * Get storage key with prefix
         * @param {string} key - Storage key
         * @returns {string} Prefixed key
         */
        getStorageKey(key) {
            return this.storage.keys[key] || `cwm_${key}`;
        },

        /**
         * Check if running in mobile viewport
         * @returns {boolean} Is mobile
         */
        isMobile() {
            return window.innerWidth <= this.ui.breakpoints.mobile;
        },

        /**
         * Check if running in tablet viewport
         * @returns {boolean} Is tablet
         */
        isTablet() {
            return window.innerWidth > this.ui.breakpoints.mobile && 
                   window.innerWidth <= this.ui.breakpoints.tablet;
        },

        /**
         * Check if running in desktop viewport
         * @returns {boolean} Is desktop
         */
        isDesktop() {
            return window.innerWidth > this.ui.breakpoints.tablet;
        },

        /**
         * Get current environment
         * @returns {string} Environment name
         */
        getEnvironment() {
            return this.environment.current;
        },

        /**
         * Update configuration at runtime
         * @param {string} path - Configuration path (dot notation)
         * @param {*} value - New value
         */
        set(path, value) {
            const keys = path.split('.');
            let current = this;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
        },

        /**
         * Get configuration value
         * @param {string} path - Configuration path (dot notation)
         * @param {*} defaultValue - Default value if not found
         * @returns {*} Configuration value
         */
        get(path, defaultValue = null) {
            const keys = path.split('.');
            let current = this;
            
            for (const key of keys) {
                if (current[key] === undefined) {
                    return defaultValue;
                }
                current = current[key];
            }
            
            return current;
        }
    }
};

// Bind utils methods to Config
Object.keys(Config.utils).forEach(method => {
    if (typeof Config.utils[method] === 'function') {
        Config[method] = Config.utils[method].bind(Config);
    }
});

// Initialize configuration based on environment
(function initializeConfig() {
    // Set debug level based on environment
    if (window.Config.environment.isDevelopment) {
        window.Config.development.debug.logLevel = 'debug';
        window.Config.api.timeout = 30000; // Longer timeout for development
    }
    
    // Load user preferences from storage
    try {
        const savedPrefs = localStorage.getItem(window.Config.storage.keys.preferences);
        if (savedPrefs) {
            const preferences = JSON.parse(savedPrefs);
            
            // Apply saved theme
            if (preferences.theme) {
                window.Config.ui.theme.default = preferences.theme;
            }
            
            // Apply other preferences as needed
        }
    } catch (error) {
        console.warn('Could not load user preferences:', error);
    }
})();

// Freeze configuration to prevent accidental modification
Object.freeze(Config.features);
    // Post-initialization: Fix circular references and set environment-based values
    window.Config.analytics.enabled = window.Config.environment.isProduction;
    window.Config.development.debug.enabled = window.Config.environment.isDevelopment;
    window.Config.development.hotReload.enabled = window.Config.environment.isDevelopment;
    window.Config.errorHandling.reporting.enabled = window.Config.environment.isProduction;
    window.Config.errorHandling.reporting.includeStackTrace = window.Config.environment.isDevelopment;
    window.Config.security.csp.enforced = window.Config.environment.isProduction;
    window.Config.security.csp.reportOnly = window.Config.environment.isDevelopment;
    
    // Freeze objects for immutability
    Object.freeze(window.Config.environment);
    Object.freeze(window.Config.api);
    Object.freeze(window.Config.features);
    Object.freeze(window.Config.ui);
    Object.freeze(window.Config.security);
    Object.freeze(window.Config.storage);
    Object.freeze(window.Config.development);
    Object.freeze(window.Config.analytics);
    Object.freeze(window.Config.ui.breakpoints);
    Object.freeze(window.Config.storage.keys);
    Object.freeze(window.Config.validation);

    // Export for module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.Config;
    }
    
    console.log('✅ Config object created and frozen successfully');
} else {
    console.log('ℹ️ Config already exists, skipping redeclaration');
}

// Always ensure Config is available globally
if (!window.Config) {
    console.error('❌ Config failed to initialize properly');
} else {
    console.log('✅ Config is available globally');
}
