class QuizSystem {
    constructor(quizId, quizData) {
        this.quizId = quizId;
        this.quizData = quizData;
        this.currentQuestion = 0;
        this.userAnswers = {};
        this.score = 0;
        this.startTime = null;
        this.endTime = null;
        this.state = 'overview'; // overview, question, feedback, results
        this.container = document.getElementById(`quiz-${quizId}`);
    }

    init() {
        this.render();
    }

    render() {
        switch(this.state) {
            case 'overview':
                this.renderOverview();
                break;
            case 'question':
                this.renderQuestion();
                break;
            case 'results':
                this.renderResults();
                break;
        }
    }

    renderOverview() {
        const html = `
            <div class="quiz-start-screen">
                <h2>${this.quizData.title}</h2>
                <p>${this.quizData.description || 'Test your knowledge!'}</p>
                
                <div class="quiz-info">
                    <div class="quiz-info-item">
                        <span class="quiz-info-value">${this.quizData.questions.length}</span>
                        <span class="quiz-info-label">Questions</span>
                    </div>
                    <div class="quiz-info-item">
                        <span class="quiz-info-value">${this.calculateTotalPoints()}</span>
                        <span class="quiz-info-label">Total Points</span>
                    </div>
                    <div class="quiz-info-item">
                        <span class="quiz-info-value">${this.quizData.passing_score}%</span>
                        <span class="quiz-info-label">Passing Score</span>
                    </div>
                    <div class="quiz-info-item">
                        <span class="quiz-info-value">${this.quizData.xp_reward}</span>
                        <span class="quiz-info-label">XP Reward</span>
                    </div>
                </div>
                
                <button class="btn btn-primary btn-lg" onclick="quiz_${this.quizId}.start()">
                    Start Quiz
                </button>
            </div>
        `;
        this.container.innerHTML = html;
    }

    renderQuestion() {
        const question = this.quizData.questions[this.currentQuestion];
        const progress = ((this.currentQuestion + 1) / this.quizData.questions.length) * 100;
        
        let html = `
            <div class="quiz-progress">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
                <span>Question ${this.currentQuestion + 1} of ${this.quizData.questions.length}</span>
            </div>
            
            <div class="question-card">
                <div class="question-number">Question ${this.currentQuestion + 1}</div>
                <h3 class="question-text">${question.question}</h3>
                ${this.renderQuestionContent(question)}
                <div id="quiz-feedback-${this.quizId}" class="quiz-feedback"></div>
            </div>
            
            <div class="quiz-navigation">
                ${this.currentQuestion > 0 ? 
                    `<button class="btn btn-secondary" onclick="quiz_${this.quizId}.previousQuestion()">Previous</button>` : 
                    '<div></div>'
                }
                <button id="quiz-next-btn-${this.quizId}" class="btn btn-primary" onclick="quiz_${this.quizId}.submitAnswer()" style="display: none;">
                    ${this.currentQuestion === this.quizData.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
        `;
        
        this.container.innerHTML = html;
        
        // Show next button if answer already exists
        if (this.userAnswers[this.currentQuestion] !== undefined) {
            document.getElementById(`quiz-next-btn-${this.quizId}`).style.display = 'block';
        }
    }

    renderQuestionContent(question) {
        switch(question.type) {
            case 'multiple_choice':
                return this.renderMultipleChoice(question);
            case 'true_false':
                return this.renderTrueFalse(question);
            case 'fill_blank':
                return this.renderFillBlank(question);
            case 'drag_drop':
                return this.renderDragDrop(question);
            default:
                return '<p>Unknown question type</p>';
        }
    }

