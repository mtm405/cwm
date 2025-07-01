/**
 * Phase 6 Integration - Navigation & Activity System
 * Integration and usage examples for the new modular components
 */

/**
 * Navigation & Activity System Integration
 * This file demonstrates how to integrate and use the new modular components
 */
class Phase6Integration {
    constructor() {
        this.navigationController = null;
        this.sidebarComponent = null;
        this.activityFeed = null;
        this.activityRenderer = null;
        
        this.init();
    }
    
    /**
     * Initialize Phase 6 components
     */
    init() {
        console.log('🚀 Initializing Phase 6: Navigation & Activity System');
        
        this.initializeNavigation();
        this.initializeSidebar();
        this.initializeActivitySystem();
        this.setupIntegration();
        
        console.log('✅ Phase 6 components initialized successfully');
    }
    
    /**
     * Initialize navigation controller
     */
    initializeNavigation() {
        this.navigationController = new NavigationController();
        
        // Add navigation observers
        this.navigationController.addObserver((event, data) => {
            switch (event) {
                case 'navigationComplete':
                    console.log(`Navigation completed to: ${data.route}`);
                    this.onRouteChange(data.route);
                    break;
                    
                case 'navigationError':
                    console.error('Navigation error:', data.error);
                    this.showNotification('Navigation failed', 'error');
                    break;
                    
                case 'scroll':
                    this.onScroll(data);
                    break;
                    
                case 'viewportChange':
                    this.onViewportChange(data);
                    break;
            }
        });
        
        console.log('🧭 Navigation Controller initialized');
    }
    
    /**
     * Initialize sidebar component
     */
    initializeSidebar() {
        this.sidebarComponent = new SidebarComponent({
            selector: '.sidebar',
            toggleSelector: '.sidebar-toggle',
            breakpoint: 768,
            persistent: true,
            gestureSupport: true
        });
        
        // Add sidebar observers
        this.sidebarComponent.addObserver((event, data) => {
            switch (event) {
                case 'opened':
                    console.log('Sidebar opened');
                    this.onSidebarStateChange(true);
                    break;
                    
                case 'closed':
                    console.log('Sidebar closed');
                    this.onSidebarStateChange(false);
                    break;
                    
                case 'resize':
                    this.onSidebarResize(data);
                    break;
            }
        });
        
        console.log('📋 Sidebar Component initialized');
    }
    
    /**
     * Initialize activity system
     */
    initializeActivitySystem() {
        // Initialize activity renderer first
        this.activityRenderer = new ActivityRenderer({
            enableAnimations: true,
            enableIcons: true,
            dateFormat: 'relative',
            theme: 'default',
            compactMode: false,
            enableActions: true
        });
        
        // Initialize activity feed
        this.activityFeed = new ActivityFeed({
            container: '.activity-feed',
            apiEndpoint: '/api/activities',
            itemsPerPage: 20,
            enableRealtime: true,
            enableInfiniteScroll: true,
            refreshInterval: 30000
        });
        
        // Add activity feed observers
        this.activityFeed.addObserver((event, data) => {
            switch (event) {
                case 'newActivity':
                    console.log('New activity received:', data.activity);
                    this.onNewActivity(data.activity);
                    break;
                    
                case 'activityClick':
                    console.log('Activity clicked:', data.activity);
                    this.onActivityClick(data.activity);
                    break;
                    
                case 'error':
                    console.error('Activity feed error:', data.error);
                    this.onActivityError(data.error);
                    break;
                    
                case 'websocketConnected':
                    console.log('Activity feed real-time connected');
                    this.showNotification('Real-time updates enabled', 'success');
                    break;
                    
                case 'websocketDisconnected':
                    console.log('Activity feed real-time disconnected');
                    this.showNotification('Real-time updates paused', 'warning');
                    break;
            }
        });
        
        console.log('📱 Activity System initialized');
    }
    
    /**
     * Set up integration between components
     */
    setupIntegration() {
        // Integrate activity renderer with activity feed
        this.integrateActivityRendering();
        
        // Set up responsive behavior
        this.setupResponsiveBehavior();
        
        // Set up keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Set up theme management
        this.setupThemeManagement();
        
        console.log('🔗 Component integration completed');
    }
    
    /**
     * Integrate activity renderer with activity feed
     */
    integrateActivityRendering() {
        // Override the activity feed's render method to use our custom renderer
        const originalRenderActivityItem = this.activityFeed.renderActivityItem;
        
        this.activityFeed.renderActivityItem = (activity, index) => {
            return this.activityRenderer.render(activity, {
                enableAnimations: true,
                compactMode: window.innerWidth <= 768
            });
        };
    }
    
