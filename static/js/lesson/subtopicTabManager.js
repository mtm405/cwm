/**
 * Subtopic Tab Navigation System
 * Handles tab switching, progress tracking, and content loading
 * Part of the enhanced lesson system
 */

class SubtopicTabManager {
    constructor() {
        this.currentSubtopicIndex = 0;
        this.subtopics = [];
        this.lessonId = null;
        this.completedSubtopics = [];
        this.init();
    }

    init() {
        console.log('🔄 Initializing Subtopic Tab Manager...');
        
        // Get lesson data from global variables
        if (window.lessonData) {
            this.lessonId = window.lessonData.id;
            this.subtopics = window.lessonData.subtopics || [];
            this.currentSubtopicIndex = window.lessonData.current_subtopic_index || 0;
        }

        // Get progress data
        if (window.lessonProgress) {
            this.completedSubtopics = window.lessonProgress.completed_subtopics || [];
        }

        this.setupEventListeners();
        this.updateTabStates();
        
        console.log('✅ Subtopic Tab Manager initialized');
    }

    setupEventListeners() {
        // Tab click events
        document.querySelectorAll('.subtopic-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const subtopicId = tab.dataset.subtopicId;
                const subtopicIndex = parseInt(tab.dataset.subtopicIndex);
                this.switchToSubtopic(subtopicId, subtopicIndex);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousSubtopic();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextSubtopic();
                        break;
                }
            }
        });
    }

    switchToSubtopic(subtopicId, subtopicIndex) {
        console.log(`🔄 Switching to subtopic: ${subtopicId} (index: ${subtopicIndex})`);
        
        // Update URL without page reload
        const newUrl = `/lesson/${this.lessonId}/${subtopicId}`;
        window.history.pushState({ subtopicId, subtopicIndex }, '', newUrl);
        
        // Update current index
        this.currentSubtopicIndex = subtopicIndex;
        
        // Update tab states
        this.updateTabStates();
        
        // Load subtopic content
        this.loadSubtopicContent(subtopicId, subtopicIndex);
        
        // Track analytics
        this.trackSubtopicView(subtopicId);
    }

    updateTabStates() {
        document.querySelectorAll('.subtopic-tab').forEach((tab, index) => {
            const isActive = index === this.currentSubtopicIndex;
            const subtopicId = tab.dataset.subtopicId;
            const isCompleted = this.completedSubtopics.includes(subtopicId);
            
            // Update active state
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive.toString());
            
            // Update completed state
            const checkIcon = tab.querySelector('.subtopic-check');
            if (checkIcon) {
                checkIcon.classList.toggle('completed', isCompleted);
            }
        });
    }

    loadSubtopicContent(subtopicId, subtopicIndex) {
        console.log(`📖 Loading content for subtopic: ${subtopicId}`);
        
        // Show loading state
        const container = document.getElementById('lesson-content-container');
        if (container) {
            container.innerHTML = `
                <div class="content-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading ${this.subtopics[subtopicIndex]?.title || 'content'}...</p>
                </div>
            `;
        }

        // Get subtopic data
        const subtopic = this.subtopics[subtopicIndex];
        if (!subtopic) {
            console.error(`Subtopic not found at index ${subtopicIndex}`);
            return;
        }

        // Render subtopic content
        setTimeout(() => {
            this.renderSubtopicContent(subtopic, container);
        }, 300); // Small delay for smooth transition
    }

    renderSubtopicContent(subtopic, container) {
        if (!subtopic || !container) return;

        console.log(`🎨 Rendering subtopic: ${subtopic.title}`);
        
        const blocks = subtopic.blocks || [];
        
        const contentHTML = `
            <div class="subtopic-content-wrapper" data-subtopic-id="${subtopic.id}">
                <div class="subtopic-header">
                    <h2 class="subtopic-title">${subtopic.title}</h2>
                    <div class="subtopic-meta">
                        <span class="subtopic-order">Part ${subtopic.order + 1}</span>
                        <span class="subtopic-progress">${this.completedSubtopics.includes(subtopic.id) ? '✅ Completed' : '📖 In Progress'}</span>
                    </div>
                </div>
                
                <div class="subtopic-blocks">
                    ${blocks.map((block, index) => this.renderBlock(block, index)).join('')}
                </div>
                
                <div class="subtopic-navigation">
                    <button class="btn btn-outline" onclick="window.subtopicManager.previousSubtopic()" ${this.currentSubtopicIndex === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    
                    <button class="btn btn-success" onclick="window.subtopicManager.completeSubtopic('${subtopic.id}')">
                        <i class="fas fa-check"></i> Complete & Continue
                    </button>
                    
                    <button class="btn btn-primary" onclick="window.subtopicManager.nextSubtopic()" ${this.currentSubtopicIndex === this.subtopics.length - 1 ? 'disabled' : ''}>
                        Next <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = contentHTML;
        
        // Initialize any interactive elements
        this.initializeBlockInteractions();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderBlock(block, index) {
        const blockTypes = {
            'text': this.renderTextBlock,
            'code_example': this.renderCodeBlock,
            'interactive': this.renderInteractiveBlock,
            'quiz': this.renderQuizBlock
        };

        const renderer = blockTypes[block.type] || this.renderTextBlock;
        return renderer.call(this, block, index);
    }

    renderTextBlock(block, index) {
        return `
            <div class="content-block text-block" data-block-id="${block.id}" data-block-index="${index}">
                <div class="block-content">
                    <h3 class="block-title">${block.title || ''}</h3>
                    <div class="block-text">${this.parseMarkdown(block.content || '')}</div>
                </div>
            </div>
        `;
    }

    renderCodeBlock(block, index) {
        return `
            <div class="content-block code-block" data-block-id="${block.id}" data-block-index="${index}">
                <div class="block-content">
                    <h3 class="block-title">${block.title || 'Code Example'}</h3>
                    <div class="code-container">
                        <pre><code class="language-python">${this.escapeHtml(block.code || '')}</code></pre>
                        <button class="btn btn-sm copy-btn" onclick="window.subtopicManager.copyCode(this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    ${block.explanation ? `<div class="block-explanation">${block.explanation}</div>` : ''}
                </div>
            </div>
        `;
    }

    renderInteractiveBlock(block, index) {
        return `
            <div class="content-block interactive-block" data-block-id="${block.id}" data-block-index="${index}">
                <div class="block-content">
                    <h3 class="block-title">${block.title || 'Interactive Exercise'}</h3>
                    <div class="exercise-instructions">${block.instructions || ''}</div>
                    <div class="code-editor">
                        <textarea class="code-input" placeholder="Write your code here...">${block.starter_code || ''}</textarea>
                        <button class="btn btn-primary run-btn" onclick="window.subtopicManager.runCode(this)">
                            <i class="fas fa-play"></i> Run Code
                        </button>
                    </div>
                    <div class="code-output" style="display: none;">
                        <h4>Output:</h4>
                        <pre class="output-content"></pre>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuizBlock(block, index) {
        return `
            <div class="content-block quiz-block" data-block-id="${block.id}" data-block-index="${index}">
                <div class="block-content">
                    <h3 class="block-title">${block.title || 'Knowledge Check'}</h3>
                    <div class="quiz-container">
                        <div class="quiz-questions">
                            ${block.questions ? block.questions.map((q, i) => this.renderQuizQuestion(q, i)).join('') : ''}
                        </div>
                        <button class="btn btn-primary submit-quiz-btn" onclick="window.subtopicManager.submitQuiz(this)">
                            <i class="fas fa-check"></i> Submit Quiz
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuizQuestion(question, index) {
        const questionTypes = {
            'multiple_choice': this.renderMultipleChoice,
            'true_false': this.renderTrueFalse,
            'fill_blank': this.renderFillBlank
        };

        const renderer = questionTypes[question.type] || this.renderMultipleChoice;
        return renderer.call(this, question, index);
    }

    renderMultipleChoice(question, index) {
        return `
            <div class="quiz-question" data-question-id="${question.id}" data-question-index="${index}">
                <h4 class="question-text">${question.question}</h4>
                <div class="question-options">
                    ${question.options ? question.options.map((option, i) => `
                        <label class="option-label">
                            <input type="radio" name="question-${index}" value="${i}">
                            <span class="option-text">${option}</span>
                        </label>
                    `).join('') : ''}
                </div>
            </div>
        `;
    }

    renderTrueFalse(question, index) {
        return `
            <div class="quiz-question" data-question-id="${question.id}" data-question-index="${index}">
                <h4 class="question-text">${question.question}</h4>
                <div class="question-options">
                    <label class="option-label">
                        <input type="radio" name="question-${index}" value="true">
                        <span class="option-text">True</span>
                    </label>
                    <label class="option-label">
                        <input type="radio" name="question-${index}" value="false">
                        <span class="option-text">False</span>
                    </label>
                </div>
            </div>
        `;
    }

    nextSubtopic() {
        if (this.currentSubtopicIndex < this.subtopics.length - 1) {
            const nextIndex = this.currentSubtopicIndex + 1;
            const nextSubtopic = this.subtopics[nextIndex];
            this.switchToSubtopic(nextSubtopic.id, nextIndex);
        }
    }

    previousSubtopic() {
        if (this.currentSubtopicIndex > 0) {
            const prevIndex = this.currentSubtopicIndex - 1;
            const prevSubtopic = this.subtopics[prevIndex];
            this.switchToSubtopic(prevSubtopic.id, prevIndex);
        }
    }

    async completeSubtopic(subtopicId) {
        console.log(`✅ Completing subtopic: ${subtopicId}`);
        
        try {
            const response = await fetch('/api/lesson/complete-subtopic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lesson_id: this.lessonId,
                    subtopic_id: subtopicId
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Update local state
                if (!this.completedSubtopics.includes(subtopicId)) {
                    this.completedSubtopics.push(subtopicId);
                }
                
                // Update UI
                this.updateTabStates();
                this.updateProgressIndicator();
                
                // Show success message
                this.showSuccessMessage(result.xp_earned);
                
                // Auto-advance to next subtopic
                setTimeout(() => {
                    this.nextSubtopic();
                }, 1500);
            } else {
                console.error('Failed to complete subtopic:', result.message);
            }
        } catch (error) {
            console.error('Error completing subtopic:', error);
        }
    }

    updateProgressIndicator() {
        const progressFill = document.querySelector('.tab-progress-fill');
        if (progressFill) {
            const completedCount = this.completedSubtopics.length;
            const totalCount = this.subtopics.length;
            const percentage = (completedCount / totalCount) * 100;
            
            progressFill.style.width = `${percentage}%`;
        }
    }

    showSuccessMessage(xpEarned) {
        const message = document.createElement('div');
        message.className = 'success-toast';
        message.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>Subtopic completed! +${xpEarned} XP</span>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Utility methods
    parseMarkdown(text) {
        return text
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    copyCode(button) {
        const codeBlock = button.parentElement.querySelector('code');
        if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.textContent);
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        }
    }

    runCode(button) {
        const codeInput = button.parentElement.querySelector('.code-input');
        const outputDiv = button.parentElement.nextElementSibling;
        const outputContent = outputDiv.querySelector('.output-content');
        
        if (codeInput && outputContent) {
            const code = codeInput.value;
            
            // Simple code execution simulation
            try {
                outputContent.textContent = `Running: ${code}\n\n> Code execution simulated\n> In a real environment, this would execute Python code`;
                outputDiv.style.display = 'block';
            } catch (error) {
                outputContent.textContent = `Error: ${error.message}`;
                outputDiv.style.display = 'block';
            }
        }
    }

    initializeBlockInteractions() {
        // Initialize any interactive elements that were just added
        console.log('🎯 Initializing block interactions...');
        
        // Add syntax highlighting if Prism is available
        if (window.Prism) {
            window.Prism.highlightAll();
        }
    }

    trackSubtopicView(subtopicId) {
        // Track analytics
        if (window.gtag) {
            window.gtag('event', 'subtopic_view', {
                lesson_id: this.lessonId,
                subtopic_id: subtopicId
            });
        }
    }
}

// Global functions for template usage
window.switchSubtopic = function(subtopicId, subtopicIndex) {
    if (window.subtopicManager) {
        window.subtopicManager.switchToSubtopic(subtopicId, subtopicIndex);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (window.lessonData && window.lessonData.has_subtopics) {
        window.subtopicManager = new SubtopicTabManager();
        console.log('✅ Subtopic tab system initialized');
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.subtopicId && window.subtopicManager) {
        window.subtopicManager.switchToSubtopic(event.state.subtopicId, event.state.subtopicIndex);
    }
});
