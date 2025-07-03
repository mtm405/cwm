/**
 * Multiple Choice Question Renderer
 */

// Ensure BaseComponent is available
if (typeof BaseComponent === 'undefined' && typeof window.BaseComponent !== 'undefined') {
    var BaseComponent = window.BaseComponent;
}

// Prevent redeclaration of MultipleChoiceRenderer
if (typeof window !== 'undefined' && window.MultipleChoiceRenderer) {
    // Already defined, do nothing
} else {
    class MultipleChoiceRenderer extends (typeof BaseComponent !== 'undefined' ? BaseComponent : class {}) {
        constructor(options = {}) {
            super(options);
            this.config = {
                showLetters: true,
                allowClear: false,
                highlightSelected: true,
                keyboardNavigation: true,
                ...options
            };
            
            this.container = null;
            this.answer = null;
            this.changeCallback = null;
            this.isRendered = false;
        }

        /**
         * Render multiple choice question
         * @param {Object} question - Question data
         * @param {HTMLElement} container - Container element
         * @param {*} existingAnswer - Previously selected answer
         */
        async render(question, container, existingAnswer = null) {
            try {
                this.container = container;
                this.answer = existingAnswer;
                
                // Validate question data
                if (!this.validateQuestion(question)) {
                    throw new Error('Invalid multiple choice question data');
                }
                
                // Create question HTML
                const questionHtml = this.createQuestionHtml(question);
                container.innerHTML = questionHtml;
                
                // Setup event listeners
                this.setupEventListeners();
                
                // Set existing answer if provided
                if (existingAnswer !== null && existingAnswer !== undefined) {
                    this.setAnswer(existingAnswer);
                }
                
                // Setup keyboard navigation
                if (this.config.keyboardNavigation) {
                    this.setupKeyboardNavigation();
                }
                
                this.isRendered = true;
                
            } catch (error) {
                console.error('Error rendering multiple choice question:', error);
                this.renderError(container, error.message);
            }
        }

        /**
         * Validate question data
         * @param {Object} question - Question data
         * @returns {boolean} Whether question is valid
         */
        validateQuestion(question) {
            if (!question) return false;
            if (!question.question || typeof question.question !== 'string') return false;
            if (!Array.isArray(question.options) || question.options.length < 2) return false;
            if (question.correctAnswer === undefined || question.correctAnswer === null) return false;
            if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) return false;
            
            return true;
        }

        /**
         * Create question HTML
         * @param {Object} question - Question data
         * @returns {string} HTML string
         */
        createQuestionHtml(question) {
            const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            return `
                <div class="multiple-choice-question">
                    <div class="question-text">
                        ${this.formatQuestionText(question.question)}
                    </div>
                    
                    <div class="question-options" role="radiogroup" aria-labelledby="question-text">
                        ${question.options.map((option, index) => this.createOptionHtml(option, index, questionId)).join('')}
                    </div>
                    
                    ${this.config.allowClear ? `
                        <div class="question-actions">
                            <button type="button" class="btn btn-sm btn-outline clear-answer">
                                Clear Selection
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        /**
         * Create option HTML
         * @param {string} option - Option text
         * @param {number} index - Option index
         * @param {string} questionId - Question identifier
         * @returns {string} HTML string
         */
        createOptionHtml(option, index, questionId) {
            const optionId = `${questionId}_option_${index}`;
            const letter = this.config.showLetters ? String.fromCharCode(65 + index) : '';
            
            return `
                <div class="question-option" data-index="${index}">
                    <input 
                        type="radio" 
                        id="${optionId}" 
                        name="${questionId}" 
                        value="${index}"
                        class="option-input"
                        aria-describedby="option-text-${index}"
                    />
                    <label for="${optionId}" class="option-label">
                        ${this.config.showLetters ? `
                            <span class="option-letter">${letter}.</span>
                        ` : ''}
                        <span class="option-text" id="option-text-${index}">
                            ${this.formatOptionText(option)}
                        </span>
                    </label>
                </div>
            `;
        }

        /**
         * Format question text with support for HTML and markdown-like syntax
         * @param {string} text - Question text
         * @returns {string} Formatted HTML
         */
        formatQuestionText(text) {
            // Basic HTML sanitization and formatting
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        }

        /**
         * Format option text
         * @param {string} text - Option text
         * @returns {string} Formatted HTML
         */
        formatOptionText(text) {
            return this.formatQuestionText(text);
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            if (!this.container) return;

            // Option selection
            const radioInputs = this.container.querySelectorAll('.option-input');
            radioInputs.forEach(input => {
                input.addEventListener('change', (e) => {
                    this.handleOptionChange(parseInt(e.target.value));
                });
                
                // Add focus/blur effects for accessibility
                input.addEventListener('focus', (e) => {
                    e.target.closest('.question-option').classList.add('focused');
                });
                
                input.addEventListener('blur', (e) => {
                    e.target.closest('.question-option').classList.remove('focused');
                });
            });

            // Option click (for label clicks)
            const optionLabels = this.container.querySelectorAll('.option-label');
            optionLabels.forEach((label, index) => {
                label.addEventListener('click', () => {
                    if (this.config.highlightSelected) {
                        this.highlightOption(index);
                    }
                });
            });

            // Clear answer button
            const clearButton = this.container.querySelector('.clear-answer');
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    this.clearAnswer();
                });
            }

            // Hover effects
            const options = this.container.querySelectorAll('.question-option');
            options.forEach(option => {
                option.addEventListener('mouseenter', () => {
                    option.classList.add('hovered');
                });
                
                option.addEventListener('mouseleave', () => {
                    option.classList.remove('hovered');
                });
            });
        }

        /**
         * Setup keyboard navigation
         */
        setupKeyboardNavigation() {
            if (!this.container) return;

            this.container.addEventListener('keydown', (e) => {
                const options = this.container.querySelectorAll('.question-option');
                const currentFocus = document.activeElement;
                let currentIndex = -1;

                // Find currently focused option
                options.forEach((option, index) => {
                    if (option.contains(currentFocus)) {
                        currentIndex = index;
                    }
                });

                switch (e.key) {
                    case 'ArrowDown':
                    case 'ArrowRight':
                        e.preventDefault();
                        const nextIndex = (currentIndex + 1) % options.length;
                        this.focusOption(nextIndex);
                        break;

                    case 'ArrowUp':
                    case 'ArrowLeft':
                        e.preventDefault();
                        const prevIndex = currentIndex <= 0 ? options.length - 1 : currentIndex - 1;
                        this.focusOption(prevIndex);
                        break;

                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        if (currentIndex >= 0) {
                            this.selectOption(currentIndex);
                        }
                        break;

                    case 'Escape':
                        if (this.config.allowClear) {
                            e.preventDefault();
                            this.clearAnswer();
                        }
                        break;

                    // Number keys for quick selection
                    case '1': case '2': case '3': case '4': case '5':
                    case '6': case '7': case '8': case '9':
                        const numIndex = parseInt(e.key) - 1;
                        if (numIndex < options.length) {
                            e.preventDefault();
                            this.selectOption(numIndex);
                        }
                        break;

                    // Letter keys for quick selection
                    default:
                        if (this.config.showLetters && e.key.match(/^[a-zA-Z]$/)) {
                            const letterIndex = e.key.toUpperCase().charCodeAt(0) - 65;
                            if (letterIndex < options.length) {
                                e.preventDefault();
                                this.selectOption(letterIndex);
                            }
                        }
                        break;
                }
            });
        }

        /**
         * Handle option change
         * @param {number} index - Selected option index
         */
        handleOptionChange(index) {
            this.answer = index;
            
            if (this.config.highlightSelected) {
                this.highlightOption(index);
            }
            
            // Trigger change callback
            if (this.changeCallback) {
                this.changeCallback(index);
            }
            
            // Emit event
            this.container.dispatchEvent(new CustomEvent('answerChange', {
                detail: { answer: index, renderer: this }
            }));
        }

        /**
         * Focus specific option
         * @param {number} index - Option index to focus
         */
        focusOption(index) {
            const options = this.container.querySelectorAll('.option-input');
            if (options[index]) {
                options[index].focus();
            }
        }

        /**
         * Select specific option
         * @param {number} index - Option index to select
         */
        selectOption(index) {
            const options = this.container.querySelectorAll('.option-input');
            if (options[index]) {
                options[index].checked = true;
                this.handleOptionChange(index);
            }
        }

        /**
         * Highlight selected option
         * @param {number} index - Option index to highlight
         */
        highlightOption(index) {
            // Remove previous highlights
            const options = this.container.querySelectorAll('.question-option');
            options.forEach(option => option.classList.remove('selected'));
            
            // Add highlight to selected option
            if (options[index]) {
                options[index].classList.add('selected');
            }
        }

        /**
         * Clear answer selection
         */
        clearAnswer() {
            const radioInputs = this.container.querySelectorAll('.option-input');
            radioInputs.forEach(input => {
                input.checked = false;
            });
            
            // Remove highlights
            const options = this.container.querySelectorAll('.question-option');
            options.forEach(option => option.classList.remove('selected'));
            
            this.answer = null;
            
            // Trigger change callback
            if (this.changeCallback) {
                this.changeCallback(null);
            }
            
            // Emit event
            this.container.dispatchEvent(new CustomEvent('answerChange', {
                detail: { answer: null, renderer: this }
            }));
        }

        /**
         * Set answer programmatically
         * @param {number} index - Option index to select
         */
        setAnswer(index) {
            if (index !== null && index !== undefined && index >= 0) {
                const options = this.container.querySelectorAll('.option-input');
                if (options[index]) {
                    options[index].checked = true;
                    this.answer = index;
                    
                    if (this.config.highlightSelected) {
                        this.highlightOption(index);
                    }
                }
            }
        }

        /**
         * Get current answer
         * @returns {number|null} Selected option index or null
         */
        getAnswer() {
            return this.answer;
        }

        /**
         * Check if answer is valid
         * @returns {boolean} Whether current answer is valid
         */
        isValidAnswer() {
            return this.answer !== null && this.answer !== undefined;
        }

        /**
         * Set change callback
         * @param {Function} callback - Callback function
         */
        onAnswerChange(callback) {
            this.changeCallback = callback;
        }

        /**
         * Show correct answer (for review mode)
         * @param {number} correctIndex - Index of correct answer
         */
        showCorrectAnswer(correctIndex) {
            const options = this.container.querySelectorAll('.question-option');
            
            options.forEach((option, index) => {
                option.classList.remove('correct', 'incorrect', 'user-selected');
                
                if (index === correctIndex) {
                    option.classList.add('correct');
                }
                
                if (index === this.answer) {
                    option.classList.add('user-selected');
                    if (index !== correctIndex) {
                        option.classList.add('incorrect');
                    }
                }
            });
        }

        /**
         * Enable/disable renderer
         * @param {boolean} enabled - Whether renderer should be enabled
         */
        setEnabled(enabled) {
            const inputs = this.container.querySelectorAll('.option-input, .clear-answer');
            inputs.forEach(input => {
                input.disabled = !enabled;
            });
            
            const container = this.container.querySelector('.multiple-choice-question');
            if (container) {
                container.classList.toggle('disabled', !enabled);
            }
        }

        /**
         * Render error state
         * @param {HTMLElement} container - Container element
         * @param {string} message - Error message
         */
        renderError(container, message) {
            container.innerHTML = `
                <div class="question-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">
                        <h4>Question Loading Error</h4>
                        <p>${message}</p>
                    </div>
                </div>
            `;
        }

        /**
         * Get renderer statistics (for analytics)
         * @returns {Object} Renderer statistics
         */
        getStatistics() {
            return {
                type: 'multiple_choice',
                rendered: this.isRendered,
                hasAnswer: this.isValidAnswer(),
                answer: this.answer,
                optionCount: this.container?.querySelectorAll('.question-option').length || 0
            };
        }

        /**
         * Cleanup renderer
         */
        destroy() {
            this.container = null;
            this.answer = null;
            this.changeCallback = null;
            this.isRendered = false;
        }
    }

    // Export properly
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = MultipleChoiceRenderer;
    } else {
        window.MultipleChoiceRenderer = MultipleChoiceRenderer;
        
        // Auto-register with quiz engine if available
        if (window.QuizEngine && window.eventBus) {
            // Register when quiz engine is initialized
            document.addEventListener('DOMContentLoaded', () => {
                if (window.eventBus) {
                    window.eventBus.on('quiz:init', (data) => {
                        if (data.engine) {
                            data.engine.registerRenderer('multiple_choice', new MultipleChoiceRenderer());
                        }
                    });
                }
            });
        }
    }
}
