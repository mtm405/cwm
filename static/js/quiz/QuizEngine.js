/**
 * Quiz Engine
 * Core quiz logic and orchestration
 */

// Prevent redeclaration of QuizEngine
if (typeof window !== 'undefined' && window.QuizEngine) {
    // Already defined, do nothing
} else {
    class QuizEngine {
        constructor() {
            this.state = null;
            this.renderers = new Map();
            this.plugins = new Map();
            this.analytics = {
                events: [],
                startTime: null,
                endTime: null
            };
            
            this.config = {
                autoSave: true,
                autoSaveInterval: 30000, // 30 seconds
                analytics: true,
                debugMode: false
            };
            
            this.autoSaveTimer = null;
            this.questionTimer = null;
            
            // Initialize default renderers
            this.initializeDefaultRenderers();
            
            // Set up event listeners
            this.setupEventListeners();
        }

        /**
         * Initialize quiz engine with quiz data
         * @param {Object} quizData - Quiz configuration
         * @param {Object} options - Engine options
         */
        async initialize(quizData, options = {}) {
            try {
                // Merge options with config
                Object.assign(this.config, options);
                
                // Create state manager
                this.state = new QuizState();
                await this.state.initialize(quizData);
                
                // Set up auto-save if enabled
                if (this.config.autoSave) {
                    this.setupAutoSave();
                }
                
                // Initialize analytics
                if (this.config.analytics) {
                    this.initializeAnalytics();
                }
                
                // Emit initialization event
                eventBus.emit(Constants.EVENTS.QUIZ_INIT, {
                    quizId: quizData.id,
                    engine: this
                });
                
                console.log('Quiz engine initialized:', quizData.title);
                return this;
                
            } catch (error) {
                console.error('Quiz engine initialization failed:', error);
                throw error;
            }
        }

        /**
         * Start the quiz
         */
        start() {
            if (!this.state) {
                throw new Error('Quiz engine not initialized');
            }
            
            try {
                this.state.start();
                this.startQuestionTimer();
                
                // Track analytics
                this.trackEvent('quiz_started', {
                    quizId: this.state.getState().quizId,
                    totalQuestions: this.state.getState().totalQuestions
                });
                
            } catch (error) {
                console.error('Error starting quiz:', error);
                throw error;
            }
        }

        /**
         * Submit answer for current question
         * @param {*} answer - User's answer
         */
        async submitAnswer(answer) {
            if (!this.state || !this.state.isStarted()) {
                throw new Error('Quiz not started');
            }
            
            try {
                const questionStartTime = this.questionStartTime || Date.now();
                const timeSpent = Date.now() - questionStartTime;
                
                // Get current question for validation
                const currentQuestion = this.state.getCurrentQuestion();
                if (!currentQuestion) {
                    throw new Error('No current question available');
                }
                
                // Validate answer format
                const isValidAnswer = this.validateAnswer(currentQuestion, answer);
                if (!isValidAnswer) {
                    throw new Error('Invalid answer format');
                }
                
                // Submit to state
                this.state.submitAnswer(answer, timeSpent);
                
                // Track analytics
                this.trackEvent('answer_submitted', {
                    questionId: currentQuestion.id,
                    questionType: currentQuestion.type,
                    answer: answer,
                    timeSpent: timeSpent,
                    isCorrect: this.state.getCurrentAnswer().isCorrect
                });
                
                // Process immediate feedback if enabled
                if (this.state.getState().immediateHybrid) {
                    await this.showImmediateFeedback();
                }
                
            } catch (error) {
                console.error('Error submitting answer:', error);
                throw error;
            }
        }

        /**
         * Skip current question
         */
        skipQuestion() {
            if (!this.state || !this.state.canSkip()) {
                throw new Error('Cannot skip question');
            }
            
            try {
                const currentQuestion = this.state.getCurrentQuestion();
                this.state.skipQuestion();
                
                // Track analytics
                this.trackEvent('question_skipped', {
                    questionId: currentQuestion.id,
                    questionIndex: this.state.getState().currentQuestionIndex
                });
                
            } catch (error) {
                console.error('Error skipping question:', error);
                throw error;
            }
        }

        /**
         * Navigate to next question
         */
        nextQuestion() {
            if (!this.state) {
                throw new Error('Quiz engine not initialized');
            }
            
            try {
                this.state.nextQuestion();
                this.startQuestionTimer();
                
            } catch (error) {
                console.error('Error navigating to next question:', error);
                throw error;
            }
        }

        /**
         * Navigate to previous question
         */
        previousQuestion() {
            if (!this.state || !this.state.canGoBack()) {
                throw new Error('Cannot go to previous question');
            }
            
            try {
                this.state.previousQuestion();
                this.startQuestionTimer();
                
            } catch (error) {
                console.error('Error navigating to previous question:', error);
                throw error;
            }
        }

        /**
         * Navigate to specific question
         * @param {number} index - Question index
         */
        goToQuestion(index) {
            if (!this.state) {
                throw new Error('Quiz engine not initialized');
            }
            
            try {
                this.state.goToQuestion(index);
                this.startQuestionTimer();
                
            } catch (error) {
                console.error('Error navigating to question:', error);
                throw error;
            }
        }

        /**
         * Pause the quiz
         */
        pause() {
            if (!this.state) {
                throw new Error('Quiz engine not initialized');
            }
            
            this.state.pause();
            this.stopQuestionTimer();
            
            // Track analytics
            this.trackEvent('quiz_paused', {
                questionIndex: this.state.getState().currentQuestionIndex
            });
        }

        /**
         * Resume the quiz
         */
        resume() {
            if (!this.state) {
                throw new Error('Quiz engine not initialized');
            }
            
            this.state.resume();
            this.startQuestionTimer();
            
            // Track analytics
            this.trackEvent('quiz_resumed', {
                questionIndex: this.state.getState().currentQuestionIndex
            });
        }

        /**
         * Complete the quiz
         */
        async complete() {
            if (!this.state) {
                throw new Error('Quiz engine not initialized');
            }
            
            try {
                this.state.complete();
                this.stopQuestionTimer();
                this.stopAutoSave();
                
                // Process results
                const results = await this.processResults();
                
                // Track analytics
                this.trackEvent('quiz_completed', {
                    results: results,
                    totalTime: this.state.getState().totalTime
                });
                
                // Submit results to backend
                if (this.config.submitResults !== false) {
                    await this.submitResults(results);
                }
                
                return results;
                
            } catch (error) {
                console.error('Error completing quiz:', error);
                throw error;
            }
        }

        /**
         * Reset the quiz
         */
        reset() {
            if (!this.state) {
                throw new Error('Quiz engine not initialized');
            }
            
            this.state.reset();
            this.stopQuestionTimer();
            this.stopAutoSave();
            
            if (this.config.autoSave) {
                this.setupAutoSave();
            }
            
            // Clear analytics
            this.analytics.events = [];
            
            // Track analytics
            this.trackEvent('quiz_reset', {});
        }

        /**
         * Validate answer format
         * @param {Object} question - Question data
         * @param {*} answer - User's answer
         * @returns {boolean} Whether answer is valid
         */
        validateAnswer(question, answer) {
            switch (question.type) {
                case 'multiple_choice':
                    return typeof answer === 'number' && 
                           answer >= 0 && 
                           answer < question.options.length;
                           
                case 'true_false':
                    return typeof answer === 'boolean';
                    
                case 'fill_blank':
                    return typeof answer === 'string' && answer.trim().length > 0;
                    
                case 'multiple_select':
                    return Array.isArray(answer) && 
                           answer.every(a => typeof a === 'number' && 
                                            a >= 0 && 
                                            a < question.options.length);
                                            
                default:
                    return true; // Allow custom question types
            }
        }

        /**
         * Show immediate feedback for current question
         */
        async showImmediateFeedback() {
            const currentAnswer = this.state.getCurrentAnswer();
            const currentQuestion = this.state.getCurrentQuestion();
            
            if (!currentAnswer || !currentQuestion) return;
            
            const feedback = {
                isCorrect: currentAnswer.isCorrect,
                explanation: currentQuestion.explanation,
                correctAnswer: currentQuestion.correctAnswer,
                userAnswer: currentAnswer.selectedAnswer
            };
            
            // Emit feedback event
            eventBus.emit('quiz:feedback', feedback);
            
            // Show notification
            eventBus.emit(Constants.EVENTS.NOTIFICATION_SHOW, {
                type: currentAnswer.isCorrect ? 'success' : 'error',
                title: currentAnswer.isCorrect ? 'Correct!' : 'Incorrect',
                message: currentQuestion.explanation || 
                        (currentAnswer.isCorrect ? 'Great job!' : 'Better luck next time!'),
                duration: 3000
            });
        }

        /**
         * Process quiz results
         * @returns {Object} Processed results
         */
        async processResults() {
            const state = this.state.getState();
            const results = this.state.getResults();
            
            // Enhanced results with detailed analysis
            const enhancedResults = {
                ...results,
                quizId: state.quizId,
                userId: state.userId,
                lessonId: state.lessonId,
                attemptNumber: state.attemptNumber,
                
                // Question-level results
                questionResults: [],
                
                // Performance metrics
                timePerQuestion: [],
                difficultyBreakdown: {},
                topicBreakdown: {},
                
                // Achievement data
                achievements: [],
                badges: [],
                
                // Recommendations
                recommendations: []
            };
            
            // Analyze question-level performance
            for (let i = 0; i < state.questions.length; i++) {
                const question = state.questions[i];
                const answer = state.answers.get(i);
                
                enhancedResults.questionResults.push({
                    questionId: question.id,
                    question: question.question,
                    userAnswer: answer.selectedAnswer,
                    correctAnswer: question.correctAnswer,
                    isCorrect: answer.isCorrect,
                    timeSpent: answer.timeSpent,
                    attempts: answer.attempts,
                    skipped: answer.skipped,
                    points: question.points,
                    difficulty: question.difficulty
                });
                
                // Track time per question
                enhancedResults.timePerQuestion.push(answer.timeSpent);
                
                // Difficulty breakdown
                if (!enhancedResults.difficultyBreakdown[question.difficulty]) {
                    enhancedResults.difficultyBreakdown[question.difficulty] = {
                        total: 0,
                        correct: 0
                    };
                }
                enhancedResults.difficultyBreakdown[question.difficulty].total++;
                if (answer.isCorrect) {
                    enhancedResults.difficultyBreakdown[question.difficulty].correct++;
                }
                
                // Topic breakdown
                if (question.tags) {
                    question.tags.forEach(tag => {
                        if (!enhancedResults.topicBreakdown[tag]) {
                            enhancedResults.topicBreakdown[tag] = {
                                total: 0,
                                correct: 0
                            };
                        }
                        enhancedResults.topicBreakdown[tag].total++;
                        if (answer.isCorrect) {
                            enhancedResults.topicBreakdown[tag].correct++;
                        }
                    });
                }
            }
            
            // Generate achievements and recommendations
            enhancedResults.achievements = this.generateAchievements(enhancedResults);
            enhancedResults.recommendations = this.generateRecommendations(enhancedResults);
            
            return enhancedResults;
        }

        /**
         * Generate achievements based on performance
         * @param {Object} results - Quiz results
         * @returns {Array} Achievements earned
         */
        generateAchievements(results) {
            const achievements = [];
            
            // Perfect score
            if (results.percentage === 100) {
                achievements.push({
                    id: 'perfect_score',
                    title: 'Perfect Score!',
                    description: 'Answered all questions correctly',
                    icon: '🎯'
                });
            }
            
            // Speed demon
            const avgTime = results.timePerQuestion.reduce((a, b) => a + b, 0) / results.timePerQuestion.length;
            if (avgTime < 30000) { // Less than 30 seconds per question
                achievements.push({
                    id: 'speed_demon',
                    title: 'Speed Demon',
                    description: 'Completed the quiz with lightning speed',
                    icon: '⚡'
                });
            }
            
            // No skips
            if (results.skippedAnswers === 0) {
                achievements.push({
                    id: 'no_surrender',
                    title: 'No Surrender',
                    description: 'Answered every question without skipping',
                    icon: '💪'
                });
            }
            
            // High score thresholds
            if (results.percentage >= 90) {
                achievements.push({
                    id: 'excellent',
                    title: 'Excellent Performance',
                    description: 'Scored 90% or higher',
                    icon: '🌟'
                });
            } else if (results.percentage >= 80) {
                achievements.push({
                    id: 'great_job',
                    title: 'Great Job',
                    description: 'Scored 80% or higher',
                    icon: '👍'
                });
            }
            
            return achievements;
        }

        /**
         * Generate personalized recommendations
         * @param {Object} results - Quiz results
         * @returns {Array} Recommendations
         */
        generateRecommendations(results) {
            const recommendations = [];
            
            // Analyze weak topics
            Object.entries(results.topicBreakdown).forEach(([topic, data]) => {
                const accuracy = data.correct / data.total;
                if (accuracy < 0.7 && data.total >= 2) {
                    recommendations.push({
                        type: 'topic_review',
                        priority: 'high',
                        title: `Review ${topic}`,
                        description: `You scored ${Math.round(accuracy * 100)}% on ${topic} questions. Consider reviewing this topic.`,
                        action: {
                            type: 'study_topic',
                            topic: topic
                        }
                    });
                }
            });
            
            // Analyze difficulty performance
            Object.entries(results.difficultyBreakdown).forEach(([difficulty, data]) => {
                const accuracy = data.correct / data.total;
                if (accuracy < 0.6 && data.total >= 2) {
                    recommendations.push({
                        type: 'difficulty_practice',
                        priority: 'medium',
                        title: `Practice ${difficulty} questions`,
                        description: `Consider practicing more ${difficulty} level questions to improve your understanding.`,
                        action: {
                            type: 'practice_difficulty',
                            difficulty: difficulty
                        }
                    });
                }
            });
            
            // Time management recommendations
            const avgTime = results.timePerQuestion.reduce((a, b) => a + b, 0) / results.timePerQuestion.length;
            if (avgTime > 120000) { // More than 2 minutes per question
                recommendations.push({
                    type: 'time_management',
                    priority: 'low',
                    title: 'Time Management',
                    description: 'Consider practicing time management to improve your quiz-taking speed.',
                    action: {
                        type: 'practice_timed',
                        timeLimit: 60000
                    }
                });
            }
            
            return recommendations.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
        }

        /**
         * Submit results to backend
         * @param {Object} results - Quiz results
         */
        async submitResults(results) {
            try {
                const response = await fetch(Config.getApiUrl('/quiz/submit'), {
                    method: 'POST',
                    headers: {
                        ...Config.api.defaultHeaders,
                        'Authorization': `Bearer ${authService.getAuthToken()}`
                    },
                    body: JSON.stringify({
                        results,
                        analytics: this.analytics
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to submit results: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Quiz results submitted successfully');
                
                // Emit success event
                eventBus.emit('quiz:results_submitted', { results, response: data });
                
            } catch (error) {
                console.error('Error submitting quiz results:', error);
                
                // Store results locally for retry
                this.storeResultsLocally(results);
                
                // Emit error event
                eventBus.emit('quiz:submit_error', { error, results });
            }
        }

        /**
         * Store results locally for later submission
         * @param {Object} results - Quiz results
         */
        storeResultsLocally(results) {
            try {
                const key = `cwm_quiz_results_${results.quizId}_${Date.now()}`;
                localStorage.setItem(key, JSON.stringify(results));
            } catch (error) {
                console.error('Error storing results locally:', error);
            }
        }

        /**
         * Initialize default question renderers
         */
        initializeDefaultRenderers() {
            // Renderers will be registered when their modules are loaded
            this.renderers.set('multiple_choice', null);
            this.renderers.set('true_false', null);
            this.renderers.set('fill_blank', null);
        }

        /**
         * Register question renderer
         * @param {string} type - Question type
         * @param {Object} renderer - Renderer instance
         */
        registerRenderer(type, renderer) {
            this.renderers.set(type, renderer);
            console.log(`Renderer registered for question type: ${type}`);
        }

        /**
         * Get renderer for question type
         * @param {string} type - Question type
         * @returns {Object} Renderer instance
         */
        getRenderer(type) {
            return this.renderers.get(type);
        }

        /**
         * Register plugin
         * @param {string} name - Plugin name
         * @param {Object} plugin - Plugin instance
         */
        registerPlugin(name, plugin) {
            this.plugins.set(name, plugin);
            console.log(`Plugin registered: ${name}`);
        }

        /**
         * Get plugin
         * @param {string} name - Plugin name
         * @returns {Object} Plugin instance
         */
        getPlugin(name) {
            return this.plugins.get(name);
        }

        /**
         * Setup auto-save functionality
         */
        setupAutoSave() {
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer);
            }
            
            this.autoSaveTimer = setInterval(() => {
                if (this.state && this.state.isStarted() && !this.state.isCompleted()) {
                    this.state.saveProgress();
                }
            }, this.config.autoSaveInterval);
        }

        /**
         * Stop auto-save
         */
        stopAutoSave() {
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer);
                this.autoSaveTimer = null;
            }
        }

        /**
         * Start question timer
         */
        startQuestionTimer() {
            this.questionStartTime = Date.now();
            
            // Clear existing timer
            if (this.questionTimer) {
                clearTimeout(this.questionTimer);
            }
            
            // Set timer for question time limit if applicable
            const currentQuestion = this.state?.getCurrentQuestion();
            if (currentQuestion?.timeLimit) {
                this.questionTimer = setTimeout(() => {
                    // Auto-submit or skip question when time runs out
                    if (this.state.canSkip()) {
                        this.skipQuestion();
                        this.nextQuestion();
                    }
                }, currentQuestion.timeLimit);
            }
        }

        /**
         * Stop question timer
         */
        stopQuestionTimer() {
            if (this.questionTimer) {
                clearTimeout(this.questionTimer);
                this.questionTimer = null;
            }
        }

        /**
         * Initialize analytics
         */
        initializeAnalytics() {
            this.analytics.startTime = Date.now();
            this.analytics.events = [];
            
            // Track initial state
            this.trackEvent('analytics_initialized', {
                quizId: this.state?.getState().quizId
            });
        }

        /**
         * Track analytics event
         * @param {string} event - Event name
         * @param {Object} data - Event data
         */
        trackEvent(event, data = {}) {
            if (!this.config.analytics) return;
            
            this.analytics.events.push({
                event,
                data,
                timestamp: Date.now()
            });
            
            // Emit for external analytics
            eventBus.emit('quiz:analytics', { event, data });
        }

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            // Listen for state changes
            eventBus.on('quiz:completed', (data) => {
                this.analytics.endTime = Date.now();
            });
            
            eventBus.on('quiz:timeout', () => {
                this.trackEvent('quiz_timeout', {
                    questionIndex: this.state?.getState().currentQuestionIndex
                });
            });
        }

        /**
         * Get current state
         * @returns {Object} Current quiz state
         */
        getState() {
            return this.state?.getState() || null;
        }

        /**
         * Get analytics data
         * @returns {Object} Analytics data
         */
        getAnalytics() {
            return { ...this.analytics };
        }

        /**
         * Cleanup resources
         */
        destroy() {
            this.stopAutoSave();
            this.stopQuestionTimer();
            
            if (this.state) {
                this.state.clearProgress();
            }
            
            this.renderers.clear();
            this.plugins.clear();
            this.analytics.events = [];
        }
    }

    // Export for module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = QuizEngine;
    } else {
        window.QuizEngine = QuizEngine;
    }
}
