/**
 * Core App Module - ES6
 * Code with Morais - Main application logic for lesson system
 */

import { utils } from './utils.js';
import { eventBus } from './eventBus.js';
import { CONFIG } from './config.js';
import { EVENTS } from './constants.js';

/**
 * Main Application Class
 * Handles core application functionality and initialization
 */
export class App {
    constructor() {
        this.initialized = false;
        this.currentUser = null;
        this.theme = 'dark';
        this.modules = new Map();
        this.eventBus = eventBus;
        this.utils = utils;
        
        console.log('🚀 Core App initialized');
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) {
            console.warn('⚠️ App already initialized');
            return;
        }

        try {
            console.log('📱 Starting app initialization...');
            
            // Initialize core systems
            await this.initializeCore();
            
            // Load user preferences
            await this.loadUserPreferences();
            
            // Initialize page-specific functionality
            await this.initializePageSpecific();
            
            // Set up global event listeners
            this.setupGlobalEvents();
            
            // Apply theme
            this.applyTheme();
            
            this.initialized = true;
            
            // Emit app ready event
            this.eventBus.emit(EVENTS.SYSTEM_READY, {
                timestamp: Date.now(),
                theme: this.theme,
                user: this.currentUser
            });
            
            console.log('✅ App initialization complete');
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.utils.handleError(error, 'App Initialization');
        }
    }

    /**
     * Initialize core systems
     */
    async initializeCore() {
        // Initialize authentication
        await this.initializeAuth();
        
        // Initialize theme system
        this.initializeTheme();
        
        // Initialize notification system
        this.initializeNotifications();
        
        // Initialize error handling
        this.initializeErrorHandling();
        
        console.log('✅ Core systems initialized');
    }

    /**
     * Initialize authentication system
     */
    async initializeAuth() {
        try {
            // Check for stored user data
            const userData = this.utils.storage.get(CONFIG.AUTH_USER_KEY);
            if (userData) {
                this.currentUser = userData;
                console.log('👤 User loaded from storage:', userData.name || userData.email);
            }

            // Check authentication status
            const token = this.utils.storage.get(CONFIG.AUTH_TOKEN_KEY);
            if (token) {
                // Verify token validity (optional)
                await this.verifyToken(token);
            }

        } catch (error) {
            console.error('❌ Auth initialization failed:', error);
            this.clearAuthData();
        }
    }

    /**
     * Verify authentication token
     */
    async verifyToken(token) {
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Token verification failed');
            }

            const result = await response.json();
            if (result.valid) {
                console.log('✅ Token verified successfully');
                return true;
            } else {
                throw new Error('Invalid token');
            }

        } catch (error) {
            console.warn('⚠️ Token verification failed:', error);
            this.clearAuthData();
            return false;
        }
    }

    /**
     * Clear authentication data
     */
    clearAuthData() {
        this.currentUser = null;
        this.utils.storage.remove(CONFIG.AUTH_TOKEN_KEY);
        this.utils.storage.remove(CONFIG.AUTH_REFRESH_KEY);
        this.utils.storage.remove(CONFIG.AUTH_USER_KEY);
        console.log('🔐 Authentication data cleared');
    }

    /**
     * Initialize theme system
     */
    initializeTheme() {
        const savedTheme = this.utils.storage.get(CONFIG.THEME_KEY, CONFIG.DEFAULT_THEME);
        this.theme = savedTheme;
        console.log('🎨 Theme initialized:', this.theme);
    }

    /**
     * Apply theme to the application
     */
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${this.theme}`);
        
        // Update theme toggle buttons
        const themeToggles = document.querySelectorAll('.theme-toggle');
        themeToggles.forEach(toggle => {
            toggle.classList.toggle('active', toggle.dataset.theme === this.theme);
        });

        console.log(`🎨 Theme applied: ${this.theme}`);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.utils.storage.set(CONFIG.THEME_KEY, this.theme);
        this.applyTheme();
        
        this.eventBus.emit(EVENTS.THEME_CHANGED, {
            theme: this.theme,
            timestamp: Date.now()
        });
        
        this.utils.showNotification(`Theme changed to ${this.theme}`, 'success');
    }

    /**
     * Initialize notification system
     */
    initializeNotifications() {
        // Listen for notification events
        this.eventBus.on('notification:show', (data) => {
            this.utils.showNotification(data.message, data.type, data.duration);
        });

        console.log('🔔 Notification system initialized');
    }

    /**
     * Initialize error handling
     */
    initializeErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, 'JavaScript Error');
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason, 'Unhandled Promise Rejection');
        });

        console.log('⚠️ Global error handling initialized');
    }

    /**
     * Handle global errors
     */
    handleGlobalError(error, context = 'Unknown') {
        console.error(`❌ Global error in ${context}:`, error);
        
        // Don't show notifications for minor errors
        if (error && error.message && !error.message.includes('Script error')) {
            this.utils.showNotification(`Error: ${error.message}`, 'error');
        }

        // Send error to backend for logging (if configured)
        if (CONFIG.ERROR_REPORTING) {
            this.reportError(error, context);
        }
    }

    /**
     * Report error to backend
     */
    async reportError(error, context) {
        try {
            await fetch('/api/error-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    error: {
                        message: error.message,
                        stack: error.stack,
                        context: context
                    },
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    user: this.currentUser?.id || 'anonymous'
                })
            });
        } catch (reportError) {
            console.error('Failed to report error:', reportError);
        }
    }

    /**
     * Load user preferences
     */
    async loadUserPreferences() {
        try {
            const preferences = this.utils.storage.get(CONFIG.PREFERENCES_KEY, {});
            
            // Apply preferences
            if (preferences.theme) {
                this.theme = preferences.theme;
            }
            
            console.log('⚙️ User preferences loaded');
            
        } catch (error) {
            console.error('Failed to load user preferences:', error);
        }
    }

    /**
     * Initialize page-specific functionality
     */
    async initializePageSpecific() {
        const page = this.getCurrentPage();
        
        switch (page) {
            case 'lesson':
                await this.initializeLessonPage();
                break;
            case 'dashboard':
                await this.initializeDashboardPage();
                break;
            case 'profile':
                await this.initializeProfilePage();
                break;
            default:
                console.log(`📄 No specific initialization for page: ${page}`);
        }
    }

    /**
     * Get current page identifier
     */
    getCurrentPage() {
        const path = window.location.pathname;
        
        if (path.includes('/lesson/')) return 'lesson';
        if (path.includes('/dashboard')) return 'dashboard';
        if (path.includes('/profile')) return 'profile';
        if (path === '/' || path === '/home') return 'home';
        
        return 'unknown';
    }

    /**
     * Initialize lesson page
     */
    async initializeLessonPage() {
        try {
            console.log('📚 Initializing lesson page...');
            
            // Import lesson system modules
            const { default: LessonSystem } = await import('../lesson/lesson-system.js');
            
            // Initialize lesson system
            const lessonSystem = new LessonSystem();
            await lessonSystem.initialize();
            
            this.modules.set('lessonSystem', lessonSystem);
            
            console.log('✅ Lesson page initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize lesson page:', error);
            this.utils.handleError(error, 'Lesson Page Initialization');
        }
    }

    /**
     * Initialize dashboard page
     */
    async initializeDashboardPage() {
        try {
            console.log('📊 Initializing dashboard page...');
            
            // Load dashboard stats
            await this.loadDashboardStats();
            
            // Initialize dashboard interactions
            this.initializeDashboardInteractions();
            
            console.log('✅ Dashboard page initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize dashboard page:', error);
            this.utils.handleError(error, 'Dashboard Page Initialization');
        }
    }

    /**
     * Initialize profile page
     */
    async initializeProfilePage() {
        try {
            console.log('👤 Initializing profile page...');
            
            // Load profile data
            await this.loadProfileData();
            
            // Initialize profile interactions
            this.initializeProfileInteractions();
            
            console.log('✅ Profile page initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize profile page:', error);
            this.utils.handleError(error, 'Profile Page Initialization');
        }
    }

    /**
     * Load dashboard stats
     */
    async loadDashboardStats() {
        try {
            const response = await fetch('/api/dashboard/stats');
            if (!response.ok) throw new Error('Failed to load dashboard stats');
            
            const stats = await response.json();
            this.updateDashboardStats(stats);
            
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    }

    /**
     * Update dashboard stats in UI
     */
    updateDashboardStats(stats) {
        // Update XP display
        const xpElement = document.querySelector('.stat-xp .stat-value');
        if (xpElement) {
            xpElement.textContent = this.utils.formatNumber(stats.xp || 0);
        }

        // Update coins display
        const coinsElement = document.querySelector('.stat-coins .stat-value');
        if (coinsElement) {
            coinsElement.textContent = this.utils.formatNumber(stats.coins || 0);
        }

        // Update lessons completed
        const lessonsElement = document.querySelector('.stat-lessons .stat-value');
        if (lessonsElement) {
            lessonsElement.textContent = this.utils.formatNumber(stats.lessonsCompleted || 0);
        }

        // Update streak
        const streakElement = document.querySelector('.stat-streak .stat-value');
        if (streakElement) {
            streakElement.textContent = this.utils.formatNumber(stats.streak || 0);
        }
    }

    /**
     * Initialize dashboard interactions
     */
    initializeDashboardInteractions() {
        // Theme toggle
        const themeToggles = document.querySelectorAll('.theme-toggle');
        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', () => this.toggleTheme());
        });

        // Refresh button
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }
    }

    /**
     * Refresh dashboard
     */
    async refreshDashboard() {
        try {
            await this.loadDashboardStats();
            this.utils.showNotification('Dashboard refreshed!', 'success');
        } catch (error) {
            this.utils.handleError(error, 'Dashboard Refresh');
        }
    }

    /**
     * Load profile data
     */
    async loadProfileData() {
        try {
            const response = await fetch('/api/profile');
            if (!response.ok) throw new Error('Failed to load profile data');
            
            const profile = await response.json();
            this.updateProfileData(profile);
            
        } catch (error) {
            console.error('Failed to load profile data:', error);
        }
    }

    /**
     * Update profile data in UI
     */
    updateProfileData(profile) {
        // Update profile information
        const nameElement = document.querySelector('.profile-name');
        if (nameElement) {
            nameElement.textContent = profile.name || 'Unknown User';
        }

        const emailElement = document.querySelector('.profile-email');
        if (emailElement) {
            emailElement.textContent = profile.email || '';
        }
    }

    /**
     * Initialize profile interactions
     */
    initializeProfileInteractions() {
        // Profile form submission
        const profileForm = document.querySelector('.profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileSubmit(e));
        }
    }

    /**
     * Handle profile form submission
     */
    async handleProfileSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const profileData = Object.fromEntries(formData.entries());
            
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });
            
            if (!response.ok) throw new Error('Failed to update profile');
            
            this.utils.showNotification('Profile updated successfully!', 'success');
            
        } catch (error) {
            this.utils.handleError(error, 'Profile Update');
        }
    }

    /**
     * Set up global event listeners
     */
    setupGlobalEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcut(e);
        });

        // Click handlers
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        console.log('🎯 Global event listeners set up');
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcut(event) {
        // Ctrl/Cmd + K - Focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.focusSearch();
        }

        // Ctrl/Cmd + / - Show keyboard shortcuts
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            this.showKeyboardShortcuts();
        }

        // Escape - Close modals
        if (event.key === 'Escape') {
            this.closeAllModals();
        }
    }

    /**
     * Handle global clicks
     */
    handleGlobalClick(event) {
        const target = event.target;

        // Close dropdowns when clicking outside
        if (!target.closest('.dropdown')) {
            this.closeAllDropdowns();
        }

        // Handle copy buttons
        if (target.matches('.copy-btn') || target.closest('.copy-btn')) {
            this.handleCopyButton(target.closest('.copy-btn'));
        }

        // Handle modal close
        if (target.matches('.modal-close') || target.closest('.modal-close')) {
            this.closeModal(target.closest('.modal'));
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('📱 App became hidden');
        } else {
            console.log('📱 App became visible');
            // Refresh data when app becomes visible
            this.handleAppVisible();
        }
    }

    /**
     * Handle app becoming visible
     */
    handleAppVisible() {
        // Refresh dashboard if on dashboard page
        if (this.getCurrentPage() === 'dashboard') {
            this.loadDashboardStats();
        }
    }

    /**
     * Focus search input
     */
    focusSearch() {
        const searchInput = document.querySelector('.search-input, #search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    /**
     * Show keyboard shortcuts
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Ctrl + K', description: 'Focus search' },
            { key: 'Ctrl + /', description: 'Show keyboard shortcuts' },
            { key: 'Escape', description: 'Close modals' }
        ];

        const shortcutsList = shortcuts.map(shortcut => 
            `<div class="shortcut-item">
                <kbd>${shortcut.key}</kbd>
                <span>${shortcut.description}</span>
            </div>`
        ).join('');

        this.utils.showNotification(
            `<div class="keyboard-shortcuts">
                <h4>Keyboard Shortcuts</h4>
                ${shortcutsList}
            </div>`,
            'info',
            5000
        );
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal.show, .modal-overlay.show');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
    }

    /**
     * Close all dropdowns
     */
    closeAllDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown.show');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }

    /**
     * Handle copy button clicks
     */
    async handleCopyButton(button) {
        const textToCopy = button.dataset.copy || button.textContent;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            this.utils.showNotification('Copied to clipboard!', 'success', 1000);
        } catch (error) {
            console.error('Failed to copy:', error);
            this.utils.showNotification('Failed to copy', 'error');
        }
    }

    /**
     * Close modal
     */
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Get module by name
     */
    getModule(name) {
        return this.modules.get(name);
    }

    /**
     * Register module
     */
    registerModule(name, module) {
        this.modules.set(name, module);
        console.log(`📦 Module registered: ${name}`);
    }

    /**
     * Unregister module
     */
    unregisterModule(name) {
        this.modules.delete(name);
        console.log(`📦 Module unregistered: ${name}`);
    }
}

// Create global app instance
const app = new App();

// Export for ES6 modules
export { app };
export default app;

// Also make available globally
if (typeof window !== 'undefined') {
    window.app = app;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    // DOM is already ready
    app.init();
}

console.log('✅ Core app module loaded');
