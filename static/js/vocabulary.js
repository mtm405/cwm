/**
 * Enhanced Vocabulary Module - Modern ES6 vocabulary flashcards and learning system
 * Features: Flashcards, Dictionary, Spaced Repetition, Progress Tracking
 */

class ModernVocabularyManager {
    constructor() {
        this.terms = [];
        this.categories = [];
        this.currentFlashcardIndex = 0;
        this.isFlipped = false;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.userProgress = {};
        this.settings = {
            autoFlip: false,
            studyMode: 'flashcards',
            difficulty: 'all',
            showHints: true
        };
        this.initialized = false;
    }

    /**
     * Initialize the vocabulary module
     */
    async init() {
        if (this.initialized) return;
        
        console.log('🎯 Initializing Enhanced Vocabulary Module');
        this.attachEventListeners();
        await this.loadVocabularyData();
        this.loadUserProgress();
        this.initialized = true;
    }
    
    /**
     * Attach event listeners for vocabulary functionality
     */
    attachEventListeners() {
        // Handle tab activation for vocabulary
        document.querySelectorAll('.nav-link').forEach(tab => {
            tab.addEventListener('click', (e) => {
                if (e.currentTarget.getAttribute('data-target') === '#vocabulary-tab') {
                    // Load vocabulary when the tab is clicked
                    this.loadVocabularyData();
                }
            });
        });
        
        // Delegate events for flashcard interactions
        document.addEventListener('click', (e) => {
            // Flashcard flip
            if (e.target.closest('.flashcard')) {
                this.flipFlashcard();
            }
            
            // Next flashcard button
            if (e.target.closest('#next-flashcard')) {
                this.nextFlashcard();
            }
            
            // Previous flashcard button
            if (e.target.closest('#prev-flashcard')) {
                this.prevFlashcard();
            }
            
            // Category filter
            if (e.target.closest('.category-filter')) {
                const category = e.target.closest('.category-filter').dataset.category;
                this.filterByCategory(category);
            }
            
            // Mode switcher
            if (e.target.closest('.mode-switcher')) {
                const mode = e.target.closest('.mode-switcher').dataset.mode;
                this.switchMode(mode);
            }
            
            // Search functionality
            if (e.target.closest('#vocab-search')) {
                e.target.addEventListener('input', (searchEvent) => {
                    this.searchTerms(searchEvent.target.value);
                });
            }
        });
    }
    
    /**
     * Load vocabulary data from the API
     */
    async loadVocabularyData() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/vocabulary');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.terms = data;
            console.log(`✅ Loaded ${this.terms.length} vocabulary terms`);
            
            // Initialize the UI with the data
            this.renderVocabularyUI();
            
