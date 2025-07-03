/**
 * Achievement System - Handles achievement display, progress tracking, and notifications
 * Phase 4, Session 1: User Profile System
 */

class AchievementSystem {
    constructor() {
        this.achievements = [];
        this.userProgress = {};
        this.container = null;
        this.notificationContainer = null;
        this.init();
    }

    init() {
        this.createNotificationContainer();
        this.bindEvents();
    }

    createNotificationContainer() {
        if (!document.getElementById('achievement-notifications')) {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.id = 'achievement-notifications';
            this.notificationContainer.className = 'achievement-notifications';
            document.body.appendChild(this.notificationContainer);
        } else {
            this.notificationContainer = document.getElementById('achievement-notifications');
        }
    }

    bindEvents() {
        // Listen for achievement unlock events
        document.addEventListener('achievement-unlocked', (event) => {
            this.showNotification(event.detail.achievement);
        });

        // Listen for progress updates
        document.addEventListener('achievement-progress', (event) => {
            this.updateProgress(event.detail.achievementId, event.detail.progress);
        });
    }

    async loadAchievements() {
        try {
            const response = await fetch('/api/profile/achievements');
            const data = await response.json();
            
            if (data.success) {
                this.achievements = data.achievements;
                this.userProgress = data.progress;
                return true;
            }
            throw new Error(data.error || 'Failed to load achievements');
        } catch (error) {
            console.error('Error loading achievements:', error);
            return false;
        }
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = this.generateAchievementHTML();
        this.bindAchievementEvents();
    }

    generateAchievementHTML() {
        const categories = this.groupAchievementsByCategory();
        
        return `
            <div class="achievement-system">
                <div class="achievement-header">
                    <h3>
                        <i class="fas fa-trophy"></i>
                        Achievements
                    </h3>
                    <div class="achievement-summary">
                        <span class="unlocked-count">${this.getUnlockedCount()}</span>
                        <span class="total-count">/ ${this.achievements.length}</span>
                        <div class="achievement-progress-bar">
                            <div class="progress-fill" style="width: ${this.getOverallProgress()}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="achievement-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="unlocked">Unlocked</button>
                    <button class="filter-btn" data-filter="locked">Locked</button>
                    ${Object.keys(categories).map(category => 
                        `<button class="filter-btn" data-filter="${category}">${category}</button>`
                    ).join('')}
                </div>
                
                <div class="achievement-grid">
                    ${this.achievements.map(achievement => this.generateAchievementCard(achievement)).join('')}
                </div>
            </div>
        `;
    }

    generateAchievementCard(achievement) {
        const isUnlocked = this.userProgress[achievement.id]?.unlocked || false;
        const progress = this.userProgress[achievement.id]?.progress || 0;
        const maxProgress = achievement.requirements?.target || 1;
        const progressPercent = Math.min((progress / maxProgress) * 100, 100);

        return `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" 
                 data-category="${achievement.category}"
                 data-achievement-id="${achievement.id}">
                <div class="achievement-icon">
                    <i class="fas fa-${achievement.icon}"></i>
                    ${isUnlocked ? '<div class="unlock-badge"><i class="fas fa-check"></i></div>' : ''}
                </div>
                
                <div class="achievement-content">
                    <h4 class="achievement-title">${achievement.name}</h4>
                    <p class="achievement-description">${achievement.description}</p>
                    
                    ${!isUnlocked && achievement.requirements ? `
                        <div class="achievement-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <span class="progress-text">${progress}/${maxProgress}</span>
                        </div>
                    ` : ''}
                    
                    <div class="achievement-meta">
                        <span class="achievement-category">${achievement.category}</span>
                        ${isUnlocked ? `<span class="unlock-date">Unlocked ${this.formatDate(this.userProgress[achievement.id].unlocked_date)}</span>` : ''}
                    </div>
                </div>
                
                ${achievement.rarity && achievement.rarity !== 'common' ? `
                    <div class="achievement-rarity ${achievement.rarity}">
                        ${achievement.rarity.toUpperCase()}
                    </div>
                ` : ''}
            </div>
        `;
    }

