/**
 * XP Animation System
 * Handles all XP-related animations, level ups, and gamification effects
 */

class XPAnimationSystem {
    constructor() {
        this.isInitialized = false;
        this.animationQueue = [];
        this.isProcessing = false;
        this.settings = {
            xpFloatDuration: 2000,
            levelUpDuration: 3000,
            burstParticleCount: 12,
            sparkleCount: 8,
            animationDelay: 100
        };
        
        // Track XP for level calculation
        this.currentXP = 0;
        this.currentLevel = 1;
        this.xpToNextLevel = 100;
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        try {
            this.loadUserData();
            this.setupEventListeners();
            this.createAnimationContainer();
            
            this.isInitialized = true;
            console.log('✅ XP Animation System initialized');
        } catch (error) {
            console.error('❌ XP Animation System initialization failed:', error);
        }
    }
    
    loadUserData() {
        // Try to get user data from various sources
        if (window.currentUser) {
            this.currentXP = window.currentUser.xp || 0;
            this.currentLevel = window.currentUser.level || 1;
        } else {
            // Try to get from dashboard elements
            const xpElement = document.querySelector('[data-stat="xp"] .stat-value-large');
            const levelElement = document.querySelector('[data-stat="level"] .stat-value-large');
            
            if (xpElement) this.currentXP = parseInt(xpElement.textContent) || 0;
            if (levelElement) this.currentLevel = parseInt(levelElement.textContent) || 1;
        }
        
        this.calculateXPToNextLevel();
    }
    
    calculateXPToNextLevel() {
        // Simple XP progression: level * 100 XP needed for next level
        const xpForCurrentLevel = (this.currentLevel - 1) * 100;
        const xpForNextLevel = this.currentLevel * 100;
        this.xpToNextLevel = xpForNextLevel - this.currentXP;
    }
    
    setupEventListeners() {
        // Listen for custom XP events
        document.addEventListener('xpGained', (event) => {
            this.handleXPGain(event.detail);
        });
        
        document.addEventListener('levelUp', (event) => {
            this.handleLevelUp(event.detail);
        });
        
        document.addEventListener('achievementUnlocked', (event) => {
            this.handleAchievement(event.detail);
        });
    }
    
