/**
 * True/False Question Renderer
 */

// Ensure BaseComponent is available
if (typeof BaseComponent === 'undefined' && typeof window.BaseComponent !== 'undefined') {
    var BaseComponent = window.BaseComponent;
}

// Prevent redeclaration of TrueFalseRenderer
if (typeof window !== 'undefined' && window.TrueFalseRenderer) {
    // Already defined, do nothing
} else {
    class TrueFalseRenderer extends (typeof BaseComponent !== 'undefined' ? BaseComponent : class {}) {
        constructor(options = {}) {
            super(options);
            this.config = {
                style: 'radio', // 'radio', 'toggle', 'buttons'
                showLabels: true,
                allowClear: false,
                highlightSelected: true,
                keyboardNavigation: true,
                trueLabel: 'True',
                falseLabel: 'False',
                ...options
            };
            
            this.container = null;
            this.answer = null;
            this.changeCallback = null;
            this.isRendered = false;
        }

        /**
         * Render true/false question
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
                    throw new Error('Invalid true/false question data');
                }
                
                // Create question HTML based on style
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
                console.error('Error rendering true/false question:', error);
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
            if (question.correctAnswer !== true && question.correctAnswer !== false) return false;
            
            return true;
        }

        /**
         * Create question HTML based on style
         * @param {Object} question - Question data
         * @returns {string} HTML string
         */
        createQuestionHtml(question) {
            const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            let optionsHtml = '';
            
            switch (this.config.style) {
                case 'toggle':
                    optionsHtml = this.createToggleHtml(questionId);
                    break;
                case 'buttons':
                    optionsHtml = this.createButtonsHtml(questionId);
                    break;
                case 'radio':
                default:
                    optionsHtml = this.createRadioHtml(questionId);
                    break;
            }
            
            return `
                <div class="true-false-question true-false-${this.config.style}">
                    <div class="question-text">
                        ${this.formatQuestionText(question.question)}
                    </div>
                    
                    <div class="question-options" role="radiogroup" aria-labelledby="question-text">
                        ${optionsHtml}
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
         * Create radio button style HTML
         * @param {string} questionId - Question identifier
         * @returns {string} HTML string
         */
        createRadioHtml(questionId) {
            return `
                <div class="tf-option" data-value="true">
                    <input 
                        type="radio" 
                        id="${questionId}_true" 
                        name="${questionId}" 
                        value="true"
                        class="tf-input"
                        aria-describedby="tf-label-true"
                    />
                    <label for="${questionId}_true" class="tf-label">
                        <span class="tf-indicator"></span>
                        <span class="tf-text" id="tf-label-true">${this.config.trueLabel}</span>
                    </label>
                </div>
                
                <div class="tf-option" data-value="false">
                    <input 
                        type="radio" 
                        id="${questionId}_false" 
                        name="${questionId}" 
                        value="false"
                        class="tf-input"
                        aria-describedby="tf-label-false"
                    />
                    <label for="${questionId}_false" class="tf-label">
                        <span class="tf-indicator"></span>
                        <span class="tf-text" id="tf-label-false">${this.config.falseLabel}</span>
                    </label>
                </div>
            `;
        }

        /**
         * Create toggle switch style HTML
         * @param {string} questionId - Question identifier
         * @returns {string} HTML string
         */
        createToggleHtml(questionId) {
            return `
                <div class="tf-toggle-container">
                    <label class="tf-toggle-label" for="${questionId}_toggle">
                        <span class="tf-toggle-text false-label">${this.config.falseLabel}</span>
                        <div class="tf-toggle-wrapper">
                            <input 
                                type="checkbox" 
                                id="${questionId}_toggle" 
                                class="tf-toggle-input"
                                aria-describedby="tf-toggle-desc"
                            />
                            <span class="tf-toggle-slider"></span>
                        </div>
                        <span class="tf-toggle-text true-label">${this.config.trueLabel}</span>
                    </label>
                    <div id="tf-toggle-desc" class="sr-only">
                        Toggle between ${this.config.falseLabel} and ${this.config.trueLabel}
                    </div>
                </div>
            `;
        }

        /**
         * Create button style HTML
         * @param {string} questionId - Question identifier
         * @returns {string} HTML string
         */
        createButtonsHtml(questionId) {
            return `
                <div class="tf-buttons">
                    <button 
                        type="button" 
                        class="tf-button tf-button-true" 
                        data-value="true"
                        aria-pressed="false"
                    >
                        <span class="tf-button-icon">✓</span>
                        <span class="tf-button-text">${this.config.trueLabel}</span>
                    </button>
                    
                    <button 
                        type="button" 
                        class="tf-button tf-button-false" 
                        data-value="false"
                        aria-pressed="false"
                    >
                        <span class="tf-button-icon">✗</span>
                        <span class="tf-button-text">${this.config.falseLabel}</span>
                    </button>
                </div>
            `;
        }

        /**
         * Format question text
         * @param {string} text - Question text
         * @returns {string} Formatted HTML
         */
        formatQuestionText(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        }

        /**
         * Setup event listeners based on style
         */
        setupEventListeners() {
            if (!this.container) return;

            switch (this.config.style) {
                case 'toggle':
                    this.setupToggleListeners();
                    break;
                case 'buttons':
                    this.setupButtonListeners();
                    break;
                case 'radio':
                default:
                    this.setupRadioListeners();
                    break;
            }

            // Clear answer button
            const clearButton = this.container.querySelector('.clear-answer');
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    this.clearAnswer();
                });
            }
        }

        /**
         * Setup radio button listeners
         */
        setupRadioListeners() {
            const radioInputs = this.container.querySelectorAll('.tf-input');
            
            radioInputs.forEach(input => {
                input.addEventListener('change', (e) => {
                    const value = e.target.value === 'true';
                    this.handleAnswerChange(value);
                });
                
                input.addEventListener('focus', (e) => {
                    e.target.closest('.tf-option').classList.add('focused');
                });
                
                input.addEventListener('blur', (e) => {
                    e.target.closest('.tf-option').classList.remove('focused');
                });
            });

            // Label clicks
            const labels = this.container.querySelectorAll('.tf-label');
            labels.forEach(label => {
                label.addEventListener('click', () => {
                    if (this.config.highlightSelected) {
                        const option = label.closest('.tf-option');
                        this.highlightOption(option.dataset.value === 'true');
                    }
                });
            });
        }

        /**
         * Setup toggle switch listeners
         */
        setupToggleListeners() {
            const toggleInput = this.container.querySelector('.tf-toggle-input');
            
            if (toggleInput) {
                toggleInput.addEventListener('change', (e) => {
                    this.handleAnswerChange(e.target.checked);
                });
                
                toggleInput.addEventListener('focus', () => {
                    this.container.querySelector('.tf-toggle-wrapper').classList.add('focused');
                });
                
                toggleInput.addEventListener('blur', () => {
                    this.container.querySelector('.tf-toggle-wrapper').classList.remove('focused');
                });
            }
        }

        /**
         * Setup button listeners
         */
        setupButtonListeners() {
            const buttons = this.container.querySelectorAll('.tf-button');
            
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const value = e.currentTarget.dataset.value === 'true';
                    this.handleAnswerChange(value);
                });
                
                button.addEventListener('focus', () => {
                    button.classList.add('focused');
                });
                
                button.addEventListener('blur', () => {
                    button.classList.remove('focused');
                });
            });
        }

        /**
         * Setup keyboard navigation
         */
        setupKeyboardNavigation() {
            if (!this.container) return;

            this.container.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        this.selectAnswer(false);
                        break;

                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        this.selectAnswer(true);
                        break;

                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        // Toggle current selection or select true if none
                        if (this.answer === null) {
                            this.selectAnswer(true);
                        } else {
                            this.selectAnswer(!this.answer);
                        }
                        break;

                    case 'Escape':
                        if (this.config.allowClear) {
                            e.preventDefault();
                            this.clearAnswer();
                        }
                        break;

                    case 't':
                    case 'T':
                    case 'y':
                    case 'Y':
                    case '1':
                        e.preventDefault();
                        this.selectAnswer(true);
                        break;

                    case 'f':
                    case 'F':
                    case 'n':
                    case 'N':
                    case '0':
                        e.preventDefault();
                        this.selectAnswer(false);
                        break;
                }
            });
        }

        /**
         * Handle answer change
         * @param {boolean} value - Selected value
         */
        handleAnswerChange(value) {
            this.answer = value;
            
            if (this.config.highlightSelected) {
                this.highlightOption(value);
            }
            
            // Update ARIA states
            this.updateAriaStates(value);
            
            // Trigger change callback
            if (this.changeCallback) {
                this.changeCallback(value);
            }
            
            // Emit event
            this.container.dispatchEvent(new CustomEvent('answerChange', {
                detail: { answer: value, renderer: this }
            }));
        }

        /**
         * Select answer programmatically
         * @param {boolean} value - Value to select
         */
        selectAnswer(value) {
            switch (this.config.style) {
                case 'toggle':
                    const toggleInput = this.container.querySelector('.tf-toggle-input');
                    if (toggleInput) {
                        toggleInput.checked = value;
                        this.handleAnswerChange(value);
                    }
                    break;
                    
                case 'buttons':
                    const buttons = this.container.querySelectorAll('.tf-button');
                    buttons.forEach(button => {
                        const isSelected = button.dataset.value === String(value);
                        button.classList.toggle('selected', isSelected);
                        button.setAttribute('aria-pressed', isSelected.toString());
                    });
                    this.handleAnswerChange(value);
                    break;
                    
                case 'radio':
                default:
                    const radioInput = this.container.querySelector(`[value="${value}"]`);
                    if (radioInput) {
                        radioInput.checked = true;
                        this.handleAnswerChange(value);
                    }
                    break;
            }
        }

        /**
         * Highlight selected option
         * @param {boolean} value - Selected value
         */
        highlightOption(value) {
            switch (this.config.style) {
                case 'toggle':
                    const wrapper = this.container.querySelector('.tf-toggle-wrapper');
                    if (wrapper) {
                        wrapper.classList.toggle('selected', value !== null);
                    }
                    break;
                    
                case 'buttons':
                    const buttons = this.container.querySelectorAll('.tf-button');
                    buttons.forEach(button => {
                        const isSelected = button.dataset.value === String(value);
                        button.classList.toggle('selected', isSelected);
                    });
                    break;
                    
                case 'radio':
                default:
                    const options = this.container.querySelectorAll('.tf-option');
                    options.forEach(option => {
                        const isSelected = option.dataset.value === String(value);
                        option.classList.toggle('selected', isSelected);
                    });
                    break;
            }
        }

        /**
         * Update ARIA states
         * @param {boolean} value - Selected value
         */
        updateAriaStates(value) {
            switch (this.config.style) {
                case 'buttons':
                    const buttons = this.container.querySelectorAll('.tf-button');
                    buttons.forEach(button => {
                        const isPressed = button.dataset.value === String(value);
                        button.setAttribute('aria-pressed', isPressed.toString());
                    });
                    break;
            }
        }

        /**
         * Clear answer selection
         */
        clearAnswer() {
            switch (this.config.style) {
                case 'toggle':
                    const toggleInput = this.container.querySelector('.tf-toggle-input');
                    if (toggleInput) {
                        toggleInput.checked = false;
                    }
                    break;
                    
                case 'buttons':
                    const buttons = this.container.querySelectorAll('.tf-button');
                    buttons.forEach(button => {
                        button.classList.remove('selected');
                        button.setAttribute('aria-pressed', 'false');
                    });
                    break;
                    
                case 'radio':
                default:
                    const radioInputs = this.container.querySelectorAll('.tf-input');
                    radioInputs.forEach(input => {
                        input.checked = false;
                    });
                    break;
            }
            
            // Remove highlights
            const selectedElements = this.container.querySelectorAll('.selected');
            selectedElements.forEach(element => {
                element.classList.remove('selected');
            });
            
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
         * @param {boolean} value - Value to set
         */
        setAnswer(value) {
            if (value !== null && value !== undefined) {
                this.selectAnswer(Boolean(value));
            }
        }

        /**
         * Get current answer
         * @returns {boolean|null} Selected value or null
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
         * @param {boolean} correctValue - Correct answer value
         */
        showCorrectAnswer(correctValue) {
            switch (this.config.style) {
                case 'toggle':
                    const wrapper = this.container.querySelector('.tf-toggle-wrapper');
                    if (wrapper) {
                        wrapper.classList.add('review-mode');
                        wrapper.classList.toggle('correct', this.answer === correctValue);
                        wrapper.classList.toggle('incorrect', this.answer !== correctValue);
                    }
                    break;
                    
                case 'buttons':
                    const buttons = this.container.querySelectorAll('.tf-button');
                    buttons.forEach(button => {
                        const buttonValue = button.dataset.value === 'true';
                        button.classList.remove('correct', 'incorrect', 'user-selected');
                        
                        if (buttonValue === correctValue) {
                            button.classList.add('correct');
                        }
                        
                        if (buttonValue === this.answer) {
                            button.classList.add('user-selected');
                            if (buttonValue !== correctValue) {
                                button.classList.add('incorrect');
                            }
                        }
                    });
                    break;
                    
                case 'radio':
                default:
                    const options = this.container.querySelectorAll('.tf-option');
                    options.forEach(option => {
                        const optionValue = option.dataset.value === 'true';
                        option.classList.remove('correct', 'incorrect', 'user-selected');
                        
                        if (optionValue === correctValue) {
                            option.classList.add('correct');
                        }
                        
                        if (optionValue === this.answer) {
                            option.classList.add('user-selected');
                            if (optionValue !== correctValue) {
                                option.classList.add('incorrect');
                            }
                        }
                    });
                    break;
            }
        }

        /**
         * Enable/disable renderer
         * @param {boolean} enabled - Whether renderer should be enabled
         */
        setEnabled(enabled) {
            const inputs = this.container.querySelectorAll('.tf-input, .tf-toggle-input, .tf-button, .clear-answer');
            inputs.forEach(input => {
                input.disabled = !enabled;
            });
            
            const container = this.container.querySelector('.true-false-question');
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
                type: 'true_false',
                style: this.config.style,
                rendered: this.isRendered,
                hasAnswer: this.isValidAnswer(),
                answer: this.answer
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
        module.exports = TrueFalseRenderer;
    } else {
        window.TrueFalseRenderer = TrueFalseRenderer;
    }
}
