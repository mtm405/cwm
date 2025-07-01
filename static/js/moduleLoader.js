/**
 * Module Loader - Dynamic module loading and dependency management
 * Code with Morais - Module Loading System
 * 
 * This system handles dynamic loading of JavaScript modules, manages dependencies,
 * provides error handling, and ensures proper initialization order.
 */

class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        this.dependencies = new Map();
        this.loadOrder = [];
        this.baseUrl = this.getBaseUrl();
        this.retryCount = 3;
        this.retryDelay = 1000; // ms
        
        console.log('📦 ModuleLoader initialized');
    }
    
    /**
     * Get base URL for module loading
     */
    getBaseUrl() {
        const script = document.currentScript || 
                      Array.from(document.scripts).find(s => s.src.includes('moduleLoader'));
        
        if (script) {
            const url = new URL(script.src);
            return url.origin + '/static/js/';
        }
        
        return '/static/js/';
    }
    
    /**
     * Define module dependencies
     */
    defineDependencies() {
        // Core dependencies that should load first
        this.dependencies.set('eventBus', []);
        this.dependencies.set('config', []);
        this.dependencies.set('constants', []);
        this.dependencies.set('utils', []);
        
        // Base components (must load before other components)
        this.dependencies.set('baseComponent', ['eventBus', 'config', 'utils']);
        
        // Editor system
        this.dependencies.set('editorConfig', []);
        this.dependencies.set('editorService', ['editorConfig', 'eventBus']);
        this.dependencies.set('codeSubmissionHandler', ['editorService', 'eventBus']);
        this.dependencies.set('editorIntegration', ['editorService', 'eventBus']);
        
        // UI Components
        this.dependencies.set('themeManager', ['eventBus', 'config']);
        this.dependencies.set('authManager', ['eventBus', 'config']);
        this.dependencies.set('navigationManager', ['eventBus', 'authManager']);
        
        // Quiz system
        this.dependencies.set('quizEngine', ['eventBus', 'config']);
        this.dependencies.set('quizState', ['eventBus']);
        this.dependencies.set('quizController', ['eventBus', 'config', 'baseComponent', 'quizEngine', 'quizState']);
        
        // Quiz renderers (depend on BaseComponent)
        this.dependencies.set('multipleChoiceRenderer', ['baseComponent']);
        this.dependencies.set('trueFalseRenderer', ['baseComponent']);
        this.dependencies.set('fillBlankRenderer', ['baseComponent']);
        
        // Components (depend on BaseComponent)
        this.dependencies.set('progressTracker', ['eventBus', 'authManager', 'baseComponent']);
        this.dependencies.set('notificationComponent', ['eventBus', 'baseComponent']);
        this.dependencies.set('modalComponent', ['eventBus', 'baseComponent']);
        this.dependencies.set('xpAnimation', ['eventBus']);
        
        // Lesson modules
        this.dependencies.set('lessonCore', ['eventBus', 'baseComponent']);
        this.dependencies.set('quiz', ['eventBus', 'baseComponent']);
        this.dependencies.set('interactiveEditor', ['eventBus', 'baseComponent']);
        this.dependencies.set('lessonTestSuite', ['eventBus', 'baseComponent']);
        
        // Utilities
        this.dependencies.set('performanceMonitor', ['eventBus']);
        this.dependencies.set('appUtils', ['eventBus', 'config']);
        
        // Main application (loads last)
        this.dependencies.set('app', [
            'eventBus', 'config', 'themeManager', 'authManager', 
            'navigationManager', 'editorService'
        ]);
    }
    
    /**
     * Load a module and its dependencies
     */
    async loadModule(moduleName, options = {}) {
        console.log(`📥 Loading module: ${moduleName}`);
        
        // Return existing module if already loaded
        if (this.loadedModules.has(moduleName)) {
            console.log(`✅ Module ${moduleName} already loaded`);
            return this.loadedModules.get(moduleName);
        }
        
        // Return existing promise if already loading
        if (this.loadingPromises.has(moduleName)) {
            console.log(`⏳ Module ${moduleName} already loading, waiting...`);
            return this.loadingPromises.get(moduleName);
        }
        
        // Create loading promise
        const loadingPromise = this._loadModuleWithDependencies(moduleName, options);
        this.loadingPromises.set(moduleName, loadingPromise);
        
        try {
            const result = await loadingPromise;
            this.loadedModules.set(moduleName, result);
            this.loadingPromises.delete(moduleName);
            return result;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            throw error;
        }
    }
    
    /**
     * Load module with its dependencies
     */
    async _loadModuleWithDependencies(moduleName, options = {}) {
        try {
            // Check if module is already available globally (loaded via script tag)
            if (this._isModuleAlreadyAvailable(moduleName)) {
                console.log(`✅ Module ${moduleName} already available globally, skipping load`);
                return { url: 'already-loaded', cached: true, global: true };
            }
            
            // Load dependencies first
            const deps = this.dependencies.get(moduleName) || [];
            if (deps.length > 0) {
                console.log(`📦 Loading dependencies for ${moduleName}:`, deps);
                await Promise.all(deps.map(dep => this.loadModule(dep)));
            }
            
            // Load the actual module
            const moduleUrl = this.getModuleUrl(moduleName);
            const moduleData = await this._loadScript(moduleUrl, options);
            
            // Validate module loaded correctly
            this._validateModule(moduleName, moduleData);
            
            console.log(`✅ Module ${moduleName} loaded successfully`);
            return moduleData;
            
        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            throw new Error(`Module loading failed: ${moduleName} - ${error.message}`);
        }
    }
    
    /**
     * Get URL for a module
     */
    getModuleUrl(moduleName) {
        const moduleMap = {
            // Core modules
            'eventBus': 'eventBus.js',
            'config': 'config.js',
            'constants': 'constants.js',
            'utils': 'utils.js',
            'app': 'app.js',
            
            // Base components
            'baseComponent': 'components/BaseComponent.js',
            
            // Editor modules
            'editorConfig': 'editor/editorConfig.js',
            'editorService': 'editor/editorService.js',
            'codeSubmissionHandler': 'editor/codeSubmissionHandler.js',
            'editorIntegration': 'editor/editorIntegration.js',
            
            // UI modules
            'themeManager': 'modules/theme-manager.js',
            'authManager': 'modules/auth-manager.js',
            'navigationManager': 'modules/navigation-manager.js',
            'appUtils': 'modules/app-utils.js',
            
            // Quiz modules
            'quizEngine': 'quiz/QuizEngine.js',
            'quizState': 'quiz/QuizState.js',
            'quizController': 'quiz/QuizController.js',
            'multipleChoiceRenderer': 'quiz/renderers/MultipleChoiceRenderer.js',
            'trueFalseRenderer': 'quiz/renderers/TrueFalseRenderer.js',
            'fillBlankRenderer': 'quiz/renderers/FillBlankRenderer.js',
            
            // Component modules
            'progressTracker': 'components/progress-tracker.js',
            'notificationComponent': 'components/NotificationComponent.js',
            'modalComponent': 'components/ModalComponent.js',
            'xpAnimation': 'components/xp-animation.js',
            'themeController': 'components/ThemeController.js',
            
            // Lesson-specific modules
            'lessonCore': 'modules/lessonCore.js',
            'interactiveEditor': 'modules/interactiveEditor.js',
            'quiz': 'modules/quiz.js',
            'lessonTestSuite': 'modules/lessonTestSuite.js',
            
            // Utility modules
            'performanceMonitor': 'utils/performance-monitor.js'
        };
        
        const path = moduleMap[moduleName];
        if (!path) {
            throw new Error(`Unknown module: ${moduleName}`);
        }
        
        return this.baseUrl + path;
    }
    
    /**
     * Load script with retry logic
     */
    async _loadScript(url, options = {}) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryCount; attempt++) {
            try {
                console.log(`📡 Loading script (attempt ${attempt}): ${url}`);
                
                const result = await this._loadScriptPromise(url, options);
                console.log(`✅ Script loaded: ${url}`);
                return result;
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ Script load attempt ${attempt} failed: ${url}`, error);
                
                if (attempt < this.retryCount) {
                    console.log(`⏳ Retrying in ${this.retryDelay}ms...`);
                    await this._delay(this.retryDelay);
                }
            }
        }
        
        throw new Error(`Failed to load script after ${this.retryCount} attempts: ${url} - ${lastError.message}`);
    }
    
    /**
     * Load script as promise
     */
    _loadScriptPromise(url, options = {}) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript) {
                if (existingScript.dataset.loaded === 'true') {
                    resolve({ url, cached: true });
                    return;
                } else {
                    // Wait for existing script to load
                    existingScript.addEventListener('load', () => resolve({ url, cached: true }));
                    existingScript.addEventListener('error', reject);
                    return;
                }
            }
            
            const script = document.createElement('script');
            script.src = url;
            script.async = options.async !== false;
            script.defer = options.defer === true;
            
            // Set attributes
            if (options.integrity) script.integrity = options.integrity;
            if (options.crossorigin) script.crossOrigin = options.crossorigin;
            
            script.addEventListener('load', () => {
                script.dataset.loaded = 'true';
                resolve({ url, cached: false });
            });
            
            script.addEventListener('error', () => {
                script.remove();
                reject(new Error(`Script load error: ${url}`));
            });
            
            // Add timeout
            const timeout = setTimeout(() => {
                script.remove();
                reject(new Error(`Script load timeout: ${url}`));
            }, options.timeout || 30000);
            
            script.addEventListener('load', () => clearTimeout(timeout));
            script.addEventListener('error', () => clearTimeout(timeout));
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * Validate that module loaded correctly
     */
    _validateModule(moduleName, moduleData) {
        const expectedGlobals = {
            'eventBus': 'EventBus',
            'config': 'Config',
            'constants': 'Constants',
            'utils': 'Utils',
            'app': 'App',
            'baseComponent': 'BaseComponent',
            'editorConfig': 'EditorConfig',
            'editorService': 'EditorService',
            'themeManager': 'ThemeManager',
            'authManager': 'AuthManager',
            'navigationManager': 'NavigationManager',
            'quizEngine': 'QuizEngine',
            'progressTracker': 'ProgressTracker',
            'performanceMonitor': 'PerformanceMonitor'
        };
        
        const expectedGlobal = expectedGlobals[moduleName];
        if (expectedGlobal && typeof window[expectedGlobal] === 'undefined') {
            console.warn(`⚠️ Expected global ${expectedGlobal} not found for module ${moduleName}`);
        }
    }
    
    /**
     * Load multiple modules in parallel
     */
    async loadModules(moduleNames, options = {}) {
        console.log('📦 Loading multiple modules:', moduleNames);
        
        try {
            const results = await Promise.all(
                moduleNames.map(name => this.loadModule(name, options))
            );
            
            console.log('✅ All modules loaded successfully');
            return results;
            
        } catch (error) {
            console.error('❌ Failed to load some modules:', error);
            throw error;
        }
    }
    
    /**
     * Load modules in sequence (for dependency order)
     */
    async loadModulesSequential(moduleNames, options = {}) {
        console.log('📦 Loading modules sequentially:', moduleNames);
        
        const results = [];
        for (const moduleName of moduleNames) {
            const result = await this.loadModule(moduleName, options);
            results.push(result);
        }
        
        console.log('✅ All modules loaded sequentially');
        return results;
    }
    
    /**
     * Load application modules in optimal order
     */
    async loadApplication(options = {}) {
        console.log('🚀 Loading complete application...');
        
        try {
            // Define dependencies first
            this.defineDependencies();
            
            // Load core modules first
            const coreModules = ['eventBus', 'config', 'constants', 'utils'];
            await this.loadModulesSequential(coreModules, options);
            
            // Load base components (must load before other components)
            await this.loadModule('baseComponent', options);
            
            // Load editor system
            const editorModules = ['editorConfig', 'editorService'];
            await this.loadModules(editorModules, options);
            
            // Load UI modules
            const uiModules = ['themeManager', 'authManager', 'navigationManager'];
            await this.loadModules(uiModules, options);
            
            // Load component modules
            const componentModules = [
                'progressTracker', 'notificationComponent', 
                'modalComponent', 'performanceMonitor'
            ];
            await this.loadModules(componentModules, options);
            
            // Load quiz system if needed
            if (this.shouldLoadQuizSystem()) {
                const quizModules = [
                    'quizEngine', 'quizState', 'quizController',
                    'multipleChoiceRenderer', 'trueFalseRenderer', 'fillBlankRenderer'
                ];
                await this.loadModules(quizModules, options);
            }
            
            // Load main app controller last
            await this.loadModule('app', options);
            
            console.log('✅ Complete application loaded successfully');
            return this.getLoadedModules();
            
        } catch (error) {
            console.error('❌ Failed to load complete application:', error);
            throw error;
        }
    }
    
    /**
     * Check if quiz system should be loaded
     */
    shouldLoadQuizSystem() {
        const pathname = window.location.pathname;
        return pathname.includes('/quiz/') || 
               pathname.includes('/lesson/') || 
               document.querySelector('[data-component="quiz"]');
    }
    
    /**
     * Get list of loaded modules
     */
    getLoadedModules() {
        return Array.from(this.loadedModules.keys());
    }
    
    /**
     * Check if module is loaded
     */
    isModuleLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
    
    /**
     * Get loading status
     */
    getLoadingStatus() {
        return {
            loaded: Array.from(this.loadedModules.keys()),
            loading: Array.from(this.loadingPromises.keys()),
            failed: this.loadOrder.filter(name => 
                !this.loadedModules.has(name) && !this.loadingPromises.has(name)
            )
        };
    }
    
    /**
     * Unload a module (remove from DOM)
     */
    unloadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            const moduleUrl = this.getModuleUrl(moduleName);
            const script = document.querySelector(`script[src="${moduleUrl}"]`);
            if (script) {
                script.remove();
                console.log(`🗑️ Module ${moduleName} unloaded`);
            }
            
            this.loadedModules.delete(moduleName);
        }
    }
    
    /**
     * Reload a module
     */
    async reloadModule(moduleName, options = {}) {
        console.log(`🔄 Reloading module: ${moduleName}`);
        
        this.unloadModule(moduleName);
        
        // Add cache busting parameter
        const reloadOptions = {
            ...options,
            cacheBust: Date.now()
        };
        
        return this.loadModule(moduleName, reloadOptions);
    }
    
    /**
     * Utility: delay function
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Clean up resources
     */
    destroy() {
        console.log('🧹 Cleaning up ModuleLoader...');
        
        this.loadedModules.clear();
        this.loadingPromises.clear();
        this.dependencies.clear();
        this.loadOrder = [];
        
        console.log('✅ ModuleLoader cleanup complete');
    }
    
    /**
     * Check if a module is already available globally (loaded via script tag)
     */
    _isModuleAlreadyAvailable(moduleName) {
        const moduleChecks = {
            'baseComponent': () => typeof BaseComponent !== 'undefined',
            'config': () => typeof Config !== 'undefined',
            'eventBus': () => typeof EventBus !== 'undefined',
            'utils': () => typeof Utils !== 'undefined',
            'constants': () => typeof Constants !== 'undefined'
        };
        
        const checkFunction = moduleChecks[moduleName];
        if (checkFunction) {
            return checkFunction();
        }
        
        return false;
    }
}

// Create global instance
window.ModuleLoader = ModuleLoader;
window.CwMModuleLoader = new ModuleLoader();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleLoader;
}
