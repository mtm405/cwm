/**
 * Enhanced Interactive Code Editor for Phase 3
 * Integrates with Phase 2 ES6 modular lesson system
 * 
 * Features:
 * - ACE editor with advanced configuration
 * - Secure code execution via backend API
 * - Real-time syntax validation
 * - Keyboard shortcuts and accessibility
 * - Mobile-optimized interface
 * - Progress tracking integration
 * - Test case validation
 * - Hint system integration
 * - Session 3 Enhancements:
 *   - Performance optimization
 *   - Advanced error handling
 *   - Auto-save functionality
 *   - Enhanced analytics
 *   - Better mobile experience
 */

export class EnhancedCodeEditor {
    constructor(editorId, blockId, options = {}) {
        this.editorId = editorId;
        this.blockId = blockId;
        this.options = {
            language: 'python',
            theme: 'monokai',
            fontSize: 14,
            enableAutocompletion: true,
            enableTests: true,
            enableHints: true,
            enableSyntaxValidation: true,
            enableMobileOptimization: true,
            enableAutoSave: true,
            enablePerformanceTracking: true,
            enableAdvancedErrorHandling: true,
            enableAnalytics: true,
            autoSaveInterval: 5000, // 5 seconds
            executionTimeout: 30000, // 30 seconds
            maxCodeLength: 10000, // 10KB limit
            starterCode: '# Write your Python code here\nprint("Hello, World!")',
            ...options
        };
        
        this.editor = null;
        this.isRunning = false;
        this.initialized = false;
        this.tests = options.tests || [];
        this.hints = options.hints || [];
        this.currentHintIndex = 0;
        
        // Session 3 enhancements
        this.autoSaveTimer = null;
        this.performanceMetrics = {
            initTime: 0,
            executionTimes: [],
            errorCount: 0,
            codeChanges: 0,
            lastSaved: null
        };
        this.analyticsData = {
            codeExecutions: 0,
            totalExecutionTime: 0,
            errors: [],
            codeVersions: []
        };
        
        // Event handlers
        this.onCompletionCallback = options.onCompletion || null;
        this.onErrorCallback = options.onError || null;
        this.onCodeChangeCallback = options.onCodeChange || null;
        this.onAutoSaveCallback = options.onAutoSave || null;
    }

    /**
     * Initialize the enhanced code editor
     */
    async initialize() {
        if (this.initialized) {
            console.log(`⚠️ Editor ${this.editorId} already initialized`);
            return;
        }

        try {
            const startTime = performance.now();
            console.log(`🎯 Initializing Enhanced Code Editor: ${this.editorId}`);
            
            // Wait for ACE to be available
            await this.waitForAce();
            
            // Initialize ACE editor
            this.initializeAceEditor();
            
            // Setup advanced features
            this.setupAdvancedFeatures();
            
            // Session 3 enhancements
            this.setupPerformanceTracking();
            this.setupAdvancedErrorHandling();
            this.setupAutoSave();
            this.setupAnalytics();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Setup mobile optimizations
            if (this.options.enableMobileOptimization) {
                this.setupMobileOptimizations();
            }
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Initial validation
            if (this.options.enableSyntaxValidation) {
                this.validateSyntax();
            }
            
            this.initialized = true;
            
            // Record performance metrics
            const endTime = performance.now();
            this.performanceMetrics.initTime = endTime - startTime;
            
            console.log(`✅ Enhanced Code Editor initialized: ${this.editorId} (${this.performanceMetrics.initTime.toFixed(2)}ms)`);
            
            // Emit initialization event
            this.emitEvent('editor:initialized', {
                editorId: this.editorId,
                blockId: this.blockId,
                initTime: this.performanceMetrics.initTime
            });
            
        } catch (error) {
            console.error(`❌ Failed to initialize Enhanced Code Editor ${this.editorId}:`, error);
            this.handleError(error, 'initialization');
            
            if (this.onErrorCallback) {
                this.onErrorCallback(error);
            }
        }
    }

