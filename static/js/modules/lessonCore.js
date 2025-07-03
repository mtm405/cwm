/**
 * Lesson Core Module
 * Essential lesson functionality for dynamic lesson pages
 */

class LessonCore {
    constructor(lessonData = {}) {
        this.lessonData = lessonData;
        this.currentSubtopic = 0;
        this.completedSubtopics = new Set();
        this.initialized = false;
        
        console.log('📚 LessonCore initialized');
    }

    /**
     * Initialize lesson system
     */
    async init() {
        if (this.initialized) return;

        try {
            // Initialize lesson navigation
            this.initializeNavigation();
            
            // Initialize content blocks
            this.initializeContentBlocks();
            
            // Initialize progress tracking
            this.initializeProgressTracking();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ LessonCore initialization complete');
            
        } catch (error) {
            console.error('❌ LessonCore initialization failed:', error);
        }
    }

    /**
     * Initialize lesson navigation
     */
    initializeNavigation() {
        // Setup subtopic tabs
        // Ensure tabs is an array before forEach
        const tabs = Array.isArray(document.querySelectorAll('.lesson-tab')) ? document.querySelectorAll('.lesson-tab') : [];
        tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => this.switchToSubtopic(index));
        });

        // Setup navigation buttons
        const prevBtn = document.getElementById('prev-subtopic-btn');
        const nextBtn = document.getElementById('next-subtopic-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSubtopic());
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSubtopic());
        }
    }

    /**
     * Initialize content blocks
     */
    initializeContentBlocks() {
        const contentBlocks = document.querySelectorAll('.content-block');
        contentBlocks.forEach((block, index) => {
            this.initializeBlock(block, index);
        });
    }

    /**
     * Initialize individual content block
     */
    initializeBlock(block, index) {
        const blockType = block.dataset.blockType;
        
        switch (blockType) {
            case 'interactive':
                this.initializeInteractiveBlock(block, index);
                break;
            case 'quiz':
                this.initializeQuizBlock(block, index);
                break;
            case 'code_example':
                this.initializeCodeBlock(block, index);
                break;
        }
    }

    /**
     * Initialize interactive code block
     */
    initializeInteractiveBlock(block, index) {
        const editorElement = block.querySelector('.code-editor');
        if (!editorElement) return;

        const editorId = editorElement.id;
        const runBtn = block.querySelector('.run-code-btn');
        const resetBtn = block.querySelector('.reset-code-btn');

        if (runBtn) {
            runBtn.addEventListener('click', () => this.runCode(editorId));
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetCode(editorId));
        }
    }

    /**
     * Initialize quiz block
     */
    initializeQuizBlock(block, index) {
        const submitBtn = block.querySelector('.submit-quiz-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitQuiz(block));
        }
    }

    /**
     * Initialize code example block
     */
    initializeCodeBlock(block, index) {
        const copyBtn = block.querySelector('.copy-code-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyCode(block));
        }
    }

    /**
     * Initialize progress tracking
     */
    initializeProgressTracking() {
        // Load saved progress
        this.loadProgress();
        
        // Update progress UI
        this.updateProgressUI();
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Listen for completion events
        document.addEventListener('blockCompleted', (e) => {
            this.handleBlockCompletion(e.detail);
        });

        // Listen for navigation events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && e.ctrlKey) {
                this.previousSubtopic();
            } else if (e.key === 'ArrowRight' && e.ctrlKey) {
                this.nextSubtopic();
            }
        });
    }

    /**
     * Switch to specific subtopic
     */
    switchToSubtopic(index) {
        if (index < 0 || index >= this.getSubtopicCount()) return;

        // Update current subtopic
        this.currentSubtopic = index;

        // Update UI
        this.updateSubtopicTabs();
        this.updateSubtopicContent();
        this.updateNavigationButtons();

        // Save progress
        this.saveProgress();

        console.log(`📖 Switched to subtopic ${index}`);
    }

    /**
     * Navigate to previous subtopic
     */
    previousSubtopic() {
        if (this.currentSubtopic > 0) {
            this.switchToSubtopic(this.currentSubtopic - 1);
        }
    }

    /**
     * Navigate to next subtopic
     */
    nextSubtopic() {
        if (this.currentSubtopic < this.getSubtopicCount() - 1) {
            this.switchToSubtopic(this.currentSubtopic + 1);
        }
    }

    /**
     * Mark current subtopic as completed
     */
    completeCurrentSubtopic() {
        this.completedSubtopics.add(this.currentSubtopic);
        this.updateProgressUI();
        this.saveProgress();

        // Show completion feedback
        this.showCompletionFeedback();

        // Auto-advance if not on last subtopic
        if (this.currentSubtopic < this.getSubtopicCount() - 1) {
            setTimeout(() => {
                this.nextSubtopic();
            }, 1000);
        }
    }

    /**
     * Run code in interactive editor
     */
    async runCode(editorId) {
        try {
            const editor = ace.edit(editorId);
            const code = editor.getValue();
            const outputElement = document.querySelector(`#${editorId}-output`);

            if (!outputElement) {
                console.error('Output element not found');
                return;
            }

            // Show loading state
            outputElement.innerHTML = '<div class="output-loading">Running code...</div>';

            // Execute code (simplified - would integrate with backend)
            const result = await this.executeCode(code);
            
            // Display result
            outputElement.innerHTML = `
                <div class="output-result">
                    <pre>${result.output || 'Code executed successfully'}</pre>
                    ${result.error ? `<div class="output-error">${result.error}</div>` : ''}
                </div>
            `;

            // Check if tests pass (if available)
            if (result.testsPass) {
                this.handleBlockCompletion({ blockId: editorId, type: 'interactive' });
            }

        } catch (error) {
            console.error('Code execution failed:', error);
            const outputElement = document.querySelector(`#${editorId}-output`);
            if (outputElement) {
                outputElement.innerHTML = `<div class="output-error">Error: ${error.message}</div>`;
            }
        }
    }

    /**
     * Reset code in editor
     */
    resetCode(editorId) {
        const editor = ace.edit(editorId);
        const originalCode = editor.container.dataset.originalCode || '# Your code here';
        editor.setValue(originalCode, -1);
        
        // Clear output
        const outputElement = document.querySelector(`#${editorId}-output`);
        if (outputElement) {
            outputElement.innerHTML = '';
        }
    }

    /**
     * Submit quiz answers
     */
    async submitQuiz(quizBlock) {
        try {
            const answers = this.collectQuizAnswers(quizBlock);
            const result = await this.gradeQuiz(answers);
            
            this.displayQuizResults(quizBlock, result);
            
            if (result.passed) {
                this.handleBlockCompletion({ 
                    blockId: quizBlock.id, 
                    type: 'quiz',
                    score: result.score 
                });
            }

        } catch (error) {
            console.error('Quiz submission failed:', error);
        }
    }

    /**
     * Copy code to clipboard
     */
    copyCode(codeBlock) {
        const codeContent = codeBlock.querySelector('code').textContent;
        navigator.clipboard.writeText(codeContent).then(() => {
            this.showToast('Code copied to clipboard!');
        });
    }

    /**
     * Handle block completion
     */
    handleBlockCompletion(details) {
        console.log('✅ Block completed:', details);
        
        // Update progress
        this.updateBlockProgress(details.blockId, true);
        
        // Show success feedback
        this.showSuccessFeedback(details.type);
        
        // Check if subtopic is complete
        if (this.isSubtopicComplete()) {
            this.completeCurrentSubtopic();
        }
    }

    /**
     * Update subtopic tabs UI
     */
    updateSubtopicTabs() {
        const tabs = document.querySelectorAll('.lesson-tab');
        tabs.forEach((tab, index) => {
            tab.classList.toggle('active', index === this.currentSubtopic);
            tab.classList.toggle('completed', this.completedSubtopics.has(index));
        });
    }

    /**
     * Update subtopic content visibility
     */
    updateSubtopicContent() {
        const contents = document.querySelectorAll('.subtopic-content');
        contents.forEach((content, index) => {
            content.style.display = index === this.currentSubtopic ? 'block' : 'none';
        });
    }

    /**
     * Update navigation buttons
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-subtopic-btn');
        const nextBtn = document.getElementById('next-subtopic-btn');

        // If no buttons are found, exit gracefully.
        if (!prevBtn && !nextBtn) {
            return;
        }
        
        if (prevBtn) {
            prevBtn.disabled = this.currentSubtopic === 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentSubtopic >= this.getSubtopicCount() - 1;
        }
    }

    /**
     * Update progress UI
     */
    updateProgressUI() {
        const progressBar = document.querySelector('.lesson-progress-bar .progress-fill');
        if (progressBar) {
            const progress = (this.completedSubtopics.size / this.getSubtopicCount()) * 100;
            progressBar.style.width = `${progress}%`;
        }

        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${this.completedSubtopics.size} / ${this.getSubtopicCount()} completed`;
        }
    }

    /**
     * Get subtopic count
     */
    getSubtopicCount() {
        return document.querySelectorAll('.lesson-tab').length;
    }

    /**
     * Check if current subtopic is complete
     */
    isSubtopicComplete() {
        const currentContent = document.querySelector(`.subtopic-content:nth-child(${this.currentSubtopic + 1})`);
        if (!currentContent) return false;

        const blocks = currentContent.querySelectorAll('.content-block');
        return Array.from(blocks).every(block => {
            return block.classList.contains('completed');
        });
    }

    /**
     * Execute code (simplified implementation)
     */
    async executeCode(code) {
        // This would integrate with your backend API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    output: 'Code executed successfully',
                    error: null,
                    testsPass: true
                });
            }, 1000);
        });
    }

    /**
     * Collect quiz answers
     */
    collectQuizAnswers(quizBlock) {
        const answers = {};
        const inputs = quizBlock.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') {
                if (input.checked) {
                    answers[input.name] = input.value;
                }
            } else {
                answers[input.name] = input.value;
            }
        });

        return answers;
    }

    /**
     * Grade quiz (simplified implementation)
     */
    async gradeQuiz(answers) {
        // This would integrate with your backend grading system
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    passed: true,
                    score: 100,
                    feedback: 'Great job!'
                });
            }, 500);
        });
    }

    /**
     * Display quiz results
     */
    displayQuizResults(quizBlock, result) {
        const resultsDiv = quizBlock.querySelector('.quiz-results') || 
                          document.createElement('div');
        resultsDiv.className = 'quiz-results';
        
        resultsDiv.innerHTML = `
            <div class="quiz-score ${result.passed ? 'passed' : 'failed'}">
                Score: ${result.score}%
            </div>
            <div class="quiz-feedback">${result.feedback}</div>
        `;

        if (!quizBlock.querySelector('.quiz-results')) {
            quizBlock.appendChild(resultsDiv);
        }
    }

    /**
     * Show completion feedback
     */
    showCompletionFeedback() {
        this.showToast('🎉 Subtopic completed!', 'success');
    }

    /**
     * Show success feedback
     */
    showSuccessFeedback(type) {
        const messages = {
            interactive: '✅ Code challenge completed!',
            quiz: '✅ Quiz passed!',
            code_example: '✅ Example understood!'
        };
        
        this.showToast(messages[type] || '✅ Well done!', 'success');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Use global notification system if available
        if (window.notify) {
            window.notify[type](message);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Update block progress
     */
    updateBlockProgress(blockId, completed) {
        const block = document.getElementById(blockId);
        if (block) {
            block.classList.toggle('completed', completed);
        }
    }

    /**
     * Save progress to localStorage
     */
    saveProgress() {
        try {
            const progressData = {
                currentSubtopic: this.currentSubtopic,
                completedSubtopics: Array.from(this.completedSubtopics),
                timestamp: Date.now()
            };

            const lessonId = this.lessonData.id || 'unknown';
            localStorage.setItem(`lesson_progress_${lessonId}`, JSON.stringify(progressData));
            
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    /**
     * Load progress from localStorage
     */
    loadProgress() {
        try {
            const lessonId = this.lessonData.id || 'unknown';
            const saved = localStorage.getItem(`lesson_progress_${lessonId}`);
            
            if (saved) {
                const progressData = JSON.parse(saved);
                this.currentSubtopic = progressData.currentSubtopic || 0;
                this.completedSubtopics = new Set(progressData.completedSubtopics || []);
            }
            
        } catch (error) {
            console.error('Failed to load progress:', error);
        }
    }
}

// Global functions for backward compatibility
window.switchSubtopic = function(index) {
    if (window.lessonCore) {
        window.lessonCore.switchToSubtopic(index);
    }
};

window.previousSubtopic = function() {
    if (window.lessonCore) {
        window.lessonCore.previousSubtopic();
    }
};

window.nextSubtopic = function() {
    if (window.lessonCore) {
        window.lessonCore.nextSubtopic();
    }
};

window.completeCurrentSubtopic = function() {
    if (window.lessonCore) {
        window.lessonCore.completeCurrentSubtopic();
    }
};

window.runCode = function(editorId) {
    if (window.lessonCore) {
        window.lessonCore.runCode(editorId);
    }
};

window.resetCode = function(editorId) {
    if (window.lessonCore) {
        window.lessonCore.resetCode(editorId);
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LessonCore };
} else {
    window.LessonCore = LessonCore;
}
