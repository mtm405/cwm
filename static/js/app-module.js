// DEPRECATED: This file is now replaced by core/main.js and core/app.js
// See new architecture in static/js/core/
// This file is kept for backward compatibility only. Remove after migration is complete.

// static/js/app-module.js
// Modern ES6 module version for progressive enhancement

import { NotificationComponent } from './components/NotificationComponent.js';

class ModernApp {
    constructor() {
        this.modules = new Map();
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Modern Code with Morais App...');
            
            // Initialize notification system
            this.notificationComponent = new NotificationComponent();
            
            // Make available globally for backward compatibility
            window.modernApp = this;
            window.showNotification = (message, type, duration) => {
                this.notificationComponent.show(message, type, duration);
            };
            
            // Page-specific initialization
            this.initPageSpecificModules();
            
            console.log('✅ Modern App module initialized successfully');
            
        } catch (error) {
            console.error('❌ Modern App module initialization failed:', error);
            // Fallback gracefully - don't break the main app
        }
    }
    
    initPageSpecificModules() {
        const page = document.body.dataset.page;
        console.log(`📄 Page detected: ${page}`);
        
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
        }
    }
    
    async initDashboard() {
        try {
            // Lazy load dashboard modules when needed
            console.log('📊 Loading dashboard modules...');
        } catch (error) {
            console.warn('Dashboard modules not available:', error);
        }
    }
    
    async initLesson() {
        try {
            console.log('📚 Loading lesson modules...');
        } catch (error) {
            console.warn('Lesson modules not available:', error);
        }
    }
    
    async initLessons() {
        try {
            console.log('📋 Loading lessons modules...');
        } catch (error) {
            console.warn('Lessons modules not available:', error);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ModernApp();
    });
} else {
    new ModernApp();
}
