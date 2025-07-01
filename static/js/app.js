/**
 * Main Application Controller
 * Code with Morais - Application Orchestration System
 * 
 * This is the central controller that coordinates all application modules,
 * manages initialization sequences, and provides global state management.
 */

// Prevent redeclaration
if (typeof window.App === 'undefined') {

class App {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        this.modules = new Map();
        this.moduleStates = new Map();
        this.globalState = {
            user: null,
            theme: 'dark',
            currentLesson: null,
            isOnline: navigator.onLine,
            performanceMetrics: {},
            lastActivity: Date.now()
        };
        
        // Event bus for inter-module communication
        this.eventBus = null;
        
        // Configuration
        this.config = null;
        
        // Performance tracking
        this.performanceStart = performance.now();
        
        // Bind methods
        this.handleError = this.handleError.bind(this);
        this.handleOnlineStatus = this.handleOnlineStatus.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        
        console.log('🚀 Code with Morais App Controller initialized');
    }
    
    /**
     * Initialize the application
     * This is the main entry point that orchestrates all modules
     */
    async init() {
        try {
            console.log('🎯 Starting application initialization...');
            
            // Set up global error handling
            this.setupGlobalErrorHandling();
            
            // Set up environment detection and monitoring
            this.setupEnvironmentMonitoring();
            
            // Load core dependencies first
            await this.loadCoreDependencies();
            
            // Initialize modules in dependency order
            await this.initializeModules();
            
            // Set up inter-module communication
            this.setupModuleCommunication();
            
            // Final setup and validation
            await this.finalizeInitialization();
            
            this.initialized = true;
            
            const initTime = performance.now() - this.performanceStart;
            console.log(`✅ Application initialized successfully in ${initTime.toFixed(2)}ms`);
            
            // Emit app ready event
            this.eventBus?.emit('app:ready', {
                version: this.version,
                initTime,
                modules: Array.from(this.modules.keys())
            });
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            this.handleError(error, 'INIT_FAILED');
            throw error;
        }
    }
    
    /**
     * Load core dependencies
     */
    async loadCoreDependencies() {
        console.log('📦 Loading core dependencies...');
        
        // Ensure EventBus is available
        if (typeof window.EventBus !== 'undefined') {
            this.eventBus = new window.EventBus();
            console.log('✅ EventBus initialized');
        } else {
            throw new Error('EventBus not available');
        }
        
        // Ensure Config is available
        if (typeof window.Config !== 'undefined') {
            this.config = window.Config;
            console.log('✅ Config loaded');
        } else {
            throw new Error('Config not available');
        }
        
        // Load editor configuration if available
        if (typeof EditorConfig !== 'undefined') {
            console.log('✅ EditorConfig available');
        }
    }
    
    /**
     * Initialize modules in proper dependency order
     */
    async initializeModules() {
        console.log('🔧 Initializing application modules...');
        
        const moduleInitOrder = [
            'themeManager',
            'authManager', 
            'navigationManager',
            'editorService',
            'quizEngine',
            'progressTracker',
            'performanceMonitor'
        ];
        
        for (const moduleName of moduleInitOrder) {
            await this.initializeModule(moduleName);
        }
        
        console.log('✅ All modules initialized');
    }
    
    /**
     * Initialize a specific module
     */
    async initializeModule(moduleName) {
        try {
            console.log(`🔧 Initializing ${moduleName}...`);
            
            let moduleInstance = null;
            
            switch (moduleName) {
                case 'themeManager':
                    if (typeof ThemeManager !== 'undefined') {
                        moduleInstance = new ThemeManager();
                        this.globalState.theme = moduleInstance.currentTheme;
                    }
                    break;
                    
                case 'authManager':
                    if (typeof AuthManager !== 'undefined') {
                        moduleInstance = new AuthManager();
                        // Listen for auth changes
                        this.eventBus.on('auth:login', (userData) => {
                            this.globalState.user = userData;
                        });
                        this.eventBus.on('auth:logout', () => {
                            this.globalState.user = null;
                        });
                    }
                    break;
                    
                case 'navigationManager':
                    if (typeof NavigationManager !== 'undefined') {
                        moduleInstance = new NavigationManager();
                    }
                    break;
                    
                case 'editorService':
                    if (typeof EditorService !== 'undefined') {
                        moduleInstance = new EditorService();
                    }
                    break;
                    
                case 'quizEngine':
                    if (typeof QuizEngine !== 'undefined') {
                        moduleInstance = new QuizEngine();
                    }
                    break;
                    
                case 'progressTracker':
                    if (typeof ProgressTracker !== 'undefined') {
                        moduleInstance = new ProgressTracker();
                    }
                    break;
                    
                case 'performanceMonitor':
                    if (typeof PerformanceMonitor !== 'undefined') {
                        moduleInstance = new PerformanceMonitor();
                    }
                    break;
                    
                default:
                    console.warn(`⚠️ Unknown module: ${moduleName}`);
                    return;
            }
            
            if (moduleInstance) {
                this.modules.set(moduleName, moduleInstance);
                this.moduleStates.set(moduleName, 'initialized');
                console.log(`✅ ${moduleName} initialized successfully`);
            } else {
                console.warn(`⚠️ ${moduleName} class not available, skipping...`);
                this.moduleStates.set(moduleName, 'unavailable');
            }
            
        } catch (error) {
            console.error(`❌ Failed to initialize ${moduleName}:`, error);
            this.moduleStates.set(moduleName, 'failed');
            this.handleError(error, `MODULE_INIT_FAILED:${moduleName}`);
        }
    }
    
    /**
     * Set up communication between modules
     */
    setupModuleCommunication() {
        console.log('🔗 Setting up inter-module communication...');
        
        // Theme changes
        this.eventBus.on('theme:changed', (theme) => {
            this.globalState.theme = theme;
            this.broadcastGlobalStateChange('theme', theme);
        });
        
        // Lesson navigation
        this.eventBus.on('lesson:start', (lessonData) => {
            this.globalState.currentLesson = lessonData;
            this.updateLastActivity();
        });
        
        this.eventBus.on('lesson:complete', (lessonData) => {
            this.globalState.currentLesson = null;
            this.updateLastActivity();
        });
        
        // Performance monitoring
        this.eventBus.on('performance:metric', (metric) => {
            this.globalState.performanceMetrics[metric.name] = metric.value;
        });
        
        // Activity tracking
        this.eventBus.on('user:activity', () => {
            this.updateLastActivity();
        });
        
        console.log('✅ Inter-module communication established');
    }
    
    /**
     * Finalize initialization
     */
    async finalizeInitialization() {
        console.log('🎯 Finalizing application setup...');
        
        // Validate critical modules
        const criticalModules = ['themeManager', 'authManager'];
        const failedCritical = criticalModules.filter(module => 
            this.moduleStates.get(module) === 'failed'
        );
        
        if (failedCritical.length > 0) {
            throw new Error(`Critical modules failed: ${failedCritical.join(', ')}`);
        }
        
        // Set up page visibility handling
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Set up online/offline detection
        window.addEventListener('online', this.handleOnlineStatus);
        window.addEventListener('offline', this.handleOnlineStatus);
        
        // Set up activity tracking
        this.setupActivityTracking();
        
        // Initialize page-specific functionality
        await this.initializePageSpecific();
        
        console.log('✅ Application finalization complete');
    }
    
    /**
     * Initialize page-specific functionality
     */
    async initializePageSpecific() {
        const pathname = window.location.pathname;
        
        try {
            if (pathname.includes('/lesson/')) {
                await this.initializeLessonPage();
            } else if (pathname.includes('/dashboard')) {
                await this.initializeDashboardPage();
            } else if (pathname.includes('/quiz/')) {
                await this.initializeQuizPage();
            }
        } catch (error) {
            console.warn('⚠️ Page-specific initialization failed:', error);
        }
    }
    
    /**
     * Initialize lesson page
     */
    async initializeLessonPage() {
        console.log('📚 Initializing lesson page...');
        
        const editorService = this.getModule('editorService');
        if (editorService && editorService.initialized) {
            // Initialize editors for lesson page elements
            const codeEditorContainers = document.querySelectorAll('.code-editor-container, .ace-editor');
            for (const container of codeEditorContainers) {
                try {
                    const editorId = container.id || `editor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    if (!container.id) container.id = editorId;
                    await editorService.createEditor(editorId, {
                        language: container.dataset.language || 'python',
                        theme: container.dataset.theme || 'github',
                        readOnly: container.dataset.readonly === 'true',
                        code: container.dataset.code || ''
                    });
                    console.log(`✅ Editor initialized: ${editorId}`);
                } catch (error) {
                    console.warn(`⚠️ Failed to initialize editor for container:`, error);
                }
            }
        } else {
            console.warn('⚠️ EditorService not available or not initialized');
        }
        
        this.eventBus.emit('page:lesson:ready');
    }
    
    /**
     * Initialize dashboard page
     */
    async initializeDashboardPage() {
        console.log('📊 Initializing dashboard page...');
        
        const progressTracker = this.getModule('progressTracker');
        if (progressTracker) {
            await progressTracker.loadUserProgress();
        }
        
        this.eventBus.emit('page:dashboard:ready');
    }
    
    /**
     * Initialize quiz page
     */
    async initializeQuizPage() {
        console.log('❓ Initializing quiz page...');
        
        const quizEngine = this.getModule('quizEngine');
        if (quizEngine) {
            await quizEngine.initializeForPage();
        }
        
        this.eventBus.emit('page:quiz:ready');
    }
    
    /**
     * Set up global error handling
     */
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'GLOBAL_ERROR');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'UNHANDLED_PROMISE');
        });
    }
    
    /**
     * Set up environment monitoring
     */
    setupEnvironmentMonitoring() {
        // Monitor network status
        this.globalState.isOnline = navigator.onLine;
        
        // Monitor performance
        if ('performance' in window) {
            this.globalState.performanceMetrics.navigation = performance.getEntriesByType('navigation')[0];
        }
    }
    
    /**
     * Set up activity tracking
     */
    setupActivityTracking() {
        const activityEvents = ['click', 'keydown', 'scroll', 'mousemove'];
        
        let activityTimeout;
        const trackActivity = () => {
            this.updateLastActivity();
            
            clearTimeout(activityTimeout);
            activityTimeout = setTimeout(() => {
                this.eventBus.emit('user:idle');
            }, 300000); // 5 minutes of inactivity
        };
        
        activityEvents.forEach(event => {
            document.addEventListener(event, trackActivity, { passive: true });
        });
    }
    
    /**
     * Handle errors
     */
    handleError(error, context = 'UNKNOWN') {
        console.error(`❌ [${context}] Error:`, error);
        
        // Emit error event for modules to handle
        this.eventBus?.emit('app:error', {
            error,
            context,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
        
        // Log to analytics if available
        if (this.config?.analytics?.enabled) {
            // Track error in analytics
        }
    }
    
    /**
     * Handle online/offline status
     */
    handleOnlineStatus() {
        const isOnline = navigator.onLine;
        if (this.globalState.isOnline !== isOnline) {
            this.globalState.isOnline = isOnline;
            this.eventBus.emit('app:network', { isOnline });
            console.log(isOnline ? '🌐 Back online' : '📴 Gone offline');
        }
    }
    
    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.eventBus.emit('app:hidden');
        } else {
            this.eventBus.emit('app:visible');
            this.updateLastActivity();
        }
    }
    
    /**
     * Update last activity timestamp
     */
    updateLastActivity() {
        this.globalState.lastActivity = Date.now();
    }
    
    /**
     * Broadcast global state changes
     */
    broadcastGlobalStateChange(key, value) {
        this.eventBus.emit('app:state:change', { key, value, state: this.globalState });
    }
    
    /**
     * Get a module instance
     */
    getModule(moduleName) {
        return this.modules.get(moduleName);
    }
    
    /**
     * Get module state
     */
    getModuleState(moduleName) {
        return this.moduleStates.get(moduleName);
    }
    
    /**
     * Get global state
     */
    getGlobalState() {
        return { ...this.globalState };
    }
    
    /**
     * Update global state
     */
    updateGlobalState(updates) {
        Object.assign(this.globalState, updates);
        this.eventBus.emit('app:state:update', this.globalState);
    }
    
    /**
     * Get application status
     */
    getStatus() {
        return {
            version: this.version,
            initialized: this.initialized,
            modules: Object.fromEntries(this.moduleStates),
            globalState: this.globalState,
            uptime: Date.now() - this.performanceStart
        };
    }
    
    /**
     * Destroy the application (cleanup)
     */
    destroy() {
        console.log('🧹 Cleaning up application...');
        
        // Clean up event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('online', this.handleOnlineStatus);
        window.removeEventListener('offline', this.handleOnlineStatus);
        
        // Destroy modules
        for (const [name, module] of this.modules) {
            if (module && typeof module.destroy === 'function') {
                try {
                    module.destroy();
                    console.log(`✅ ${name} destroyed`);
                } catch (error) {
                    console.error(`❌ Failed to destroy ${name}:`, error);
                }
            }
        }
        
        // Clear state
        this.modules.clear();
        this.moduleStates.clear();
        
        console.log('✅ Application cleanup complete');
    }
}

// Create global app instance
window.App = App;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}

} else {
    console.log('ℹ️ App class already exists, skipping redeclaration');
}
