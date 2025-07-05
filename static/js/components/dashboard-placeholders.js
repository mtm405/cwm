/**
 * Dashboard Placeholder Interactions
 * Handles interactions with placeholder content in the dashboard
 */

class DashboardPlaceholders {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        this.setupEventListeners();
        this.initialized = true;
        console.log('Dashboard placeholders initialized');
    }

    setupEventListeners() {
        // Add event listeners to notify buttons
        const notifyButtons = document.querySelectorAll('.notify-button');
        
        notifyButtons.forEach(button => {
            button.addEventListener('click', this.handleNotifyClick.bind(this));
        });
        
        // Add hover effects to feature items
        const featureItems = document.querySelectorAll('.feature-item');
        
        featureItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const icon = item.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bounce');
                    setTimeout(() => {
                        icon.classList.remove('fa-bounce');
                    }, 1000);
                }
            });
        });
    }
    
    handleNotifyClick(event) {
        const button = event.currentTarget;
        const tabId = button.closest('.tab-pane').id;
        const featureName = tabId === 'vocabulary-tab' ? 'Vocabulary' : 'Coding Games';
        
        // Change button text and icon to show success
        button.innerHTML = '<i class="fas fa-check-circle"></i> You\'ll be notified';
        button.style.backgroundColor = '#10B981'; // Success green
        button.disabled = true;
        
        // Show toast notification
        this.showToast(`You'll be notified when ${featureName} becomes available!`);
        
        // You could also send this to the server if needed
        console.log(`User requested notification for ${featureName}`);
    }
    
    showToast(message) {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('dashboard-toast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'dashboard-toast';
            toast.className = 'toast-notification';
            document.body.appendChild(toast);
        }
        
        // Set message and show toast
        toast.textContent = message;
        toast.classList.add('show');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof DashboardPlaceholders !== 'undefined') {
        window.dashboardPlaceholders = new DashboardPlaceholders();
        window.dashboardPlaceholders.init();
    }
});
