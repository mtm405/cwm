/**
 * Progress Tracker - Firebase sync and visual progress management
 * Code with Morais - Lesson Template System
 * 
 * Handles:
 * - Block completion tracking
 * - Firebase progress synchronization
 * - Progress bar updates
 * - XP/PyCoins reward integration
 * - Milestone celebrations
 */

class ProgressTracker {
    constructor(lessonId, userId) {
        this.lessonId = lessonId;
        this.userId = userId;
        this.progressData = {
            completed: false,
            progress: 0,
            completed_blocks: [],
            current_block: null,
            time_spent: 0,
            last_accessed: new Date(),
            xp_earned: 0,
            coins_earned: 0
        };
        
        // Progress tracking elements
        this.progressBar = null;
        this.progressText = null;
        this.completedBlocksText = null;
        this.earnedRewardsText = null;
        
        this.init();
    }
    
    /**
     * Initialize progress tracker
     */
    async init() {
        try {
            console.log('📊 Initializing Progress Tracker...');
            
            // Get DOM elements
            this.progressBar = document.getElementById('progress-fill');
            this.progressText = document.getElementById('progress-percentage');
            this.completedBlocksText = document.querySelector('.completed-blocks');
            this.earnedRewardsText = document.getElementById('earned-rewards');
            
            // Load existing progress from Firebase
            await this.loadProgressFromFirebase();
            
            // Update visual progress
            this.updateProgressBar();
            
            console.log('✅ Progress Tracker initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Progress Tracker:', error);
        }
    }
    
    /**
     * Load progress data from Firebase
     */
    async loadProgressFromFirebase() {
        try {
            // Using existing Firebase service patterns
            if (window.firebase_service && window.firebase_service.is_available()) {
                const userProgressDoc = await window.firebase_service.db
                    .collection('users')
                    .doc(this.userId)
                    .get();
                
                if (userProgressDoc.exists) {
                    const userData = userProgressDoc.data();
                    const lessonProgress = userData.lesson_progress?.[this.lessonId];
                    
                    if (lessonProgress) {
                        this.progressData = {
                            ...this.progressData,
                            ...lessonProgress
                        };
                        console.log('📊 Loaded progress from Firebase:', this.progressData);
                    }
                }
            } else {
                console.log('🔄 Firebase not available, using local progress tracking');
                this.loadProgressFromLocalStorage();
            }
        } catch (error) {
            console.error('❌ Error loading progress from Firebase:', error);
            this.loadProgressFromLocalStorage();
        }
    }
    
    /**
     * Load progress from localStorage as fallback
     */
    loadProgressFromLocalStorage() {
        try {
            const storedProgress = localStorage.getItem(`lesson_progress_${this.lessonId}`);
            if (storedProgress) {
                this.progressData = {
                    ...this.progressData,
                    ...JSON.parse(storedProgress)
                };
                console.log('💾 Loaded progress from localStorage:', this.progressData);
            }
        } catch (error) {
            console.error('❌ Error loading from localStorage:', error);
        }
    }
    
    /**
     * Mark a block as complete
     * @param {string} blockId - ID of the completed block
     * @param {Object} blockData - Block data for reward calculation
     */
    async markBlockComplete(blockId, blockData = {}) {
        try {
            console.log(`✅ Marking block ${blockId} as complete`);
            
            // Prevent duplicate completions
            if (this.progressData.completed_blocks.includes(blockId)) {
                console.log('⚠️ Block already completed, skipping');
                return;
            }
            
            // Add to completed blocks
            this.progressData.completed_blocks.push(blockId);
            this.progressData.current_block = blockId;
            this.progressData.last_accessed = new Date();
            
            // Calculate rewards based on block type
            const rewards = this.calculateBlockRewards(blockData);
            this.progressData.xp_earned += rewards.xp;
            this.progressData.coins_earned += rewards.coins;
            
            // Update progress percentage
            this.updateProgressPercentage();
            
            // Sync to Firebase
            await this.syncToFirebase();
            
            // Save to localStorage as backup
            this.saveToLocalStorage();
            
            // Update visual progress
            this.updateProgressBar();
            
            // Trigger celebration and rewards
            this.triggerRewards(blockId, rewards, blockData);
            
            // Check for milestone celebrations
            this.checkMilestoneCelebrations();
            
            // Check for lesson completion
            if (this.progressData.progress >= 100) {
                await this.handleLessonCompletion();
            }
            
            console.log(`🎉 Block ${blockId} marked complete! Progress: ${this.progressData.progress}%`);
            
        } catch (error) {
            console.error('❌ Error marking block complete:', error);
        }
    }
    
