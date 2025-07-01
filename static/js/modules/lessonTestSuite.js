/**
 * Lesson Test Suite Module
 * Handles automated testing for lesson code exercises
 */

class LessonTestSuite {
    constructor(options = {}) {
        this.options = {
            autoRun: false,
            showFeedback: true,
            testTimeout: 5000,
            ...options
        };
        
        this.tests = [];
        this.results = [];
        this.isRunning = false;
        this.initialized = false;
        
        console.log('🧪 LessonTestSuite initialized');
    }

    /**
     * Initialize the test suite
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Add event listeners
            document.addEventListener('runTests', (e) => this.runTests(e.detail));
            
            // Load any predefined tests
            await this.loadTests();
            
            this.initialized = true;
            console.log('✅ LessonTestSuite ready');
        } catch (error) {
            console.error('❌ Failed to initialize LessonTestSuite:', error);
        }
    }

    /**
     * Load tests from data attributes or API
     */
    async loadTests() {
        try {
            // Look for test definitions in the page
            const testElements = document.querySelectorAll('[data-test]');
            if (testElements.length > 0) {
                testElements.forEach(el => {
                    try {
                        const testData = JSON.parse(el.dataset.test);
                        this.addTest(testData);
                    } catch (err) {
                        console.warn('Invalid test definition:', err);
                    }
                });
            }
            
            // Alternatively, fetch tests from API
            const lessonId = document.body.dataset.lessonId;
            if (lessonId) {
                await this.fetchTestsForLesson(lessonId);
            }
        } catch (error) {
            console.error('Error loading tests:', error);
        }
    }

    /**
     * Fetch tests for a specific lesson
     */
    async fetchTestsForLesson(lessonId) {
        try {
            const response = await fetch(`/api/lesson/${lessonId}/tests`);
            if (response.ok) {
                const tests = await response.json();
                tests.forEach(test => this.addTest(test));
            }
        } catch (error) {
            console.warn('Could not fetch tests from API:', error);
        }
    }

    /**
     * Add a test to the suite
     */
    addTest(test) {
        if (!test.id || !test.name || !test.test) {
            console.warn('Invalid test format, skipping');
            return;
        }
        
        this.tests.push({
            id: test.id,
            name: test.name,
            description: test.description || '',
            test: test.test,
            timeout: test.timeout || this.options.testTimeout,
            points: test.points || 1
        });
        
        console.log(`Test added: ${test.name}`);
    }

