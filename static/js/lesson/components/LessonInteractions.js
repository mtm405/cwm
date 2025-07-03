/**
 * Lesson Interactions Component
 * Handles user interactions with lesson content
 */

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
        
        console.log(`📝 Initialized ${codeEditors.length} code editors`);
    }
    
    async initializeCodeEditor(editorElement) {
        const editorId = editorElement.id;
        const language = editorElement.dataset.language || 'python';
        const initialCode = editorElement.textContent.trim();
        
        try {
            // Try to use ACE editor if available
            if (typeof ace !== 'undefined') {
                const editor = ace.edit(editorId);
                
                // Configure ACE editor
                editor.setTheme('ace/theme/monokai');
                editor.session.setMode(`ace/mode/${language}`);
                editor.setOptions({
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    fontSize: 14,
                    showPrintMargin: false,
                    wrap: true,
                    showLineNumbers: true,
                    highlightActiveLine: true,
                    highlightSelectedWord: true
                });
                
                // Set initial code
                if (initialCode) {
                    editor.setValue(initialCode, -1);
                }
                
                // Store editor reference
                this.codeEditors.set(editorId, editor);
                
                // Add keyboard shortcuts
                editor.commands.addCommand({
                    name: 'runCode',
                    bindKey: { win: 'Ctrl-Enter', mac: 'Cmd-Enter' },
                    exec: () => {
                        const blockId = editorId.replace('editor-', '');
                        this.runCode(blockId);
                    }
                });
                
                console.log(`✅ ACE editor initialized: ${editorId}`);
                
            } else {
                // Fallback to enhanced textarea
                this.initializeFallbackEditor(editorElement, initialCode);
            }
            
        } catch (error) {
            console.error(`❌ Failed to initialize editor ${editorId}:`, error);
            this.initializeFallbackEditor(editorElement, initialCode);
        }
    }
    
    initializeFallbackEditor(editorElement, initialCode) {
        const editorId = editorElement.id;
        
        // Convert to textarea with enhanced styling
        const textarea = document.createElement('textarea');
        textarea.id = editorId;
        textarea.className = 'fallback-code-editor';
        textarea.value = initialCode;
        textarea.rows = Math.max(8, initialCode.split('\\n').length + 2);
        
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
        });
        
        // Replace original element
        editorElement.parentNode.replaceChild(textarea, editorElement);
        
        // Store reference
        this.codeEditors.set(editorId, { getValue: () => textarea.value, setValue: (val) => textarea.value = val });
        
        console.log(`✅ Fallback editor initialized: ${editorId}`);
    }
    
    async runCode(blockId) {
        const editorId = `editor-${blockId}`;
        const editor = this.codeEditors.get(editorId);
        const outputElement = document.getElementById(`output-${blockId}`);
        
        if (!editor) {
            console.error(`Editor not found: ${editorId}`);
            return;
        }
        
        if (!outputElement) {
            console.error(`Output element not found: output-${blockId}`);
            return;
        }
        
        // Get code from editor
        const code = editor.getValue ? editor.getValue() : editor.value;
        
        // Show output container and loading state
        outputElement.style.display = 'block';
        outputElement.querySelector('.output-content').innerHTML = `
            <div class="output-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Running code...</span>
            </div>
        `;
        
        try {
            console.log(`🔄 Executing code for block ${blockId}`);
            
            // Execute code via API
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    code, 
                    language: 'python',
                    lesson_id: this.lessonData?.id,
                    block_id: blockId 
                })
            });
            
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
            
            this.displayCodeResult(outputElement, {
                success: false,
                error: error.message,
                output: ''
            });
        }
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
        const outputElement = document.getElementById(`output-${blockId}`);
        
        if (!editor) {
            console.error(`Editor not found: ${editorId}`);
            return;
        }
        
        // Find the original starter code from lesson data
        const block = this.lessonData?.blocks?.find(b => b.id === blockId);
        const starterCode = block?.starter_code || '# Write your code here';
        
        // Reset editor content
        if (editor.setValue) {
            editor.setValue(starterCode, -1);
        } else {
            editor.value = starterCode;
        }
        
        // Hide output
        if (outputElement) {
            outputElement.style.display = 'none';
        }
        
        console.log(`🔄 Code reset for block ${blockId}`);
    }
    
    async copyCode(blockId) {
        // Find the code to copy
        const block = this.lessonData?.blocks?.find(b => b.id === blockId);
        const code = block?.code || block?.starter_code || '';
        
        if (!code) {
            console.error(`No code found for block ${blockId}`);
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
            
            console.log(`📋 Code copied for block ${blockId}`);
            
        } catch (error) {
            console.error('❌ Failed to copy code:', error);
            
            // Fallback: select the code
            this.selectCode(blockId);
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
    
    // Debugging helper
    getInteractionInfo() {
        return {
            initialized: this.initialized,
            codeEditors: Array.from(this.codeEditors.keys()),
            lessonData: !!this.lessonData,
            userProgress: !!this.userProgress
        };
    }
}
