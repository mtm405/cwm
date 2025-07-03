/**
 * Core Constants Module - ES6
 * Code with Morais - Application Constants
 */

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

// Event Types
export const EVENTS = {
    // Authentication Events
    AUTH_LOGIN: 'auth:login',
    AUTH_LOGOUT: 'auth:logout',
    AUTH_TOKEN_REFRESH: 'auth:token-refresh',
    AUTH_ERROR: 'auth:error',
    
    // Lesson Events
    LESSON_LOADED: 'lesson:loaded',
    LESSON_PROGRESS_UPDATED: 'lesson:progress-updated',
    LESSON_COMPLETED: 'lesson:completed',
    LESSON_ERROR: 'lesson:error',
    
    // UI Events
    THEME_CHANGED: 'ui:theme-changed',
    MODAL_OPENED: 'ui:modal-opened',
    MODAL_CLOSED: 'ui:modal-closed',
    NOTIFICATION_SHOW: 'ui:notification-show',
    
    // System Events
    SYSTEM_READY: 'system:ready',
    SYSTEM_ERROR: 'system:error',
    NETWORK_STATUS_CHANGED: 'system:network-status-changed'
};

// CSS Classes
export const CSS_CLASSES = {
    // States
    ACTIVE: 'active',
    DISABLED: 'disabled',
    LOADING: 'loading',
    ERROR: 'error',
    SUCCESS: 'success',
    
    // Themes
    THEME_DARK: 'theme-dark',
    THEME_LIGHT: 'theme-light',
    
    // Components
    MODAL_OVERLAY: 'modal-overlay',
    MODAL_CONTENT: 'modal-content',
    TOAST_CONTAINER: 'toast-container',
    
    // Lesson System
    LESSON_CONTAINER: 'lesson-container',
    LESSON_CONTENT: 'lesson-content',
    LESSON_NAVIGATION: 'lesson-navigation',
    
    // Dashboard
    DASHBOARD_CONTAINER: 'dashboard-container',
    STAT_CARD: 'stat-card-modern',
    TAB_PANE: 'tab-pane'
};

// API Endpoints
export const API_ENDPOINTS = {
    // Authentication
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    
    // Lessons
    LESSONS: '/api/lessons',
    LESSON_DETAIL: '/api/lesson/{id}',
    LESSON_PROGRESS: '/api/lesson/progress/{id}',
    COMPLETE_LESSON: '/api/lesson/complete',
    
    // Dashboard
    DASHBOARD_STATS: '/api/dashboard/stats',
    DAILY_CHALLENGE: '/api/dashboard/challenge',
    LEADERBOARD: '/api/dashboard/leaderboard',
    
    // System
    SYSTEM_STATUS: '/api/system/status',
    SYSTEM_CONFIG: '/api/system/config'
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    AUTH_REQUIRED: 'Authentication required. Please log in.',
    ACCESS_DENIED: 'Access denied. You don\'t have permission.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    TIMEOUT_ERROR: 'Request timeout. Please try again.',
    UNKNOWN_ERROR: 'An unknown error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Login successful!',
    LOGOUT_SUCCESS: 'Logout successful!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    LESSON_COMPLETED: 'Lesson completed! Great job!',
    PROGRESS_SAVED: 'Progress saved successfully!',
    SETTINGS_SAVED: 'Settings saved successfully!'
};

// Timing Constants
export const TIMING = {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 3000,
    RETRY_DELAY: 1000,
    DEBOUNCE_DELAY: 500,
    AUTOSAVE_INTERVAL: 30000
};

// Storage Keys
export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data',
    THEME: 'cwm_theme',
    PREFERENCES: 'cwm_preferences',
    LESSON_CACHE: 'cwm_lesson_cache'
};

// Regular Expressions
export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    PHONE: /^\+?[\d\s\-\(\)]+$/
};

export default {
    HTTP_STATUS,
    EVENTS,
    CSS_CLASSES,
    API_ENDPOINTS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    TIMING,
    STORAGE_KEYS,
    REGEX
};
