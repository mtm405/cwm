/**
 * Gamification Manager - Celebration animations and reward feedback
 * Code with Morais - Lesson Template System
 * Implements engaging animations for block completion, milestones, and achievements
 */

class GamificationManager {
    constructor() {
        this.celebrationContainer = null;
        this.soundEnabled = true;
        this.animationsEnabled = true;
        this.activeAnimations = new Set();
        
        // Achievement tracking
        this.achievements = new Map();
        this.milestoneReached = new Set();
        
        console.log('🎮 GamificationManager initialized');
        this.init();
    }
    
    /**
     * Initialize gamification system
     */
    init() {
        this.celebrationContainer = document.getElementById('celebration-container');
        if (!this.celebrationContainer) {
            this.createCelebrationContainer();
        }
        
        // Load user preferences
        this.loadPreferences();
        
        // Set up achievement definitions
        this.initializeAchievements();
        
        console.log('✅ Gamification system ready');
    }
    
    /**
     * Create celebration container if it doesn't exist
     */
    createCelebrationContainer() {
        this.celebrationContainer = document.createElement('div');
        this.celebrationContainer.id = 'celebration-container';
        this.celebrationContainer.className = 'celebration-container';
        document.body.appendChild(this.celebrationContainer);
    }
    
    /**
     * Initialize achievement definitions
     */
    initializeAchievements() {
        this.achievements.set('first_block', {
            name: '🚀 First Steps',
            description: 'Complete your first block',
            xp: 10,
            icon: '🚀'
        });
        
        this.achievements.set('speed_demon', {
            name: '⚡ Speed Demon',
            description: 'Complete a block in under 30 seconds',
            xp: 15,
            icon: '⚡'
        });
        
        this.achievements.set('perfect_quiz', {
            name: '🎯 Perfect Score',
            description: 'Get 100% on a quiz',
            xp: 25,
            icon: '🎯'
        });
        
        this.achievements.set('lesson_master', {
            name: '🔥 Lesson Master',
            description: 'Complete an entire lesson',
            xp: 100,
            icon: '🔥'
        });
        
        this.achievements.set('streak_master', {
            name: '🌟 Streak Master',
            description: 'Complete 5 blocks in a row',
            xp: 50,
            icon: '🌟'
        });
    }
    
    /**
     * Celebrate block completion with animations
     */
    async celebrateBlockCompletion(blockId, blockType, rewards = {}) {
        console.log(`🎉 Celebrating block completion: ${blockId}`);
        
        if (!this.animationsEnabled) return;
        
        try {
            // 1. Block completion animation
            await this.animateBlockCompletion(blockId);
            
            // 2. Show rewards popup
            if (rewards.xp || rewards.coins) {
                await this.showRewardsPopup(rewards);
            }
            
            // 3. Check for achievements
            await this.checkAchievements(blockType, rewards);
            
            // 4. Update progress indicators
            this.updateProgressIndicators();
            
        } catch (error) {
            console.error('Error in block completion celebration:', error);
        }
    }
    
    /**
     * Animate individual block completion
     */
    async animateBlockCompletion(blockId) {
        return new Promise((resolve) => {
            const blockElement = document.getElementById(`block-${blockId}`);
            if (!blockElement) {
                resolve();
                return;
            }
            
            // Add completion animation class
            blockElement.classList.add('celebrating');
            
            // Create floating checkmark
            const checkmark = document.createElement('div');
            checkmark.className = 'floating-checkmark';
            checkmark.innerHTML = '✅';
            
            const rect = blockElement.getBoundingClientRect();
            checkmark.style.left = `${rect.right - 40}px`;
            checkmark.style.top = `${rect.top + 20}px`;
            
            document.body.appendChild(checkmark);
            
            // Animate checkmark
            setTimeout(() => {
                checkmark.style.transform = 'translateY(-50px) scale(1.5)';
                checkmark.style.opacity = '0';
            }, 100);
            
            // Clean up
            setTimeout(() => {
                blockElement.classList.remove('celebrating');
                if (checkmark.parentNode) {
                    checkmark.parentNode.removeChild(checkmark);
                }
                resolve();
            }, 1000);
        });
    }
    