    /**
     * Run all tests
     */
    async runTests(options = {}) {
        if (this.isRunning) {
            console.warn('Tests already running, please wait');
            return;
        }
        
        if (this.tests.length === 0) {
            console.warn('No tests available to run');
            this.displayFeedback({
                success: false,
                message: 'No tests available'
            });
            return;
        }
        
        this.isRunning = true;
        this.results = [];
        
        // Get code from editor if available
        let code = '';
        if (window.editorService && window.editorService.getCurrentCode) {
            code = window.editorService.getCurrentCode();
        } else if (options.code) {
            code = options.code;
        } else {
            const editorElement = document.querySelector('.code-editor');
            if (editorElement && editorElement.textContent) {
                code = editorElement.textContent;
            }
        }
        
        if (!code) {
            console.warn('No code to test');
            this.isRunning = false;
            this.displayFeedback({
                success: false,
                message: 'No code to test'
            });
            return;
        }
        
        // Show loading state
        this.displayFeedback({ 
            running: true,
            message: 'Running tests...'
        });
        
        try {
            // Run tests in sequence
            for (const test of this.tests) {
                const result = await this.runSingleTest(test, code);
                this.results.push(result);
                
                // Update progress feedback
                this.displayFeedback({
                    running: true,
                    progress: this.results.length / this.tests.length,
                    message: `Running test: ${test.name}`
                });
            }
            
            // Process and display results
            const allPassed = this.results.every(r => r.passed);
            const points = this.results.reduce((sum, r) => sum + (r.passed ? r.points : 0), 0);
            const totalPoints = this.tests.reduce((sum, t) => sum + t.points, 0);
            
            this.displayFeedback({
                success: allPassed,
                results: this.results,
                points,
                totalPoints,
                message: allPassed ? 'All tests passed!' : 'Some tests failed'
            });
            
            // Dispatch results event
            const resultsEvent = new CustomEvent('testResults', {
                detail: {
                    passed: allPassed,
                    results: this.results,
                    points,
                    totalPoints
                }
            });
            document.dispatchEvent(resultsEvent);
            
        } catch (error) {
            console.error('Error running tests:', error);
            this.displayFeedback({
                success: false,
                error,
                message: 'Error running tests'
            });
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * Run a single test
     */
    async runSingleTest(test, code) {
        return new Promise(resolve => {
            let timeoutId;
            
            try {
                // Create a safe execution environment
                const testResult = {
                    id: test.id,
                    name: test.name,
                    passed: false,
                    points: test.points,
                    error: null,
                    duration: 0
                };
                
                const startTime = performance.now();
                
                // Set timeout for test execution
                timeoutId = setTimeout(() => {
                    testResult.error = 'Test timed out';
                    resolve(testResult);
                }, test.timeout);
                
                // Execute test
                const testFunction = new Function('code', test.test);
                const result = testFunction(code);
                
                // Clear timeout
                clearTimeout(timeoutId);
                
                // Update result
                testResult.duration = performance.now() - startTime;
                testResult.passed = !!result;
                
                resolve(testResult);
            } catch (error) {
                // Clear timeout
                if (timeoutId) clearTimeout(timeoutId);
                
                resolve({
                    id: test.id,
                    name: test.name,
                    passed: false,
                    points: test.points,
                    error: error.message || 'Test execution error',
                    duration: 0
                });
            }
        });
    }

    /**
     * Display test feedback
     */
    displayFeedback(data) {
        if (!this.options.showFeedback) return;
        
        // Look for feedback container
        const feedbackContainer = document.getElementById('test-feedback') || 
                                 document.querySelector('.test-feedback');
        
        if (!feedbackContainer) {
            console.log('Test feedback:', data);
            return;
        }
        
        // Clear previous feedback
        if (!data.running || data.running && !data.progress) {
            feedbackContainer.innerHTML = '';
        }
        
        // Show loading spinner for running tests
        if (data.running) {
            if (!document.getElementById('test-spinner')) {
                const spinner = document.createElement('div');
                spinner.id = 'test-spinner';
                spinner.className = 'spinner';
                spinner.innerHTML = '<div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div>';
                feedbackContainer.appendChild(spinner);
            }
            
            // Show progress
            if (data.progress) {
                const progressEl = document.getElementById('test-progress') || document.createElement('div');
                progressEl.id = 'test-progress';
                progressEl.className = 'progress-bar';
                progressEl.innerHTML = `<div class="progress" style="width: ${data.progress * 100}%"></div>`;
                
                if (!document.getElementById('test-progress')) {
                    feedbackContainer.appendChild(progressEl);
                }
            }
            
            return;
        }
        
        // Create results container
        const resultsEl = document.createElement('div');
        resultsEl.className = `test-results ${data.success ? 'success' : 'failure'}`;
        
        // Add message
        const messageEl = document.createElement('div');
        messageEl.className = 'test-message';
        messageEl.textContent = data.message;
        resultsEl.appendChild(messageEl);
        
        // Add detailed results if available
        if (data.results && data.results.length > 0) {
            const detailsEl = document.createElement('div');
            detailsEl.className = 'test-details';
            
            // Add summary
            const summaryEl = document.createElement('div');
            summaryEl.className = 'test-summary';
            const passedCount = data.results.filter(r => r.passed).length;
            summaryEl.innerHTML = `
                <span class="test-score">${passedCount}/${data.results.length} tests passed</span>
                <span class="test-points">${data.points}/${data.totalPoints} points earned</span>
            `;
            detailsEl.appendChild(summaryEl);
            
            // Add individual test results
            const testsListEl = document.createElement('ul');
            testsListEl.className = 'test-list';
            
            data.results.forEach(result => {
                const testEl = document.createElement('li');
                testEl.className = `test-item ${result.passed ? 'passed' : 'failed'}`;
                testEl.innerHTML = `
                    <span class="test-icon">${result.passed ? '✓' : '✗'}</span>
                    <span class="test-name">${result.name}</span>
                    ${result.error ? `<span class="test-error">${result.error}</span>` : ''}
                `;
                testsListEl.appendChild(testEl);
            });
            
            detailsEl.appendChild(testsListEl);
            resultsEl.appendChild(detailsEl);
        }
        
        // Add error if available
        if (data.error) {
            const errorEl = document.createElement('div');
            errorEl.className = 'test-error';
            errorEl.textContent = data.error.message || data.error;
            resultsEl.appendChild(errorEl);
        }
        
        feedbackContainer.appendChild(resultsEl);
    }

    /**
     * Clean up resources
     */
    destroy() {
        document.removeEventListener('runTests', this.runTests);
        this.tests = [];
        this.results = [];
        this.initialized = false;
    }
}

// Create global instance
window.lessonTestSuite = new LessonTestSuite();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LessonTestSuite };
}
