/**
 * Enhanced Vocabulary Manager - Complete Implementation
 * Handles flashcards, list view, quiz mode, and vocabulary management
 */

class VocabularyManager {
    constructor() {
        this.vocabularyData = [];
        this.filteredData = [];
        this.categories = [];
        this.currentMode = 'flashcards';
        this.currentCategory = 'all';
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.searchQuery = '';
        this.quizData = {
            questions: [],
            currentQuestion: 0,
            score: 0,
            answers: []
        };
        this.userProgress = this.loadUserProgress();
        this.initialized = false;
        this.isLoading = false;
        
        // Enhanced features
        this.studySettings = {
            spacedRepetition: true,
            autoAdvance: false,
            showHints: true,
            studyStreak: 0,
            dailyGoal: 10
        };
        
        // Performance tracking
        this.performanceMetrics = {
            sessionStartTime: null,
            cardsStudied: 0,
            correctAnswers: 0,
            totalTime: 0
        };
        
        // Cache for API responses
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Initialize the vocabulary system with enhanced features
     */
    async init() {
        if (this.initialized) return;
        
        console.log('🎯 Initializing Enhanced Vocabulary System');
        
        try {
            this.showLoading();
            this.performanceMetrics.sessionStartTime = Date.now();
            
            await this.loadVocabularyData();
            await this.loadCategories();
            await this.loadUserSettings();
            
            this.setupEventListeners();
            this.setupPerformanceTracking();
            this.renderCategories();
            this.switchMode('flashcards');
            this.updateStats();
            this.checkDailyStreak();
            
            // Initialize achievements system
            if (typeof VocabularyAchievements !== 'undefined') {
                this.achievements = new VocabularyAchievements(this);
                this.achievements.checkAchievements();
            }
            
            this.initialized = true;
            this.hideLoading();
            console.log('✅ Enhanced vocabulary system initialized successfully');
            
            // Show welcome message for new users
            if (Object.keys(this.userProgress).length === 0) {
                this.showWelcomeMessage();
            }
        } catch (error) {
            console.error('❌ Failed to initialize vocabulary system:', error);
            this.showError('Failed to load vocabulary. Please refresh the page.');
        }
    }

    /**
     * Load vocabulary data with caching
     */
    async loadVocabularyData() {
        const cacheKey = 'vocabulary_data';
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
            this.vocabularyData = cached;
            this.filteredData = [...cached];
            console.log(`📚 Loaded ${this.vocabularyData.length} vocabulary terms from cache`);
            return;
        }
        
        try {
            const response = await fetch('/api/vocabulary');
            if (!response.ok) throw new Error('Failed to fetch vocabulary');
            
            const data = await response.json();
            this.vocabularyData = data;
            this.filteredData = [...data];
            
            // Cache the data
            this.setCache(cacheKey, data);
            
            console.log(`📚 Loaded ${this.vocabularyData.length} vocabulary terms from API`);
        } catch (error) {
            console.warn('Using fallback vocabulary data:', error);
            this.vocabularyData = this.getFallbackVocabulary();
            this.filteredData = [...this.vocabularyData];
        }
    }

