/**
 * Lessons Page Component
 * Handles lessons listing and filtering
 */

class LessonsManager {
    constructor() {
        this.initialized = false;
        this.lessons = [];
        this.filteredLessons = [];
        this.currentFilter = 'all';
        this.currentSort = 'difficulty';
    }

    init() {
        if (this.initialized) return;
        
        console.log('📚 Initializing Lessons Page...');
        
        this.setupEventListeners();
        this.loadLessons();
        this.initializeFilters();
        this.initializeSearch();
        
        this.initialized = true;
        console.log('✅ Lessons page initialized');
    }

    setupEventListeners() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.lesson-filter');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Sort dropdown
        const sortSelect = document.querySelector('.lesson-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.setSortOrder(e.target.value);
            });
        }

        // Search input
        const searchInput = document.querySelector('.lesson-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchLessons(e.target.value);
            });
        }

        // Lesson cards
        document.addEventListener('click', (e) => {
            if (e.target.closest('.lesson-card')) {
                this.handleLessonClick(e.target.closest('.lesson-card'));
            }
        });
    }

    async loadLessons() {
        try {
            const response = await fetch('/api/lessons');
            const data = await response.json();
            
            if (data.success) {
                this.lessons = data.lessons;
                this.filteredLessons = [...this.lessons];
                this.renderLessons();
                this.updateStats();
            } else {
                throw new Error(data.error || 'Failed to load lessons');
            }
        } catch (error) {
            console.error('Error loading lessons:', error);
            this.showError('Failed to load lessons');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.lesson-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.applyFilters();
    }

    setSortOrder(sortOrder) {
        this.currentSort = sortOrder;
        this.applyFilters();
    }

    searchLessons(query) {
        this.searchQuery = query.toLowerCase();
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.lessons];

        // Apply difficulty filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(lesson => lesson.difficulty === this.currentFilter);
        }

        // Apply search filter
        if (this.searchQuery) {
            filtered = filtered.filter(lesson => 
                lesson.title.toLowerCase().includes(this.searchQuery) ||
                lesson.description.toLowerCase().includes(this.searchQuery) ||
                lesson.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }

        // Apply sort
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'difficulty':
                    const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
                    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'duration':
                    return a.estimatedTime - b.estimatedTime;
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });

        this.filteredLessons = filtered;
        this.renderLessons();
        this.updateStats();
    }

    renderLessons() {
        const container = document.querySelector('.lessons-grid');
        if (!container) return;

        if (this.filteredLessons.length === 0) {
            container.innerHTML = `
                <div class="no-lessons">
                    <i class="fas fa-search fa-3x"></i>
                    <h3>No lessons found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        const lessonsHTML = this.filteredLessons.map(lesson => `
            <div class="lesson-card" data-lesson-id="${lesson.id}">
                <div class="lesson-header">
                    <h3 class="lesson-title">${lesson.title}</h3>
                    <span class="lesson-difficulty ${lesson.difficulty}">${lesson.difficulty}</span>
                </div>
                <div class="lesson-body">
                    <p class="lesson-description">${lesson.description}</p>
                    <div class="lesson-meta">
                        <span class="lesson-duration">
                            <i class="fas fa-clock"></i>
                            ${this.formatDuration(lesson.estimatedTime)}
                        </span>
                        <span class="lesson-exercises">
                            <i class="fas fa-code"></i>
                            ${lesson.exerciseCount} exercises
                        </span>
                    </div>
                    <div class="lesson-tags">
                        ${lesson.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="lesson-footer">
                    <div class="lesson-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${lesson.progress || 0}%"></div>
                        </div>
                        <span class="progress-text">${lesson.progress || 0}% complete</span>
                    </div>
                    <button class="btn btn-primary lesson-start-btn">
                        ${lesson.progress > 0 ? 'Continue' : 'Start'}
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = lessonsHTML;
        
        // Add animation
        const cards = container.querySelectorAll('.lesson-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-fade-in-up');
        });
    }

    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
    }

    updateStats() {
        const totalLessons = this.lessons.length;
        const filteredCount = this.filteredLessons.length;
        const completedLessons = this.lessons.filter(lesson => lesson.progress === 100).length;

        // Update stats display
        const statsElements = {
            '.stats-total': totalLessons,
            '.stats-filtered': filteredCount,
            '.stats-completed': completedLessons
        };

        Object.entries(statsElements).forEach(([selector, value]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value;
            }
        });
    }

    handleLessonClick(card) {
        const lessonId = card.dataset.lessonId;
        const lesson = this.lessons.find(l => l.id === lessonId);
        
        if (lesson) {
            // Navigate to lesson
            window.location.href = `/lesson/${lessonId}`;
        }
    }

    initializeFilters() {
        // Set initial filter state
        const activeFilter = document.querySelector('.lesson-filter.active');
        if (activeFilter) {
            this.currentFilter = activeFilter.dataset.filter;
        }
    }

    initializeSearch() {
        // Set up search with debouncing
        const searchInput = document.querySelector('.lesson-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchLessons(e.target.value);
                }, 300);
            });
        }
    }

    showError(message) {
        if (typeof showNotification === 'function') {
            showNotification(message, 'error');
        } else {
            console.error(message);
        }
    }

    destroy() {
        this.initialized = false;
    }
}

// Initialize lessons page when function is called
function initializeLessons() {
    if (window.lessonsManager) {
        window.lessonsManager.destroy();
    }
    
    window.lessonsManager = new LessonsManager();
    window.lessonsManager.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LessonsManager, initializeLessons };
}