    createAnimationContainer() {
        if (!document.getElementById('xp-animation-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'xp-animation-overlay';
            overlay.className = 'xp-animation-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
            `;
            document.body.appendChild(overlay);
        }
    }
    
    // Main XP gain handler
    async handleXPGain(data) {
        const { amount, source, position, animationType = 'float' } = data;
        
        if (!amount || amount <= 0) return;
        
        // Update internal XP tracking
        const oldXP = this.currentXP;
        this.currentXP += amount;
        
        // Check for level up
        const oldLevel = this.currentLevel;
        const newLevel = this.calculateLevel(this.currentXP);
        
        // Queue XP animation
        this.queueAnimation({
            type: 'xp-gain',
            amount,
            source,
            position: position || this.getDefaultPosition(),
            animationType
        });
        
        // Queue level up animation if needed
        if (newLevel > oldLevel) {
            this.currentLevel = newLevel;
            this.queueAnimation({
                type: 'level-up',
                oldLevel,
                newLevel,
                delay: 1000 // Delay after XP animation
            });
        }
        
        // Process animation queue
        this.processAnimationQueue();
        
        // Show toast notification
        if (window.achievementToastManager) {
            window.achievementToastManager.showXPGain(amount, source);
        }
    }
    
    calculateLevel(totalXP) {
        // Simple level calculation: 100 XP per level
        return Math.floor(totalXP / 100) + 1;
    }
    
    getDefaultPosition() {
        // Default to center-top of screen
        return {
            x: window.innerWidth / 2,
            y: window.innerHeight * 0.3
        };
    }
    
    queueAnimation(animationData) {
        this.animationQueue.push({
            ...animationData,
            id: Date.now() + Math.random(),
            timestamp: Date.now()
        });
    }
    
    async processAnimationQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        while (this.animationQueue.length > 0) {
            const animation = this.animationQueue.shift();
            
            if (animation.delay) {
                await this.sleep(animation.delay);
            }
            
            await this.executeAnimation(animation);
            await this.sleep(this.settings.animationDelay);
        }
        
        this.isProcessing = false;
    }
    
    async executeAnimation(animation) {
        try {
            switch (animation.type) {
                case 'xp-gain':
                    await this.animateXPGain(animation);
                    break;
                case 'level-up':
                    await this.animateLevelUp(animation);
                    break;
                case 'burst':
                    await this.animateBurst(animation);
                    break;
                case 'sparkle':
                    await this.animateSparkle(animation);
                    break;
                default:
                    console.warn('Unknown animation type:', animation.type);
            }
        } catch (error) {
            console.error('Animation execution failed:', error);
        }
    }
    
    async animateXPGain(animation) {
        const { amount, position, animationType } = animation;
        const overlay = document.getElementById('xp-animation-overlay');
        
        const element = document.createElement('div');
        element.className = `xp-float-animation xp-${animationType}`;
        element.innerHTML = `
            <div class="xp-amount">+${amount}</div>
            <div class="xp-label">XP</div>
            <div class="xp-glow"></div>
        `;
        
        // Position the element
        element.style.left = `${position.x}px`;
        element.style.top = `${position.y}px`;
        element.style.transform = 'translate(-50%, -50%)';
        
        overlay.appendChild(element);
        
        // Animate
        await this.sleep(50); // Brief delay for DOM update
        
        if (animationType === 'burst') {
            await this.addBurstEffect(element, position);
        } else if (animationType === 'sparkle') {
            await this.addSparkleEffect(element, position);
        }
        
        // Float upward
        element.style.transition = 'all 2s ease-out';
        element.style.transform = 'translate(-50%, -150px)';
        element.style.opacity = '0';
        
        // Clean up
        setTimeout(() => {
            if (overlay.contains(element)) {
                overlay.removeChild(element);
            }
        }, 2000);
    }
    
    async addBurstEffect(parentElement, position) {
        const overlay = document.getElementById('xp-animation-overlay');
        
        for (let i = 0; i < this.settings.burstParticleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'xp-burst-particle';
            
            const angle = (360 / this.settings.burstParticleCount) * i;
            const distance = 60 + Math.random() * 40;
            
            particle.style.left = `${position.x}px`;
            particle.style.top = `${position.y}px`;
            
            overlay.appendChild(particle);
            
            // Animate particle
            setTimeout(() => {
                const endX = position.x + Math.cos(angle * Math.PI / 180) * distance;
                const endY = position.y + Math.sin(angle * Math.PI / 180) * distance;
                
                particle.style.transition = 'all 1s ease-out';
                particle.style.transform = `translate(-50%, -50%) translate(${endX - position.x}px, ${endY - position.y}px)`;
                particle.style.opacity = '0';
                
                setTimeout(() => {
                    if (overlay.contains(particle)) {
                        overlay.removeChild(particle);
                    }
                }, 1000);
            }, 50);
        }
    }
    
    async addSparkleEffect(parentElement, position) {
        const overlay = document.getElementById('xp-animation-overlay');
        
        for (let i = 0; i < this.settings.sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'xp-sparkle-particle';
            sparkle.textContent = '✨';
            
            const offsetX = (Math.random() - 0.5) * 100;
            const offsetY = (Math.random() - 0.5) * 100;
            
            sparkle.style.left = `${position.x + offsetX}px`;
            sparkle.style.top = `${position.y + offsetY}px`;
            sparkle.style.animationDelay = `${i * 0.1}s`;
            
            overlay.appendChild(sparkle);
            
            // Clean up
            setTimeout(() => {
                if (overlay.contains(sparkle)) {
                    overlay.removeChild(sparkle);
                }
            }, 2000);
        }
    }
    
    async animateLevelUp(animation) {
        const { newLevel } = animation;
        
        // Show full-screen level up animation
        const overlay = document.getElementById('xp-animation-overlay');
        
        const levelUpElement = document.createElement('div');
        levelUpElement.className = 'level-up-fullscreen';
        levelUpElement.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-rays"></div>
                <div class="level-up-text">
                    <h1>LEVEL UP!</h1>
                    <h2>Level ${newLevel}</h2>
                </div>
                <div class="level-up-celebration">🎉</div>
            </div>
        `;
        
        overlay.appendChild(levelUpElement);
        
        // Animate in
        await this.sleep(100);
        levelUpElement.classList.add('active');
        
        // Show toast
        if (window.achievementToastManager) {
            window.achievementToastManager.showLevelUp(newLevel);
        }
        
        // Auto-remove after duration
        setTimeout(() => {
            levelUpElement.classList.remove('active');
            setTimeout(() => {
                if (overlay.contains(levelUpElement)) {
                    overlay.removeChild(levelUpElement);
                }
            }, 500);
        }, this.settings.levelUpDuration);
    }
    
    async handleLevelUp(data) {
        const { newLevel, oldLevel } = data;
        
        this.queueAnimation({
            type: 'level-up',
            newLevel,
            oldLevel
        });
        
        this.processAnimationQueue();
    }
    
    async handleAchievement(data) {
        // Trigger achievement animation and celebration
        console.log('🏆 Achievement unlocked:', data);
        
        if (window.achievementToastManager) {
            window.achievementToastManager.showAchievement(data);
        }
        
        // Add special celebration effects
        this.queueAnimation({
            type: 'burst',
            position: this.getDefaultPosition(),
            amount: data.xp || 0
        });
    }
    
    // Utility methods
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Public API methods
    triggerXPGain(amount, options = {}) {
        const event = new CustomEvent('xpGained', {
            detail: {
                amount,
                source: options.source || 'manual',
                position: options.position || this.getDefaultPosition(),
                animationType: options.animationType || 'float'
            }
        });
        document.dispatchEvent(event);
    }
    
    triggerLevelUp(newLevel, oldLevel = this.currentLevel) {
        const event = new CustomEvent('levelUp', {
            detail: { newLevel, oldLevel }
        });
        document.dispatchEvent(event);
    }
    
    triggerAchievement(achievement) {
        const event = new CustomEvent('achievementUnlocked', {
            detail: achievement
        });
        document.dispatchEvent(event);
    }
    
    // Get position relative to an element
    getElementPosition(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return this.getDefaultPosition();
        
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
    }
    
    destroy() {
        const overlay = document.getElementById('xp-animation-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
        
        this.animationQueue = [];
        this.isProcessing = false;
        this.isInitialized = false;
        
        console.log('🧹 XP Animation System destroyed');
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    window.xpAnimationSystem = new XPAnimationSystem();
});

// Global helper functions for easy access
window.triggerXPGain = (amount, options) => {
    if (window.xpAnimationSystem) {
        window.xpAnimationSystem.triggerXPGain(amount, options);
    }
};

window.triggerLevelUp = (newLevel, oldLevel) => {
    if (window.xpAnimationSystem) {
        window.xpAnimationSystem.triggerLevelUp(newLevel, oldLevel);
    }
};

window.triggerAchievement = (achievement) => {
    if (window.xpAnimationSystem) {
        window.xpAnimationSystem.triggerAchievement(achievement);
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XPAnimationSystem;
}
