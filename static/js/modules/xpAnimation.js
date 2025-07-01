/**
 * XP Animation Module
 * Handles XP gain animations and visual feedback
 */

class XPAnimation {
    constructor(options = {}) {
        this.options = {
            duration: 1500,
            particleCount: 20,
            ...options
        };
        
        this.init();
    }
    
    init() {
        console.log('✨ XP Animation module initialized');
        this.createStyles();
    }
    
    createStyles() {
        if (document.getElementById('xp-animation-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'xp-animation-styles';
        style.textContent = `
            .xp-animation-container {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                z-index: 10000;
            }
            
            .xp-amount {
                font-size: 3rem;
                font-weight: bold;
                color: #4CAF50;
                animation: xpPop 1.5s ease-out forwards;
            }
            
            @keyframes xpPop {
                0% {
                    transform: scale(0) translateY(0);
                    opacity: 0;
                }
                50% {
                    transform: scale(1.2) translateY(-20px);
                    opacity: 1;
                }
                100% {
                    transform: scale(1) translateY(-40px);
                    opacity: 0;
                }
            }
            
            .xp-particle {
                position: absolute;
                width: 10px;
                height: 10px;
                background: #4CAF50;
                border-radius: 50%;
                animation: particleFloat 2s ease-out forwards;
            }
            
            @keyframes particleFloat {
                to {
                    transform: translateY(-100px) scale(0);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    show(amount, options = {}) {
        const container = document.createElement('div');
        container.className = 'xp-animation-container';
        
        // XP amount display
        const xpDisplay = document.createElement('div');
        xpDisplay.className = 'xp-amount';
        xpDisplay.textContent = `+${amount} XP`;
        container.appendChild(xpDisplay);
        
        // Add particles
        for (let i = 0; i < this.options.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'xp-particle';
            particle.style.left = `${Math.random() * 100 - 50}px`;
            particle.style.top = `${Math.random() * 100 - 50}px`;
            particle.style.animationDelay = `${Math.random() * 0.5}s`;
            container.appendChild(particle);
        }
        
        document.body.appendChild(container);
        
        // Remove after animation
        setTimeout(() => {
            container.remove();
        }, this.options.duration);
        
        // Emit event
        if (window.EventBus) {
            window.EventBus.emit('xp:gained', { amount });
        }
    }
}

// Create singleton instance
window.xpAnimation = new XPAnimation();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XPAnimation;
} else {
    window.XPAnimation = XPAnimation;
}
     */
    async handleAchievement(data) {
        const { achievement } = data;

        const animationData = {
            type: 'achievement',
            achievement,
            delay: 500
        };

        this.queueAnimation(animationData);
        this.processQueue();
    }

    /**
     * Get default animation position
     */
    getDefaultPosition() {
        return {
            x: window.innerWidth / 2,
            y: window.innerHeight * 0.3
        };
    }

    /**
     * Queue animation for processing
     */
    queueAnimation(data) {
        this.animationQueue.push({
            ...data,
            id: Date.now() + Math.random(),
            timestamp: Date.now()
        });
    }

    /**
     * Process animation queue
     */
    async processQueue() {
        if (this.processing) return;
        this.processing = true;

        while (this.animationQueue.length > 0) {
            const animation = this.animationQueue.shift();
            
            if (animation.delay) {
                await this.sleep(animation.delay);
            }

            await this.executeAnimation(animation);
            await this.sleep(this.settings.delay);
        }

        this.processing = false;
    }

    /**
     * Execute specific animation
     */
    async executeAnimation(animation) {
        try {
            switch (animation.type) {
                case 'xp-gain':
                    await this.animateXPGain(animation);
                    break;
                case 'level-up':
                    await this.animateLevelUp(animation);
                    break;
                case 'achievement':
                    await this.animateAchievement(animation);
                    break;
                case 'burst':
                    await this.animateBurst(animation);
                    break;
                default:
                    console.warn('Unknown animation type:', animation.type);
            }
        } catch (error) {
            console.error('Animation execution failed:', error);
        }
    }

    /**
     * Animate XP gain
     */
    async animateXPGain(animation) {
        const { amount, position, animationType } = animation;
        const overlay = document.getElementById('xp-animation-overlay');

        // Create XP element
        const xpElement = document.createElement('div');
        xpElement.className = `xp-gain-animation xp-${animationType}`;
        xpElement.innerHTML = `
            <div class="xp-amount">+${amount} XP</div>
            <div class="xp-sparkles"></div>
        `;

        // Position element
        xpElement.style.left = `${position.x}px`;
        xpElement.style.top = `${position.y}px`;

        overlay.appendChild(xpElement);

        // Animate based on type
        switch (animationType) {
            case 'float':
                await this.animateFloat(xpElement);
                break;
            case 'burst':
                await this.animateBurstXP(xpElement);
                break;
            case 'rain':
                await this.animateRain(xpElement);
                break;
            default:
                await this.animateFloat(xpElement);
        }

        // Clean up
        xpElement.remove();
    }

    /**
     * Animate floating XP
     */
    async animateFloat(element) {
        return new Promise((resolve) => {
            element.style.transform = 'translate(-50%, -50%) scale(0.5)';
            element.style.opacity = '0';

            // Initial appearance
            setTimeout(() => {
                element.style.transition = 'all 0.3s ease-out';
                element.style.transform = 'translate(-50%, -50%) scale(1)';
                element.style.opacity = '1';
            }, 50);

            // Float up and fade
            setTimeout(() => {
                element.style.transition = 'all 1.5s ease-out';
                element.style.transform = 'translate(-50%, -150px) scale(1.2)';
                element.style.opacity = '0';
            }, 500);

            setTimeout(resolve, 2000);
        });
    }

    /**
     * Animate burst XP
     */
    async animateBurstXP(element) {
        return new Promise((resolve) => {
            // Add burst effect
            const burstEffect = document.createElement('div');
            burstEffect.className = 'xp-burst-effect';
            element.appendChild(burstEffect);

            // Animate burst
            element.style.transform = 'translate(-50%, -50%) scale(0)';
            element.style.opacity = '1';

            setTimeout(() => {
                element.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                element.style.transform = 'translate(-50%, -50%) scale(1.5)';
            }, 50);

            setTimeout(() => {
                element.style.transition = 'all 1s ease-out';
                element.style.transform = 'translate(-50%, -100px) scale(1)';
                element.style.opacity = '0';
            }, 600);

            setTimeout(resolve, 1600);
        });
    }

    /**
     * Animate rain XP
     */
    async animateRain(element) {
        return new Promise((resolve) => {
            element.style.transform = 'translate(-50%, -200px) scale(0.8)';
            element.style.opacity = '0';

            setTimeout(() => {
                element.style.transition = 'all 1.5s ease-in-out';
                element.style.transform = 'translate(-50%, 50px) scale(1)';
                element.style.opacity = '1';
            }, 50);

            setTimeout(() => {
                element.style.transition = 'all 0.5s ease-out';
                element.style.opacity = '0';
            }, 1500);

            setTimeout(resolve, 2000);
        });
    }

    /**
     * Animate level up
     */
    async animateLevelUp(animation) {
        const { newLevel, oldLevel } = animation;
        const overlay = document.getElementById('xp-animation-overlay');

        // Create level up element
        const levelUpElement = document.createElement('div');
        levelUpElement.className = 'level-up-animation';
        levelUpElement.innerHTML = `
            <div class="level-up-burst"></div>
            <div class="level-up-text">
                <div class="level-up-title">LEVEL UP!</div>
                <div class="level-up-levels">${oldLevel} → ${newLevel}</div>
            </div>
            <div class="level-up-particles"></div>
        `;

        overlay.appendChild(levelUpElement);

        // Create particles
        this.createLevelUpParticles(levelUpElement);

        // Animate level up
        return new Promise((resolve) => {
            levelUpElement.style.opacity = '0';
            levelUpElement.style.transform = 'scale(0.5)';

            setTimeout(() => {
                levelUpElement.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                levelUpElement.style.opacity = '1';
                levelUpElement.style.transform = 'scale(1)';
            }, 50);

            setTimeout(() => {
                levelUpElement.style.transition = 'all 1s ease-out';
                levelUpElement.style.opacity = '0';
                levelUpElement.style.transform = 'scale(1.2)';
            }, 2000);

            setTimeout(() => {
                levelUpElement.remove();
                resolve();
            }, 3000);
        });
    }

    /**
     * Create level up particles
     */
    createLevelUpParticles(container) {
        const particlesContainer = container.querySelector('.level-up-particles');
        
        for (let i = 0; i < this.settings.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'level-up-particle';
            
            const angle = (i / this.settings.particleCount) * 360;
            const distance = 100 + Math.random() * 50;
            
            particle.style.setProperty('--angle', `${angle}deg`);
            particle.style.setProperty('--distance', `${distance}px`);
            particle.style.animationDelay = `${Math.random() * 0.5}s`;
            
            particlesContainer.appendChild(particle);
        }
    }

    /**
     * Animate achievement unlock
     */
    async animateAchievement(animation) {
        const { achievement } = animation;
        
        // Use toast notification for achievements
        if (window.notify) {
            window.notify.success(`🏆 Achievement Unlocked: ${achievement.name}`, {
                duration: 5000,
                persistent: false
            });
        }
    }

    /**
     * Show XP notification
     */
    showXPNotification(amount, source) {
        if (window.notify) {
            const message = source ? 
                `+${amount} XP from ${source}` : 
                `+${amount} XP gained!`;
                
            window.notify.info(message, { duration: 3000 });
        }
    }

    /**
     * Trigger XP gain animation from external code
     */
    gainXP(amount, options = {}) {
        const event = new CustomEvent('xpGained', {
            detail: {
                amount,
                source: options.source || 'Activity',
                position: options.position,
                type: options.type || 'float'
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Trigger level up animation
     */
    levelUp(newLevel, oldLevel) {
        const event = new CustomEvent('levelUp', {
            detail: { newLevel, oldLevel }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Trigger achievement animation
     */
    unlockAchievement(achievement) {
        const event = new CustomEvent('achievementUnlocked', {
            detail: { achievement }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Utility sleep function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create global instance
const xpAnimation = new XPAnimation();

// Global helper functions
window.gainXP = function(amount, options = {}) {
    xpAnimation.gainXP(amount, options);
};

window.triggerLevelUp = function(newLevel, oldLevel) {
    xpAnimation.levelUp(newLevel, oldLevel);
};

window.unlockAchievement = function(achievement) {
    xpAnimation.unlockAchievement(achievement);
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { XPAnimation, xpAnimation };
} else {
    window.XPAnimation = XPAnimation;
    window.xpAnimation = xpAnimation;
}
