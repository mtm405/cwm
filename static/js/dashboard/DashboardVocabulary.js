/**
 * DashboardVocabulary.js
 * Manages the vocabulary display and flashcard functionality on the dashboard
 */

class DashboardVocabulary {
    constructor() {
        this.container = null;
        this.vocabularyData = [];
        this.currentMode = 'flashcards'; // 'flashcards', 'list', 'quiz'
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.initialized = false;
    }

    /**
     * Initialize the vocabulary manager
     */
    async init() {
        this.container = document.querySelector('#vocabulary-tab');
        
        if (!this.container) {
            console.error('Vocabulary container not found');
            return;
        }

        try {
            // Load vocabulary data
            await this.loadVocabularyData();
            
            // Render the vocabulary interface
            this.render();
            
            // Bind events
            this.bindEvents();
            
            this.initialized = true;
            console.log('Vocabulary initialized successfully');
        } catch (error) {
            console.error('Failed to initialize vocabulary:', error);
            this.showError('Failed to load vocabulary data');
        }
    }

    /**
     * Load vocabulary data from API
     */
    async loadVocabularyData() {
        try {
            // Try to fetch from API first
            const response = await fetch('/api/vocabulary/random?count=20');
            if (response.ok) {
                const data = await response.json();
                this.vocabularyData = data.terms || this.getFallbackVocabulary();
            } else {
                throw new Error('API not available');
            }
        } catch (error) {
            console.warn('Using fallback vocabulary data:', error);
            this.vocabularyData = this.getFallbackVocabulary();
        }
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
                category: 'basics',
                difficulty: 'beginner'
            },
            {
                id: 'function',
                term: 'Function',
                definition: 'A reusable block of code that performs a specific task and can accept inputs (parameters) and return outputs.',
                example: 'def greet(name):\n    return f"Hello, {name}!"',
                category: 'basics',
                difficulty: 'beginner'
            },
            {
                id: 'list',
                term: 'List',
                definition: 'An ordered collection of items that can be modified. Lists are mutable and can contain different data types.',
                example: 'fruits = ["apple", "banana", "orange"]\nfruits.append("grape")',
                category: 'data-structures',
                difficulty: 'beginner'
            },
            {
                id: 'dictionary',
                term: 'Dictionary',
                definition: 'A collection of key-value pairs where each key is unique and maps to a value.',
                example: 'person = {"name": "Alice", "age": 30}\nprint(person["name"])',
                category: 'data-structures',
                difficulty: 'beginner'
            },
            {
                id: 'loop',
                term: 'Loop',
                definition: 'A programming construct that repeats a block of code multiple times until a condition is met.',
                example: 'for i in range(5):\n    print(i)',
                category: 'control-flow',
                difficulty: 'beginner'
            },
            {
                id: 'conditional',
                term: 'Conditional Statement',
                definition: 'A programming construct that executes different code blocks based on whether a condition is true or false.',
                example: 'if age >= 18:\n    print("Adult")\nelse:\n    print("Minor")',
                category: 'control-flow',
                difficulty: 'beginner'
            },
            {
                id: 'class',
                term: 'Class',
                definition: 'A blueprint for creating objects that defines attributes and methods that the objects will have.',
                example: 'class Car:\n    def __init__(self, brand):\n        self.brand = brand',
                category: 'oop',
                difficulty: 'intermediate'
            },
            {
                id: 'inheritance',
                term: 'Inheritance',
                definition: 'A mechanism that allows a class to inherit attributes and methods from another class.',
                example: 'class ElectricCar(Car):\n    def __init__(self, brand, battery):\n        super().__init__(brand)\n        self.battery = battery',
                category: 'oop',
                difficulty: 'intermediate'
            },
            {
                id: 'exception',
                term: 'Exception',
                definition: 'An error that occurs during program execution that can be caught and handled to prevent program crashes.',
                example: 'try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")',
                category: 'error-handling',
                difficulty: 'intermediate'
            },
            {
                id: 'module',
                term: 'Module',
                definition: 'A file containing Python code that can be imported and used in other Python programs.',
                example: 'import math\nprint(math.pi)\n\nfrom datetime import datetime',
                category: 'modules',
                difficulty: 'intermediate'
            }
        ];
    }

    /**
     * Render the vocabulary interface
     */
    render() {
        // Update header stats
        this.updateHeaderStats();
        
        // Update sidebar stats
        this.updateSidebarStats();
        
        // Populate categories
        this.populateCategories();
        
        // Initialize with flashcards mode
        this.renderCurrentMode();
    }

    /**
     * Update header statistics
     */
    updateHeaderStats() {
        const totalTermsElement = document.getElementById('total-terms-header');
        const masteredElement = document.getElementById('mastered-header');
        const streakElement = document.getElementById('streak-header');
        
        if (totalTermsElement) totalTermsElement.textContent = this.vocabularyData.length;
        if (masteredElement) masteredElement.textContent = this.getMasteredCount();
        if (streakElement) streakElement.textContent = this.getStreak();
    }

    /**
     * Update sidebar statistics
     */
    updateSidebarStats() {
        const progress = this.getProgress();
        const totalCount = this.vocabularyData.length;
        const masteredCount = progress.mastered || 0;
        const learningCount = progress.learning || 0;
        const newCount = totalCount - masteredCount - learningCount;
        const progressPercentage = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
        
        // Update progress circle
        const progressCircle = document.getElementById('progress-circle');
        const progressText = document.getElementById('progress-percentage');
        if (progressCircle) {
            progressCircle.style.strokeDasharray = `${progressPercentage}, 100`;
        }
        if (progressText) {
            progressText.textContent = `${progressPercentage}%`;
        }
        
        // Update progress details
        const elements = {
            'mastered-count': masteredCount,
            'total-count': totalCount,
            'learning-count': learningCount,
            'new-count': newCount,
            'study-streak': this.getStreak(),
            'session-accuracy': '95%', // Placeholder
            'cards-studied': this.currentCardIndex + 1
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    /**
     * Populate category filters
     */
    populateCategories() {
        const categoryContainer = document.querySelector('.category-filters');
        if (!categoryContainer) return;
        
        const categories = this.getCategories();
        const categoryButtons = categories.map(category => {
            const count = this.vocabularyData.filter(term => term.category === category.id).length;
            return `
                <button class="category-filter-modern" data-category="${category.id}">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-name">${category.name}</span>
                    <span class="category-count">${count}</span>
                </button>
            `;
        }).join('');
        
        // Keep the "All Terms" button and add category-specific buttons
        const allButton = categoryContainer.querySelector('[data-category="all"]');
        if (allButton) {
            allButton.querySelector('.category-count').textContent = this.vocabularyData.length;
            allButton.insertAdjacentHTML('afterend', categoryButtons);
        }
    }

    /**
     * Get unique categories from vocabulary data
     */
    getCategories() {
        const categoryMap = {
            'basics': { name: 'Basics', icon: '📚' },
            'data-structures': { name: 'Data Structures', icon: '🏗️' },
            'control-flow': { name: 'Control Flow', icon: '🔄' },
            'oop': { name: 'OOP', icon: '🎯' },
            'error-handling': { name: 'Error Handling', icon: '⚠️' },
            'modules': { name: 'Modules', icon: '📦' },
            'functions': { name: 'Functions', icon: '⚙️' },
            'algorithms': { name: 'Algorithms', icon: '🧮' }
        };
        
        const uniqueCategories = [...new Set(this.vocabularyData.map(term => term.category))];
        return uniqueCategories.map(categoryId => ({
            id: categoryId,
            name: categoryMap[categoryId]?.name || categoryId,
            icon: categoryMap[categoryId]?.icon || '📖'
        }));
    }

    /**
     * Render content based on current mode
     */
    renderCurrentMode() {
        // Hide all modes
        const modes = document.querySelectorAll('.vocabulary-mode');
        modes.forEach(mode => mode.classList.remove('active'));
        
        // Show current mode
        const currentModeElement = document.getElementById(`${this.currentMode}-mode`);
        if (currentModeElement) {
            currentModeElement.classList.add('active');
        }
        
        // Render mode-specific content
        switch (this.currentMode) {
            case 'flashcards':
                this.renderFlashcards();
                break;
            case 'list':
                this.renderList();
                break;
            case 'quiz':
                this.renderQuiz();
                break;
            default:
                this.renderFlashcards();
        }
    }

    /**
     * Render flashcard mode
     */
    renderFlashcards() {
        if (this.vocabularyData.length === 0) {
            this.showNoDataMessage();
            return;
        }

        const currentTerm = this.vocabularyData[this.currentCardIndex];
        
        // Update card counter
        const currentCardElement = document.getElementById('current-card');
        const totalCardsElement = document.getElementById('total-cards');
        if (currentCardElement) currentCardElement.textContent = this.currentCardIndex + 1;
        if (totalCardsElement) totalCardsElement.textContent = this.vocabularyData.length;
        
        // Update difficulty display
        const difficultyElement = document.getElementById('current-difficulty');
        if (difficultyElement) {
            difficultyElement.textContent = currentTerm.difficulty;
            difficultyElement.className = `difficulty-badge difficulty-${currentTerm.difficulty}`;
        }
        
        // Update flashcard content
        const flashcard = document.getElementById('vocabulary-flashcard');
        if (flashcard) {
            const frontSide = flashcard.querySelector('.flashcard-front-modern');
            const backSide = flashcard.querySelector('.flashcard-back-modern');
            
            if (frontSide) {
                const categoryElement = frontSide.querySelector('.card-category-modern');
                const termElement = frontSide.querySelector('.card-term');
                const typeElement = frontSide.querySelector('.card-type-indicator');
                
                if (categoryElement) {
                    categoryElement.innerHTML = `<span class="category-badge">${currentTerm.category}</span>`;
                }
                if (termElement) {
                    termElement.textContent = currentTerm.term;
                }
                if (typeElement) {
                    typeElement.innerHTML = `<span class="difficulty-badge difficulty-${currentTerm.difficulty}">${currentTerm.difficulty}</span>`;
                }
            }
            
            if (backSide) {
                const definitionElement = backSide.querySelector('.definition-text');
                const exampleElement = backSide.querySelector('.card-example-code');
                const exampleContainer = backSide.querySelector('.card-example-modern');
                
                if (definitionElement) {
                    definitionElement.textContent = currentTerm.definition;
                }
                
                if (currentTerm.example && exampleElement) {
                    exampleElement.textContent = currentTerm.example;
                    if (exampleContainer) {
                        exampleContainer.style.display = 'block';
                    }
                } else if (exampleContainer) {
                    exampleContainer.style.display = 'none';
                }
            }
            
            // Reset flip state
            flashcard.classList.toggle('flipped', this.isFlipped);
        }
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prev-flashcard');
        const nextBtn = document.getElementById('next-flashcard');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentCardIndex === 0;
        }
        if (nextBtn) {
            nextBtn.disabled = this.currentCardIndex === this.vocabularyData.length - 1;
        }
    }

    /**
     * Render list mode
     */
    renderList() {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (!vocabularyGrid) return;
        
        if (this.vocabularyData.length === 0) {
            vocabularyGrid.innerHTML = '<div class="no-vocabulary">No vocabulary terms available.</div>';
            return;
        }
        
        const groupedTerms = this.groupTermsByCategory();
        
        vocabularyGrid.innerHTML = Object.entries(groupedTerms).map(([category, terms]) => `
            <div class="category-section-modern" data-category="${category}">
                <div class="category-header-modern">
                    <h4 class="category-title-modern">
                        <i class="fas fa-folder"></i> 
                        ${category.replace('-', ' ').toUpperCase()}
                        <span class="term-count-modern">${terms.length}</span>
                    </h4>
                    <button class="category-collapse-btn" data-category="${category}">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="category-content-modern">
                    ${terms.map(term => `
                        <div class="term-card-modern" data-term-id="${term.id}">
                            <div class="term-card-header">
                                <h5 class="term-name-modern">${term.term}</h5>
                                <span class="difficulty-badge difficulty-${term.difficulty}">${term.difficulty}</span>
                            </div>
                            <div class="term-card-body">
                                <p class="term-definition-preview">${term.definition.substring(0, 120)}...</p>
                                ${term.example ? `
                                    <div class="term-example-preview">
                                        <i class="fas fa-code"></i>
                                        <span>Code example available</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="term-card-actions">
                                <button class="btn-modern btn-primary-modern view-term-btn" data-term-id="${term.id}">
                                    <i class="fas fa-eye"></i> View Details
                                </button>
                                <button class="btn-modern btn-secondary-modern study-term-btn" data-term-id="${term.id}">
                                    <i class="fas fa-play"></i> Study
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    /**
     * Render quiz mode
     */
    renderQuiz() {
        const quizContainer = document.getElementById('quiz-mode');
        if (!quizContainer) return;
        
        // For now, show a placeholder with coming soon message
        const quizContent = quizContainer.querySelector('.vocabulary-quiz-modern');
        if (quizContent) {
            quizContent.innerHTML = `
                <div class="quiz-placeholder-modern">
                    <div class="placeholder-content">
                        <div class="placeholder-icon">
                            <i class="fas fa-question-circle"></i>
                        </div>
                        <h3>Interactive Vocabulary Quiz</h3>
                        <p>Test your knowledge with engaging quizzes designed to reinforce your learning.</p>
                        
                        <div class="quiz-features">
                            <div class="feature-item">
                                <i class="fas fa-spell-check"></i>
                                <div class="feature-content">
                                    <h5>Definition Matching</h5>
                                    <p>Match terms with their correct definitions</p>
                                </div>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-code"></i>
                                <div class="feature-content">
                                    <h5>Code Examples</h5>
                                    <p>Identify terms based on code snippets</p>
                                </div>
                            </div>
                            <div class="feature-item">
                                <i class="fas fa-puzzle-piece"></i>
                                <div class="feature-content">
                                    <h5>Fill in the Blanks</h5>
                                    <p>Complete sentences with the right terms</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="coming-soon-section">
                            <span class="coming-soon-badge">Coming Soon</span>
                            <p>This feature is currently in development. Stay tuned for updates!</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Show no data message
     */
    showNoDataMessage() {
        const flashcardContainer = document.querySelector('.flashcard-container-modern');
        if (flashcardContainer) {
            flashcardContainer.innerHTML = `
                <div class="no-vocabulary-modern">
                    <div class="no-data-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <h3>No Vocabulary Terms Available</h3>
                    <p>It looks like we don't have any vocabulary terms to display right now.</p>
                    <button class="btn-modern btn-primary-modern" onclick="location.reload()">
                        <i class="fas fa-refresh"></i> Refresh
                    </button>
                </div>
            `;
        }
    }

    /**
     * Group terms by category
     */
    groupTermsByCategory() {
        const grouped = {};
        this.vocabularyData.forEach(term => {
            const category = term.category || 'uncategorized';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(term);
        });
        return grouped;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Mode switching
        const modeButtons = document.querySelectorAll('.mode-btn-modern');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = btn.dataset.mode;
                this.switchMode(mode);
                
                // Update active button
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Category filters
        const categoryFilters = document.querySelectorAll('.category-filter-modern');
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                e.preventDefault();
                const category = filter.dataset.category;
                this.filterByCategory(category);
                
                // Update active filter
                categoryFilters.forEach(f => f.classList.remove('active'));
                filter.classList.add('active');
            });
        });

        // Search functionality
        const searchInput = document.getElementById('vocab-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerms(e.target.value);
            });
        }

        // Flashcard controls
        this.bindFlashcardEvents();
        
        // List mode events
        this.bindListEvents();
        
        // Action buttons
        this.bindActionEvents();
    }

    /**
     * Bind flashcard events
     */
    bindFlashcardEvents() {
        const flashcard = document.getElementById('vocabulary-flashcard');
        const prevBtn = document.getElementById('prev-flashcard');
        const nextBtn = document.getElementById('next-flashcard');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');

        if (flashcard) {
            flashcard.addEventListener('click', () => this.flipCard());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.previousCard();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextCard();
            });
        }

        // Difficulty buttons for spaced repetition
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.handleDifficultySelection(action);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.currentMode === 'flashcards' && document.querySelector('#vocabulary-tab.active')) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousCard();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextCard();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.flipCard();
                        break;
                    case '1':
                        e.preventDefault();
                        this.handleDifficultySelection('again');
                        break;
                    case '2':
                        e.preventDefault();
                        this.handleDifficultySelection('hard');
                        break;
                    case '3':
                        e.preventDefault();
                        this.handleDifficultySelection('good');
                        break;
                    case '4':
                        e.preventDefault();
                        this.handleDifficultySelection('easy');
                        break;
                }
            }
        });
    }

    /**
     * Bind list mode events
     */
    bindListEvents() {
        const difficultyFilter = document.getElementById('difficulty-filter');
        const sortFilter = document.getElementById('sort-filter');
        const viewOptions = document.querySelectorAll('.view-option');

        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', (e) => {
                this.filterByDifficulty(e.target.value);
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.sortTerms(e.target.value);
            });
        }

        viewOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const view = option.dataset.view;
                this.switchListView(view);
                
                // Update active view
                viewOptions.forEach(v => v.classList.remove('active'));
                option.classList.add('active');
            });
        });

        // Delegate events for dynamically created elements
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-term-btn')) {
                const termId = e.target.dataset.termId;
                this.showTermDetails(termId);
            } else if (e.target.classList.contains('study-term-btn')) {
                const termId = e.target.dataset.termId;
                this.studySpecificTerm(termId);
            } else if (e.target.classList.contains('category-collapse-btn')) {
                const category = e.target.dataset.category;
                this.toggleCategoryCollapse(category);
            }
        });
    }

    /**
     * Bind action events
     */
    bindActionEvents() {
        const shuffleBtn = document.getElementById('shuffle-cards');
        const settingsBtn = document.getElementById('study-settings');
        const clearSearchBtn = document.getElementById('search-clear');

        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.shuffleCards();
            });
        }

        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSettings();
            });
        }

        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearSearch();
            });
        }
    }

    /**
     * Switch between modes
     */
    switchMode(mode) {
        if (this.currentMode === mode) return;
        
        this.currentMode = mode;
        this.renderCurrentMode();
        
        // Re-bind events for new content
        this.bindEvents();
    }

    /**
     * Flip the current flashcard
     */
    flipCard() {
        this.isFlipped = !this.isFlipped;
        const flashcard = document.getElementById('vocabulary-flashcard');
        
        if (flashcard) {
            flashcard.classList.toggle('flipped', this.isFlipped);
        }
        
        // Show/hide difficulty buttons based on flip state
        const difficultyActions = document.querySelector('.flashcard-actions-modern');
        if (difficultyActions) {
            difficultyActions.style.display = this.isFlipped ? 'block' : 'none';
        }
    }

    /**
     * Go to previous card
     */
    previousCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.isFlipped = false;
            this.renderFlashcards();
            this.updateSidebarStats();
        }
    }

    /**
     * Go to next card
     */
    nextCard() {
        if (this.currentCardIndex < this.vocabularyData.length - 1) {
            this.currentCardIndex++;
            this.isFlipped = false;
            this.renderFlashcards();
            this.updateSidebarStats();
        }
    }

    /**
     * Shuffle the cards
     */
    shuffleCards() {
        for (let i = this.vocabularyData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.vocabularyData[i], this.vocabularyData[j]] = [this.vocabularyData[j], this.vocabularyData[i]];
        }
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.renderFlashcards();
        
        // Show feedback
        this.showNotification('Cards shuffled! Starting from the beginning.', 'success');
    }

    /**
     * Reset progress
     */
    resetProgress() {
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.renderFlashcards();
        this.updateSidebarStats();
    }

    /**
     * Show term details in a modal
     */
    showTermDetails(termId) {
        const term = this.vocabularyData.find(t => t.id === termId);
        if (!term) return;
        
        // Create and show modal
        const modal = document.createElement('div');
        modal.className = 'term-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${term.term}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="term-meta">
                        <span class="category-badge">${term.category}</span>
                        <span class="difficulty-badge difficulty-${term.difficulty}">${term.difficulty}</span>
                    </div>
                    <div class="term-definition">
                        <h4>Definition</h4>
                        <p>${term.definition}</p>
                    </div>
                    ${term.example ? `
                        <div class="term-example">
                            <h4>Example</h4>
                            <pre><code>${term.example}</code></pre>
                        </div>
                    ` : ''}
                    <div class="term-actions">
                        <button class="btn btn-primary" onclick="this.closest('.term-modal').remove()">
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal events
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
    }

    /**
     * Show error state
     */
    showError(message) {
        this.container.innerHTML = `
            <div class="vocabulary-error">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Vocabulary</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    Retry
                </button>
            </div>
        `;
    }

    /**
     * Get the number of mastered terms
     */
    getMasteredCount() {
        const progress = this.getProgress();
        return progress.mastered || 0;
    }

    /**
     * Get the current study streak
     */
    getStreak() {
        const streak = localStorage.getItem('vocabularyStreak');
        return streak ? parseInt(streak) : 0;
    }

    /**
     * Get user progress from localStorage
     */
    getProgress() {
        const progress = localStorage.getItem('vocabularyProgress');
        return progress ? JSON.parse(progress) : { mastered: 0, learning: 0, new: 0 };
    }

    /**
     * Handle difficulty selection for spaced repetition
     */
    handleDifficultySelection(action) {
        const currentTerm = this.vocabularyData[this.currentCardIndex];
        if (!currentTerm) return;
        
        // Update term progress based on difficulty
        this.updateTermProgress(currentTerm.id, action);
        
        // Show feedback
        const feedbackMessages = {
            'again': 'Card will be shown again soon.',
            'hard': 'Card scheduled for review in 6 minutes.',
            'good': 'Card scheduled for review tomorrow.',
            'easy': 'Card scheduled for review in 4 days.'
        };
        
        this.showNotification(feedbackMessages[action], 'info');
        
        // Move to next card
        this.nextCard();
    }

    /**
     * Update term progress in localStorage
     */
    updateTermProgress(termId, difficulty) {
        const progress = this.getProgress();
        const term = this.vocabularyData.find(t => t.id === termId);
        
        if (term) {
            switch (difficulty) {
                case 'again':
                    term.lastReviewed = new Date().toISOString();
                    term.reviewCount = (term.reviewCount || 0) + 1;
                    break;
                case 'hard':
                    term.lastReviewed = new Date().toISOString();
                    term.reviewCount = (term.reviewCount || 0) + 1;
                    break;
                case 'good':
                    term.lastReviewed = new Date().toISOString();
                    term.reviewCount = (term.reviewCount || 0) + 1;
                    if (term.reviewCount >= 3) {
                        progress.mastered = (progress.mastered || 0) + 1;
                    } else {
                        progress.learning = (progress.learning || 0) + 1;
                    }
                    break;
                case 'easy':
                    term.lastReviewed = new Date().toISOString();
                    term.reviewCount = (term.reviewCount || 0) + 1;
                    progress.mastered = (progress.mastered || 0) + 1;
                    break;
            }
        }
        
        // Save progress
        localStorage.setItem('vocabularyProgress', JSON.stringify(progress));
        
        // Update UI
        this.updateSidebarStats();
    }

    /**
     * Filter terms by category
     */
    filterByCategory(category) {
        if (category === 'all') {
            this.vocabularyData = this.getAllTerms();
        } else {
            this.vocabularyData = this.getAllTerms().filter(term => term.category === category);
        }
        
        this.currentCardIndex = 0;
        this.isFlipped = false;
        this.renderCurrentMode();
        this.updateSidebarStats();
    }

    /**
     * Filter terms by difficulty
     */
    filterByDifficulty(difficulty) {
        if (difficulty === 'all') {
            this.vocabularyData = this.getAllTerms();
        } else {
            this.vocabularyData = this.getAllTerms().filter(term => term.difficulty === difficulty);
        }
        
        this.renderList();
    }

    /**
     * Sort terms
     */
    sortTerms(sortBy) {
        switch (sortBy) {
            case 'alphabetical':
                this.vocabularyData.sort((a, b) => a.term.localeCompare(b.term));
                break;
            case 'difficulty':
                const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
                this.vocabularyData.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
                break;
            case 'recent':
                this.vocabularyData.sort((a, b) => new Date(b.lastReviewed || 0) - new Date(a.lastReviewed || 0));
                break;
        }
        
        this.renderList();
    }

    /**
     * Switch list view
     */
    switchListView(view) {
        const vocabularyGrid = document.getElementById('vocabulary-grid');
        if (vocabularyGrid) {
            vocabularyGrid.classList.toggle('table-view', view === 'table');
        }
    }

    /**
     * Search terms
     */
    searchTerms(query) {
        const searchClearBtn = document.getElementById('search-clear');
        if (searchClearBtn) {
            searchClearBtn.style.display = query ? 'block' : 'none';
        }
        
        if (this.currentMode === 'list') {
            this.filterTermsInList(query);
        }
        // Add flashcard search functionality here if needed
    }

    /**
     * Filter terms in list view
     */
    filterTermsInList(query) {
        const termCards = document.querySelectorAll('.term-card-modern');
        const categorySection = document.querySelectorAll('.category-section-modern');
        
        termCards.forEach(card => {
            const termName = card.querySelector('.term-name-modern').textContent.toLowerCase();
            const termDefinition = card.querySelector('.term-definition-preview').textContent.toLowerCase();
            const queryLower = query.toLowerCase();
            
            const matches = !query || termName.includes(queryLower) || termDefinition.includes(queryLower);
            card.style.display = matches ? 'block' : 'none';
        });
        
        // Hide empty categories
        categorySection.forEach(section => {
            const visibleCards = section.querySelectorAll('.term-card-modern:not([style*="display: none"])');
            section.style.display = visibleCards.length > 0 ? 'block' : 'none';
        });
    }

    /**
     * Clear search
     */
    clearSearch() {
        const searchInput = document.getElementById('vocab-search');
        if (searchInput) {
            searchInput.value = '';
            this.searchTerms('');
        }
    }

    /**
     * Study specific term
     */
    studySpecificTerm(termId) {
        const termIndex = this.vocabularyData.findIndex(term => term.id === termId);
        if (termIndex !== -1) {
            this.currentCardIndex = termIndex;
            this.isFlipped = false;
            this.switchMode('flashcards');
        }
    }

    /**
     * Toggle category collapse
     */
    toggleCategoryCollapse(category) {
        const categorySection = document.querySelector(`[data-category="${category}"]`);
        if (categorySection) {
            const content = categorySection.querySelector('.category-content-modern');
            const button = categorySection.querySelector('.category-collapse-btn i');
            
            if (content) {
                content.classList.toggle('collapsed');
                if (button) {
                    button.classList.toggle('fa-chevron-down');
                    button.classList.toggle('fa-chevron-up');
                }
            }
        }
    }

    /**
     * Show settings panel
     */
    showSettings() {
        // Placeholder for settings functionality
        this.showNotification('Settings panel coming soon!', 'info');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `vocabulary-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
        
        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    /**
     * Get all terms (for filtering)
     */
    getAllTerms() {
        return this.getFallbackVocabulary(); // In a real app, this would be the original loaded data
    }
}

// Make available globally for dashboard manager
window.DashboardVocabulary = DashboardVocabulary;
