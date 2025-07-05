/**
 * Enhanced Vocabulary System - Complete Implementation
 * Handles flashcards, list view, quiz mode, and vocabulary management
 */

class VocabularyManager {
    constructor() {
        this.vocabularyData = [];
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
    }

    /**
     * Initialize the vocabulary system
     */
    async init() {
        if (this.initialized) return;
        
        console.log('🎯 Initializing Vocabulary System');
        
        try {
            await this.loadVocabularyData();
            await this.loadCategories();
            this.setupEventListeners();
            this.renderCategories();
            this.switchMode('flashcards');
            this.updateStats();
            
            this.initialized = true;
            console.log('✅ Vocabulary system initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize vocabulary system:', error);
            this.showError('Failed to load vocabulary. Please refresh the page.');
        }
    }

    /**
     * Load vocabulary data from API
     */
    async loadVocabularyData() {
        try {
            const response = await fetch('/api/vocabulary');
            if (!response.ok) throw new Error('Failed to fetch vocabulary');
            
            const data = await response.json();
            this.vocabularyData = data;
            
            console.log(`📚 Loaded ${this.vocabularyData.length} vocabulary terms`);
        } catch (error) {
            console.warn('Using fallback vocabulary data:', error);
            this.vocabularyData = this.getFallbackVocabulary();
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
                example: 'x = 10\\nname = \"Python\"',
                category: 'Basics',
                difficulty: 'beginner',
                tags: ['storage', 'data', 'assignment']
            },
            {
                id: 'function',
                term: 'Function',
                definition: 'A reusable block of code that performs a specific task and can accept inputs (parameters) and return outputs.',
                example: 'def greet(name):\\n    return f\"Hello, {name}!\"',
                category: 'Basics',
                difficulty: 'beginner',
                tags: ['reusable', 'parameters', 'return']
            },
            {
                id: 'list',
                term: 'List',
                definition: 'An ordered collection of items that can be modified. Lists are mutable and can contain different data types.',
                example: 'fruits = [\"apple\", \"banana\", \"orange\"]\\nfruits.append(\"grape\")',
                category: 'Data Structures',
                difficulty: 'beginner',
                tags: ['collection', 'ordered', 'mutable']
            },
            {
                id: 'dictionary',
                term: 'Dictionary',
                definition: 'A collection of key-value pairs where each key is unique and maps to a value.',
                example: 'person = {\"name\": \"Alice\", \"age\": 30}\\nprint(person[\"name\"])',
                category: 'Data Structures',
                difficulty: 'beginner',
                tags: ['key-value', 'mapping', 'unique']
            }
        ];
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.closest('.mode-btn').dataset.mode;
                this.switchMode(mode);
            });
        });

        // Category filtering
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-filter')) {
                const category = e.target.closest('.category-filter').dataset.category;
                this.filterByCategory(category);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('vocab-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.filterTerms();
            });
        }

        // Flashcard navigation
        document.getElementById('prev-flashcard')?.addEventListener('click', () => this.previousCard());
        document.getElementById('next-flashcard')?.addEventListener('click', () => this.nextCard());

        // Flashcard flip
        document.getElementById('vocabulary-flashcard')?.addEventListener('click', () => this.flipCard());

        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.closest('.difficulty-btn').dataset.action;
                this.recordDifficulty(difficulty);
            });
        });

        // Quiz functionality
        document.getElementById('quiz-submit')?.addEventListener('click', () => this.submitQuizAnswer());
        document.getElementById('quiz-next')?.addEventListener('click', () => this.nextQuizQuestion());
    }

    /**
     * Switch between different modes
     */
    switchMode(mode) {
        this.currentMode = mode;
        
        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');

        // Update mode displays
        document.querySelectorAll('.vocabulary-mode').forEach(modeDiv => {
            modeDiv.classList.remove('active');
        });
        document.getElementById(`${mode}-mode`)?.classList.add('active');

        // Initialize mode-specific content
        switch (mode) {
            case 'flashcards':
                this.initializeFlashcards();
                break;
            case 'list':
                this.initializeList();
                break;
            case 'quiz':
                this.initializeQuiz();
                break;
        }
    }

    /**
     * Initialize flashcard mode
     */
    initializeFlashcards() {
        const filteredTerms = this.getFilteredTerms();
        if (filteredTerms.length === 0) {
            this.showNoTermsMessage();
            return;
        }

        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.updateFlashcard();
        this.updateCardCounter();
    }

    /**
     * Update flashcard display
     */
    updateFlashcard() {
        const filteredTerms = this.getFilteredTerms();
        if (filteredTerms.length === 0) return;

        const term = filteredTerms[this.currentCardIndex];
        const flashcard = document.getElementById('vocabulary-flashcard');
        
        if (!flashcard) return;

        // Update front side
        flashcard.querySelector('.card-category').textContent = term.category || 'Uncategorized';
        flashcard.querySelector('.card-term').textContent = term.term;
        flashcard.querySelector('.card-difficulty').textContent = term.difficulty || 'beginner';

        // Update back side
        flashcard.querySelector('.card-definition').textContent = term.definition;
        flashcard.querySelector('.card-example-code').textContent = term.example?.replace(/\\n/g, '\\n') || '';
        
        // Update tags
        const tagsContainer = flashcard.querySelector('.card-tags');
        tagsContainer.innerHTML = '';
        if (term.tags && term.tags.length > 0) {
            term.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                tagsContainer.appendChild(tagSpan);
            });
        }

        // Reset flip state
        flashcard.classList.remove('flipped');
        this.isFlipped = false;
        
        // Highlight syntax if Prism is available
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }

    /**
     * Flip flashcard
     */
    flipCard() {
        const flashcard = document.getElementById('vocabulary-flashcard');
        if (!flashcard) return;

        this.isFlipped = !this.isFlipped;
        flashcard.classList.toggle('flipped', this.isFlipped);
    }

    /**
     * Navigate to previous card
     */
    previousCard() {
        const filteredTerms = this.getFilteredTerms();
        if (filteredTerms.length === 0) return;

        this.currentCardIndex = (this.currentCardIndex - 1 + filteredTerms.length) % filteredTerms.length;
        this.updateFlashcard();
        this.updateCardCounter();
    }

    /**
     * Navigate to next card
     */
    nextCard() {
        const filteredTerms = this.getFilteredTerms();
        if (filteredTerms.length === 0) return;

        this.currentCardIndex = (this.currentCardIndex + 1) % filteredTerms.length;
        this.updateFlashcard();
        this.updateCardCounter();
    }

    /**
     * Update card counter display
     */
    updateCardCounter() {
        const filteredTerms = this.getFilteredTerms();
        const currentCardSpan = document.getElementById('current-card');
        const totalCardsSpan = document.getElementById('total-cards');
        
        if (currentCardSpan) currentCardSpan.textContent = this.currentCardIndex + 1;
        if (totalCardsSpan) totalCardsSpan.textContent = filteredTerms.length;
    }

    /**
     * Initialize list mode
     */
    initializeList() {
        const listContainer = document.querySelector('.vocabulary-list');
        if (!listContainer) return;

        const filteredTerms = this.getFilteredTerms();
        
        if (filteredTerms.length === 0) {
            listContainer.innerHTML = '<p class="no-terms">No terms found matching your criteria.</p>';
            return;
        }

        listContainer.innerHTML = '';
        
        filteredTerms.forEach(term => {
            const termCard = document.createElement('div');
            termCard.className = 'term-card';
            termCard.innerHTML = `
                <div class="term-header">
                    <h4>${term.term}</h4>
                    <span class="term-category">${term.category || 'Uncategorized'}</span>
                </div>
                <div class="term-definition">
                    <p>${term.definition}</p>
                </div>
                <div class="term-example">
                    <h6>Example:</h6>
                    <pre><code class="language-python">${term.example?.replace(/\\n/g, '\\n') || ''}</code></pre>
                </div>
                <div class="term-tags">
                    ${term.tags ? term.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                </div>
            `;
            listContainer.appendChild(termCard);
        });
        
        // Highlight syntax if Prism is available
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }

    /**
     * Initialize quiz mode
     */
    initializeQuiz() {
        const filteredTerms = this.getFilteredTerms();
        if (filteredTerms.length < 4) {
            this.showError('Need at least 4 terms to start a quiz');
            return;
        }

        this.generateQuizQuestions(filteredTerms);
        this.quizData.currentQuestion = 0;
        this.quizData.score = 0;
        this.quizData.answers = [];
        
        this.updateQuizDisplay();
    }

    /**
     * Generate quiz questions
     */
    generateQuizQuestions(terms) {
        const questions = [];
        const maxQuestions = Math.min(10, terms.length);
        
        // Shuffle terms
        const shuffled = [...terms].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < maxQuestions; i++) {
            const correctTerm = shuffled[i];
            const wrongTerms = shuffled.filter(t => t.id !== correctTerm.id).slice(0, 3);
            
            const options = [...wrongTerms, correctTerm].sort(() => 0.5 - Math.random());
            
            questions.push({
                question: `What is the definition of "${correctTerm.term}"?`,
                options: options.map(term => ({
                    text: term.definition,
                    correct: term.id === correctTerm.id
                })),
                correctAnswer: correctTerm.definition
            });
        }
        
        this.quizData.questions = questions;
    }

    /**
     * Update quiz display
     */
    updateQuizDisplay() {
        const question = this.quizData.questions[this.quizData.currentQuestion];
        if (!question) return;

        document.getElementById('quiz-question-text').textContent = question.question;
        document.getElementById('quiz-current').textContent = this.quizData.currentQuestion + 1;
        document.getElementById('quiz-total').textContent = this.quizData.questions.length;

        const progressBar = document.getElementById('quiz-progress-bar');
        const progressPercent = ((this.quizData.currentQuestion + 1) / this.quizData.questions.length) * 100;
        progressBar.style.width = `${progressPercent}%`;

        const optionsContainer = document.querySelector('.quiz-options');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'quiz-option';
            optionDiv.innerHTML = `
                <input type="radio" name="quiz-answer" value="${index}" id="option-${index}">
                <label for="option-${index}">${option.text}</label>
            `;
            optionsContainer.appendChild(optionDiv);
        });

        document.getElementById('quiz-submit').style.display = 'block';
        document.getElementById('quiz-next').style.display = 'none';
    }

    /**
     * Submit quiz answer
     */
    submitQuizAnswer() {
        const selectedOption = document.querySelector('input[name="quiz-answer"]:checked');
        if (!selectedOption) {
            this.showError('Please select an answer');
            return;
        }

        const selectedIndex = parseInt(selectedOption.value);
        const question = this.quizData.questions[this.quizData.currentQuestion];
        const isCorrect = question.options[selectedIndex].correct;

        if (isCorrect) {
            this.quizData.score++;
            selectedOption.parentElement.classList.add('correct');
        } else {
            selectedOption.parentElement.classList.add('incorrect');
            // Highlight correct answer
            const correctIndex = question.options.findIndex(opt => opt.correct);
            document.getElementById(`option-${correctIndex}`).parentElement.classList.add('correct');
        }

        this.quizData.answers.push({
            question: this.quizData.currentQuestion,
            selected: selectedIndex,
            correct: isCorrect
        });

        document.getElementById('quiz-submit').style.display = 'none';
        
        if (this.quizData.currentQuestion < this.quizData.questions.length - 1) {
            document.getElementById('quiz-next').style.display = 'block';
        } else {
            this.showQuizResults();
        }
    }

    /**
     * Next quiz question
     */
    nextQuizQuestion() {
        this.quizData.currentQuestion++;
        this.updateQuizDisplay();
    }

    /**
     * Show quiz results
     */
    showQuizResults() {
        const percentage = Math.round((this.quizData.score / this.quizData.questions.length) * 100);
        
        const resultHtml = `
            <div class="quiz-results">
                <h3>Quiz Complete!</h3>
                <div class="score-display">
                    <span class="score">${this.quizData.score}/${this.quizData.questions.length}</span>
                    <span class="percentage">${percentage}%</span>
                </div>
                <button class="btn btn-primary" onclick="vocabularyManager.initializeQuiz()">Try Again</button>
            </div>
        `;
        
        document.querySelector('.quiz-question').innerHTML = resultHtml;
        document.querySelector('.quiz-actions').style.display = 'none';
    }

    /**
     * Filter by category
     */
    filterByCategory(category) {
        this.currentCategory = category;
        
        // Update category buttons
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');

        this.filterTerms();
    }

    /**
     * Filter terms based on category and search
     */
    filterTerms() {
        if (this.currentMode === 'flashcards') {
            this.currentCardIndex = 0;
            this.updateFlashcard();
            this.updateCardCounter();
        } else if (this.currentMode === 'list') {
            this.initializeList();
        }
    }

    /**
     * Get filtered terms
     */
    getFilteredTerms() {
        let filtered = this.vocabularyData;

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(term => term.category === this.currentCategory);
        }

        // Filter by search query
        if (this.searchQuery) {
            filtered = filtered.filter(term => 
                term.term.toLowerCase().includes(this.searchQuery) ||
                term.definition.toLowerCase().includes(this.searchQuery) ||
                (term.tags && term.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)))
            );
        }

        return filtered;
    }

    /**
     * Render categories
     */
    renderCategories() {
        const container = document.querySelector('.category-filters');
        if (!container) return;

        // Clear existing categories (except 'All')
        const allButton = container.querySelector('[data-category="all"]');
        container.innerHTML = '';
        if (allButton) container.appendChild(allButton);

        // Add categories
        this.categories.forEach(category => {
            const count = this.vocabularyData.filter(term => term.category === category).length;
            
            const button = document.createElement('button');
            button.className = 'category-filter';
            button.dataset.category = category;
            button.innerHTML = `
                <span>${category}</span>
                <span class="category-count">${count}</span>
            `;
            container.appendChild(button);
        });

        // Update 'All' count
        if (allButton) {
            allButton.querySelector('.category-count').textContent = this.vocabularyData.length;
        }
    }

    /**
     * Update statistics
     */
    updateStats() {
        const totalCount = this.vocabularyData.length;
        const beginnerCount = this.vocabularyData.filter(term => term.difficulty === 'beginner').length;
        const intermediateCount = this.vocabularyData.filter(term => term.difficulty === 'intermediate').length;
        const advancedCount = this.vocabularyData.filter(term => term.difficulty === 'advanced').length;

        document.getElementById('total-count').textContent = totalCount;
        document.getElementById('beginner-count').textContent = beginnerCount;
        document.getElementById('intermediate-count').textContent = intermediateCount;
        document.getElementById('advanced-count').textContent = advancedCount;

        // Update progress (placeholder - would connect to user progress)
        const mastered = this.getUserMasteredCount();
        document.getElementById('mastered-count').textContent = mastered;
        
        const progressPercent = totalCount > 0 ? (mastered / totalCount) * 100 : 0;
        document.getElementById('progress-bar').style.width = `${progressPercent}%`;
    }

    /**
     * Record difficulty for spaced repetition
     */
    recordDifficulty(difficulty) {
        const filteredTerms = this.getFilteredTerms();
        const currentTerm = filteredTerms[this.currentCardIndex];
        
        if (!currentTerm) return;

        // Update user progress
        if (!this.userProgress[currentTerm.id]) {
            this.userProgress[currentTerm.id] = {
                reviews: 0,
                lastReview: Date.now(),
                difficulty: 'new'
            };
        }

        this.userProgress[currentTerm.id].reviews++;
        this.userProgress[currentTerm.id].lastReview = Date.now();
        this.userProgress[currentTerm.id].difficulty = difficulty;

        this.saveUserProgress();
        this.nextCard();
    }

    /**
     * Load user progress from localStorage
     */
    loadUserProgress() {
        try {
            const saved = localStorage.getItem('vocabularyProgress');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading user progress:', error);
            return {};
        }
    }

    /**
     * Save user progress to localStorage
     */
    saveUserProgress() {
        try {
            localStorage.setItem('vocabularyProgress', JSON.stringify(this.userProgress));
        } catch (error) {
            console.error('Error saving user progress:', error);
        }
    }

    /**
     * Get user mastered count
     */
    getUserMasteredCount() {
        return Object.values(this.userProgress).filter(progress => 
            progress.reviews >= 3 && progress.difficulty === 'easy'
        ).length;
    }

    /**
     * Show error message
     */
    showError(message) {
        console.error(message);
        // Could implement a toast notification here
    }

    /**
     * Show no terms message
     */
    showNoTermsMessage() {
        const flashcardContainer = document.querySelector('.flashcard-container');
        if (flashcardContainer) {
            flashcardContainer.innerHTML = '<p class="no-terms">No terms found matching your criteria.</p>';
        }
    }
}

// Initialize vocabulary manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the vocabulary tab
    if (document.getElementById('vocabulary-tab')) {
        window.vocabularyManager = new VocabularyManager();
        
        // Initialize when the vocabulary tab is activated
        document.addEventListener('tabChanged', function(e) {
            if (e.detail.tabId === 'vocabulary') {
                window.vocabularyManager.init();
            }
        });
        
        // Initialize if vocabulary tab is already active
        if (document.getElementById('vocabulary-tab').classList.contains('active')) {
            window.vocabularyManager.init();
        }
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VocabularyManager;
}
