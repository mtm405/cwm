/**
 * Firebase Dashboard Manager
 * Extends ModernDashboardManager with real-time Firebase integration
 * Provides live updates for XP, PyCoins, and progress without page refresh
 */

class FirebaseDashboard extends ModernDashboardManager {
    constructor() {
        super();
        this.firebaseConfig = null;
        this.db = null;
        this.listeners = [];
        this.currentUserId = null;
        this.animationQueue = [];
        this.isProcessingAnimations = false;
    }

    async init() {
        console.log('🚀 Initializing Firebase Dashboard...');
        
        try {
            // Initialize base dashboard first
            await super.init();
            
            // Initialize Firebase components
            await this.initFirebase();
            await this.initFirebaseListeners();
            
            console.log('✅ Firebase Dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Firebase Dashboard initialization failed:', error);
            // Fallback to regular dashboard functionality
            this.showErrorState();
        }
    }

    async initFirebase() {
        try {
            // Get Firebase config from global window object or API
            if (window.firebaseConfig) {
                this.firebaseConfig = window.firebaseConfig;
            } else {
                // Fetch Firebase config from API endpoint
                const response = await fetch('/api/firebase-config');
                this.firebaseConfig = await response.json();
            }

            // Initialize Firebase if not already done
            if (!window.firebase) {
                throw new Error('Firebase SDK not loaded');
            }

            if (!firebase.apps.length) {
                firebase.initializeApp(this.firebaseConfig);
            }

            this.db = firebase.firestore();
            console.log('✅ Firebase initialized');
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
            throw error;
        }
    }

