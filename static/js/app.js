/**
 * Main Application Controller - ES6 Module
 * Code with Morais - Clean ES6 Implementation
 */

import { NotificationComponent } from './components/NotificationComponent.js';
import { ModalManager } from './components/modal-manager.js';
import { ThemeController } from './components/ThemeController.js';

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
            lastActivity: Date.now()
        };
        
        console.log('🚀 Code with Morais App Controller (ES6) initialized');
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
            
            console.log('✅ App initialized successfully');
            
            // Emit ready event
            window.dispatchEvent(new CustomEvent('appReady', { 
                detail: { app: this } 
            }));
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.handleError(error, 'Application initialization failed');
        }
    }
    
    async initializeComponents() {
        console.log('🔧 Initializing core components...');
        
        try {
            // Initialize notification system
            this.modules.set('notifications', new NotificationComponent());
            console.log('✅ NotificationComponent initialized');
            
            // Initialize modal manager
            this.modules.set('modals', new ModalManager());
            console.log('✅ ModalManager initialized');
            
            // Initialize theme controller
            this.modules.set('theme', new ThemeController());
            console.log('✅ ThemeController initialized');
            
            console.log('✅ Core components initialized');
            
        } catch (error) {
            console.error('❌ Component initialization failed:', error);
            throw error;
        }
    }
    
    setupGlobalEventHandlers() {
        // Online/offline status
        window.addEventListener('online', () => {
            this.globalState.isOnline = true;
            this.showNotification('Connection restored', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.globalState.isOnline = false;
            this.showNotification('Connection lost', 'warning');
        });
        
        // Page visibility
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.globalState.lastActivity = Date.now();
            }
        });
        
        // Global error handling
        window.addEventListener('error', (error) => {
            this.handleError(error, 'Global error');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason, 'Unhandled promise rejection');
        });
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
            console.log('✅ LessonManager loaded');
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
    
    handleError(error, context = 'Unknown') {
        console.error(`Error in ${context}:`, error);
        
        if (error instanceof Error) {
            this.showError(`${context}: ${error.message}`);
        } else if (typeof error === 'string') {
            this.showError(`${context}: ${error}`);
        } else {
            this.showError(`An error occurred in ${context}`);
        }
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
