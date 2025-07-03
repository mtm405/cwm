/**
 * Initialization Queue - Handles proper timing for application initialization  
 * ES6 Module with minimal global scope pollution
 */
export class InitializationQueue {
    constructor() {
        this.queue = [];
        this.isReady = false;
        this.maxRetries = 10;
        this.retryDelay = 500;
        this.appInstance = null;
        this.moduleCache = new Map();
    }

    async waitForApp() {
        let retries = 0;
        
        while (retries < this.maxRetries) {
            // Prioritize ES6 module patterns first
            try {
                // Try to import app as ES6 module (preferred)
                const appModule = await import('../app.js').catch(() => null);
                if (appModule?.default) {
                    const appInstance = appModule.default.getInstance?.() || appModule.default;
                    if (appInstance?.initialized) {
                        console.log('✅ ES6 App module found and ready');
                        this.appInstance = appInstance;
                        return appInstance;
                    }
                }
            } catch (e) {
                // Continue to fallback options
            }
            
            // Fallback to global instances (minimize window usage)
            const globalApp = globalThis.CwMApp || globalThis.app || globalThis.mainApp;
            if (globalApp?.initialized) {
                console.log('✅ Global app instance found and ready');
                this.appInstance = globalApp;
                return globalApp;
            }
            
            await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            retries++;
        }
        
        throw new Error('Application failed to initialize after maximum retries');
    }

    async initializeLesson() {
        try {
            console.log('🔄 Waiting for application...');
            const app = await this.waitForApp();
            
            console.log('✅ Application ready, initializing lesson...');
            
            // Initialize modules using ES6 imports (preferred)
            await this.initializeModules();
            
            // Normalize lesson data using app instance if available
            await this.normalizeLessonData();
            
            // Initialize lesson-specific functionality
            await this.initializeLessonComponents();
            
            console.log('✅ Lesson initialization complete');
            
        } catch (error) {
            console.error('❌ Lesson initialization failed:', error);
            // Fallback to basic functionality
            this.initializeFallback();
        }
    }

    async initializeModules() {
        try {
            // Prioritize ES6 module imports
            const moduleInitializer = await import('../core/moduleInitializer.js').catch(() => null);
            if (moduleInitializer?.ModuleInitializer) {
                await moduleInitializer.ModuleInitializer.initializeQuizModules();
                await moduleInitializer.ModuleInitializer.initializeEditorModules();
                return;
            }
            
            // Fallback to global ModuleInitializer if ES6 import fails
            const globalModuleInit = globalThis.ModuleInitializer;
            if (globalModuleInit) {
                await globalModuleInit.initializeQuizModules();
                await globalModuleInit.initializeEditorModules();
            }
        } catch (error) {
            console.warn('⚠️ Module initialization failed, continuing with fallback:', error);
        }
    }

    async normalizeLessonData() {
        try {
            // Try to get normalizer from app instance first
            const normalizer = this.appInstance?.components?.get?.('DataStructureNormalizer');
            if (normalizer && globalThis.lessonData) {
                globalThis.lessonData = normalizer.normalizeLessonData(globalThis.lessonData);
                return;
            }
            
            // Fallback to global normalizer
            const globalNormalizer = globalThis.DataStructureNormalizer;
            if (globalNormalizer && globalThis.lessonData) {
                globalThis.lessonData = globalNormalizer.normalizeLessonData(globalThis.lessonData);
            }
        } catch (error) {
            console.warn('⚠️ Data normalization failed:', error);
        }
    }

    async initializeLessonComponents() {
        // Initialize lesson page functions in order of priority
        const initFunctions = [
            'initializeLesson',
            'initializeLessonFeatures', 
            'initializeLessonPage'
        ];
        
        for (const funcName of initFunctions) {
            try {
                const func = globalThis[funcName];
                if (typeof func === 'function') {
                    await func();
                    console.log(`✅ ${funcName} completed`);
                    break; // Only run the first available function
                }
            } catch (error) {
                console.warn(`⚠️ ${funcName} failed:`, error);
            }
        }
    }

    initializeFallback() {
        console.log('🔧 Initializing fallback lesson functionality...');
        
        // Basic tab functionality
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.dataset.tab;
                this.switchTab(tabId);
            });
        });
        
        // Basic code copy functionality
        document.querySelectorAll('.copy-code-btn').forEach(button => {
            button.addEventListener('click', () => {
                const codeBlock = button.closest('.code-block').querySelector('code');
                if (codeBlock) {
                    navigator.clipboard.writeText(codeBlock.textContent);
                    button.textContent = 'Copied!';
                    setTimeout(() => button.textContent = 'Copy', 2000);
                }
            });
        });
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        const tabContent = document.getElementById(tabId);
        const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
        
        if (tabContent) tabContent.classList.add('active');
        if (tabButton) tabButton.classList.add('active');
    }
}

// Create and export singleton instance (ES6 preferred)
export const initQueue = new InitializationQueue();

// Also expose globally for backward compatibility (minimal window usage)
globalThis.initQueue = initQueue;

// Auto-start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initQueue.initializeLesson();
    });
} else {
    // DOM already loaded
    initQueue.initializeLesson();
}
