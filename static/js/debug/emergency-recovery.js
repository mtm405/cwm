/**
 * Emergency Lesson Recovery
 * Use this if lesson pages are not loading
 * 
 * PASTE THIS ENTIRE SCRIPT INTO YOUR BROWSER CONSOLE
 */

(function() {
    console.log('%c🚨 EMERGENCY LESSON RECOVERY', 'color: #FF4444; font-weight: bold; font-size: 16px;');
    
    // Check if we're on a lesson page
    const isLessonPage = window.location.pathname.includes('/lesson/');
    if (!isLessonPage) {
        console.log('❌ Not on a lesson page, stopping recovery');
        return;
    }
    
    // Extract lesson ID
    const urlMatch = window.location.pathname.match(/\/lesson\/([^\/]+)/);
    const lessonId = urlMatch ? urlMatch[1] : 'unknown';
    console.log('📝 Recovering lesson:', lessonId);
    
    // 1. Force display of content area
    const contentElement = document.getElementById('lesson-content');
    const loadingElement = document.getElementById('content-loading');
    const fallbackElement = document.getElementById('fallback-content');
    
    if (loadingElement) loadingElement.style.display = 'none';
    if (contentElement) contentElement.style.display = 'block';
    if (fallbackElement) fallbackElement.style.display = 'none';
    
    // 2. Check if there's any lesson data
    const hasLessonData = globalThis.lessonData || window.lessonData;
    console.log('📊 Lesson data available:', !!hasLessonData);
    
    // 3. Create basic content if container is empty
    const container = document.getElementById('lesson-content-container');
    if (container && container.children.length === 0) {
        console.log('🔧 Creating emergency content...');
        
        container.innerHTML = `
            <div class="emergency-lesson-content">
                <div class="emergency-header">
                    <h2>🚨 Emergency Mode</h2>
                    <p>The lesson system encountered an error, but we can still show basic content.</p>
                </div>
                
                <div class="emergency-lesson-info">
                    <h3>📝 Lesson Information</h3>
                    <p><strong>Lesson ID:</strong> ${lessonId}</p>
                    <p><strong>URL:</strong> ${window.location.href}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <div class="emergency-actions">
                    <h3>🔧 Recovery Actions</h3>
                    <div class="action-buttons">
                        <button onclick="window.location.reload()" class="btn btn-primary">
                            🔄 Refresh Page
                        </button>
                        <button onclick="window.history.back()" class="btn btn-secondary">
                            ⬅️ Go Back
                        </button>
                        <button onclick="window.location.href='/lessons'" class="btn btn-info">
                            📚 All Lessons
                        </button>
                        <button onclick="emergencyDiagnostic()" class="btn btn-warning">
                            🔍 Run Diagnostic
                        </button>
                    </div>
                </div>
                
                <div class="emergency-debug" id="emergency-debug-output">
                    <h3>🐛 Debug Information</h3>
                    <pre id="debug-output">Click "Run Diagnostic" to see debug info</pre>
                </div>
            </div>
        `;
        
        // Add some basic styling
        const style = document.createElement('style');
        style.textContent = `
            .emergency-lesson-content {
                max-width: 800px;
                margin: 2rem auto;
                padding: 2rem;
                background: #fff3cd;
                border: 2px solid #ffeaa7;
                border-radius: 8px;
                font-family: Arial, sans-serif;
            }
            .emergency-header {
                text-align: center;
                margin-bottom: 2rem;
                color: #856404;
            }
            .emergency-lesson-info, .emergency-actions, .emergency-debug {
                margin: 1.5rem 0;
                padding: 1rem;
                background: white;
                border-radius: 6px;
                border-left: 4px solid #ffc107;
            }
            .action-buttons {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                margin-top: 1rem;
            }
            .btn {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-weight: bold;
                text-decoration: none;
                display: inline-block;
            }
            .btn-primary { background: #007bff; color: white; }
            .btn-secondary { background: #6c757d; color: white; }
            .btn-info { background: #17a2b8; color: white; }
            .btn-warning { background: #ffc107; color: #212529; }
            .btn:hover { opacity: 0.9; }
            #debug-output {
                background: #f8f9fa;
                padding: 1rem;
                border-radius: 4px;
                overflow-x: auto;
                font-size: 12px;
                white-space: pre-wrap;
            }
        `;
        document.head.appendChild(style);
        
        console.log('✅ Emergency content created');
    }
    
    // 4. Create diagnostic function
    window.emergencyDiagnostic = function() {
        const output = document.getElementById('debug-output');
        if (!output) return;
        
        const diagnostic = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            lessonId: lessonId,
            userAgent: navigator.userAgent,
            
            // DOM elements
            elements: {
                'lesson-container': !!document.querySelector('.lesson-container'),
                'lesson-content': !!document.getElementById('lesson-content'),
                'lesson-content-container': !!document.getElementById('lesson-content-container'),
                'content-loading': !!document.getElementById('content-loading'),
                'fallback-content': !!document.getElementById('fallback-content')
            },
            
            // JavaScript data
            data: {
                'globalThis.lessonData': !!globalThis.lessonData,
                'window.lessonData': !!window.lessonData,
                'globalThis.lessonProgress': !!globalThis.lessonProgress,
                'globalThis.currentUser': !!globalThis.currentUser
            },
            
            // Functions
            functions: {
                'initializeLesson': typeof window.initializeLesson,
                'debugAuth': typeof window.debugAuth,
                'switchSubtopic': typeof window.switchSubtopic,
                'renderSubtopic': typeof window.renderSubtopic
            },
            
            // Scripts
            scripts: Array.from(document.scripts).length,
            lessonScripts: Array.from(document.scripts).filter(s => 
                s.src && (s.src.includes('lesson') || s.src.includes('auth'))
            ).map(s => s.src),
            
            // Storage
            storage: {
                localStorage: !!localStorage.getItem('auth_token'),
                sessionStorage: !!sessionStorage.getItem('auth_token')
            }
        };
        
        output.textContent = JSON.stringify(diagnostic, null, 2);
        console.log('🔍 Diagnostic complete:', diagnostic);
    };
    
    // 5. Create auth debug function if missing
    if (typeof window.debugAuth !== 'function') {
        window.debugAuth = function() {
            console.log('=== Emergency Auth Debug ===');
            console.log('localStorage auth_token:', localStorage.getItem('auth_token'));
            console.log('sessionStorage auth_token:', sessionStorage.getItem('auth_token'));
            console.log('window.authService:', typeof window.authService);
            console.log('window.authManager:', typeof window.authManager);
            console.log('globalThis.currentUser:', globalThis.currentUser);
            console.log('window.currentUser:', window.currentUser);
            return {
                hasLocalToken: !!localStorage.getItem('auth_token'),
                hasSessionToken: !!sessionStorage.getItem('auth_token'),
                hasAuthService: !!window.authService,
                hasAuthManager: !!window.authManager,
                hasUser: !!(globalThis.currentUser || window.currentUser)
            };
        };
        console.log('✅ Emergency debugAuth function created');
    }
    
    // 6. Try to reinitialize if function exists
    if (typeof window.initializeLesson === 'function') {
        console.log('🔄 Attempting to reinitialize lesson...');
        try {
            window.initializeLesson();
            console.log('✅ Lesson reinitialized successfully');
        } catch (error) {
            console.error('❌ Reinitialization failed:', error);
        }
    }
    
    console.log('🏁 Emergency recovery complete');
    console.log('💡 Available functions: emergencyDiagnostic(), debugAuth()');
    
    return {
        lessonId,
        hasContent: !!container,
        functionsAvailable: {
            emergencyDiagnostic: typeof window.emergencyDiagnostic,
            debugAuth: typeof window.debugAuth,
            initializeLesson: typeof window.initializeLesson
        }
    };
})();
