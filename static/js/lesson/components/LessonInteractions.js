/**
 * Lesson Interactions Component
 * Handles user interactions with lesson content
 * Updated for Phase 3: Enhanced Code Editor Integration
 */

import { EnhancedCodeEditor } from './EnhancedCodeEditor.js';

export class LessonInteractions {
    constructor() {
        this.codeEditors = new Map();
        this.lessonData = null;
        this.userProgress = null;
        this.initialized = false;
    }
    
    initialize(lessonData, userProgress) {
        this.lessonData = lessonData;
        this.userProgress = userProgress;
        
        console.log('🎮 Initializing lesson interactions...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize code editors
        this.initializeCodeEditors();
        
        // Initialize quiz interactions
        this.initializeQuizzes();
        
        this.initialized = true;
        console.log('✅ Lesson interactions initialized');
    }
    
    setupEventListeners() {
        // Global event delegation for lesson interactions
        document.addEventListener('click', this.handleClick.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Custom events
        document.addEventListener('blockCompleted', this.handleBlockCompleted.bind(this));
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
                setTimeout(() => {
                    this.markBlockComplete(blockId);
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
    
    async markBlockComplete(blockId) {
        // Delegate to lesson system
        if (window.lessonSystem) {
            return await window.lessonSystem.markBlockComplete(blockId);
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
    
    initializeQuizzes() {
        const quizElements = document.querySelectorAll('[data-quiz-id]');
        
        quizElements.forEach(quizElement => {
            const quizId = quizElement.dataset.quizId;
            this.loadQuiz(quizId, quizElement);
        });
        
        console.log(`🧠 Initialized ${quizElements.length} quizzes`);
    }
    
    async loadQuiz(quizId, quizElement) {
        try {
            // This would normally load quiz from API/Firebase
            console.log(`🔄 Loading quiz: ${quizId}`);
            
            // Placeholder quiz content
            quizElement.innerHTML = `
                <div class="quiz-placeholder">
                    <h4>Quiz: ${quizId}</h4>
                    <p>Quiz system not yet implemented.</p>
                    <button class="btn btn-primary complete-btn" data-block-id="${quizId}">
                        Continue
                    </button>
                </div>
            `;
            
        } catch (error) {
            console.error(`❌ Failed to load quiz ${quizId}:`, error);
            quizElement.innerHTML = `
                <div class="quiz-error">
                    <p>Failed to load quiz. Please try again later.</p>
                </div>
            `;
        }
    }
    
    handleQuizAnswer(optionElement) {
        // Quiz answer handling would go here
        console.log('Quiz answer selected:', optionElement);
    }
    
    handleBlockCompleted(event) {
        const { blockId, progress } = event.detail;
        console.log(`🎉 Block completed: ${blockId} (${progress}%)`);
        
        // Update UI for completed block
        const blockElement = document.getElementById(`block-${blockId}`);
        if (blockElement) {
            blockElement.classList.add('completed');
            
            // Add completion animation
            blockElement.style.animation = 'completion-pulse 0.6s ease-out';
            setTimeout(() => {
                blockElement.style.animation = '';
            }, 600);
        }
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // New callback methods for EnhancedCodeEditor integration
    
    handleCodeCompletion(blockId, result) {
        console.log(`🎉 Code completion for block ${blockId}:`, result);
        
        // Mark block as complete if all tests passed
        if (result.allTestsPassed) {
            this.markBlockComplete(blockId);
        }
        
        // Emit custom event for progress tracking
        this.emitCustomEvent('codeCompleted', {
            blockId: blockId,
            result: result,
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
}
