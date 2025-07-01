/**
 * Editor Integration Example
 * Shows how to use the modularized editor components together
 */

// Example: Initialize a code editor with submission handling
function initializeCodeEditor(editorId, blockId, options = {}) {
    // Default configuration
    const config = {
        language: 'python',
        theme: 'github',
        enableTests: true,
        enableRealTimeValidation: false,
        code: '# Write your code here...\nprint("Hello, World!")',
        ...options
    };
    
    // Create editor instance
    const editor = editorService.createEditor(editorId, config);
    
    // Set up run button if it exists
    const runButton = document.getElementById(`run-btn-${blockId || editorId}`);
    if (runButton) {
        runButton.addEventListener('click', () => {
            codeSubmissionHandler.submitCode(editorId, {
                enableTests: config.enableTests,
                blockId: blockId
            });
        });
    }
    
    // Set up reset button if it exists
    const resetButton = document.getElementById(`reset-btn-${blockId || editorId}`);
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            editorService.setCode(editorId, config.code);
        });
    }
    
    // Set up hint button if it exists
    const hintButton = document.getElementById(`hint-btn-${blockId || editorId}`);
    if (hintButton) {
        hintButton.addEventListener('click', () => {
            // Emit hint request event
            eventBus.emit('lesson:hint:request', { editorId, blockId });
        });
    }
    
    return editor;
}

// Example: Batch initialize all editors on a page
function initializeAllEditors() {
    // Find all elements with data-editor attribute
    const editorElements = document.querySelectorAll('[data-editor]');
    
    editorElements.forEach(element => {
        const editorId = element.id;
        const blockId = element.dataset.blockId;
        const language = element.dataset.language || 'python';
        const theme = element.dataset.theme || 'github';
        const code = element.dataset.code || element.textContent || '';
        
        try {
            initializeCodeEditor(editorId, blockId, {
                language,
                theme,
                code: code.trim(),
                enableTests: element.dataset.enableTests === 'true',
                enableRealTimeValidation: element.dataset.enableValidation === 'true'
            });
            
            console.log(`✅ Initialized editor: ${editorId}`);
            
        } catch (error) {
            console.error(`❌ Failed to initialize editor ${editorId}:`, error);
        }
    });
}

// Example: Set up global keyboard shortcuts
function setupGlobalShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to run code in active editor
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            
            if (editorService.activeEditor) {
                codeSubmissionHandler.submitCode(editorService.activeEditor);
            }
        }
        
        // Escape to clear output
        if (e.key === 'Escape') {
            clearAllOutput();
        }
    });
}

// Example: Clear all output panels
function clearAllOutput() {
    const outputElements = document.querySelectorAll('[id^="output-"]');
    outputElements.forEach(element => {
        element.innerHTML = '';
    });
    
    const testElements = document.querySelectorAll('[id^="tests-"]');
    testElements.forEach(element => {
        element.innerHTML = '';
    });
}

// Example: Run code in all editors (for testing)
async function runAllEditors() {
    const promises = [];
    
    for (const editorId of editorService.editors.keys()) {
        promises.push(codeSubmissionHandler.submitCode(editorId));
    }
    
    try {
        const results = await Promise.allSettled(promises);
        console.log('All editors executed:', results);
    } catch (error) {
        console.error('Error running all editors:', error);
    }
}

// Example: Get editor metrics dashboard
function getEditorMetrics() {
    const editorMetrics = editorService.getMetrics();
    const submissionMetrics = codeSubmissionHandler.getMetrics();
    
    return {
        editors: editorMetrics,
        submissions: submissionMetrics,
        combined: {
            totalEditors: editorMetrics.activeEditors,
            totalSubmissions: submissionMetrics.totalSubmissions,
            successRate: submissionMetrics.successRate,
            averageExecutionTime: submissionMetrics.averageExecutionTime,
            uptime: editorMetrics.uptime
        }
    };
}

// Example: Export utilities for external use
window.EditorUtils = {
    initialize: initializeCodeEditor,
    initializeAll: initializeAllEditors,
    setupShortcuts: setupGlobalShortcuts,
    clearOutput: clearAllOutput,
    runAll: runAllEditors,
    getMetrics: getEditorMetrics
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeAllEditors();
        setupGlobalShortcuts();
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        initializeAllEditors();
        setupGlobalShortcuts();
    }, 100);
}

console.log('📚 Editor integration utilities loaded');
