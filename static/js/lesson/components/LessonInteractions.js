/**
 * Lesson Interactions Component
 * Handles user interactions with lesson content
 * Updated for Phase 3: Enhanced Code Editor Integration
 */

// Dynamic import to avoid blocking initialization
let EnhancedCodeEditor = null;

export class LessonInteractions {
    constructor() {
        this.codeEditors = new Map();
        this.lessonData = null;
        this.userProgress = null;
        this.initialized = false;
        
        // Initialize bound handlers to prevent undefined errors
        this.boundHandleClick = null;
        this.boundHandleKeydown = null;
        
        // Pre-bind event handlers - ensure methods exist first
        try {
            this.bindEventHandlers();
            console.log('✅ LessonInteractions constructor completed successfully');
        } catch (error) {
            console.error('❌ Error in LessonInteractions constructor:', error);
            // Provide fallback handlers
            this.boundHandleClick = () => {};
            this.boundHandleKeydown = () => {};
        }
    }
    
    /**
     * Safely bind event handlers
     */
    bindEventHandlers() {
        // Use arrow functions to automatically bind context
        try {
            // Ensure methods exist before binding
            if (typeof this.handleClick === 'function') {
                this.boundHandleClick = (event) => this.handleClick(event);
            } else {
                console.warn('⚠️ handleClick method not found during binding');
                this.boundHandleClick = () => {};
            }
            
            if (typeof this.handleKeydown === 'function') {
                this.boundHandleKeydown = (event) => this.handleKeydown(event);
            } else {
                console.warn('⚠️ handleKeydown method not found during binding');
                this.boundHandleKeydown = () => {};
            }
            
            console.log('✅ Event handlers bound successfully');
        } catch (error) {
            console.error('❌ Failed to bind event handlers:', error);
            // Provide fallback handlers
            this.boundHandleClick = () => {};
            this.boundHandleKeydown = () => {};
        }
    }
    
    initialize(lessonData, userProgress) {
        this.lessonData = lessonData;
        this.userProgress = userProgress;
        
        console.log('🎮 Initializing lesson interactions...');
        
        try {
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize code editors
            this.initializeCodeEditors();
            
            // Initialize quiz interactions
            this.initializeQuizzes();
            
            this.initialized = true;
            console.log('✅ Lesson interactions initialized');
        } catch (error) {
            console.error('❌ Failed to initialize lesson interactions:', error);
            throw error;
        }
    }
    
    setupEventListeners() {
        try {
            // Ensure bound handlers exist before using them
            if (!this.boundHandleClick || !this.boundHandleKeydown) {
                console.warn('⚠️ Event handlers not bound, rebinding...');
                this.bindEventHandlers();
            }
            
            // Remove existing listeners to avoid duplicates
            if (this.boundHandleClick) {
                document.removeEventListener('click', this.boundHandleClick);
            }
            if (this.boundHandleKeydown) {
                document.removeEventListener('keydown', this.boundHandleKeydown);
            }
            
            // Add event listeners with pre-bound handlers
            if (this.boundHandleClick) {
                document.addEventListener('click', this.boundHandleClick);
            }
            if (this.boundHandleKeydown) {
                document.addEventListener('keydown', this.boundHandleKeydown);
            }
            
            console.log('👂 Event listeners set up successfully');
        } catch (error) {
            console.error('❌ Failed to setup event listeners:', error);
            throw error;
        }
    }
    
    handleClick(event) {
        const target = event.target;
        const closest = (selector) => target.closest(selector);
        
        // Complete button clicks
        if (target.classList.contains('complete-btn')) {
            event.preventDefault();
            const blockId = target.dataset.blockId;
            this.markBlockComplete(blockId);
        }
        
        // Run button clicks
        else if (target.classList.contains('run-btn')) {
            event.preventDefault();
            const blockId = target.dataset.blockId;
            this.runCode(blockId);
        }
        
        // Reset button clicks
        else if (target.classList.contains('reset-btn')) {
            event.preventDefault();
            const blockId = target.dataset.blockId;
            this.resetCode(blockId);
        }
        
        // Copy button clicks
        else if (target.classList.contains('btn-copy')) {
            event.preventDefault();
            const blockId = target.dataset.blockId;
            this.copyCode(blockId);
        }
        
        // Quiz answer selections
        else if (closest('.quiz-option')) {
            this.handleQuizAnswer(closest('.quiz-option'));
        }
    }
    
