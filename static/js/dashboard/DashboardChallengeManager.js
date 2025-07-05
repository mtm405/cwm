/**
 * DashboardChallengeManager.js
 * Manages the Daily Challenge display and interaction on the dashboard
 */

import { DailyChallenge } from '../challenges/DailyChallenge.js';

export class DashboardChallengeManager {
    constructor() {
        this.challengeContainer = null;
        this.dailyChallenge = null;
        this.initialized = false;
    }

    /**
     * Initialize the dashboard challenge manager
     */
    init() {
        // Find the challenge container
        this.challengeContainer = document.querySelector('#challenge-tab .card-body-modern');
        
        if (!this.challengeContainer) {
            console.error('Challenge container not found on dashboard');
            return;
        }
        
        // Show loading state immediately
        this.challengeContainer.innerHTML = `
            <div class="loading-container">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p>Loading your daily challenge...</p>
            </div>
        `;
        
        // Initialize the daily challenge
        this.dailyChallenge = new DailyChallenge();
        this.dailyChallenge.init(this.challengeContainer);
        
        // Bind refresh button
        const refreshBtn = document.querySelector('.btn-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshChallenge());
        }
        
        this.initialized = true;
    }

    /**
     * Refresh the daily challenge
     */
    async refreshChallenge() {
        if (!this.initialized || !this.dailyChallenge) {
            console.error('Challenge manager not initialized');
            return;
        }
        
        // Show loading state
        this.challengeContainer.innerHTML = `
            <div class="loading-container">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p>Refreshing challenge...</p>
            </div>
        `;
        
        // Re-initialize the challenge
        try {
            await this.dailyChallenge.fetchDailyChallenge();
            this.dailyChallenge.render();
            this.dailyChallenge.bindEvents();
        } catch (error) {
            console.error('Failed to refresh challenge:', error);
            this.challengeContainer.innerHTML = `
                <div class="challenge-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Failed to Refresh Challenge</h3>
                    <p>Sorry, we couldn't load today's challenge. Please try again later.</p>
                    <button class="btn btn-primary btn-retry">Retry</button>
                </div>
            `;
            
            this.challengeContainer.querySelector('.btn-retry').addEventListener('click', () => {
                this.refreshChallenge();
            });
        }
    }

    /**
     * Show a toast notification for streak milestones
     * @param {number} streakDays - The number of days in the streak
     */
    showStreakToast(streakDays) {
        // Get the streak toast template
        const template = document.getElementById('streak-toast-template');
        if (!template) return;
        
        // Clone the template
        const toast = template.content.cloneNode(true);
        
        // Set the streak days
        toast.querySelector('.streak-days').textContent = streakDays;
        
        // Add to notification container
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                const toastElement = container.querySelector('.streak-toast');
                if (toastElement) {
                    toastElement.classList.add('hiding');
                    setTimeout(() => {
                        toastElement.remove();
                    }, 500);
                }
            }, 5000);
        }
    }

    /**
     * Show a toast notification for completing a challenge
     */
    showChallengeCompleteToast() {
        // Get the challenge complete toast template
        const template = document.getElementById('challenge-complete-toast-template');
        if (!template) return;
        
        // Clone the template
        const toast = template.content.cloneNode(true);
        
        // Add to notification container
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                const toastElement = container.querySelector('.challenge-complete-toast');
                if (toastElement) {
                    toastElement.classList.add('hiding');
                    setTimeout(() => {
                        toastElement.remove();
                    }, 500);
                }
            }, 5000);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const challengeManager = new DashboardChallengeManager();
    challengeManager.init();
    
    // Make it available globally for debugging
    window.challengeManager = challengeManager;
});