    async initFirebaseListeners() {
        try {
            // Get current user ID from the dashboard or API
            this.currentUserId = await this.getCurrentUserId();
            
            if (!this.currentUserId) {
                console.warn('⚠️ No user ID found, skipping Firebase listeners');
                return;
            }

            // Listen to user stats changes
            const userStatsListener = this.db
                .collection('users')
                .doc(this.currentUserId)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        this.handleUserStatsUpdate(userData);
                    }
                }, (error) => {
                    console.error('❌ User stats listener error:', error);
                });

            // Listen to user activities (for XP gains)
            const activitiesListener = this.db
                .collection('user_activities')
                .where('user_id', '==', this.currentUserId)
                .orderBy('timestamp', 'desc')
                .limit(10)
                .onSnapshot((snapshot) => {
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === 'added') {
                            const activity = change.doc.data();
                            this.handleNewActivity(activity);
                        }
                    });
                }, (error) => {
                    console.error('❌ Activities listener error:', error);
                });

            this.listeners.push(userStatsListener, activitiesListener);
            console.log('✅ Firebase listeners initialized');
        } catch (error) {
            console.error('❌ Firebase listeners initialization failed:', error);
            throw error;
        }
    }

    async getCurrentUserId() {
        try {
            // Try to get from global user object first
            if (window.currentUser && window.currentUser.id) {
                return window.currentUser.id;
            }

            // Try to get from API
            const response = await fetch('/api/user/current');
            if (response.ok) {
                const userData = await response.json();
                return userData.id;
            }

            // Try to get from dashboard element
            const dashboardEl = document.querySelector('[data-user-id]');
            if (dashboardEl) {
                return dashboardEl.dataset.userId;
            }

            return null;
        } catch (error) {
            console.error('❌ Failed to get current user ID:', error);
            return null;
        }
    }

    handleUserStatsUpdate(userData) {
        console.log('📊 User stats updated:', userData);
        
        // Update stats with animation
        const statsToUpdate = [
            { key: 'xp', value: userData.xp, label: 'Total XP' },
            { key: 'pycoins', value: userData.pycoins, label: 'PyCoins' },
            { key: 'level', value: userData.level, label: 'Current Level' },
            { key: 'streak', value: userData.streak, label: 'Day Streak' }
        ];

        statsToUpdate.forEach(stat => {
            this.updateUserStats(stat.key, stat.value, stat.label);
        });
    }

    updateUserStats(statKey, newValue, label) {
        const statCard = document.querySelector(`[data-stat="${statKey}"]`);
        if (!statCard) return;

        const valueElement = statCard.querySelector('.stat-value-large');
        if (!valueElement) return;

        const currentValue = parseInt(valueElement.textContent) || 0;
        const difference = newValue - currentValue;

        if (difference !== 0) {
            this.animateStatUpdate(statCard, currentValue, newValue, difference, label);
        }
    }

    animateStatUpdate(statCard, oldValue, newValue, difference, label) {
        // Add to animation queue
        this.animationQueue.push({
            statCard,
            oldValue,
            newValue,
            difference,
            label,
            timestamp: Date.now()
        });

        // Process queue if not already processing
        if (!this.isProcessingAnimations) {
            this.processAnimationQueue();
        }
    }

    async processAnimationQueue() {
        this.isProcessingAnimations = true;

        while (this.animationQueue.length > 0) {
            const animation = this.animationQueue.shift();
            await this.executeStatAnimation(animation);
            // Small delay between animations
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        this.isProcessingAnimations = false;
    }

    async executeStatAnimation(animation) {
        const { statCard, oldValue, newValue, difference, label } = animation;
        
        try {
            // Add pulsing effect to card
            statCard.classList.add('stat-updating');

            // Show XP gain animation if it's XP
            if (statCard.dataset.stat === 'xp' && difference > 0) {
                this.showXPGainAnimation(difference, statCard);
            }

            // Animate the number change
            const valueElement = statCard.querySelector('.stat-value-large');
            await this.animateNumberChange(valueElement, oldValue, newValue);

            // Update trend indicator
            this.updateTrendIndicator(statCard, difference);

            // Remove updating class
            setTimeout(() => {
                statCard.classList.remove('stat-updating');
            }, 1000);

            console.log(`✅ Animated ${label}: ${oldValue} → ${newValue} (${difference > 0 ? '+' : ''}${difference})`);
        } catch (error) {
            console.error('❌ Animation execution failed:', error);
            statCard.classList.remove('stat-updating');
        }
    }

    async animateNumberChange(element, startValue, endValue) {
        const duration = 800; // ms
        const steps = 30;
        const stepValue = (endValue - startValue) / steps;
        const stepDuration = duration / steps;

        return new Promise(resolve => {
            let currentStep = 0;
            
            const timer = setInterval(() => {
                currentStep++;
                const currentValue = Math.round(startValue + (stepValue * currentStep));
                element.textContent = currentValue;

                if (currentStep >= steps) {
                    clearInterval(timer);
                    element.textContent = endValue; // Ensure final value is exact
                    resolve();
                }
            }, stepDuration);
        });
    }

    showXPGainAnimation(xpGained, nearElement) {
        // Create floating XP gain element
        const xpGainEl = document.createElement('div');
        xpGainEl.className = 'xp-gain-float';
        xpGainEl.textContent = `+${xpGained} XP`;
        
        // Position relative to the stat card
        const rect = nearElement.getBoundingClientRect();
        xpGainEl.style.position = 'fixed';
        xpGainEl.style.left = `${rect.left + rect.width / 2}px`;
        xpGainEl.style.top = `${rect.top}px`;
        xpGainEl.style.zIndex = '1000';
        
        document.body.appendChild(xpGainEl);

        // Animate upward
        setTimeout(() => {
            xpGainEl.style.transform = 'translateY(-100px)';
            xpGainEl.style.opacity = '0';
        }, 100);

        // Remove element
        setTimeout(() => {
            document.body.removeChild(xpGainEl);
        }, 1500);
    }

    updateTrendIndicator(statCard, difference) {
        const trendElement = statCard.querySelector('.stat-trend');
        if (!trendElement) return;

        if (difference > 0) {
            trendElement.textContent = `+${difference}`;
            trendElement.className = 'stat-trend positive';
        } else if (difference < 0) {
            trendElement.textContent = `${difference}`;
            trendElement.className = 'stat-trend negative';
        }

        // Auto-clear trend after a few seconds
        setTimeout(() => {
            trendElement.className = 'stat-trend';
        }, 3000);
    }

    handleNewActivity(activity) {
        console.log('🎯 New activity detected:', activity);
        
        // Show activity toast notification
        this.showActivityToast(activity);
        
        // Trigger special animations for certain activities
        if (activity.type === 'lesson_completed') {
            this.triggerLessonCompletionCelebration();
        } else if (activity.type === 'quiz_passed') {
            this.triggerQuizSuccessCelebration();
        } else if (activity.type === 'achievement_unlocked') {
            this.triggerAchievementCelebration(activity.achievement);
        }
    }

    showActivityToast(activity) {
        // Use existing toast system or create new one
        const message = this.formatActivityMessage(activity);
        if (typeof this.showToast === 'function') {
            this.showToast(message, 'success');
        }
    }

    formatActivityMessage(activity) {
        const messages = {
            'lesson_completed': `🎓 Lesson completed! +${activity.xp_gained} XP`,
            'quiz_passed': `✅ Quiz passed! +${activity.xp_gained} XP`,
            'daily_challenge_completed': `🏆 Daily challenge completed! +${activity.xp_gained} XP`,
            'achievement_unlocked': `🏅 Achievement unlocked: ${activity.achievement.name}!`,
            'streak_milestone': `🔥 ${activity.streak_days} day streak!`
        };

        return messages[activity.type] || `Activity completed! +${activity.xp_gained || 0} XP`;
    }

    triggerLessonCompletionCelebration() {
        // Add confetti or celebration animation
        console.log('🎉 Lesson completion celebration!');
    }

    triggerQuizSuccessCelebration() {
        // Add success animation
        console.log('✨ Quiz success celebration!');
    }

    triggerAchievementCelebration(achievement) {
        // Show achievement popup
        console.log('🏆 Achievement celebration:', achievement);
    }

    // Override destroy method to clean up Firebase listeners
    destroy() {
        // Clean up Firebase listeners
        this.listeners.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        this.listeners = [];

        // Call parent destroy if it exists
        if (super.destroy) {
            super.destroy();
        }

        console.log('🧹 Firebase Dashboard cleaned up');
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    // Replace the global dashboard manager with Firebase version
    window.dashboardManager = new FirebaseDashboard();
    window.dashboardManager.init();
});

// For external refresh calls
window.refreshDashboard = () => {
    if (window.dashboardManager && typeof window.dashboardManager.refreshDashboard === 'function') {
        window.dashboardManager.refreshDashboard();
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseDashboard;
}