    renderMultipleChoice(question) {
        return `
            <div class="answer-options">
                ${question.options.map((option, index) => `
                    <div class="answer-option" data-index="${index}" onclick="quiz_${this.quizId}.selectOption(${index})">
                        <span class="option-letter">${String.fromCharCode(65 + index)}</span>
                        <span class="option-text">${option}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTrueFalse(question) {
        return `
            <div class="answer-options true-false">
                <div class="answer-option" data-value="true" onclick="quiz_${this.quizId}.selectTrueFalse(true)">
                    <i class="fas fa-check"></i> True
                </div>
                <div class="answer-option" data-value="false" onclick="quiz_${this.quizId}.selectTrueFalse(false)">
                    <i class="fas fa-times"></i> False
                </div>
            </div>
        `;
    }

    renderFillBlank(question) {
        return `
            <div class="fill-blank-container">
                <input type="text" 
                       id="fill-blank-${this.quizId}" 
                       class="form-control fill-blank-input" 
                       placeholder="Type your answer here"
                       onkeyup="quiz_${this.quizId}.checkFillBlank(event)">
                <button class="btn btn-primary mt-3" onclick="quiz_${this.quizId}.submitFillBlank()">
                    Submit Answer
                </button>
            </div>
        `;
    }

    renderDragDrop(question) {
        // Simplified drag and drop for code reordering
        return `
            <div class="drag-drop-container">
                <div class="drag-items">
                    ${question.items.map((item, index) => `
                        <div class="drag-item" draggable="true" data-index="${index}">
                            ${item}
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-primary mt-3" onclick="quiz_${this.quizId}.submitDragDrop()">
                    Submit Order
                </button>
            </div>
        `;
    }

    renderResults() {
        const percentage = Math.round((this.score / this.calculateTotalPoints()) * 100);
        const passed = percentage >= this.quizData.passing_score;
        const duration = this.endTime ? Math.floor((this.endTime - this.startTime) / 1000) : 0;
        
        const html = `
            <div class="quiz-results">
                <h2>${passed ? '🎉 Congratulations!' : '📚 Keep Learning!'}</h2>
                <p>${passed ? 'You passed the quiz!' : 'You didn\'t pass this time, but keep trying!'}</p>
                
                <div class="score-display">
                    <div class="score-circle ${passed ? 'passed' : 'failed'}" style="--score-percent: ${percentage}%">
                        <span>${percentage}%</span>
                    </div>
                </div>
                
                <div class="results-stats">
                    <div class="stat-item">
                        <span class="stat-label">Score</span>
                        <span class="stat-value">${this.score} / ${this.calculateTotalPoints()}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Time</span>
                        <span class="stat-value">${this.formatTime(duration)}</span>
                    </div>
                    ${passed ? `
                        <div class="stat-item">
                            <span class="stat-label">XP Earned</span>
                            <span class="stat-value">+${this.quizData.xp_reward}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">PyCoins</span>
                            <span class="stat-value">+${this.quizData.coin_reward}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="results-breakdown">
                    <h3>Review Your Answers</h3>
                    ${this.renderAnswerReview()}
                </div>
                
                <div class="quiz-actions">
                    ${!passed ? `
                        <button class="btn btn-primary" onclick="quiz_${this.quizId}.retake()">
                            Retake Quiz (${this.quizData.retake_cost} PyCoins)
                        </button>
                    ` : ''}
                    <button class="btn btn-secondary" onclick="quiz_${this.quizId}.close()">
                        Continue Lesson
                    </button>
                </div>
            </div>
        `;
        
        this.container.innerHTML = html;
        
        // Submit results to backend
        if (passed) {
            this.submitResults();
        }
    }

    renderAnswerReview() {
        return this.quizData.questions.map((question, index) => {
            const userAnswer = this.userAnswers[index];
            const isCorrect = this.checkAnswer(question, userAnswer);
            
            return `
                <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                    <p><strong>Q${index + 1}:</strong> ${question.question}</p>
                    <p>Your answer: ${this.formatAnswer(question, userAnswer)}</p>
                    ${!isCorrect ? `<p>Correct answer: ${this.formatAnswer(question, this.getCorrectAnswer(question))}</p>` : ''}
                </div>
            `;
        }).join('');
    }

    // Action methods
    start() {
        this.state = 'question';
        this.currentQuestion = 0;
        this.userAnswers = {};
        this.score = 0;
        this.startTime = Date.now();
        this.render();
    }

    selectOption(index) {
        // Remove previous selection
        document.querySelectorAll('.answer-option').forEach(opt => opt.classList.remove('selected'));
        
        // Add selection
        event.target.closest('.answer-option').classList.add('selected');
        
        // Store answer
        this.userAnswers[this.currentQuestion] = index;
        
        // Show feedback and next button
        this.showFeedback();
    }

    selectTrueFalse(value) {
        document.querySelectorAll('.answer-option').forEach(opt => opt.classList.remove('selected'));
        event.target.closest('.answer-option').classList.add('selected');
        
        this.userAnswers[this.currentQuestion] = value.toString();
        this.showFeedback();
    }

    submitFillBlank() {
        const input = document.getElementById(`fill-blank-${this.quizId}`);
        this.userAnswers[this.currentQuestion] = input.value.trim();
        this.showFeedback();
    }

    checkFillBlank(event) {
        if (event.key === 'Enter') {
            this.submitFillBlank();
        }
    }

    showFeedback() {
        const question = this.quizData.questions[this.currentQuestion];
        const userAnswer = this.userAnswers[this.currentQuestion];
        const isCorrect = this.checkAnswer(question, userAnswer);
        
        const feedbackEl = document.getElementById(`quiz-feedback-${this.quizId}`);
        feedbackEl.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'} show`;
        feedbackEl.innerHTML = isCorrect ? 
            '<i class="fas fa-check-circle"></i> Correct!' : 
            '<i class="fas fa-times-circle"></i> Incorrect. Try reviewing the lesson material.';
        
        // Update score
        if (isCorrect) {
            this.score += question.points || 1;
        }
        
        // Show next button
        document.getElementById(`quiz-next-btn-${this.quizId}`).style.display = 'block';
        
        // Disable further input
        this.disableInput();
    }

    disableInput() {
        document.querySelectorAll('.answer-option').forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
        const input = document.getElementById(`fill-blank-${this.quizId}`);
        if (input) input.disabled = true;
    }

    submitAnswer() {
        if (this.currentQuestion < this.quizData.questions.length - 1) {
            this.currentQuestion++;
            this.render();
        } else {
            this.endTime = Date.now();
            this.state = 'results';
            this.render();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.render();
        }
    }

    checkAnswer(question, userAnswer) {
        switch(question.type) {
            case 'multiple_choice':
                return userAnswer === question.correct_index;
            case 'true_false':
                return userAnswer === question.correct_answer;
            case 'fill_blank':
                return userAnswer.toLowerCase() === question.correct_answer.toLowerCase();
            default:
                return false;
        }
    }

    getCorrectAnswer(question) {
        switch(question.type) {
            case 'multiple_choice':
                return question.correct_index;
            case 'true_false':
                return question.correct_answer;
            case 'fill_blank':
                return question.correct_answer;
            default:
                return 'N/A';
        }
    }

    formatAnswer(question, answer) {
        if (answer === undefined || answer === null) return 'Not answered';
        
        switch(question.type) {
            case 'multiple_choice':
                return question.options[answer] || 'Invalid selection';
            case 'true_false':
                return answer;
            case 'fill_blank':
                return answer || 'No answer provided';
            default:
                return answer;
        }
    }

    calculateTotalPoints() {
        return this.quizData.questions.reduce((total, q) => total + (q.points || 1), 0);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    async retake() {
        // Check PyCoins and handle retake
        try {
            const response = await fetch('/api/spend-coins', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    amount: this.quizData.retake_cost,
                    item: `quiz_retake_${this.quizId}`
                })
            });
            
            const result = await response.json();
            if (result.success) {
                this.start();
            } else {
                showNotification('Insufficient PyCoins for retake!', 'error');
            }
        } catch (error) {
            console.error('Retake error:', error);
        }
    }

    async submitResults() {
        try {
            const response = await fetch(`/api/quiz/${this.quizId}/submit`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    answers: this.userAnswers,
                    score: this.score,
                    duration: this.endTime - this.startTime
                })
            });
            
            const result = await response.json();
            if (result.success) {
                updateUserStats(result.xp_earned, result.coins_earned);
                showNotification(`Quiz completed! +${result.xp_earned} XP, +${result.coins_earned} PyCoins`, 'success');
            }
        } catch (error) {
            console.error('Submit error:', error);
        }
    }

    close() {
        this.container.style.display = 'none';
        // Optionally scroll to next lesson content
        const nextContent = this.container.nextElementSibling;
        if (nextContent) {
            nextContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Initialize quiz when found in lesson
function initializeQuizzes() {
    document.querySelectorAll('[data-quiz-id]').forEach(element => {
        const quizId = element.dataset.quizId;
        
        // Fetch quiz data and initialize
        fetch(`/api/quiz/${quizId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window[`quiz_${quizId}`] = new QuizSystem(quizId, data.quiz);
                    window[`quiz_${quizId}`].init();
                }
            })
            .catch(error => console.error('Failed to load quiz:', error));
    });
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', initializeQuizzes);
