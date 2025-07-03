/**
 * Quiz Module
 * Core quiz functionality for lesson and standalone quizzes
 */

export class QuizModule {
    constructor(options = {}) {
        this.options = {
            autoSave: true,
            showFeedback: true,
            animateTransitions: true,
            ...options
        };
        
        this.currentQuiz = null;
        this.quizData = null;
        this.currentQuestion = 0;
        this.userAnswers = {};
        this.score = 0;
        this.startTime = null;
        this.endTime = null;
        this.state = 'overview'; // overview, question, feedback, results
        this.initialized = false;
        
        console.log('📝 Quiz Module initialized');
    }

    /**
     * Initialize quiz system
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Setup event listeners
            document.addEventListener('startQuiz', (e) => this.loadQuiz(e.detail.quizId));
            document.addEventListener('submitAnswer', (e) => this.submitAnswer(e.detail));
            
            // Check if there's a quiz on the page
            const quizContainer = document.querySelector('[data-quiz-id]');
            if (quizContainer) {
                const quizId = quizContainer.dataset.quizId;
                if (quizId) {
                    await this.loadQuiz(quizId);
                }
            }
            
            this.initialized = true;
            console.log('✅ Quiz Module ready');
        } catch (error) {
            console.error('❌ Failed to initialize Quiz Module:', error);
        }
    }

    /**
     * Load a quiz by ID
     */
    async loadQuiz(quizId) {
        if (!quizId) {
            console.error('No quiz ID provided');
            return;
        }
        
        try {
            console.log(`Loading quiz: ${quizId}`);
            
            // Show loading state
            this.updateQuizContainer({ loading: true });
            
            // Fetch quiz data
            const response = await fetch(`/api/quiz/${quizId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to load quiz: ${response.statusText}`);
            }
            
            const quizData = await response.json();
            
            // Initialize quiz with fetched data
            this.initializeQuiz(quizId, quizData);
            
        } catch (error) {
            console.error('Error loading quiz:', error);
            this.updateQuizContainer({ 
                error: true, 
                message: 'Failed to load quiz. Please try again later.' 
            });
        }
    }

    /**
     * Initialize quiz with data
     */
    initializeQuiz(quizId, quizData) {
        this.currentQuiz = quizId;
        this.quizData = quizData;
        this.currentQuestion = 0;
        this.userAnswers = {};
        this.score = 0;
        this.startTime = new Date();
        this.endTime = null;
        this.state = 'overview';
        
        // Render initial view
        this.renderQuiz();
        
        // Dispatch event
        const quizStartEvent = new CustomEvent('quizInitialized', {
            detail: { quizId, quizData }
        });
        document.dispatchEvent(quizStartEvent);
    }

    /**
     * Render the current quiz state
     */
    renderQuiz() {
        // Find quiz container
        const container = document.querySelector(`[data-quiz-id="${this.currentQuiz}"]`);
        if (!container) {
            console.error('Quiz container not found');
            return;
        }
        
        // Clear previous content
        container.innerHTML = '';
        
        // Render based on current state
        switch(this.state) {
            case 'overview':
                this.renderOverview(container);
                break;
            case 'question':
                this.renderQuestion(container);
                break;
            case 'feedback':
                this.renderFeedback(container);
                break;
            case 'results':
                this.renderResults(container);
                break;
            default:
                console.error('Unknown quiz state:', this.state);
        }
    }

    /**
     * Render quiz overview
     */
    renderOverview(container) {
        if (!this.quizData) return;
        
        const overviewEl = document.createElement('div');
        overviewEl.className = 'quiz-overview';
        
        overviewEl.innerHTML = `
            <h2 class="quiz-title">${this.quizData.title}</h2>
            <p class="quiz-description">${this.quizData.description || ''}</p>
            <div class="quiz-meta">
                <span class="quiz-questions">${this.quizData.questions.length} Questions</span>
                ${this.quizData.timeLimit ? `<span class="quiz-time">Time: ${this.quizData.timeLimit} min</span>` : ''}
                ${this.quizData.points ? `<span class="quiz-points">Points: ${this.quizData.points}</span>` : ''}
            </div>
            <button class="btn btn-primary start-quiz-btn">Start Quiz</button>
        `;
        
        // Add event listener to start button
        const startBtn = overviewEl.querySelector('.start-quiz-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startQuiz());
        }
        
        container.appendChild(overviewEl);
    }

    /**
     * Start the quiz
     */
    startQuiz() {
        this.state = 'question';
        this.currentQuestion = 0;
        this.startTime = new Date();
        this.renderQuiz();
        
        // Dispatch event
        const quizStartEvent = new CustomEvent('quizStarted', {
            detail: { quizId: this.currentQuiz }
        });
        document.dispatchEvent(quizStartEvent);
    }

    /**
     * Render current question
     */
    renderQuestion(container) {
        if (!this.quizData || !this.quizData.questions) return;
        
        const question = this.quizData.questions[this.currentQuestion];
        if (!question) return;
        
        const questionEl = document.createElement('div');
        questionEl.className = 'quiz-question';
        questionEl.dataset.questionIndex = this.currentQuestion;
        questionEl.dataset.questionType = question.type;
        
        // Progress indicator
        const progressHtml = `
            <div class="quiz-progress">
                <div class="progress-text">Question ${this.currentQuestion + 1} of ${this.quizData.questions.length}</div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${(this.currentQuestion + 1) / this.quizData.questions.length * 100}%"></div>
                </div>
            </div>
        `;
        
        // Question text
        const questionHtml = `
            <div class="question-content">
                <h3 class="question-text">${question.text}</h3>
                ${question.code ? `<pre class="question-code"><code>${question.code}</code></pre>` : ''}
                ${question.image ? `<img src="${question.image}" alt="Question image" class="question-image">` : ''}
            </div>
        `;
        
        // Answer options based on question type
        let answersHtml = '';
        switch(question.type) {
            case 'multiple_choice':
                answersHtml = this.renderMultipleChoice(question);
                break;
            case 'true_false':
                answersHtml = this.renderTrueFalse(question);
                break;
            case 'fill_blank':
                answersHtml = this.renderFillBlank(question);
                break;
            default:
                answersHtml = '<div class="error">Unsupported question type</div>';
        }
        
        // Navigation buttons
        const navHtml = `
            <div class="quiz-navigation">
                ${this.currentQuestion > 0 ? 
                    `<button class="btn btn-secondary prev-question-btn">Previous</button>` : 
                    `<div></div>`}
                <button class="btn btn-primary submit-answer-btn">Submit Answer</button>
            </div>
        `;
        
        // Combine all sections
        questionEl.innerHTML = `
            ${progressHtml}
            ${questionHtml}
            <div class="answer-options">${answersHtml}</div>
            ${navHtml}
        `;
        
        // Add event listeners
        const prevBtn = questionEl.querySelector('.prev-question-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.goToPreviousQuestion());
        }
        
        const submitBtn = questionEl.querySelector('.submit-answer-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitCurrentAnswer());
        }
        
        container.appendChild(questionEl);
    }

    /**
     * Render code block for a question
     */
    renderCodeBlock(question) {
        if (!question.code) return '';
        // Basic syntax highlighting for python
        const highlightedCode = question.code
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/(".*?")/g, '<span class="string">$1</span>')
            .replace(/(def|class|return|if|else|for|while|import|from)/g, '<span class="keyword">$1</span>');
        return `<pre class="question-code"><code>${highlightedCode}</code></pre>`;
    }

    /**
     * Render multiple choice question
     */
    renderMultipleChoice(question) {
        if (!question.options) return '<div class="error">No options provided</div>';
        
        const optionsHtml = question.options.map((option, index) => {
            const optionId = `option-${this.currentQuestion}-${index}`;
            const checked = this.userAnswers[this.currentQuestion] === index ? 'checked' : '';
            
            return `
                <div class="option">
                    <input type="radio" name="question-${this.currentQuestion}" id="${optionId}" value="${index}" ${checked}>
                    <label for="${optionId}">${option}</label>
                </div>
            `;
        }).join('');
        
        return `<div class="options-list">${optionsHtml}</div>`;
    }

    /**
     * Render true/false question
     */
    renderTrueFalse(question) {
        const trueId = `option-${this.currentQuestion}-true`;
        const falseId = `option-${this.currentQuestion}-false`;
        
        const trueChecked = this.userAnswers[this.currentQuestion] === true ? 'checked' : '';
        const falseChecked = this.userAnswers[this.currentQuestion] === false ? 'checked' : '';
        
        return `
            <div class="options-list true-false">
                <div class="option">
                    <input type="radio" name="question-${this.currentQuestion}" id="${trueId}" value="true" ${trueChecked}>
                    <label for="${trueId}">True</label>
                </div>
                <div class="option">
                    <input type="radio" name="question-${this.currentQuestion}" id="${falseId}" value="false" ${falseChecked}>
                    <label for="${falseId}">False</label>
                </div>
            </div>
        `;
    }

    /**
     * Render fill-in-the-blank question
     */
    renderFillBlank(question) {
        const value = this.userAnswers[this.currentQuestion] || '';
        
        return `
            <div class="fill-blank">
                <input type="text" class="fill-blank-input" value="${value}" placeholder="Your answer...">
            </div>
        `;
    }

    /**
     * Go to previous question
     */
    goToPreviousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderQuiz();
        }
    }

    /**
     * Submit current answer
     */
    submitCurrentAnswer() {
        const question = this.quizData.questions[this.currentQuestion];
        if (!question) return;
        
        let answer;
        switch(question.type) {
            case 'multiple-choice':
                const selected = document.querySelector(`input[name="question-${this.currentQuestion}"]:checked`);
                answer = selected ? parseInt(selected.value) : null;
                break;
            case 'true-false':
                const trueSelected = document.querySelector(`input[name="question-${this.currentQuestion}"]:checked`);
                answer = trueSelected ? trueSelected.value === 'true' : null;
                break;
            case 'fill-blank':
                const input = document.querySelector('.fill-blank-input');
                answer = input ? input.value.trim() : null;
                break;
        }
        
        if (answer === null || answer === '') {
            // Show error for empty answer
            alert('Please select or enter an answer');
            return;
        }
        
        // Save the answer
        this.userAnswers[this.currentQuestion] = answer;
        
        // Check if we should show feedback
        if (this.options.showFeedback) {
            this.state = 'feedback';
            this.renderQuiz();
        } else {
            // Go to next question or results
            this.goToNextQuestion();
        }
    }

    /**
     * Render feedback for the current question
     */
    renderFeedback(container) {
        if (!this.quizData || !this.quizData.questions) return;
        
        const question = this.quizData.questions[this.currentQuestion];
        if (!question) return;
        
        const userAnswer = this.userAnswers[this.currentQuestion];
        const isCorrect = this.checkAnswer(question, userAnswer);
        
        const feedbackEl = document.createElement('div');
        feedbackEl.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        
        // Basic feedback content
        let feedbackContent = `
            <div class="feedback-header">
                <div class="feedback-icon">${isCorrect ? '✓' : '✗'}</div>
                <h3 class="feedback-title">${isCorrect ? 'Correct!' : 'Incorrect'}</h3>
            </div>
            <div class="feedback-content">
                <p>${question.feedback || (isCorrect ? 'Great job!' : 'Try again next time.')}</p>
        `;
        
        // Add explanation if available
        if (question.explanation) {
            feedbackContent += `<div class="explanation"><h4>Explanation:</h4><p>${question.explanation}</p></div>`;
        }
        
        // Show correct answer for incorrect responses
        if (!isCorrect) {
            feedbackContent += `<div class="correct-answer"><h4>Correct Answer:</h4>`;
            
            switch(question.type) {
                case 'multiple-choice':
                    feedbackContent += `<p>${question.options[question.correctAnswer]}</p>`;
                    break;
                case 'true-false':
                    feedbackContent += `<p>${question.correctAnswer ? 'True' : 'False'}</p>`;
                    break;
                case 'fill-blank':
                    feedbackContent += `<p>${question.correctAnswer}</p>`;
                    break;
            }
            
            feedbackContent += `</div>`;
        }
        
        // Close feedback content div
        feedbackContent += `</div>`;
        
        // Navigation buttons
        feedbackContent += `
            <div class="quiz-navigation">
                <button class="btn ${isCorrect ? 'btn-success' : 'btn-danger'} continue-btn">
                    ${this.currentQuestion < this.quizData.questions.length - 1 ? 'Next Question' : 'See Results'}
                </button>
            </div>
        `;
        
        feedbackEl.innerHTML = feedbackContent;
        
        // Add event listener to continue button
        const continueBtn = feedbackEl.querySelector('.continue-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.goToNextQuestion());
        }
        
        container.appendChild(feedbackEl);
    }

    /**
     * Go to next question or results
     */
    goToNextQuestion() {
        if (this.currentQuestion < this.quizData.questions.length - 1) {
            this.currentQuestion++;
            this.state = 'question';
            this.renderQuiz();
        } else {
            // No more questions, go to results
            this.finishQuiz();
        }
    }

    /**
     * Check if answer is correct
     */
    checkAnswer(question, userAnswer) {
        switch(question.type) {
            case 'multiple-choice':
                return userAnswer === question.correctAnswer;
            case 'true-false':
                return userAnswer === question.correctAnswer;
            case 'fill-blank':
                // Case-insensitive check for fill in the blank
                const normalizedUserAnswer = userAnswer.toLowerCase().trim();
                
                // Check against multiple possible answers if provided
                if (Array.isArray(question.correctAnswer)) {
                    return question.correctAnswer.some(answer => 
                        normalizedUserAnswer === answer.toLowerCase().trim()
                    );
                }
                
                // Otherwise check against single answer
                return normalizedUserAnswer === question.correctAnswer.toLowerCase().trim();
            default:
                return false;
        }
    }

    /**
     * Finish the quiz and calculate results
     */
    finishQuiz() {
        this.endTime = new Date();
        this.calculateScore();
        this.state = 'results';
        this.renderQuiz();
        
        // Save results if auto-save enabled
        if (this.options.autoSave) {
            this.saveQuizResults();
        }
        
        // Dispatch event
        const quizFinishEvent = new CustomEvent('quizFinished', {
            detail: { 
                quizId: this.currentQuiz,
                score: this.score,
                totalQuestions: this.quizData.questions.length,
                timeTaken: (this.endTime - this.startTime) / 1000
            }
        });
        document.dispatchEvent(quizFinishEvent);
    }

    /**
     * Calculate the quiz score
     */
    calculateScore() {
        let correctCount = 0;
        
        this.quizData.questions.forEach((question, index) => {
            if (this.checkAnswer(question, this.userAnswers[index])) {
                correctCount++;
            }
        });
        
        this.score = correctCount / this.quizData.questions.length;
    }

    /**
     * Render quiz results
     */
    renderResults(container) {
        if (!this.quizData) return;
        
        const correctCount = Math.round(this.score * this.quizData.questions.length);
        const totalQuestions = this.quizData.questions.length;
        const percentScore = Math.round(this.score * 100);
        const timeTaken = Math.round((this.endTime - this.startTime) / 1000);
        
        const resultsEl = document.createElement('div');
        resultsEl.className = 'quiz-results';
        
        let resultGrade = '';
        if (percentScore >= 90) resultGrade = 'excellent';
        else if (percentScore >= 75) resultGrade = 'good';
        else if (percentScore >= 60) resultGrade = 'average';
        else resultGrade = 'poor';
        
        resultsEl.innerHTML = `
            <div class="results-header ${resultGrade}">
                <h2 class="results-title">Quiz Results</h2>
                <div class="score-circle">
                    <span class="score-value">${percentScore}%</span>
                </div>
            </div>
            
            <div class="results-content">
                <div class="results-summary">
                    <div class="result-item">
                        <div class="result-label">Correct Answers</div>
                        <div class="result-value">${correctCount}/${totalQuestions}</div>
                    </div>
                    <div class="result-item">
                        <div class="result-label">Time Taken</div>
                        <div class="result-value">${this.formatTime(timeTaken)}</div>
                    </div>
                </div>
                
                <div class="results-feedback">
                    <h3>Your Performance</h3>
                    <p>${this.getResultsFeedback(percentScore)}</p>
                </div>
                
                <div class="results-actions">
                    <button class="btn btn-primary retry-quiz-btn">Retry Quiz</button>
                    <button class="btn btn-secondary review-answers-btn">Review Answers</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const retryBtn = resultsEl.querySelector('.retry-quiz-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryQuiz());
        }
        
        const reviewBtn = resultsEl.querySelector('.review-answers-btn');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => this.reviewAnswers());
        }
        
        container.appendChild(resultsEl);
    }

    /**
     * Format time in seconds to mm:ss
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    /**
     * Get feedback based on score percentage
     */
    getResultsFeedback(percentScore) {
        if (percentScore >= 90) {
            return "Excellent work! You've demonstrated a thorough understanding of the material.";
        } else if (percentScore >= 75) {
            return "Good job! You have a solid grasp of most concepts.";
        } else if (percentScore >= 60) {
            return "Not bad! You understand the basics, but might want to review some topics.";
        } else {
            return "You might need more practice with this material. Consider reviewing the lessons again.";
        }
    }

    /**
     * Retry the quiz
     */
    retryQuiz() {
        this.currentQuestion = 0;
        this.userAnswers = {};
        this.score = 0;
        this.startTime = new Date();
        this.endTime = null;
        this.state = 'question';
        this.renderQuiz();
    }

    /**
     * Review answers
     */
    reviewAnswers() {
        console.log('Review answers functionality not implemented yet');
        alert('Answer review will be available in a future update.');
    }

    /**
     * Save quiz results to server
     */
    async saveQuizResults() {
        if (!this.currentQuiz) return;
        
        try {
            const quizResult = {
                quizId: this.currentQuiz,
                score: this.score,
                timeTaken: (this.endTime - this.startTime) / 1000,
                answers: this.userAnswers,
                completed: true,
                completedAt: new Date().toISOString()
            };
            
            const response = await fetch('/api/quiz/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(quizResult)
            });
            
            if (!response.ok) {
                throw new Error(`Failed to save quiz results: ${response.statusText}`);
            }
            
            console.log('Quiz results saved successfully');
            
        } catch (error) {
            console.error('Error saving quiz results:', error);
        }
    }

    /**
     * Update quiz container with loading/error states
     */
    updateQuizContainer(state) {
        const container = document.querySelector(`[data-quiz-id="${this.currentQuiz}"]`);
        if (!container) return;
        
        if (state.loading) {
            container.innerHTML = '<div class="quiz-loading">Loading quiz...</div>';
        } else if (state.error) {
            container.innerHTML = `<div class="quiz-error">${state.message || 'Error loading quiz'}</div>`;
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        document.removeEventListener('startQuiz', this.loadQuiz);
        document.removeEventListener('submitAnswer', this.submitAnswer);
        this.initialized = false;
    }
}

// Create global instance
window.quizModule = new QuizModule();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { QuizModule };
}
