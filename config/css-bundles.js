/**
 * CSS Splitting and Lazy Loading Configuration
 * Phase 3A.4: CSS Splitting and Lazy Loading
 * Code with Morais - Python Learning Platform
 */

// CSS Bundle Configuration
const CSS_BUNDLES = {
    // Critical CSS - Always loaded immediately
    critical: {
        files: [
            'static/css/main.css',
        ],
        priority: 'high',
        loadStrategy: 'blocking'
    },
    
    // Core CSS - Essential for all pages
    core: {
        files: [
            'static/css/base/reset.css',
            'static/css/base/variables.css',
            'static/css/base/layout.css',
            'static/css/components/header-modern.css',
            'static/css/components/buttons-enhanced.css'
        ],
        priority: 'high',
        loadStrategy: 'async'
    },
    
    // Page-specific CSS bundles
    dashboard: {
        files: [
            'static/css/components/dashboard-consolidated.css'
        ],
        priority: 'medium',
        loadStrategy: 'lazy',
        pages: ['dashboard', 'index']
    },
    
    lessons: {
        files: [
            'static/css/components/lesson.css',
            'static/css/components/lesson-block-types.css',
            'static/css/components/lesson-blocks-enhanced.css',
            'static/css/components/lesson-progress-enhanced.css',
            'static/css/components/lesson-content-blocks.css'
        ],
        priority: 'medium',
        loadStrategy: 'lazy',
        pages: ['lesson', 'lesson_new']
    },
    
    auth: {
        files: [
            'static/css/components/auth-enhanced.css',
            'static/css/components/modal.css'
        ],
        priority: 'medium',
        loadStrategy: 'lazy',
        pages: ['auth', 'login', 'register']
    },
    
    // UI Components - Can be loaded lazily
    ui: {
        files: [
            'static/css/components/skeleton.css',
            'static/css/components/responsive-enhancements.css'
        ],
        priority: 'low',
        loadStrategy: 'lazy'
    },
    
    // Utilities - Lowest priority
    utils: {
        files: [
            'static/css/utils/helpers.css',
            'static/css/utils/animations.css',
            'static/css/utils/responsive.css'
        ],
        priority: 'low',
        loadStrategy: 'lazy'
    }
};

// CSS Loading Strategies
const CSS_LOAD_STRATEGIES = {
    blocking: 'link[rel="stylesheet"]',
    async: 'link[rel="preload"][as="style"]',
    lazy: 'dynamic-import'
};

// Page-specific CSS mapping
const PAGE_CSS_MAPPING = {
    'dashboard': ['critical', 'core', 'dashboard', 'ui'],
    'index': ['critical', 'core', 'dashboard', 'ui'],
    'lesson': ['critical', 'core', 'lessons', 'ui'],
    'lesson_new': ['critical', 'core', 'lessons', 'ui'],
    'auth': ['critical', 'core', 'auth', 'ui'],
    'login': ['critical', 'core', 'auth'],
    'register': ['critical', 'core', 'auth'],
    'profile': ['critical', 'core', 'ui', 'utils'],
    'default': ['critical', 'core', 'ui']
};

export { CSS_BUNDLES, CSS_LOAD_STRATEGIES, PAGE_CSS_MAPPING };
