/**
 * Lesson System Debugger
 * Development and debugging tools for the lesson system
 */

export class LessonDebugger {
    static analyze() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            lessonId: this.getLessonId(),
            
            // System availability
            lessonSystem: {
                available: !!window.lessonSystem,
                initialized: window.lessonSystem?.initialized || false,
                lessonData: !!window.lessonSystem?.lessonData,
                userProgress: !!window.lessonSystem?.userProgress
            },
            
            // Firebase status
            firebase: {
                loaded: typeof firebase !== 'undefined',
                initialized: typeof firebase !== 'undefined' && firebase.apps?.length > 0,
                firestore: typeof firebase !== 'undefined' && !!firebase.firestore
            },
            
            // DOM elements
            dom: {
                container: !!document.getElementById('lesson-content-container'),
                loading: !!document.getElementById('content-loading'),
                content: !!document.getElementById('lesson-content'),
                fallback: !!document.getElementById('lesson-fallback'),
                progressBar: !!document.getElementById('progress-fill'),
                progressText: !!document.getElementById('progress-percentage')
            },
            
            // Data availability
            data: {
                windowLessonData: !!window.lessonData,
                windowLessonProgress: !!window.lessonProgress,
                windowCurrentUser: !!window.currentUser,
                globalCurrentUser: !!globalThis.currentUser
            },
            
            // Module loading
            modules: {
                ace: typeof ace !== 'undefined',
                lessonSystem: typeof window.LessonSystem !== 'undefined'
            },
            
            // Content analysis
            content: {
                blocksRendered: document.querySelectorAll('.content-block').length,
                editorsFound: document.querySelectorAll('.code-editor').length,
                quizzesFound: document.querySelectorAll('[data-quiz-id]').length,
                completedBlocks: document.querySelectorAll('.content-block.completed').length
            },
            
