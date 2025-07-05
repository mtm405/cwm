/**
 * Editor Service
 * Manages ACE editor instances with enhanced functionality
 */

// Prevent duplicate declarations - Phase 2 Fix
if (typeof window.EditorService === 'undefined') {

class EditorService {
    constructor() {
        this.editors = new Map(); // Store multiple editor instances
        this.eventBus = window.eventBus || null;
        this.config = window.EditorConfig || {};
        this.initialized = false;
        
        // Editor state tracking
        this.activeEditor = null;
        this.editorConfigs = new Map();
        this.changeListeners = new Map();
        
        // Performance tracking
        this.metrics = {
            editorsCreated: 0,
            codeExecutions: 0,
            errors: 0,
            startTime: Date.now()
        };
        
        this.init();
    }

    /**
     * Initialize the editor service
     */
    async init() {
        try {
            console.log('🎯 Initializing Editor Service...');
            
            // Wait for ACE to be available
            await this.waitForAce();
            
            // Configure ACE defaults
            this.configureAceDefaults();
            
            // Set up global event listeners
            this.setupGlobalEventListeners();
            
            this.initialized = true;
            console.log('✅ Editor Service initialized successfully');
            
            // Emit initialization complete
            this.emit('editor:service:init', { 
                timestamp: Date.now(),
                metrics: this.metrics 
            });
            
        } catch (error) {
            console.error('❌ Editor Service initialization failed:', error);
            this.emit('editor:service:error', { 
                type: 'initialization',
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Wait for ACE editor to be available
     */
    async waitForAce() {
        return new Promise((resolve, reject) => {
            const maxAttempts = 50;
            let attempts = 0;
            
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
     * Configure ACE editor defaults
     */
    configureAceDefaults() {
        if (typeof ace === 'undefined') return;
        
        // Set default theme
        ace.config.setDefaultValue('session', 'theme', 'ace/theme/github');
        
        // Configure module loading
        ace.config.set('basePath', '/static/libs/ace/');
        ace.config.set('modePath', '/static/libs/ace/');
        ace.config.set('themePath', '/static/libs/ace/');
        ace.config.set('workerPath', '/static/libs/ace/');
        
        console.log('🔧 ACE editor defaults configured');
    }

    /**
     * Create a new editor instance
     */
    async createEditor(editorId, options = {}) {
        try {
            if (!this.initialized) {
                await this.init();
            }
            
            if (this.editors.has(editorId)) {
                console.warn(`Editor ${editorId} already exists, returning existing instance`);
                return this.editors.get(editorId);
            }
            
            console.log(`🚀 Creating editor: ${editorId}`);
            
            // Get element
            const element = document.getElementById(editorId);
            if (!element) {
                throw new Error(`Element not found: ${editorId}`);
            }
            
            // Merge configuration
            const config = this.mergeConfig(options);
            
            // Check if ACE editor is available
            if (typeof ace === 'undefined') {
                console.warn('⚠️ ACE editor not loaded, using fallback textarea');
                return this.createFallbackEditor(editorId, config);
            }
            
            // Create ACE editor
            const editor = ace.edit(editorId);
            
            // Configure editor
            this.configureEditor(editor, config);
            
            // Set up editor event listeners
            this.setupEditorEventListeners(editor, editorId, config);
            
            // Store editor and config
            this.editors.set(editorId, editor);
            this.editorConfigs.set(editorId, config);
            
            // Track metrics
            this.metrics.editorsCreated++;
            
            // Set as active if first editor
            if (!this.activeEditor) {
                this.activeEditor = editorId;
            }
            
            console.log(`✅ Editor created successfully: ${editorId}`);
            
            // Emit creation event
            this.emit('editor:created', { 
                editorId, 
                config,
                timestamp: Date.now() 
            });
            
            return editor;
            
        } catch (error) {
            console.error(`❌ Failed to create editor ${editorId}:`, error);
            this.metrics.errors++;
            this.emit('editor:error', { 
                editorId,
                type: 'creation',
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Create a fallback editor when ACE is not available
     */
    createFallbackEditor(editorId, config) {
        const container = document.getElementById(editorId);
        if (!container) {
            throw new Error(`Editor container not found: ${editorId}`);
        }
        
        // Create textarea fallback
        const textarea = document.createElement('textarea');
        textarea.id = editorId + '-fallback';
        textarea.style.cssText = `
            width: 100%;
            height: 100%;
            font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace;
            font-size: 14px;
            tab-size: 4;
            border: 1px solid #ccc;
            padding: 10px;
            resize: none;
            background: #f8f9fa;
            color: #333;
        `;
        
        if (config.code) {
            textarea.value = config.code;
        }
        
        // Clear container and add textarea
        container.innerHTML = '';
        container.appendChild(textarea);
        
        // Create mock editor object with basic methods
        const mockEditor = {
            isFallback: true,
            element: textarea,
            getValue: () => textarea.value,
            setValue: (value, cursor) => {
                textarea.value = value;
                if (cursor !== -1) {
                    textarea.setSelectionRange(0, 0);
                }
            },
            getSelection: () => ({
                getRange: () => ({
                    start: { row: 0, column: textarea.selectionStart },
                    end: { row: 0, column: textarea.selectionEnd }
                })
            }),
            focus: () => textarea.focus(),
            blur: () => textarea.blur(),
            on: (event, callback) => {
                if (event === 'change') {
                    textarea.addEventListener('input', callback);
                }
            },
            off: (event, callback) => {
                if (event === 'change') {
                    textarea.removeEventListener('input', callback);
                }
            },
            session: {
                setMode: () => {},
                setUseWrapMode: () => {},
                setTabSize: () => {},
                setUseSoftTabs: () => {}
            },
            setTheme: () => {},
            setOptions: () => {},
            commands: {
                addCommand: () => {}
            }
        };
        
        // Store in editors map
        this.editors.set(editorId, mockEditor);
        this.editorConfigs.set(editorId, config);
        
        console.log(`✅ Fallback editor created for: ${editorId}`);
        
        return mockEditor;
    }

    /**
     * Configure an editor instance
     */
    configureEditor(editor, config) {
        // Set theme and mode
        editor.setTheme(`ace/theme/${config.theme}`);
        editor.session.setMode(`ace/mode/${config.language}`);
        
        // Set editor options
        editor.setOptions(config.options);
        
        // Set initial code
        if (config.code) {
            editor.setValue(config.code, -1);
        }
        
        // Configure session
        editor.session.setUseWrapMode(config.options.wrap);
        editor.session.setTabSize(config.options.tabSize);
        editor.session.setUseSoftTabs(config.options.useSoftTabs);
        
        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts(editor, config);
        
        console.log(`🔧 Editor configured with language: ${config.language}, theme: ${config.theme}`);
    }

    /**
     * Set up keyboard shortcuts for an editor
     */
    setupKeyboardShortcuts(editor, config) {
        const shortcuts = this.config.shortcuts || {};
        
        // Run code shortcut
        if (shortcuts.runCode) {
            editor.commands.addCommand({
                name: 'runCode',
                bindKey: shortcuts.runCode,
                exec: () => {
                    this.emit('editor:shortcut:run', { 
                        editorId: this.getEditorId(editor) 
                    });
                }
            });
        }
        
        // Toggle comment shortcut
        if (shortcuts.toggleComment) {
            editor.commands.addCommand({
                name: 'toggleComment',
                bindKey: shortcuts.toggleComment,
                exec: () => {
                    editor.toggleCommentLines();
                }
            });
        }
        
        // Show hint shortcut
        if (shortcuts.showHint) {
            editor.commands.addCommand({
                name: 'showHint',
                bindKey: shortcuts.showHint,
                exec: () => {
                    this.emit('editor:shortcut:hint', { 
                        editorId: this.getEditorId(editor) 
                    });
                }
            });
        }
        
        // Format code shortcut
        if (shortcuts.formatCode) {
            editor.commands.addCommand({
                name: 'formatCode',
                bindKey: shortcuts.formatCode,
                exec: () => {
                    this.formatCode(this.getEditorId(editor));
                }
            });
        }
        
        // Save code shortcut
        if (shortcuts.saveCode) {
            editor.commands.addCommand({
                name: 'saveCode',
                bindKey: shortcuts.saveCode,
                exec: () => {
                    this.emit('editor:shortcut:save', { 
                        editorId: this.getEditorId(editor) 
                    });
                }
            });
        }
    }

    /**
     * Set up event listeners for an editor
     */
    setupEditorEventListeners(editor, editorId, config) {
        // Track code changes
        editor.on('change', (e) => {
            this.handleCodeChange(editorId, e, editor);
        });
        
        // Track cursor position changes
        editor.on('changeSelection', () => {
            this.handleSelectionChange(editorId, editor);
        });
        
        // Track focus events
        editor.on('focus', () => {
            this.activeEditor = editorId;
            this.emit('editor:focus', { editorId });
        });
        
        editor.on('blur', () => {
            this.emit('editor:blur', { editorId });
        });
        
        // Track errors
        if (config.enableErrorMarkers) {
            editor.session.on('changeAnnotation', () => {
                this.handleAnnotationChange(editorId, editor);
            });
        }
    }

    /**
     * Set up global event listeners
     */
    setupGlobalEventListeners() {
        // Listen for theme changes
        if (this.eventBus) {
            this.eventBus.on('theme:change', (theme) => {
                this.updateAllEditorsTheme(theme);
            });
        }
        
        // Listen for window resize
        window.addEventListener('resize', () => {
            this.resizeAllEditors();
        });
        
        // Listen for visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshAllEditors();
            }
        });
    }

    /**
     * Handle code changes
     */
    handleCodeChange(editorId, changeEvent, editor) {
        const config = this.editorConfigs.get(editorId);
        
        // Emit change event
        this.emit('editor:change', {
            editorId,
            changeEvent,
            code: editor.getValue(),
            timestamp: Date.now()
        });
        
        // Real-time validation if enabled
        if (config && config.enableRealTimeValidation) {
            this.validateCode(editorId);
        }
        
        // Auto-save if enabled
        if (config && config.autoSave) {
            this.debounceAutoSave(editorId);
        }
    }

    /**
     * Handle selection changes
     */
    handleSelectionChange(editorId, editor) {
        const selection = editor.getSelection();
        const range = selection.getRange();
        
        this.emit('editor:selection:change', {
            editorId,
            range,
            selectedText: editor.getSelectedText(),
            cursor: editor.getCursorPosition()
        });
    }

    /**
     * Handle annotation (error) changes
     */
    handleAnnotationChange(editorId, editor) {
        const annotations = editor.session.getAnnotations();
        const errors = annotations.filter(a => a.type === 'error');
        const warnings = annotations.filter(a => a.type === 'warning');
        
        this.emit('editor:annotations:change', {
            editorId,
            errors,
            warnings,
            total: annotations.length
        });
    }

    /**
     * Get editor instance
     */
    getEditor(editorId) {
        return this.editors.get(editorId);
    }

    /**
     * Get editor ID from editor instance
     */
    getEditorId(editor) {
        for (const [id, editorInstance] of this.editors) {
            if (editorInstance === editor) {
                return id;
            }
        }
        return null;
    }

    /**
     * Get code from editor
     */
    getCode(editorId) {
        const editor = this.getEditor(editorId);
        return editor ? editor.getValue() : '';
    }

    /**
     * Set code in editor
     */
    setCode(editorId, code, cursorPosition = -1) {
        const editor = this.getEditor(editorId);
        if (editor) {
            editor.setValue(code, cursorPosition);
            this.emit('editor:code:set', { editorId, code });
        }
    }

    /**
     * Insert text at cursor position
     */
    insertCode(editorId, text) {
        const editor = this.getEditor(editorId);
        if (editor) {
            editor.insert(text);
            this.emit('editor:code:insert', { editorId, text });
        }
    }

    /**
     * Format code in editor
     */
    formatCode(editorId) {
        const editor = this.getEditor(editorId);
        if (!editor) return;
        
        // Get current code
        const code = editor.getValue();
        const language = this.editorConfigs.get(editorId)?.language;
        
        // Basic formatting for supported languages
        let formattedCode = code;
        
        if (language === 'python') {
            // Basic Python formatting
            formattedCode = this.formatPython(code);
        } else if (language === 'javascript') {
            // Basic JavaScript formatting
            formattedCode = this.formatJavaScript(code);
        }
        
        // Set formatted code
        if (formattedCode !== code) {
            const cursorPos = editor.getCursorPosition();
            editor.setValue(formattedCode, -1);
            editor.moveCursorToPosition(cursorPos);
            
            this.emit('editor:code:formatted', { editorId, language });
        }
    }

    /**
     * Basic Python code formatting
     */
    formatPython(code) {
        // Simple indentation fixes
        const lines = code.split('\n');
        let indentLevel = 0;
        const indentSize = 4;
        
        return lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';
            
            // Decrease indent for dedent keywords
            if (/^(elif|else|except|finally|case|default):/.test(trimmed)) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            const indented = ' '.repeat(indentLevel * indentSize) + trimmed;
            
            // Increase indent after colon
            if (trimmed.endsWith(':')) {
                indentLevel++;
            }
            
            return indented;
        }).join('\n');
    }

    /**
     * Basic JavaScript code formatting
     */
    formatJavaScript(code) {
        // Very basic formatting - in production, use a proper formatter
        return code
            .replace(/{\s*/g, ' {\n    ')
            .replace(/}\s*/g, '\n}\n')
            .replace(/;\s*/g, ';\n')
            .replace(/,\s*/g, ', ');
    }

    /**
     * Validate code syntax
     */
    async validateCode(editorId) {
        const editor = this.getEditor(editorId);
        const config = this.editorConfigs.get(editorId);
        
        if (!editor || !config || !config.enableSyntaxCheck) return;
        
        const code = editor.getValue();
        const language = config.language;
        
        try {
            // Clear existing annotations
            editor.session.clearAnnotations();
            
            // Perform language-specific validation
            const validationResult = await this.performSyntaxCheck(code, language);
            
            if (validationResult.errors.length > 0) {
                const annotations = validationResult.errors.map(error => ({
                    row: error.line - 1,
                    column: error.column || 0,
                    text: error.message,
                    type: 'error'
                }));
                
                editor.session.setAnnotations(annotations);
            }
            
            this.emit('editor:validation:complete', {
                editorId,
                errors: validationResult.errors,
                warnings: validationResult.warnings
            });
            
        } catch (error) {
            console.error('Code validation failed:', error);
            this.emit('editor:validation:error', { editorId, error: error.message });
        }
    }

    /**
     * Perform syntax checking
     */
    async performSyntaxCheck(code, language) {
        // This would typically call a backend service
        // For now, return basic client-side validation
        
        const result = { errors: [], warnings: [] };
        
        if (language === 'python') {
            // Basic Python syntax checks
            const lines = code.split('\n');
            lines.forEach((line, index) => {
                // Check for common syntax errors
                if (line.trim().endsWith(':') && !line.trim().match(/^(if|elif|else|for|while|def|class|try|except|finally|with)\\b/)) {
                    result.warnings.push({
                        line: index + 1,
                        message: 'Unexpected colon - check syntax'
                    });
                }
            });
        }
        
        return result;
    }

    /**
     * Update theme for all editors
     */
    updateAllEditorsTheme(theme) {
        const aceTheme = this.config.defaults?.themes[theme] || 'github';
        
        for (const [editorId, editor] of this.editors) {
            editor.setTheme(`ace/theme/${aceTheme}`);
            
            // Update stored config
            const config = this.editorConfigs.get(editorId);
            if (config) {
                config.theme = aceTheme;
            }
        }
        
        console.log(`🎨 Updated theme for ${this.editors.size} editors to: ${aceTheme}`);
    }

    /**
     * Resize all editors
     */
    resizeAllEditors() {
        for (const editor of this.editors.values()) {
            editor.resize();
        }
    }

    /**
     * Refresh all editors
     */
    refreshAllEditors() {
        for (const editor of this.editors.values()) {
            editor.refresh();
        }
    }

    /**
     * Destroy an editor instance
     */
    destroyEditor(editorId) {
        const editor = this.editors.get(editorId);
        if (editor) {
            editor.destroy();
            this.editors.delete(editorId);
            this.editorConfigs.delete(editorId);
            
            if (this.activeEditor === editorId) {
                this.activeEditor = this.editors.size > 0 ? this.editors.keys().next().value : null;
            }
            
            this.emit('editor:destroyed', { editorId });
            console.log(`🗑️ Editor destroyed: ${editorId}`);
        }
    }

    /**
     * Merge configuration with defaults
     */
    mergeConfig(options) {
        const defaults = this.config.defaults || {};
        const languageConfig = this.config.getLanguageConfig ? 
            this.config.getLanguageConfig(options.language || 'python') : {};
        
        return {
            language: 'python',
            theme: 'github',
            enableSyntaxCheck: true,
            enableRealTimeValidation: false,
            enableErrorMarkers: true,
            autoSave: false,
            ...defaults,
            ...languageConfig,
            ...options,
            options: {
                ...defaults.options,
                ...languageConfig.options,
                ...options.options
            }
        };
    }

    /**
     * Auto-save with debouncing
     */
    debounceAutoSave(editorId) {
        if (this.autoSaveTimers && this.autoSaveTimers.has(editorId)) {
            clearTimeout(this.autoSaveTimers.get(editorId));
        }
        
        if (!this.autoSaveTimers) {
            this.autoSaveTimers = new Map();
        }
        
        const timer = setTimeout(() => {
            this.emit('editor:autosave', { 
                editorId, 
                code: this.getCode(editorId) 
            });
        }, 2000);
        
        this.autoSaveTimers.set(editorId, timer);
    }

    /**
     * Get editor metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            activeEditors: this.editors.size,
            uptime: Date.now() - this.metrics.startTime
        };
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
        // Destroy all editors
        for (const editorId of this.editors.keys()) {
            this.destroyEditor(editorId);
        }
        
        // Clear timers
        if (this.autoSaveTimers) {
            for (const timer of this.autoSaveTimers.values()) {
                clearTimeout(timer);
            }
        }
        
        console.log('🧹 Editor Service destroyed');
    }
}

// Create global instance
const editorService = new EditorService();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EditorService, editorService };
} else {
    // Make available globally
    window.EditorService = EditorService;
    window.editorService = editorService;
}

} // End of duplicate declaration guard