    /**
     * Load categories from API
     */
    async loadCategories() {
        try {
            const response = await fetch('/api/vocabulary/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            
            this.categories = await response.json();
        } catch (error) {
            console.warn('Using fallback categories:', error);
            this.categories = this.extractCategories();
        }
    }

    /**
     * Extract categories from vocabulary data
     */
    extractCategories() {
        const categories = new Set();
        this.vocabularyData.forEach(term => {
            categories.add(term.category || 'Uncategorized');
        });
        return Array.from(categories).sort();
    }

    /**
     * Get fallback vocabulary data
     */
    getFallbackVocabulary() {
        return [
            {
                id: 'variable',
                term: 'Variable',
                definition: 'A named storage location that holds a value that can be modified during program execution.',
                example: 'x = 10\nname = "Python"',
                category: 'Basics',
                difficulty: 'beginner',
                tags: ['storage', 'data', 'assignment']
            },
            {
                id: 'function',
                term: 'Function',
                definition: 'A reusable block of code that performs a specific task and can accept inputs (parameters) and return outputs.',
                example: 'def greet(name):\n    return f"Hello, {name}!"',
                category: 'Basics',
                difficulty: 'beginner',
                tags: ['reusable', 'parameters', 'return']
            },
            {
                id: 'list',
                term: 'List',
                definition: 'An ordered collection of items that can be modified. Lists are mutable and can contain different data types.',
                example: 'fruits = ["apple", "banana", "orange"]\nfruits.append("grape")',
                category: 'Data Structures',
                difficulty: 'beginner',
                tags: ['collection', 'ordered', 'mutable']
            },
            {
                id: 'dictionary',
                term: 'Dictionary',
                definition: 'A collection of key-value pairs where each key is unique. Dictionaries are mutable and unordered.',
                example: 'student = {"name": "Alice", "age": 20, "grade": "A"}\nprint(student["name"])',
                category: 'Data Structures',
                difficulty: 'beginner',
                tags: ['key-value', 'mutable', 'mapping']
            },
            {
                id: 'loop',
                term: 'Loop',
                definition: 'A control structure that repeats a block of code multiple times.',
                example: 'for i in range(5):\n    print(i)',
                category: 'Control Flow',
                difficulty: 'beginner',
                tags: ['iteration', 'repeat', 'control']
            }
        ];
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('vocab-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerms(e.target.value);
            });
        }

