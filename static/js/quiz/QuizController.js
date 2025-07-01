/**
 * Quiz Controller
 * Manages quiz UI and user interactions
 */

// Ensure BaseComponent is available
if (typeof BaseComponent === 'undefined' && typeof window.BaseComponent !== 'undefined') {
    var BaseComponent = window.BaseComponent;
}

// Prevent redeclaration of QuizController
if (typeof window !== 'undefined' && window.QuizController) {
    // Already defined, do nothing
} else {
    class QuizController extends (typeof BaseComponent !== 'undefined' ? BaseComponent : class {}) {
        constructor(containerId, options = {}) {
            super(containerId, 'quiz-controller');
            
            this.engine = null;
            this.renderers = new Map();
            this.currentRenderer = null;
            
            this.config = {
                showProgress: true,
                showTimer: true,
                showHints: true,
                allowNavigation: true,
                animateTransitions: true,
                keyboardShortcuts: true,
                ...options
            };
            
            this.elements = {
                header: null,
                progress: null,
                timer: null,
                questionContainer: null,
                navigation: null,
                footer: null
            };
            
            this.timers = {
                quiz: null,
                question: null,
                autosave: null
            };
            
            this.init();
        }

        /**
         * Initialize quiz controller
         */
        init() {
            this.createStructure();
            this.setupEventListeners();
            this.setupKeyboardShortcuts();
            
            // Register default renderers
            this.registerDefaultRenderers();
        }

        /**
         * Load quiz and initialize engine
         * @param {Object} quizData - Quiz data
         * @param {Object} engineOptions - Engine options
         */
        async loadQuiz(quizData, engineOptions = {}) {
            try {
                this.showLoading('Loading quiz...');
                
                // Initialize quiz engine
                this.engine = new QuizEngine();
                await this.engine.initialize(quizData, engineOptions);
                
                // Set up engine event listeners
                this.setupEngineListeners();
                
                // Update UI with quiz data
                this.updateQuizInfo(quizData);
                
                // Show start screen
                this.showStartScreen();
                
                this.hideLoading();
                
            } catch (error) {
                console.error('Error loading quiz:', error);
                this.showError('Failed to load quiz: ' + error.message);
            }
        }

        /**
         * Start the quiz
         */
        async startQuiz() {
            try {
                if (!this.engine) {
                    throw new Error('Quiz not loaded');
                }
                
                // Start engine
                this.engine.start();
                
                // Show first question
                this.showCurrentQuestion();
                
                // Start timers
                this.startTimers();
                
                // Update UI state
                this.updateNavigationState();
                
            } catch (error) {
                console.error('Error starting quiz:', error);
                this.showError('Failed to start quiz: ' + error.message);
            }
        }

        /**
         * Submit answer for current question
         * @param {*} answer - User's answer
         */
        async submitAnswer(answer) {
            try {
                if (!this.engine || !this.engine.getState()?.isStarted) {
                    throw new Error('Quiz not started');
                }
                
                // Disable form during submission
                this.setFormEnabled(false);
                
                // Submit to engine
                await this.engine.submitAnswer(answer);
                
                // Show feedback if immediate feedback is enabled
                const state = this.engine.getState();
                if (state.immediateHybrid) {
                    await this.showQuestionFeedback();
                }
                
                // Auto-advance or wait for user action
                if (this.config.autoAdvance) {
                    setTimeout(() => this.nextQuestion(), 2000);
                } else {
                    this.setFormEnabled(true);
                    this.updateNavigationState();
                }
                
            } catch (error) {
                console.error('Error submitting answer:', error);
                this.showError('Failed to submit answer: ' + error.message);
                this.setFormEnabled(true);
            }
        }

        /**
         * Skip current question
         */
        skipQuestion() {
            try {
                this.engine.skipQuestion();
                this.nextQuestion();
            } catch (error) {
                console.error('Error skipping question:', error);
                this.showError('Cannot skip this question');
            }
        }

        /**
         * Navigate to next question
         */
        nextQuestion() {
            try {
                this.engine.nextQuestion();
                this.showCurrentQuestion();
                this.updateNavigationState();
            } catch (error) {
                console.error('Error navigating to next question:', error);
            }
        }

        /**
         * Navigate to previous question
         */
        previousQuestion() {
            try {
                this.engine.previousQuestion();
                this.showCurrentQuestion();
                this.updateNavigationState();
            } catch (error) {
                console.error('Error navigating to previous question:', error);
                this.showError('Cannot go back to previous question');
            }
        }

        /**
         * Navigate to specific question
         * @param {number} index - Question index
         */
        goToQuestion(index) {
            try {
                this.engine.goToQuestion(index);
                this.showCurrentQuestion();
                this.updateNavigationState();
            } catch (error) {
                console.error('Error navigating to question:', error);
                this.showError('Cannot navigate to that question');
            }
        }

        /**
         * Pause the quiz
         */
        pauseQuiz() {
            try {
                this.engine.pause();
                this.stopTimers();
                this.showPauseScreen();
            } catch (error) {
                console.error('Error pausing quiz:', error);
            }
        }

        /**
         * Resume the quiz
         */
        resumeQuiz() {
            try {
                this.engine.resume();
                this.startTimers();
                this.showCurrentQuestion();
            } catch (error) {
                console.error('Error resuming quiz:', error);
            }
        }

        /**
         * Complete the quiz
         */
        async completeQuiz() {
            try {
                this.showLoading('Processing results...');
                
                const results = await this.engine.complete();
                this.stopTimers();
                
                this.hideLoading();
                this.showResults(results);
                
            } catch (error) {
                console.error('Error completing quiz:', error);
                this.hideLoading();
                this.showError('Failed to complete quiz: ' + error.message);
            }
        }

        /**
         * Create quiz UI structure
         */
        createStructure() {
            this.container.innerHTML = `
                <div class="quiz-controller">
                    <!-- Header -->
                    <div class="quiz-header">
                        <div class="quiz-info">
                            <h2 class="quiz-title"></h2>
                            <p class="quiz-description"></p>
                        </div>
                        <div class="quiz-meta">
                            <div class="quiz-progress" style="display: ${this.config.showProgress ? 'block' : 'none'}">
                                <div class="progress-bar">
                                    <div class="progress-fill"></div>
                                </div>
                                <span class="progress-text">0 / 0</span>
                            </div>
                            <div class="quiz-timer" style="display: ${this.config.showTimer ? 'block' : 'none'}">
                                <span class="timer-text">--:--</span>
                            </div>
                        </div>
                    </div>

                    <!-- Content Area -->
                    <div class="quiz-content">
                        <!-- Loading Screen -->
                        <div class="quiz-loading hidden">
                            <div class="loading-spinner"></div>
                            <p class="loading-text">Loading...</p>
                        </div>

                        <!-- Start Screen -->
                        <div class="quiz-start hidden">
                            <div class="start-content">
                                <h3>Ready to begin?</h3>
                                <div class="quiz-stats">
                                    <div class="stat">
                                        <span class="stat-value" data-stat="questions">0</span>
                                        <span class="stat-label">Questions</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-value" data-stat="time">--</span>
                                        <span class="stat-label">Time Limit</span>
                                    </div>
                                    <div class="stat">
                                        <span class="stat-value" data-stat="points">0</span>
                                        <span class="stat-label">Points</span>
                                    </div>
                                </div>
                                <button class="btn btn-primary btn-start">Start Quiz</button>
                            </div>
                        </div>

                        <!-- Question Container -->
                        <div class="quiz-questions hidden">
                            <div class="question-header">
                                <span class="question-number">Question 1</span>
                                <div class="question-meta">
                                    <span class="question-points">1 point</span>
                                    <span class="question-timer" style="display: none">30s</span>
                                </div>
                            </div>
                            
                            <div class="question-content">
                                <!-- Question will be rendered here -->
                            </div>

                            <div class="question-feedback hidden">
                                <!-- Feedback content -->
                            </div>
                        </div>

                        <!-- Pause Screen -->
                        <div class="quiz-pause hidden">
                            <div class="pause-content">
                                <h3>Quiz Paused</h3>
                                <p>Take your time. Your progress has been saved.</p>
                                <button class="btn btn-primary btn-resume">Resume Quiz</button>
                            </div>
                        </div>

                        <!-- Results Screen -->
                        <div class="quiz-results hidden">
                            <!-- Results will be rendered here -->
                        </div>

                        <!-- Error Screen -->
                        <div class="quiz-error hidden">
                            <div class="error-content">
                                <h3>Something went wrong</h3>
                                <p class="error-message"></p>
                                <button class="btn btn-secondary btn-retry">Try Again</button>
                            </div>
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="quiz-navigation hidden">
                        <div class="nav-left">
                            <button class="btn btn-secondary btn-previous" disabled>
                                <i class="fas fa-chevron-left"></i> Previous
                            </button>
                            <button class="btn btn-outline btn-skip" style="display: none">
                                Skip Question
                            </button>
                        </div>
                        <div class="nav-center">
                            <button class="btn btn-outline btn-pause">
                                <i class="fas fa-pause"></i> Pause
                            </button>
                        </div>
                        <div class="nav-right">
                            <button class="btn btn-primary btn-submit" disabled>
                                Submit Answer
                            </button>
                            <button class="btn btn-primary btn-next" style="display: none">
                                Next <i class="fas fa-chevron-right"></i>
                            </button>
                            <button class="btn btn-success btn-finish" style="display: none">
                                Finish Quiz
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Cache element references
            this.elements = {
                header: this.container.querySelector('.quiz-header'),
                progress: this.container.querySelector('.quiz-progress'),
                timer: this.container.querySelector('.quiz-timer'),
                content: this.container.querySelector('.quiz-content'),
                questionContainer: this.container.querySelector('.quiz-questions'),
                navigation: this.container.querySelector('.quiz-navigation'),
                
                // Screens
                loading: this.container.querySelector('.quiz-loading'),
                start: this.container.querySelector('.quiz-start'),
                pause: this.container.querySelector('.quiz-pause'),
                results: this.container.querySelector('.quiz-results'),
                error: this.container.querySelector('.quiz-error')
            };
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            // Start button
            this.container.querySelector('.btn-start')?.addEventListener('click', () => {
                this.startQuiz();
            });

            // Navigation buttons
            this.container.querySelector('.btn-previous')?.addEventListener('click', () => {
                this.previousQuestion();
            });

            this.container.querySelector('.btn-next')?.addEventListener('click', () => {
                this.nextQuestion();
            });

            this.container.querySelector('.btn-submit')?.addEventListener('click', () => {
                this.handleSubmitClick();
            });

            this.container.querySelector('.btn-skip')?.addEventListener('click', () => {
                this.skipQuestion();
            });

            this.container.querySelector('.btn-pause')?.addEventListener('click', () => {
                this.pauseQuiz();
            });

            this.container.querySelector('.btn-resume')?.addEventListener('click', () => {
                this.resumeQuiz();
            });

            this.container.querySelector('.btn-finish')?.addEventListener('click', () => {
                this.completeQuiz();
            });

            this.container.querySelector('.btn-retry')?.addEventListener('click', () => {
                this.hideError();
                this.showStartScreen();
            });
        }

        /**
         * Setup keyboard shortcuts
         */
        setupKeyboardShortcuts() {
            if (!this.config.keyboardShortcuts) return;

            document.addEventListener('keydown', (e) => {
                if (!this.engine?.getState()?.isStarted) return;

                switch (e.key) {
                    case 'ArrowLeft':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.previousQuestion();
                        }
                        break;
                    case 'ArrowRight':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.nextQuestion();
                        }
                        break;
                    case 'Enter':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.handleSubmitClick();
                        }
                        break;
                    case ' ':
                        if (e.ctrlKey) {
                            e.preventDefault();
                            this.pauseQuiz();
                        }
                        break;
                    case 'Escape':
                        e.preventDefault();
                        this.pauseQuiz();
                        break;
                }
            });
        }

        /**
         * Setup engine event listeners
         */
        setupEngineListeners() {
            if (!this.engine) return;

            // Listen for state changes
            this.engine.state.addEventListener('question_changed', (data) => {
                this.showCurrentQuestion();
                this.updateProgress();
                this.updateNavigationState();
            });

            this.engine.state.addEventListener('answer_submitted', (data) => {
                this.updateProgress();
                if (data.isCorrect !== undefined) {
                    this.showAnswerFeedback(data.isCorrect);
                }
            });

            this.engine.state.addEventListener('completed', () => {
                this.completeQuiz();
            });

            this.engine.state.addEventListener('timeout', () => {
                this.showTimeoutMessage();
                this.completeQuiz();
            });

            // Listen for quiz events
            eventBus.on('quiz:feedback', (data) => {
                this.showQuestionFeedback(data);
            });
        }

        /**
         * Show current question
         */
        async showCurrentQuestion() {
            if (!this.engine) return;

            const question = this.engine.state.getCurrentQuestion();
            const answer = this.engine.state.getCurrentAnswer();
            
            if (!question) return;

            try {
                // Hide other screens
                this.hideAllScreens();
                this.elements.questionContainer.classList.remove('hidden');
                this.elements.navigation.classList.remove('hidden');

                // Update question header
                const state = this.engine.getState();
                this.updateQuestionHeader(state.currentQuestionIndex + 1, question);

                // Get renderer for question type
                const renderer = this.getRenderer(question.type);
                if (!renderer) {
                    throw new Error(`No renderer found for question type: ${question.type}`);
                }

                // Clear previous content
                const questionContent = this.container.querySelector('.question-content');
                questionContent.innerHTML = '';

                // Render question
                await renderer.render(question, questionContent, answer?.selectedAnswer);

                // Set up answer submission
                this.setupAnswerSubmission(renderer);

                // Update navigation state
                this.updateNavigationState();

                // Start question timer if applicable
                this.startQuestionTimer(question);

            } catch (error) {
                console.error('Error showing question:', error);
                this.showError('Failed to display question');
            }
        }

        /**
         * Update quiz info display
         * @param {Object} quizData - Quiz data
         */
        updateQuizInfo(quizData) {
            this.container.querySelector('.quiz-title').textContent = quizData.title || 'Quiz';
            this.container.querySelector('.quiz-description').textContent = quizData.description || '';

            // Update start screen stats
            this.container.querySelector('[data-stat="questions"]').textContent = quizData.questions?.length || 0;
            this.container.querySelector('[data-stat="time"]').textContent = 
                quizData.timeLimit ? Utils.formatTime(quizData.timeLimit) : 'No limit';
            this.container.querySelector('[data-stat="points"]').textContent = 
                quizData.questions?.reduce((total, q) => total + (q.points || 1), 0) || 0;
        }

        /**
         * Update question header
         * @param {number} questionNumber - Current question number
         * @param {Object} question - Question data
         */
        updateQuestionHeader(questionNumber, question) {
            const header = this.container.querySelector('.question-header');
            header.querySelector('.question-number').textContent = `Question ${questionNumber}`;
            header.querySelector('.question-points').textContent = `${question.points || 1} point${(question.points || 1) !== 1 ? 's' : ''}`;
            
            const timerElement = header.querySelector('.question-timer');
            if (question.timeLimit) {
                timerElement.textContent = Utils.formatTime(question.timeLimit);
                timerElement.style.display = 'inline';
            } else {
                timerElement.style.display = 'none';
            }
        }

        /**
         * Update progress display
         */
        updateProgress() {
            if (!this.config.showProgress || !this.engine) return;

            const progress = this.engine.state.getProgress();
            const progressBar = this.container.querySelector('.progress-fill');
            const progressText = this.container.querySelector('.progress-text');

            progressBar.style.width = `${progress.percentage}%`;
            progressText.textContent = `${progress.current} / ${progress.total}`;
        }

        /**
         * Update navigation button states
         */
        updateNavigationState() {
            if (!this.engine) return;

            const state = this.engine.getState();
            const currentAnswer = this.engine.state.getCurrentAnswer();

            // Previous button
            const prevBtn = this.container.querySelector('.btn-previous');
            prevBtn.disabled = !this.engine.state.canGoBack();

            // Skip button
            const skipBtn = this.container.querySelector('.btn-skip');
            skipBtn.style.display = this.engine.state.canSkip() ? 'inline-block' : 'none';

            // Submit button
            const submitBtn = this.container.querySelector('.btn-submit');
            submitBtn.disabled = !this.hasValidAnswer();

            // Next button
            const nextBtn = this.container.querySelector('.btn-next');
            const hasAnswer = currentAnswer && currentAnswer.selectedAnswer !== null;
            nextBtn.style.display = hasAnswer && this.engine.state.canGoNext() ? 'inline-block' : 'none';

            // Finish button
            const finishBtn = this.container.querySelector('.btn-finish');
            const isLastQuestion = state.currentQuestionIndex === state.totalQuestions - 1;
            finishBtn.style.display = hasAnswer && isLastQuestion ? 'inline-block' : 'none';

            // Hide submit if answer already given
            if (hasAnswer) {
                submitBtn.style.display = 'none';
            }
        }

        /**
         * Setup answer submission for current renderer
         * @param {Object} renderer - Question renderer
         */
        setupAnswerSubmission(renderer) {
            if (renderer.onAnswerChange) {
                renderer.onAnswerChange((answer) => {
                    this.updateNavigationState();
                });
            }
        }

        /**
         * Handle submit button click
         */
        async handleSubmitClick() {
            const renderer = this.currentRenderer;
            if (!renderer) return;

            try {
                const answer = renderer.getAnswer();
                if (answer === null || answer === undefined) {
                    this.showError('Please select an answer before submitting');
                    return;
                }

                await this.submitAnswer(answer);

            } catch (error) {
                console.error('Error handling submit click:', error);
                this.showError('Failed to submit answer');
            }
        }

        /**
         * Check if current question has a valid answer
         * @returns {boolean} Whether answer is valid
         */
        hasValidAnswer() {
            const renderer = this.currentRenderer;
            if (!renderer) return false;

            try {
                const answer = renderer.getAnswer();
                return answer !== null && answer !== undefined;
            } catch {
                return false;
            }
        }

        /**
         * Get renderer for question type
         * @param {string} type - Question type
         * @returns {Object} Renderer instance
         */
        getRenderer(type) {
            const renderer = this.renderers.get(type);
            if (renderer) {
                this.currentRenderer = renderer;
                return renderer;
            }

            // Try to get from engine
            const engineRenderer = this.engine?.getRenderer(type);
            if (engineRenderer) {
                this.renderers.set(type, engineRenderer);
                this.currentRenderer = engineRenderer;
                return engineRenderer;
            }

            return null;
        }

        /**
         * Register question renderer
         * @param {string} type - Question type
         * @param {Object} renderer - Renderer instance
         */
        registerRenderer(type, renderer) {
            this.renderers.set(type, renderer);
            
            // Also register with engine
            if (this.engine) {
                this.engine.registerRenderer(type, renderer);
            }
        }

        /**
         * Register default renderers
         */
        registerDefaultRenderers() {
            // Default renderers will be registered when their modules load
            console.log('Quiz controller ready for renderer registration');
        }

        /**
         * Show screen and hide others
         * @param {string} screenName - Screen to show
         */
        showScreen(screenName) {
            this.hideAllScreens();
            this.elements[screenName]?.classList.remove('hidden');
        }

        /**
         * Hide all screens
         */
        hideAllScreens() {
            ['loading', 'start', 'questionContainer', 'pause', 'results', 'error'].forEach(screen => {
                this.elements[screen]?.classList.add('hidden');
            });
            this.elements.navigation?.classList.add('hidden');
        }

        /**
         * Show loading screen
         * @param {string} message - Loading message
         */
        showLoading(message = 'Loading...') {
            this.showScreen('loading');
            this.container.querySelector('.loading-text').textContent = message;
        }

        /**
         * Hide loading screen
         */
        hideLoading() {
            this.elements.loading.classList.add('hidden');
        }

        /**
         * Show start screen
         */
        showStartScreen() {
            this.showScreen('start');
        }

        /**
         * Show error screen
         * @param {string} message - Error message
         */
        showError(message) {
            this.showScreen('error');
            this.container.querySelector('.error-message').textContent = message;
        }

        /**
         * Hide error screen
         */
        hideError() {
            this.elements.error.classList.add('hidden');
        }

        /**
         * Show pause screen
         */
        showPauseScreen() {
            this.showScreen('pause');
        }

        /**
         * Show quiz results
         * @param {Object} results - Quiz results
         */
        showResults(results) {
            this.showScreen('results');
            this.renderResults(results);
        }

        /**
         * Render quiz results
         * @param {Object} results - Quiz results
         */
        renderResults(results) {
            const resultsContainer = this.elements.results;
            
            resultsContainer.innerHTML = `
                <div class="results-content">
                    <div class="results-header">
                        <h3>Quiz Complete!</h3>
                        <div class="score-display">
                            <div class="score-circle">
                                <span class="score-percentage">${results.percentage}%</span>
                            </div>
                            <p class="score-text">${results.score} / ${results.maxScore} points</p>
                        </div>
                    </div>

                    <div class="results-stats">
                        <div class="stat-grid">
                            <div class="stat-item">
                                <span class="stat-value">${results.correctAnswers}</span>
                                <span class="stat-label">Correct</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${results.incorrectAnswers}</span>
                                <span class="stat-label">Incorrect</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${results.skippedAnswers}</span>
                                <span class="stat-label">Skipped</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-value">${Utils.formatTime(results.totalTime)}</span>
                                <span class="stat-label">Time</span>
                            </div>
                        </div>
                    </div>

                    ${this.renderAchievements(results.achievements)}
                    ${this.renderRecommendations(results.recommendations)}

                    <div class="results-actions">
                        <button class="btn btn-outline btn-review">Review Answers</button>
                        <button class="btn btn-primary btn-continue">Continue</button>
                    </div>
                </div>
            `;

            // Setup result actions
            resultsContainer.querySelector('.btn-review')?.addEventListener('click', () => {
                this.showReviewMode();
            });

            resultsContainer.querySelector('.btn-continue')?.addEventListener('click', () => {
                this.emit('quiz:completed', results);
            });
        }

        /**
         * Render achievements
         * @param {Array} achievements - Achievements earned
         * @returns {string} HTML string
         */
        renderAchievements(achievements) {
            if (!achievements || achievements.length === 0) return '';

            return `
                <div class="results-achievements">
                    <h4>Achievements Unlocked!</h4>
                    <div class="achievement-list">
                        ${achievements.map(achievement => `
                            <div class="achievement-item">
                                <span class="achievement-icon">${achievement.icon}</span>
                                <div class="achievement-content">
                                    <h5>${achievement.title}</h5>
                                    <p>${achievement.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        /**
         * Render recommendations
         * @param {Array} recommendations - Study recommendations
         * @returns {string} HTML string
         */
        renderRecommendations(recommendations) {
            if (!recommendations || recommendations.length === 0) return '';

            return `
                <div class="results-recommendations">
                    <h4>Recommendations</h4>
                    <div class="recommendation-list">
                        ${recommendations.slice(0, 3).map(rec => `
                            <div class="recommendation-item priority-${rec.priority}">
                                <h5>${rec.title}</h5>
                                <p>${rec.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        /**
         * Show question feedback
         * @param {Object} feedback - Feedback data
         */
        showQuestionFeedback(feedback) {
            const feedbackContainer = this.container.querySelector('.question-feedback');
            
            feedbackContainer.innerHTML = `
                <div class="feedback-content ${feedback.isCorrect ? 'correct' : 'incorrect'}">
                    <div class="feedback-header">
                        <span class="feedback-icon">
                            ${feedback.isCorrect ? '✓' : '✗'}
                        </span>
                        <span class="feedback-text">
                            ${feedback.isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                    </div>
                    ${feedback.explanation ? `
                        <div class="feedback-explanation">
                            <p>${feedback.explanation}</p>
                        </div>
                    ` : ''}
                </div>
            `;
            
            feedbackContainer.classList.remove('hidden');
            
            // Hide after delay
            setTimeout(() => {
                feedbackContainer.classList.add('hidden');
            }, 3000);
        }

        /**
         * Start quiz timers
         */
        startTimers() {
            if (!this.config.showTimer || !this.engine) return;

            // Quiz timer
            const state = this.engine.getState();
            if (state.timeLimit) {
                this.updateTimer();
                this.timers.quiz = setInterval(() => {
                    this.updateTimer();
                }, 1000);
            }
        }

        /**
         * Start question timer
         * @param {Object} question - Question data
         */
        startQuestionTimer(question) {
            if (!question.timeLimit) return;

            const timerElement = this.container.querySelector('.question-timer');
            let remaining = question.timeLimit;

            this.timers.question = setInterval(() => {
                remaining -= 1000;
                timerElement.textContent = Utils.formatTime(remaining);

                if (remaining <= 0) {
                    clearInterval(this.timers.question);
                    this.skipQuestion();
                }
            }, 1000);
        }

        /**
         * Stop all timers
         */
        stopTimers() {
            Object.values(this.timers).forEach(timer => {
                if (timer) clearInterval(timer);
            });
            this.timers = { quiz: null, question: null, autosave: null };
        }

        /**
         * Update quiz timer display
         */
        updateTimer() {
            if (!this.engine) return;

            const remaining = this.engine.getRemainingTime();
            if (remaining !== null) {
                const timerText = this.container.querySelector('.timer-text');
                timerText.textContent = Utils.formatTime(remaining);

                // Warning for last minute
                if (remaining <= 60000) {
                    timerText.classList.add('warning');
                }
            }
        }

        /**
         * Show timeout message
         */
        showTimeoutMessage() {
            eventBus.emit(Constants.EVENTS.NOTIFICATION_SHOW, {
                type: 'warning',
                title: 'Time\'s Up!',
                message: 'The quiz time limit has been reached.',
                duration: 5000
            });
        }

        /**
         * Enable/disable form elements
         * @param {boolean} enabled - Whether to enable form
         */
        setFormEnabled(enabled) {
            const formElements = this.container.querySelectorAll('input, button, select, textarea');
            formElements.forEach(element => {
                element.disabled = !enabled;
            });
        }

        /**
         * Show review mode
         */
        showReviewMode() {
            // Implementation for reviewing answers
            console.log('Review mode not yet implemented');
        }

        /**
         * Cleanup resources
         */
        destroy() {
            this.stopTimers();
            
            if (this.engine) {
                this.engine.destroy();
            }
            
            this.renderers.clear();
            super.destroy();
        }
    }
}