    bindAchievementEvents() {
        // Filter buttons
        const filterButtons = this.container.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterAchievements(filter);
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Achievement card clicks for details
        const cards = this.container.querySelectorAll('.achievement-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const achievementId = card.dataset.achievementId;
                this.showAchievementDetails(achievementId);
            });
        });
    }

    filterAchievements(filter) {
        const cards = this.container.querySelectorAll('.achievement-card');
        
        cards.forEach(card => {
            const isUnlocked = card.classList.contains('unlocked');
            const category = card.dataset.category;
            
            let shouldShow = true;
            
            switch (filter) {
                case 'all':
                    shouldShow = true;
                    break;
                case 'unlocked':
                    shouldShow = isUnlocked;
                    break;
                case 'locked':
                    shouldShow = !isUnlocked;
                    break;
                default:
                    shouldShow = category === filter;
            }
            
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    showAchievementDetails(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement) return;

        const userProgress = this.userProgress[achievementId] || {};
        const isUnlocked = userProgress.unlocked || false;

        const modal = document.createElement('div');
        modal.className = 'achievement-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-${achievement.icon}"></i> ${achievement.name}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="achievement-description">${achievement.description}</p>
                    
                    ${achievement.requirements ? `
                        <div class="achievement-requirements">
                            <h4>Requirements:</h4>
                            <ul>
                                ${achievement.requirements.actions ? achievement.requirements.actions.map(action => 
                                    `<li>${action.description} (${action.count} times)</li>`
                                ).join('') : ''}
                                ${achievement.requirements.target ? `<li>Target: ${achievement.requirements.target}</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${isUnlocked ? `
                        <div class="achievement-unlocked">
                            <i class="fas fa-trophy"></i>
                            <span>Unlocked on ${this.formatDate(userProgress.unlocked_date)}</span>
                        </div>
                    ` : ''}
                    
                    <div class="achievement-stats">
                        <div class="stat-item">
                            <label>Category:</label>
                            <span>${achievement.category}</span>
                        </div>
                        ${achievement.rarity ? `
                            <div class="stat-item">
                                <label>Rarity:</label>
                                <span class="rarity-${achievement.rarity}">${achievement.rarity}</span>
                            </div>
                        ` : ''}
                        ${achievement.points ? `
                            <div class="stat-item">
                                <label>Points:</label>
                                <span>${achievement.points}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal events
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
    }

    showNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-trophy"></i>
                </div>
                <div class="notification-text">
                    <h4>Achievement Unlocked!</h4>
                    <p>${achievement.name}</p>
                </div>
            </div>
        `;

        this.notificationContainer.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);

        // Play sound effect if available
        this.playAchievementSound();
    }

    playAchievementSound() {
        try {
            const audio = new Audio('/static/audio/achievement.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {
                // Ignore audio play errors
            });
        } catch (error) {
            // Ignore audio errors
        }
    }

    updateProgress(achievementId, progress) {
        if (!this.userProgress[achievementId]) {
            this.userProgress[achievementId] = { progress: 0, unlocked: false };
        }
        
        this.userProgress[achievementId].progress = progress;
        
        // Update progress bar if visible
        const card = this.container?.querySelector(`[data-achievement-id="${achievementId}"]`);
        if (card) {
            const progressBar = card.querySelector('.progress-fill');
            const progressText = card.querySelector('.progress-text');
            const achievement = this.achievements.find(a => a.id === achievementId);
            
            if (progressBar && achievement) {
                const maxProgress = achievement.requirements?.target || 1;
                const progressPercent = Math.min((progress / maxProgress) * 100, 100);
                progressBar.style.width = `${progressPercent}%`;
                
                if (progressText) {
                    progressText.textContent = `${progress}/${maxProgress}`;
                }
            }
        }
    }

    groupAchievementsByCategory() {
        return this.achievements.reduce((groups, achievement) => {
            const category = achievement.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(achievement);
            return groups;
        }, {});
    }

    getUnlockedCount() {
        return Object.values(this.userProgress).filter(p => p.unlocked).length;
    }

    getOverallProgress() {
        if (this.achievements.length === 0) return 0;
        return Math.round((this.getUnlockedCount() / this.achievements.length) * 100);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    }

    // Public API methods
    checkAchievements(action, data = {}) {
        // This method would typically be called by other parts of the application
        // to check if any achievements should be unlocked based on user actions
        
        // For now, we'll make an API call to check achievements
        return fetch('/api/profile/achievements/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, data })
        });
    }

    async refreshAchievements() {
        await this.loadAchievements();
        if (this.container) {
            this.render(this.container);
        }
    }
}

// Export for use in other modules
window.AchievementSystem = AchievementSystem;