    /**
     * Calculate rewards for completing a block
     * @param {Object} blockData - Block information
     * @returns {Object} Reward amounts
     */
    calculateBlockRewards(blockData) {
        const baseXP = 5;
        const baseCoins = 1;
        
        let xpMultiplier = 1;
        let coinMultiplier = 1;
        
        // Different rewards based on block type
        switch (blockData.type) {
            case 'text':
                xpMultiplier = 1;
                coinMultiplier = 0.5;
                break;
            case 'code_example':
                xpMultiplier = 1.5;
                coinMultiplier = 1;
                break;
            case 'interactive':
                xpMultiplier = 3;
                coinMultiplier = 2;
                break;
            case 'quiz':
                xpMultiplier = 2.5;
                coinMultiplier = 1.5;
                break;
            case 'debug':
                xpMultiplier = 4;
                coinMultiplier = 3;
                break;
            default:
                xpMultiplier = 1;
                coinMultiplier = 1;
        }
        
        return {
            xp: Math.round(baseXP * xpMultiplier),
            coins: Math.round(baseCoins * coinMultiplier)
        };
    }
    
    /**
     * Update progress percentage based on completed blocks
     */
    updateProgressPercentage() {
        // This will be calculated based on total blocks in lesson
        // For now, we'll get it from the lesson data
        const totalBlocks = this.getTotalBlocksCount();
        if (totalBlocks > 0) {
            this.progressData.progress = Math.round(
                (this.progressData.completed_blocks.length / totalBlocks) * 100
            );
        }
    }
    
    /**
     * Get total number of blocks in current lesson
     * @returns {number} Total block count
     */
    getTotalBlocksCount() {
        // This will be set by LessonPageManager when lesson data is loaded
        return window.currentLessonTotalBlocks || 1;
    }
    
    /**
     * Update the visual progress bar
     */
    updateProgressBar() {
        try {
            const progress = this.progressData.progress;
            const completedCount = this.progressData.completed_blocks.length;
            const totalBlocks = this.getTotalBlocksCount();
            
            // Update progress bar fill
            if (this.progressBar) {
                this.progressBar.style.width = `${progress}%`;
                this.progressBar.style.transition = 'width 0.5s ease-in-out';
            }
            
            // Update progress text
            if (this.progressText) {
                this.progressText.textContent = `${progress}%`;
            }
            
            // Update completed blocks text
            if (this.completedBlocksText) {
                this.completedBlocksText.textContent = `${completedCount} of ${totalBlocks} blocks completed`;
            }
            
            // Update earned rewards
            if (this.earnedRewardsText) {
                this.earnedRewardsText.innerHTML = `
                    <span class="xp-earned">+${this.progressData.xp_earned} XP</span>
                    <span class="coins-earned">+${this.progressData.coins_earned} 🪙</span>
                `;
            }
            
            // Add progress milestone classes
            this.updateProgressMilestones(progress);
            
        } catch (error) {
            console.error('❌ Error updating progress bar:', error);
        }
    }
    
    /**
     * Update progress milestone visual indicators
     * @param {number} progress - Current progress percentage
     */
    updateProgressMilestones(progress) {
        const milestones = [25, 50, 75, 100];
        const progressContainer = document.querySelector('.progress-section');
        
        if (progressContainer) {
            milestones.forEach(milestone => {
                if (progress >= milestone) {
                    progressContainer.classList.add(`milestone-${milestone}`);
                }
            });
        }
    }
    
    /**
     * Sync progress data to Firebase
     */
    async syncToFirebase() {
        try {
            if (window.firebase_service && window.firebase_service.is_available()) {
                await window.firebase_service.db
                    .collection('users')
                    .doc(this.userId)
                    .set({
                        lesson_progress: {
                            [this.lessonId]: this.progressData
                        }
                    }, { merge: true });
                
                console.log('✅ Progress synced to Firebase');
            }
        } catch (error) {
            console.error('❌ Error syncing to Firebase:', error);
        }
    }
    
