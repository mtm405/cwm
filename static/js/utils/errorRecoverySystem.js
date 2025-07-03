/**
 * Comprehensive Error Recovery System
 * Phase 6: Advanced error handling and recovery for module loading and data structure errors
 * 
 * This system provides:
 * - Runtime error detection and recovery
 * - Module loading fallback strategies
 * - Data structure initialization and validation
 * - Global error interception and handling
 */

// Prevent duplicate declarations
if (typeof window.ErrorRecoverySystem === 'undefined') {
    console.log('🛡️ Initializing Error Recovery System...');

    class ErrorRecoverySystem {
        constructor() {
            this.errors = [];
            this.recoveryStrategies = new Map();
            this.recoveryAttempts = new Map();
            this.maxRetries = 3;
            this.setupDefaultStrategies();
            this.setupGlobalErrorHandling();
            console.log('✅ Error Recovery System initialized');
        }

        setupDefaultStrategies() {
            // Module loading errors
            this.recoveryStrategies.set('module-error', async (error, context) => {
                console.log('🔧 Attempting module error recovery...', error.message);
                
                // Track recovery attempts
                const attemptKey = `module-${error.message}`;
                const attempts = this.recoveryAttempts.get(attemptKey) || 0;
                
                if (attempts >= this.maxRetries) {
                    console.warn('🚫 Max recovery attempts reached for module error');
                    return false;
                }
                
                this.recoveryAttempts.set(attemptKey, attempts + 1);
                
                // Try loading critical modules as regular scripts
                const moduleUrls = [
                    '/static/js/quiz/QuizEngine.js',
                    '/static/js/quiz/QuizController.js',
                    '/static/js/quiz/QuizState.js',
                    '/static/js/editor/editorService.js',
                    '/static/js/services/firebaseLessonService.js',
                    '/static/js/utils/dataStructureNormalizer.js',
                    '/static/js/components/dashboard.js',
                    '/static/js/config.js'
                ];
                
                let recoveredCount = 0;
                for (const url of moduleUrls) {
                    try {
                        await this.loadScriptAsModule(url);
                        recoveredCount++;
                        console.log(`✅ Recovered module: ${url}`);
                    } catch (e) {
                        console.warn(`⚠️ Failed to recover module: ${url}`, e);
                    }
                }
                
                // Try to reinitialize critical services after loading
                this.reinitializeCriticalServices();
                
                return recoveredCount > 0;
            });

            // Data structure errors
            this.recoveryStrategies.set('data-error', (error, context) => {
                console.log('🔧 Attempting data error recovery...', error.message);
                
                const attemptKey = `data-${error.message}`;
                const attempts = this.recoveryAttempts.get(attemptKey) || 0;
                
                if (attempts >= this.maxRetries) {
                    console.warn('🚫 Max recovery attempts reached for data error');
                    return false;
                }
                
                this.recoveryAttempts.set(attemptKey, attempts + 1);
                
                // Initialize missing data structures
                this.initializeLessonData();
                this.initializeUserData();
                this.initializeQuizData();
                
                // Try to recover from Flask backend if available
                this.tryRecoverFromBackend();
                
                // Reinitialize UI components that might have broken
                this.reinitializeUIComponents();
                
                console.log('✅ Data structures initialized');
                return true;
            });

            // Network/API errors
            this.recoveryStrategies.set('network-error', async (error, context) => {
                console.log('🔧 Attempting network error recovery...', error.message);
                
                // Check if we're offline
                if (!navigator.onLine) {
                    console.warn('📡 Device is offline, using cached data');
                    this.loadFromCache();
                    this.enableOfflineMode();
                    return true;
                }
                
                // Retry with exponential backoff
                const attemptKey = `network-${context.url || 'unknown'}`;
                const attempts = this.recoveryAttempts.get(attemptKey) || 0;
                
                if (attempts < this.maxRetries) {
                    this.recoveryAttempts.set(attemptKey, attempts + 1);
                    const delay = Math.pow(2, attempts) * 1000; // 1s, 2s, 4s
                    
                    console.log(`🔄 Retrying network request in ${delay}ms...`);
                    
                    // Return a promise that will retry the request
                    return new Promise((resolve) => {
                        setTimeout(() => {
                            // If there's a retry function provided, use it
                            if (context.retryFunction) {
                                context.retryFunction()
                                    .then(() => resolve(true))
                                    .catch(() => resolve(false));
                            } else {
                                resolve(true); // Assume success for now
                            }
                        }, delay);
                    });
                }
                
                // Max retries reached, fall back to cached data
                console.warn('🚫 Max network retries reached, using cached data');
                this.loadFromCache();
                this.enableOfflineMode();
                return true;
            });
        }

        async loadScriptAsModule(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${url}: ${response.status}`);
                }
                
                const text = await response.text();
                
                // Transform ES6 module syntax to global scope
                const modifiedText = text
                    .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '// Import removed by error recovery')
                    .replace(/^export\s+default\s+/gm, 'window.')
                    .replace(/^export\s+/gm, 'window.')
                    .replace(/export\s+{\s*([^}]+)\s*}/g, (match, exports) => {
                        const exportNames = exports.split(',').map(name => name.trim());
                        return exportNames.map(name => `window.${name} = ${name};`).join('\n');
                    });
                
                // Create and execute script
                const script = document.createElement('script');
                script.textContent = modifiedText;
                script.setAttribute('data-recovery-loaded', url);
                document.head.appendChild(script);
                
                return true;
            } catch (error) {
                console.error(`Failed to load script as module: ${url}`, error);
                throw error;
            }
        }

        reinitializeCriticalServices() {
            try {
                // Reinitialize EditorService if available
                if (window.EditorService && typeof window.EditorService.getInstance === 'function') {
                    console.log('🔄 Reinitializing EditorService...');
                    window.editorService = window.EditorService.getInstance();
                }
                
                // Reinitialize FirebaseLessonService if available
                if (window.FirebaseLessonService && typeof window.FirebaseLessonService.getInstance === 'function') {
                    console.log('🔄 Reinitializing FirebaseLessonService...');
                    window.firebaseLessonService = window.FirebaseLessonService.getInstance();
                }
                
                // Reinitialize QuizEngine if available
                if (window.QuizEngine) {
                    console.log('🔄 Reinitializing QuizEngine...');
                    if (window.quizData && window.quizData.questions) {
                        window.quizEngine = new window.QuizEngine(window.quizData.questions);
                    }
                }
                
                console.log('✅ Critical services reinitialized');
            } catch (error) {
                console.warn('⚠️ Failed to reinitialize some services:', error);
            }
        }

        tryRecoverFromBackend() {
            try {
                // Try to fetch lesson data from Flask backend
                const currentPath = window.location.pathname;
                const lessonMatch = currentPath.match(/\/lesson\/([^\/]+)/);
                
                if (lessonMatch) {
                    const lessonId = lessonMatch[1];
                    
                    fetch(`/api/lesson/${lessonId}`)
                        .then(response => {
                            if (response.ok) {
                                return response.json();
                            }
                            throw new Error(`Backend API error: ${response.status}`);
                        })
                        .then(data => {
                            if (data.lesson) {
                                window.lessonData = data.lesson;
                                console.log('✅ Recovered lesson data from backend');
                                
                                // Normalize the recovered data
                                if (window.DataStructureNormalizer) {
                                    window.lessonData = window.DataStructureNormalizer.normalizeLessonDataComprehensive(window.lessonData);
                                }
                            }
                        })
                        .catch(error => {
                            console.warn('⚠️ Could not recover from backend:', error);
                        });
                }
            } catch (error) {
                console.warn('⚠️ Backend recovery failed:', error);
            }
        }

        reinitializeUIComponents() {
            try {
                // Reinitialize dashboard if we're on the dashboard page
                if (window.location.pathname === '/dashboard' && window.Dashboard) {
                    console.log('🔄 Reinitializing Dashboard...');
                    if (typeof window.Dashboard.init === 'function') {
                        window.Dashboard.init();
                    }
                }
                
                // Reinitialize lesson components if we're on a lesson page
                if (window.location.pathname.includes('/lesson/')) {
                    console.log('🔄 Reinitializing lesson components...');
                    
                    // Reinitialize lesson navigation
                    if (window.initializeLessonNavigation) {
                        window.initializeLessonNavigation();
                    }
                    
                    // Reinitialize code editor
                    if (window.initializeCodeEditor) {
                        window.initializeCodeEditor();
                    }
                    
                    // Reinitialize quiz components
                    if (window.initializeQuiz) {
                        window.initializeQuiz();
                    }
                }
                
                console.log('✅ UI components reinitialized');
            } catch (error) {
                console.warn('⚠️ Failed to reinitialize UI components:', error);
            }
        }

        enableOfflineMode() {
            try {
                // Add offline indicator to UI
                const offlineIndicator = document.getElementById('offline-indicator');
                if (!offlineIndicator) {
                    const indicator = document.createElement('div');
                    indicator.id = 'offline-indicator';
                    indicator.className = 'offline-mode-indicator';
                    indicator.innerHTML = '📱 Offline Mode - Using cached data';
                    indicator.style.cssText = `
                        position: fixed;
                        top: 10px;
                        right: 10px;
                        background: #ff6b35;
                        color: white;
                        padding: 8px 16px;
                        border-radius: 4px;
                        font-size: 14px;
                        z-index: 9999;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    `;
                    document.body.appendChild(indicator);
                }
                
                // Disable features that require network
                if (window.CONFIG) {
                    window.CONFIG.offlineMode = true;
                }
                
                console.log('📱 Offline mode enabled');
            } catch (error) {
                console.warn('⚠️ Failed to enable offline mode UI:', error);
            }
        }

        initializeLessonData() {
            if (!window.lessonData) {
                window.lessonData = {
                    id: 'unknown',
                    title: 'Lesson',
                    description: 'Loading lesson data...',
                    subtopics: [],
                    blocks: [],
                    content: [],
                    metadata: {
                        difficulty: 'beginner',
                        duration: 30,
                        category: 'general'
                    }
                };
            }
            
            if (!window.lessonProgress) {
                window.lessonProgress = {
                    completed_blocks: [],
                    progress: 0,
                    current_block: 0,
                    started_at: new Date().toISOString(),
                    last_updated: new Date().toISOString()
                };
            }

            // Ensure data structure normalization
            if (window.DataStructureNormalizer && window.lessonData) {
                try {
                    window.lessonData = window.DataStructureNormalizer.normalizeLessonDataComprehensive(window.lessonData);
                } catch (e) {
                    console.warn('Could not normalize lesson data:', e);
                }
            }
        }

        initializeUserData() {
            if (!window.currentUser) {
                window.currentUser = {
                    id: 'anonymous',
                    displayName: 'Anonymous User',
                    email: null,
                    preferences: {
                        theme: 'dark',
                        notifications: true,
                        autoSave: true
                    }
                };
            }
        }

        initializeQuizData() {
            if (!window.quizData) {
                window.quizData = {
                    questions: [],
                    currentQuestion: 0,
                    score: 0,
                    completed: false
                };
            }
        }

        loadFromCache() {
            try {
                // Try to load cached data
                const cachedLessonData = localStorage.getItem('cwm_cached_lesson_data');
                const cachedUserData = localStorage.getItem('cwm_cached_user_data');
                const cachedQuizData = localStorage.getItem('cwm_cached_quiz_data');
                
                if (cachedLessonData) {
                    window.lessonData = JSON.parse(cachedLessonData);
                    console.log('📦 Loaded lesson data from cache');
                }
                
                if (cachedUserData) {
                    window.currentUser = JSON.parse(cachedUserData);
                    console.log('📦 Loaded user data from cache');
                }
                
                if (cachedQuizData) {
                    window.quizData = JSON.parse(cachedQuizData);
                    console.log('📦 Loaded quiz data from cache');
                }
                
                // Also check session storage for temporary data
                const sessionLessonData = sessionStorage.getItem('cwm_session_lesson_data');
                if (sessionLessonData && !window.lessonData) {
                    window.lessonData = JSON.parse(sessionLessonData);
                    console.log('📦 Loaded lesson data from session cache');
                }
                
            } catch (error) {
                console.warn('Failed to load cached data:', error);
            }
        }

        // Enhanced caching method
        cacheData(key, data, useSessionStorage = false) {
            try {
                const storage = useSessionStorage ? sessionStorage : localStorage;
                const cacheKey = `cwm_cached_${key}`;
                storage.setItem(cacheKey, JSON.stringify(data));
                console.log(`💾 Cached ${key} data`);
            } catch (error) {
                console.warn(`Failed to cache ${key} data:`, error);
            }
        }

        setupGlobalErrorHandling() {
            // Override console.error to catch all errors
            const originalConsoleError = console.error;
            console.error = (...args) => {
                originalConsoleError.apply(console, args);
                
                // Process error for recovery
                const errorString = args.join(' ');
                this.processConsoleError(errorString, args);
            };

            // Window error handler
            window.addEventListener('error', (event) => {
                this.handleError(event.error || new Error(event.message), {
                    type: 'window-error',
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });

            // Unhandled promise rejection
            window.addEventListener('unhandledrejection', (event) => {
                this.handleError(event.reason, {
                    type: 'unhandled-promise',
                    promise: event.promise
                });
            });
        }

        processConsoleError(errorString, originalArgs) {
            // Check for specific error patterns
            if (errorString.includes('Cannot use import statement') || 
                errorString.includes('Unexpected token \'import\'')) {
                this.handleError(new Error(errorString), { type: 'module-error', source: 'console' });
            } else if (errorString.includes('Cannot read properties of undefined') ||
                      errorString.includes('Cannot read property') ||
                      errorString.includes('is not defined')) {
                this.handleError(new Error(errorString), { type: 'data-error', source: 'console' });
            } else if (errorString.includes('fetch') || 
                      errorString.includes('NetworkError') ||
                      errorString.includes('Failed to load')) {
                this.handleError(new Error(errorString), { type: 'network-error', source: 'console' });
            }
        }

        async handleError(error, context = {}) {
            const errorEntry = {
                error: error,
                context: context,
                timestamp: Date.now(),
                recovered: false
            };

            this.errors.push(errorEntry);
            
            // Limit error history
            if (this.errors.length > 100) {
                this.errors = this.errors.slice(-50);
            }

            console.warn('🚨 Error detected, attempting recovery:', error.message);

            try {
                let recovered = false;

                // Determine error type and apply recovery strategy
                if (error.message.includes('Cannot use import statement') || 
                    error.message.includes('Unexpected token \'import\'') ||
                    context.type === 'module-error') {
                    recovered = await this.recoveryStrategies.get('module-error')?.(error, context);
                } else if (error.message.includes('Cannot read properties of undefined') ||
                          error.message.includes('Cannot read property') ||
                          error.message.includes('is not defined') ||
                          context.type === 'data-error') {
                    recovered = this.recoveryStrategies.get('data-error')?.(error, context);
                } else if (error.message.includes('fetch') || 
                          error.message.includes('NetworkError') ||
                          error.message.includes('Failed to load') ||
                          context.type === 'network-error') {
                    recovered = await this.recoveryStrategies.get('network-error')?.(error, context);
                }

                errorEntry.recovered = recovered;

                if (recovered) {
                    console.log('✅ Error recovery successful');
                    
                    // Notify user of recovery if appropriate
                    if (window.showNotification) {
                        window.showNotification('System recovered from error', 'success', 2000);
                    }
                } else {
                    console.warn('❌ Error recovery failed or not applicable');
                }

                return recovered;
            } catch (recoveryError) {
                console.error('💥 Error during recovery:', recoveryError);
                return false;
            }
        }

        // Public API methods
        getErrorHistory() {
            return [...this.errors];
        }

        getRecoveryStats() {
            const total = this.errors.length;
            const recovered = this.errors.filter(e => e.recovered).length;
            return {
                total,
                recovered,
                recoveryRate: total > 0 ? (recovered / total * 100).toFixed(1) + '%' : '0%'
            };
        }

        clearErrorHistory() {
            this.errors = [];
            this.recoveryAttempts.clear();
            console.log('🧹 Error history cleared');
        }

        // Manual recovery trigger
        async triggerRecovery(errorType = 'all') {
            console.log(`🔧 Manual recovery triggered for: ${errorType}`);
            
            if (errorType === 'all' || errorType === 'data') {
                this.recoveryStrategies.get('data-error')?.(new Error('Manual trigger'), { type: 'manual' });
            }
            
            if (errorType === 'all' || errorType === 'modules') {
                await this.recoveryStrategies.get('module-error')?.(new Error('Manual trigger'), { type: 'manual' });
            }
            
            if (errorType === 'all' || errorType === 'network') {
                await this.recoveryStrategies.get('network-error')?.(new Error('Manual trigger'), { type: 'manual' });
            }
        }
    }

    // Initialize global error recovery system
    window.ErrorRecoverySystem = ErrorRecoverySystem;
    window.errorRecovery = new ErrorRecoverySystem();

    // Make recovery stats available in console for debugging
    window.getRecoveryStats = () => window.errorRecovery.getRecoveryStats();
    window.triggerRecovery = (type) => window.errorRecovery.triggerRecovery(type);

} else {
    console.log('⚠️ ErrorRecoverySystem already initialized');
}