        // Category filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-filter')) {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.filterByCategory(category);
            }
        });

        // Mode switchers
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });

        // Flashcard navigation
        document.addEventListener('click', (e) => {
            if (e.target.id === 'prev-flashcard' || e.target.closest('#prev-flashcard')) {
                this.prevCard();
            }
            if (e.target.id === 'next-flashcard' || e.target.closest('#next-flashcard')) {
                this.nextCard();
            }
        });

        // Flashcard flip
        document.addEventListener('click', (e) => {
            if (e.target.closest('.flashcard')) {
                this.flipCard();
            }
        });

        // Difficulty tracking
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const difficulty = e.target.dataset.action;
                this.trackDifficulty(difficulty);
            });
        });

        // Quiz functionality
        document.addEventListener('click', (e) => {
            if (e.target.id === 'quiz-submit') {
                this.submitQuizAnswer();
            }
            if (e.target.id === 'quiz-next') {
                this.nextQuizQuestion();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isVocabularyTabActive()) {
                this.handleKeyboardShortcuts(e);
            }
        });
    }

    /**
     * Check if vocabulary tab is active
     */
    isVocabularyTabActive() {
        const vocabTab = document.getElementById('vocabulary-tab');
        return vocabTab && vocabTab.classList.contains('active');
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        switch (e.key) {
            case 'ArrowLeft':
                if (this.currentMode === 'flashcards') {
                    e.preventDefault();
                    this.prevCard();
                }
                break;
            case 'ArrowRight':
                if (this.currentMode === 'flashcards') {
                    e.preventDefault();
                    this.nextCard();
                }
                break;
            case ' ':
                if (this.currentMode === 'flashcards') {
                    e.preventDefault();
                    this.flipCard();
                }
                break;
            case 'r':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.shuffleCards();
                }
                break;
        }
    }

    /**
     * Search terms
     */
    searchTerms(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.applyFilters();
    }

    /**
     * Filter by category
     */
    filterByCategory(category) {
        this.currentCategory = category;
        
        // Update active category button
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.applyFilters();
    }

    /**
     * Apply all filters
     */
    applyFilters() {
        let filtered = [...this.vocabularyData];

        // Apply category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(term => term.category === this.currentCategory);
        }

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(term => 
                term.term.toLowerCase().includes(this.searchQuery) ||
                term.definition.toLowerCase().includes(this.searchQuery) ||
                term.category.toLowerCase().includes(this.searchQuery) ||
                (term.tags && term.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)))
            );
        }

        this.filteredData = filtered;
        this.currentCardIndex = 0;
        this.updateCurrentMode();
    }

    /**
     * Switch between modes
     */
    switchMode(mode) {
        this.currentMode = mode;
        
        // Update active mode button
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Show/hide mode containers
        document.querySelectorAll('.vocabulary-mode').forEach(container => {
            container.classList.remove('active');
        });
        document.getElementById(`${mode}-mode`).classList.add('active');
        
        this.updateCurrentMode();
    }

    /**
     * Update current mode display
     */
    updateCurrentMode() {
        switch (this.currentMode) {
            case 'flashcards':
                this.updateFlashcards();
                break;
            case 'list':
                this.updateList();
                break;
            case 'quiz':
                this.startQuiz();
                break;
        }
    }

    /**
     * Update flashcards display
     */
    updateFlashcards() {
        if (this.filteredData.length === 0) {
            this.showNoTermsMessage();
            return;
        }

        const currentTerm = this.filteredData[this.currentCardIndex];
        
        // Update card content
        document.querySelector('.card-term').textContent = currentTerm.term;
        document.querySelector('.card-definition').textContent = currentTerm.definition;
        document.querySelector('.card-category').textContent = currentTerm.category;
        document.querySelector('.card-difficulty').textContent = currentTerm.difficulty || 'beginner';
        
        // Update example
        if (currentTerm.example) {
            document.querySelector('.card-example-code').textContent = currentTerm.example;
            document.querySelector('.card-example').style.display = 'block';
        } else {
            document.querySelector('.card-example').style.display = 'none';
        }
        
        // Update tags
        if (currentTerm.tags && currentTerm.tags.length > 0) {
            const tagsHtml = currentTerm.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            document.querySelector('.card-tags').innerHTML = tagsHtml;
        } else {
            document.querySelector('.card-tags').innerHTML = '';
        }
        
        // Update counter
        document.getElementById('current-card').textContent = this.currentCardIndex + 1;
        document.getElementById('total-cards').textContent = this.filteredData.length;
        
        // Reset flip state
        this.isFlipped = false;
        document.getElementById('vocabulary-flashcard').classList.remove('flipped');
    }

    /**
     * Update list display
     */
    updateList() {
        const listContainer = document.querySelector('.vocabulary-list');
        
        if (this.filteredData.length === 0) {
            listContainer.innerHTML = '<div class="no-terms">No terms found matching your criteria.</div>';
            return;
        }

        const listHtml = this.filteredData.map(term => `
            <div class="term-card">
                <div class="term-header">
                    <h4>${term.term}</h4>
                    <span class="term-category">${term.category}</span>
                </div>
                <div class="term-definition">
                    <p>${term.definition}</p>
                </div>
                ${term.example ? `
                    <div class="term-example">
                        <h6>Example:</h6>
                        <pre><code class="language-python">${term.example}</code></pre>
                    </div>
                ` : ''}
                ${term.tags ? `
                    <div class="term-tags">
                        ${term.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        listContainer.innerHTML = listHtml;
        
        // Highlight code blocks
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }

    /**
     * Start quiz mode
     */
    startQuiz() {
        if (this.filteredData.length < 4) {
            this.showError('Need at least 4 terms to start a quiz.');
            return;
        }

        this.quizData.questions = this.generateQuizQuestions();
        this.quizData.currentQuestion = 0;
        this.quizData.score = 0;
        this.quizData.answers = [];
        
        this.showQuizQuestion();
    }

    /**
     * Generate quiz questions
     */
    generateQuizQuestions() {
        const questions = [];
        const maxQuestions = Math.min(10, this.filteredData.length);
        const shuffled = [...this.filteredData].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < maxQuestions; i++) {
            const correctTerm = shuffled[i];
            const otherTerms = shuffled.filter(t => t.id !== correctTerm.id);
            const wrongAnswers = otherTerms.sort(() => Math.random() - 0.5).slice(0, 3);
            
            const options = [correctTerm, ...wrongAnswers].sort(() => Math.random() - 0.5);
            
            questions.push({
                question: `What is the definition of "${correctTerm.term}"?`,
                options: options.map(term => term.definition),
                correct: correctTerm.definition,
                term: correctTerm.term
            });
        }
        
        return questions;
    }

    /**
     * Show quiz question
     */
    showQuizQuestion() {
        const question = this.quizData.questions[this.quizData.currentQuestion];
        
        document.getElementById('quiz-question-text').textContent = question.question;
        document.getElementById('quiz-current').textContent = this.quizData.currentQuestion + 1;
        document.getElementById('quiz-total').textContent = this.quizData.questions.length;
        
        // Update progress bar
        const progress = ((this.quizData.currentQuestion + 1) / this.quizData.questions.length) * 100;
        document.getElementById('quiz-progress-bar').style.width = `${progress}%`;
        
        // Create options
        const optionsHtml = question.options.map((option, index) => `
            <div class="quiz-option">
                <input type="radio" name="quiz-answer" value="${index}" id="option-${index}">
                <label for="option-${index}">${option}</label>
            </div>
        `).join('');
        
        document.querySelector('.quiz-options').innerHTML = optionsHtml;
        
        // Show submit button, hide next button
        document.getElementById('quiz-submit').style.display = 'block';
        document.getElementById('quiz-next').style.display = 'none';
    }

    /**
     * Submit quiz answer
     */
    submitQuizAnswer() {
        const selectedAnswer = document.querySelector('input[name="quiz-answer"]:checked');
        if (!selectedAnswer) {
            this.showNotification('Please select an answer.', 'warning');
            return;
        }

        const question = this.quizData.questions[this.quizData.currentQuestion];
        const answerIndex = parseInt(selectedAnswer.value);
        const selectedDefinition = question.options[answerIndex];
        const isCorrect = selectedDefinition === question.correct;
        
        // Record answer
        this.quizData.answers.push({
            question: question.question,
            selected: selectedDefinition,
            correct: question.correct,
            isCorrect: isCorrect
        });
        
        if (isCorrect) {
            this.quizData.score++;
        }
        
        // Show feedback
        this.showQuizFeedback(isCorrect, question.correct);
        
        // Hide submit button, show next button
        document.getElementById('quiz-submit').style.display = 'none';
        document.getElementById('quiz-next').style.display = 'block';
    }

    /**
     * Show quiz feedback
     */
    showQuizFeedback(isCorrect, correctAnswer) {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => {
            const input = option.querySelector('input');
            const label = option.querySelector('label');
            
            if (input.checked) {
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            
            if (label.textContent === correctAnswer) {
                option.classList.add('correct-answer');
            }
        });
    }

    /**
     * Next quiz question
     */
    nextQuizQuestion() {
        if (this.quizData.currentQuestion < this.quizData.questions.length - 1) {
            this.quizData.currentQuestion++;
            this.showQuizQuestion();
        } else {
            this.showQuizResults();
        }
    }

    /**
     * Show quiz results
     */
    showQuizResults() {
        const percentage = Math.round((this.quizData.score / this.quizData.questions.length) * 100);
        
        document.querySelector('.quiz-header').innerHTML = `
            <h4>Quiz Complete!</h4>
            <div class="quiz-results">
                <div class="score-display">
                    <div class="score">${this.quizData.score}/${this.quizData.questions.length}</div>
                    <div class="percentage">${percentage}%</div>
                </div>
                <button class="btn btn-primary" onclick="vocabularyManager.startQuiz()">Take Quiz Again</button>
            </div>
        `;
        
        document.querySelector('.quiz-question').style.display = 'none';
        document.querySelector('.quiz-actions').style.display = 'none';
    }

    /**
     * Navigation methods
     */
    nextCard() {
        if (this.currentCardIndex < this.filteredData.length - 1) {
            this.currentCardIndex++;
        } else {
            this.currentCardIndex = 0;
        }
        this.updateFlashcards();
    }

    prevCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
        } else {
            this.currentCardIndex = this.filteredData.length - 1;
        }
        this.updateFlashcards();
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        const flashcard = document.getElementById('vocabulary-flashcard');
        flashcard.classList.toggle('flipped', this.isFlipped);
    }

    /**
     * Shuffle cards
     */
    shuffleCards() {
        this.filteredData = this.filteredData.sort(() => Math.random() - 0.5);
        this.currentCardIndex = 0;
        this.updateFlashcards();
        this.showNotification('Cards shuffled!', 'success');
    }

    /**
     * Load user settings from localStorage
     */
    async loadUserSettings() {
        try {
            const stored = localStorage.getItem('vocabulary_settings');
            if (stored) {
                this.studySettings = { ...this.studySettings, ...JSON.parse(stored) };
            }
        } catch (error) {
            console.error('Error loading user settings:', error);
        }
    }

    /**
     * Save user settings to localStorage
     */
    saveUserSettings() {
        try {
            localStorage.setItem('vocabulary_settings', JSON.stringify(this.studySettings));
        } catch (error) {
            console.error('Error saving user settings:', error);
        }
    }

    /**
     * Cache management
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * Spaced repetition algorithm
     */
    calculateNextReview(termId, difficulty) {
        const progress = this.userProgress[termId] || {
            easeFactor: 2.5,
            interval: 1,
            repetitions: 0,
            nextReview: Date.now()
        };

        let quality;
        switch (difficulty) {
            case 'easy': quality = 5; break;
            case 'medium': quality = 3; break;
            case 'hard': quality = 1; break;
            default: quality = 3;
        }

        if (quality < 3) {
            progress.repetitions = 0;
            progress.interval = 1;
        } else {
            if (progress.repetitions === 0) {
                progress.interval = 1;
            } else if (progress.repetitions === 1) {
                progress.interval = 6;
            } else {
                progress.interval = Math.round(progress.interval * progress.easeFactor);
            }
            progress.repetitions++;
        }

        progress.easeFactor = Math.max(1.3, 
            progress.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        );

        progress.nextReview = Date.now() + (progress.interval * 24 * 60 * 60 * 1000);
        
        return progress;
    }

    /**
     * Get terms due for review based on spaced repetition
     */
    getTermsDueForReview() {
        if (!this.studySettings.spacedRepetition) {
            return this.filteredData;
        }

        const now = Date.now();
        return this.filteredData.filter(term => {
            const progress = this.userProgress[term.id];
            return !progress || progress.nextReview <= now;
        });
    }

    /**
     * Setup performance tracking
     */
    setupPerformanceTracking() {
        // Track page visibility for accurate time calculation
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pausePerformanceTracking();
            } else {
                this.resumePerformanceTracking();
            }
        });

        // Track before page unload
        window.addEventListener('beforeunload', () => {
            this.savePerformanceMetrics();
        });
    }

    pausePerformanceTracking() {
        if (this.performanceMetrics.sessionStartTime) {
            this.performanceMetrics.totalTime += Date.now() - this.performanceMetrics.sessionStartTime;
            this.performanceMetrics.sessionStartTime = null;
        }
    }

    resumePerformanceTracking() {
        this.performanceMetrics.sessionStartTime = Date.now();
    }

    savePerformanceMetrics() {
        if (this.performanceMetrics.sessionStartTime) {
            this.performanceMetrics.totalTime += Date.now() - this.performanceMetrics.sessionStartTime;
        }

        try {
            const metrics = {
                ...this.performanceMetrics,
                date: new Date().toISOString().split('T')[0],
                accuracy: this.performanceMetrics.cardsStudied > 0 
                    ? (this.performanceMetrics.correctAnswers / this.performanceMetrics.cardsStudied * 100).toFixed(1)
                    : 0
            };
            
            const existingMetrics = JSON.parse(localStorage.getItem('vocabulary_metrics') || '[]');
            existingMetrics.push(metrics);
            
            // Keep only last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const filteredMetrics = existingMetrics.filter(m => new Date(m.date) > thirtyDaysAgo);
            
            localStorage.setItem('vocabulary_metrics', JSON.stringify(filteredMetrics));
        } catch (error) {
            console.error('Error saving performance metrics:', error);
        }
    }

    /**
     * Check and update daily study streak
     */
    checkDailyStreak() {
        const today = new Date().toISOString().split('T')[0];
        const lastStudyDate = localStorage.getItem('vocabulary_last_study_date');
        
        if (lastStudyDate) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (lastStudyDate === yesterdayStr) {
                // Streak continues
                this.studySettings.studyStreak = (this.studySettings.studyStreak || 0) + 1;
            } else if (lastStudyDate !== today) {
                // Streak broken
                this.studySettings.studyStreak = 0;
            }
        }
        
        localStorage.setItem('vocabulary_last_study_date', today);
        this.saveUserSettings();
    }

    /**
     * Enhanced track difficulty with spaced repetition
     */
    trackDifficulty(difficulty) {
        const currentTerm = this.filteredData[this.currentCardIndex];
        if (!currentTerm) return;
        
        // Update performance metrics
        this.performanceMetrics.cardsStudied++;
        if (difficulty === 'easy') {
            this.performanceMetrics.correctAnswers++;
        }
        
        // Calculate next review using spaced repetition
        this.userProgress[currentTerm.id] = this.calculateNextReview(currentTerm.id, difficulty);
        
        // Update user progress
        if (!this.userProgress[currentTerm.id].attempts) {
            this.userProgress[currentTerm.id].attempts = 0;
            this.userProgress[currentTerm.id].correct = 0;
            this.userProgress[currentTerm.id].difficulty = [];
        }
        
        this.userProgress[currentTerm.id].attempts++;
        this.userProgress[currentTerm.id].difficulty.push(difficulty);
        
        if (difficulty === 'easy') {
            this.userProgress[currentTerm.id].correct++;
        }
        
        this.saveUserProgress();
        
        // Show feedback
        this.showDifficultyFeedback(difficulty);
        
        // Auto-advance if enabled
        if (this.studySettings.autoAdvance) {
            setTimeout(() => {
                this.nextCard();
            }, 1000);
        } else {
            this.nextCard();
        }
    }

    /**
     * Show difficulty feedback
     */
    showDifficultyFeedback(difficulty) {
        const messages = {
            easy: 'Great! 🎉 This term will appear less frequently.',
            medium: 'Good work! 👍 This term will appear again soon.',
            hard: 'Keep practicing! 💪 This term will appear more frequently.'
        };
        
        this.showNotification(messages[difficulty] || messages.medium, 'success');
    }

    /**
     * Show welcome message for new users
     */
    showWelcomeMessage() {
        const welcomeHtml = `
            <div class="welcome-overlay">
                <div class="welcome-modal">
                    <div class="welcome-header">
                        <h3>Welcome to Python Vocabulary! 🐍</h3>
                        <button class="close-welcome">&times;</button>
                    </div>
                    <div class="welcome-content">
                        <p>Ready to master Python programming terms? Here's how to get started:</p>
                        <ul>
                            <li><strong>Flashcards:</strong> Click cards to flip, use arrow keys to navigate</li>
                            <li><strong>Difficulty Tracking:</strong> Mark terms as Easy/Medium/Hard for personalized learning</li>
                            <li><strong>Categories:</strong> Filter by topic areas like "Basics" or "Data Structures"</li>
                            <li><strong>Search:</strong> Find specific terms quickly</li>
                            <li><strong>Quiz Mode:</strong> Test your knowledge with multiple choice questions</li>
                        </ul>
                        <div class="welcome-tips">
                            <h4>💡 Pro Tips:</h4>
                            <ul>
                                <li>Use <kbd>Space</kbd> to flip cards</li>
                                <li>Use <kbd>←</kbd> and <kbd>→</kbd> arrow keys to navigate</li>
                                <li>Press <kbd>Ctrl+R</kbd> to shuffle cards</li>
                                <li>Study consistently to build your streak! 🔥</li>
                            </ul>
                        </div>
                        <button class="btn btn-primary start-learning">Start Learning!</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', welcomeHtml);
        
        // Add event listeners
        document.querySelector('.close-welcome').addEventListener('click', this.closeWelcomeMessage);
        document.querySelector('.start-learning').addEventListener('click', this.closeWelcomeMessage);
        document.querySelector('.welcome-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('welcome-overlay')) {
                this.closeWelcomeMessage();
            }
        });
    }

    closeWelcomeMessage() {
        const overlay = document.querySelector('.welcome-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Enhanced update stats with streak and performance data
     */
    updateStats() {
        const totalTerms = this.vocabularyData.length;
        const masteredTerms = Object.keys(this.userProgress).filter(termId => {
            const progress = this.userProgress[termId];
            return progress.attempts > 0 && (progress.correct / progress.attempts) >= 0.8;
        }).length;
        
        // Update basic stats
        document.getElementById('total-count').textContent = totalTerms;
        document.getElementById('mastered-count').textContent = masteredTerms;
        
        const progressPercentage = totalTerms > 0 ? (masteredTerms / totalTerms) * 100 : 0;
        document.getElementById('progress-bar').style.width = `${progressPercentage}%`;
        
        // Update difficulty breakdown
        const difficultyBreakdown = this.vocabularyData.reduce((acc, term) => {
            const difficulty = term.difficulty || 'beginner';
            acc[difficulty] = (acc[difficulty] || 0) + 1;
            return acc;
        }, {});
        
        document.getElementById('beginner-count').textContent = difficultyBreakdown.beginner || 0;
        document.getElementById('intermediate-count').textContent = difficultyBreakdown.intermediate || 0;
        document.getElementById('advanced-count').textContent = difficultyBreakdown.advanced || 0;
        
        // Update streak display
        const streakElement = document.getElementById('study-streak');
        if (streakElement) {
            streakElement.textContent = this.studySettings.studyStreak || 0;
        }
        
        // Update total count in "All Terms" button
        const allTermsButton = document.querySelector('[data-category="all"] .category-count');
        if (allTermsButton) {
            allTermsButton.textContent = totalTerms;
        }
        
        // Update due for review count if spaced repetition is enabled
        if (this.studySettings.spacedRepetition) {
            const dueTerms = this.getTermsDueForReview().length;
            const dueElement = document.getElementById('due-for-review');
            if (dueElement) {
                dueElement.textContent = dueTerms;
            }
        }
    }

    /**
     * User progress methods
     */
    loadUserProgress() {
        try {
            const stored = localStorage.getItem('vocabulary_progress');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading user progress:', error);
            return {};
        }
    }

    saveUserProgress() {
        try {
            localStorage.setItem('vocabulary_progress', JSON.stringify(this.userProgress));
        } catch (error) {
            console.error('Error saving user progress:', error);
        }
    }

    /**
     * UI feedback methods
     */
    showLoading() {
        this.isLoading = true;
        const vocabTab = document.getElementById('vocabulary-tab');
        vocabTab.innerHTML = `
            <div class="vocabulary-loading">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading vocabulary terms...</p>
            </div>
        `;
    }

    hideLoading() {
        this.isLoading = false;
    }

    showError(message) {
        const vocabTab = document.getElementById('vocabulary-tab');
        vocabTab.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>Error:</strong> ${message}
            </div>
        `;
    }

    showNoTermsMessage() {
        const flashcardContainer = document.querySelector('.flashcard-container');
        flashcardContainer.innerHTML = `
            <div class="no-terms">
                <i class="fas fa-search"></i>
                <h4>No terms found</h4>
                <p>Try adjusting your search or category filter.</p>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} vocabulary-notification`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation' : 'info'}-circle"></i>
            ${message}
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1050;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Create and initialize vocabulary manager
const vocabularyManager = new VocabularyManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with the vocabulary tab
    if (document.getElementById('vocabulary-tab')) {
        vocabularyManager.init();
    }
});

// Make available globally
window.vocabularyManager = vocabularyManager;
window.VocabularyManager = VocabularyManager;
