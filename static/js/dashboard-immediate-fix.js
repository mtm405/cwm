/**
 * Immediate Dashboard Greeting Fix
 * This script should be included inline in the dashboard template head
 * to prevent the "Student" flash before the main dashboard JS loads
 */

(function() {
    // Only run if we're on the dashboard page
    if (!window.location.pathname.includes('dashboard')) return;
    
    // Function to get time-based greeting
    function getTimeOfDay() {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            return 'Good morning';
        } else if (hour >= 12 && hour < 17) {
            return 'Good afternoon';
        } else if (hour >= 17 && hour < 22) {
            return 'Good evening';
        } else {
            return 'Good night';
        }
    }
    
    // Update welcome message immediately when DOM is ready
    function updateWelcomeImmediately() {
        const welcomeElement = document.querySelector('#welcome-message');
        if (welcomeElement) {
            const timeOfDay = getTimeOfDay();
            
            // Check if we have user data available globally
            let displayName = 'Guest';
            
            // Try to get from template variables or global scope
            if (typeof window.currentUser !== 'undefined' && window.currentUser) {
                displayName = window.currentUser.display_name || 
                             window.currentUser.first_name || 
                             window.currentUser.username || 'Guest';
            } else if (typeof user !== 'undefined' && user) {
                displayName = user.display_name || 
                             user.first_name || 
                             user.username || 'Guest';
            }
            
            // Only update if the current text contains "Student" or default text
            const currentText = welcomeElement.textContent;
            if (currentText.includes('Student') || 
                currentText.includes('Welcome back') || 
                currentText.trim() === '' ||
                currentText.includes('🚀')) {
                welcomeElement.textContent = `${timeOfDay}, ${displayName}! 🚀`;
            }
        }
    }
    
    // Run immediately if DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateWelcomeImmediately);
    } else {
        updateWelcomeImmediately();
    }
})();
