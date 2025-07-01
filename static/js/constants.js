/**
 * Application Constants
 * Centralized configuration values, API endpoints, UI selectors, and event names
 */

// Prevent redeclaration errors on multiple script loads
if (typeof window.Constants === 'undefined') {
    console.log('🔧 Initializing Constants...');
    
    window.Constants = {
        // API Configuration
        API: {
            BASE_URL: '/api',
            ENDPOINTS: {
            // Authentication
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout',
            REGISTER: '/auth/register',
            PROFILE: '/auth/profile',
            
            // Lessons
            LESSONS: '/lessons',
            LESSON_DETAIL: '/lessons/{id}',
            LESSON_PROGRESS: '/lessons/{id}/progress',
            LESSON_COMPLETE: '/lessons/{id}/complete',
            
            // Challenges
            CHALLENGES: '/challenges',
            CHALLENGE_SUBMIT: '/challenges/{id}/submit',
            DAILY_CHALLENGE: '/challenges/daily',
            
            // Quizzes
            QUIZZES: '/quizzes',
            QUIZ_SUBMIT: '/quizzes/{id}/submit',
            QUIZ_RESULTS: '/quizzes/{id}/results',
            
            // Dashboard
            DASHBOARD: '/dashboard',
            DASHBOARD_STATS: '/dashboard/stats',
            DASHBOARD_RECENT: '/dashboard/recent',
            
            // User Activities
            ACTIVITIES: '/activities',
            ACTIVITY_LOG: '/activities/log'
        },
        
        // HTTP Methods
        METHODS: {
            GET: 'GET',
            POST: 'POST',
            PUT: 'PUT',
            DELETE: 'DELETE',
            PATCH: 'PATCH'
        },
        
        // Request timeouts (in milliseconds)
        TIMEOUTS: {
            DEFAULT: 5000,
            UPLOAD: 30000,
            LONG_RUNNING: 60000
        },
        
        // Status codes
        STATUS_CODES: {
            OK: 200,
            CREATED: 201,
            NO_CONTENT: 204,
            BAD_REQUEST: 400,
            UNAUTHORIZED: 401,
            FORBIDDEN: 403,
            NOT_FOUND: 404,
            INTERNAL_ERROR: 500
        }
    },

    // UI Selectors
    SELECTORS: {
        // Layout
        HEADER: '.header',
        SIDEBAR: '.sidebar',
        MAIN_CONTENT: '.main-content',
        FOOTER: '.footer',
        
        // Navigation
        NAV_MENU: '.nav-menu',
        NAV_ITEM: '.nav-item',
        NAV_LINK: '.nav-link',
        BREADCRUMB: '.breadcrumb',
        
        // Authentication
        LOGIN_FORM: '#login-form',
        REGISTER_FORM: '#register-form',
        LOGOUT_BTN: '#logout-btn',
        
        // Dashboard
        DASHBOARD_CONTAINER: '#dashboard-container',
        STATS_GRID: '.stats-grid',
        RECENT_ACTIVITIES: '.recent-activities',
        PROGRESS_CHART: '#progress-chart',
        
        // Lessons
        LESSON_LIST: '.lesson-list',
        LESSON_CARD: '.lesson-card',
        LESSON_CONTENT: '.lesson-content',
        LESSON_NAVIGATION: '.lesson-navigation',
        LESSON_PROGRESS: '.lesson-progress',
        NEXT_LESSON_BTN: '.next-lesson-btn',
        PREV_LESSON_BTN: '.prev-lesson-btn',
        
        // Challenges
        CHALLENGE_CONTAINER: '.challenge-container',
        CHALLENGE_FORM: '.challenge-form',
        CHALLENGE_SUBMIT: '.challenge-submit-btn',
        CHALLENGE_HINT: '.challenge-hint',
        
        // Quizzes
        QUIZ_CONTAINER: '.quiz-container',
        QUIZ_QUESTION: '.quiz-question',
        QUIZ_OPTIONS: '.quiz-options',
        QUIZ_SUBMIT: '.quiz-submit-btn',
        QUIZ_RESULTS: '.quiz-results',
        
        // Modals
        MODAL: '.modal',
        MODAL_OVERLAY: '.modal-overlay',
        MODAL_CONTENT: '.modal-content',
        MODAL_CLOSE: '.modal-close',
        
        // Forms
        FORM_GROUP: '.form-group',
        FORM_INPUT: '.form-input',
        FORM_LABEL: '.form-label',
        FORM_ERROR: '.form-error',
        FORM_SUCCESS: '.form-success',
        
        // Buttons
        PRIMARY_BTN: '.btn-primary',
        SECONDARY_BTN: '.btn-secondary',
        DANGER_BTN: '.btn-danger',
        LOADING_BTN: '.btn-loading',
        
        // Notifications
        NOTIFICATION: '.notification',
        ALERT: '.alert',
        TOAST: '.toast',
        
        // Loading states
        LOADING_SPINNER: '.loading-spinner',
        SKELETON_LOADER: '.skeleton-loader'
    },

    // CSS Classes
    CLASSES: {
        // State classes
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        LOADING: 'loading',
        DISABLED: 'disabled',
        HIDDEN: 'hidden',
        VISIBLE: 'visible',
        SELECTED: 'selected',
        
        // Animation classes
        FADE_IN: 'fade-in',
        FADE_OUT: 'fade-out',
        SLIDE_IN: 'slide-in',
        SLIDE_OUT: 'slide-out',
        
        // Theme classes
        DARK_MODE: 'dark-mode',
        LIGHT_MODE: 'light-mode',
        
        // Size classes
        SMALL: 'small',
        MEDIUM: 'medium',
        LARGE: 'large',
        
        // Status classes
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },

    // Event Names
    EVENTS: {
        // Application lifecycle
        APP_INIT: 'app:init',
        APP_READY: 'app:ready',
        APP_ERROR: 'app:error',
        
        // Authentication events
        USER_LOGIN: 'user:login',
        USER_LOGOUT: 'user:logout',
        USER_REGISTER: 'user:register',
        AUTH_ERROR: 'auth:error',
        
        // Navigation events
        ROUTE_CHANGE: 'route:change',
        PAGE_LOAD: 'page:load',
        PAGE_UNLOAD: 'page:unload',
        
        // Lesson events
        LESSON_START: 'lesson:start',
        LESSON_COMPLETE: 'lesson:complete',
        LESSON_PROGRESS: 'lesson:progress',
        LESSON_ERROR: 'lesson:error',
        
        // Challenge events
        CHALLENGE_START: 'challenge:start',
        CHALLENGE_SUBMIT: 'challenge:submit',
        CHALLENGE_COMPLETE: 'challenge:complete',
        CHALLENGE_ERROR: 'challenge:error',
        
        // Quiz events
        QUIZ_START: 'quiz:start',
        QUIZ_ANSWER: 'quiz:answer',
        QUIZ_SUBMIT: 'quiz:submit',
        QUIZ_COMPLETE: 'quiz:complete',
        
        // UI events
        MODAL_OPEN: 'modal:open',
        MODAL_CLOSE: 'modal:close',
        NOTIFICATION_SHOW: 'notification:show',
        NOTIFICATION_HIDE: 'notification:hide',
        
        // Data events
        DATA_FETCH: 'data:fetch',
        DATA_UPDATE: 'data:update',
        DATA_ERROR: 'data:error',
        
        // Form events
        FORM_SUBMIT: 'form:submit',
        FORM_VALIDATE: 'form:validate',
        FORM_ERROR: 'form:error',
        FORM_SUCCESS: 'form:success'
    },

    // Application Configuration
    CONFIG: {
        // App metadata
        APP_NAME: 'Coding with Marco',
        VERSION: '1.0.0',
        
        // Feature flags
        FEATURES: {
            DARK_MODE: true,
            NOTIFICATIONS: true,
            OFFLINE_MODE: false,
            ANALYTICS: true
        },
        
        // Timing configurations
        TIMING: {
            NOTIFICATION_DURATION: 5000,
            AUTO_SAVE_INTERVAL: 30000,
            SESSION_TIMEOUT: 3600000, // 1 hour
            DEBOUNCE_DELAY: 300,
            THROTTLE_LIMIT: 1000
        },
        
        // Pagination
        PAGINATION: {
            DEFAULT_PAGE_SIZE: 20,
            MAX_PAGE_SIZE: 100,
            LESSONS_PER_PAGE: 12,
            ACTIVITIES_PER_PAGE: 10
        },
        
        // Validation rules
        VALIDATION: {
            PASSWORD_MIN_LENGTH: 8,
            USERNAME_MIN_LENGTH: 3,
            USERNAME_MAX_LENGTH: 30,
            EMAIL_MAX_LENGTH: 254
        },
        
        // Storage keys
        STORAGE_KEYS: {
            USER_TOKEN: 'cwm_user_token',
            USER_PREFERENCES: 'cwm_user_prefs',
            LESSON_PROGRESS: 'cwm_lesson_progress',
            THEME: 'cwm_theme',
            LANGUAGE: 'cwm_language'
        },
        
        // Default values
        DEFAULTS: {
            THEME: 'light',
            LANGUAGE: 'en',
            TIMEZONE: 'UTC',
            DATE_FORMAT: 'MM/DD/YYYY',
            TIME_FORMAT: '12h'
        }
    },

    // Error Messages
    MESSAGES: {
        // General errors
        GENERIC_ERROR: 'An unexpected error occurred. Please try again.',
        NETWORK_ERROR: 'Network error. Please check your connection.',
        TIMEOUT_ERROR: 'Request timed out. Please try again.',
        
        // Authentication errors
        LOGIN_FAILED: 'Invalid username or password.',
        SESSION_EXPIRED: 'Your session has expired. Please log in again.',
        ACCESS_DENIED: 'Access denied. You do not have permission.',
        
        // Validation errors
        REQUIRED_FIELD: 'This field is required.',
        INVALID_EMAIL: 'Please enter a valid email address.',
        WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
        
        // Success messages
        LOGIN_SUCCESS: 'Successfully logged in!',
        LOGOUT_SUCCESS: 'Successfully logged out!',
        SAVE_SUCCESS: 'Changes saved successfully!',
        
        // Loading messages
        LOADING: 'Loading...',
        SAVING: 'Saving...',
        PROCESSING: 'Processing...'
    },

    // Regular Expressions
    REGEX: {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE: /^\+?[\d\s-()]+$/,
        URL: /^https?:\/\/.+/,
        STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        USERNAME: /^[a-zA-Z0-9_-]+$/,
        SLUG: /^[a-z0-9-]+$/
    }
};

// Freeze the constants to prevent modification
Object.freeze(Constants);
Object.freeze(Constants.API);
Object.freeze(Constants.SELECTORS);
Object.freeze(Constants.CLASSES);
Object.freeze(Constants.EVENTS);
    Object.freeze(window.Constants.CONFIG);
    Object.freeze(window.Constants.MESSAGES);
    Object.freeze(window.Constants.REGEX);

    // Export for module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.Constants;
    }
    
    console.log('✅ Constants created successfully');
} else {
    console.log('ℹ️ Constants already exists, skipping redeclaration');
}

// Always ensure Constants is available globally
if (!window.Constants) {
    console.error('❌ Constants failed to initialize properly');
} else {
    console.log('✅ Constants is available globally');
}
