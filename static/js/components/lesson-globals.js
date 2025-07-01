/**
 * Global functions for lesson functionality
 * These functions are called directly from HTML and need to be globally available
 */

// Global variables to store instances
window.lessonManagers = {};
window.codeEditors = {};

/**
 * Run code in an interactive challenge
 * @param {number} editorIndex - Index of the editor
 */
window.runCode = async function(editorIndex) {
    console.log(`🏃 Running code for editor ${editorIndex}`);
    
    try {
        // Get the editor content
        let code = '';
        if (window.codeEditors[editorIndex]) {
            code = window.codeEditors[editorIndex].getValue();
        } else {
            // Fallback to textarea if ACE not available
            const editor = document.getElementById(`editor-${editorIndex}`);
            code = editor ? editor.textContent : '';
        }
        
        if (!code.trim()) {
            showOutput(editorIndex, 'No code to run!', 'error');
            return;
        }
        
        // Show loading state
        showOutput(editorIndex, 'Running code...', 'loading');
        
        // Simulate code execution (replace with actual Piston API call)
        const result = await simulateCodeExecution(code);
        
        // Show result
        if (result.success) {
            showOutput(editorIndex, result.output, 'success');
        } else {
            showOutput(editorIndex, result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error running code:', error);
        showOutput(editorIndex, 'Error running code: ' + error.message, 'error');
    }
};

/**
 * Reset code in an interactive challenge
 * @param {number} editorIndex - Index of the editor
 */
window.resetCode = function(editorIndex) {
    console.log(`🔄 Resetting code for editor ${editorIndex}`);
    
    if (window.codeEditors[editorIndex]) {
        // Reset to starter code (you might want to store this)
        window.codeEditors[editorIndex].setValue('# Write your code here\n');
    }
    
    // Hide output
    const outputElement = document.getElementById(`output-${editorIndex}`);
    if (outputElement) {
        outputElement.style.display = 'none';
    }
};

/**
 * Load a quiz
 * @param {string} quizId - ID of the quiz to load
 */
window.loadQuiz = function(quizId) {
    console.log(`🧠 Loading quiz: ${quizId}`);
    
    // For now, just show a placeholder
    showToast('Quiz functionality coming soon!', 'info');
};

/**
 * Show output for code execution
 * @param {number} editorIndex - Index of the editor
 * @param {string} content - Content to show
 * @param {string} type - Type: 'success', 'error', 'loading'
 */
function showOutput(editorIndex, content, type = 'info') {
    const outputElement = document.getElementById(`output-${editorIndex}`);
    if (!outputElement) return;
    
    const contentElement = outputElement.querySelector('.output-content');
    if (!contentElement) return;
    
    // Set content
    contentElement.textContent = content;
    
    // Set styling based on type
    outputElement.className = `code-output ${type}`;
    outputElement.style.display = 'block';
    
    // Add appropriate icon
    const headerElement = outputElement.querySelector('.output-header');
    if (headerElement) {
        const icons = {
            success: '✅',
            error: '❌',
            loading: '⏳',
            info: 'ℹ️'
        };
        headerElement.textContent = `${icons[type] || 'ℹ️'} Output:`;
    }
}

/**
 * Simulate code execution (replace with actual Piston API)
 * @param {string} code - Code to execute
 * @returns {Promise<Object>} Execution result
 */
async function simulateCodeExecution(code) {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple simulation logic
    if (code.includes('print(')) {
        // Extract what's being printed (very basic)
        const printMatch = code.match(/print\((.*?)\)/);
        if (printMatch) {
            let output = printMatch[1];
            // Remove quotes if it's a string
            output = output.replace(/['"]/g, '');
            return {
                success: true,
                output: output
            };
        }
    }
    
    if (code.includes('error') || code.includes('Error')) {
        return {
            success: false,
            error: 'NameError: name \'error\' is not defined'
        };
    }
    
    return {
        success: true,
        output: 'Code executed successfully!'
    };
}

/**
 * Copy code to clipboard
 * @param {HTMLElement} button - The copy button that was clicked
 */
window.copyCode = function(button) {
    console.log('📋 Copying code to clipboard');
    
    try {
        // Find the code element
        const codeBlock = button.closest('.code-example').querySelector('code') || 
                         button.closest('.interactive-challenge').querySelector('.ace_editor');
        
        let text = '';
        if (codeBlock.classList && codeBlock.classList.contains('ace_editor')) {
            // ACE Editor
            const editorId = codeBlock.closest('[id]').id;
            const editorIndex = editorId.replace('editor-', '');
            if (window.codeEditors[editorIndex]) {
                text = window.codeEditors[editorIndex].getValue();
            }
        } else {
            // Regular code block
            text = codeBlock.textContent;
        }
        
        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            // Update button to show success
            const icon = button.querySelector('i');
            const originalContent = button.innerHTML;
            
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.style.background = '#10b981';
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.style.background = '';
            }, 2000);
            
            showToast('Code copied to clipboard!', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            showToast('Code copied to clipboard!', 'success');
        });
        
    } catch (error) {
        console.error('Error copying code:', error);
        showToast('Failed to copy code', 'error');
    }
};

// Initialize ACE editors when available
document.addEventListener('DOMContentLoaded', function() {
    // Wait for ACE to load
    setTimeout(() => {
        if (typeof ace !== 'undefined') {
            initializeAllEditors();
        }
    }, 500);
});

/**
 * Initialize all ACE editors on the page
 */
function initializeAllEditors() {
    console.log('🔧 Initializing all ACE editors...');
    
    document.querySelectorAll('.code-editor').forEach((editorElement, index) => {
        try {
            const editorId = editorElement.id;
            if (!editorId) return;
            
            const aceEditor = ace.edit(editorId);
            aceEditor.setTheme('ace/theme/monokai');
            aceEditor.session.setMode('ace/mode/python');
            aceEditor.setOptions({
                fontSize: '14px',
                wrap: true,
                enableBasicAutocompletion: true,
                showPrintMargin: false
            });
            
            // Store editor reference
            const editorIndex = editorId.replace('editor-', '');
            window.codeEditors[editorIndex] = aceEditor;
            
            console.log(`✅ ACE editor initialized: ${editorId}`);
            
        } catch (error) {
            console.error(`❌ Error initializing editor ${editorElement.id}:`, error);
        }
    });
}

console.log('📚 Lesson globals loaded');
