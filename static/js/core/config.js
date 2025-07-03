/**
 * Core Configuration Module - ES6
 * Code with Morais - Application Configuration
 */

export const CONFIG = {
    // API Configuration
    API_BASE_URL: '/api',
    API_TIMEOUT: 10000,
    
    // Authentication
    AUTH_TOKEN_KEY: 'auth_token',
    AUTH_REFRESH_KEY: 'refresh_token',
    AUTH_USER_KEY: 'user_data',
    
    // Application Settings
    APP_NAME: 'Code with Morais',
    APP_VERSION: '1.0.0',
    DEBUG_MODE: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // Theme Configuration
    THEME_KEY: 'cwm_theme',
    DEFAULT_THEME: 'dark',
    
    // Lesson System
    LESSON_AUTOSAVE_INTERVAL: 30000, // 30 seconds
    LESSON_PROGRESS_BATCH_SIZE: 10,
    
    // Editor Configuration
    EDITOR_THEME: 'ace/theme/monokai',
    EDITOR_FONT_SIZE: 14,
    EDITOR_TAB_SIZE: 4,
    
    // Firebase Configuration
    FIREBASE_CONFIG: {
        // Firebase config will be injected by backend
    },
    
    // Performance Settings
    PERFORMANCE_MONITORING: true,
    ERROR_REPORTING: true,
    
    // Feature Flags
    FEATURES: {
        OFFLINE_SUPPORT: false,
        REAL_TIME_COLLABORATION: false,
        ADVANCED_ANALYTICS: true,
        GAMIFICATION: true,
        VOICE_COMMANDS: false
    }
};

export default CONFIG;
