/**
 * Lesson Manager - ES6 Module
 * Handles lesson-specific functionality and interactions
 */

export class LessonManager {
    constructor() {
        this.lessonData = window.lessonData || null;
        this.progress = window.lessonProgress || {};
        this.init();
    }
    
    init() {
        console.log('✅ LessonManager initialized');
        
        if (this.lessonData) {
            this.renderLesson();
            this.setupProgressTracking();
        }
        
        this.setupCodeBlocks();
        this.setupQuizzes();
        this.setupInteractiveElements();
    }
    
    renderLesson() {
        console.log('📚 Rendering lesson:', this.lessonData.title);
        
        // Update lesson title
        const titleElement = document.querySelector('.lesson-title');
        if (titleElement && this.lessonData.title) {
            titleElement.textContent = this.lessonData.title;
        }
        
        // Update progress bar
        this.updateProgressDisplay();
    }
    
    setupProgressTracking() {
        // Track scroll progress
        let ticking = false;
        
        const updateScrollProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            const progressBar = document.querySelector('.scroll-progress');
            if (progressBar) {
                progressBar.style.width = `${Math.min(scrollPercent, 100)}%`;
            }
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        });
    }
    
    setupCodeBlocks() {
        // Setup code execution buttons
        document.querySelectorAll('.code-block').forEach((block, index) => {
            const runButton = block.querySelector('.run-code-btn');
            const codeContent = block.querySelector('code');
            
            if (runButton && codeContent) {
                runButton.addEventListener('click', () => {
                    this.executeCode(codeContent.textContent, block, index);
                });
            }
        });
        
        // Setup copy buttons
        document.querySelectorAll('.copy-code-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const codeBlock = e.target.closest('.code-block');
                const code = codeBlock.querySelector('code');
                if (code) {
                    this.copyToClipboard(code.textContent);
                }
            });
        });
    }
    
    setupQuizzes() {
        document.querySelectorAll('.quiz-question').forEach((question, index) => {
            const choices = question.querySelectorAll('.quiz-choice');
            const submitButton = question.querySelector('.quiz-submit');
            
            choices.forEach(choice => {
                choice.addEventListener('click', () => {
                    // Remove previous selections
                    choices.forEach(c => c.classList.remove('selected'));
                    // Mark as selected
                    choice.classList.add('selected');
                    // Enable submit button
                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                });
            });
            
            if (submitButton) {
                submitButton.addEventListener('click', () => {
                    this.submitQuizAnswer(question, index);
                });
            }
        });
    }
    
    setupInteractiveElements() {
        // Setup collapsible sections
        document.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isOpen = content.style.display !== 'none';
                
                content.style.display = isOpen ? 'none' : 'block';
                header.classList.toggle('open', !isOpen);
            });
        });
        
        // Setup tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId, e.target.closest('.tab-container'));
            });
        });
    }
    
    async executeCode(code, blockElement, blockIndex) {
        const outputElement = blockElement.querySelector('.code-output');
        const runButton = blockElement.querySelector('.run-code-btn');
        
        if (runButton) {
            runButton.disabled = true;
            runButton.textContent = 'Running...';
        }
        
        if (outputElement) {
            outputElement.innerHTML = '<div class="loading">Executing code...</div>';
        }
        
        try {
            const response = await fetch('/run_python', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: code,
                    inputs: ''
                })
            });
            
            const result = await response.json();
            
            if (outputElement) {
                if (result.error) {
                    outputElement.innerHTML = `<div class="error">Error: ${result.error}</div>`;
                } else {
                    outputElement.innerHTML = `<div class="output">${result.output || 'Code executed successfully!'}</div>`;
                }
            }
            
            // Mark block as completed
            this.completeBlock(`code-block-${blockIndex}`);
            
        } catch (error) {
            console.error('Code execution error:', error);
            if (outputElement) {
                outputElement.innerHTML = `<div class="error">Failed to execute code: ${error.message}</div>`;
            }
        } finally {
            if (runButton) {
                runButton.disabled = false;
                runButton.textContent = 'Run Code';
            }
        }
    }
    
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            
            // Show feedback
            if (window.app && window.app.showNotification) {
                window.app.showNotification('Code copied to clipboard!', 'success');
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (window.app && window.app.showNotification) {
                window.app.showNotification('Code copied to clipboard!', 'success');
            }
        }
    }
    
    submitQuizAnswer(questionElement, questionIndex) {
        const selectedChoice = questionElement.querySelector('.quiz-choice.selected');
        const feedbackElement = questionElement.querySelector('.quiz-feedback');
        
        if (!selectedChoice) return;
        
        const isCorrect = selectedChoice.dataset.correct === 'true';
        const allChoices = questionElement.querySelectorAll('.quiz-choice');
        
        // Disable all choices
        allChoices.forEach(choice => {
            choice.style.pointerEvents = 'none';
            if (choice.dataset.correct === 'true') {
                choice.classList.add('correct');
            } else if (choice.classList.contains('selected')) {
                choice.classList.add('incorrect');
            }
        });
        
        // Show feedback
        if (feedbackElement) {
            feedbackElement.style.display = 'block';
            feedbackElement.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
            feedbackElement.textContent = isCorrect ? 'Correct! Well done.' : 'Incorrect. Try reviewing the material.';
        }
        
        // Mark as completed
        this.completeBlock(`quiz-${questionIndex}`);
        
        // Disable submit button
        const submitButton = questionElement.querySelector('.quiz-submit');
        if (submitButton) {
            submitButton.disabled = true;
        }
    }
    
    switchTab(tabId, container) {
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabContents = container.querySelectorAll('.tab-content');
        
        // Update buttons
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabId);
        });
        
        // Update content
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });
    }
    
    completeBlock(blockId) {
        if (!this.progress.completed_blocks) {
            this.progress.completed_blocks = [];
        }
        
        if (!this.progress.completed_blocks.includes(blockId)) {
            this.progress.completed_blocks.push(blockId);
            this.updateProgressDisplay();
            this.saveProgress();
        }
    }
    
    updateProgressDisplay() {
        const totalBlocks = this.getTotalBlocks();
        const completedBlocks = this.progress.completed_blocks ? this.progress.completed_blocks.length : 0;
        const percentage = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${completedBlocks}/${totalBlocks} completed (${percentage}%)`;
        }
        
        console.log(`Progress: ${completedBlocks}/${totalBlocks} (${percentage}%)`);
    }
    
    getTotalBlocks() {
        const codeBlocks = document.querySelectorAll('.code-block').length;
        const quizzes = document.querySelectorAll('.quiz-question').length;
        return codeBlocks + quizzes;
    }
    
    async saveProgress() {
        try {
            const response = await fetch('/api/lesson/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lesson_id: this.lessonData?.id,
                    progress: this.progress
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save progress');
            }
            
            console.log('Progress saved successfully');
            
        } catch (error) {
            console.warn('Failed to save progress:', error);
        }
    }
}