            // Load categories
            await this.loadCategories();
            
        } catch (error) {
            console.error('❌ Error loading vocabulary:', error);
            this.showError('Failed to load vocabulary terms. Please try again later.');
        }
    }
    
    /**
     * Load vocabulary categories
     */
    async loadCategories() {
        try {
            const response = await fetch('/api/vocabulary/categories');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.categories = data;
            this.renderCategoryFilters();
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    /**
     * Render the vocabulary UI with the loaded data
     */
    renderVocabularyUI() {
        const vocabularyTab = document.getElementById('vocabulary-tab');
        
        // Check if we have any terms
        if (!this.terms || this.terms.length === 0) {
            vocabularyTab.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> No vocabulary terms found. Please check back later.
                </div>
            `;
            return;
        }
        
        // Remove the coming soon badge and placeholder content
        vocabularyTab.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <h2>Python Programming Vocabulary</h2>
                    <p>Build your Python programming vocabulary with these terms and definitions.</p>
                </div>
            </div>
            
            <div class="row mt-4">
                <div class="col-md-3">
                    <div class="card">
                        <div class="card-header">
                            <h5>Categories</h5>
                        </div>
                        <div class="card-body">
                            <div id="category-filters" class="list-group">
                                <a href="#" class="list-group-item list-group-item-action active category-filter" data-category="all">
                                    All Categories
                                </a>
                                <!-- Categories will be inserted here -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-9">
                    <ul class="nav nav-pills mb-3" id="vocabulary-nav-tabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <a class="nav-link active" id="flashcards-tab" data-toggle="pill" href="#flashcards" role="tab">
                                <i class="fas fa-layer-group"></i> Flashcards
                            </a>
                        </li>
                        <li class="nav-item" role="presentation">
                            <a class="nav-link" id="dictionary-tab" data-toggle="pill" href="#dictionary" role="tab">
                                <i class="fas fa-book"></i> Dictionary
                            </a>
                        </li>
                    </ul>
                    
                    <div class="tab-content" id="vocabulary-tab-content">
                        <div class="tab-pane fade show active" id="flashcards" role="tabpanel">
                            <div class="flashcard-container">
                                <div class="flashcard">
                                    <div class="flashcard-inner">
                                        <div class="flashcard-front">
                                            <h3 id="flashcard-term"></h3>
                                        </div>
                                        <div class="flashcard-back">
                                            <p id="flashcard-description"></p>
                                            <span id="flashcard-category" class="badge badge-primary"></span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="flashcard-controls mt-3">
                                    <button id="prev-flashcard" class="btn btn-outline-primary">
                                        <i class="fas fa-arrow-left"></i> Previous
                                    </button>
                                    <span id="flashcard-counter" class="mx-3"></span>
                                    <button id="next-flashcard" class="btn btn-outline-primary">
                                        Next <i class="fas fa-arrow-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tab-pane fade" id="dictionary" role="tabpanel">
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                                </div>
                                <input type="text" id="vocabulary-search" class="form-control" placeholder="Search for terms...">
                            </div>
                            
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Term</th>
                                            <th>Description</th>
                                            <th>Category</th>
                                        </tr>
                                    </thead>
                                    <tbody id="vocabulary-table-body">
                                        <!-- Vocabulary terms will be inserted here -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add custom CSS for flashcards
        if (!document.getElementById('vocabulary-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'vocabulary-styles';
            styleSheet.textContent = `
                .flashcard-container {
                    perspective: 1000px;
                    padding: 20px;
                }
                
                .flashcard {
                    width: 100%;
                    height: 200px;
                    cursor: pointer;
                }
                
                .flashcard-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    transition: transform 0.6s;
                    transform-style: preserve-3d;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                
                .flashcard.flipped .flashcard-inner {
                    transform: rotateY(180deg);
                }
                
                .flashcard-front, .flashcard-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    border-radius: 10px;
                    padding: 20px;
                }
                
                .flashcard-front {
                    background-color: #f8f9fa;
                    border: 1px solid #dee2e6;
                }
                
                .flashcard-back {
                    background-color: #e9ecef;
                    transform: rotateY(180deg);
                    border: 1px solid #dee2e6;
                }
            `;
            document.head.appendChild(styleSheet);
        }
        
        // Initialize first flashcard
        this.currentFlashcardIndex = 0;
        this.isFlipped = false;
        this.updateFlashcard();
        
        // Populate the dictionary table
        this.populateDictionaryTable();
        
        // Set up search functionality
        const searchInput = document.getElementById('vocabulary-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerms(e.target.value);
            });
        }

        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Add study statistics display
        this.addStatsDisplay();
    }
    
    /**
     * Render category filters
     */
    renderCategoryFilters() {
        const categoryFiltersContainer = document.getElementById('category-filters');
        if (!categoryFiltersContainer) return;
        
        // Keep the "All Categories" option and add the rest
        let categoryHtml = '';
        
        this.categories.forEach(category => {
            categoryHtml += `
                <a href="#" class="list-group-item list-group-item-action category-filter" data-category="${category}">
                    ${category}
                </a>
            `;
        });
        
        // Append after the "All Categories" option
        const allCategoriesLink = categoryFiltersContainer.querySelector('[data-category="all"]');
        allCategoriesLink.insertAdjacentHTML('afterend', categoryHtml);
    }
    
    /**
     * Update the current flashcard with term data
     */
    updateFlashcard() {
        if (this.terms.length === 0) return;
        
        const termElem = document.getElementById('flashcard-term');
        const descriptionElem = document.getElementById('flashcard-description');
        const categoryElem = document.getElementById('flashcard-category');
        const counterElem = document.getElementById('flashcard-counter');
        const flashcardElem = document.querySelector('.flashcard');
        
        if (!termElem || !descriptionElem || !categoryElem || !counterElem || !flashcardElem) return;
        
        // Reset flip state
        flashcardElem.classList.remove('flipped');
        this.isFlipped = false;
        
        // Get current term
        const currentTerm = this.terms[this.currentFlashcardIndex];
        
        // Update flashcard content
        termElem.textContent = currentTerm.term;
        descriptionElem.textContent = currentTerm.description;
        categoryElem.textContent = currentTerm.category;
        
        // Update counter
        counterElem.textContent = `${this.currentFlashcardIndex + 1} / ${this.terms.length}`;
    }
    
    /**
     * Flip the current flashcard
     */
    flipFlashcard() {
        const flashcardElem = document.querySelector('.flashcard');
        if (!flashcardElem) return;
        
        this.isFlipped = !this.isFlipped;
        
        if (this.isFlipped) {
            flashcardElem.classList.add('flipped');
        } else {
            flashcardElem.classList.remove('flipped');
        }
    }
    
    /**
     * Go to the next flashcard
     */
    nextFlashcard() {
        if (this.currentFlashcardIndex < this.terms.length - 1) {
            this.currentFlashcardIndex++;
        } else {
            this.currentFlashcardIndex = 0; // Loop back to the first card
        }
        
        this.updateFlashcard();
    }
    
    /**
     * Go to the previous flashcard
     */
    prevFlashcard() {
        if (this.currentFlashcardIndex > 0) {
            this.currentFlashcardIndex--;
        } else {
            this.currentFlashcardIndex = this.terms.length - 1; // Loop to the last card
        }
        
        this.updateFlashcard();
    }
    
    /**
     * Populate the dictionary table with all terms
     */
    populateDictionaryTable() {
        const tableBody = document.getElementById('vocabulary-table-body');
        if (!tableBody) return;
        
        let tableHtml = '';
        
        this.terms.forEach(term => {
            tableHtml += `
                <tr>
                    <td>${term.term}</td>
                    <td>${term.description}</td>
                    <td><span class="badge badge-primary">${term.category}</span></td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = tableHtml;
    }
    
    /**
     * Filter terms by category
     * @param {string} category - Category to filter by or 'all' for all categories
     */
    async filterByCategory(category) {
        // Update active category in UI
        const categoryFilters = document.querySelectorAll('.category-filter');
        categoryFilters.forEach(filter => {
            if (filter.dataset.category === category) {
                filter.classList.add('active');
            } else {
                filter.classList.remove('active');
            }
        });
        
        // If 'all', reload all vocabulary
        if (category === 'all') {
            await this.loadVocabularyData();
            return;
        }
        
        // Otherwise, fetch filtered vocabulary
        try {
            this.showLoading();
            
            const response = await fetch(`/api/vocabulary?category=${encodeURIComponent(category)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.terms = data;
            console.log(`Loaded ${this.terms.length} vocabulary terms for category: ${category}`);
            
            // Reset and update the flashcard
            this.currentFlashcardIndex = 0;
            this.updateFlashcard();
            
            // Update the dictionary table
            this.populateDictionaryTable();
        } catch (error) {
            console.error(`Error loading vocabulary for category ${category}:`, error);
            this.showError(`Failed to load vocabulary terms for category: ${category}`);
        }
    }
    
    /**
     * Search terms by keyword
     * @param {string} query - Search query
     */
    searchTerms(query) {
        query = query.toLowerCase().trim();
        
        // If empty query, show all terms
        if (!query) {
            this.populateDictionaryTable();
            return;
        }
        
        // Filter terms by query
        const filteredTerms = this.terms.filter(term => 
            term.term.toLowerCase().includes(query) || 
            term.description.toLowerCase().includes(query) ||
            term.category.toLowerCase().includes(query)
        );
        
        // Update table with filtered results
        const tableBody = document.getElementById('vocabulary-table-body');
        if (!tableBody) return;
        
        let tableHtml = '';
        
        if (filteredTerms.length === 0) {
            tableHtml = `
                <tr>
                    <td colspan="3" class="text-center">No matching terms found</td>
                </tr>
            `;
        } else {
            filteredTerms.forEach(term => {
                tableHtml += `
                    <tr>
                        <td>${term.term}</td>
                        <td>${term.description}</td>
                        <td><span class="badge badge-primary">${term.category}</span></td>
                    </tr>
                `;
            });
        }
        
        tableBody.innerHTML = tableHtml;
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        const vocabularyTab = document.getElementById('vocabulary-tab');
        if (!vocabularyTab) return;
        
        vocabularyTab.innerHTML = `
            <div class="text-center my-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2">Loading vocabulary terms...</p>
            </div>
        `;
    }
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        const vocabularyTab = document.getElementById('vocabulary-tab');
        if (!vocabularyTab) return;
        
        vocabularyTab.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> ${message}
            </div>
        `;
    }

    /**
     * Load user progress from localStorage
     */
    loadUserProgress() {
        try {
            const stored = localStorage.getItem('vocabulary_progress');
            if (stored) {
                this.userProgress = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading user progress:', error);
            this.userProgress = {};
        }
    }

    /**
     * Save user progress to localStorage
     */
    saveUserProgress() {
        try {
            localStorage.setItem('vocabulary_progress', JSON.stringify(this.userProgress));
        } catch (error) {
            console.error('Error saving user progress:', error);
        }
    }

    /**
     * Switch between different study modes
     * @param {string} mode - The mode to switch to
     */
    switchMode(mode) {
        this.settings.studyMode = mode;
        console.log(`Switched to ${mode} mode`);
        // Implementation for mode switching can be added here
    }

    /**
     * Add keyboard shortcuts for better user experience
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only activate shortcuts when vocabulary tab is visible
            const vocabularyTab = document.getElementById('vocabulary-tab');
            if (!vocabularyTab || !vocabularyTab.classList.contains('active')) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevFlashcard();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextFlashcard();
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    this.flipFlashcard();
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.shuffleTerms();
                    }
                    break;
            }
        });
    }

    /**
     * Shuffle the terms array for random study order
     */
    shuffleTerms() {
        const shuffled = [...this.terms];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        this.terms = shuffled;
        this.currentFlashcardIndex = 0;
        this.updateFlashcard();
        this.populateDictionaryTable();
        
        // Show notification
        this.showNotification('Terms shuffled! Ready for random study.', 'success');
    }

    /**
     * Show temporary notification
     * @param {string} message - Message to show
     * @param {string} type - Type of notification (success, error, info)
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} vocab-notification`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1050;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Track study progress for a term
     * @param {string} termId - ID of the term studied
     * @param {boolean} wasCorrect - Whether the user got it right
     */
    trackProgress(termId, wasCorrect = true) {
        if (!this.userProgress[termId]) {
            this.userProgress[termId] = {
                timesStudied: 0,
                timesCorrect: 0,
                lastStudied: null,
                difficulty: 1 // 1 = easy, 2 = medium, 3 = hard
            };
        }

        const progress = this.userProgress[termId];
        progress.timesStudied++;
        if (wasCorrect) progress.timesCorrect++;
        progress.lastStudied = new Date().toISOString();

        // Adjust difficulty based on performance
        const accuracy = progress.timesCorrect / progress.timesStudied;
        if (accuracy > 0.8) progress.difficulty = Math.max(1, progress.difficulty - 0.1);
        else if (accuracy < 0.6) progress.difficulty = Math.min(3, progress.difficulty + 0.1);

        this.saveUserProgress();
    }

    /**
     * Get study statistics
     */
    getStudyStats() {
        const totalTerms = this.terms.length;
        const studiedTerms = Object.keys(this.userProgress).length;
        const totalStudySessions = Object.values(this.userProgress).reduce((sum, p) => sum + p.timesStudied, 0);
        const averageAccuracy = Object.values(this.userProgress).length > 0 
            ? Object.values(this.userProgress).reduce((sum, p) => sum + (p.timesCorrect / p.timesStudied), 0) / Object.values(this.userProgress).length
            : 0;

        return {
            totalTerms,
            studiedTerms,
            totalStudySessions,
            averageAccuracy: Math.round(averageAccuracy * 100),
            completionRate: Math.round((studiedTerms / totalTerms) * 100)
        };
    }

    /**
     * Add study statistics display
     */
    addStatsDisplay() {
        const stats = this.getStudyStats();
        const statsHtml = `
            <div class="card mt-3">
                <div class="card-header">
                    <h6><i class="fas fa-chart-bar"></i> Study Statistics</h6>
                </div>
                <div class="card-body">
                    <div class="row text-center">
                        <div class="col-6">
                            <div class="stat-item">
                                <div class="stat-value">${stats.studiedTerms}/${stats.totalTerms}</div>
                                <div class="stat-label">Terms Studied</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="stat-item">
                                <div class="stat-value">${stats.averageAccuracy}%</div>
                                <div class="stat-label">Accuracy</div>
                            </div>
                        </div>
                    </div>
                    <div class="progress mt-2">
                        <div class="progress-bar" role="progressbar" style="width: ${stats.completionRate}%">
                            ${stats.completionRate}% Complete
                        </div>
                    </div>
                </div>
            </div>
        `;

        const categoryContainer = document.querySelector('#category-filters').parentElement.parentElement;
        if (categoryContainer && !categoryContainer.querySelector('.study-stats')) {
            categoryContainer.insertAdjacentHTML('beforeend', statsHtml);
        }
    }

    /**
     * Get the current vocabulary manager instance
     */
    static getInstance() {
        if (!ModernVocabularyManager.instance) {
            ModernVocabularyManager.instance = new ModernVocabularyManager();
        }
        return ModernVocabularyManager.instance;
    }
}

// Create and export singleton instance
const vocabularyManager = ModernVocabularyManager.getInstance();

// Initialize vocabulary module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with the vocabulary tab
    if (document.getElementById('vocabulary-tab')) {
        vocabularyManager.init();
    }
});

// Make available globally for template use
window.VocabularyManager = vocabularyManager;
window.ModernVocabularyManager = ModernVocabularyManager;

// Export for ES6 module systems (only if in module context)
try {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { ModernVocabularyManager, vocabularyManager };
        module.exports.default = vocabularyManager;
    } else if (typeof define === 'function' && define.amd) {
        define([], function() { return { ModernVocabularyManager, vocabularyManager }; });
    }
} catch (e) {
    // Ignore export errors in browser environments
    console.log('📝 Vocabulary module loaded in browser environment');
}
