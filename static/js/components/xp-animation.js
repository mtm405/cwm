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
        
        console.log('✨ XP Animation System initialized');
    }

    /**
     * Initialize the animation system
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            // Add event listeners
            document.addEventListener('xpEarned', (e) => this.handleXPEarned(e.detail));
            document.addEventListener('levelUp', (e) => this.handleLevelUp(e.detail));
            
            // Add stylesheet if not already present
            this.ensureStylesheet();
            
            // Add particle container
            this.ensureParticleContainer();
            
            this.isInitialized = true;
            console.log('✅ XP Animation System ready');
        } catch (error) {
            console.error('❌ Failed to initialize XP Animation System:', error);
        }
    }

    /**
     * Make sure our stylesheet is loaded
     */
    ensureStylesheet() {
        if (document.querySelector('#xp-animations-css')) return;
        
        const style = document.createElement('style');
        style.id = 'xp-animations-css';
        style.textContent = `
            .xp-float {
                position: fixed;
                color: #FFD700;
                font-weight: bold;
                pointer-events: none;
                z-index: 9999;
                text-shadow: 0 0 5px rgba(0,0,0,0.5);
                animation: xpFloat var(--duration, 2s) ease-out forwards;
                opacity: 0;
            }
            
            @keyframes xpFloat {
                0% { transform: translate(0, 0); opacity: 0; }
                10% { opacity: 1; }
                80% { opacity: 1; }
                100% { transform: translate(0, -80px); opacity: 0; }
            }
            
            .level-up-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                pointer-events: none;
                background: radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%);
                opacity: 0;
                transition: opacity 0.5s ease;
            }
            
            .level-up-container {
                text-align: center;
                color: #fff;
                transform: scale(0.5);
                opacity: 0;
                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            .level-up-overlay.active {
                opacity: 1;
            }
            
            .level-up-overlay.active .level-up-container {
                transform: scale(1);
                opacity: 1;
            }
            
            .level-up-title {
                font-size: 48px;
                margin-bottom: 20px;
                color: #FFD700;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.7);
            }
            
            .level-up-level {
                font-size: 72px;
                margin-bottom: 30px;
            }
            
            .level-up-rewards {
                font-size: 24px;
                margin-bottom: 20px;
            }
            
            .xp-particle {
                position: absolute;
                width: 8px;
                height: 8px;
                background: #FFD700;
                border-radius: 50%;
                pointer-events: none;
            }
            
            .particle-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
                pointer-events: none;
                z-index: 9999;
            }
            
            .sparkle {
                position: absolute;
                width: 5px;
                height: 5px;
                border-radius: 50%;
                background-color: #fff;
                opacity: 0;
                pointer-events: none;
                z-index: 9998;
            }
        `;
        
        document.head.appendChild(style);
    }

    /**
     * Ensure particle container exists
     */
    ensureParticleContainer() {
        if (document.querySelector('.particle-container')) return;
        
        const container = document.createElement('div');
        container.className = 'particle-container';
        document.body.appendChild(container);
    }

    /**
     * Handle XP earned event
     */
    handleXPEarned(detail) {
        if (!detail || !detail.amount) return;
        
        const amount = detail.amount;
        const sourceElement = detail.sourceElement;
        
        // Add to animation queue
        this.animationQueue.push({
            type: 'xp',
            amount,
            sourceElement
        });
        
        // Process queue if not already processing
        if (!this.isProcessing) {
            this.processAnimationQueue();
        }
    }

    /**
     * Handle level up event
     */
    handleLevelUp(detail) {
        if (!detail || !detail.level) return;
        
        // Add to animation queue with high priority
        this.animationQueue.unshift({
            type: 'levelUp',
            level: detail.level,
            rewards: detail.rewards || []
        });
        
        // Process queue if not already processing
        if (!this.isProcessing) {
            this.processAnimationQueue();
        }
    }

    /**
     * Process animation queue
     */
    async processAnimationQueue() {
        if (this.animationQueue.length === 0) {
            this.isProcessing = false;
            return;
        }
        
        this.isProcessing = true;
        
        // Get next animation from queue
        const animation = this.animationQueue.shift();
        
        try {
            // Process based on type
            switch(animation.type) {
                case 'xp':
                    await this.animateXP(animation.amount, animation.sourceElement);
                    break;
                case 'levelUp':
                    await this.animateLevelUp(animation.level, animation.rewards);
                    break;
            }
        } catch (error) {
            console.error('Animation error:', error);
        }
        
        // Process next in queue after a short delay
        setTimeout(() => {
            this.processAnimationQueue();
        }, this.settings.animationDelay);
    }

    /**
     * Animate XP earned
     */
    async animateXP(amount, sourceElement) {
        return new Promise(resolve => {
            // Default position if no source element
            let x = window.innerWidth / 2;
            let y = window.innerHeight / 2;
            
            // Get position from source element if provided
            if (sourceElement) {
                const rect = sourceElement.getBoundingClientRect();
                x = rect.left + rect.width / 2;
                y = rect.top + rect.height / 2;
            }
            
            // Create floating XP text
            const xpElement = document.createElement('div');
            xpElement.className = 'xp-float';
            xpElement.textContent = `+${amount} XP`;
            xpElement.style.setProperty('--duration', `${this.settings.xpFloatDuration}ms`);
            xpElement.style.left = `${x}px`;
            xpElement.style.top = `${y}px`;
            
            // Add to document
            document.body.appendChild(xpElement);
            
            // Add particles
            this.createXPBurst(x, y);
            
            // Remove after animation completes
            setTimeout(() => {
                xpElement.remove();
                resolve();
            }, this.settings.xpFloatDuration);
        });
    }

    /**
     * Create particle burst effect
     */
    createXPBurst(x, y) {
        const container = document.querySelector('.particle-container');
        if (!container) return;
        
        // Create particles
        for (let i = 0; i < this.settings.burstParticleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'xp-particle';
            
            // Random position offset
            const angle = (Math.random() * Math.PI * 2);
            const distance = 30 + Math.random() * 70;
            const finalX = Math.cos(angle) * distance;
            const finalY = Math.sin(angle) * distance;
            
            // Set initial position
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // Add to container
            container.appendChild(particle);
            
            // Animate with random timing
            const duration = 500 + Math.random() * 1000;
            const delay = Math.random() * 200;
            
            setTimeout(() => {
                // Apply transition for movement
                particle.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
                particle.style.transform = `translate(${finalX}px, ${finalY}px)`;
                particle.style.opacity = '0';
                
                // Remove after animation
                setTimeout(() => {
                    particle.remove();
                }, duration);
            }, delay);
        }
    }

    /**
     * Animate level up
     */
    async animateLevelUp(level, rewards = []) {
        return new Promise(resolve => {
            // Create level up overlay
            const overlay = document.createElement('div');
            overlay.className = 'level-up-overlay';
            
            // Create content
            const rewardsText = rewards.length > 0 
                ? `<div class="level-up-rewards">Rewards: ${rewards.join(', ')}</div>` 
                : '';
            
            overlay.innerHTML = `
                <div class="level-up-container">
                    <div class="level-up-title">LEVEL UP!</div>
                    <div class="level-up-level">Level ${level}</div>
                    ${rewardsText}
                </div>
            `;
            
            // Add to document
            document.body.appendChild(overlay);
            
            // Add sparkles
            this.createSparkles();
            
            // Trigger animation
            setTimeout(() => {
                overlay.classList.add('active');
            }, 50);
            
            // Remove after duration
            setTimeout(() => {
                overlay.classList.remove('active');
                
                setTimeout(() => {
                    overlay.remove();
                    resolve();
                }, 500);
            }, this.settings.levelUpDuration);
        });
    }

    /**
     * Create sparkle effects
     */
    createSparkles() {
        const container = document.querySelector('.particle-container');
        if (!container) return;
        
        // Create multiple sparkles
        for (let i = 0; i < this.settings.sparkleCount; i++) {
            setTimeout(() => {
                this.createSparkle(container);
            }, i * 300);
        }
    }

    /**
     * Create a single sparkle
     */
    createSparkle(container) {
        // Create element
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // Random position
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        // Random size
        const size = 5 + Math.random() * 15;
        
        // Random color
        const hue = Math.floor(Math.random() * 60) + 30; // Gold/yellow range
        
        // Set styles
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        sparkle.style.width = `${size}px`;
        sparkle.style.height = `${size}px`;
        sparkle.style.backgroundColor = `hsl(${hue}, 100%, 70%)`;
        sparkle.style.boxShadow = `0 0 ${size}px ${size/2}px hsl(${hue}, 100%, 70%)`;
        
        // Add to container
        container.appendChild(sparkle);
        
        // Animate
        const duration = 1000 + Math.random() * 1000;
        
        requestAnimationFrame(() => {
            sparkle.style.transition = `opacity ${duration}ms ease-in-out`;
            sparkle.style.opacity = '1';
            
            setTimeout(() => {
                sparkle.style.opacity = '0';
                
                setTimeout(() => {
                    sparkle.remove();
                }, duration);
            }, duration / 2);
        });
    }

    /**
     * Manually trigger XP animation
     */
    showXPAnimation(amount, sourceElement = null) {
        this.handleXPEarned({ amount, sourceElement });
    }

    /**
     * Manually trigger level up animation
     */
    showLevelUpAnimation(level, rewards = []) {
        this.handleLevelUp({ level, rewards });
    }

    /**
     * Clean up resources
     */
    destroy() {
        document.removeEventListener('xpEarned', this.handleXPEarned);
        document.removeEventListener('levelUp', this.handleLevelUp);
        
        // Remove particle container
        const container = document.querySelector('.particle-container');
        if (container) {
            container.remove();
        }
        
        this.isInitialized = false;
    }
}

// Create global instance
window.xpAnimation = new XPAnimationSystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { XPAnimationSystem };
}
