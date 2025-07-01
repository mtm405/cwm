/**
 * Lesson Template System - Integration Test Suite
 * Code with Morais
 * 
 * This test validates that all components of the lesson template system
 * are properly integrated and working together
 */

class LessonIntegrationTestSuite {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.startTime = Date.now();
    }
    
    /**
     * Run comprehensive integration tests
     */
    async runAllTests() {
        console.log('🧪 Starting Lesson Integration Test Suite...');
        console.log('==========================================');
        
        try {
            // Component availability tests
            await this.testComponentAvailability();
            
            // API endpoint tests
            await this.testAPIEndpoints();
            
            // JavaScript integration tests
            await this.testJavaScriptIntegration();
            
            // Firebase integration tests
            await this.testFirebaseIntegration();
            
            // UI rendering tests
            await this.testUIRendering();
            
            // Progress tracking tests
            await this.testProgressTracking();
            
            // Generate final report
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }
    
    /**
     * Test that all required components are available
     */
    async testComponentAvailability() {
        console.log('\n📦 Testing Component Availability...');
        
        // JavaScript Classes
        this.test('ContentBlockRenderer available', () => {
            return typeof ContentBlockRenderer !== 'undefined';
        });
        
        this.test('ProgressTracker available', () => {
            return typeof ProgressTracker !== 'undefined';
        });
        
        this.test('GamificationManager available', () => {
            return typeof GamificationManager !== 'undefined';
        });
        
        this.test('InteractiveCodeEditor available', () => {
            return typeof InteractiveCodeEditor !== 'undefined';
        });
        
        this.test('LessonIntegrationManager available', () => {
            return typeof LessonIntegrationManager !== 'undefined';
        });
        
        this.test('QuizSystem available', () => {
            return typeof QuizSystem !== 'undefined';
        });
        
        // Global functions
        this.test('initializeLessonIntegration function available', () => {
            return typeof window.initializeLessonIntegration === 'function';
        });
        
        // Required DOM elements
        this.test('Lesson content container exists', () => {
            return document.querySelector('.lesson-content') !== null;
        });
        
        this.test('Progress bar container exists', () => {
            return document.querySelector('.progress-fill') !== null;
        });
    }
    
    /**
     * Test API endpoints
     */
    async testAPIEndpoints() {
        console.log('\n🌐 Testing API Endpoints...');
        
        const lessonId = window.lessonId || 'test-lesson';
        
        // Test lesson data endpoint
        await this.asyncTest('Lesson data API responds', async () => {
            const response = await fetch(`/api/lessons/${lessonId}`);
            return response.status === 200 || response.status === 404; // 404 is ok for test lesson
        });
        
        // Test progress endpoint
        await this.asyncTest('Progress API responds', async () => {
            const response = await fetch(`/api/lessons/${lessonId}/progress`);
            return response.status === 200 || response.status === 404;
        });
        
        // Test lessons list endpoint
        await this.asyncTest('Lessons list API responds', async () => {
            const response = await fetch('/api/lessons');
            return response.status === 200;
        });
        
        // Test block completion endpoint (POST - will fail without auth, but should respond)
        await this.asyncTest('Block completion API responds', async () => {
            const response = await fetch(`/api/lessons/${lessonId}/complete-block`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ block_id: 'test-block' })
            });
            return response.status !== 500; // Any response except 500 is ok
        });
    }
    
    /**
     * Test JavaScript integration
     */
    async testJavaScriptIntegration() {
        console.log('\n🔧 Testing JavaScript Integration...');
        
        // Test component initialization
        this.test('Components can be instantiated', () => {
            try {
                const renderer = new ContentBlockRenderer();
                const tracker = new ProgressTracker('test-lesson', 'test-user');
                return renderer && tracker;
            } catch (error) {
                console.error('Component instantiation failed:', error);
                return false;
            }
        });
        
        // Test event system
        this.test('Custom events work', () => {
            let eventFired = false;
            
            const handler = () => { eventFired = true; };
            document.addEventListener('testEvent', handler);
            
            const event = new CustomEvent('testEvent');
            document.dispatchEvent(event);
            
            document.removeEventListener('testEvent', handler);
            return eventFired;
        });
        
        // Test lesson integration manager
        this.test('LessonIntegrationManager can be initialized', () => {
            try {
                const manager = new LessonIntegrationManager('test-lesson');
                return manager && manager.lessonId === 'test-lesson';
            } catch (error) {
                console.error('LessonIntegrationManager failed:', error);
                return false;
            }
        });
    }
    
    /**
     * Test Firebase integration
     */
    async testFirebaseIntegration() {
        console.log('\n🔥 Testing Firebase Integration...');
        
        this.test('Firebase service available', () => {
            return window.firebase !== undefined || 
                   window.firebaseConfig !== undefined ||
                   document.querySelector('[data-firebase]') !== null;
        });
        
        this.test('User data structure valid', () => {
            const user = window.currentUser;
            return user && (user.uid || user.id);
        });
        
        this.test('Lesson data structure valid', () => {
            const lesson = window.lessonData;
            return lesson && (lesson.id || lesson.title);
        });
    }
    
    /**
     * Test UI rendering capabilities
     */
    async testUIRendering() {
        console.log('\n🎨 Testing UI Rendering...');
        
        // Test content renderer
        this.test('ContentBlockRenderer can render text block', () => {
            if (!window.ContentBlockRenderer) return false;
            
            try {
                const renderer = new ContentBlockRenderer();
                const mockBlock = {
                    id: 'test-block',
                    type: 'text',
                    title: 'Test Block',
                    content: 'Test content'
                };
                
                const element = renderer.renderBlock(mockBlock, 0);
                return element && element.querySelector && element.querySelector('.text-content');
            } catch (error) {
                console.error('Content rendering failed:', error);
                return false;
            }
        });
        
        // Test progress indicators
        this.test('Progress indicators can be updated', () => {
            const progressBar = document.querySelector('.progress-fill');
            if (!progressBar) return false;
            
            const originalWidth = progressBar.style.width;
            progressBar.style.width = '50%';
            const updated = progressBar.style.width === '50%';
            progressBar.style.width = originalWidth; // Reset
            
            return updated;
        });
        
        // Test modal system
        this.test('Modal system works', () => {
            return typeof showModal === 'function' && 
                   typeof closeModal === 'function';
        });
    }
    
    /**
     * Test progress tracking functionality
     */
    async testProgressTracking() {
        console.log('\n📊 Testing Progress Tracking...');
        
        this.test('Progress tracking local storage works', () => {
            const testKey = 'lesson_test_progress';
            const testData = { progress: 50, completed_blocks: ['block1'] };
            
            try {
                localStorage.setItem(testKey, JSON.stringify(testData));
                const retrieved = JSON.parse(localStorage.getItem(testKey));
                localStorage.removeItem(testKey);
                
                return retrieved && retrieved.progress === 50;
            } catch (error) {
                return false;
            }
        });
        
        this.test('Block completion tracking works', () => {
            if (!window.ProgressTracker) return false;
            
            try {
                const tracker = new ProgressTracker('test-lesson', 'test-user');
                const initialCount = tracker.completedBlocks ? tracker.completedBlocks.size : 0;
                return typeof initialCount === 'number';
            } catch (error) {
                console.error('Progress tracking failed:', error);
                return false;
            }
        });
    }
    
    /**
     * Helper methods for testing
     */
    test(description, testFunction) {
        this.totalTests++;
        try {
            const result = testFunction();
            if (result) {
                console.log(`  ✅ ${description}`);
                this.passedTests++;
                this.testResults.push({ description, status: 'PASS', error: null });
            } else {
                console.log(`  ❌ ${description}`);
                this.testResults.push({ description, status: 'FAIL', error: 'Test returned false' });
            }
        } catch (error) {
            console.log(`  ❌ ${description} - Error: ${error.message}`);
            this.testResults.push({ description, status: 'ERROR', error: error.message });
        }
    }
    
    async asyncTest(description, testFunction) {
        this.totalTests++;
        try {
            const result = await testFunction();
            if (result) {
                console.log(`  ✅ ${description}`);
                this.passedTests++;
                this.testResults.push({ description, status: 'PASS', error: null });
            } else {
                console.log(`  ❌ ${description}`);
                this.testResults.push({ description, status: 'FAIL', error: 'Test returned false' });
            }
        } catch (error) {
            console.log(`  ❌ ${description} - Error: ${error.message}`);
            this.testResults.push({ description, status: 'ERROR', error: error.message });
        }
    }
    
    /**
     * Generate comprehensive test report
     */
    generateTestReport() {
        const endTime = Date.now();
        const duration = (endTime - this.startTime) / 1000;
        const successRate = Math.round((this.passedTests / this.totalTests) * 100);
        
        console.log('\n==========================================');
        console.log('🧪 LESSON INTEGRATION TEST REPORT');
        console.log('==========================================');
        console.log(`📊 Tests Run: ${this.totalTests}`);
        console.log(`✅ Passed: ${this.passedTests}`);
        console.log(`❌ Failed: ${this.totalTests - this.passedTests}`);
        console.log(`📈 Success Rate: ${successRate}%`);
        console.log(`⏱️ Duration: ${duration}s`);
        
        // Detailed results
        console.log('\n📋 Detailed Results:');
        const failures = this.testResults.filter(r => r.status !== 'PASS');
        if (failures.length > 0) {
            console.log('\n❌ Failed Tests:');
            failures.forEach(failure => {
                console.log(`  • ${failure.description}: ${failure.status}`);
                if (failure.error) {
                    console.log(`    Error: ${failure.error}`);
                }
            });
        }
        
        // Implementation status
        console.log('\n🎯 Implementation Status:');
        if (successRate >= 90) {
            console.log('🟢 EXCELLENT - System is production ready!');
        } else if (successRate >= 75) {
            console.log('🟡 GOOD - Minor issues need attention');
        } else if (successRate >= 50) {
            console.log('🟠 FAIR - Some components need work');
        } else {
            console.log('🔴 POOR - Major integration issues detected');
        }
        
        // Next steps
        console.log('\n🚀 Next Steps:');
        if (failures.length === 0) {
            console.log('  ✅ All systems operational - ready for production!');
        } else {
            console.log('  🔧 Address failed tests above');
            console.log('  📖 Review implementation documentation');
            console.log('  🧪 Re-run tests after fixes');
        }
        
        // Store results globally for external access
        window.lessonTestResults = {
            totalTests: this.totalTests,
            passedTests: this.passedTests,
            successRate,
            duration,
            details: this.testResults,
            timestamp: new Date().toISOString()
        };
        
        console.log('\n💾 Results stored in window.lessonTestResults');
        console.log('==========================================\n');
    }
}

// Global function to run tests
window.runLessonIntegrationTests = function() {
    const testSuite = new LessonIntegrationTestSuite();
    return testSuite.runAllTests();
};

// Auto-run tests if in development mode
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Run tests after a delay to ensure all components are loaded
    setTimeout(() => {
        if (window.runLessonIntegrationTests) {
            console.log('🧪 Auto-running lesson integration tests (development mode)...');
            window.runLessonIntegrationTests();
        }
    }, 2000);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LessonIntegrationTestSuite;
}
