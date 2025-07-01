/**
 * Quiz State Management
 * Handles quiz state, progress, and data persistence
 */

// Prevent redeclaration of QuizState
if (typeof window !== 'undefined' && window.QuizState) {
    // Already defined, do nothing
} else {
    class QuizState {
        constructor() {
            this.state = {
                // Quiz metadata
                quizId: null,
                title: '',
                description: '',
                totalQuestions: 0,
                
                // Progress tracking
                currentQuestionIndex: 0,
                questions: [],
                answers: new Map(),
                startTime: null,
                endTime: null,
                timeLimit: null,
                
                // Status flags
                isStarted: false,
                isCompleted: false,
                isPaused: false,
                isTimedOut: false,
                
                // Results
                score: 0,
                maxScore: 0,
                percentage: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                skippedAnswers: 0,
                
                // Settings
                allowReview: true,
                allowSkip: true,
                allowBack: true,
                shuffleQuestions: false,
                shuffleOptions: false,
                immediateHybrid: false,
                
                // Metadata
                attemptNumber: 1,
                userId: null,
                lessonId: null
            };
            
            this.listeners = new Map();
            this.history = [];
            this.maxHistoryLength = 50;
        }

        /**
         * Initialize quiz state
         * @param {Object} quizData - Quiz configuration data
         */
        initialize(quizData) {
            try {
                // Reset state
                this.reset();
                
                // Set quiz metadata
                this.state.quizId = quizData.id;
                this.state.title = quizData.title || 'Untitled Quiz';
                this.state.description = quizData.description || '';
                this.state.timeLimit = quizData.timeLimit || null;
                this.state.userId = authService?.getCurrentUser()?.id || 'anonymous';
                this.state.lessonId = quizData.lessonId || null;
                
                // Set quiz settings
                Object.assign(this.state, {
                    allowReview: quizData.allowReview !== false,
                    allowSkip: quizData.allowSkip !== false,
                    allowBack: quizData.allowBack !== false,
                    shuffleQuestions: quizData.shuffleQuestions === true,
                    shuffleOptions: quizData.shuffleOptions === true,
                    immediateHybrid: quizData.immediateHybrid === true
                });
                
                // Process questions
                this.processQuestions(quizData.questions || []);
                
                // Initialize answers map
                this.state.answers.clear();
                this.state.questions.forEach((q, index) => {
                    this.state.answers.set(index, {
                        questionId: q.id,
                        selectedAnswer: null,
                        isCorrect: null,
                        timeSpent: 0,
                        attempts: 0,
                        skipped: false
                    });
                });
                
                // Load existing progress if available
                this.loadProgress();
                
                this.notifyStateChange('initialized');
                console.log('Quiz state initialized:', this.state.title);
                
            } catch (error) {
                console.error('Error initializing quiz state:', error);
                throw new Error('Failed to initialize quiz state');
            }
        }

        /**
         * Process and prepare questions
         * @param {Array} questions - Raw question data
         */
        processQuestions(questions) {
            this.state.questions = questions.map((q, index) => ({
                id: q.id || `q_${index}`,
                type: q.type || 'multiple_choice',
                question: q.question || '',
                options: q.options || [],
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || '',
                points: q.points || 1,
                timeLimit: q.timeLimit || null,
                difficulty: q.difficulty || 'medium',
                tags: q.tags || [],
                metadata: q.metadata || {}
            }));
            
            // Shuffle questions if enabled
            if (this.state.shuffleQuestions) {
                this.state.questions = Utils.shuffleArray([...this.state.questions]);
            }
            
            // Shuffle options if enabled
            if (this.state.shuffleOptions) {
                this.state.questions.forEach(question => {
                    if (question.type === 'multiple_choice' && question.options.length > 0) {
                        // Store correct answer before shuffling
                        const correctOption = question.options[question.correctAnswer];
                        question.options = Utils.shuffleArray([...question.options]);
                        // Update correct answer index
                        question.correctAnswer = question.options.indexOf(correctOption);
                    }
                });
            }
            
            this.state.totalQuestions = this.state.questions.length;
            this.state.maxScore = this.state.questions.reduce((total, q) => total + (q.points || 1), 0);
        }

        /**
         * Start the quiz
         */
        start() {
            if (this.state.isStarted) {
                console.warn('Quiz already started');
                return;
            }
            
            this.state.isStarted = true;
            this.state.startTime = Date.now();
            this.state.currentQuestionIndex = 0;
            
            this.saveProgress();
            this.notifyStateChange('started');
            
            // Start timer if time limit is set
            if (this.state.timeLimit) {
                this.startTimer();
            }
            
            console.log('Quiz started:', this.state.title);
        }

        /**
         * Submit answer for current question
         * @param {*} answer - User's answer
         * @param {number} timeSpent - Time spent on question (ms)
         */
        submitAnswer(answer, timeSpent = 0) {
            const currentIndex = this.state.currentQuestionIndex;
            const question = this.state.questions[currentIndex];
            const answerData = this.state.answers.get(currentIndex);
            
            if (!question || !answerData) {
                throw new Error('Invalid question or answer data');
            }
            
            // Update answer data
            answerData.selectedAnswer = answer;
            answerData.timeSpent += timeSpent;
            answerData.attempts += 1;
            answerData.skipped = false;
            
            // Evaluate answer
            const isCorrect = this.evaluateAnswer(question, answer);
            answerData.isCorrect = isCorrect;
            
            // Update score if correct
            if (isCorrect) {
                this.state.score += question.points || 1;
                this.state.correctAnswers += 1;
            } else {
                this.state.incorrectAnswers += 1;
            }
            
            this.state.answers.set(currentIndex, answerData);
            this.saveProgress();
            this.notifyStateChange('answer_submitted', { 
                questionIndex: currentIndex, 
                isCorrect, 
                answer 
            });
        }

        /**
         * Skip current question
         */
        skipQuestion() {
            if (!this.state.allowSkip) {
                throw new Error('Skipping questions is not allowed');
            }
            
            const currentIndex = this.state.currentQuestionIndex;
            const answerData = this.state.answers.get(currentIndex);
            
            if (answerData) {
                answerData.skipped = true;
                this.state.skippedAnswers += 1;
                this.state.answers.set(currentIndex, answerData);
            }
            
            this.saveProgress();
            this.notifyStateChange('question_skipped', { questionIndex: currentIndex });
        }

        /**
         * Move to next question
         */
        nextQuestion() {
            if (this.state.currentQuestionIndex < this.state.totalQuestions - 1) {
                this.state.currentQuestionIndex += 1;
                this.notifyStateChange('question_changed', { 
                    index: this.state.currentQuestionIndex 
                });
            } else {
                this.complete();
            }
        }

        /**
         * Move to previous question
         */
        previousQuestion() {
            if (!this.state.allowBack) {
                throw new Error('Going back to previous questions is not allowed');
            }
            
            if (this.state.currentQuestionIndex > 0) {
                this.state.currentQuestionIndex -= 1;
                this.notifyStateChange('question_changed', { 
                    index: this.state.currentQuestionIndex 
                });
            }
        }

        /**
         * Navigate to specific question
         * @param {number} index - Question index
         */
        goToQuestion(index) {
            if (!this.state.allowReview && index !== this.state.currentQuestionIndex + 1) {
                throw new Error('Question navigation not allowed');
            }
            
            if (index >= 0 && index < this.state.totalQuestions) {
                this.state.currentQuestionIndex = index;
                this.notifyStateChange('question_changed', { index });
            }
        }

        /**
         * Complete the quiz
         */
        complete() {
            if (this.state.isCompleted) {
                console.warn('Quiz already completed');
                return;
            }
            
            this.state.isCompleted = true;
            this.state.endTime = Date.now();
            
            // Calculate final results
            this.calculateResults();
            
            this.saveProgress();
            this.notifyStateChange('completed');
            
            console.log('Quiz completed. Score:', this.state.score, '/', this.state.maxScore);
        }

        /**
         * Pause the quiz
         */
        pause() {
            if (!this.state.isStarted || this.state.isCompleted) {
                return;
            }
            
            this.state.isPaused = true;
            this.notifyStateChange('paused');
        }

        /**
         * Resume the quiz
         */
        resume() {
            if (!this.state.isPaused) {
                return;
            }
            
            this.state.isPaused = false;
            this.notifyStateChange('resumed');
        }

        /**
         * Reset quiz state
         */
        reset() {
            const userId = this.state.userId;
            const lessonId = this.state.lessonId;
            
            this.state = {
                quizId: null,
                title: '',
                description: '',
                totalQuestions: 0,
                currentQuestionIndex: 0,
                questions: [],
                answers: new Map(),
                startTime: null,
                endTime: null,
                timeLimit: null,
                isStarted: false,
                isCompleted: false,
                isPaused: false,
                isTimedOut: false,
                score: 0,
                maxScore: 0,
                percentage: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                skippedAnswers: 0,
                allowReview: true,
                allowSkip: true,
                allowBack: true,
                shuffleQuestions: false,
                shuffleOptions: false,
                immediateHybrid: false,
                attemptNumber: this.state.attemptNumber + 1,
                userId: userId,
                lessonId: lessonId
            };
            
            this.clearHistory();
            this.notifyStateChange('reset');
        }

        /**
         * Evaluate user's answer
         * @param {Object} question - Question data
         * @param {*} userAnswer - User's answer
         * @returns {boolean} Whether answer is correct
         */
        evaluateAnswer(question, userAnswer) {
            switch (question.type) {
                case 'multiple_choice':
                    return userAnswer === question.correctAnswer;
                    
                case 'true_false':
                    return userAnswer === question.correctAnswer;
                    
                case 'fill_blank':
                    if (Array.isArray(question.correctAnswer)) {
                        return question.correctAnswer.some(correct => 
                            this.normalizeAnswer(userAnswer) === this.normalizeAnswer(correct)
                        );
                    }
                    return this.normalizeAnswer(userAnswer) === this.normalizeAnswer(question.correctAnswer);
                    
                case 'multiple_select':
                    if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) {
                        return false;
                    }
                    return userAnswer.length === question.correctAnswer.length &&
                           userAnswer.every(answer => question.correctAnswer.includes(answer));
                           
                default:
                    return false;
            }
        }

        /**
         * Normalize answer for comparison
         * @param {string} answer - Answer to normalize
         * @returns {string} Normalized answer
         */
        normalizeAnswer(answer) {
            if (typeof answer !== 'string') return String(answer);
            return answer.toLowerCase().trim().replace(/\s+/g, ' ');
        }

        /**
         * Calculate final quiz results
         */
        calculateResults() {
            this.state.percentage = this.state.maxScore > 0 ? 
                Math.round((this.state.score / this.state.maxScore) * 100) : 0;
            
            // Calculate time spent
            const totalTime = this.state.endTime - this.state.startTime;
            this.state.totalTime = totalTime;
            
            // Calculate average time per question
            this.state.averageTimePerQuestion = Math.round(totalTime / this.state.totalQuestions);
        }

        /**
         * Start quiz timer
         */
        startTimer() {
            if (this.timer) {
                clearTimeout(this.timer);
            }
            
            this.timer = setTimeout(() => {
                this.state.isTimedOut = true;
                this.complete();
                this.notifyStateChange('timeout');
            }, this.state.timeLimit);
        }

        /**
         * Get remaining time
         * @returns {number} Remaining time in milliseconds
         */
        getRemainingTime() {
            if (!this.state.timeLimit || !this.state.startTime) {
                return null;
            }
            
            const elapsed = Date.now() - this.state.startTime;
            return Math.max(0, this.state.timeLimit - elapsed);
        }

        /**
         * Save progress to storage
         */
        saveProgress() {
            try {
                const progressData = {
                    ...this.state,
                    answers: Array.from(this.state.answers.entries()),
                    timestamp: Date.now()
                };
                
                const key = `cwm_quiz_progress_${this.state.quizId}`;
                localStorage.setItem(key, JSON.stringify(progressData));
                
            } catch (error) {
                console.error('Error saving quiz progress:', error);
            }
        }

        /**
         * Load progress from storage
         */
        loadProgress() {
            try {
                const key = `cwm_quiz_progress_${this.state.quizId}`;
                const savedData = localStorage.getItem(key);
                
                if (savedData) {
                    const progressData = JSON.parse(savedData);
                    
                    // Only load if quiz was not completed
                    if (!progressData.isCompleted) {
                        Object.assign(this.state, progressData);
                        this.state.answers = new Map(progressData.answers);
                        console.log('Quiz progress loaded');
                    }
                }
                
            } catch (error) {
                console.error('Error loading quiz progress:', error);
            }
        }

        /**
         * Clear saved progress
         */
        clearProgress() {
            try {
                const key = `cwm_quiz_progress_${this.state.quizId}`;
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Error clearing quiz progress:', error);
            }
        }

        /**
         * Add state change listener
         * @param {string} event - Event name
         * @param {Function} callback - Callback function
         */
        addEventListener(event, callback) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, new Set());
            }
            this.listeners.get(event).add(callback);
        }

        /**
         * Remove state change listener
         * @param {string} event - Event name
         * @param {Function} callback - Callback function
         */
        removeEventListener(event, callback) {
            if (this.listeners.has(event)) {
                this.listeners.get(event).delete(callback);
            }
        }

        /**
         * Notify state change
         * @param {string} event - Event name
         * @param {Object} data - Event data
         */
        notifyStateChange(event, data = {}) {
            // Add to history
            this.addToHistory(event, data);
            
            // Notify listeners
            if (this.listeners.has(event)) {
                this.listeners.get(event).forEach(callback => {
                    try {
                        callback({ ...data, state: this.getState() });
                    } catch (error) {
                        console.error('Error in state change listener:', error);
                    }
                });
            }
            
            // Emit global event
            eventBus.emit(`quiz:${event}`, { ...data, state: this.getState() });
        }

        /**
         * Add event to history
         * @param {string} event - Event name
         * @param {Object} data - Event data
         */
        addToHistory(event, data) {
            this.history.push({
                event,
                data,
                timestamp: Date.now(),
                state: { ...this.state }
            });
            
            // Limit history size
            if (this.history.length > this.maxHistoryLength) {
                this.history.shift();
            }
        }

        /**
         * Clear event history
         */
        clearHistory() {
            this.history = [];
        }

        // Getters
        getState() {
            return { ...this.state };
        }

        getCurrentQuestion() {
            return this.state.questions[this.state.currentQuestionIndex] || null;
        }

        getCurrentAnswer() {
            return this.state.answers.get(this.state.currentQuestionIndex) || null;
        }

        getQuestion(index) {
            return this.state.questions[index] || null;
        }

        getAnswer(index) {
            return this.state.answers.get(index) || null;
        }

        getProgress() {
            return {
                current: this.state.currentQuestionIndex + 1,
                total: this.state.totalQuestions,
                percentage: Math.round(((this.state.currentQuestionIndex + 1) / this.state.totalQuestions) * 100)
            };
        }

        getResults() {
            return {
                score: this.state.score,
                maxScore: this.state.maxScore,
                percentage: this.state.percentage,
                correctAnswers: this.state.correctAnswers,
                incorrectAnswers: this.state.incorrectAnswers,
                skippedAnswers: this.state.skippedAnswers,
                totalTime: this.state.totalTime,
                averageTimePerQuestion: this.state.averageTimePerQuestion
            };
        }

        getHistory() {
            return [...this.history];
        }

        // Status checks
        isStarted() {
            return this.state.isStarted;
        }

        isCompleted() {
            return this.state.isCompleted;
        }

        isPaused() {
            return this.state.isPaused;
        }

        isTimedOut() {
            return this.state.isTimedOut;
        }

        canGoBack() {
            return this.state.allowBack && this.state.currentQuestionIndex > 0;
        }

        canGoNext() {
            return this.state.currentQuestionIndex < this.state.totalQuestions - 1;
        }

        canSkip() {
            return this.state.allowSkip;
        }

        canReview() {
            return this.state.allowReview;
        }
    }

    // Export for module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = QuizState;
    } else {
        window.QuizState = QuizState;
    }
}