    /**
     * Show rewards earned popup
     */
    async showRewardsPopup(rewards) {
        return new Promise((resolve) => {
            const popup = document.createElement('div');
            popup.className = 'rewards-popup';
            popup.innerHTML = `
                <div class="rewards-popup-content">
                    <div class="rewards-header">
                        <span class="rewards-icon">🎁</span>
                        <h3>Rewards Earned!</h3>
                    </div>
                    <div class="rewards-list">
                        ${rewards.xp ? `
                            <div class="reward-item">
                                <span class="reward-icon">⭐</span>
                                <span class="reward-text">+${rewards.xp} XP</span>
                            </div>
                        ` : ''}
                        ${rewards.coins ? `
                            <div class="reward-item">
                                <span class="reward-icon">🪙</span>
                                <span class="reward-text">+${rewards.coins} PyCoins</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
            
            this.celebrationContainer.appendChild(popup);
            
            // Animate in
            setTimeout(() => popup.classList.add('show'), 50);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                popup.classList.add('hide');
                setTimeout(() => {
                    if (popup.parentNode) {
                        popup.parentNode.removeChild(popup);
                    }
                    resolve();
                }, 300);
            }, 3000);
        });
    }
    
    /**
     * Celebrate progress milestones (25%, 50%, 75%, 100%)
     */
    async celebrateMilestone(progress) {
        console.log(`🎯 Celebrating milestone: ${progress}%`);
        
        if (this.milestoneReached.has(progress)) return;
        this.milestoneReached.add(progress);
        
        const milestoneMessages = {
            25: { text: "🎯 Great start!", color: "#3498db", effect: "bounce" },
            50: { text: "🔥 Halfway there!", color: "#e67e22", effect: "pulse" },
            75: { text: "⭐ Almost done!", color: "#f39c12", effect: "shake" },
            100: { text: "🎉 Lesson mastered!", color: "#27ae60", effect: "confetti" }
        };
        
        const milestone = milestoneMessages[progress];
        if (!milestone) return;
        
        // Special handling for lesson completion
        if (progress === 100) {
            await this.celebrateLessonCompletion();
        } else {
            await this.showMilestonePopup(milestone);
        }
    }
    
    /**
     * Show milestone achievement popup
     */
    async showMilestonePopup(milestone) {
        return new Promise((resolve) => {
            const popup = document.createElement('div');
            popup.className = `milestone-popup ${milestone.effect}`;
            popup.innerHTML = `
                <div class="milestone-content" style="border-color: ${milestone.color}">
                    <div class="milestone-text">${milestone.text}</div>
                    <div class="milestone-progress-ring">
                        <svg viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" stroke="${milestone.color}" stroke-width="3" fill="none"/>
                        </svg>
                    </div>
                </div>
            `;
            
            this.celebrationContainer.appendChild(popup);
            
            // Animate in
            setTimeout(() => popup.classList.add('show'), 50);
            
            // Auto-remove
            setTimeout(() => {
                popup.classList.add('hide');
                setTimeout(() => {
                    if (popup.parentNode) {
                        popup.parentNode.removeChild(popup);
                    }
                    resolve();
                }, 500);
            }, 2500);
        });
    }
    
    /**
     * Celebrate lesson completion with confetti and trophy
     */
    async celebrateLessonCompletion() {
        console.log('🏆 Celebrating lesson completion!');
        
        // 1. Create confetti explosion
        this.createConfettiExplosion();
        
        // 2. Show trophy animation
        await this.showTrophyAnimation();
        
        // 3. Achievement unlock
        await this.unlockAchievement('lesson_master');
    }
    
    /**
     * Create confetti explosion effect
     */
    createConfettiExplosion() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 50);
        }
    }
    
    /**
     * Create individual confetti piece
     */
    createConfettiPiece(color) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.backgroundColor = color;
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        
        document.body.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        }, 5000);
    }
    
    /**
     * Show trophy animation for lesson completion
     */
    async showTrophyAnimation() {
        return new Promise((resolve) => {
            const trophy = document.createElement('div');
            trophy.className = 'trophy-animation';
            trophy.innerHTML = `
                <div class="trophy-container">
                    <div class="trophy-icon">🏆</div>
                    <div class="trophy-text">
                        <h2>Lesson Complete!</h2>
                        <p>You've mastered this lesson!</p>
                    </div>
                    <div class="trophy-sparkles">
                        <span class="sparkle">✨</span>
                        <span class="sparkle">⭐</span>
                        <span class="sparkle">✨</span>
                    </div>
                </div>
            `;
            
            this.celebrationContainer.appendChild(trophy);
            
            // Animate in
            setTimeout(() => trophy.classList.add('show'), 100);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                trophy.classList.add('hide');
                setTimeout(() => {
                    if (trophy.parentNode) {
                        trophy.parentNode.removeChild(trophy);
                    }
                    resolve();
                }, 500);
            }, 5000);
        });
    }
    
    /**
     * Check and trigger achievements
     */
    async checkAchievements(blockType, context = {}) {
        // Check for first block completion
        if (!this.hasAchievement('first_block') && this.getCompletedBlocksCount() === 1) {
            await this.unlockAchievement('first_block');
        }
        
        // Check for perfect quiz score
        if (blockType === 'quiz' && context.score === 100 && !this.hasAchievement('perfect_quiz')) {
            await this.unlockAchievement('perfect_quiz');
        }
        
        // Check for speed completion
        if (context.timeTaken && context.timeTaken < 30000 && !this.hasAchievement('speed_demon')) {
            await this.unlockAchievement('speed_demon');
        }
        
        // Check for streak
        if (this.getConsecutiveCompletions() >= 5 && !this.hasAchievement('streak_master')) {
            await this.unlockAchievement('streak_master');
        }
    }
    
    /**
     * Unlock and display achievement
     */
    async unlockAchievement(achievementId) {
        const achievement = this.achievements.get(achievementId);
        if (!achievement) return;
        
        console.log(`🏅 Achievement unlocked: ${achievement.name}`);
        
        // Mark as earned
        this.markAchievementEarned(achievementId);
        
        // Show achievement popup
        await this.showAchievementPopup(achievement);
    }
    
    /**
     * Show achievement unlock popup
     */
    async showAchievementPopup(achievement) {
        return new Promise((resolve) => {
            const popup = document.createElement('div');
            popup.className = 'achievement-popup';
            popup.innerHTML = `
                <div class="achievement-content">
                    <div class="achievement-badge">
                        <span class="achievement-icon">${achievement.icon}</span>
                    </div>
                    <div class="achievement-info">
                        <h3>Achievement Unlocked!</h3>
                        <h4>${achievement.name}</h4>
                        <p>${achievement.description}</p>
                        <div class="achievement-reward">+${achievement.xp} XP</div>
                    </div>
                </div>
            `;
            
            this.celebrationContainer.appendChild(popup);
            
            // Animate in
            setTimeout(() => popup.classList.add('show'), 100);
            
            // Auto-remove
            setTimeout(() => {
                popup.classList.add('hide');
                setTimeout(() => {
                    if (popup.parentNode) {
                        popup.parentNode.removeChild(popup);
                    }
                    resolve();
                }, 500);
            }, 4000);
        });
    }
    
    /**
     * Update progress indicators with animations
     */
    updateProgressIndicators() {
        const progressBar = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-percentage');
        
        if (progressBar) {
            progressBar.classList.add('progress-update');
            setTimeout(() => {
                progressBar.classList.remove('progress-update');
            }, 1000);
        }
        
        if (progressText) {
            progressText.classList.add('bounce');
            setTimeout(() => {
                progressText.classList.remove('bounce');
            }, 600);
        }
    }
    
    /**
     * Utility methods
     */
    getCompletedBlocksCount() {
        const progressData = window.progressTracker?.progressData;
        return progressData?.completed_blocks?.length || 0;
    }
    
    getConsecutiveCompletions() {
        // This would track consecutive completions - simplified for now
        return this.getCompletedBlocksCount();
    }
    
    hasAchievement(achievementId) {
        const earned = localStorage.getItem('earned_achievements');
        if (!earned) return false;
        return JSON.parse(earned).includes(achievementId);
    }
    
    markAchievementEarned(achievementId) {
        let earned = localStorage.getItem('earned_achievements');
        earned = earned ? JSON.parse(earned) : [];
        if (!earned.includes(achievementId)) {
            earned.push(achievementId);
            localStorage.setItem('earned_achievements', JSON.stringify(earned));
        }
    }
    
    loadPreferences() {
        const prefs = localStorage.getItem('gamification_preferences');
        if (prefs) {
            const parsed = JSON.parse(prefs);
            this.soundEnabled = parsed.soundEnabled !== false;
            this.animationsEnabled = parsed.animationsEnabled !== false;
        }
    }
    
    /**
     * Public API for external components
     */
    static getInstance() {
        if (!window.gamificationManager) {
            window.gamificationManager = new GamificationManager();
        }
        return window.gamificationManager;
    }
}

// Initialize global instance
window.gamificationManager = new GamificationManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamificationManager;
}
