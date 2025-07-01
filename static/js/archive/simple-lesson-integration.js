/**
 * Simple Lesson Integration - Main initialization script
 * Code with Morais - Lesson Template System
 * 
 * This script provides a simple way to initialize all lesson components
 * without complex dependencies.
 */

// Global lesson management
window.LessonManager = class {
    constructor(lessonData) {
        this.lessonData = lessonData;
        this.lessonId = lessonData?.id || 'unknown';
        this.currentSubtopic = 0;
        this.editors = {};
        this.initialized = false;
    }
    
    initialize() {
        console.log('🚀 Initializing Simple Lesson Manager...');
        
        try {
            // Initialize with current lesson data
            this.renderContent();
            this.setupEventListeners();
            this.initializeSubtopics();
            
            this.initialized = true;
            console.log('✅ Simple Lesson Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing lesson manager:', error);
        }
    }
    
    renderContent() {
        const container = document.getElementById('lesson-content-container') || 
                         document.querySelector('main.lesson-content');
        
        if (!container) {
            console.warn('⚠️ No content container found');
            return;
        }
        
        if (!this.lessonData?.content) {
            console.warn('⚠️ No lesson content data available');
            return;
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Render each content block
        // Ensure contentBlocks is an array before forEach
        const contentBlocks = Array.isArray(this.lessonData.content) ? this.lessonData.content : [];
        contentBlocks.forEach((block, index) => {
            const blockElement = this.createContentBlock(block, index);
            container.appendChild(blockElement);
        });
        
        // Initialize ACE editors after content is rendered
        this.initializeEditors();
        
        console.log(`✅ Rendered ${this.lessonData.content.length} content blocks`);
    }
    
    createContentBlock(block, index) {
        const blockElement = document.createElement('div');
        blockElement.className = `content-block ${block.type}-block`;
        blockElement.dataset.blockIndex = index;
        
        switch (block.type) {
            case 'text':
                blockElement.innerHTML = `
                    <div class="text-content">
                        ${this.parseMarkdown(block.content)}
                    </div>
                `;
                break;
                
            case 'code_example':
                blockElement.innerHTML = `
                    <div class="code-example">
                        <div class="code-header">
                            <span class="language-badge">${block.language || 'python'}</span>
                            <button class="btn-copy" onclick="copyCode(this)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <pre><code class="language-${block.language || 'python'}">${this.escapeHtml(block.code)}</code></pre>
                    </div>
                `;
                break;
                
            case 'interactive_challenge':
                blockElement.innerHTML = `
                    <div class="interactive-challenge">
                        <h3>💻 ${block.title || 'Interactive Challenge'}</h3>
                        <p class="challenge-instructions">${block.instructions}</p>
                        <div class="code-editor-container">
                            <div id="editor-${index}" class="code-editor" style="height: 200px;">${block.starter_code || '# Write your code here\n'}</div>
                        </div>
                        <div class="challenge-actions">
                            <button class="btn btn-primary" onclick="window.lessonManager.runCode(${index})">
                                <i class="fas fa-play"></i> Run Code
                            </button>
                            <button class="btn btn-secondary" onclick="window.lessonManager.resetCode(${index})">
                                <i class="fas fa-undo"></i> Reset
                            </button>
                        </div>
                        <div id="output-${index}" class="code-output" style="display: none;">
                            <div class="output-header">Output:</div>
                            <pre class="output-content"></pre>
                        </div>
                    </div>
                `;
                break;
                
            case 'quiz':
                blockElement.innerHTML = `
                    <div class="quiz-block">
                        <h3>🧠 Knowledge Check</h3>
                        <p>Test your understanding with this quiz.</p>
                        <div class="quiz-placeholder">
                            <button class="btn btn-primary" onclick="window.lessonManager.loadQuiz('${block.quiz_id}')">
                                <i class="fas fa-question-circle"></i> Start Quiz
                            </button>
                        </div>
                    </div>
                `;
                break;
                
            default:
                blockElement.innerHTML = `
                    <div class="unknown-block">
                        <p>Content type "${block.type}" is not yet supported.</p>
                    </div>
                `;
        }
        
        return blockElement;
    }
    
    initializeEditors() {
        // Initialize ACE editors for interactive challenges
        document.querySelectorAll('.code-editor').forEach((editor, index) => {
            if (typeof ace !== 'undefined') {
                try {
                    const aceEditor = ace.edit(editor.id);
                    aceEditor.setTheme('ace/theme/monokai');
                    aceEditor.session.setMode('ace/mode/python');
                    aceEditor.setOptions({
                        fontSize: '14px',
                        wrap: true,
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true
                    });
                    
                    // Store editor reference
                    this.editors[index] = aceEditor;
                    
                    console.log(`✅ ACE editor initialized for challenge ${index}`);
                } catch (error) {
                    console.error(`❌ Error initializing editor ${index}:`, error);
                }
            } else {
                console.warn('⚠️ ACE editor not available, using textarea fallback');
                this.createTextareaFallback(editor, index);
            }
        });
    }
    
    createTextareaFallback(container, index) {
        const textarea = document.createElement('textarea');
        textarea.className = 'code-textarea';
        textarea.value = container.textContent;
        textarea.style.cssText = `
            width: 100%;
            height: 200px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            padding: 1rem;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: #1f2937;
            color: #e5e7eb;
            resize: vertical;
        `;
        
        container.innerHTML = '';
        container.appendChild(textarea);
        
        // Store textarea reference
        this.editors[index] = {
            getValue: () => textarea.value,
            setValue: (value) => { textarea.value = value; }
        };
    }
    
    runCode(editorIndex) {
        console.log(`🏃 Running code for editor ${editorIndex}`);
        
        const editor = this.editors[editorIndex];
        if (!editor) {
            console.error('❌ Editor not found');
            return;
        }
        
        const code = editor.getValue();
        const outputElement = document.getElementById(`output-${editorIndex}`);
        
        if (outputElement) {
            outputElement.style.display = 'block';
            const outputContent = outputElement.querySelector('.output-content');
            
            // Show loading state
            outputContent.textContent = 'Running code...';
            
            // Simulate code execution (replace with real execution later)
            setTimeout(() => {
                try {
                    // Basic Python print statement simulation
                    const result = this.simulateCodeExecution(code);
                    outputContent.textContent = result;
                } catch (error) {
                    outputContent.textContent = `Error: ${error.message}`;
                }
            }, 1000);
        }
    }
    
    resetCode(editorIndex) {
        console.log(`🔄 Resetting code for editor ${editorIndex}`);
        
        const editor = this.editors[editorIndex];
        if (editor) {
            // Find the original starter code
            const blockElement = document.querySelector(`[data-block-index="${editorIndex}"]`);
            const originalContent = this.lessonData.content[editorIndex];
            
            if (originalContent && originalContent.starter_code) {
                editor.setValue(originalContent.starter_code);
            } else {
                editor.setValue('# Write your code here\n');
            }
        }
        
        // Hide output
        const outputElement = document.getElementById(`output-${editorIndex}`);
        if (outputElement) {
            outputElement.style.display = 'none';
        }
    }
    
    loadQuiz(quizId) {
        console.log(`🧠 Loading quiz: ${quizId}`);
        showToast('Quiz functionality will be implemented soon!', 'info');
    }
    
    simulateCodeExecution(code) {
        // Simple simulation of Python print statements
        const printMatches = code.match(/print\s*\([^)]+\)/g);
        if (printMatches) {
            return printMatches.map(match => {
                // Extract content between quotes or parentheses
                const content = match.match(/print\s*\(\s*["']([^"']+)["']\s*\)/);
                if (content) {
                    return content[1];
                }
                return match;
            }).join('\n');
        }
        
        return 'Code executed successfully (simulation)';
    }
    
    setupEventListeners() {
        // Setup any additional event listeners
        console.log('👂 Setting up lesson event listeners...');
    }
    
    initializeSubtopics() {
        // Initialize subtopic navigation if available
        const subtopicTabs = document.querySelectorAll('.subtopic-tab');
        subtopicTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.switchSubtopic(index);
            });
        });
    }
    
    switchSubtopic(index) {
        console.log(`🔄 Switching to subtopic ${index}`);
        
        // Update active tab
        document.querySelectorAll('.subtopic-tab').forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });
        
        this.currentSubtopic = index;
        
        // Update navigation buttons
        this.updateNavigationButtons();
    }
    
    updateNavigationButtons() {
        const prevBtn = document.querySelector('.swipe-prev');
        const nextBtn = document.querySelector('.swipe-next');
        const totalSubtopics = document.querySelectorAll('.subtopic-tab').length;
        
        if (prevBtn) {
            prevBtn.disabled = this.currentSubtopic === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentSubtopic >= totalSubtopics - 1;
        }
    }
    
    // Helper methods
    parseMarkdown(text) {
        if (!text) return '';
        
        return text
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            .replace(/\n/gim, '<br>');
    }
    
    escapeHtml(text) {
        if (!text) return '';
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Global navigation functions for backward compatibility
window.switchSubtopic = function(index) {
    if (window.lessonManager) {
        window.lessonManager.switchSubtopic(index);
    }
};

window.previousSubtopic = function() {
    if (window.lessonManager && window.lessonManager.currentSubtopic > 0) {
        window.lessonManager.switchSubtopic(window.lessonManager.currentSubtopic - 1);
    }
};

window.nextSubtopic = function() {
    const totalSubtopics = document.querySelectorAll('.subtopic-tab').length;
    if (window.lessonManager && window.lessonManager.currentSubtopic < totalSubtopics - 1) {
        window.lessonManager.switchSubtopic(window.lessonManager.currentSubtopic + 1);
    }
};

console.log('📚 Simple Lesson Integration loaded');