    /**
     * Save progress to localStorage as backup
     */
    saveToLocalStorage() {
        try {
            localStorage.setItem(
                `lesson_progress_${this.lessonId}`, 
                JSON.stringify(this.progressData)
            );
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
        }
    }
    
    /**
     * Trigger reward animations and celebrations
     * @param {string} blockId - Completed block ID
     * @param {Object} rewards - Earned rewards
     * @param {Object} blockData - Block information
     */
    /**
     * Trigger rewards and celebrations using GamificationManager
     * @param {string} blockId - Completed block ID
     * @param {Object} rewards - Earned rewards
     * @param {Object} blockData - Block completion data
     */
    async triggerRewards(blockId, rewards, blockData) {
        try {
            console.log(`🎁 Triggering rewards for block ${blockId}:`, rewards);
            
            // Use gamification manager for celebrations
            const gamificationManager = window.gamificationManager;
            if (gamificationManager) {
                await gamificationManager.celebrateBlockCompletion(
                    blockId, 
                    blockData.type, 
                    {
                        xp: rewards.xp,
                        coins: rewards.coins,
                        score: blockData.score,
                        timeTaken: blockData.timeTaken,
                        attempt: blockData.attempt
                    }
                );
            } else {
                // Fallback to basic animation
                this.showBasicBlockAnimation(blockId);
            }
            
            // Update visual rewards display
            this.updateRewardsDisplay();
            
        } catch (error) {
            console.error('❌ Error triggering rewards:', error);
        }
    }
    
