/**
 * Code Submission Handler
 * Handles code validation, execution, and test processing
 */

// Prevent duplicate declarations
if (typeof window.CodeSubmissionHandler === 'undefined') {

class CodeSubmissionHandler {
    constructor() {
        this.eventBus = window.eventBus || null;
        this.editorService = window.editorService || null;
        this.config = window.EditorConfig || {};
        
        // Submission state tracking
        this.activeSubmissions = new Map();
        this.submissionHistory = [];
        this.maxHistorySize = 100;
        
        // Performance metrics
        this.metrics = {
            totalSubmissions: 0,
            successfulSubmissions: 0,
            failedSubmissions: 0,
            averageExecutionTime: 0,
            testsPassed: 0,
            testsFailed: 0
        };
        
        // Queue for batch processing
        this.submissionQueue = [];
        this.isProcessingQueue = false;
        
        this.init();
    }

    /**
     * Initialize the submission handler
     */
    init() {
        console.log('🎯 Initializing Code Submission Handler...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start queue processor
        this.startQueueProcessor();
        
        console.log('✅ Code Submission Handler initialized');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (this.eventBus) {
            // Listen for run code requests
            this.eventBus.on('editor:shortcut:run', (data) => {
                this.submitCode(data.editorId);
            });
            
            // Listen for test execution requests
            this.eventBus.on('lesson:test:run', (data) => {
                this.runTests(data.editorId, data.tests);
            });
            
            // Listen for code validation requests
            this.eventBus.on('editor:validate', (data) => {
                this.validateCode(data.editorId, data.code);
            });
        }
        
        // Listen for custom events
        document.addEventListener('codeSubmission:run', (event) => {
            const { editorId, options } = event.detail;
            this.submitCode(editorId, options);
        });
    }

    /**
     * Submit code for execution
     */
    async submitCode(editorId, options = {}) {
        const submissionId = this.generateSubmissionId();
        
        try {
            console.log(`🚀 Starting code submission: ${submissionId} (Editor: ${editorId})`);
            
            // Get code from editor
            const code = this.editorService ? 
                this.editorService.getCode(editorId) : 
                this.getCodeFromElement(editorId);
            
            if (!code || !code.trim()) {
                throw new Error(this.config.messages?.errors?.NO_CODE || 'No code to execute');
            }
            
            // Create submission record
            const submission = {
                id: submissionId,
                editorId,
                code,
                startTime: Date.now(),
                status: 'running',
                options: {
                    enableTests: true,
                    clearOutput: true,
                    showProgress: true,
                    timeout: 10000,
                    ...options
                }
            };
            
            // Track active submission
            this.activeSubmissions.set(submissionId, submission);
            
            // Emit submission start event
            this.emit('submission:start', {
                submissionId,
                editorId,
                code: code.substring(0, 100) + (code.length > 100 ? '...' : '')
            });
            
            // Update UI to show running state
            this.updateSubmissionUI(editorId, 'running', submissionId);
            
            // Execute code
            const result = await this.executeCode(submission);
            
            // Process result
            await this.processSubmissionResult(submission, result);
            
            return {
                success: true,
                submissionId,
                result
            };
            
        } catch (error) {
            console.error(`❌ Code submission failed: ${submissionId}`, error);
            
            // Update metrics
            this.metrics.failedSubmissions++;
            
            // Handle submission error
            await this.handleSubmissionError(submissionId, editorId, error);
            
            return {
                success: false,
                submissionId,
                error: error.message
            };
            
        } finally {
            // Clean up active submission
            this.activeSubmissions.delete(submissionId);
        }
    }

    /**
     * Execute code using the appropriate endpoint
     */
    async executeCode(submission) {
        const { code, options, editorId } = submission;
        const startTime = Date.now();
        
        try {
            // Determine language and endpoint
            const language = this.detectLanguage(editorId, code);
            const endpoint = this.getExecutionEndpoint(language);
            
            console.log(`⚡ Executing ${language} code via ${endpoint}`);
            
            // Prepare request payload
            const payload = {
                code,
                language,
                inputs: options.inputs || '',
                timeout: options.timeout || 10000
            };
            
            // Add execution context if available
            if (options.context) {
                payload.context = options.context;
            }
            
            // Make API request
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Submission-ID': submission.id
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Calculate execution time
            const executionTime = Date.now() - startTime;
            
            // Update metrics
            this.updateExecutionMetrics(executionTime, true);
            
            return {
                ...result,
                executionTime,
                language,
                timestamp: Date.now()
            };
            
        } catch (error) {
            const executionTime = Date.now() - startTime;
            this.updateExecutionMetrics(executionTime, false);
            
            throw new Error(`Execution failed: ${error.message}`);
        }
    }

    /**
     * Process submission result
     */
    async processSubmissionResult(submission, result) {
        const { id: submissionId, editorId, options } = submission;
        
        try {
            console.log(`📊 Processing submission result: ${submissionId}`);
            
            // Update submission record
            submission.result = result;
            submission.status = result.success ? 'completed' : 'failed';
            submission.endTime = Date.now();
            
            // Update metrics
            if (result.success) {
                this.metrics.successfulSubmissions++;
            } else {
                this.metrics.failedSubmissions++;
            }
            this.metrics.totalSubmissions++;
            
            // Display output
            this.displayOutput(editorId, result);
            
            // Run tests if enabled and available
            if (options.enableTests && result.success) {
                await this.runCodeTests(submission, result);
            }
            
            // Update UI
            this.updateSubmissionUI(editorId, submission.status, submissionId, result);
            
            // Add to history
            this.addToHistory(submission);
            
            // Emit completion event
            this.emit('submission:complete', {
                submissionId,
                editorId,
                success: result.success,
                executionTime: result.executionTime,
                output: result.output
            });
            
            console.log(`✅ Submission processed successfully: ${submissionId}`);
            
        } catch (error) {
            console.error(`❌ Error processing submission result: ${submissionId}`, error);
            throw error;
        }
    }

    /**
     * Run tests for submitted code
     */
    async runCodeTests(submission, executionResult) {
        const { editorId, code } = submission;
        
        try {
            // Get test cases (from DOM, API, or config)
            const tests = await this.getTestCases(editorId);
            
            if (!tests || tests.length === 0) {
                console.log('No tests available for this code block');
                return;
            }
            
            console.log(`🧪 Running ${tests.length} tests for submission: ${submission.id}`);
            
            // Run each test
            const testResults = [];
            let passedCount = 0;
            
            for (const [index, test] of tests.entries()) {
                try {
                    const testResult = await this.executeTest(code, test, index);
                    testResults.push(testResult);
                    
                    if (testResult.passed) {
                        passedCount++;
                        this.metrics.testsPassed++;
                    } else {
                        this.metrics.testsFailed++;
                    }
                    
                    // Show progress if enabled
                    if (submission.options.showProgress) {
                        this.updateTestProgress(editorId, index + 1, tests.length, testResult);
                    }
                    
                } catch (error) {
                    console.error(`Test ${index} execution failed:`, error);
                    testResults.push({
                        test: test.name || `Test ${index + 1}`,
                        passed: false,
                        error: error.message,
                        expected: test.expected,
                        actual: null
                    });
                    this.metrics.testsFailed++;
                }
            }
            
            // Process test results
            const allPassed = passedCount === tests.length;
            
            // Display test results
            this.displayTestResults(editorId, testResults, allPassed);
            
            // Emit test completion event
            this.emit('submission:tests:complete', {
                submissionId: submission.id,
                editorId,
                totalTests: tests.length,
                passedTests: passedCount,
                failedTests: tests.length - passedCount,
                allPassed,
                results: testResults
            });
            
            console.log(`🎯 Tests completed: ${passedCount}/${tests.length} passed`);
            
        } catch (error) {
            console.error('Error running tests:', error);
            this.emit('submission:tests:error', {
                submissionId: submission.id,
                editorId,
                error: error.message
            });
        }
    }

    /**
     * Execute a single test case
     */
    async executeTest(code, test, index) {
        const testStartTime = Date.now();
        
        try {
            // Prepare test code
            const testCode = this.prepareTestCode(code, test);
            
            // Execute test
            const response = await fetch('/api/execute-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: testCode,
                    test: test,
                    timeout: 5000
                })
            });
            
            if (!response.ok) {
                throw new Error(`Test execution failed: HTTP ${response.status}`);
            }
            
            const result = await response.json();
            const executionTime = Date.now() - testStartTime;
            
            return {
                test: test.name || `Test ${index + 1}`,
                passed: result.success && this.compareResults(result.output, test.expected),
                expected: test.expected,
                actual: result.output,
                executionTime,
                error: result.success ? null : result.error
            };
            
        } catch (error) {
            return {
                test: test.name || `Test ${index + 1}`,
                passed: false,
                expected: test.expected,
                actual: null,
                executionTime: Date.now() - testStartTime,
                error: error.message
            };
        }
    }

    /**
     * Prepare test code by combining user code with test case
     */
    prepareTestCode(userCode, test) {
        if (test.setup) {
            return `${test.setup}\n${userCode}\n${test.testCode}`;
        }
        return `${userCode}\n${test.testCode}`;
    }

    /**
     * Compare actual results with expected results
     */
    compareResults(actual, expected) {
        if (typeof expected === 'string') {
            return actual.trim() === expected.trim();
        }
        
        if (Array.isArray(expected)) {
            return JSON.stringify(actual) === JSON.stringify(expected);
        }
        
        return actual === expected;
    }

    /**
     * Get test cases for an editor
     */
    async getTestCases(editorId) {
        try {
            // Try to get tests from DOM data attribute
            const editorElement = document.getElementById(editorId);
            if (editorElement && editorElement.dataset.tests) {
                return JSON.parse(editorElement.dataset.tests);
            }
            
            // Try to get tests from API
            const blockId = editorElement?.dataset.blockId;
            if (blockId) {
                const response = await fetch(`/api/lesson-blocks/${blockId}/tests`);
                if (response.ok) {
                    const data = await response.json();
                    return data.tests;
                }
            }
            
            return [];
            
        } catch (error) {
            console.error('Error getting test cases:', error);
            return [];
        }
    }

    /**
     * Validate code syntax and structure
     */
    async validateCode(editorId, code) {
        try {
            const language = this.detectLanguage(editorId, code);
            
            // Basic client-side validation
            const clientValidation = this.performClientValidation(code, language);
            
            // Server-side validation if available
            let serverValidation = { errors: [], warnings: [] };
            try {
                const response = await fetch('/api/validate-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, language })
                });
                
                if (response.ok) {
                    serverValidation = await response.json();
                }
            } catch (error) {
                console.warn('Server validation unavailable:', error.message);
            }
            
            // Combine validations
            const validation = {
                errors: [...clientValidation.errors, ...serverValidation.errors],
                warnings: [...clientValidation.warnings, ...serverValidation.warnings]
            };
            
            // Emit validation result
            this.emit('submission:validation', {
                editorId,
                validation,
                isValid: validation.errors.length === 0
            });
            
            return validation;
            
        } catch (error) {
            console.error('Code validation failed:', error);
            return { errors: [{ message: 'Validation failed', line: 1 }], warnings: [] };
        }
    }

    /**
     * Perform client-side code validation
     */
    performClientValidation(code, language) {
        const errors = [];
        const warnings = [];
        
        if (!code.trim()) {
            errors.push({ message: 'Code cannot be empty', line: 1 });
            return { errors, warnings };
        }
        
        if (language === 'python') {
            const lines = code.split('\n');
            
            // Check for basic Python syntax issues
            lines.forEach((line, index) => {
                const trimmed = line.trim();
                
                // Check for unmatched parentheses (basic check)
                const openParens = (line.match(/\(/g) || []).length;
                const closeParens = (line.match(/\)/g) || []).length;
                if (openParens !== closeParens) {
                    warnings.push({
                        message: 'Unmatched parentheses',
                        line: index + 1
                    });
                }
                
                // Check for common indentation issues
                if (trimmed && line.startsWith('    ') === false && line.startsWith('\t') === false && index > 0) {
                    const prevLine = lines[index - 1].trim();
                    if (prevLine.endsWith(':')) {
                        warnings.push({
                            message: 'Expected indentation after colon',
                            line: index + 1
                        });
                    }
                }
            });
        }
        
        return { errors, warnings };
    }

    /**
     * Detect programming language from editor or code
     */
    detectLanguage(editorId, code) {
        // Try to get language from editor service
        if (this.editorService) {
            const config = this.editorService.editorConfigs?.get(editorId);
            if (config && config.language) {
                return config.language;
            }
        }
        
        // Try to get language from DOM
        const element = document.getElementById(editorId);
        if (element && element.dataset.language) {
            return element.dataset.language;
        }
        
        // Fallback to code analysis
        if (code.includes('def ') || code.includes('import ') || code.includes('print(')) {
            return 'python';
        }
        
        if (code.includes('function') || code.includes('console.log') || code.includes('const ')) {
            return 'javascript';
        }
        
        if (code.includes('public class') || code.includes('System.out.println')) {
            return 'java';
        }
        
        // Default to Python
        return 'python';
    }

    /**
     * Get execution endpoint for language
     */
    getExecutionEndpoint(language) {
        const endpoints = {
            python: '/run_python',
            javascript: '/run_javascript',
            java: '/run_java'
        };
        
        return endpoints[language] || endpoints.python;
    }

    /**
     * Display code output
     */
    displayOutput(editorId, result) {
        const outputElement = document.getElementById(`output-${editorId}`);
        if (!outputElement) {
            console.warn(`Output element not found: output-${editorId}`);
            return;
        }
        
        // Clear previous output if requested
        if (result.clearOutput !== false) {
            outputElement.innerHTML = '';
        }
        
        // Create output content
        const outputContent = document.createElement('div');
        outputContent.className = 'code-output';
        
        if (result.success) {
            outputContent.innerHTML = `
                <div class="output-success">
                    <div class="output-header">
                        <span class="output-icon">✅</span>
                        <span class="output-title">Output</span>
                        ${result.executionTime ? `<span class="execution-time">(${result.executionTime}ms)</span>` : ''}
                    </div>
                    <pre class="output-text">${this.escapeHtml(result.output || 'Code executed successfully!')}</pre>
                </div>
            `;
        } else {
            outputContent.innerHTML = `
                <div class="output-error">
                    <div class="output-header">
                        <span class="output-icon">❌</span>
                        <span class="output-title">Error</span>
                    </div>
                    <pre class="error-text">${this.escapeHtml(result.error || 'Unknown error occurred')}</pre>
                </div>
            `;
        }
        
        outputElement.appendChild(outputContent);
        
        // Scroll to output
        outputContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Display test results
     */
    displayTestResults(editorId, testResults, allPassed) {
        const testsElement = document.getElementById(`tests-${editorId}`);
        if (!testsElement) {
            console.warn(`Tests element not found: tests-${editorId}`);
            return;
        }
        
        const passedCount = testResults.filter(r => r.passed).length;
        const totalCount = testResults.length;
        
        testsElement.innerHTML = `
            <div class="test-results ${allPassed ? 'all-passed' : 'some-failed'}">
                <div class="test-summary">
                    <span class="test-icon">${allPassed ? '🎉' : '🔧'}</span>
                    <span class="test-title">Tests: ${passedCount}/${totalCount} passed</span>
                </div>
                <div class="test-details">
                    ${testResults.map((result, index) => `
                        <div class="test-case ${result.passed ? 'passed' : 'failed'}">
                            <div class="test-name">
                                <span class="test-status">${result.passed ? '✅' : '❌'}</span>
                                ${result.test}
                            </div>
                            ${!result.passed ? `
                                <div class="test-failure">
                                    <div class="expected">Expected: <code>${this.escapeHtml(String(result.expected))}</code></div>
                                    <div class="actual">Actual: <code>${this.escapeHtml(String(result.actual || 'null'))}</code></div>
                                    ${result.error ? `<div class="error">Error: ${this.escapeHtml(result.error)}</div>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Update submission UI state
     */
    updateSubmissionUI(editorId, status, submissionId, result = null) {
        // Update run button
        const runButton = document.getElementById(`run-btn-${editorId}`);
        if (runButton) {
            switch (status) {
                case 'running':
                    runButton.disabled = true;
                    runButton.textContent = 'Running...';
                    runButton.className = 'btn btn-warning btn-sm';
                    break;
                case 'completed':
                    runButton.disabled = false;
                    runButton.textContent = 'Run Code';
                    runButton.className = result?.success ? 'btn btn-success btn-sm' : 'btn btn-danger btn-sm';
                    // Reset to primary after delay
                    setTimeout(() => {
                        if (runButton.textContent === 'Run Code') {
                            runButton.className = 'btn btn-primary btn-sm';
                        }
                    }, 3000);
                    break;
                case 'failed':
                    runButton.disabled = false;
                    runButton.textContent = 'Run Code';
                    runButton.className = 'btn btn-danger btn-sm';
                    setTimeout(() => {
                        if (runButton.textContent === 'Run Code') {
                            runButton.className = 'btn btn-primary btn-sm';
                        }
                    }, 3000);
                    break;
            }
        }
    }

    /**
     * Update test progress display
     */
    updateTestProgress(editorId, current, total, lastResult) {
        const progressElement = document.getElementById(`test-progress-${editorId}`);
        if (progressElement) {
            const percentage = (current / total) * 100;
            progressElement.innerHTML = `
                <div class="test-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="progress-text">
                        Running tests: ${current}/${total}
                        ${lastResult ? (lastResult.passed ? '✅' : '❌') : ''}
                    </div>
                </div>
            `;
        }
    }

    /**
     * Handle submission errors
     */
    async handleSubmissionError(submissionId, editorId, error) {
        console.error(`❌ Submission error: ${submissionId}`, error);
        
        // Display error to user
        this.displayOutput(editorId, {
            success: false,
            error: error.message,
            clearOutput: true
        });
        
        // Update UI
        this.updateSubmissionUI(editorId, 'failed', submissionId);
        
        // Emit error event
        this.emit('submission:error', {
            submissionId,
            editorId,
            error: error.message,
            timestamp: Date.now()
        });
    }

    /**
     * Get code from DOM element (fallback)
     */
    getCodeFromElement(editorId) {
        const element = document.getElementById(editorId);
        if (!element) return '';
        
        // Try different ways to get code
        if (element.value !== undefined) {
            return element.value; // textarea or input
        }
        
        if (element.textContent !== undefined) {
            return element.textContent; // div or pre
        }
        
        return '';
    }

    /**
     * Generate unique submission ID
     */
    generateSubmissionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Update execution metrics
     */
    updateExecutionMetrics(executionTime, success) {
        if (success) {
            const totalTime = this.metrics.averageExecutionTime * this.metrics.successfulSubmissions;
            this.metrics.averageExecutionTime = (totalTime + executionTime) / (this.metrics.successfulSubmissions + 1);
        }
    }

    /**
     * Add submission to history
     */
    addToHistory(submission) {
        this.submissionHistory.unshift(submission);
        
        // Limit history size
        if (this.submissionHistory.length > this.maxHistorySize) {
            this.submissionHistory = this.submissionHistory.slice(0, this.maxHistorySize);
        }
    }

    /**
     * Start queue processor for batch operations
     */
    startQueueProcessor() {
        setInterval(() => {
            if (!this.isProcessingQueue && this.submissionQueue.length > 0) {
                this.processSubmissionQueue();
            }
        }, 1000);
    }

    /**
     * Process submission queue
     */
    async processSubmissionQueue() {
        if (this.isProcessingQueue || this.submissionQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        try {
            const batch = this.submissionQueue.splice(0, 5); // Process 5 at a time
            
            await Promise.allSettled(
                batch.map(submission => this.submitCode(submission.editorId, submission.options))
            );
            
        } catch (error) {
            console.error('Error processing submission queue:', error);
        } finally {
            this.isProcessingQueue = false;
        }
    }

    /**
     * Get submission metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            activeSubmissions: this.activeSubmissions.size,
            queuedSubmissions: this.submissionQueue.length,
            successRate: this.metrics.totalSubmissions > 0 ? 
                (this.metrics.successfulSubmissions / this.metrics.totalSubmissions * 100).toFixed(1) : 0
        };
    }

    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Emit event through event bus
     */
    emit(eventName, data = {}) {
        if (this.eventBus && typeof this.eventBus.emit === 'function') {
            this.eventBus.emit(eventName, data);
        } else {
            // Fallback to custom event
            const event = new CustomEvent(eventName, { detail: data });
            document.dispatchEvent(event);
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        // Clear active submissions
        this.activeSubmissions.clear();
        
        // Clear queue
        this.submissionQueue = [];
        
        console.log('🧹 Code Submission Handler destroyed');
    }
}

// Create global instance
const codeSubmissionHandler = new CodeSubmissionHandler();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CodeSubmissionHandler, codeSubmissionHandler };
} else {
    // Make available globally
    window.CodeSubmissionHandler = CodeSubmissionHandler;
    window.codeSubmissionHandler = codeSubmissionHandler;
}

} // End of duplicate declaration guard
