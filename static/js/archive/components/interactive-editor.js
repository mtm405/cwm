/**
 * Interactive Code Editor - Enhanced ACE editor for lesson-specific features
 * Code with Morais - Lesson Template System
 * 
 * This class extends the existing ACE editor integration with:
 * - Test validation for interactive challenges
 * - Hint system integration with PyCoins
 * - Code execution with Piston API
 * - Automatic grading and feedback
 */

class InteractiveCodeEditor {
    constructor(blockId, config = {}) {
        this.blockId = blockId;
        this.editorId = `editor-${blockId}`;
        this.config = {
            language: 'python',
            theme: 'monokai',
            starterCode: '# Your code here\n',
            showHints: true,
            enableTests: true,
            ...config
        };
        
        this.editor = null;
        this.tests = config.tests || [];
        this.hints = config.hints || [];
        this.currentHintIndex = 0;
        this.isRunning = false;
        
        this.init();
    }
    
    /**
     * Initialize the interactive code editor
     */
    init() {
        try {
            console.log(`🎯 Initializing Interactive Code Editor for block: ${this.blockId}`);
            
            // Initialize ACE editor with lesson-specific features
            this.initializeEditor();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize UI elements
            this.setupUI();
            
            console.log(`✅ Interactive Code Editor initialized successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to initialize Interactive Code Editor:`, error);
            this.showError('Failed to initialize code editor');
        }
    }
    
    /**
     * Initialize ACE editor with enhanced features
     */
    initializeEditor() {
        if (typeof ace === 'undefined') {
            throw new Error('ACE editor not loaded');
        }
        
        const editorElement = document.getElementById(this.editorId);
        if (!editorElement) {
            throw new Error(`Editor element not found: ${this.editorId}`);
        }
        
        // Initialize ACE editor
        this.editor = ace.edit(this.editorId);
        
        // Configure editor
        this.editor.setTheme(`ace/theme/${this.config.theme}`);
        this.editor.session.setMode(`ace/mode/${this.config.language}`);
        
        // Set editor options optimized for lessons
        this.editor.setOptions({
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            fontSize: 14,
            showPrintMargin: false,
            highlightActiveLine: true,
            showGutter: true,
            displayIndentGuides: true,
            wrap: true,
            maxLines: 30,
            minLines: 10
        });
        
        // Set starter code
        this.editor.setValue(this.config.starterCode, -1);
        
        // Add lesson-specific keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Track code changes for analytics
        this.editor.on('change', () => {
            this.onCodeChange();
        });
    }
    
    /**
     * Set up keyboard shortcuts for enhanced productivity
     */
    setupKeyboardShortcuts() {
        // Ctrl/Cmd + Enter to run code
        this.editor.commands.addCommand({
            name: 'runCode',
            bindKey: { win: 'Ctrl-Enter', mac: 'Cmd-Enter' },
            exec: () => {
                this.runCode();
            }
        });
        
        // Ctrl/Cmd + / for comments
        this.editor.commands.addCommand({
            name: 'toggleComment',
            bindKey: { win: 'Ctrl-/', mac: 'Cmd-/' },
            exec: () => {
                this.editor.toggleCommentLines();
            }
        });
        
        // F1 for hint
        this.editor.commands.addCommand({
            name: 'showHint',
            bindKey: 'F1',
            exec: () => {
                this.showHint();
            }
        });
    }
    
