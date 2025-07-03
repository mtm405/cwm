/**
 * Fill in the Blank Question Renderer
 */

// Ensure BaseComponent is available
if (typeof BaseComponent === 'undefined' && typeof window.BaseComponent !== 'undefined') {
    var BaseComponent = window.BaseComponent;
}

// Prevent redeclaration of FillBlankRenderer
if (typeof window !== 'undefined' && window.FillBlankRenderer) {
    // Already defined, do nothing
} else {
    class FillBlankRenderer extends (typeof BaseComponent !== 'undefined' ? BaseComponent : class {}) {
        constructor(options = {}) {
            super(options);
            this.config = {
                allowMultiple: true,
                caseSensitive: false,
                trimWhitespace: true,
                showWordCount: false,
                maxLength: 200,
                placeholder: 'Type your answer here...',
                autoResize: true,
                spellCheck: true,
                showHints: false,
                ...options
            };
            
            this.container = null;
            this.answers = {};
            this.changeCallback = null;
            this.isRendered = false;
            this.validationTimer = null;
        }

        /**
         * Render fill-in-the-blank question
         * @param {Object} question - Question data
         * @param {HTMLElement} container - Container element
         * @param {*} existingAnswer - Previously entered answer(s)
         */
        async render(question, container, existingAnswer = null) {
            try {
                this.container = container;
                this.answers = {};
                
                // Validate question data
                if (!this.validateQuestion(question)) {
                    throw new Error('Invalid fill-in-the-blank question data');
                }
                
                // Parse question and identify blanks
                const questionData = this.parseQuestion(question);
                
                // Create question HTML
                const questionHtml = this.createQuestionHtml(questionData);
                container.innerHTML = questionHtml;
                
                // Setup event listeners
                this.setupEventListeners();
                
                // Set existing answers if provided
                if (existingAnswer !== null && existingAnswer !== undefined) {
                    this.setAnswers(existingAnswer);
                }
                
                // Setup auto-resize if enabled
                if (this.config.autoResize) {
                    this.setupAutoResize();
                }
                
                // Setup validation
                this.setupValidation();
                
                this.isRendered = true;
                
            } catch (error) {
                console.error('Error rendering fill-in-the-blank question:', error);
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
            if (!question.correctAnswer) return false;
            
            // Check if question contains blanks
            const blankPattern = /\[([^\]]*)\]|\{([^}]*)\}|_{2,}/g;
            if (!blankPattern.test(question.question)) return false;
            
            return true;
        }

        /**
         * Parse question and identify blanks
         * @param {Object} question - Question data
         * @returns {Object} Parsed question data
         */
        parseQuestion(question) {
            const text = question.question;
            const blanks = [];
            let blankIndex = 0;
            
            // Pattern to match different blank formats:
            // [answer] - bracket notation
            // {answer} - brace notation  
            // ____ - underscore notation (2 or more underscores)
            const blankPattern = /\[([^\]]*)\]|\{([^}]*)\}|_{2,}/g;
            
            const processedText = text.replace(blankPattern, (match, bracket, brace) => {
                const blankId = `blank_${blankIndex}`;
                let hint = '';
                
                // Extract hint from bracket or brace content
                if (bracket !== undefined) {
                    hint = bracket;
                } else if (brace !== undefined) {
                    hint = brace;
                }
                
                blanks.push({
                    id: blankId,
                    index: blankIndex,
                    hint: hint,
                    placeholder: hint || this.config.placeholder
                });
                
                blankIndex++;
                return `<span class="blank-placeholder" data-blank="${blankId}"></span>`;
            });
            
            // Parse correct answers
            let correctAnswers = question.correctAnswer;
            if (typeof correctAnswers === 'string') {
                // Single answer or comma-separated answers
                correctAnswers = correctAnswers.split(',').map(a => a.trim());
            }
            
            // Ensure we have correct answers for each blank
            if (!Array.isArray(correctAnswers)) {
                correctAnswers = [correctAnswers];
            }
            
            return {
                originalText: text,
                processedText: processedText,
                blanks: blanks,
                correctAnswers: correctAnswers,
                hints: question.hints || []
            };
        }

        /**
         * Create question HTML
         * @param {Object} questionData - Parsed question data
         * @returns {string} HTML string
         */
        createQuestionHtml(questionData) {
            const questionId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Replace blank placeholders with input fields
            let processedHtml = questionData.processedText;
            
            questionData.blanks.forEach(blank => {
                const inputHtml = this.createBlankInputHtml(blank, questionId);
                processedHtml = processedHtml.replace(
                    `<span class="blank-placeholder" data-blank="${blank.id}"></span>`,
                    inputHtml
                );
            });
            
            return `
                <div class="fill-blank-question">
                    <div class="question-text">
                        ${processedHtml}
                    </div>
                    
                    ${this.config.showHints && questionData.hints.length > 0 ? `
                        <div class="question-hints">
                            <h5>Hints:</h5>
                            <ul class="hint-list">
                                ${questionData.hints.map(hint => `<li>${hint}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${this.config.showWordCount ? `
                        <div class="question-stats">
                            <div class="word-count">
                                <span class="current-words">0</span> words
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="question-actions">
                        <button type="button" class="btn btn-sm btn-outline clear-answers">
                            Clear All
                        </button>
                        ${this.config.showHints ? `
                            <button type="button" class="btn btn-sm btn-outline show-hints">
                                Show Hints
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        /**
         * Create input HTML for a blank
         * @param {Object} blank - Blank data
         * @param {string} questionId - Question identifier
         * @returns {string} HTML string
         */
        createBlankInputHtml(blank, questionId) {
            const inputId = `${questionId}_${blank.id}`;
            
            return `
                <span class="blank-input-wrapper">
                    <input 
                        type="text" 
                        id="${inputId}"
                        class="blank-input" 
                        data-blank-id="${blank.id}"
                        data-blank-index="${blank.index}"
                        placeholder="${blank.placeholder}"
                        maxlength="${this.config.maxLength}"
                        spellcheck="${this.config.spellCheck}"
                        autocomplete="off"
                        aria-label="Fill in the blank ${blank.index + 1}"
                    />
                    <span class="blank-feedback" data-blank-id="${blank.id}"></span>
                </span>
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
         * Setup event listeners
         */
        setupEventListeners() {
            if (!this.container) return;

            // Input field listeners
            const inputs = this.container.querySelectorAll('.blank-input');
            inputs.forEach(input => {
                // Input events
                input.addEventListener('input', (e) => {
                    this.handleInputChange(e.target);
                });
                
                input.addEventListener('blur', (e) => {
                    this.handleInputBlur(e.target);
                });
                
                input.addEventListener('focus', (e) => {
                    this.handleInputFocus(e.target);
                });
                
                // Keyboard events
                input.addEventListener('keydown', (e) => {
                    this.handleKeydown(e);
                });
                
                // Paste events
                input.addEventListener('paste', (e) => {
                    this.handlePaste(e);
                });
            });

            // Clear button
            const clearButton = this.container.querySelector('.clear-answers');
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    this.clearAnswers();
                });
            }

            // Show hints button
            const hintsButton = this.container.querySelector('.show-hints');
            if (hintsButton) {
                hintsButton.addEventListener('click', () => {
                    this.toggleHints();
                });
            }
        }

        /**
         * Handle input change
         * @param {HTMLInputElement} input - Input element
         */
        handleInputChange(input) {
            const blankId = input.dataset.blankId;
            const value = this.config.trimWhitespace ? input.value.trim() : input.value;
            
            // Update answer
            this.answers[blankId] = value;
            
            // Update word count if enabled
            if (this.config.showWordCount) {
                this.updateWordCount();
            }
            
            // Validate input
            this.validateInput(input);
            
            // Trigger change callback
            if (this.changeCallback) {
                this.changeCallback(this.getAnswers());
            }
            
            // Emit event
            this.container.dispatchEvent(new CustomEvent('answerChange', {
                detail: { answers: this.getAnswers(), blankId, value, renderer: this }
            }));
        }

        /**
         * Handle input blur
         * @param {HTMLInputElement} input - Input element
         */
        handleInputBlur(input) {
            input.classList.remove('focused');
            this.validateInput(input, true);
        }

        /**
         * Handle input focus
         * @param {HTMLInputElement} input - Input element
         */
        handleInputFocus(input) {
            input.classList.add('focused');
            
            // Clear any error state when user starts typing again
            const feedback = this.container.querySelector(`[data-blank-id="${input.dataset.blankId}"]`);
            if (feedback) {
                feedback.classList.remove('error');
                feedback.textContent = '';
            }
        }

        /**
         * Handle keyboard navigation
         * @param {KeyboardEvent} e - Keyboard event
         */
        handleKeydown(e) {
            const input = e.target;
            const inputs = Array.from(this.container.querySelectorAll('.blank-input'));
            const currentIndex = inputs.indexOf(input);

            switch (e.key) {
                case 'Tab':
                    // Allow default tab behavior
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    // Move to next input or trigger completion
                    if (currentIndex < inputs.length - 1) {
                        inputs[currentIndex + 1].focus();
                    } else {
                        input.blur();
                        this.checkCompletion();
                    }
                    break;
                    
                case 'ArrowDown':
                    e.preventDefault();
                    if (currentIndex < inputs.length - 1) {
                        inputs[currentIndex + 1].focus();
                    }
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    if (currentIndex > 0) {
                        inputs[currentIndex - 1].focus();
                    }
                    break;
                    
                case 'Escape':
                    e.preventDefault();
                    input.blur();
                    break;
            }
        }

        /**
         * Handle paste events
         * @param {ClipboardEvent} e - Paste event
         */
        handlePaste(e) {
            const input = e.target;
            const pastedData = e.clipboardData.getData('text');
            
            // If pasting multiple words/lines, try to fill multiple blanks
            if (this.config.allowMultiple && pastedData.includes(' ') || pastedData.includes('\n')) {
                e.preventDefault();
                this.fillMultipleBlanks(input, pastedData);
            }
        }

        /**
         * Fill multiple blanks from pasted content
         * @param {HTMLInputElement} startInput - Starting input element
         * @param {string} content - Pasted content
         */
        fillMultipleBlanks(startInput, content) {
            const inputs = Array.from(this.container.querySelectorAll('.blank-input'));
            const startIndex = inputs.indexOf(startInput);
            const values = content.split(/[\s\n,]+/).filter(v => v.trim());
            
            values.forEach((value, index) => {
                const targetIndex = startIndex + index;
                if (targetIndex < inputs.length) {
                    const input = inputs[targetIndex];
                    input.value = value.trim();
                    this.handleInputChange(input);
                }
            });
        }

        /**
         * Validate input
         * @param {HTMLInputElement} input - Input element
         * @param {boolean} showFeedback - Whether to show feedback
         */
        validateInput(input, showFeedback = false) {
            if (this.validationTimer) {
                clearTimeout(this.validationTimer);
            }
            
            this.validationTimer = setTimeout(() => {
                const value = input.value.trim();
                const blankIndex = parseInt(input.dataset.blankIndex);
                const feedback = this.container.querySelector(`[data-blank-id="${input.dataset.blankId}"]`);
                
                if (value && showFeedback) {
                    const isValid = this.checkAnswerValidity(value, blankIndex);
                    
                    if (feedback) {
                        feedback.classList.toggle('valid', isValid);
                        feedback.classList.toggle('invalid', !isValid);
                        
                        if (isValid) {
                            feedback.textContent = '✓';
                            feedback.classList.add('correct');
                        } else {
                            feedback.textContent = '✗';
                            feedback.classList.add('incorrect');
                        }
                    }
                    
                    input.classList.toggle('valid', isValid);
                    input.classList.toggle('invalid', !isValid);
                } else if (feedback) {
                    feedback.className = 'blank-feedback';
                    feedback.textContent = '';
                    input.classList.remove('valid', 'invalid');
                }
            }, 500);
        }

        /**
         * Check if answer is valid for a specific blank
         * @param {string} answer - User's answer
         * @param {number} blankIndex - Blank index
         * @returns {boolean} Whether answer is valid
         */
        checkAnswerValidity(answer, blankIndex) {
            const questionData = this.parseQuestion({
                question: this.container.querySelector('.question-text').innerHTML,
                correctAnswer: this.correctAnswers
            });
            
            const correctAnswer = questionData.correctAnswers[blankIndex];
            if (!correctAnswer) return false;
            
            let normalizedAnswer = answer;
            let normalizedCorrect = correctAnswer;
            
            if (!this.config.caseSensitive) {
                normalizedAnswer = normalizedAnswer.toLowerCase();
                normalizedCorrect = normalizedCorrect.toLowerCase();
            }
            
            if (this.config.trimWhitespace) {
                normalizedAnswer = normalizedAnswer.trim();
                normalizedCorrect = normalizedCorrect.trim();
            }
            
            // Check exact match
            if (normalizedAnswer === normalizedCorrect) {
                return true;
            }
            
            // Check if correct answer has multiple acceptable answers
            if (typeof correctAnswer === 'string' && correctAnswer.includes('|')) {
                const acceptableAnswers = correctAnswer.split('|').map(a => 
                    this.config.caseSensitive ? a.trim() : a.trim().toLowerCase()
                );
                return acceptableAnswers.includes(normalizedAnswer);
            }
            
            return false;
        }

        /**
         * Setup auto-resize functionality
         */
        setupAutoResize() {
            const inputs = this.container.querySelectorAll('.blank-input');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    this.autoResizeInput(input);
                });
            });
        }

        /**
         * Auto-resize input based on content
         * @param {HTMLInputElement} input - Input element
         */
        autoResizeInput(input) {
            // Create temporary element to measure text width
            const temp = document.createElement('span');
            temp.style.visibility = 'hidden';
            temp.style.position = 'absolute';
            temp.style.whiteSpace = 'nowrap';
            temp.style.font = window.getComputedStyle(input).font;
            temp.textContent = input.value || input.placeholder;
            
            document.body.appendChild(temp);
            const width = temp.offsetWidth + 20; // Add padding
            document.body.removeChild(temp);
            
            input.style.width = Math.max(width, 100) + 'px';
        }

        /**
         * Setup validation
         */
        setupValidation() {
            // Real-time validation can be enabled here
            if (this.config.realTimeValidation) {
                // Implementation for real-time validation
            }
        }

        /**
         * Update word count display
         */
        updateWordCount() {
            const wordCountElement = this.container.querySelector('.current-words');
            if (!wordCountElement) return;
            
            let totalWords = 0;
            Object.values(this.answers).forEach(answer => {
                if (answer && typeof answer === 'string') {
                    totalWords += answer.trim().split(/\s+/).filter(word => word.length > 0).length;
                }
            });
            
            wordCountElement.textContent = totalWords;
        }

        /**
         * Toggle hints visibility
         */
        toggleHints() {
            const hintsContainer = this.container.querySelector('.question-hints');
            if (hintsContainer) {
                hintsContainer.classList.toggle('visible');
            }
        }

        /**
         * Check if all blanks are completed
         */
        checkCompletion() {
            const inputs = this.container.querySelectorAll('.blank-input');
            const allFilled = Array.from(inputs).every(input => input.value.trim().length > 0);
            
            if (allFilled) {
                this.container.dispatchEvent(new CustomEvent('allBlanksCompleted', {
                    detail: { answers: this.getAnswers(), renderer: this }
                }));
            }
        }

        /**
         * Clear all answers
         */
        clearAnswers() {
            const inputs = this.container.querySelectorAll('.blank-input');
            inputs.forEach(input => {
                input.value = '';
                input.classList.remove('valid', 'invalid', 'focused');
            });
            
            const feedbacks = this.container.querySelectorAll('.blank-feedback');
            feedbacks.forEach(feedback => {
                feedback.className = 'blank-feedback';
                feedback.textContent = '';
            });
            
            this.answers = {};
            
            if (this.config.showWordCount) {
                this.updateWordCount();
            }
            
            // Trigger change callback
            if (this.changeCallback) {
                this.changeCallback(this.getAnswers());
            }
            
            // Emit event
            this.container.dispatchEvent(new CustomEvent('answerChange', {
                detail: { answers: {}, renderer: this }
            }));
        }

        /**
         * Set answers programmatically
         * @param {Object|Array|string} answers - Answers to set
         */
        setAnswers(answers) {
            if (typeof answers === 'string') {
                // Single answer for first blank
                const firstInput = this.container.querySelector('.blank-input');
                if (firstInput) {
                    firstInput.value = answers;
                    this.handleInputChange(firstInput);
                }
            } else if (Array.isArray(answers)) {
                // Array of answers
                const inputs = this.container.querySelectorAll('.blank-input');
                answers.forEach((answer, index) => {
                    if (inputs[index] && answer !== null && answer !== undefined) {
                        inputs[index].value = String(answer);
                        this.handleInputChange(inputs[index]);
                    }
                });
            } else if (typeof answers === 'object') {
                // Object with blank IDs as keys
                Object.entries(answers).forEach(([blankId, answer]) => {
                    const input = this.container.querySelector(`[data-blank-id="${blankId}"]`);
                    if (input && answer !== null && answer !== undefined) {
                        input.value = String(answer);
                        this.handleInputChange(input);
                    }
                });
            }
        }

        /**
         * Get current answers
         * @returns {Object} Current answers
         */
        getAnswers() {
            return { ...this.answers };
        }

        /**
         * Get answers as array
         * @returns {Array} Answers in order of blanks
         */
        getAnswersArray() {
            const inputs = this.container.querySelectorAll('.blank-input');
            return Array.from(inputs).map(input => this.answers[input.dataset.blankId] || '');
        }

        /**
         * Check if answers are valid
         * @returns {boolean} Whether all answers are valid
         */
        isValidAnswer() {
            const inputs = this.container.querySelectorAll('.blank-input');
            return Array.from(inputs).every(input => {
                const value = this.answers[input.dataset.blankId];
                return value && value.trim().length > 0;
            });
        }

        /**
         * Set change callback
         * @param {Function} callback - Callback function
         */
        onAnswerChange(callback) {
            this.changeCallback = callback;
        }

        /**
         * Show correct answers (for review mode)
         * @param {Array} correctAnswers - Correct answers
         */
        showCorrectAnswers(correctAnswers) {
            const inputs = this.container.querySelectorAll('.blank-input');
            
            inputs.forEach((input, index) => {
                const userAnswer = this.answers[input.dataset.blankId] || '';
                const correctAnswer = correctAnswers[index] || '';
                
                input.classList.remove('correct', 'incorrect', 'user-answer');
                input.classList.add('review-mode');
                
                const isCorrect = this.checkAnswerValidity(userAnswer, index);
                
                if (isCorrect) {
                    input.classList.add('correct');
                } else {
                    input.classList.add('incorrect');
                    // Show correct answer as placeholder or below input
                    input.setAttribute('data-correct-answer', correctAnswer);
                }
                
                input.classList.add('user-answer');
                input.disabled = true;
            });
        }

        /**
         * Enable/disable renderer
         * @param {boolean} enabled - Whether renderer should be enabled
         */
        setEnabled(enabled) {
            const inputs = this.container.querySelectorAll('.blank-input, .clear-answers, .show-hints');
            inputs.forEach(input => {
                input.disabled = !enabled;
            });
            
            const container = this.container.querySelector('.fill-blank-question');
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
            const inputs = this.container?.querySelectorAll('.blank-input') || [];
            return {
                type: 'fill_blank',
                rendered: this.isRendered,
                blankCount: inputs.length,
                filledBlanks: Object.keys(this.answers).filter(key => this.answers[key] && this.answers[key].trim()).length,
                hasAnswer: this.isValidAnswer(),
                answers: this.getAnswers()
            };
        }

        /**
         * Cleanup renderer
         */
        destroy() {
            if (this.validationTimer) {
                clearTimeout(this.validationTimer);
            }
            
            this.container = null;
            this.answers = {};
            this.changeCallback = null;
            this.isRendered = false;
        }
    }

    // Export properly
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = FillBlankRenderer;
    } else {
        window.FillBlankRenderer = FillBlankRenderer;
        
        // Auto-register with quiz engine if available
        if (window.QuizEngine && window.eventBus) {
            document.addEventListener('DOMContentLoaded', () => {
                if (window.eventBus) {
                    window.eventBus.on('quiz:init', (data) => {
                        if (data.engine) {
                            data.engine.registerRenderer('fill_blank', new FillBlankRenderer());
                        }
                    });
                }
            });
        }
    }
}