            errors: []
        };
        
        // Add detailed data if available
        if (window.lessonSystem) {
            const debugInfo = window.lessonSystem.getDebugInfo();
            report.lessonSystemDetails = debugInfo;
        }
        
        // Check for common issues
        report.issues = this.detectIssues(report);
        
        console.group('🔍 LESSON SYSTEM DIAGNOSTIC REPORT');
        console.log('📊 Full Report:', report);
        
        if (report.issues.length > 0) {
            console.warn('⚠️  Issues Detected:');
            report.issues.forEach(issue => console.warn(`  - ${issue}`));
        } else {
            console.log('✅ No issues detected');
        }
        
        console.groupEnd();
        
        return report;
    }
    
    static getLessonId() {
        const urlParts = window.location.pathname.split('/');
        const urlId = urlParts[urlParts.length - 1];
        const metaId = document.querySelector('meta[name="lesson-id"]')?.content;
        const dataId = window.lessonData?.id;
        
        return metaId || dataId || urlId;
    }
    
    static detectIssues(report) {
        const issues = [];
        
        // Check for critical DOM elements
        if (!report.dom.container) {
            issues.push('Lesson content container not found');
        }
        
        // Check for lesson system
        if (!report.lessonSystem.available) {
            issues.push('Lesson system not loaded');
        } else if (!report.lessonSystem.initialized) {
            issues.push('Lesson system not initialized');
        }
        
        // Check for data
        if (!report.data.windowLessonData && !report.lessonSystem.lessonData) {
            issues.push('No lesson data available');
        }
        
        // Check for Firebase if expected
        if (!report.firebase.loaded) {
            issues.push('Firebase SDK not loaded (expected for production)');
        }
        
        // Check for ACE editor
        if (!report.modules.ace && report.content.editorsFound > 0) {
            issues.push('ACE editor not loaded but code editors found');
        }
        
        return issues;
    }
    
    static async testFirebaseConnection() {
        try {
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded');
            }
            
            if (firebase.apps.length === 0) {
                throw new Error('Firebase not initialized');
            }
            
            const db = firebase.firestore();
            
            // Test read permission
            await db.collection('lessons').limit(1).get();
            
            console.log('✅ Firebase connection successful');
            return { success: true, message: 'Firebase connection working' };
            
        } catch (error) {
            console.error('❌ Firebase connection failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    static async testAPIConnection(lessonId = null) {
        const testLessonId = lessonId || this.getLessonId() || 'python-basics-01';
        
        try {
            const response = await fetch(`/api/lessons/${testLessonId}`);
            
            if (!response.ok) {
                throw new Error(`API responded with ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            console.log('✅ API connection successful');
            console.log('📄 Sample lesson data:', data);
            
            return { success: true, data };
            
        } catch (error) {
            console.error('❌ API connection failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    static inspectLessonData() {
        console.group('📖 LESSON DATA INSPECTION');
        
        const sources = [
            { name: 'window.lessonData', data: window.lessonData },
            { name: 'lessonSystem.lessonData', data: window.lessonSystem?.lessonData },
            { name: 'window.lessonProgress', data: window.lessonProgress },
            { name: 'lessonSystem.userProgress', data: window.lessonSystem?.userProgress }
        ];
        
        sources.forEach(source => {
            if (source.data) {
                console.log(`${source.name}:`, source.data);
                
                if (source.data.blocks) {
                    console.log(`  📦 Blocks (${source.data.blocks.length}):`, 
                        source.data.blocks.map(b => ({ id: b.id, type: b.type, title: b.title }))
                    );
                }
            } else {
                console.log(`${source.name}: null/undefined`);
            }
        });
        
        console.groupEnd();
    }
    
    static simulateUserProgress() {
        if (!window.lessonSystem) {
            console.error('❌ Lesson system not available');
            return;
        }
        
        const blocks = window.lessonSystem.lessonData?.blocks || [];
        if (blocks.length === 0) {
            console.error('❌ No blocks found to simulate progress');
            return;
        }
        
        console.log('🎭 Simulating user progress...');
        
        // Complete first block after 1 second
        setTimeout(() => {
            if (blocks[0]) {
                console.log(`✅ Simulating completion of block: ${blocks[0].id}`);
                window.lessonSystem.markBlockComplete(blocks[0].id);
            }
        }, 1000);
        
        // Complete second block after 3 seconds
        setTimeout(() => {
            if (blocks[1]) {
                console.log(`✅ Simulating completion of block: ${blocks[1].id}`);
                window.lessonSystem.markBlockComplete(blocks[1].id);
            }
        }, 3000);
        
        console.log(`🎯 Will simulate completion of ${Math.min(2, blocks.length)} blocks`);
    }
    
    static clearCache() {
        // Clear lesson data cache
        if (window.lessonSystem?.dataService?.clearCache) {
            window.lessonSystem.dataService.clearCache();
        }
        
        // Clear browser caches
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    if (name.includes('lesson')) {
                        caches.delete(name);
                        console.log(`🗑️  Cleared cache: ${name}`);
                    }
                });
            });
        }
        
        console.log('🗑️  Cache clearing initiated');
    }
    
    static exportDebugReport() {
        const report = this.analyze();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `lesson-debug-report-${new Date().toISOString().slice(0, 19)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📥 Debug report exported');
    }
    
    // Quick access methods for console
    static quick = {
        analyze: () => this.analyze(),
        firebase: () => this.testFirebaseConnection(),
        api: () => this.testAPIConnection(),
        data: () => this.inspectLessonData(),
        simulate: () => this.simulateUserProgress(),
        clear: () => this.clearCache(),
        export: () => this.exportDebugReport()
    };
}

// Make available globally for console debugging
if (typeof window !== 'undefined') {
    window.LessonDebugger = LessonDebugger;
    window.lessonDebug = LessonDebugger.quick;
    
    // Auto-run analysis in development
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' || 
        window.location.hostname.includes('dev')) {
        
        // Run analysis after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                console.log('🔧 Development mode detected - running automatic lesson analysis');
                LessonDebugger.analyze();
            }, 1000);
        });
    }
}