    /**
     * Wait for ACE editor to be available
     */
    async waitForAce(maxAttempts = 50) {
        return new Promise((resolve, reject) => {
            if (typeof ace !== 'undefined') {
                resolve();
                return;
            }

            let attempts = 0;
            const checkAce = () => {
                attempts++;
                
                if (typeof ace !== 'undefined') {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('ACE editor failed to load within timeout'));
                } else {
                    setTimeout(checkAce, 100);
                }
            };
            
            checkAce();
        });
    }

    /**
     * Initialize ACE editor with enhanced configuration
     */
    initializeAceEditor() {
        const editorElement = document.getElementById(this.editorId);
        if (!editorElement) {
            throw new Error(`Editor element not found: ${this.editorId}`);
        }

        // Create ACE editor
        this.editor = ace.edit(this.editorId);
        
        // Configure editor theme and mode
        this.editor.setTheme(`ace/theme/${this.options.theme}`);
        this.editor.session.setMode(`ace/mode/${this.options.language}`);
        
        // Set advanced editor options
        this.editor.setOptions({
            // Autocompletion
            enableBasicAutocompletion: this.options.enableAutocompletion,
            enableLiveAutocompletion: this.options.enableAutocompletion,
            enableSnippets: true,
            
            // Visual settings
            fontSize: this.options.fontSize,
            showPrintMargin: false,
            highlightActiveLine: true,
            highlightSelectedWord: true,
            showGutter: true,
            displayIndentGuides: true,
            
            // Behavior settings
            wrap: true,
            maxLines: 50,
            minLines: 8,
            tabSize: 4,
            useSoftTabs: true,
            
            // Editor behavior
            animatedScroll: true,
            scrollPastEnd: 0.2,
            behavioursEnabled: true,
            wrapBehavioursEnabled: true
        });

        // Set initial code
        if (this.options.starterCode) {
            this.editor.setValue(this.options.starterCode, -1);
        }

        // Store original code for reset functionality
        editorElement.dataset.originalCode = this.options.starterCode || '';
    }

    /**
     * Setup advanced editor features
     */
    setupAdvancedFeatures() {
        // Enable syntax validation
        if (this.options.enableSyntaxValidation) {
            this.setupSyntaxValidation();
        }
        
        // Setup auto-save
        this.setupAutoSave();
        
        // Setup accessibility features
        this.setupAccessibility();
        
        // Setup error highlighting
        this.setupErrorHighlighting();
    }

    /**
     * Setup accessibility features for screen readers and keyboard navigation
     */
    setupAccessibility() {
        try {
            const editorElement = this.editor.container;
            
            // Add ARIA labels for screen readers
            editorElement.setAttribute('role', 'application');
            editorElement.setAttribute('aria-label', `Code editor for ${this.blockId}`);
            
            // Add keyboard navigation hints
            const helpText = document.createElement('div');
            helpText.className = 'sr-only';
            helpText.textContent = 'Press F1 for editor commands. Press Ctrl+Enter to run code.';
            editorElement.prepend(helpText);
            
            // Set up focus management
            this.editor.on('focus', () => {
                editorElement.setAttribute('aria-describedby', 'editor-shortcuts');
            });
            
            // Add keyboard shortcut for running code
            this.editor.commands.addCommand({
                name: 'runCode',
                bindKey: { win: 'Ctrl-Enter', mac: 'Cmd-Enter' },
                exec: () => this.runCode()
            });
            
            console.log('✅ Accessibility features initialized for', this.editorId);
            
        } catch (error) {
            console.warn('⚠️ Accessibility setup failed:', error);
            // Don't break the editor if accessibility fails
        }
    }

    /**
     * Setup error highlighting for syntax errors
     */
    setupErrorHighlighting() {
        try {
            // Enable ACE's built-in error highlighting
            this.editor.session.setUseWorker(true);
            
            // Listen for syntax errors and annotations
            this.editor.session.on('changeAnnotation', () => {
                const annotations = this.editor.session.getAnnotations();
                this.handleSyntaxAnnotations(annotations);
            });
            
            console.log('✅ Error highlighting initialized for', this.editorId);
            
        } catch (error) {
            console.warn('⚠️ Error highlighting setup failed:', error);
            // Don't break the editor if error highlighting fails
        }
    }

    /**
     * Setup syntax validation
     */
    setupSyntaxValidation() {
        // Enable ACE's built-in syntax checking
        this.editor.session.setUseWorker(true);
        
        // Listen for syntax errors
        this.editor.session.on('changeAnnotation', () => {
            const annotations = this.editor.session.getAnnotations();
            this.handleSyntaxAnnotations(annotations);
        });
    }

    /**
     * Handle syntax annotations from ACE editor
     */
    handleSyntaxAnnotations(annotations) {
        if (!annotations || annotations.length === 0) return;
        
        // Filter for actual syntax errors
        const syntaxErrors = annotations.filter(a => a.type === 'error');
        
        if (syntaxErrors.length > 0) {
            const errorMessages = syntaxErrors.map(error => 
                `Line ${error.row + 1}: ${error.text}`
            ).join('\n');
            
            // Show syntax errors in the output area
            this.showOutput(`Syntax Error:\n${errorMessages}`, 'error');
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        // Run code (Ctrl/Cmd + Enter)
        this.editor.commands.addCommand({
            name: 'runCode',
            bindKey: { win: 'Ctrl-Enter', mac: 'Cmd-Enter' },
            exec: () => this.runCode()
        });

        // Reset code (Ctrl/Cmd + R)
        this.editor.commands.addCommand({
            name: 'resetCode',
            bindKey: { win: 'Ctrl-R', mac: 'Cmd-R' },
            exec: () => {
                event.preventDefault();
                this.resetCode();
            }
        });

        // Show hint (F1)
        this.editor.commands.addCommand({
            name: 'showHint',
            bindKey: 'F1',
            exec: () => this.showHint()
        });

        // Toggle comment (Ctrl/Cmd + /)
        this.editor.commands.addCommand({
            name: 'toggleComment',
            bindKey: { win: 'Ctrl-/', mac: 'Cmd-/' },
            exec: () => this.editor.toggleCommentLines()
        });

        // Format code (Ctrl/Cmd + Shift + F)
        this.editor.commands.addCommand({
            name: 'formatCode',
            bindKey: { win: 'Ctrl-Shift-F', mac: 'Cmd-Shift-F' },
            exec: () => this.formatCode()
        });
    }

    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Run button
        const runButton = this.getElement(`run-btn-${this.blockId}`) || 
                          this.getElement(`${this.editorId}-run-btn`) ||
                          document.querySelector(`[data-action="run"][data-editor="${this.editorId}"]`);
        
        if (runButton) {
            runButton.addEventListener('click', () => this.runCode());
        }

        // Reset button
        const resetButton = this.getElement(`reset-btn-${this.blockId}`) ||
                           this.getElement(`${this.editorId}-reset-btn`) ||
                           document.querySelector(`[data-action="reset"][data-editor="${this.editorId}"]`);
        
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetCode());
        }

        // Hint button
        const hintButton = this.getElement(`hint-btn-${this.blockId}`) ||
                          this.getElement(`${this.editorId}-hint-btn`) ||
                          document.querySelector(`[data-action="hint"][data-editor="${this.editorId}"]`);
        
        if (hintButton) {
            hintButton.addEventListener('click', () => this.showHint());
        }

        // Solution button
        const solutionButton = this.getElement(`solution-btn-${this.blockId}`) ||
                              document.querySelector(`[data-action="solution"][data-editor="${this.editorId}"]`);
        
        if (solutionButton) {
            solutionButton.addEventListener('click', () => this.showSolution());
        }

        // Code change tracking
        this.editor.on('change', () => {
            this.onCodeChange();
        });
    }

    /**
     * Session 3 Enhancement: Setup Performance Tracking
     */
    setupPerformanceTracking() {
        if (!this.options.enablePerformanceTracking) return;
        
        console.log(`📊 Setting up performance tracking for ${this.editorId}`);
        
        // Track editor performance
        this.performanceObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.name.includes('code-execution')) {
                    this.performanceMetrics.executionTimes.push(entry.duration);
                }
            });
        });
        
        if (window.PerformanceObserver) {
            this.performanceObserver.observe({ entryTypes: ['measure'] });
        }
        
        // Track memory usage if available
        if (performance.memory) {
            this.memoryTracker = setInterval(() => {
                const memory = performance.memory;
                this.performanceMetrics.memoryUsage = {
                    used: memory.usedJSHeapSize,
                    total: memory.totalJSHeapSize,
                    limit: memory.jsHeapSizeLimit
                };
            }, 10000); // Check every 10 seconds
        }
    }

    /**
     * Session 3 Enhancement: Setup Advanced Error Handling
     */
    setupAdvancedErrorHandling() {
        if (!this.options.enableAdvancedErrorHandling) return;
        
        console.log(`🔧 Setting up advanced error handling for ${this.editorId}`);
        
        // Global error handler for the editor
        window.addEventListener('error', (event) => {
            if (event.target && event.target.id === this.editorId) {
                this.handleError(event.error, 'runtime');
            }
        });
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.editorId === this.editorId) {
                this.handleError(event.reason, 'promise');
            }
        });
        
        // Editor-specific error handling
        this.errorHandler = {
            syntax: (error) => this.handleSyntaxError(error),
            runtime: (error) => this.handleRuntimeError(error),
            network: (error) => this.handleNetworkError(error),
            timeout: (error) => this.handleTimeoutError(error)
        };
    }

    /**
     * Session 3 Enhancement: Setup Auto-Save System
     */
    setupAutoSave() {
        if (!this.options.enableAutoSave) return;
        
        console.log(`💾 Setting up auto-save for ${this.editorId}`);
        
        // Auto-save timer
        this.autoSaveTimer = setInterval(() => {
            this.autoSave();
        }, this.options.autoSaveInterval);
        
        // Save on code change (debounced)
        this.debouncedSave = this.debounce(() => {
            this.autoSave();
        }, 2000);
        
        // Save on window beforeunload
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });
    }

    /**
     * Session 3 Enhancement: Setup Analytics
     */
    setupAnalytics() {
        if (!this.options.enableAnalytics) return;
        
        console.log(`📈 Setting up analytics for ${this.editorId}`);
        
        // Track code changes
        this.analyticsTracker = {
            trackCodeExecution: (code, result, duration) => {
                this.analyticsData.codeExecutions++;
                this.analyticsData.totalExecutionTime += duration;
                
                if (!result.success) {
                    this.analyticsData.errors.push({
                        timestamp: Date.now(),
                        error: result.error,
                        code: code.substring(0, 500) // First 500 chars
                    });
                }
                
                // Send analytics to backend (if enabled)
                if (this.options.sendAnalytics) {
                    this.sendAnalytics('code-execution', {
                        blockId: this.blockId,
                        success: result.success,
                        duration: duration,
                        codeLength: code.length
                    });
                }
            },
            
            trackCodeChange: (oldCode, newCode) => {
                this.performanceMetrics.codeChanges++;
                
                // Store code version for analytics
                this.analyticsData.codeVersions.push({
                    timestamp: Date.now(),
                    length: newCode.length,
                    changes: this.calculateCodeChanges(oldCode, newCode)
                });
                
                // Keep only last 10 versions
                if (this.analyticsData.codeVersions.length > 10) {
                    this.analyticsData.codeVersions.shift();
                }
            }
        };
    }

    /**
     * Session 3 Enhancement: Advanced Error Handler
     */
    handleError(error, type = 'general') {
        console.error(`❌ Editor error (${type}):`, error);
        
        // Increment error count
        this.performanceMetrics.errorCount++;
        
        // Store error for analytics
        this.analyticsData.errors.push({
            timestamp: Date.now(),
            type: type,
            message: error.message,
            stack: error.stack
        });
        
        // Show user-friendly error message
        switch (type) {
            case 'syntax':
                this.showError('Syntax Error: Please check your code for syntax errors.');
                break;
            case 'runtime':
                this.showError('Runtime Error: An error occurred while running your code.');
                break;
            case 'network':
                this.showError('Network Error: Unable to connect to the server. Please check your internet connection.');
                break;
            case 'timeout':
                this.showError('Timeout Error: Your code is taking too long to execute. Please optimize your code.');
                break;
            default:
                this.showError('An unexpected error occurred. Please try again.');
        }
        
        // Emit error event
        this.emitEvent('editor:error', {
            editorId: this.editorId,
            blockId: this.blockId,
            type: type,
            error: error.message
        });
        
        // Send error to backend for logging (if enabled)
        if (this.options.sendErrorReports) {
            this.sendErrorReport(error, type);
        }
    }

    /**
     * Session 3 Enhancement: Auto-Save Functionality
     */
    autoSave() {
        if (!this.editor || !this.initialized) return;
        
        try {
            const code = this.editor.getValue();
            const saveKey = `code-editor-${this.editorId}-${this.blockId}`;
            
            // Save to localStorage
            localStorage.setItem(saveKey, JSON.stringify({
                code: code,
                timestamp: Date.now(),
                blockId: this.blockId,
                editorId: this.editorId
            }));
            
            this.performanceMetrics.lastSaved = Date.now();
            
            // Emit auto-save event
            this.emitEvent('editor:autoSaved', {
                editorId: this.editorId,
                blockId: this.blockId,
                timestamp: this.performanceMetrics.lastSaved
            });
            
            // Call callback if provided
            if (this.onAutoSaveCallback) {
                this.onAutoSaveCallback(code);
            }
            
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    /**
     * Session 3 Enhancement: Load Auto-Saved Code
     */
    loadAutoSaved() {
        try {
            const saveKey = `code-editor-${this.editorId}-${this.blockId}`;
            const savedData = localStorage.getItem(saveKey);
            
            if (savedData) {
                const parsed = JSON.parse(savedData);
                if (parsed.code && parsed.timestamp) {
                    // Check if save is recent (within 24 hours)
                    const timeDiff = Date.now() - parsed.timestamp;
                    if (timeDiff < 24 * 60 * 60 * 1000) {
                        this.editor.setValue(parsed.code, -1);
                        console.log(`✅ Auto-saved code loaded for ${this.editorId}`);
                        return true;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load auto-saved code:', error);
        }
        return false;
    }

    /**
     * Session 3 Enhancement: Performance Metrics
     */
    getPerformanceMetrics() {
        const avgExecutionTime = this.performanceMetrics.executionTimes.length > 0
            ? this.performanceMetrics.executionTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.executionTimes.length
            : 0;
        
        return {
            initTime: this.performanceMetrics.initTime,
            avgExecutionTime: avgExecutionTime,
            errorCount: this.performanceMetrics.errorCount,
            codeChanges: this.performanceMetrics.codeChanges,
            lastSaved: this.performanceMetrics.lastSaved,
            memoryUsage: this.performanceMetrics.memoryUsage,
            analyticsData: this.analyticsData
        };
    }

    /**
     * Session 3 Enhancement: Send Analytics to Backend
     */
    async sendAnalytics(eventType, data) {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventType: eventType,
                    editorId: this.editorId,
                    blockId: this.blockId,
                    timestamp: Date.now(),
                    data: data
                })
            });
        } catch (error) {
            console.error('Failed to send analytics:', error);
        }
    }

    /**
     * Session 3 Enhancement: Utility Functions
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    calculateCodeChanges(oldCode, newCode) {
        // Simple diff calculation
        const oldLines = oldCode.split('\n');
        const newLines = newCode.split('\n');
        
        return {
            linesAdded: Math.max(0, newLines.length - oldLines.length),
            linesRemoved: Math.max(0, oldLines.length - newLines.length),
            totalLines: newLines.length
        };
    }

    /**
     * Session 3 Enhancement: Enhanced Mobile Optimizations
     */
    setupMobileOptimizations() {
        // Check if device is mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                        window.innerWidth <= 768;
        
        if (isMobile) {
            console.log(`📱 Setting up mobile optimizations for ${this.editorId}`);
            
            // Adjust editor options for mobile
            this.editor.setOptions({
                fontSize: 16, // Larger font for mobile
                showGutter: false, // Hide line numbers on small screens
                scrollPastEnd: 0.5,
                maxLines: 20, // Limit height on mobile
                behavioursEnabled: true,
                wrapBehavioursEnabled: true,
                dragDelay: 150, // Improve touch responsiveness
                focusTimeout: 100
            });

            // Add mobile-specific CSS class
            document.getElementById(this.editorId).classList.add('mobile-editor');
            
            // Setup touch-friendly controls
            this.setupTouchControls();
            
            // Setup virtual keyboard handling
            this.setupVirtualKeyboard();
        }
    }

    /**
     * Session 3 Enhancement: Touch Controls
     */
    setupTouchControls() {
        const editorElement = document.getElementById(this.editorId);
        
        // Add touch event listeners
        editorElement.addEventListener('touchstart', this.handleTouchStart.bind(this));
        editorElement.addEventListener('touchmove', this.handleTouchMove.bind(this));
        editorElement.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Add swipe gestures for mobile navigation
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }

    handleTouchMove(event) {
        if (!this.touchStartX || !this.touchStartY) return;
        
        const touchEndX = event.touches[0].clientX;
        const touchEndY = event.touches[0].clientY;
        
        const deltaX = this.touchStartX - touchEndX;
        const deltaY = this.touchStartY - touchEndY;
        
        // Prevent default for horizontal swipes (to avoid accidental navigation)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            event.preventDefault();
        }
    }

    handleTouchEnd(event) {
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    /**
     * Session 3 Enhancement: Virtual Keyboard Handling
     */
    setupVirtualKeyboard() {
        // Handle virtual keyboard appearance/disappearance
        const originalHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDiff = originalHeight - currentHeight;
            
            if (heightDiff > 150) { // Virtual keyboard likely appeared
                this.handleVirtualKeyboardShow();
            } else {
                this.handleVirtualKeyboardHide();
            }
        });
    }

    handleVirtualKeyboardShow() {
        console.log('📱 Virtual keyboard shown');
        // Adjust editor height for virtual keyboard
        const editorElement = document.getElementById(this.editorId);
        if (editorElement) {
            editorElement.style.height = '200px'; // Reduced height
            this.editor.resize();
        }
    }

    handleVirtualKeyboardHide() {
        console.log('📱 Virtual keyboard hidden');
        // Restore original editor height
        const editorElement = document.getElementById(this.editorId);
        if (editorElement) {
            editorElement.style.height = ''; // Reset to original
            this.editor.resize();
        }
    }
    
    // Enhanced code change tracking
    onCodeChange() {
        const currentCode = this.editor.getValue();
        const previousCode = this.lastCode || '';
        
        // Track code changes for analytics
        if (this.options.enableAnalytics) {
            this.analyticsTracker.trackCodeChange(previousCode, currentCode);
        }
        
        // Trigger auto-save
        if (this.options.enableAutoSave && this.debouncedSave) {
            this.debouncedSave();
        }
        
        // Call callback if provided
        if (this.onCodeChangeCallback) {
            this.onCodeChangeCallback(currentCode, previousCode);
        }
        
        this.lastCode = currentCode;
    }

    /**
     * Session 3 Enhancement: Enhanced Code Execution with Performance Tracking
     */
    async runCode() {
        if (this.isRunning) {
            console.log('Code execution already in progress');
            return;
        }

        try {
            this.isRunning = true;
            const startTime = performance.now();
            
            // Update UI state
            this.updateRunButtonState(true);
            
            const code = this.editor.getValue();
            
            if (!code.trim()) {
                this.showError('Please write some code first!');
                return;
            }

            // Validate code length
            if (code.length > this.options.maxCodeLength) {
                this.showError(`Code is too long (${code.length} chars). Maximum allowed: ${this.options.maxCodeLength} chars.`);
                return;
            }

            console.log(`🚀 Running code for ${this.blockId}`);
            
            // Mark performance start
            if (this.options.enablePerformanceTracking) {
                performance.mark('code-execution-start');
            }
            
            // Show running state
            this.showRunningState();
            
            // Execute code via secure backend with timeout
            const result = await Promise.race([
                this.executeCodeWithRetry(code),
                this.createTimeoutPromise()
            ]);
            
            // Mark performance end
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            if (this.options.enablePerformanceTracking) {
                performance.mark('code-execution-end');
                performance.measure('code-execution', 'code-execution-start', 'code-execution-end');
                this.performanceMetrics.executionTimes.push(executionTime);
            }
            
            // Display results
            this.displayExecutionResult(result);
            
            // Track analytics
            if (this.options.enableAnalytics) {
                this.analyticsTracker.trackCodeExecution(code, result, executionTime);
            }
            
            // Run tests if enabled
            if (this.options.enableTests && this.tests.length > 0 && result.success) {
                await this.runTests(code, result);
            }
            
            // Call completion callback if successful
            if (result.success && this.onCompletionCallback) {
                this.onCompletionCallback({
                    blockId: this.blockId,
                    code: code,
                    result: result,
                    executionTime: executionTime
                });
            }
            
            // Emit execution event
            this.emitEvent('editor:codeExecuted', {
                editorId: this.editorId,
                blockId: this.blockId,
                success: result.success,
                executionTime: executionTime
            });
            
        } catch (error) {
            console.error('Code execution failed:', error);
            
            if (error.name === 'TimeoutError') {
                this.handleError(error, 'timeout');
            } else if (error.name === 'NetworkError') {
                this.handleError(error, 'network');
            } else {
                this.handleError(error, 'runtime');
            }
            
        } finally {
            this.isRunning = false;
            this.updateRunButtonState(false);
        }
    }

    /**
     * Session 3 Enhancement: Code Execution with Retry Logic
     */
    async executeCodeWithRetry(code, maxRetries = 3) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.executeCode(code);
            } catch (error) {
                console.warn(`Code execution attempt ${attempt} failed:`, error);
                lastError = error;
                
                if (attempt < maxRetries) {
                    // Wait before retry (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Session 3 Enhancement: Timeout Promise
     */
    createTimeoutPromise() {
        return new Promise((_, reject) => {
            setTimeout(() => {
                const error = new Error(`Code execution timed out after ${this.options.executionTimeout}ms`);
                error.name = 'TimeoutError';
                reject(error);
            }, this.options.executionTimeout);
        });
    }

    /**
     * Session 3 Enhancement: Enhanced Code Execution
     */
    async executeCode(code) {
        try {
            const response = await fetch('/run_python', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    inputs: '', // Can be extended for interactive input
                    timeout: Math.min(this.options.executionTimeout, 30000), // Cap at 30 seconds
                    blockId: this.blockId,
                    editorId: this.editorId
                })
            });

            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.name = 'NetworkError';
                throw error;
            }

            const result = await response.json();
            
            // Enhanced error handling
            if (!result.success && result.error) {
                const error = new Error(result.error);
                error.name = 'RuntimeError';
                throw error;
            }

            return {
                success: true,
                output: result.output || '',
                error: null,
                executionTime: result.executionTime || 0,
                ...result
            };
            
        } catch (error) {
            if (error.name === 'TypeError' || error.name === 'SyntaxError') {
                error.name = 'NetworkError';
            }
            
            return {
                success: false,
                output: '',
                error: error.message,
                executionTime: 0
            };
        }
    }

    /**
     * Session 3 Enhancement: Enhanced Test Execution
     */
    async runTests(code, executionResult) {
        if (!this.tests || this.tests.length === 0) return;

        console.log(`🧪 Running ${this.tests.length} tests for ${this.blockId}`);
        
        const testResults = [];
        
        for (let i = 0; i < this.tests.length; i++) {
            const test = this.tests[i];
            const testResult = await this.runSingleTest(code, test, executionResult);
            testResults.push(testResult);
        }
        
        this.displayTestResults(testResults);
        
        // Check if all tests passed
        const allPassed = testResults.every(result => result.passed);
        
        if (allPassed) {
            this.onAllTestsPassed();
        }
        
        // Track test analytics
        if (this.options.enableAnalytics) {
            this.sendAnalytics('test-execution', {
                testCount: this.tests.length,
                passedCount: testResults.filter(r => r.passed).length,
                allPassed: allPassed
            });
        }
        
        return testResults;
    }

    /**
     * Session 3 Enhancement: Enhanced Test Case Execution
     */
    async runSingleTest(code, test, executionResult) {
        try {
            // For simple tests, we can validate against the output
            if (test.expectedOutput) {
                const passed = executionResult.output?.trim() === test.expectedOutput.trim();
                return {
                    name: test.name || `Test ${test.id}`,
                    passed: passed,
                    message: passed ? 'Test passed' : `Expected: "${test.expectedOutput}", Got: "${executionResult.output?.trim()}"`
                };
            }
            
            // For regex-based tests
            if (test.outputPattern) {
                const regex = new RegExp(test.outputPattern);
                const passed = regex.test(executionResult.output || '');
                return {
                    name: test.name || `Test ${test.id}`,
                    passed: passed,
                    message: passed ? 'Test passed' : `Output does not match pattern: ${test.outputPattern}`
                };
            }
            
            // For function-based tests (more complex validation)
            if (test.testCode) {
                try {
                    // Execute test code with actual result
                    const testResponse = await fetch('/run_python', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            code: `${code}\n\n# Test code\n${test.testCode}`,
                            timeout: 5000
                        })
                    });
                    
                    const testResult = await testResponse.json();
                    
                    return {
                        name: test.name || `Test ${test.id}`,
                        passed: testResult.success && testResult.output?.includes('TEST_PASSED'),
                        message: testResult.success ? 
                            (testResult.output?.includes('TEST_PASSED') ? 'Test passed' : 'Test failed') :
                            `Test error: ${testResult.error}`
                    };
                } catch (error) {
                    return {
                        name: test.name || `Test ${test.id}`,
                        passed: false,
                        message: `Test execution error: ${error.message}`
                    };
                }
            }
            
            return {
                name: test.name || 'Unknown test',
                passed: false,
                message: 'Invalid test configuration'
            };
            
        } catch (error) {
            return {
                name: test.name || 'Test',
                passed: false,
                message: `Test error: ${error.message}`
            };
        }
    }

    /**
     * Session 3 Enhancement: Enhanced Results Display
     */
    displayExecutionResult(result) {
        const outputElement = this.getOutputElement();
        
        if (result.success) {
            outputElement.innerHTML = 
                '<div class="execution-output">' +
                    '<div class="output-header">' +
                        '<i class="fas fa-terminal"></i> Output' +
                        '<span class="execution-time">' + (result.executionTime ? (result.executionTime.toFixed(0) + 'ms') : '') + '</span>' +
                        '<span class="success-indicator">✅</span>' +
                    '</div>' +
                    '<pre class="output-content">' + this.escapeHtml(result.output || 'Code executed successfully!') + '</pre>' +
                '</div>';
        } else {
            outputElement.innerHTML = 
                '<div class="execution-error">' +
                    '<div class="error-header">' +
                        '<i class="fas fa-exclamation-triangle"></i> Error' +
                        '<span class="error-indicator">❌</span>' +
                    '</div>' +
                    '<pre class="error-content">' + this.escapeHtml(result.error || 'Unknown error occurred') + '</pre>' +
                    '<div class="error-help">' +
                        '<small>💡 Tip: Check your syntax and try again</small>' +
                    '</div>' +
                '</div>';
        }
    }

    /**
     * Session 3 Enhancement: Enhanced Test Results Display
     */
    displayTestResults(testResults) {
        const testsElement = this.getTestsElement();
        if (!testsElement) return;
        
        const allPassed = testResults.every(r => r.passed);
        const passedCount = testResults.filter(r => r.passed).length;
        
        const testItemsHtml = testResults.map((result, index) => {
            return '<div class="test-item ' + (result.passed ? 'passed' : 'failed') + '">' +
                '<i class="fas fa-' + (result.passed ? 'check' : 'times') + '"></i>' +
                '<span class="test-name">' + result.name + '</span>' +
                '<span class="test-message">' + result.message + '</span>' +
                '</div>';
        }).join('');
        
        testsElement.innerHTML = 
            '<div class="test-results ' + (allPassed ? 'all-passed' : 'some-failed') + '">' +
                '<div class="test-header">' +
                    '<i class="fas fa-flask"></i> Tests: ' + passedCount + '/' + testResults.length + ' passed' +
                    (allPassed ? '<span class="success-badge">✅ All Tests Passed!</span>' : '<span class="failure-badge">❌ Some Tests Failed</span>') +
                '</div>' +
                '<div class="test-list">' + testItemsHtml + '</div>' +
                (allPassed ? '<div class="completion-message">🎉 Great job! All tests passed!</div>' : '') +
            '</div>';
    }

    /**
     * Session 3 Enhancement: Enhanced Completion Handler
     */
    async onAllTestsPassed() {
        console.log('🎉 All tests passed for ' + this.blockId);
        
        // Show success message
        this.showSuccess('🎉 All tests passed! Challenge completed!');
        
        // Mark block as complete
        this.markBlockComplete();
        
        // Send completion analytics
        if (this.options.enableAnalytics) {
            this.sendAnalytics('block-completed', {
                blockId: this.blockId,
                completionTime: Date.now(),
                codeExecutions: this.analyticsData.codeExecutions,
                totalTime: this.analyticsData.totalExecutionTime
            });
        }
        
        // Call completion callback
        if (this.onCompletionCallback) {
            this.onCompletionCallback({
                blockId: this.blockId,
                code: this.editor.getValue(),
                testsCompleted: true
            });
        }
        
        // Emit completion event
        this.emitEvent('editor:blockCompleted', {
            editorId: this.editorId,
            blockId: this.blockId
        });
    }

    /**
     * Session 3 Enhancement: Enhanced Error Handlers
     */
    handleSyntaxError(error) {
        this.showError('Syntax Error: ' + error.message);
    }

    handleRuntimeError(error) {
        this.showError('Runtime Error: ' + error.message);
    }

    handleNetworkError(error) {
        this.showError('Network Error: ' + error.message + '. Please check your connection.');
    }

    handleTimeoutError(error) {
        this.showError('Timeout Error: ' + error.message + '. Try optimizing your code.');
    }

    /**
     * Session 3 Enhancement: Send Error Report
     */
    async sendErrorReport(error, type) {
        try {
            await fetch('/api/error-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    editorId: this.editorId,
                    blockId: this.blockId,
                    errorType: type,
                    errorMessage: error.message,
                    errorStack: error.stack,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    code: this.editor.getValue()
                })
            });
        } catch (reportError) {
            console.error('Failed to send error report:', reportError);
        }
    }

    // ==========================================
    // Utility Methods (Enhanced from previous implementation)
    // ==========================================

    /**
     * Show hint to the user
     */
    showHint() {
        if (!this.hints || this.hints.length === 0) {
            this.showWarning('No hints available for this challenge');
            return;
        }
        
        if (this.currentHintIndex >= this.hints.length) {
            this.showWarning('No more hints available');
            return;
        }
        
        const hint = this.hints[this.currentHintIndex];
        this.displayHint(hint);
        this.currentHintIndex++;
    }

    /**
     * Display hint in the UI
     */
    displayHint(hint) {
        const hintElement = this.getHintElement();
        if (!hintElement) return;
        
        hintElement.style.display = 'block';
        hintElement.innerHTML = `
            <div class="hint-content">
                <div class="hint-header">
                    <i class="fas fa-lightbulb"></i> Hint ${this.currentHintIndex + 1}
                    <small class="hint-cost">Cost: 5 PyCoins</small>
                </div>
                <div class="hint-text">${hint}</div>
            </div>
        `;
    }

    /**
     * Reset code to original starter code
     */
    resetCode() {
        const originalCode = document.getElementById(this.editorId).dataset.originalCode || 
                           this.options.starterCode || 
                           '# Write your code here\n';
        
        this.editor.setValue(originalCode, -1);
        this.clearOutput();
        this.clearTests();
        this.clearHints();
        
        console.log(`🔄 Code reset for ${this.blockId}`);
        
        // Emit reset event
        this.emitEvent('editor:codeReset', {
            editorId: this.editorId,
            blockId: this.blockId
        });
    }

    /**
     * Utility methods
     */
    getElement(id) {
        return document.getElementById(id);
    }

    getOutputElement() {
        return this.getElement(`output-${this.blockId}`) || 
               this.getElement(`${this.editorId}-output`) ||
               this.createOutputElement();
    }

    getTestsElement() {
        return this.getElement(`tests-${this.blockId}`) ||
               this.getElement(`${this.editorId}-tests`);
    }

    getHintElement() {
        return this.getElement(`hint-${this.blockId}`) ||
               this.getElement(`${this.editorId}-hint`);
    }

    createOutputElement() {
        const container = document.getElementById(this.editorId).parentNode;
        const outputElement = document.createElement('div');
        outputElement.id = `output-${this.blockId}`;
        outputElement.className = 'code-output';
        container.appendChild(outputElement);
        return outputElement;
    }

    showRunningState() {
        const outputElement = this.getOutputElement();
        outputElement.innerHTML = `
            <div class="execution-status running">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Running code...</span>
            </div>
        `;
    }

    showError(message) {
        const outputElement = this.getOutputElement();
        outputElement.innerHTML = `
            <div class="execution-error">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;
    }

    showSuccess(message) {
        const outputElement = this.getOutputElement();
        outputElement.innerHTML = `
            <div class="execution-success">
                <i class="fas fa-check-circle"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;
    }

    showWarning(message) {
        const outputElement = this.getOutputElement();
        outputElement.innerHTML = `
            <div class="execution-warning">
                <i class="fas fa-exclamation-circle"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;
    }

    clearOutput() {
        const outputElement = this.getOutputElement();
        outputElement.innerHTML = '';
    }

    clearTests() {
        const testsElement = this.getTestsElement();
        if (testsElement) {
            testsElement.innerHTML = '';
        }
    }

    clearHints() {
        const hintElement = this.getHintElement();
        if (hintElement) {
            hintElement.style.display = 'none';
        }
    }

    updateRunButtonState(isRunning) {
        const runButton = this.getElement(`run-btn-${this.blockId}`) ||
                         document.querySelector(`[data-action="run"][data-editor="${this.editorId}"]`);
        
        if (runButton) {
            runButton.disabled = isRunning;
            runButton.innerHTML = isRunning ? 
                '<i class="fas fa-spinner fa-spin"></i> Running...' : 
                '<i class="fas fa-play"></i> Run Code';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    emitEvent(eventName, data) {
        // Use global event bus if available
        if (window.eventBus && typeof window.eventBus.emit === 'function') {
            window.eventBus.emit(eventName, data);
        }
        
        // Also dispatch custom DOM event
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    /**
     * Get current code
     */
    getCode() {
        return this.editor ? this.editor.getValue() : '';
    }

    /**
     * Set code
     */
    setCode(code) {
        if (this.editor) {
            this.editor.setValue(code, -1);
        }
    }

    /**
     * Focus the editor
     */
    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    /**
     * Reset code to original starter code (alias for resetCode)
     */
    reset() {
        return this.resetCode();
    }

    /**
     * Destroy the editor
     */
    destroy() {
        // Clear timers
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        if (this.memoryTracker) {
            clearInterval(this.memoryTracker);
        }
        
        // Disconnect observers
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        // Destroy ACE editor
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
        
        this.initialized = false;
        
        console.log(`🗑️ Enhanced Code Editor destroyed: ${this.editorId}`);
    }
}

// Export for global access
window.EnhancedCodeEditor = EnhancedCodeEditor;
