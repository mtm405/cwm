/**
 * Text with Questions Block Handler
 * Manages interactivity for text blocks with embedded questions
 */

export class TextWithQuestionsHandler {
    constructor() {
        this.initEventListeners();
    }

    /**
     * Initialize event listeners for embedded questions
     */
    initEventListeners() {
        // Check answer buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('check-answer-btn')) {
                this.handleCheckAnswer(e.target);
            }
        });

        // Save answer buttons (for open-ended questions)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('save-answer-btn')) {
                this.handleSaveAnswer(e.target);
            }
        });

        // Complete button
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('complete-btn')) {
                this.handleBlockCompletion(e.target);
            }
        });
    }

    /**
     * Handle check answer button click
     * @param {HTMLElement} button - The check answer button
     */
    handleCheckAnswer(button) {
        const questionId = button.dataset.questionId;
        const correctAnswer = button.dataset.correctAnswer;
        const questionEl = button.closest('.embedded-question');
        const feedbackEl = questionEl.querySelector('.question-feedback');
        
        // Get the user's answer based on question type
        let userAnswer;
        const questionType = questionEl.dataset.questionType;
        
        switch (questionType) {
            case 'multiple_choice':
                const selectedOption = questionEl.querySelector('input[name="' + questionId + '"]:checked');
                userAnswer = selectedOption ? parseInt(selectedOption.value) : null;
                break;
                
            case 'true_false':
                const selectedTF = questionEl.querySelector('input[name="' + questionId + '"]:checked');
                userAnswer = selectedTF ? selectedTF.value === 'true' : null;
                break;
                
            case 'fill_blank':
                const inputEl = questionEl.querySelector(`#${questionId}-input`);
                userAnswer = inputEl ? inputEl.value.trim() : null;
                break;
                
            default:
                console.error('Unsupported question type for checking answers:', questionType);
                return;
        }
        
        // Check if an answer was provided
        if (userAnswer === null) {
            this.showFeedback(feedbackEl, 'Please select or enter an answer first.', 'warning');
            return;
        }
        
        // Check the answer
        const isCorrect = this.checkAnswer(userAnswer, correctAnswer, questionType);
        
        // Show feedback
        if (isCorrect) {
            this.showFeedback(feedbackEl, 'Correct! Well done.', 'correct');
            
            // Mark options with correct/incorrect classes for visual feedback
            if (questionType === 'multiple_choice' || questionType === 'true_false') {
                this.highlightCorrectOption(questionEl, correctAnswer, questionType);
            }
            
            // Disable the check button
            button.disabled = true;
            
            // Mark the question as answered correctly
            questionEl.dataset.answered = 'true';
            questionEl.dataset.correct = 'true';
            
            // Update progress
            this.updateBlockProgress(questionEl.closest('.text_with_questions-block'));
        } else {
            this.showFeedback(feedbackEl, 'That\'s not quite right. Try again!', 'incorrect');
            
            // For multiple choice, highlight the wrong option
            if (questionType === 'multiple_choice' || questionType === 'true_false') {
                this.highlightIncorrectOption(questionEl, userAnswer, questionType);
            }
        }
    }

    /**
     * Handle save answer button click (for open-ended questions)
     * @param {HTMLElement} button - The save answer button
     */
    handleSaveAnswer(button) {
        const questionId = button.dataset.questionId;
        const questionEl = button.closest('.embedded-question');
        const inputEl = questionEl.querySelector(`#${questionId}-input`);
        
        // Check if an answer was provided
        if (!inputEl || !inputEl.value.trim()) {
            // Show warning
            const feedbackEl = questionEl.querySelector('.question-feedback') || this.createFeedbackElement(questionEl);
            this.showFeedback(feedbackEl, 'Please enter an answer first.', 'warning');
            return;
        }
        
        // Mark the question as answered
        questionEl.dataset.answered = 'true';
        
        // Change button text
        button.textContent = 'Saved';
        button.classList.remove('btn-primary');
        button.classList.add('btn-success');
        
        // Disable temporarily
        button.disabled = true;
        setTimeout(() => {
            button.disabled = false;
            button.textContent = 'Update Answer';
        }, 1500);
        
        // Update progress
        this.updateBlockProgress(questionEl.closest('.text_with_questions-block'));
    }

    /**
     * Create feedback element if it doesn't exist
     * @param {HTMLElement} questionEl - The question element
     * @returns {HTMLElement} The feedback element
     */
    createFeedbackElement(questionEl) {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = 'question-feedback';
        feedbackEl.style.display = 'none';
        
        // Insert before actions
        const actionsEl = questionEl.querySelector('.question-actions');
        questionEl.querySelector('.question-content').insertBefore(feedbackEl, actionsEl);
        
        return feedbackEl;
    }

    /**
     * Check if answer is correct
     * @param {*} userAnswer - The user's answer
     * @param {*} correctAnswer - The correct answer
     * @param {string} questionType - The type of question
     * @returns {boolean} Whether the answer is correct
     */
    checkAnswer(userAnswer, correctAnswer, questionType) {
        switch (questionType) {
            case 'multiple_choice':
                return userAnswer === parseInt(correctAnswer);
                
            case 'true_false':
                // Convert correctAnswer to boolean if it's a string
                const correctBool = typeof correctAnswer === 'string' 
                    ? correctAnswer.toLowerCase() === 'true' 
                    : Boolean(correctAnswer);
                return userAnswer === correctBool;
                
            case 'fill_blank':
                // Case insensitive comparison for fill in the blank
                return userAnswer.toLowerCase() === correctAnswer.toLowerCase();
                
            default:
                console.error('Unsupported question type for checking answers:', questionType);
                return false;
        }
    }

    /**
     * Show feedback message
     * @param {HTMLElement} feedbackEl - The feedback element
     * @param {string} message - The feedback message
     * @param {string} type - The type of feedback (correct, incorrect, warning)
     */
    showFeedback(feedbackEl, message, type) {
        if (!feedbackEl) return;
        
        // Clear previous classes
        feedbackEl.classList.remove('correct', 'incorrect', 'warning');
        
        // Add new class
        feedbackEl.classList.add(type);
        
        // Set message
        feedbackEl.textContent = message;
        
        // Show the feedback
        feedbackEl.style.display = 'block';
    }

    /**
     * Highlight the correct option
     * @param {HTMLElement} questionEl - The question element
     * @param {number|boolean} correctAnswer - The correct answer
     * @param {string} questionType - The type of question
     */
    highlightCorrectOption(questionEl, correctAnswer, questionType) {
        let selector;
        
        if (questionType === 'multiple_choice') {
            selector = `input[value="${correctAnswer}"]`;
        } else if (questionType === 'true_false') {
            const value = correctAnswer === true || correctAnswer === 'true' ? 'true' : 'false';
            selector = `input[value="${value}"]`;
        } else {
            return;
        }
        
        const correctInput = questionEl.querySelector(selector);
        if (correctInput) {
            const optionEl = correctInput.closest('.question-option');
            optionEl.classList.add('correct');
        }
    }

    /**
     * Highlight the incorrect option that was selected
     * @param {HTMLElement} questionEl - The question element
     * @param {number|boolean} userAnswer - The user's answer
     * @param {string} questionType - The type of question
     */
    highlightIncorrectOption(questionEl, userAnswer, questionType) {
        let selector;
        
        if (questionType === 'multiple_choice') {
            selector = `input[value="${userAnswer}"]`;
        } else if (questionType === 'true_false') {
            const value = userAnswer === true || userAnswer === 'true' ? 'true' : 'false';
            selector = `input[value="${value}"]`;
        } else {
            return;
        }
        
        const incorrectInput = questionEl.querySelector(selector);
        if (incorrectInput) {
            const optionEl = incorrectInput.closest('.question-option');
            optionEl.classList.add('incorrect');
        }
    }

    /**
     * Update block progress
     * @param {HTMLElement} blockEl - The block element
     */
    updateBlockProgress(blockEl) {
        if (!blockEl) return;
        
        // Get all questions
        const questions = blockEl.querySelectorAll('.embedded-question');
        const answeredQuestions = blockEl.querySelectorAll('.embedded-question[data-answered="true"]');
        
        // If all questions have been answered, update the block progress
        if (questions.length > 0 && answeredQuestions.length === questions.length) {
            const progressIndicator = blockEl.querySelector('.block-progress-indicator i');
            if (progressIndicator) {
                progressIndicator.classList.remove('fa-circle');
                progressIndicator.classList.add('fa-check-circle');
            }
        }
    }

    /**
     * Handle block completion
     * @param {HTMLElement} button - The complete button
     */
    handleBlockCompletion(button) {
        const blockId = button.dataset.blockId;
        const blockEl = document.getElementById(`block-${blockId}`);
        
        if (!blockEl) return;
        
        // Mark block as completed
        blockEl.classList.add('completed');
        
        // Update progress indicator
        const progressIndicator = blockEl.querySelector('.block-progress-indicator i');
        if (progressIndicator) {
            progressIndicator.classList.remove('fa-circle');
            progressIndicator.classList.add('fa-check-circle');
        }
        
        // Change button text
        button.innerHTML = '<i class="fas fa-check"></i> Completed';
        button.disabled = true;
        
        // Trigger event for tracking
        const completionEvent = new CustomEvent('blockCompleted', {
            detail: { blockId, blockType: 'text_with_questions' }
        });
        document.dispatchEvent(completionEvent);
    }
}

// Initialize the handler when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.textWithQuestionsHandler = new TextWithQuestionsHandler();
});