    /**
     * Basic block animation fallback
     */
    showBasicBlockAnimation(blockId) {
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockElement) {
            blockElement.classList.add('block-completed');
            
            // Add checkmark animation
            const progressIndicator = blockElement.querySelector('.block-progress-indicator');
            if (progressIndicator) {
                progressIndicator.innerHTML = '<i class="fas fa-check-circle completed"></i>';
                progressIndicator.classList.add('bounce-animation');
            }
        }
    }
    
    /**
     * Update visual rewards display in header
     */
    updateRewardsDisplay() {
        // Update XP display
        const xpDisplay = document.querySelector('.xp-earned');
        if (xpDisplay) {
            xpDisplay.textContent = this.progressData.xp_earned;
            xpDisplay.classList.add('reward-update');
            setTimeout(() => xpDisplay.classList.remove('reward-update'), 1000);
        }
        
        // Update coins display  
        const coinsDisplay = document.querySelector('.coins-earned');
        if (coinsDisplay) {
            coinsDisplay.textContent = this.progressData.coins_earned;
            coinsDisplay.classList.add('reward-update');
            setTimeout(() => coinsDisplay.classList.remove('reward-update'), 1000);
        }
    }
    
    /**
     * Check and trigger milestone celebrations using GamificationManager
     */
    checkMilestoneCelebrations() {
        const progress = this.progressData.progress;
        const gamificationManager = window.gamificationManager;
        
        if (gamificationManager) {
            // Let gamification manager handle milestone celebrations
            if (progress >= 25 && progress < 50) {
                gamificationManager.celebrateMilestone(25);
            } else if (progress >= 50 && progress < 75) {
                gamificationManager.celebrateMilestone(50);
            } else if (progress >= 75 && progress < 100) {
                gamificationManager.celebrateMilestone(75);
            } else if (progress >= 100) {
                gamificationManager.celebrateMilestone(100);
            }
        }
    }
    
    /**
     * Trigger block type specific animations
     * @param {string} blockType - Type of completed block
     */
    triggerBlockTypeAnimation(blockType) {
        switch (blockType) {
            case 'interactive':
                this.showSuccessAnimation('🎯');
                break;
            case 'quiz':
                this.showSuccessAnimation('🧠');
                break;
            case 'debug':
                this.showSuccessAnimation('🐛');
                break;
            default:
                this.showSuccessAnimation('✅');
        }
    }
    
    /**
     * Show success animation with icon
     * @param {string} icon - Icon to display
     */
    showSuccessAnimation(icon) {
        const animation = document.createElement('div');
        animation.className = 'success-animation';
        animation.innerHTML = `<span class="success-icon">${icon}</span>`;
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.remove();
        }, 1000);
    }
    
    /**
     * Trigger confetti animation
     */
    triggerConfetti() {
        // Simple confetti implementation
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti-piece';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.backgroundColor = this.getRandomColor();
                confetti.style.animationDelay = Math.random() * 3 + 's';
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 4000);
            }, i * 50);
        }
    }
    
    /**
     * Get random color for confetti
     * @returns {string} Random color
     */
    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Check if milestone has been shown
     * @param {number} percent - Milestone percentage
     * @returns {boolean} Whether milestone was shown
     */
    hasShownMilestone(percent) {
        const shown = localStorage.getItem(`milestone_${this.lessonId}_${percent}`);
        return shown === 'true';
    }
    
    /**
     * Mark milestone as shown
     * @param {number} percent - Milestone percentage
     */
    markMilestoneShown(percent) {
        localStorage.setItem(`milestone_${this.lessonId}_${percent}`, 'true');
    }
    
    /**
     * Handle lesson completion
     */
    async handleLessonCompletion() {
        try {
            console.log('🎉 Lesson completed!');
            
            this.progressData.completed = true;
            
            // Add lesson completion rewards
            const completionRewards = {
                xp: 100,
                coins: 25
            };
            
            this.progressData.xp_earned += completionRewards.xp;
            this.progressData.coins_earned += completionRewards.coins;
            
            // Sync to Firebase
            await this.syncToFirebase();
            
            // Update user's total XP and coins
            await this.updateUserTotals(completionRewards);
            
            // Show lesson completion celebration
            this.showLessonCompletionCelebration();
            
        } catch (error) {
            console.error('❌ Error handling lesson completion:', error);
        }
    }
    
    /**
     * Update user's total XP and coins in Firebase
     * @param {Object} rewards - Rewards to add
     */
    async updateUserTotals(rewards) {
        try {
            if (window.firebase_service && window.firebase_service.is_available()) {
                await window.firebase_service.db
                    .collection('users')
                    .doc(this.userId)
                    .update({
                        xp: window.firebase.firestore.FieldValue.increment(rewards.xp),
                        pycoins: window.firebase.firestore.FieldValue.increment(rewards.coins)
                    });
                
                console.log('✅ User totals updated');
            }
        } catch (error) {
            console.error('❌ Error updating user totals:', error);
        }
    }
    
    /**
     * Show lesson completion celebration
     */
    showLessonCompletionCelebration() {
        const celebration = document.createElement('div');
        celebration.className = 'lesson-completion-celebration';
        celebration.innerHTML = `
            <div class="completion-modal">
                <div class="completion-content">
                    <div class="trophy-icon">🏆</div>
                    <h2>Lesson Mastered!</h2>
                    <p>Congratulations! You've completed this lesson.</p>
                    <div class="completion-rewards">
                        <span class="completion-xp">+100 XP</span>
                        <span class="completion-coins">+25 🪙</span>
                    </div>
                    <button class="btn btn-primary" onclick="this.parentElement.parentElement.parentElement.remove()">
                        Continue Learning
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(celebration);
        
        // Trigger confetti
        this.triggerConfetti();
    }
    
    /**
     * Get current progress data
     * @returns {Object} Current progress data
     */
    getProgressData() {
        return { ...this.progressData };
    }
    
    /**
     * Reset progress (for testing/admin purposes)
     */
    async resetProgress() {
        try {
            this.progressData = {
                completed: false,
                progress: 0,
                completed_blocks: [],
                current_block: null,
                time_spent: 0,
                last_accessed: new Date(),
                xp_earned: 0,
                coins_earned: 0
            };
            
            await this.syncToFirebase();
            this.saveToLocalStorage();
            this.updateProgressBar();
            
            console.log('🔄 Progress reset successfully');
        } catch (error) {
            console.error('❌ Error resetting progress:', error);
        }
    }
}

// Export for use in other modules
window.ProgressTracker = ProgressTracker;
