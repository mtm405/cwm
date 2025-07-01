/**
 * Mobile Code Editor - Enhanced JavaScript functionality
 * Optimized for touch devices with gesture support
 */

class MobileCodeEditor {
    constructor(editorId = 'main') {
        this.editorId = editorId;
        this.editor = document.getElementById(`code-editor-${editorId}`);
        this.lineNumbers = document.getElementById(`line-numbers-${editorId}`);
        this.outputPanel = document.getElementById(`output-panel-${editorId}`);
        this.outputText = document.getElementById(`output-text-${editorId}`);
        this.cursorPos = document.getElementById(`cursor-pos-${editorId}`);
        this.charCount = document.getElementById(`char-count-${editorId}`);
        this.editorStatus = document.getElementById(`editor-status-${editorId}`);
        this.outputStatus = document.getElementById(`output-status-${editorId}`);
        this.gestureOverlay = document.getElementById(`gesture-overlay-${editorId}`);
        
        // Touch gesture properties
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isGestureActive = false;
        this.gestureThreshold = 50; // Minimum distance for gesture
        this.gestureTimeout = null;
        
        // Editor state
        this.isFullscreen = false;
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoStack = 50;
        
        this.init();
    }
    
    init() {
        if (!this.editor) {
            console.warn(`Mobile editor with ID ${this.editorId} not found`);
            return;
        }
        
        this.setupEventListeners();
        this.updateLineNumbers();
        this.updateCursorPosition();
        this.updateCharacterCount();
        this.setupTouchGestures();
        this.setupToolbarActions();
        this.setupMobileKeyboard();
        
        console.log(`Mobile Code Editor ${this.editorId} initialized`);
    }
    
    setupEventListeners() {
        // Text change events
        this.editor.addEventListener('input', (e) => {
            this.handleTextChange(e);
        });
        
        this.editor.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        // Cursor position events
        this.editor.addEventListener('selectionchange', () => {
            this.updateCursorPosition();
        });
        
        this.editor.addEventListener('click', () => {
            this.updateCursorPosition();
        });
        
        // Focus events for mobile keyboard optimization
        this.editor.addEventListener('focus', () => {
            this.handleEditorFocus();
        });
        
        this.editor.addEventListener('blur', () => {
            this.handleEditorBlur();
        });
        
        // Action button events
        this.setupActionButtons();
    }
    
