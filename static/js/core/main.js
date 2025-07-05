/**
 * Main Application Entry Point - Optimized and Modular
 * Code with Morais - Core Application Bootstrap
 * 
 * This file has been optimized and split into focused modules:
 * - Auth management: /modules/auth-manager.js
 * - Theme management: /modules/theme-manager.js  
 * - Navigation: /modules/navigation-manager.js
 * - Utilities: /modules/app-utils.js
 * - Lesson system: /lesson-core.js (consolidated)
 * 
 * Total size reduced from ~100KB to ~15KB for non-lesson pages
 */

// ==========================================
// CORE APPLICATION INITIALIZATION
// ==========================================

class MainApp {
    constructor() {
        this.initialized = false;
        this.managers = {};
        this.init();
        
        // Track Firebase availability
        this.firebaseAvailable = false;
    }
    
    /**
     * Initialize core application
     */
    async init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Code with Morais application...');
        
        try {
            // Check Firebase availability
            await this.checkFirebaseAvailability();
            
            // Initialize core managers
            await this.initializeManagers();
            
            // Initialize page-specific functionality
            this.initializePageSpecific();
            
            // Set up global event listeners
            this.setupGlobalEvents();
            
            // Apply saved preferences
            this.applySavedPreferences();
            
            this.initialized = true;
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Application initialization failed:', error);
        }
    }
    
    /**
     * Check if Firebase is available
     */
    async checkFirebaseAvailability() {
        try {
            const response = await fetch('/api/firebase-status');
            const data = await response.json();
            this.firebaseAvailable = data.firebase_available === true;
            console.log(`🔥 Firebase availability: ${this.firebaseAvailable}`);
            
            // Add status indicator to the DOM
            if (!this.firebaseAvailable) {
                // Show a warning in development mode
                console.warn('⚠️ Firebase is not available - using mock data');
                
                // Add a notification for lesson pages
                if (document.body.dataset.page === 'lesson') {
                    const notification = document.createElement('div');
                    notification.className = 'dev-mode-notification';
                    notification.innerHTML = `
                        <div class="dev-mode-notification-content">
                            <i class="fas fa-database"></i>
                            <span>Development Mode: Using mock lesson data</span>
                        </div>
                    `;
                    document.body.appendChild(notification);
                    
                    // Add styling for the notification
                    const style = document.createElement('style');
                    style.textContent = `
                        .dev-mode-notification {
                            position: fixed;
                            bottom: 15px;
                            left: 15px;
                            background: rgba(255, 193, 7, 0.9);
                            color: #000;
                            padding: 8px 15px;
                            border-radius: 8px;
                            font-size: 0.85rem;
                            z-index: 9999;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                        }
                        .dev-mode-notification-content {
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .dev-mode-notification i {
                            font-size: 1rem;
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        } catch (error) {
            console.error('Error checking Firebase availability:', error);
            this.firebaseAvailable = false;
        }
    }
    
    /**
     * Initialize core management systems
     */
    async initializeManagers() {
        // Initialize utilities first (provides global helpers)
        // Create AppUtils if not available
        if (typeof AppUtils !== 'undefined') {
            this.managers.utils = new AppUtils();
        } else if (typeof window.AppUtils !== 'undefined') {
            this.managers.utils = new window.AppUtils();
        } else {
            // Create a basic AppUtils fallback
            this.managers.utils = {
                showNotification: function(msg, type) {
                    console.log(`[${type}] ${msg}`);
                    if (window.showToast) {
                        window.showToast(msg, type);
                    }
                },
                handleError: function(err, ctx) {
                    console.error(`Error in ${ctx}:`, err);
                }
            };
        }
        
        // Initialize theme manager
        if (typeof ThemeManager !== 'undefined') {
            this.managers.theme = new ThemeManager();
        } else {
            this.managers.theme = { init: () => {} };
        }
        
        // Initialize navigation manager
        if (typeof NavigationManager !== 'undefined') {
            this.managers.navigation = new NavigationManager();
        } else {
            this.managers.navigation = { init: () => {} };
        }
        
        // Initialize auth manager
        if (typeof AuthManager !== 'undefined') {
            this.managers.auth = new AuthManager();
        } else {
            this.managers.auth = { init: () => {} };
        }
        
        // Store managers globally for template access
        window.appManagers = this.managers;
    }
    
    /**
     * Initialize page-specific functionality
     */
    initializePageSpecific() {
        const page = document.body.dataset.page;
        
        switch (page) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'lesson':
                this.initializeLessonPage();
                break;
            case 'home':
                this.initializeHomePage();
                break;
            default:
                console.log(`📄 Page type: ${page || 'unknown'}`);
        }
    }
    
    /**
     * Initialize dashboard-specific functionality
     */
    initializeDashboard() {
        console.log('📊 Dashboard page detected - dashboard.js will handle initialization');
        
        // The dashboard is now initialized directly in dashboard.html
        // This method is kept for compatibility and future enhancements
    }
    
    /**
     * Initialize lesson page (lesson-core.js handles the heavy lifting)
     */
    initializeLessonPage() {
        console.log('📚 Lesson page detected - lesson-core.js will handle initialization');
        
        // Add error handling for lesson loading
        const lessonContainer = document.querySelector('.lesson-container');
        const lessonContent = document.querySelector('.lesson-content');
        
        if (lessonContainer && window.lessonData === undefined) {
            console.error('❌ Lesson data not available');
            
            // Show an error message if lesson data is missing
            if (lessonContent) {
                lessonContent.innerHTML = `
                    <div class="error-container">
                        <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                        <h2>Lesson Loading Error</h2>
                        <p>There was a problem loading the lesson content. This could be because:</p>
                        <ul>
                            <li>The lesson ID is invalid</li>
                            <li>Firebase connection is not available</li>
                            <li>Mock data for this lesson ID doesn't exist</li>
                        </ul>
                        <a href="/lessons" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Back to Lessons</a>
                    </div>
                `;
                
                // Add error styling
                const style = document.createElement('style');
                style.textContent = `
                    .error-container {
                        text-align: center;
                        padding: 2rem;
                        background: var(--bg-card);
                        border-radius: 12px;
                        margin: 2rem auto;
                        max-width: 600px;
                    }
                    .error-icon {
                        font-size: 3rem;
                        color: var(--danger-color);
                        margin-bottom: 1rem;
                    }
                    .error-container ul {
                        text-align: left;
                        margin: 1rem auto;
                        max-width: 400px;
                    }
                    .error-container .btn {
                        margin-top: 1.5rem;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
    
    /**
     * Initialize home page
     */
    initializeHomePage() {
        // Home page specific initialization
        this.initializeHeroAnimations();
        this.initializeFeatureHighlights();
    }
    
    /**
     * Set up global event listeners
     */
    setupGlobalEvents() {
        // Global keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Global click handlers
        this.setupGlobalClickHandlers();
        
        // Window events
        this.setupWindowEvents();
    }
    
    /**
     * Set up global keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter to run code (if code editor is active)
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const submitBtn = document.getElementById('submit-code');
                if (submitBtn && !submitBtn.disabled) {
                    e.preventDefault();
                    submitBtn.click();
                }
            }
        });
    }
    
    /**
     * Set up global click handlers
     */
    setupGlobalClickHandlers() {
        document.addEventListener('click', (e) => {
            // Handle leaderboard modal
            if (e.target.matches('.leaderboard-btn, [data-action="open-leaderboard"]')) {
                this.openLeaderboardModal();
            }
            
            // Handle refresh dashboard
            if (e.target.matches('[data-action="refresh-dashboard"]')) {
                this.refreshDashboard();
            }
        });
    }
    
    /**
     * Set up window events
     */
    setupWindowEvents() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageVisible();
            } else {
                this.handlePageHidden();
            }
        });
        
        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleWindowResize();
            }, 250);
        });
    }
    
    /**
     * Apply saved user preferences
     */
    applySavedPreferences() {
        // Theme is handled by ThemeManager
        // Other preferences can be applied here
    }
    
    /**
     * Handle page becoming visible
     */
    handlePageVisible() {
        // Refresh data if needed
        if (this.managers.dashboard && typeof this.managers.dashboard.refreshIfStale === 'function') {
            this.managers.dashboard.refreshIfStale();
        }
    }
    
    /**
     * Handle page becoming hidden
     */
    handlePageHidden() {
        // Pause any running timers or animations
    }
    
    /**
     * Handle window resize
     */
    handleWindowResize() {
        // Trigger resize events for components that need it
        document.dispatchEvent(new CustomEvent('windowResized'));
    }
    
    /**
     * Initialize daily challenge timer
     */
    initializeDailyChallengeTimer() {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const timeLeft = tomorrow - now;
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
            const timerElement = document.getElementById('daily-timer');
            if (timerElement) {
                timerElement.textContent = `${hours}h ${minutes}m`;
            }
        };
        
        updateTimer(); // Initial update
        setInterval(updateTimer, 60000); // Update every minute
    }
    
    /**
     * Initialize activity feed
     */
    initializeActivityFeed() {
        // Activity feed functionality
        window.addActivityItem = (activity) => {
            const feed = document.getElementById('activity-feed');
            if (!feed) return;
            
            const activityHTML = `
                <div class="activity-item fade-in">
                    <div class="activity-icon">
                        <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <p class="activity-message">${activity.message}</p>
                        <span class="activity-time">Just now</span>
                    </div>
                </div>
            `;
            
            feed.insertAdjacentHTML('afterbegin', activityHTML);
            
            // Remove old activities if too many
            const activities = feed.querySelectorAll('.activity-item');
            if (activities.length > 10) {
                activities[activities.length - 1].remove();
            }
        };
    }
    
    /**
     * Get activity icon
     */
    getActivityIcon(type) {
        const icons = {
            'lesson': 'book',
            'achievement': 'trophy',
            'quiz': 'clipboard-check',
            'challenge': 'code',
            'level': 'level-up-alt'
        };
        return icons[type] || 'star';
    }
    
    /**
     * Initialize hero animations for home page
     */
    initializeHeroAnimations() {
        const hero = document.querySelector('.hero-section');
        if (!hero) return;
        
        // Add entrance animations
        const elements = hero.querySelectorAll('.hero-title, .hero-subtitle, .hero-cta');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.6s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }
    
    /**
     * Initialize feature highlights
     */
    initializeFeatureHighlights() {
        const features = document.querySelectorAll('.feature-card');
        if (features.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('animate-in');
                    }, index * 100);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        features.forEach(feature => observer.observe(feature));
    }
    
    /**
     * Open leaderboard modal
     */
    openLeaderboardModal() {
        // Create modal if it doesn't exist
        let modal = document.getElementById('leaderboard-modal');
        if (!modal) {
            modal = this.createLeaderboardModal();
            document.body.appendChild(modal);
        }
        
        // Show modal
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        
        // Load leaderboard data
        this.loadLeaderboardData();
    }
    
    /**
     * Create leaderboard modal
     */
    createLeaderboardModal() {
        const modal = document.createElement('div');
        modal.id = 'leaderboard-modal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content leaderboard-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-trophy"></i> Leaderboard</h2>
                    <button class="modal-close" onclick="closeLeaderboardModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="leaderboard-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading leaderboard...</p>
                    </div>
                    <div class="leaderboard-content" style="display: none;">
                        <div class="leaderboard-list">
                            <!-- Leaderboard items will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add close functionality
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeLeaderboardModal();
            }
        });
        
        return modal;
    }
    
    /**
     * Close leaderboard modal
     */
    closeLeaderboardModal() {
        const modal = document.getElementById('leaderboard-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    /**
     * Load leaderboard data
     */
    async loadLeaderboardData() {
        try {
            const response = await fetch('/api/dashboard/leaderboard');
            const data = await response.json();
            
            if (data.success && data.leaderboard) {
                this.renderLeaderboard(data.leaderboard);
            } else {
                this.showLeaderboardError('Failed to load leaderboard data');
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.showLeaderboardError('Network error while loading leaderboard');
        }
    }
    
    /**
     * Render leaderboard
     */
    renderLeaderboard(leaderboard) {
        const loadingElement = document.querySelector('.leaderboard-loading');
        const contentElement = document.querySelector('.leaderboard-content');
        const listElement = document.querySelector('.leaderboard-list');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (contentElement) contentElement.style.display = 'block';
        
        if (listElement && leaderboard) {
            listElement.innerHTML = leaderboard.map((user, index) => `
                <div class="leaderboard-item ${index < 3 ? 'top-three' : ''}" data-rank="${index + 1}">
                    <div class="rank-badge">
                        ${index < 3 ? 
                            `<i class="fas fa-medal ${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}"></i>` : 
                            `<span class="rank-number">${index + 1}</span>`
                        }
                    </div>
                    <div class="user-info">
                        <img src="${user.profile_picture || '/static/img/default-avatar.png'}" alt="Avatar" class="user-avatar">
                        <div class="user-details">
                            <span class="user-name">${user.display_name || user.username}</span>
                            <span class="user-level">Level ${user.level || 1}</span>
                        </div>
                    </div>
                    <div class="user-stats">
                        <div class="stat">
                            <i class="fas fa-star"></i>
                            <span>${user.xp || 0}</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-coins"></i>
                            <span>${user.pycoins || 0}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    /**
     * Show leaderboard error
     */
    showLeaderboardError(message) {
        const loadingElement = document.querySelector('.leaderboard-loading');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            `;
        }
    }
    
    /**
     * Refresh dashboard
     */
    refreshDashboard() {
        if (this.managers.dashboard && typeof this.managers.dashboard.refreshDashboard === 'function') {
            this.managers.dashboard.refreshDashboard();
        } else {
            window.showNotification('Dashboard refreshed', 'info');
        }
    }
}

// ==========================================
// LEGACY FUNCTION SUPPORT
// ==========================================

// Maintain backward compatibility for existing templates
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('active');
}

function toggleSearch() {
    const searchBar = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    
    if (searchBar) {
        const isActive = searchBar.classList.contains('active');
        
        if (isActive) {
            searchBar.classList.remove('active');
        } else {
            searchBar.classList.add('active');
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 200);
        }
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a search term');
        return;
    }
    
    window.location.href = `/lessons?search=${encodeURIComponent(query)}`;
}

// Live Clock Functionality
function updateLiveClock() {
    const clockElement = document.getElementById('live-clock');
    if (!clockElement) return;
    
    const timeDisplay = clockElement.querySelector('.time-display');
    const periodDisplay = clockElement.querySelector('.period-display');
    
    if (!timeDisplay || !periodDisplay) return;
    
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be displayed as 12
    
    timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    periodDisplay.textContent = period;
}

// Initialize and update the clock every second
function initializeLiveClock() {
    updateLiveClock();
    setInterval(updateLiveClock, 1000);
}

function showClockOptions() {
    console.log('Clock options clicked');
    // Future enhancement: show a dropdown with clock options
    // For now just log a message
}

function openLeaderboardModal() {
    if (window.mainApp) {
        window.mainApp.openLeaderboardModal();
    }
}

function closeLeaderboardModal() {
    if (window.mainApp) {
        window.mainApp.closeLeaderboardModal();
    }
}

function refreshDashboard() {
    if (window.mainApp) {
        window.mainApp.refreshDashboard();
    }
}

// Note: Global signOut function is provided by the isolated Google Auth module
// No need to redefine it here to avoid conflicts

// ==========================================
// APPLICATION BOOTSTRAP
// ==========================================

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.mainApp = new MainApp();
    
    // Initialize live clock
    initializeLiveClock();
});