    handleKeydown(event) {
        // Keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'Enter':
                    // Ctrl+Enter to run code in focused editor
                    const activeEditor = document.activeElement.closest('.code-editor');
                    if (activeEditor) {
                        event.preventDefault();
                        const blockId = activeEditor.id.replace('editor-', '');
                        this.runCode(blockId);
                    }
                    break;
                    
                case 's':
                    // Ctrl+S to save progress
                    event.preventDefault();
                    this.saveProgress();
                    break;
            }
        }
    }
    
    initializeCodeEditors() {
        const codeEditors = document.querySelectorAll('.code-editor');
        
        codeEditors.forEach(async (editorElement) => {
            await this.initializeCodeEditor(editorElement);
        });
        
        console.log(`📝 Initialized ${codeEditors.length} enhanced code editors`);
    }
    
    async initializeCodeEditor(editorElement) {
        const editorId = editorElement.id;
        const blockId = editorId.replace('editor-', '');
        const language = editorElement.dataset.language || 'python';
        const initialCode = editorElement.textContent.trim();
        
        try {
            console.log(`🎯 Initializing Enhanced Code Editor for block: ${blockId}`);
            
            // Dynamic import of EnhancedCodeEditor
            if (!EnhancedCodeEditor) {
                try {
                    const module = await import('./EnhancedCodeEditor.js');
                    EnhancedCodeEditor = module.EnhancedCodeEditor;
                } catch (importError) {
                    console.warn('⚠️ Failed to load EnhancedCodeEditor, using fallback:', importError);
                    await this.initializeFallbackEditor(editorElement, initialCode);
                    return;
                }
            }
            
            // Get block data for enhanced configuration
            const blockData = this.lessonData?.blocks?.find(b => b.id === blockId);
            
            // Create enhanced editor configuration
            const editorOptions = {
                language: language,
                theme: 'monokai',
                fontSize: 14,
                enableAutocompletion: true,
                enableTests: true,
                enableHints: true,
                enableSyntaxValidation: true,
                enableMobileOptimization: true,
                starterCode: initialCode || blockData?.starter_code || '# Write your Python code here\nprint("Hello, World!")',
                tests: blockData?.tests || [],
                hints: blockData?.hints || [],
                onCompletion: (result) => this.handleCodeCompletion(blockId, result),
                onError: (error) => this.handleCodeError(blockId, error)
            };
            
            // Create and initialize enhanced editor
            const enhancedEditor = new EnhancedCodeEditor(editorId, blockId, editorOptions);
            await enhancedEditor.initialize();
            
            // Store editor reference
            this.codeEditors.set(editorId, enhancedEditor);
            
            console.log(`✅ Enhanced Code Editor initialized: ${editorId}`);
            
        } catch (error) {
            console.error(`❌ Failed to initialize enhanced editor ${editorId}:`, error);
            
            // Fallback to basic initialization
            await this.initializeFallbackEditor(editorElement, initialCode);
        }
    }
    
    initializeFallbackEditor(editorElement, initialCode) {
        const editorId = editorElement.id;
        const blockId = editorId.replace('editor-', '');
        
        console.log(`🔄 Initializing fallback editor for: ${editorId}`);
        
        // Convert to textarea with enhanced styling
        const textarea = document.createElement('textarea');
        textarea.id = editorId;
        textarea.className = 'fallback-code-editor';
        textarea.value = initialCode;
        textarea.rows = Math.max(8, initialCode.split('\n').length + 2);
        
        // Enhanced textarea styling
        textarea.style.cssText = `
            width: 100%;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            background: #1e1e1e;
            color: #d4d4d4;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 12px;
            resize: vertical;
            line-height: 1.5;
            tab-size: 4;
        `;
        
        // Add tab support
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 4;
            }
            
            // Ctrl+Enter to run code
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runCode(blockId);
            }
        });
        
        // Replace original element
        editorElement.parentNode.replaceChild(textarea, editorElement);
        
        // Create fallback editor wrapper with basic API compatibility
        const fallbackEditor = {
            getCode: () => textarea.value,
            setCode: (code) => textarea.value = code,
            getValue: () => textarea.value,  // ACE compatibility
            setValue: (code) => textarea.value = code,  // ACE compatibility
            focus: () => textarea.focus(),
            destroy: () => textarea.remove(),
            initialized: true,
            isFallback: true
        };
        
        // Store reference
        this.codeEditors.set(editorId, fallbackEditor);
        
        console.log(`✅ Fallback editor initialized: ${editorId}`);
    }
    
    async runCode(blockId) {
        const editorId = `editor-${blockId}`;
        const editor = this.codeEditors.get(editorId);
        
        if (!editor) {
            console.error(`Editor not found: ${editorId}`);
            return;
        }
        
        try {
            // If it's an EnhancedCodeEditor, use its built-in runCode method
            if (editor.runCode && typeof editor.runCode === 'function') {
                console.log(`🚀 Running code via EnhancedCodeEditor for block: ${blockId}`);
                await editor.runCode();
                return;
            }
            
            // Fallback for legacy editors
            console.log(`🔄 Running code via fallback method for block: ${blockId}`);
            await this.runCodeFallback(blockId, editor);
            
        } catch (error) {
            console.error(`❌ Code execution failed for block ${blockId}:`, error);
            this.handleCodeError(blockId, error);
        }
    }
    
    async runCodeFallback(blockId, editor) {
        const outputElement = document.getElementById(`output-${blockId}`);
        
        if (!outputElement) {
            console.error(`Output element not found: output-${blockId}`);
            return;
        }
        
        // Get code from editor
        const code = editor.getCode ? editor.getCode() : 
                    editor.getValue ? editor.getValue() : 
                    editor.value;
        
        if (!code || !code.trim()) {
            this.showOutputError(outputElement, 'Please write some code first!');
            return;
        }
        
        // Show output container and loading state
        outputElement.style.display = 'block';
        outputElement.innerHTML = `
            <div class="output-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Running code...</span>
            </div>
        `;
        
        try {
            console.log(`🔄 Executing code for block ${blockId}`);
            
            // Execute code via the new secure API endpoint
            const response = await fetch('/run_python', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    code: code,
                    inputs: '',
                    timeout: 10000
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Display result
            this.displayCodeResult(outputElement, result);
            
            // Mark as complete if successful and no errors
            if (result.success && !result.error) {
                // Prepare assessment results for simple code execution
                const assessmentResults = {
                    success: true,
                    score: 100,
                    passed: true,
                    tests_passed: 1,
                    total_tests: 1,
                    output: result.output,
                    error: null,
                    timestamp: Date.now(),
                    attempts: 1
                };
                
                setTimeout(() => {
                    this.markBlockComplete(blockId, assessmentResults);
                }, 1000);
            }
            
            console.log(`✅ Code execution completed for block ${blockId}`);
            
        } catch (error) {
            console.error('❌ Code execution failed:', error);
            this.showOutputError(outputElement, error.message);
        }
    }
    
    showOutputError(outputElement, message) {
        outputElement.innerHTML = `
            <div class="execution-error">
                <div class="error-header">
                    <i class="fas fa-exclamation-triangle"></i> Error
                </div>
                <pre class="error-content">${this.escapeHtml(message)}</pre>
            </div>
        `;
    }
    
    displayCodeResult(outputElement, result) {
        const outputContent = outputElement.querySelector('.output-content');
        const isSuccess = result.success && !result.error;
        
        outputContent.innerHTML = `
            <div class="output-result ${isSuccess ? 'output-success' : 'output-error'}">
                ${result.output ? `
                    <div class="output-text">
                        <pre>${this.escapeHtml(result.output)}</pre>
                    </div>
                ` : ''}
                
                ${result.error ? `
                    <div class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Error:</strong> ${this.escapeHtml(result.error)}
                    </div>
                ` : ''}
                
                ${isSuccess ? `
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        <strong>Success!</strong> Code executed successfully.
                    </div>
                ` : ''}
                
                ${result.tests_passed !== undefined ? `
                    <div class="test-results">
                        <strong>Tests:</strong> ${result.tests_passed} passed, ${result.tests_failed || 0} failed
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    resetCode(blockId) {
        const editorId = `editor-${blockId}`;
        const editor = this.codeEditors.get(editorId);
        
        if (!editor) {
            console.error(`Editor not found: ${editorId}`);
            return;
        }
        
        try {
            // If it's an EnhancedCodeEditor, use its built-in resetCode method
            if (editor.resetCode && typeof editor.resetCode === 'function') {
                console.log(`🔄 Resetting code via EnhancedCodeEditor for block: ${blockId}`);
                editor.resetCode();
                return;
            }
            
            // Fallback for legacy editors
            console.log(`🔄 Resetting code via fallback method for block: ${blockId}`);
            this.resetCodeFallback(blockId, editor);
            
        } catch (error) {
            console.error(`❌ Code reset failed for block ${blockId}:`, error);
        }
    }
    
    resetCodeFallback(blockId, editor) {
        const outputElement = document.getElementById(`output-${blockId}`);
        
        // Find the original starter code from lesson data
        const block = this.lessonData?.blocks?.find(b => b.id === blockId);
        const starterCode = block?.starter_code || '# Write your code here';
        
        // Reset editor content
        if (editor.setCode) {
            editor.setCode(starterCode);
        } else if (editor.setValue) {
            editor.setValue(starterCode, -1);
        } else if (editor.value !== undefined) {
            editor.value = starterCode;
        }
        
        // Hide output
        if (outputElement) {
            outputElement.style.display = 'none';
        }
        
        console.log(`🔄 Code reset for block ${blockId}`);
    }
    
    async copyCode(blockId) {
        // First try to get code from the editor
        const editorId = `editor-${blockId}`;
        const editor = this.codeEditors.get(editorId);
        
        let code = '';
        
        if (editor) {
            // Get current code from editor
            code = editor.getCode ? editor.getCode() : 
                   editor.getValue ? editor.getValue() : 
                   editor.value || '';
        }
        
        // If no code from editor, fallback to block data
        if (!code) {
            const block = this.lessonData?.blocks?.find(b => b.id === blockId);
            code = block?.code || block?.starter_code || '';
        }
        
        if (!code) {
            console.error(`No code found for block ${blockId}`);
            this.showUserFeedback('error', 'No code available to copy');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(code);
            
            // Show feedback
            const button = document.querySelector(`[data-block-id="${blockId}"].btn-copy`);
            if (button) {
                const originalHTML = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                    button.classList.remove('copied');
                }, 2000);
            }
            
            this.showUserFeedback('success', 'Code copied to clipboard!');
            console.log(`📋 Code copied for block ${blockId}`);
            
        } catch (error) {
            console.error('❌ Failed to copy code:', error);
            
            // Fallback: select the code
            this.selectCode(blockId);
            this.showUserFeedback('warning', 'Please manually copy the selected code');
        }
    }
    
    selectCode(blockId) {
        const codeElement = document.querySelector(`#block-${blockId} .code-content code`);
        if (codeElement) {
            const range = document.createRange();
            range.selectNodeContents(codeElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    async markBlockComplete(blockId, assessmentResults = null) {
        // Delegate to lesson system with assessment results
        if (window.lessonSystem) {
            return await window.lessonSystem.markBlockComplete(blockId, assessmentResults);
        }
        
        console.warn('Lesson system not available for marking completion');
        return false;
    }
    
    async saveProgress() {
        // Delegate to lesson system
        if (window.lessonSystem) {
            return await window.lessonSystem.saveProgress();
        }
        
        console.warn('Lesson system not available for saving progress');
        return false;
    }
    
    async initializeQuizzes() {
        const quizElements = document.querySelectorAll('[data-quiz-id]');
        
        if (quizElements.length === 0) {
            console.log('🧠 No quizzes found in lesson');
            return;
        }
        
        // Initialize quiz controllers map
        this.quizControllers = new Map();
        
        // Load advanced quiz system
        try {
            // Check if QuizEngine and QuizController are available
            if (!window.QuizEngine || !window.QuizController) {
                console.warn('⚠️ Advanced quiz system not available, falling back to basic implementation');
                await this.initializeFallbackQuizzes(quizElements);
                return;
            }
            
            console.log('🧠 Initializing advanced quiz system...');
            
            // Load each quiz with advanced system
            for (const quizElement of quizElements) {
                const quizId = quizElement.dataset.quizId;
                const blockId = quizElement.dataset.blockId;
                
                await this.loadAdvancedQuiz(quizId, blockId, quizElement);
            }
            
            console.log(`🧠 Initialized ${quizElements.length} advanced quizzes`);
            
        } catch (error) {
            console.error('❌ Failed to initialize advanced quiz system:', error);
            // Fallback to basic quiz placeholders
            await this.initializeFallbackQuizzes(quizElements);
        }
    }
    
    async loadAdvancedQuiz(quizId, blockId, quizElement) {
        try {
            console.log(`🔄 Loading advanced quiz: ${quizId}`);
            
            // Load quiz data from API
            const response = await fetch(`/api/quiz/${quizId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load quiz: ${response.statusText}`);
            }
            
            const quizData = await response.json();
            
            // Create quiz controller container
            const quizContainer = document.createElement('div');
            quizContainer.className = 'advanced-quiz-container';
            quizContainer.id = `quiz-container-${blockId}`;
            
            // Replace loading content
            quizElement.innerHTML = '';
            quizElement.appendChild(quizContainer);
            
            // Initialize QuizController
            const quizController = new window.QuizController(`quiz-container-${blockId}`, {
                showProgress: true,
                showTimer: true,
                showHints: true,
                allowNavigation: true,
                animateTransitions: true,
                keyboardShortcuts: true,
                autoAdvance: false
            });
            
            // Load quiz data into controller
            await quizController.loadQuiz(quizData, {
                autoSave: true,
                analytics: true,
                submitResults: true,
                lessonId: this.lessonData?.id,
                blockId: blockId
            });
            
            // Set up event listeners for lesson integration
            this.setupAdvancedQuizListeners(quizController, blockId, quizData);
            
            // Store controller reference
            this.quizControllers.set(blockId, quizController);
            
            console.log(`✅ Advanced quiz loaded: ${quizId}`);
            
        } catch (error) {
            console.error(`❌ Failed to load advanced quiz ${quizId}:`, error);
            this.renderQuizError(quizElement, error.message);
        }
    }
    
    setupAdvancedQuizListeners(quizController, blockId, quizData) {
        // Listen for quiz completion
        quizController.on('quiz:completed', (results) => {
            console.log(`🎉 Quiz completed for block ${blockId}:`, results);
            
            // Mark block as completed if passed
            if (results.passed) {
                this.markBlockComplete(blockId);
            }
            
            // Update progress
            this.updateQuizProgress(blockId, results);
            
            // Show completion feedback
            this.showQuizCompletionFeedback(blockId, results);
            
            // Emit custom event
            this.emitCustomEvent('quizCompleted', {
                blockId: blockId,
                quizId: quizData.id,
                results: results,
                timestamp: Date.now()
            });
        });
        
        // Listen for quiz errors
        quizController.on('quiz:error', (error) => {
            console.error(`❌ Quiz error for block ${blockId}:`, error);
            
            // Show error feedback
            this.showUserFeedback('error', `Quiz error: ${error.message || error}`);
            
            // Emit custom event
            this.emitCustomEvent('quizError', {
                blockId: blockId,
                quizId: quizData.id,
                error: error.message || error,
                timestamp: Date.now()
            });
        });
        
        // Listen for quiz progress updates
        quizController.on('quiz:progress', (progress) => {
            console.log(`📊 Quiz progress for block ${blockId}:`, progress);
            
            // Update UI progress indicators
            this.updateQuizProgressIndicator(blockId, progress);
        });
        
        // Listen for answer submissions
        quizController.on('quiz:answer_submitted', (data) => {
            console.log(`📝 Answer submitted for block ${blockId}:`, data);
            
            // Auto-save progress
            this.saveProgress();
        });
    }
    
    updateQuizProgress(blockId, results) {
        // Update quiz progress indicator
        const progressIndicator = document.getElementById(`quiz-progress-${blockId}`);
        if (progressIndicator) {
            if (results.passed) {
                progressIndicator.innerHTML = '<i class="fas fa-check-circle"></i>';
                progressIndicator.style.color = '#10b981';
            } else {
                progressIndicator.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                progressIndicator.style.color = '#f59e0b';
            }
        }
        
        // Update block element
        const blockElement = document.getElementById(`block-${blockId}`);
        if (blockElement) {
            if (results.passed) {
                blockElement.classList.add('completed');
                blockElement.classList.add('quiz-passed');
            } else {
                blockElement.classList.add('quiz-attempted');
            }
        }
    }
    
    updateQuizProgressIndicator(blockId, progress) {
        const progressIndicator = document.getElementById(`quiz-progress-${blockId}`);
        if (progressIndicator) {
            const percentage = Math.round((progress.current / progress.total) * 100);
            progressIndicator.title = `Quiz Progress: ${percentage}%`;
            
            // Update indicator based on progress
            if (percentage === 100) {
                progressIndicator.innerHTML = '<i class="fas fa-check-circle"></i>';
                progressIndicator.style.color = '#10b981';
            } else if (percentage > 0) {
                progressIndicator.innerHTML = '<i class="fas fa-clock"></i>';
                progressIndicator.style.color = '#f59e0b';
            }
        }
    }
    
    showQuizCompletionFeedback(blockId, results) {
        const message = results.passed 
            ? `🎉 Quiz completed successfully! Score: ${Math.round(results.score)}%`
            : `📚 Quiz completed. Score: ${Math.round(results.score)}%. Keep learning!`;
        
        const type = results.passed ? 'success' : 'warning';
        
        this.showUserFeedback(type, message);
        
        // Show rewards if earned
        if (results.passed && results.rewards) {
            const rewardMessage = [];
            if (results.rewards.xp) rewardMessage.push(`+${results.rewards.xp} XP`);
            if (results.rewards.pycoins) rewardMessage.push(`+${results.rewards.pycoins} PyCoins`);
            
            if (rewardMessage.length > 0) {
                setTimeout(() => {
                    this.showUserFeedback('success', `🏆 Rewards earned: ${rewardMessage.join(', ')}`);
                }, 2000);
            }
        }
    }
    
    renderQuiz(quizData, quizElement, blockId) {
        // Clear loading state
        quizElement.innerHTML = '';
        
        // Create quiz overview
        const quizOverview = document.createElement('div');
        quizOverview.className = 'quiz-overview';
        quizOverview.innerHTML = `
            <div class="quiz-header">
                <h4><i class="fas fa-brain"></i> ${quizData.title}</h4>
                <div class="quiz-meta">
                    <span class="quiz-questions-count">
                        <i class="fas fa-question-circle"></i>
                        ${quizData.questions.length} questions
                    </span>
                    ${quizData.time_limit ? `
                        <span class="quiz-time-limit">
                            <i class="fas fa-clock"></i>
                            ${quizData.time_limit} seconds
                        </span>
                    ` : ''}
                    <span class="quiz-difficulty">
                        <i class="fas fa-star"></i>
                        ${quizData.difficulty}
                    </span>
                </div>
            </div>
            <div class="quiz-description">
                <p>${quizData.description}</p>
            </div>
            <div class="quiz-rewards">
                <span class="reward-item">
                    <i class="fas fa-star"></i>
                    ${quizData.xp_reward || 0} XP
                </span>
                <span class="reward-item">
                    <i class="fas fa-coins"></i>
                    ${quizData.pycoins_reward || 0} PyCoins
                </span>
            </div>
            <div class="quiz-actions">
                <button class="btn btn-primary start-quiz-btn" data-quiz-id="${quizData.id}" data-block-id="${blockId}">
                    <i class="fas fa-play"></i> Start Quiz
                </button>
            </div>
        `;
        
        quizElement.appendChild(quizOverview);
        
        // Set up quiz start handler
        const startBtn = quizOverview.querySelector('.start-quiz-btn');
        startBtn.addEventListener('click', () => this.startQuiz(quizData, quizElement, blockId));
    }
    
    renderQuizError(quizElement, errorMessage) {
        quizElement.innerHTML = `
            <div class="quiz-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h4>Quiz Load Error</h4>
                <p>${errorMessage}</p>
                <button class="btn btn-secondary retry-quiz-btn">
                    <i class="fas fa-refresh"></i> Retry
                </button>
            </div>
        `;
    }
    
    async startQuiz(quizData, quizElement, blockId) {
        try {
            // Clear overview and show quiz questions
            quizElement.innerHTML = '';
            
            // Create quiz interface
            const quizInterface = document.createElement('div');
            quizInterface.className = 'quiz-interface';
            quizInterface.innerHTML = `
                <div class="quiz-header">
                    <h4>${quizData.title}</h4>
                    <div class="quiz-progress">
                        <span class="current-question">1</span> / <span class="total-questions">${quizData.questions.length}</span>
                    </div>
                </div>
                <div class="quiz-content">
                    <div class="quiz-questions" id="quiz-questions-${blockId}"></div>
                </div>
                <div class="quiz-controls">
                    <button class="btn btn-secondary prev-question-btn" disabled>
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    <button class="btn btn-primary next-question-btn">
                        Next <i class="fas fa-arrow-right"></i>
                    </button>
                    <button class="btn btn-success submit-quiz-btn" style="display: none;">
                        <i class="fas fa-check"></i> Submit Quiz
                    </button>
                </div>
            `;
            
            quizElement.appendChild(quizInterface);
            
            // Initialize quiz state
            this.currentQuiz = {
                data: quizData,
                blockId: blockId,
                currentQuestion: 0,
                answers: {},
                element: quizElement
            };
            
            // Render first question
            this.renderQuestion(0);
            
            // Set up controls
            this.setupQuizControls();
            
        } catch (error) {
            console.error('❌ Failed to start quiz:', error);
            this.renderQuizError(quizElement, 'Failed to start quiz');
        }
    }
    
    renderQuestion(questionIndex) {
        const quiz = this.currentQuiz;
        const question = quiz.data.questions[questionIndex];
        const questionsContainer = document.getElementById(`quiz-questions-${quiz.blockId}`);
        
        if (!question || !questionsContainer) return;
        
        // Update progress
        const currentSpan = quiz.element.querySelector('.current-question');
        if (currentSpan) currentSpan.textContent = questionIndex + 1;
        
        // Render question based on type
        let questionHtml = '';
        
        if (question.type === 'multiple_choice') {
            questionHtml = `
                <div class="question-content">
                    <h5 class="question-title">Question ${questionIndex + 1}</h5>
                    <p class="question-text">${question.question}</p>
                    <div class="question-options">
                        ${question.options.map((option, index) => `
                            <label class="option-label">
                                <input type="radio" name="question-${question.id}" value="${index}">
                                <span class="option-text">${option}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (question.type === 'code_completion') {
            questionHtml = `
                <div class="question-content">
                    <h5 class="question-title">Question ${questionIndex + 1}</h5>
                    <p class="question-text">${question.question}</p>
                    <div class="code-question">
                        <pre class="code-template">${question.code_template}</pre>
                        <div class="code-input-area">
                            <textarea class="code-input" placeholder="Enter your code here..." 
                                      data-question-id="${question.id}"></textarea>
                        </div>
                    </div>
                </div>
            `;
        }
        
        questionsContainer.innerHTML = questionHtml;
        
        // Restore previous answer if exists
        const savedAnswer = quiz.answers[question.id];
        if (savedAnswer !== undefined) {
            if (question.type === 'multiple_choice') {
                const radio = questionsContainer.querySelector(`input[value="${savedAnswer}"]`);
                if (radio) radio.checked = true;
            } else if (question.type === 'code_completion') {
                const textarea = questionsContainer.querySelector('.code-input');
                if (textarea) textarea.value = savedAnswer;
            }
        }
        
        // Set up answer change listeners
        this.setupQuestionListeners(questionIndex);
    }
    
    setupQuestionListeners(questionIndex) {
        const quiz = this.currentQuiz;
        const question = quiz.data.questions[questionIndex];
        const questionsContainer = document.getElementById(`quiz-questions-${quiz.blockId}`);
        
        if (question.type === 'multiple_choice') {
            const radios = questionsContainer.querySelectorAll(`input[name="question-${question.id}"]`);
            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    quiz.answers[question.id] = parseInt(e.target.value);
                    this.updateQuizControls();
                });
            });
        } else if (question.type === 'code_completion') {
            const textarea = questionsContainer.querySelector('.code-input');
            if (textarea) {
                textarea.addEventListener('input', (e) => {
                    quiz.answers[question.id] = e.target.value;
                    this.updateQuizControls();
                });
            }
        }
    }
    
    setupQuizControls() {
        const quiz = this.currentQuiz;
        const prevBtn = quiz.element.querySelector('.prev-question-btn');
        const nextBtn = quiz.element.querySelector('.next-question-btn');
        const submitBtn = quiz.element.querySelector('.submit-quiz-btn');
        
        prevBtn.addEventListener('click', () => this.prevQuestion());
        nextBtn.addEventListener('click', () => this.nextQuestion());
        submitBtn.addEventListener('click', () => this.submitQuiz());
        
        this.updateQuizControls();
    }
    
    updateQuizControls() {
        const quiz = this.currentQuiz;
        const prevBtn = quiz.element.querySelector('.prev-question-btn');
        const nextBtn = quiz.element.querySelector('.next-question-btn');
        const submitBtn = quiz.element.querySelector('.submit-quiz-btn');
        
        // Update button states
        prevBtn.disabled = quiz.currentQuestion === 0;
        
        const isLastQuestion = quiz.currentQuestion === quiz.data.questions.length - 1;
        nextBtn.style.display = isLastQuestion ? 'none' : 'inline-block';
        submitBtn.style.display = isLastQuestion ? 'inline-block' : 'none';
    }
    
    prevQuestion() {
        const quiz = this.currentQuiz;
        if (quiz.currentQuestion > 0) {
            quiz.currentQuestion--;
            this.renderQuestion(quiz.currentQuestion);
        }
    }
    
    nextQuestion() {
        const quiz = this.currentQuiz;
        if (quiz.currentQuestion < quiz.data.questions.length - 1) {
            quiz.currentQuestion++;
            this.renderQuestion(quiz.currentQuestion);
        }
    }
    
    async submitQuiz() {
        const quiz = this.currentQuiz;
        
        try {
            // Show loading state
            const submitBtn = quiz.element.querySelector('.submit-quiz-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            // Submit to API
            const response = await fetch(`/api/quiz/${quiz.data.id}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    answers: quiz.answers
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to submit quiz: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Show results
            this.showQuizResults(result);
            
            // Mark block as completed if passed
            if (result.passed) {
                this.markBlockComplete(quiz.blockId);
            }
            
        } catch (error) {
            console.error('❌ Failed to submit quiz:', error);
            this.showQuizError('Failed to submit quiz. Please try again.');
        }
    }
    
    showQuizResults(result) {
        const quiz = this.currentQuiz;
        
        quiz.element.innerHTML = `
            <div class="quiz-results">
                <div class="results-header">
                    <div class="score-circle ${result.passed ? 'passed' : 'failed'}">
                        <span class="score-value">${Math.round(result.score)}%</span>
                    </div>
                    <h4>${result.passed ? 'Congratulations!' : 'Keep Learning!'}</h4>
                    <p>${result.passed ? 'You passed the quiz!' : 'You can try again to improve your score.'}</p>
                </div>
                
                <div class="results-stats">
                    <div class="stat-item">
                        <span class="stat-label">Score</span>
                        <span class="stat-value">${Math.round(result.score)}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Correct</span>
                        <span class="stat-value">${result.correct_answers}/${result.total_questions}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Passing</span>
                        <span class="stat-value">${result.passing_score}%</span>
                    </div>
                </div>
                
                ${result.passed && result.rewards && (result.rewards.xp || result.rewards.pycoins) ? `
                    <div class="rewards-earned">
                        <h5><i class="fas fa-trophy"></i> Rewards Earned</h5>
                        <div class="rewards-list">
                            ${result.rewards.xp ? `
                                <span class="reward-item">
                                    <i class="fas fa-star"></i>
                                    ${result.rewards.xp} XP
                                </span>
                            ` : ''}
                            ${result.rewards.pycoins ? `
                                <span class="reward-item">
                                    <i class="fas fa-coins"></i>
                                    ${result.rewards.pycoins} PyCoins
                                </span>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div class="results-actions">
                    <button class="btn btn-secondary review-answers-btn">
                        <i class="fas fa-eye"></i> Review Answers
                    </button>
                    ${!result.passed ? `
                        <button class="btn btn-primary retry-quiz-btn">
                            <i class="fas fa-refresh"></i> Try Again
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Set up result actions
        const reviewBtn = quiz.element.querySelector('.review-answers-btn');
        const retryBtn = quiz.element.querySelector('.retry-quiz-btn');
        
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => this.showAnswerReview(result));
        }
        
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryQuiz());
        }
    }
    
    showAnswerReview(result) {
        const quiz = this.currentQuiz;
        
        // Create review interface
        const reviewHtml = `
            <div class="answer-review">
                <div class="review-header">
                    <h4><i class="fas fa-eye"></i> Answer Review</h4>
                    <button class="btn btn-secondary back-to-results-btn">
                        <i class="fas fa-arrow-left"></i> Back to Results
                    </button>
                </div>
                <div class="review-content">
                    ${result.results.map((questionResult, index) => {
                        const question = quiz.data.questions[index];
                        const userAnswer = quiz.answers[question.id];
                        
                        return `
                            <div class="review-question ${questionResult.correct ? 'correct' : 'incorrect'}">
                                <div class="question-header">
                                    <span class="question-number">Q${index + 1}</span>
                                    <span class="question-status">
                                        <i class="fas fa-${questionResult.correct ? 'check' : 'times'}"></i>
                                        ${questionResult.correct ? 'Correct' : 'Incorrect'}
                                    </span>
                                </div>
                                <p class="question-text">${question.question}</p>
                                
                                ${question.type === 'multiple_choice' ? `
                                    <div class="answer-options">
                                        ${question.options.map((option, optionIndex) => {
                                            const isUserAnswer = userAnswer === optionIndex;
                                            const isCorrect = question.correct_answer === optionIndex;
                                            
                                            return `
                                                <div class="option-review ${isUserAnswer ? 'user-answer' : ''} ${isCorrect ? 'correct-answer' : ''}">
                                                    <span class="option-text">${option}</span>
                                                    ${isUserAnswer ? '<span class="answer-indicator">Your answer</span>' : ''}
                                                    ${isCorrect ? '<span class="correct-indicator">Correct</span>' : ''}
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                ` : `
                                    <div class="code-answer-review">
                                        <div class="user-code">
                                            <h6>Your Answer:</h6>
                                            <pre>${userAnswer || 'No answer provided'}</pre>
                                        </div>
                                    </div>
                                `}
                                
                                ${questionResult.explanation ? `
                                    <div class="explanation">
                                        <h6>Explanation:</h6>
                                        <p>${questionResult.explanation}</p>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        quiz.element.innerHTML = reviewHtml;
        
        // Set up back button
        const backBtn = quiz.element.querySelector('.back-to-results-btn');
        backBtn.addEventListener('click', () => this.showQuizResults(result));
    }
    
    retryQuiz() {
        const quiz = this.currentQuiz;
        
        // Reset quiz state
        quiz.currentQuestion = 0;
        quiz.answers = {};
        
        // Restart quiz
        this.startQuiz(quiz.data, quiz.element, quiz.blockId);
    }
    
    showQuizError(message) {
        const quiz = this.currentQuiz;
        
        quiz.element.innerHTML = `
            <div class="quiz-error">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h4>Quiz Error</h4>
                <p>${message}</p>
            </div>
        `;
    }
    
    async initializeFallbackQuizzes(quizElements) {
        console.log('🔄 Initializing quiz system...');
        
        try {
            // Use the main quiz system (QuizEngine + QuizController)
            if (window.QuizEngine && window.QuizController && window.QuizState) {
                console.log('✅ Using main quiz system');
                
                // Initialize each quiz with the main system
                for (const quizElement of quizElements) {
                    const quizId = quizElement.dataset.quizId;
                    const blockId = quizElement.dataset.blockId;
                    
                    await this.loadMainQuiz(quizId, blockId, quizElement);
                }
            } else {
                console.warn('⚠️ Main quiz system not loaded, loading basic fallback');
                await this.loadBasicQuizFallback(quizElements);
            }
            
            console.log(`🧠 Initialized ${quizElements.length} basic quizzes`);
            
        } catch (error) {
            console.error('❌ Failed to initialize basic quiz system:', error);
            
            // Last resort: simple placeholder quizzes
            quizElements.forEach(quizElement => {
                const quizId = quizElement.dataset.quizId;
                const blockId = quizElement.dataset.blockId;
                
                quizElement.innerHTML = `
                    <div class="quiz-placeholder">
                        <h4>Quiz: ${quizId}</h4>
                        <p>Quiz system temporarily unavailable.</p>
                        <button class="btn btn-primary complete-btn" data-block-id="${blockId}">
                            Continue
                        </button>
                    </div>
                `;
            });
            
            console.log(`🧠 Initialized ${quizElements.length} placeholder quizzes`);
        }
    }
    
    async loadMainQuiz(quizId, blockId, quizElement) {
        try {
            console.log(`🧠 Loading main quiz: ${quizId}`);
            
            // Load quiz data from API
            const response = await fetch(`/api/quiz/${quizId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load quiz: ${response.statusText}`);
            }
            
            const quizData = await response.json();
            
            // Create quiz controller for this quiz
            const quizController = new window.QuizController(quizElement.id, {
                showProgress: true,
                showTimer: true,
                showHints: true,
                allowNavigation: true,
                animateTransitions: true
            });
            
            // Initialize quiz engine
            const quizEngine = new window.QuizEngine();
            await quizEngine.initialize(quizData, {
                analytics: true,
                autoSave: true,
                debugMode: false
            });
            
            // Connect controller to engine
            quizController.engine = quizEngine;
            
            // Start the quiz
            await quizController.start();
            
            // Set up completion handler
            quizEngine.state.addEventListener('quiz_completed', (event) => {
                this.handleQuizCompletion(blockId, event.detail);
            });
            
            console.log(`✅ Main quiz ${quizId} loaded successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to load main quiz ${quizId}:`, error);
            this.renderQuizError(quizElement, error.message);
        }
    }
    
    /**
     * Load basic quiz fallback when main system isn't available
     */
    async loadBasicQuizFallback(quizElements) {
        console.log('🔄 Loading basic quiz fallback...');
        
        try {
            // Use simple placeholder quiz system as fallback
            console.warn('⚠️ Main quiz system not available, using simple placeholders');
            this.renderQuizPlaceholders(quizElements);
            
        } catch (error) {
            console.error('❌ Failed to load quiz fallback:', error);
            // Render static quiz placeholder
            this.renderQuizPlaceholders(quizElements);
        }
    }
    
    /**
     * Handle quiz completion from main system
     */
    handleQuizCompletion(blockId, result) {
        console.log(`🎉 Quiz completed for block ${blockId}:`, result);
        
        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('quiz-completed', {
            detail: {
                blockId: blockId,
                score: result.score,
                passed: result.passed,
                totalQuestions: result.totalQuestions,
                correctAnswers: result.correctAnswers,
                timeSpent: result.timeSpent
            }
        }));
        
        // Mark block as completed if passed
        if (result.passed) {
            document.dispatchEvent(new CustomEvent('block-completed', {
                detail: { blockId: blockId }
            }));
        }
    }

    // ...existing code...
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // New callback methods for EnhancedCodeEditor integration
    
    handleCodeCompletion(blockId, result) {
        console.log(`🎉 Code completion for block ${blockId}:`, result);
        
        // Prepare assessment results for the progress tracker
        const assessmentResults = {
            success: result.allTestsPassed || result.success,
            score: result.score || (result.allTestsPassed ? 100 : 0),
            passed: result.allTestsPassed || result.success,
            tests_passed: result.testsPassedCount || 0,
            total_tests: result.totalTestCount || 0,
            output: result.output || null,
            error: result.error || null,
            timestamp: Date.now(),
            attempts: 1 // This would be tracked by the assessment system
        };
        
        // Mark block as complete with assessment results
        if (result.allTestsPassed) {
            this.markBlockComplete(blockId, assessmentResults);
        }
        
        // Emit custom event for progress tracking
        this.emitCustomEvent('codeCompleted', {
            blockId: blockId,
            result: result,
            assessmentResults: assessmentResults,
            timestamp: Date.now()
        });
    }
    
    handleCodeError(blockId, error) {
        console.error(`❌ Code error for block ${blockId}:`, error);
        
        // Emit custom event for error tracking
        this.emitCustomEvent('codeError', {
            blockId: blockId,
            error: error.message || error,
            timestamp: Date.now()
        });
        
        // Show user-friendly error feedback
        this.showUserFeedback('error', `Code execution failed: ${error.message || error}`);
    }
    
    emitCustomEvent(eventName, data) {
        // Use global event bus if available
        if (window.eventBus && typeof window.eventBus.emit === 'function') {
            window.eventBus.emit(eventName, data);
        }
        
        // Also dispatch custom DOM event
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
    
    showUserFeedback(type, message) {
        // Create or update feedback element
        let feedbackElement = document.getElementById('lesson-feedback');
        
        if (!feedbackElement) {
            feedbackElement = document.createElement('div');
            feedbackElement.id = 'lesson-feedback';
            feedbackElement.className = 'lesson-feedback';
            document.body.appendChild(feedbackElement);
        }
        
        feedbackElement.className = `lesson-feedback ${type}`;
        feedbackElement.innerHTML = `
            <div class="feedback-content">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${this.escapeHtml(message)}</span>
                <button class="feedback-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (feedbackElement && feedbackElement.parentElement) {
                feedbackElement.remove();
            }
        }, 5000);
    }
    
    // Debugging helper
    getInteractionInfo() {
        return {
            initialized: this.initialized,
            codeEditors: Array.from(this.codeEditors.entries()).map(([id, editor]) => ({
                id: id,
                type: editor.isFallback ? 'fallback' : 
                      editor.initialized ? 'enhanced' : 'unknown',
                initialized: editor.initialized || false
            })),
            lessonData: !!this.lessonData,
            userProgress: !!this.userProgress
        };
    }
    
    // Additional utility methods for Phase 3
    
    getEditor(blockId) {
        const editorId = `editor-${blockId}`;
        return this.codeEditors.get(editorId);
    }
    
    getAllEditors() {
        return Array.from(this.codeEditors.entries());
    }
    
    destroyEditor(blockId) {
        const editorId = `editor-${blockId}`;
        const editor = this.codeEditors.get(editorId);
        
        if (editor && editor.destroy) {
            editor.destroy();
        }
        
        this.codeEditors.delete(editorId);
    }
    
    destroyAllEditors() {
        this.codeEditors.forEach((editor, editorId) => {
            if (editor && editor.destroy) {
                editor.destroy();
            }
        });
        
        this.codeEditors.clear();
    }
    
    /**
     * Render simple quiz placeholders when quiz system isn't available
     */
    renderQuizPlaceholders(quizElements) {
        console.log('📝 Rendering quiz placeholders...');
        
        quizElements.forEach((quizElement, index) => {
            const quizId = quizElement.dataset.quizId || `quiz-${index}`;
            const blockId = quizElement.dataset.blockId || `block-${index}`;
            
            quizElement.innerHTML = `
                <div class="quiz-placeholder">
                    <div class="quiz-header">
                        <h4><i class="fas fa-brain"></i> Quiz: ${quizId}</h4>
                        <span class="quiz-status">Not Available</span>
                    </div>
                    <div class="quiz-content">
                        <div class="placeholder-message">
                            <i class="fas fa-info-circle"></i>
                            <p>Quiz system is currently loading. Please refresh the page or try again later.</p>
                        </div>
                        <div class="quiz-actions">
                            <button class="btn btn-primary reload-quiz-btn" data-quiz-id="${quizId}" data-block-id="${blockId}">
                                <i class="fas fa-refresh"></i> Reload Quiz
                            </button>
                            <button class="btn btn-secondary skip-quiz-btn" data-block-id="${blockId}">
                                <i class="fas fa-forward"></i> Skip for Now
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add event listeners for placeholder actions
            const reloadBtn = quizElement.querySelector('.reload-quiz-btn');
            const skipBtn = quizElement.querySelector('.skip-quiz-btn');
            
            reloadBtn?.addEventListener('click', () => {
                window.location.reload();
            });
            
            skipBtn?.addEventListener('click', () => {
                // Mark as temporarily skipped
                quizElement.classList.add('quiz-skipped');
                quizElement.innerHTML = `
                    <div class="quiz-skipped">
                        <i class="fas fa-clock"></i>
                        <p>Quiz skipped - come back later to complete</p>
                    </div>
                `;
            });
        });
        
        console.log(`📝 Rendered ${quizElements.length} quiz placeholders`);
    }
}