    setupActionButtons() {
        const container = this.editor.closest('.mobile-code-editor');
        
        // Header buttons
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            
            const action = btn.dataset.action;
            this.handleAction(action, btn);
        });
        
        // Collapse buttons
        container.addEventListener('click', (e) => {
            const collapseBtn = e.target.closest('.btn-collapse');
            if (!collapseBtn) return;
            
            const target = document.getElementById(collapseBtn.dataset.target);
            if (target) {
                this.toggleCollapse(target, collapseBtn);
            }
        });
    }
    
    setupToolbarActions() {
        const toolbar = this.editor.closest('.mobile-code-editor').querySelector('.mobile-editor-toolbar');
        if (!toolbar) return;
        
        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.toolbar-btn');
            if (!btn) return;
            
            const insertText = btn.dataset.insert;
            if (insertText) {
                this.insertTextAtCursor(insertText);
                this.addToUndoStack();
            }
        });
    }
    
    setupTouchGestures() {
        if (!('ontouchstart' in window)) return;
        
        this.editor.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: false });
        
        this.editor.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });
        
        this.editor.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: false });
        
        // Long press for context menu
        this.editor.addEventListener('touchstart', (e) => {
            this.longPressTimer = setTimeout(() => {
                this.showGestureHint();
            }, 800);
        });
        
        this.editor.addEventListener('touchend', () => {
            clearTimeout(this.longPressTimer);
        });
    }
    
    setupMobileKeyboard() {
        // Prevent zoom on input focus (iOS)
        this.editor.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        
        // Handle virtual keyboard appearance
        if ('visualViewport' in window) {
            window.visualViewport.addEventListener('resize', () => {
                this.handleVirtualKeyboard();
            });
        }
    }
    
    handleTextChange(e) {
        this.updateLineNumbers();
        this.updateCharacterCount();
        this.setEditorStatus('typing', 'Typing...');
        
        // Clear typing status after delay
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.setEditorStatus('ready', 'Ready');
        }, 1000);
    }
    
    handleKeyDown(e) {
        // Handle tab key for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            this.insertTextAtCursor('    '); // 4 spaces
            this.addToUndoStack();
            return;
        }
        
        // Handle undo/redo
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
        }
        
        // Auto-closing brackets and quotes
        this.handleAutoComplete(e);
    }
    
    handleAutoComplete(e) {
        const cursor = this.editor.selectionStart;
        const text = this.editor.value;
        
        const autoCompletePairs = {
            '(': ')',
            '[': ']',
            '{': '}',
            '"': '"',
            "'": "'"
        };
        
        if (autoCompletePairs[e.key]) {
            const nextChar = text[cursor];
            
            // Don't auto-complete if next character is the same
            if (nextChar === autoCompletePairs[e.key] && e.key === nextChar) {
                e.preventDefault();
                this.moveCursor(1);
                return;
            }
            
            // Insert the pair
            setTimeout(() => {
                const currentCursor = this.editor.selectionStart;
                this.insertTextAtCursor(autoCompletePairs[e.key]);
                this.editor.setSelectionRange(currentCursor, currentCursor);
            }, 0);
        }
    }
    
    handleTouchStart(e) {
        if (e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.isGestureActive = false;
    }
    
    handleTouchMove(e) {
        if (e.touches.length !== 1) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        
        // Check if this might be a gesture
        if (Math.abs(deltaX) > this.gestureThreshold || Math.abs(deltaY) > this.gestureThreshold) {
            this.isGestureActive = true;
        }
    }
    
    handleTouchEnd(e) {
        if (!this.isGestureActive) return;
        
        const touch = e.changedTouches[0];
        this.touchEndX = touch.clientX;
        this.touchEndY = touch.clientY;
        
        this.detectGesture();
        this.isGestureActive = false;
    }
    
    detectGesture() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);
        
        // Ignore if gesture is too small
        if (absDeltaX < this.gestureThreshold && absDeltaY < this.gestureThreshold) {
            return;
        }
        
        // Determine gesture direction
        if (absDeltaX > absDeltaY) {
            // Horizontal gestures
            if (deltaX > 0) {
                this.handleGesture('swipe-right');
            } else {
                this.handleGesture('swipe-left');
            }
        } else {
            // Vertical gestures
            if (deltaY > 0) {
                this.handleGesture('swipe-down');
            } else {
                this.handleGesture('swipe-up');
            }
        }
    }
    
    handleGesture(gesture) {
        switch (gesture) {
            case 'swipe-right':
                this.insertTextAtCursor('    '); // Indent
                break;
            case 'swipe-left':
                this.removeIndentation();
                break;
            case 'swipe-up':
                this.moveCursorLine(-1);
                break;
            case 'swipe-down':
                this.moveCursorLine(1);
                break;
        }
        
        this.showGestureHint(gesture);
    }
    
    showGestureHint(gesture = null) {
        if (!this.gestureOverlay) return;
        
        const hintText = this.gestureOverlay.querySelector('.gesture-text');
        if (gesture && hintText) {
            const messages = {
                'swipe-right': 'Indented →',
                'swipe-left': '← Unindented',
                'swipe-up': '↑ Line up',
                'swipe-down': '↓ Line down'
            };
            hintText.textContent = messages[gesture] || 'Gesture detected';
        }
        
        this.gestureOverlay.style.display = 'flex';
        
        clearTimeout(this.gestureTimeout);
        this.gestureTimeout = setTimeout(() => {
            this.gestureOverlay.style.display = 'none';
        }, 1000);
    }
    
    handleAction(action, button) {
        switch (action) {
            case 'run':
                this.runCode();
                break;
            case 'clear':
                this.clearCode();
                break;
            case 'format':
                this.formatCode();
                break;
            case 'fullscreen':
                this.toggleFullscreen();
                break;
            case 'help':
                this.showHelp();
                break;
        }
    }
    
    runCode() {
        const code = this.editor.value.trim();
        if (!code) {
            this.showOutput('No code to run.', 'warning');
            return;
        }
        
        this.setOutputStatus('running', 'Running...');
        this.showOutput('Running your code...', 'info');
        
        // Simulate code execution (replace with actual execution logic)
        setTimeout(() => {
            try {
                // This would typically send code to backend for execution
                this.executeCode(code);
            } catch (error) {
                this.showOutput(`Error: ${error.message}`, 'error');
                this.setOutputStatus('error', 'Error');
            }
        }, 500);
    }
    
    executeCode(code) {
        // Placeholder for actual code execution
        // In a real implementation, this would send the code to a backend service
        const lines = code.split('\n');
        let output = '';
        
        // Simple print statement simulation
        const printRegex = /print\s*\(\s*['"](.*?)['\"]\s*\)/g;
        let match;
        
        while ((match = printRegex.exec(code)) !== null) {
            output += match[1] + '\n';
        }
        
        if (output) {
            this.showOutput(output, 'success');
            this.setOutputStatus('success', 'Success');
        } else {
            this.showOutput('Code executed successfully (no output)', 'success');
            this.setOutputStatus('success', 'Success');
        }
    }
    
    clearCode() {
        if (this.editor.value.trim()) {
            this.addToUndoStack();
        }
        this.editor.value = '';
        this.updateLineNumbers();
        this.updateCharacterCount();
        this.updateCursorPosition();
        this.setEditorStatus('ready', 'Ready');
    }
    
    formatCode() {
        this.addToUndoStack();
        const code = this.editor.value;
        
        // Simple Python code formatting
        const formatted = this.formatPythonCode(code);
        this.editor.value = formatted;
        this.updateLineNumbers();
        this.setEditorStatus('formatted', 'Formatted');
        
        setTimeout(() => {
            this.setEditorStatus('ready', 'Ready');
        }, 2000);
    }
    
    formatPythonCode(code) {
        // Basic Python formatting rules
        const lines = code.split('\n');
        let formatted = [];
        let indentLevel = 0;
        
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                formatted.push('');
                continue;
            }
            
            // Decrease indent for certain keywords
            if (trimmed.startsWith('except') || trimmed.startsWith('elif') || 
                trimmed.startsWith('else') || trimmed.startsWith('finally')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Apply current indentation
            const indented = '    '.repeat(indentLevel) + trimmed;
            formatted.push(indented);
            
            // Increase indent after certain patterns
            if (trimmed.endsWith(':')) {
                indentLevel++;
            }
        }
        
        return formatted.join('\n');
    }
    
    toggleFullscreen() {
        const container = this.editor.closest('.mobile-code-editor');
        if (!container) return;
        
        if (!this.isFullscreen) {
            container.classList.add('fullscreen-editor');
            this.isFullscreen = true;
            
            // Hide other content and make editor take full viewport
            document.body.style.overflow = 'hidden';
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100vw';
            container.style.height = '100vh';
            container.style.zIndex = '9999';
        } else {
            container.classList.remove('fullscreen-editor');
            this.isFullscreen = false;
            
            // Restore normal layout
            document.body.style.overflow = '';
            container.style.position = '';
            container.style.top = '';
            container.style.left = '';
            container.style.width = '';
            container.style.height = '';
            container.style.zIndex = '';
        }
        
        // Update fullscreen button icon
        const fullscreenBtn = container.querySelector('[data-action="fullscreen"] i');
        if (fullscreenBtn) {
            fullscreenBtn.className = this.isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
        }
    }
    
    showHelp() {
        const helpContent = `
Mobile Code Editor Help:

Touch Gestures:
• Swipe right: Indent line
• Swipe left: Remove indentation  
• Swipe up: Move cursor up one line
• Swipe down: Move cursor down one line
• Long press: Show gesture hints

Toolbar Buttons:
• Tap any button to insert code
• Scroll horizontally to see more options

Keyboard Shortcuts:
• Tab: Insert 4 spaces (indentation)
• Ctrl+Z: Undo last change
• Ctrl+Y: Redo last change

Features:
• Auto-closing brackets and quotes
• Line numbers and cursor position
• Character count and status indicators
• Collapsible output panel
• Fullscreen mode for focused coding
        `;
        
        this.showOutput(helpContent, 'info');
    }
    
    // Utility methods
    insertTextAtCursor(text) {
        const cursor = this.editor.selectionStart;
        const value = this.editor.value;
        
        this.editor.value = value.slice(0, cursor) + text + value.slice(cursor);
        this.editor.setSelectionRange(cursor + text.length, cursor + text.length);
        
        this.updateLineNumbers();
        this.updateCharacterCount();
        this.updateCursorPosition();
    }
    
    removeIndentation() {
        const cursor = this.editor.selectionStart;
        const value = this.editor.value;
        const lineStart = value.lastIndexOf('\n', cursor - 1) + 1;
        const lineEnd = value.indexOf('\n', cursor);
        const actualLineEnd = lineEnd === -1 ? value.length : lineEnd;
        
        const line = value.slice(lineStart, actualLineEnd);
        
        if (line.startsWith('    ')) {
            const newValue = value.slice(0, lineStart) + line.slice(4) + value.slice(actualLineEnd);
            this.editor.value = newValue;
            this.editor.setSelectionRange(Math.max(lineStart, cursor - 4), Math.max(lineStart, cursor - 4));
            
            this.updateLineNumbers();
            this.updateCharacterCount();
            this.updateCursorPosition();
        }
    }
    
    moveCursor(offset) {
        const newPos = Math.max(0, Math.min(this.editor.value.length, this.editor.selectionStart + offset));
        this.editor.setSelectionRange(newPos, newPos);
        this.updateCursorPosition();
    }
    
    moveCursorLine(direction) {
        const cursor = this.editor.selectionStart;
        const lines = this.editor.value.split('\n');
        let currentLine = 0;
        let charCount = 0;
        
        // Find current line
        for (let i = 0; i < lines.length; i++) {
            if (charCount + lines[i].length >= cursor) {
                currentLine = i;
                break;
            }
            charCount += lines[i].length + 1; // +1 for newline
        }
        
        const targetLine = Math.max(0, Math.min(lines.length - 1, currentLine + direction));
        if (targetLine === currentLine) return;
        
        // Calculate position in target line
        const currentLinePos = cursor - charCount;
        const targetLineLength = lines[targetLine].length;
        const targetPos = Math.min(currentLinePos, targetLineLength);
        
        // Calculate absolute cursor position
        let newCursor = 0;
        for (let i = 0; i < targetLine; i++) {
            newCursor += lines[i].length + 1;
        }
        newCursor += targetPos;
        
        this.editor.setSelectionRange(newCursor, newCursor);
        this.updateCursorPosition();
    }
    
    updateLineNumbers() {
        if (!this.lineNumbers) return;
        
        const lines = this.editor.value.split('\n');
        const lineNumbersHtml = lines.map((_, index) => 
            `<span class="line-number">${index + 1}</span>`
        ).join('');
        
        this.lineNumbers.innerHTML = lineNumbersHtml;
    }
    
    updateCursorPosition() {
        if (!this.cursorPos) return;
        
        const cursor = this.editor.selectionStart;
        const value = this.editor.value;
        const lines = value.slice(0, cursor).split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        
        this.cursorPos.textContent = `Line ${line}, Col ${col}`;
    }
    
    updateCharacterCount() {
        if (!this.charCount) return;
        
        const count = this.editor.value.length;
        this.charCount.textContent = `${count} characters`;
    }
    
    setEditorStatus(type, message) {
        if (!this.editorStatus) return;
        
        const icon = this.editorStatus.querySelector('i');
        const statusColors = {
            ready: 'text-success',
            typing: 'text-warning',
            formatted: 'text-info',
            error: 'text-danger'
        };
        
        icon.className = 'fas fa-circle ' + (statusColors[type] || 'text-secondary');
        this.editorStatus.lastChild.textContent = message;
    }
    
    setOutputStatus(type, message) {
        if (!this.outputStatus) return;
        
        const icon = this.outputStatus.querySelector('i');
        const statusColors = {
            ready: 'text-secondary',
            running: 'text-warning',
            success: 'text-success',
            error: 'text-danger'
        };
        
        icon.className = 'fas fa-circle ' + (statusColors[type] || 'text-secondary');
        this.outputStatus.lastChild.textContent = message;
    }
    
    showOutput(text, type = 'info') {
        if (!this.outputText) return;
        
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] `;
        
        this.outputText.textContent = prefix + text;
        
        // Scroll to bottom of output
        this.outputText.scrollTop = this.outputText.scrollHeight;
    }
    
    toggleCollapse(target, button) {
        const isCollapsed = target.style.display === 'none';
        target.style.display = isCollapsed ? 'block' : 'none';
        
        const icon = button.querySelector('i');
        icon.className = isCollapsed ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
    }
    
    handleEditorFocus() {
        this.setEditorStatus('ready', 'Ready');
    }
    
    handleEditorBlur() {
        this.setEditorStatus('ready', 'Ready');
    }
    
    handleVirtualKeyboard() {
        // Adjust layout when virtual keyboard appears
        const viewport = window.visualViewport;
        const container = this.editor.closest('.mobile-code-editor');
        
        if (container) {
            container.style.height = viewport.height + 'px';
        }
    }
    
    // Undo/Redo functionality
    addToUndoStack() {
        this.undoStack.push(this.editor.value);
        if (this.undoStack.length > this.maxUndoStack) {
            this.undoStack.shift();
        }
        this.redoStack = []; // Clear redo stack on new action
    }
    
    undo() {
        if (this.undoStack.length === 0) return;
        
        this.redoStack.push(this.editor.value);
        this.editor.value = this.undoStack.pop();
        this.updateLineNumbers();
        this.updateCharacterCount();
        this.updateCursorPosition();
    }
    
    redo() {
        if (this.redoStack.length === 0) return;
        
        this.undoStack.push(this.editor.value);
        this.editor.value = this.redoStack.pop();
        this.updateLineNumbers();
        this.updateCharacterCount();
        this.updateCursorPosition();
    }
}

// Auto-initialize mobile editors when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const mobileEditors = document.querySelectorAll('.mobile-code-editor');
    mobileEditors.forEach((editor, index) => {
        const textarea = editor.querySelector('.mobile-code-textarea');
        if (textarea) {
            const editorId = textarea.id.replace('code-editor-', '') || `editor-${index}`;
            new MobileCodeEditor(editorId);
        }
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileCodeEditor;
}