    /**
     * Set up event listeners for UI interactions
     */
    setupEventListeners() {
        // Run code button
        const runButton = document.getElementById(`run-btn-${this.blockId}`);
        if (runButton) {
            runButton.addEventListener('click', () => this.runCode());
        }
        
        // Reset code button
        const resetButton = document.getElementById(`reset-btn-${this.blockId}`);
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetCode());
        }
        
        // Hint button
        const hintButton = document.getElementById(`hint-btn-${this.blockId}`);
        if (hintButton) {
            hintButton.addEventListener('click', () => this.showHint());
        }
        
        // Solution button
        const solutionButton = document.getElementById(`solution-btn-${this.blockId}`);
        if (solutionButton) {
            solutionButton.addEventListener('click', () => this.showSolution());
        }
    }
    
    /**
     * Set up UI elements and containers
     */
    setupUI() {
        // Ensure output container exists
        const outputContainer = document.getElementById(`output-${this.blockId}`);
        if (!outputContainer) {
            console.warn(`Output container not found for block: ${this.blockId}`);
        }
        
        // Ensure test results container exists
        const testsContainer = document.getElementById(`tests-${this.blockId}`);
        if (!testsContainer && this.config.enableTests) {
            console.warn(`Tests container not found for block: ${this.blockId}`);
        }
        
        // Update button states
        this.updateButtonStates();
    }
    
    /**
     * Run code with existing Piston API integration
     */
    async runCode() {
        if (this.isRunning) {
            console.log('Code execution already in progress');
            return;
        }
        
        try {
            this.isRunning = true;
            this.updateButtonStates();
            this.showRunningState();
            
            const code = this.editor.getValue();
            
            if (!code.trim()) {
                this.showError('Please write some code first!');
                return;
            }
            
            console.log(`🚀 Running code for block: ${this.blockId}`);
            
            // Use existing code execution endpoint
            const response = await fetch('/run_python', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    inputs: '' // Can be extended for challenges that require input
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.displayOutput(result.output || 'Code executed successfully!');
                
                // Run tests if enabled
                if (this.config.enableTests && this.tests.length > 0) {
                    await this.validateTests(code, result);
                }
                
            } else {
                this.showError(result.error || 'Code execution failed');
            }
            
        } catch (error) {
            console.error('Code execution error:', error);
            this.showError('Failed to execute code. Please try again.');
            
        } finally {
            this.isRunning = false;
            this.updateButtonStates();
        }
    }
    
    /**
     * Validate code against test cases
     */
    async validateTests(code, executionResult) {
        try {
            console.log(`🧪 Running ${this.tests.length} tests for block: ${this.blockId}`);
            
            const testResults = [];
            
            for (let i = 0; i < this.tests.length; i++) {
                const test = this.tests[i];
                const testResult = await this.runSingleTest(code, test, i);
                testResults.push(testResult);
            }
            
            this.displayTestResults(testResults);
            
            // Check if all tests passed
            const allPassed = testResults.every(result => result.passed);
            
            if (allPassed) {
                this.onAllTestsPassed();
            }
            
        } catch (error) {
            console.error('Test validation error:', error);
            this.showError('Failed to run tests');
        }
    }
    
    /**
     * Run a single test case
     */
    async runSingleTest(code, test, index) {
        try {
            // Prepare test code
            const testCode = `
${code}

# Test case ${index + 1}
try:
    ${test.setup || ''}
    result = ${test.assertion}
    print(f"TEST_RESULT: {result}")
except Exception as e:
    print(f"TEST_ERROR: {str(e)}")
`;
            
            const response = await fetch('/run_python', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: testCode,
                    inputs: test.input || ''
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                const output = result.output || '';
                
                if (output.includes('TEST_RESULT: True')) {
                    return {
                        passed: true,
                        message: test.description || `Test ${index + 1} passed`,
                        output: output
                    };
                } else if (output.includes('TEST_ERROR:')) {
                    const errorMsg = output.split('TEST_ERROR: ')[1] || 'Unknown error';
                    return {
                        passed: false,
                        message: `Test ${index + 1} failed: ${errorMsg}`,
                        output: output
                    };
                } else {
                    return {
                        passed: false,
                        message: test.expected_error || `Test ${index + 1} failed`,
                        output: output
                    };
                }
            } else {
                return {
                    passed: false,
                    message: `Test ${index + 1} execution error: ${result.error}`,
                    output: result.error
                };
            }
            
        } catch (error) {
            return {
                passed: false,
                message: `Test ${index + 1} system error: ${error.message}`,
                output: error.message
            };
        }
    }
    
    /**
     * Show hint with PyCoins integration
     */
    async showHint() {
        if (this.hints.length === 0) {
            this.showError('No hints available for this challenge');
            return;
        }
        
        try {
            // Check if user has enough PyCoins (cost: 5 PyCoins per hint)
            const response = await fetch('/api/spend-coins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 5,
                    item: 'hint',
                    block_id: this.blockId
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show the hint
                const hint = this.hints[this.currentHintIndex];
                this.displayHint(hint);
                
                // Move to next hint for subsequent requests
                this.currentHintIndex = Math.min(this.currentHintIndex + 1, this.hints.length - 1);
                
                // Update UI to reflect PyCoins spent
                this.updateCoinsDisplay(result.remaining_coins);
                
            } else {
                this.showError(result.error || 'Insufficient PyCoins for hint!');
            }
            
        } catch (error) {
            console.error('Hint system error:', error);
            
            // Fallback: show hint without PyCoins check in dev mode
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                const hint = this.hints[this.currentHintIndex];
                this.displayHint(hint);
                this.currentHintIndex = Math.min(this.currentHintIndex + 1, this.hints.length - 1);
            } else {
                this.showError('Hint system temporarily unavailable');
            }
        }
    }
    
    /**
     * Show solution (typically for completed challenges)
     */
    showSolution() {
        if (!this.config.solution) {
            this.showError('Solution not available for this challenge');
            return;
        }
        
        const solutionContainer = document.getElementById(`solution-${this.blockId}`);
        if (solutionContainer) {
            solutionContainer.style.display = 'block';
            solutionContainer.innerHTML = `
                <div class="alert alert-info">
                    <h5>✅ Solution:</h5>
                    <p>${this.config.solution.explanation || 'Here\'s one way to solve this challenge:'}</p>
                    <pre class="solution-code"><code class="language-python">${this.config.solution.code}</code></pre>
                </div>
            `;
        }
    }
    
    /**
     * Reset code to starter code
     */
    resetCode() {
        this.editor.setValue(this.config.starterCode, -1);
        this.clearOutput();
        this.clearTests();
        console.log(`🔄 Code reset for block: ${this.blockId}`);
    }
    
    /**
     * Handle code changes for analytics
     */
    onCodeChange() {
        // Track code changes for analytics (debounced)
        clearTimeout(this.changeTimeout);
        this.changeTimeout = setTimeout(() => {
            this.trackCodeChange();
        }, 1000);
    }
    
    /**
     * Track code changes for learning analytics
     */
    trackCodeChange() {
        const codeLength = this.editor.getValue().length;
        
        // Send analytics data (non-blocking)
        fetch('/api/track-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'code_change',
                block_id: this.blockId,
                data: {
                    code_length: codeLength,
                    timestamp: Date.now()
                }
            })
        }).catch(error => {
            // Silently fail for analytics
            console.debug('Analytics tracking failed:', error);
        });
    }
    
    /**
     * Handle successful completion of all tests
     */
    async onAllTestsPassed() {
        try {
            console.log(`🎉 All tests passed for block: ${this.blockId}`);
            
            // Award XP and PyCoins
            const response = await fetch('/api/complete-block', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    block_id: this.blockId,
                    lesson_id: window.lessonData?.id,
                    code: this.editor.getValue()
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(
                    `🎉 Challenge completed! +${result.xp_earned} XP, +${result.coins_earned} PyCoins`
                );
                
                // Update progress tracking
                if (window.progressTracker) {
                    window.progressTracker.markBlockComplete(this.blockId);
                }
                
                // Update UI stats
                this.updateUserStats(result.xp_earned, result.coins_earned);
            }
            
        } catch (error) {
            console.error('Block completion error:', error);
            this.showSuccess('🎉 Challenge completed!'); // Show success anyway
        }
    }
    
    /**
     * Display methods for output and feedback
     */
    showRunningState() {
        const outputContainer = document.getElementById(`output-${this.blockId}`);
        if (outputContainer) {
            outputContainer.innerHTML = `
                <div class="execution-status running">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Running code...</span>
                </div>
            `;
        }
    }
    
    displayOutput(output) {
        const outputContainer = document.getElementById(`output-${this.blockId}`);
        if (outputContainer) {
            outputContainer.innerHTML = `
                <div class="execution-output">
                    <div class="output-header">
                        <i class="fas fa-terminal"></i> Output:
                    </div>
                    <pre class="output-content">${output}</pre>
                </div>
            `;
        }
    }
    
    displayTestResults(results) {
        const testsContainer = document.getElementById(`tests-${this.blockId}`);
        if (!testsContainer) return;
        
        const allPassed = results.every(r => r.passed);
        
        testsContainer.innerHTML = `
            <div class="test-results ${allPassed ? 'all-passed' : 'some-failed'}">
                <h5>🧪 Test Results:</h5>
                <div class="test-list">
                    ${results.map((result, index) => `
                        <div class="test-item ${result.passed ? 'passed' : 'failed'}">
                            <i class="fas fa-${result.passed ? 'check' : 'times'}"></i>
                            <span>${result.message}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    displayHint(hint) {
        const hintContainer = document.getElementById(`hint-${this.blockId}`);
        if (hintContainer) {
            hintContainer.style.display = 'block';
            hintContainer.innerHTML = `
                <div class="alert alert-info hint-alert">
                    <h5>💡 Hint:</h5>
                    <p>${hint}</p>
                    <small class="hint-cost">Cost: 5 PyCoins</small>
                </div>
            `;
        }
    }
    
    showError(message) {
        const outputContainer = document.getElementById(`output-${this.blockId}`);
        if (outputContainer) {
            outputContainer.innerHTML = `
                <div class="execution-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${message}</span>
                </div>
            `;
        }
    }
    
    showSuccess(message) {
        const outputContainer = document.getElementById(`output-${this.blockId}`);
        if (outputContainer) {
            outputContainer.innerHTML = `
                <div class="execution-success">
                    <i class="fas fa-check-circle"></i>
                    <span>${message}</span>
                </div>
            `;
        }
    }
    
    clearOutput() {
        const outputContainer = document.getElementById(`output-${this.blockId}`);
        if (outputContainer) {
            outputContainer.innerHTML = '';
        }
    }
    
    clearTests() {
        const testsContainer = document.getElementById(`tests-${this.blockId}`);
        if (testsContainer) {
            testsContainer.innerHTML = '';
        }
    }
    
    /**
     * Update UI states and displays
     */
    updateButtonStates() {
        const runButton = document.getElementById(`run-btn-${this.blockId}`);
        if (runButton) {
            runButton.disabled = this.isRunning;
            runButton.innerHTML = this.isRunning ? 
                '<i class="fas fa-spinner fa-spin"></i> Running...' : 
                '<i class="fas fa-play"></i> Run Code';
        }
    }
    
    updateCoinsDisplay(remainingCoins) {
        const coinsElements = document.querySelectorAll('.user-coins, #user-coins');
        coinsElements.forEach(element => {
            if (element) {
                element.textContent = remainingCoins;
            }
        });
    }
    
    updateUserStats(xpEarned, coinsEarned) {
        // Update XP display
        const xpElements = document.querySelectorAll('.user-xp, #user-xp');
        xpElements.forEach(element => {
            if (element) {
                const currentXP = parseInt(element.textContent) || 0;
                element.textContent = currentXP + xpEarned;
            }
        });
        
        // Update PyCoins display
        const coinElements = document.querySelectorAll('.user-coins, #user-coins');
        coinElements.forEach(element => {
            if (element) {
                const currentCoins = parseInt(element.textContent) || 0;
                element.textContent = currentCoins + coinsEarned;
            }
        });
    }
    
    /**
     * Public API methods
     */
    getValue() {
        return this.editor ? this.editor.getValue() : '';
    }
    
    setValue(code) {
        if (this.editor) {
            this.editor.setValue(code, -1);
        }
    }
    
    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }
    
    destroy() {
        if (this.editor) {
            this.editor.destroy();
        }
        clearTimeout(this.changeTimeout);
    }
}

// Export for module systems and global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractiveCodeEditor;
} else {
    window.InteractiveCodeEditor = InteractiveCodeEditor;
}
