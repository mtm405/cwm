/**
 * Interactive Editor Module
 * Enhanced code editor for lesson interactions
 */

class InteractiveEditor {
    constructor(editorId, options = {}) {
        this.editorId = editorId;
        this.options = {
            language: 'python',
            theme: 'monokai',
            fontSize: 14,
            showLineNumbers: true,
            enableAutocompletion: true,
            ...options
        };
        
        this.editor = null;
        this.initialized = false;
        
        this.init();
    }

    /**
     * Initialize the interactive editor
     */
    async init() {
        if (this.initialized) return;

        try {
            // Wait for ACE to be available
            await this.waitForAce();
            
            // Initialize ACE editor
            this.initializeAceEditor();
            
            // Setup editor features
            this.setupEditorFeatures();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log(`✅ Interactive Editor initialized: ${this.editorId}`);
            
        } catch (error) {
            console.error('❌ Failed to initialize Interactive Editor:', error);
        }
    }

    /**
     * Wait for ACE editor to be available
     */
    async waitForAce() {
        return new Promise((resolve, reject) => {
            if (typeof ace !== 'undefined') {
                resolve();
                return;
            }

            // Wait up to 5 seconds for ACE to load
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkAce = () => {
                attempts++;
                
                if (typeof ace !== 'undefined') {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('ACE editor failed to load'));
                } else {
                    setTimeout(checkAce, 100);
                }
            };
            
            checkAce();
        });
    }

    /**
     * Initialize ACE editor instance
     */
    initializeAceEditor() {
        const editorElement = document.getElementById(this.editorId);
        if (!editorElement) {
            throw new Error(`Editor element not found: ${this.editorId}`);
        }

        // Create ACE editor
        this.editor = ace.edit(this.editorId);
        
        // Configure editor
        this.editor.setTheme(`ace/theme/${this.options.theme}`);
        this.editor.session.setMode(`ace/mode/${this.options.language}`);
        
        // Set editor options
        this.editor.setOptions({
            enableBasicAutocompletion: this.options.enableAutocompletion,
            enableLiveAutocompletion: this.options.enableAutocompletion,
            enableSnippets: true,
            fontSize: this.options.fontSize,
            showPrintMargin: false,
            highlightActiveLine: true,
            showGutter: this.options.showLineNumbers,
            displayIndentGuides: true,
            wrap: true,
            maxLines: 30,
            minLines: 5
        });

        // Set initial content if provided
        if (this.options.initialCode) {
            this.editor.setValue(this.options.initialCode, -1);
        }
    }

    /**
     * Setup editor features
     */
    setupEditorFeatures() {
        // Add custom commands
        this.addCustomCommands();
        
        // Setup syntax validation
        this.setupSyntaxValidation();
        
        // Setup auto-save if enabled
        if (this.options.autoSave) {
            this.setupAutoSave();
        }
    }

    /**
     * Add custom keyboard commands
     */
    addCustomCommands() {
        // Run code command (Ctrl+Enter)
        this.editor.commands.addCommand({
            name: 'runCode',
            bindKey: { win: 'Ctrl-Enter', mac: 'Cmd-Enter' },
            exec: () => {
                this.runCode();
            }
        });

        // Reset code command (Ctrl+R)
        this.editor.commands.addCommand({
            name: 'resetCode',
            bindKey: { win: 'Ctrl-R', mac: 'Cmd-R' },
            exec: (editor) => {
                editor.preventDefault();
                this.resetCode();
            }
        });
    }

    /**
     * Setup syntax validation
     */
    setupSyntaxValidation() {
        // Enable basic syntax checking
        this.editor.session.setUseWorker(true);
        
        // Add custom validation for common errors
        this.editor.session.on('changeAnnotation', () => {
            const annotations = this.editor.session.getAnnotations();
            this.handleSyntaxErrors(annotations);
        });
    }

    /**
     * Handle syntax errors
     */
    handleSyntaxErrors(annotations) {
        const errors = annotations.filter(a => a.type === 'error');
        
        if (errors.length > 0) {
            this.showSyntaxErrors(errors);
        } else {
            this.clearSyntaxErrors();
        }
    }

    /**
     * Show syntax errors in UI
     */
    showSyntaxErrors(errors) {
        const errorPanel = this.getErrorPanel();
        const errorList = errors.map(error => 
            `Line ${error.row + 1}: ${error.text}`
        ).join('\n');
        
        errorPanel.innerHTML = `
            <div class="syntax-errors">
                <h4>Syntax Errors:</h4>
                <pre>${errorList}</pre>
            </div>
        `;
        errorPanel.style.display = 'block';
    }

    /**
     * Clear syntax errors
     */
    clearSyntaxErrors() {
        const errorPanel = this.getErrorPanel();
        errorPanel.style.display = 'none';
    }

    /**
     * Get or create error panel
     */
    getErrorPanel() {
        let errorPanel = document.querySelector(`#${this.editorId}-errors`);
        
        if (!errorPanel) {
            errorPanel = document.createElement('div');
            errorPanel.id = `${this.editorId}-errors`;
            errorPanel.className = 'editor-error-panel';
            errorPanel.style.display = 'none';
            
            const editorContainer = document.getElementById(this.editorId).parentNode;
            editorContainer.appendChild(errorPanel);
        }
        
        return errorPanel;
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        let saveTimeout;
        
        this.editor.on('change', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                this.saveCode();
            }, 2000); // Save after 2 seconds of inactivity
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for theme changes
        if (window.eventBus) {
            window.eventBus.on('theme:changed', (data) => {
                this.updateTheme(data.theme);
            });
        }

        // Listen for font size changes
        document.addEventListener('fontSizeChanged', (e) => {
            this.setFontSize(e.detail.fontSize);
        });
    }

    /**
     * Run code in the editor
     */
    async runCode() {
        try {
            const code = this.getCode();
            const outputElement = this.getOutputElement();
            
            // Show loading state
            this.showLoadingState(outputElement);
            
            // Execute code
            const result = await this.executeCode(code);
            
            // Display results
            this.displayResults(outputElement, result);
            
            // Emit completion event if successful
            if (result.success) {
                this.emitCompletionEvent();
            }
            
        } catch (error) {
            console.error('Code execution failed:', error);
            this.showError(error.message);
        }
    }

    /**
     * Reset code to initial state
     */
    resetCode() {
        const initialCode = this.options.initialCode || '# Your code here\n';
        this.editor.setValue(initialCode, -1);
        this.clearOutput();
        
        // Emit reset event
        this.emitEvent('codeReset');
    }

    /**
     * Get code from editor
     */
    getCode() {
        return this.editor.getValue();
    }

    /**
     * Set code in editor
     */
    setCode(code) {
        this.editor.setValue(code, -1);
    }

    /**
     * Get output element
     */
    getOutputElement() {
        let output = document.querySelector(`#${this.editorId}-output`);
        
        if (!output) {
            output = document.createElement('div');
            output.id = `${this.editorId}-output`;
            output.className = 'editor-output';
            
            const editorContainer = document.getElementById(this.editorId).parentNode;
            editorContainer.appendChild(output);
        }
        
        return output;
    }

    /**
     * Show loading state
     */
    showLoadingState(outputElement) {
        outputElement.innerHTML = `
            <div class="output-loading">
                <div class="loading-spinner"></div>
                <span>Running code...</span>
            </div>
        `;
    }

    /**
     * Execute code (simplified - would integrate with backend)
     */
    async executeCode(code) {
        // This would integrate with your code execution backend
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate code execution
                resolve({
                    success: true,
                    output: 'Code executed successfully!',
                    error: null,
                    executionTime: Math.random() * 1000
                });
            }, 1000 + Math.random() * 1000);
        });
    }

    /**
     * Display execution results
     */
    displayResults(outputElement, result) {
        const { success, output, error, executionTime } = result;
        
        outputElement.innerHTML = `
            <div class="output-result ${success ? 'success' : 'error'}">
                ${output ? `<pre class="output-text">${output}</pre>` : ''}
                ${error ? `<div class="output-error">${error}</div>` : ''}
                ${executionTime ? `<div class="execution-time">Executed in ${executionTime.toFixed(2)}ms</div>` : ''}
            </div>
        `;
    }

    /**
     * Clear output
     */
    clearOutput() {
        const outputElement = this.getOutputElement();
        outputElement.innerHTML = '';
    }

    /**
     * Show error message
     */
    showError(message) {
        const outputElement = this.getOutputElement();
        outputElement.innerHTML = `
            <div class="output-error">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }

    /**
     * Save code to localStorage
     */
    saveCode() {
        try {
            const code = this.getCode();
            localStorage.setItem(`editor_${this.editorId}`, code);
        } catch (error) {
            console.error('Failed to save code:', error);
        }
    }

    /**
     * Load code from localStorage
     */
    loadCode() {
        try {
            const saved = localStorage.getItem(`editor_${this.editorId}`);
            if (saved) {
                this.setCode(saved);
            }
        } catch (error) {
            console.error('Failed to load code:', error);
        }
    }

    /**
     * Update editor theme
     */
    updateTheme(theme) {
        const themeMap = {
            'light': 'github',
            'dark': 'monokai',
            'auto': window.matchMedia('(prefers-color-scheme: dark)').matches ? 'monokai' : 'github'
        };
        
        const aceTheme = themeMap[theme] || 'monokai';
        this.editor.setTheme(`ace/theme/${aceTheme}`);
    }

    /**
     * Set font size
     */
    setFontSize(size) {
        this.editor.setFontSize(size);
    }

    /**
     * Focus editor
     */
    focus() {
        this.editor.focus();
    }

    /**
     * Resize editor
     */
    resize() {
        this.editor.resize();
    }

    /**
     * Emit completion event
     */
    emitCompletionEvent() {
        this.emitEvent('codeCompleted', {
            editorId: this.editorId,
            code: this.getCode()
        });
    }

    /**
     * Emit custom event
     */
    emitEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: {
                editorId: this.editorId,
                ...detail
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Destroy editor
     */
    destroy() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
        this.initialized = false;
    }
}

// Global function for creating interactive editors
window.createInteractiveEditor = function(editorId, options = {}) {
    return new InteractiveEditor(editorId, options);
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InteractiveEditor };
} else {
    window.InteractiveEditor = InteractiveEditor;
}