    /**
     * Set up responsive behavior
     */
    setupResponsiveBehavior() {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            
            // Update activity renderer for mobile
            this.activityRenderer.updateConfig({
                compactMode: isMobile,
                truncateLength: isMobile ? 100 : 150
            });
            
            // Update activity feed for mobile
            if (this.activityFeed) {
                this.activityFeed.config.itemsPerPage = isMobile ? 10 : 20;
            }
        };
        
        window.addEventListener('resize', this.debounce(handleResize, 250));
        handleResize(); // Initial call
    }
    
    /**
     * Set up keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + B: Toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.sidebarComponent.toggle();
            }
            
            // Ctrl/Cmd + R: Refresh activity feed
            if ((e.ctrlKey || e.metaKey) && e.key === 'r' && e.shiftKey) {
                e.preventDefault();
                this.activityFeed.refreshActivities();
            }
            
            // Escape: Close sidebar
            if (e.key === 'Escape') {
                this.sidebarComponent.close();
            }
        });
    }
    
    /**
     * Set up theme management
     */
    setupThemeManagement() {
        // Listen for theme changes
        if (window.ThemeManager) {
            window.ThemeManager.addObserver((theme) => {
                this.activityRenderer.updateConfig({
                    theme: theme === 'dark' ? 'minimal' : 'default'
                });
            });
        }
    }
    
    /**
     * Handle route changes
     */
    onRouteChange(route) {
        // Update activity feed based on route
        if (route.startsWith('/dashboard')) {
            this.activityFeed.handleFilterChange('all');
        } else if (route.startsWith('/lessons')) {
            this.activityFeed.handleFilterChange('lessons');
        } else if (route.startsWith('/challenges')) {
            this.activityFeed.handleFilterChange('challenges');
        }
        
        // Update page title
        this.updatePageTitle(route);
    }
    
    /**
     * Handle scroll events
     */
    onScroll(data) {
        // Hide/show navigation bar on scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (data.direction === 'down' && data.scrollY > 100) {
                navbar.classList.add('navbar-hidden');
            } else if (data.direction === 'up') {
                navbar.classList.remove('navbar-hidden');
            }
        }
    }
    
    /**
     * Handle viewport changes
     */
    onViewportChange(data) {
        // Close sidebar on mobile when viewport changes
        if (data.isMobile && this.sidebarComponent.getState().isOpen) {
            this.sidebarComponent.close();
        }
    }
    
    /**
     * Handle sidebar state changes
     */
    onSidebarStateChange(isOpen) {
        // Adjust main content area
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.toggle('sidebar-open', isOpen);
        }
        
        // Update aria attributes
        document.body.setAttribute('data-sidebar-open', String(isOpen));
    }
    
    /**
     * Handle sidebar resize
     */
    onSidebarResize(data) {
        // Adjust activity feed layout for mobile
        if (data.isMobile) {
            this.activityFeed.config.itemsPerPage = 10;
        } else {
            this.activityFeed.config.itemsPerPage = 20;
        }
    }
    
    /**
     * Handle new activity
     */
    onNewActivity(activity) {
        // Show notification for important activities
        if (activity.priority === 'high' || activity.type === 'achievement_earned') {
            this.showNotification(`New ${activity.type.replace('_', ' ')}: ${activity.title}`, 'success');
        }
        
        // Update badge count
        this.updateActivityBadge();
    }
    
    /**
     * Handle activity click
     */
    onActivityClick(activity) {
        // Navigate to activity details or perform action
        if (activity.actionUrl) {
            this.navigationController.navigateTo(activity.actionUrl);
        } else {
            this.showActivityDetails(activity);
        }
    }
    
    /**
     * Handle activity error
     */
    onActivityError(error) {
        this.showNotification('Failed to load activities. Please try again.', 'error');
    }
    
    /**
     * Show activity details in modal
     */
    showActivityDetails(activity) {
        // Implementation would depend on your modal system
        console.log('Showing activity details:', activity);
    }
    
    /**
     * Update page title based on route
     */
    updatePageTitle(route) {
        const titles = {
            '/': 'Home - Code with Morais',
            '/dashboard': 'Dashboard - Code with Morais',
            '/lessons': 'Lessons - Code with Morais',
            '/challenges': 'Challenges - Code with Morais',
            '/profile': 'Profile - Code with Morais'
        };
        
        document.title = titles[route] || 'Code with Morais';
    }
    
    /**
     * Update activity badge count
     */
    updateActivityBadge() {
        const badge = document.querySelector('.activity-badge');
        if (badge && this.activityFeed) {
            const unreadCount = this.activityFeed.state.activities
                .filter(a => !a.read).length;
            
            badge.textContent = unreadCount > 99 ? '99+' : String(unreadCount);
            badge.hidden = unreadCount === 0;
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Implementation would depend on your notification system
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // If you have a notification system available
        if (window.NotificationManager) {
            window.NotificationManager.show(message, type);
        }
    }
    
    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Get component instances (for external access)
     */
    getComponents() {
        return {
            navigationController: this.navigationController,
            sidebarComponent: this.sidebarComponent,
            activityFeed: this.activityFeed,
            activityRenderer: this.activityRenderer
        };
    }
    
    /**
     * Destroy all components
     */
    destroy() {
        if (this.navigationController) {
            this.navigationController.destroy();
        }
        
        if (this.sidebarComponent) {
            this.sidebarComponent.destroy();
        }
        
        if (this.activityFeed) {
            this.activityFeed.destroy();
        }
        
        if (this.activityRenderer) {
            this.activityRenderer.destroy();
        }
        
        console.log('🧹 Phase 6 components destroyed');
    }
}

