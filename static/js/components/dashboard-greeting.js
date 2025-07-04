/**
 * Dashboard Greeting System
 * Handles time-based greeting messages for dashboard header
 */

class DashboardGreeting {
    constructor() {
        this.welcomeElement = null;
        this.userFirstName = null;
    }

    init() {
        this.welcomeElement = document.getElementById('welcome-message');
        if (!this.welcomeElement) {
            console.warn('Welcome message element not found');
            return;
        }
        
        // Get user first name from data attribute or global variable
        this.userFirstName = this.getUserFirstName();
        this.updateGreeting();
    }

    getUserFirstName() {
        // Try to get from data attribute first
        const firstName = this.welcomeElement.getAttribute('data-first-name');
        if (firstName) {
            return firstName;
        }
        
        // Fallback to global variable if available
        if (typeof window.dashboardUserData !== 'undefined' && window.dashboardUserData.firstName) {
            return window.dashboardUserData.firstName;
        }
        
        return 'Guest';
    }

    getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return 'Good morning';
        if (hour >= 12 && hour < 17) return 'Good afternoon';
        if (hour >= 17 && hour < 22) return 'Good evening';
        return 'Good night';
    }

    updateGreeting() {
        const greeting = this.getTimeBasedGreeting();
        this.welcomeElement.innerHTML = `${greeting}, ${this.userFirstName}! <i class="fas fa-code"></i>`;
    }
}

// Export for use in other modules
window.DashboardGreeting = DashboardGreeting;
