/**
 * Progress Bar Animation System
 * Handles dynamic progress bar width setting and animations
 */

class ProgressBarManager {
    constructor() {
        this.progressElements = [];
        this.init();
    }

    init() {
        // Find all progress elements with data-progress attributes
        this.progressElements = document.querySelectorAll('[data-progress]');
        
        if (this.progressElements.length > 0) {
            this.initializeProgressBars();
        }
    }

    initializeProgressBars() {
        this.progressElements.forEach((element, index) => {
            const progressValue = element.getAttribute('data-progress');
            
            if (progressValue && !isNaN(progressValue)) {
                // Set width with slight delay for staggered animation
                setTimeout(() => {
                    element.style.width = `${progressValue}%`;
                    element.classList.add('progress-animated');
                }, index * 100);
            }
        });
    }

    // Method to update progress bar dynamically
    updateProgress(element, newValue) {
        if (element && !isNaN(newValue)) {
            element.setAttribute('data-progress', newValue);
            element.style.width = `${newValue}%`;
        }
    }

    // Method to find and update progress bar by selector
    updateProgressBySelector(selector, newValue) {
        const element = document.querySelector(selector);
        if (element) {
            this.updateProgress(element, newValue);
        }
    }
}

// Make available globally
window.ProgressBarManager = ProgressBarManager;

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.progressBarManager = new ProgressBarManager();
});
