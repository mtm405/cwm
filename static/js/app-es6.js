/**
 * Main Application Controller - ES6 Module Version
 * Code with Morais - Application Orchestration System
 */

import { NotificationComponent } from './components/NotificationComponent.js';
import { ModalManager } from './components/modal-manager-es6.js';  
import { ThemeController } from './components/ThemeController-es6.js';

class App {
    constructor() {
        this.version = '2.0.0';
        this.initialized = false;
        this.modules = new Map();
        this.globalState = {
            user: null,
            theme: 'dark',
            currentLesson: null,
            isOnline: navigator.onLine,
            performanceMetrics: {},
            lastActivity: Date.now()
        };
        
        // Performance tracking
        this.performanceStart = performance.now();
        
        // Bind methods
        this.handleError = this.handleError.bind(this);
        this.handleOnlineStatus = this.handleOnlineStatus.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        
        console.log('🚀 Code with Morais App Controller (ES6) initialized');
        
        // Initialize immediately
        this.init();
    }
    
    async init() {
        try {
            console.log('🎯 Starting ES6 application initialization...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize core components
            await this.initializeComponents();
            
            // Setup global event handlers
            this.setupGlobalEventHandlers();
            
            // Page-specific initialization
            this.initPageSpecific();
            
            // Mark as initialized
            this.initialized = true;
            
            // Performance metrics
            const initTime = performance.now() - this.performanceStart;
            console.log(`✅ App initialized successfully in ${Math.round(initTime)}ms`);
            
            // Emit ready event
            window.dispatchEvent(new CustomEvent('appReady', { 
                detail: { 
                    app: this, 
                    initTime: initTime 
                } 
            }));
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.handleError(error, 'Application initialization failed');
        }
    }
    
    async initializeComponents() {
        console.log('🔧 Initializing core components...');
        
        // Initialize notification system
        this.modules.set('notifications', new NotificationComponent());
        
        // Initialize modal manager
        this.modules.set('modals', new ModalManager());
        
        // Initialize theme controller
        this.modules.set('theme', new ThemeController());
        
        console.log('✅ Core components initialized');
    }
    
    setupGlobalEventHandlers() {
        // Online/offline status
        window.addEventListener('online', this.handleOnlineStatus);
        window.addEventListener('offline', this.handleOnlineStatus);
        
        // Page visibility
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Global error handling
        window.addEventListener('error', this.handleError);
        window.addEventListener('unhandledrejection', this.handleError);
    }
    
    initPageSpecific() {
        const page = document.body.dataset.page;
        console.log(`📄 Initializing page: ${page}`);
        
        switch(page) {
            case 'dashboard':
                this.initDashboard();
                break;
            case 'lesson':
                this.initLesson();
                break;
            case 'lessons':
                this.initLessons();
                break;
            default:
                console.log('No specific initialization for page:', page);
        }
    }
    
    initDashboard() {
        console.log('📊 Initializing dashboard...');
        
        // Tab switching
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(tab.dataset.tab);
            });
        });
        
        // Stat cards
        document.querySelectorAll('[data-stat]').forEach(card => {
            card.addEventListener('click', () => {
                console.log('Stat clicked:', card.dataset.stat);
            });
        });
    }
    
    async initLesson() {
        console.log('📚 Initializing lesson page...');
        
        try {
            // Dynamic import for lesson-specific functionality
            const { LessonManager } = await import('./modules/LessonManager.js');
            this.modules.set('lesson', new LessonManager());
        } catch (error) {
            console.warn('LessonManager not available:', error);
        }
    }
    
    initLessons() {
        console.log('📋 Initializing lessons page...');
        
        // Lessons page functionality
        document.querySelectorAll('.lesson-card').forEach(card => {
            card.addEventListener('click', () => {
                const lessonId = card.dataset.lessonId;
                if (lessonId) {
                    window.location.href = `/lesson/${lessonId}`;
                }
            });
        });
    }
    
    switchTab(tabId) {
        // Hide all tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        // Show selected tab
        const targetTab = document.getElementById(`${tabId}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        // Update tab buttons
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
    }
    
    // Event Handlers
    handleOnlineStatus() {
        this.globalState.isOnline = navigator.onLine;
        const status = this.globalState.isOnline ? 'online' : 'offline';
        this.showNotification(`Connection ${status}`, this.globalState.isOnline ? 'success' : 'warning');
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('App went to background');
        } else {
            console.log('App came to foreground');
            this.globalState.lastActivity = Date.now();
        }
    }
    
    handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        
        if (error instanceof Error) {
            this.showError(`${context}: ${error.message}`);
        } else if (error.reason) {
            this.showError(`Promise rejection: ${error.reason}`);
        } else {
            this.showError(`An error occurred in ${context}`);
        }
    }
    
    // Utility methods
    showNotification(message, type = 'info') {
        const notifications = this.modules.get('notifications');
        if (notifications) {
            notifications.show(message, type);
        } else {
            console.log(`Notification (${type}):`, message);
        }
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    getModule(name) {
        return this.modules.get(name);
    }
    
    // State management
    setState(key, value) {
        this.globalState[key] = value;
        window.dispatchEvent(new CustomEvent('stateChange', { 
            detail: { key, value } 
        }));
    }
    
    getState(key) {
        return this.globalState[key];
    }
}

// Initialize app
window.app = new App();

// Global access for debugging and backward compatibility
window.App = App;

// Global utility functions for backward compatibility
window.showToast = function(message, type, duration) {
    if (window.app && window.app.showNotification) {
        window.app.showNotification(message, type);
    } else {
        console.log(`Toast (${type}):`, message);
    }
};

window.openModal = function(modalId) {
    if (window.app && window.app.modules.get('modals')) {
        window.app.modules.get('modals').openModal(modalId);
    }
};

window.closeModal = function(modalId) {
    if (window.app && window.app.modules.get('modals')) {
        window.app.modules.get('modals').closeModal(modalId);
    }
};

window.setTheme = function(theme) {
    if (window.app && window.app.modules.get('theme')) {
        window.app.modules.get('theme').applyTheme(theme);
    }
};

export default App;