// Handle Google Identity Services if available
if (typeof google !== 'undefined' && google.accounts) {
    console.log('🔐 Google Identity Services available');
    
    // Initialize Google Auth if not already initialized
    if (window.GoogleAuth && !window.GoogleAuth.isInitialized) {
        console.log('🔐 Initializing Google Auth from main.js...');
        window.GoogleAuth.init();
    }
}

console.log('📦 Main application module loaded - optimized version');

// ==========================================
// USER DROPDOWN FUNCTIONALITY
// ==========================================

/**
 * Toggle user dropdown menu
 * @param {Event} event - Click event
 */
function toggleUserDropdown(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    const menu = document.getElementById('userDropdownMenu');
    
    if (!dropdown || !menu) return;
    
    const isActive = dropdown.classList.contains('active');
    
    // Close all other dropdowns first
    closeAllDropdowns();
    
    if (!isActive) {
        dropdown.classList.add('active');
        console.log('🔽 User dropdown opened');
        
        // Ensure menu is visible and accessible
        menu.style.opacity = '1';
        menu.style.visibility = 'visible';
        menu.style.transform = 'translateY(0) scale(1)';
    }
}

/**
 * Close all dropdown menus
 */
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.user-dropdown-modern');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
        
        // Find and hide the dropdown menu
        const menu = dropdown.querySelector('.dropdown-menu-modern');
        if (menu) {
            menu.style.opacity = '';
            menu.style.visibility = '';
            menu.style.transform = '';
        }
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const userDropdown = document.getElementById('userDropdown');
    
    if (userDropdown && !userDropdown.contains(event.target)) {
        closeAllDropdowns();
    }
});

// Close dropdown when pressing Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAllDropdowns();
    }
});

// ==========================================
// GLOBAL FUNCTION DEFINITIONS
// ==========================================

// Make all manager functions globally available
window.toggleSearch = toggleSearch;
window.performSearch = performSearch;
window.openLeaderboardModal = openLeaderboardModal;
window.closeLeaderboardModal = closeLeaderboardModal;
window.refreshDashboard = refreshDashboard;
window.updateLiveClock = updateLiveClock;
window.initializeLiveClock = initializeLiveClock;
window.showClockOptions = showClockOptions;

// Application initialization flag
window.applicationLoaded = true;