// Example usage and integration
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Phase 6 system
    window.Phase6System = new Phase6Integration();
    
    // Make components available globally for debugging and integration
    const components = window.Phase6System.getComponents();
    window.NavigationController = components.navigationController;
    window.SidebarComponent = components.sidebarComponent;
    window.ActivityFeed = components.activityFeed;
    window.ActivityRenderer = components.activityRenderer;
    
    console.log('🎉 Phase 6: Navigation & Activity System fully loaded');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Phase6Integration;
} else {
    window.Phase6Integration = Phase6Integration;
}

// Sample CSS classes that should be added to your stylesheets
const phase6Styles = `
/* Navigation Controller Styles */
.navigation-loading {
    cursor: wait;
}

.navigation-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 2px;
    background: var(--primary-color, #007bff);
    z-index: 9999;
    transition: width 0.3s ease, opacity 0.3s ease;
}

.navbar-hidden {
    transform: translateY(-100%);
    transition: transform 0.3s ease;
}

/* Sidebar Component Styles */
.sidebar {
    transition: transform 0.3s ease;
}

.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
}

.sidebar-open .sidebar-overlay {
    opacity: 1;
    visibility: visible;
}

.main-content.sidebar-open {
    margin-left: 250px;
    transition: margin-left 0.3s ease;
}

@media (max-width: 768px) {
    .main-content.sidebar-open {
        margin-left: 0;
    }
    
    .sidebar {
        position: fixed;
        transform: translateX(-100%);
        z-index: 1000;
    }
    
    .sidebar-open .sidebar {
        transform: translateX(0);
    }
}

/* Activity Feed Styles */
.activity-feed {
    max-height: 600px;
    overflow-y: auto;
}

.activity-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid var(--border-color, #dee2e6);
    transition: background-color 0.2s ease;
}

.activity-item:hover {
    background-color: var(--hover-bg, #f8f9fa);
}

.activity-item:focus {
    outline: 2px solid var(--primary-color, #007bff);
    outline-offset: -2px;
}

.activity-animate-in {
    animation: slideInUp 0.3s ease;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.activity-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--primary-color, #007bff);
    color: white;
}

.activity-content {
    flex: 1;
    min-width: 0;
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 4px;
}

.activity-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    color: var(--text-color, #333);
}

.activity-time {
    font-size: 12px;
    color: var(--text-muted, #6c757d);
    white-space: nowrap;
    margin-left: 8px;
}

.activity-description {
    font-size: 13px;
    color: var(--text-secondary, #495057);
    line-height: 1.4;
    margin-bottom: 8px;
}

.activity-metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
}

.metadata-item {
    font-size: 11px;
    padding: 2px 6px;
    background: var(--bg-light, #f8f9fa);
    border-radius: 4px;
    color: var(--text-muted, #6c757d);
}

.activity-actions {
    display: flex;
    gap: 8px;
}

.activity-action-btn {
    font-size: 12px;
    padding: 4px 8px;
    border: 1px solid var(--border-color, #dee2e6);
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.activity-action-btn:hover {
    background: var(--primary-color, #007bff);
    color: white;
    border-color: var(--primary-color, #007bff);
}

/* Compact mode */
.activity-compact {
    padding: 8px 16px;
}

.activity-compact .activity-icon {
    width: 24px;
    height: 24px;
}

.activity-compact .activity-title {
    font-size: 13px;
}

.activity-compact .activity-description {
    font-size: 12px;
}

/* Theme variations */
.activity-theme-minimal .activity-icon {
    background: transparent;
    color: var(--text-color, #333);
    font-size: 18px;
}

.activity-theme-card .activity-item {
    background: white;
    border: 1px solid var(--border-color, #dee2e6);
    border-radius: 8px;
    margin-bottom: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
`;

// Add styles to page if not already present
if (!document.querySelector('#phase6-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'phase6-styles';
    styleSheet.textContent = phase6Styles;
    document.head.appendChild(styleSheet);
}
