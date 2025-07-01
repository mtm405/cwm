/**
 * Editor Configuration
 * Centralized configuration for code editors
 */

const EditorConfig = {
    // Default editor settings
    defaults: {
        // ACE Editor themes
        themes: {
            light: 'github',
            dark: 'monokai',
            highContrast: 'terminal'
        },
        
        // Language modes
        languages: {
            python: 'python',
            javascript: 'javascript',
            java: 'java',
            cpp: 'c_cpp',
            html: 'html',
            css: 'css',
            sql: 'sql',
            markdown: 'markdown'
        },
        
        // Editor options
        options: {
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
            minLines: 10,
            tabSize: 4,
            useSoftTabs: true,
            showInvisibles: false,
            animatedScroll: true,
            cursorStyle: 'ace',
            mergeUndoDeltas: true,
            behavioursEnabled: true,
            wrapBehavioursEnabled: true
        }
    },

    // Language-specific configurations
    languageConfigs: {
        python: {
            mode: 'ace/mode/python',
            theme: 'ace/theme/github',
            snippets: true,
            linting: true,
            autoComplete: true,
            syntaxCheck: true,
            keywords: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'import', 'from', 'as', 'return', 'yield', 'lambda', 'pass', 'break', 'continue'],
            executionEndpoint: '/run_python',
            placeholder: '# Write your Python code here...\nprint("Hello, World!")'
        },
        
        javascript: {
            mode: 'ace/mode/javascript',
            theme: 'ace/theme/github',
            snippets: true,
            linting: true,
            autoComplete: true,
            syntaxCheck: true,
            keywords: ['function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'return', 'class', 'extends', 'import', 'export'],
            executionEndpoint: '/run_javascript',
            placeholder: '// Write your JavaScript code here...\nconsole.log("Hello, World!");'
        },
        
        java: {
            mode: 'ace/mode/java',
            theme: 'ace/theme/github',
            snippets: true,
            linting: false,
            autoComplete: true,
            syntaxCheck: true,
            keywords: ['public', 'private', 'protected', 'static', 'final', 'class', 'interface', 'extends', 'implements', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'return'],
            executionEndpoint: '/run_java',
            placeholder: '// Write your Java code here...\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}'
        }
    },

    // Mobile-specific settings
    mobile: {
        gestures: {
            enabled: true,
            swipeThreshold: 50,
            longPressDelay: 800,
            doubleTapDelay: 300
        },
        
        keyboard: {
            preventZoom: true,
            hideOnBlur: true,
            adjustViewport: true
        },
        
        toolbar: {
            enabled: true,
            position: 'bottom',
            buttons: ['tab', 'space', 'brackets', 'quotes', 'semicolon', 'colon']
        },
        
        options: {
            fontSize: 16, // Larger for mobile
            scrollPastEnd: 0.5,
            behavioursEnabled: true,
            wrapBehavioursEnabled: true,
            autoScrollEditorIntoView: true
        }
    },

    // Code execution settings
    execution: {
        timeout: 10000, // 10 seconds
        maxOutputLength: 10000, // Max characters in output
        enableInput: false, // Whether to support user input
        clearOutputOnRun: true,
        showExecutionTime: true,
        
        // Security settings
        security: {
            sanitizeOutput: true,
            blockFileOperations: true,
            blockNetworkAccess: true,
            memoryLimit: '128MB',
            timeLimit: '10s'
        }
    },

    // Code validation settings
    validation: {
        enabled: true,
        realTime: false, // Validate on change vs on submit
        showLineNumbers: true,
        highlightErrors: true,
        
        // Test execution settings
        tests: {
            timeout: 5000,
            maxTests: 20,
            showProgress: true,
            stopOnFirstFail: false
        }
    },

    // UI themes and styling
    ui: {
        themes: {
            light: {
                background: '#ffffff',
                foreground: '#333333',
                accent: '#007bff',
                success: '#28a745',
                warning: '#ffc107',
                error: '#dc3545',
                border: '#dee2e6'
            },
            
            dark: {
                background: '#1e1e1e',
                foreground: '#d4d4d4',
                accent: '#007acc',
                success: '#4ec9b0',
                warning: '#ffcc02',
                error: '#f44747',
                border: '#3e3e42'
            }
        },
        
        animations: {
            enabled: true,
            duration: 200,
            easing: 'ease-in-out'
        }
    },

    // Keyboard shortcuts
    shortcuts: {
        runCode: { win: 'Ctrl-Enter', mac: 'Cmd-Enter' },
        toggleComment: { win: 'Ctrl-/', mac: 'Cmd-/' },
        showHint: 'F1',
        resetCode: { win: 'Ctrl-R', mac: 'Cmd-R' },
        showSolution: { win: 'Ctrl-Shift-S', mac: 'Cmd-Shift-S' },
        toggleFullscreen: 'F11',
        find: { win: 'Ctrl-F', mac: 'Cmd-F' },
        replace: { win: 'Ctrl-H', mac: 'Cmd-Alt-F' },
        saveCode: { win: 'Ctrl-S', mac: 'Cmd-S' },
        formatCode: { win: 'Ctrl-Shift-F', mac: 'Cmd-Shift-F' }
    },

    // Error messages
    messages: {
        errors: {
            EDITOR_NOT_FOUND: 'Code editor not found',
            ACE_NOT_LOADED: 'ACE editor library not loaded',
            EXECUTION_FAILED: 'Code execution failed',
            TIMEOUT: 'Code execution timed out',
            INVALID_CODE: 'Invalid code format',
            NO_CODE: 'Please write some code first',
            NETWORK_ERROR: 'Network error occurred',
            SERVER_ERROR: 'Server error occurred'
        },
        
        success: {
            CODE_EXECUTED: 'Code executed successfully',
            TESTS_PASSED: 'All tests passed',
            CODE_SAVED: 'Code saved successfully',
            CODE_RESET: 'Code reset to original'
        },
        
        warnings: {
            LONG_EXECUTION: 'Code is taking longer than expected...',
            NO_OUTPUT: 'Code executed but produced no output',
            PARTIAL_TESTS: 'Some tests failed'
        }
    },

    // Feature flags
    features: {
        enableCodeCompletion: true,
        enableSyntaxHighlighting: true,
        enableErrorMarkers: true,
        enableLineNumbers: true,
        enableMinimap: false,
        enableCodeFolding: true,
        enableBracketMatching: true,
        enableMultiCursor: true,
        enableSnippets: true,
        enableEmmet: false,
        enableVim: false,
        enableCollaboration: false
    },

    // Analytics and tracking
    analytics: {
        trackCodeChanges: true,
        trackExecutions: true,
        trackErrors: true,
        trackPerformance: true,
        batchSize: 10,
        flushInterval: 30000 // 30 seconds
    }
};

// Create language-specific getter methods
EditorConfig.getLanguageConfig = function(language) {
    return this.languageConfigs[language] || this.languageConfigs.python;
};

EditorConfig.getTheme = function(themeName = 'light') {
    return this.ui.themes[themeName] || this.ui.themes.light;
};

EditorConfig.getMobileConfig = function() {
    return this.mobile;
};

EditorConfig.getExecutionConfig = function() {
    return this.execution;
};

EditorConfig.getValidationConfig = function() {
    return this.validation;
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EditorConfig;
} else {
    // Make available globally
    window.EditorConfig = EditorConfig;
}
