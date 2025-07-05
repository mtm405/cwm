/**
 * Vocabulary Achievement System
 * Tracks and rewards user progress with badges and milestones
 */

class VocabularyAchievements {
    constructor(vocabularyManager) {
        this.manager = vocabularyManager;
        this.achievements = this.getAchievementDefinitions();
        this.userAchievements = this.loadUserAchievements();
    }

    /**
     * Define all possible achievements
     */
    getAchievementDefinitions() {
        return [
            // Study Streak Achievements
            {
                id: 'first_study',
                title: 'First Steps',
                description: 'Complete your first vocabulary study session',
                icon: '🌟',
                type: 'milestone',
                requirement: { type: 'cards_studied', value: 1 }
            },
            {
                id: 'week_streak',
                title: 'Week Warrior',
                description: 'Maintain a 7-day study streak',
                icon: '🔥',
                type: 'streak',
                requirement: { type: 'study_streak', value: 7 }
            },
            {
                id: 'month_streak',
                title: 'Monthly Master',
                description: 'Maintain a 30-day study streak',
                icon: '🏆',
                type: 'streak',
                requirement: { type: 'study_streak', value: 30 }
            },
            
            // Mastery Achievements
            {
                id: 'basics_master',
                title: 'Basics Master',
                description: 'Master all terms in the Basics category',
                icon: '📚',
                type: 'mastery',
                requirement: { type: 'category_mastery', value: 'Basics' }
            },
            {
                id: 'data_structures_master',
                title: 'Data Structures Expert',
                description: 'Master all terms in the Data Structures category',
                icon: '🗃️',
                type: 'mastery',
                requirement: { type: 'category_mastery', value: 'Data Structures' }
            },
            {
                id: 'control_flow_master',
                title: 'Control Flow Guru',
                description: 'Master all terms in the Control Flow category',
                icon: '🔄',
                type: 'mastery',
                requirement: { type: 'category_mastery', value: 'Control Flow' }
            },
            
            // Volume Achievements
            {
                id: 'century_club',
                title: 'Century Club',
                description: 'Study 100 vocabulary cards',
                icon: '💯',
                type: 'volume',
                requirement: { type: 'total_cards_studied', value: 100 }
            },
            {
                id: 'half_thousand',
                title: 'Half Thousand',
                description: 'Study 500 vocabulary cards',
                icon: '🎯',
                type: 'volume',
                requirement: { type: 'total_cards_studied', value: 500 }
            },
            {
                id: 'thousand_cards',
                title: 'Thousand Master',
                description: 'Study 1000 vocabulary cards',
                icon: '🚀',
                type: 'volume',
                requirement: { type: 'total_cards_studied', value: 1000 }
            },
            
            // Accuracy Achievements
            {
                id: 'perfectionist',
                title: 'Perfectionist',
                description: 'Achieve 100% accuracy in a study session',
                icon: '✨',
                type: 'accuracy',
                requirement: { type: 'session_perfect', value: true }
            },
            {
                id: 'accuracy_expert',
                title: 'Accuracy Expert',
                description: 'Maintain 90% overall accuracy with 50+ cards studied',
                icon: '🎪',
                type: 'accuracy',
                requirement: { type: 'overall_accuracy', value: 90, minimum_cards: 50 }
            },
            
            // Special Achievements
            {
                id: 'quiz_master',
                title: 'Quiz Master',
                description: 'Score 100% on a vocabulary quiz',
                icon: '🧠',
                type: 'quiz',
                requirement: { type: 'quiz_perfect', value: true }
            },
            {
                id: 'early_bird',
                title: 'Early Bird',
                description: 'Study before 8 AM',
                icon: '🐦',
                type: 'special',
                requirement: { type: 'early_study', value: true }
            },
            {
                id: 'night_owl',
                title: 'Night Owl',
                description: 'Study after 10 PM',
                icon: '🦉',
                type: 'special',
                requirement: { type: 'late_study', value: true }
            }
        ];
    }

    /**
     * Load user achievements from localStorage
     */
    loadUserAchievements() {
        try {
            const stored = localStorage.getItem('vocabulary_achievements');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading achievements:', error);
            return [];
        }
    }

    /**
     * Save user achievements to localStorage
     */
    saveUserAchievements() {
        try {
            localStorage.setItem('vocabulary_achievements', JSON.stringify(this.userAchievements));
        } catch (error) {
            console.error('Error saving achievements:', error);
        }
    }

    /**
     * Check for new achievements after user activity
     */
    checkAchievements() {
        const newAchievements = [];
        
        this.achievements.forEach(achievement => {
            if (!this.hasAchievement(achievement.id) && this.checkRequirement(achievement.requirement)) {
                this.unlockAchievement(achievement);
                newAchievements.push(achievement);
            }
        });
        
        if (newAchievements.length > 0) {
            this.showAchievementNotification(newAchievements);
        }
        
        return newAchievements;
    }

    /**
     * Check if user has specific achievement
     */
    hasAchievement(achievementId) {
        return this.userAchievements.some(a => a.id === achievementId);
    }

    /**
     * Check if requirement is met
     */
    checkRequirement(requirement) {
        switch (requirement.type) {
            case 'cards_studied':
                return this.getTotalCardsStudied() >= requirement.value;
                
            case 'study_streak':
                return this.manager.studySettings.studyStreak >= requirement.value;
                
            case 'category_mastery':
                return this.isCategoryMastered(requirement.value);
                
            case 'total_cards_studied':
                return this.getTotalCardsStudied() >= requirement.value;
                
            case 'session_perfect':
                return this.isSessionPerfect();
                
            case 'overall_accuracy':
                const accuracy = this.getOverallAccuracy();
                const totalCards = this.getTotalCardsStudied();
                return accuracy >= requirement.value && totalCards >= (requirement.minimum_cards || 0);
                
            case 'quiz_perfect':
                return this.hasQuizPerfectScore();
                
            case 'early_study':
                return this.isEarlyStudy();
                
            case 'late_study':
                return this.isLateStudy();
                
            default:
                return false;
        }
    }

    /**
     * Get total cards studied across all sessions
     */
    getTotalCardsStudied() {
        return Object.values(this.manager.userProgress).reduce((total, progress) => {
            return total + (progress.attempts || 0);
        }, 0);
    }

    /**
     * Check if category is mastered
     */
    isCategoryMastered(category) {
        const categoryTerms = this.manager.vocabularyData.filter(term => term.category === category);
        if (categoryTerms.length === 0) return false;
        
        const masteredTerms = categoryTerms.filter(term => {
            const progress = this.manager.userProgress[term.id];
            return progress && progress.attempts > 0 && (progress.correct / progress.attempts) >= 0.8;
        });
        
        return masteredTerms.length === categoryTerms.length;
    }

    /**
     * Check if current session is perfect
     */
    isSessionPerfect() {
        const metrics = this.manager.performanceMetrics;
        return metrics.cardsStudied > 0 && metrics.correctAnswers === metrics.cardsStudied;
    }

    /**
     * Get overall accuracy percentage
     */
    getOverallAccuracy() {
        const totalCorrect = Object.values(this.manager.userProgress).reduce((sum, progress) => {
            return sum + (progress.correct || 0);
        }, 0);
        
        const totalAttempts = this.getTotalCardsStudied();
        return totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
    }

    /**
     * Check if user has quiz perfect score (would need quiz integration)
     */
    hasQuizPerfectScore() {
        // This would check quiz results - placeholder for now
        return this.manager.quizData.score === this.manager.quizData.questions.length && 
               this.manager.quizData.questions.length > 0;
    }

    /**
     * Check if studying early in the morning
     */
    isEarlyStudy() {
        const hour = new Date().getHours();
        return hour >= 5 && hour < 8;
    }

    /**
     * Check if studying late at night
     */
    isLateStudy() {
        const hour = new Date().getHours();
        return hour >= 22 || hour < 5;
    }

    /**
     * Unlock an achievement
     */
    unlockAchievement(achievement) {
        const userAchievement = {
            ...achievement,
            unlockedAt: new Date().toISOString(),
            isNew: true
        };
        
        this.userAchievements.push(userAchievement);
        this.saveUserAchievements();
    }

    /**
     * Show achievement notification
     */
    showAchievementNotification(achievements) {
        achievements.forEach((achievement, index) => {
            setTimeout(() => {
                this.createAchievementPopup(achievement);
            }, index * 500); // Stagger multiple achievements
        });
    }

    /**
     * Create achievement popup
     */
    createAchievementPopup(achievement) {
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">Achievement Unlocked!</div>
                    <div class="achievement-name">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
                <button class="achievement-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (popup.parentNode) {
                popup.remove();
            }
        }, 5000);
        
        // Manual close
        popup.querySelector('.achievement-close').addEventListener('click', () => {
            popup.remove();
        });
        
        // Mark as seen
        setTimeout(() => {
            const userAchievement = this.userAchievements.find(a => a.id === achievement.id);
            if (userAchievement) {
                userAchievement.isNew = false;
                this.saveUserAchievements();
            }
        }, 1000);
    }

    /**
     * Show achievements panel
     */
    showAchievementsPanel() {
        const earnedAchievements = this.userAchievements;
        const totalAchievements = this.achievements.length;
        const progressPercentage = (earnedAchievements.length / totalAchievements) * 100;
        
        const panelHtml = `
            <div class="achievements-overlay">
                <div class="achievements-panel">
                    <div class="achievements-header">
                        <h3><i class="fas fa-trophy"></i> Achievements</h3>
                        <div class="achievements-progress">
                            <span>${earnedAchievements.length}/${totalAchievements} (${Math.round(progressPercentage)}%)</span>
                            <div class="progress">
                                <div class="progress-bar" style="width: ${progressPercentage}%"></div>
                            </div>
                        </div>
                        <button class="close-achievements">&times;</button>
                    </div>
                    
                    <div class="achievements-content">
                        <div class="achievements-grid">
                            ${this.achievements.map(achievement => this.renderAchievementCard(achievement)).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', panelHtml);
        
        // Event listeners
        document.querySelector('.close-achievements').addEventListener('click', () => {
            document.querySelector('.achievements-overlay').remove();
        });
        
        document.querySelector('.achievements-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('achievements-overlay')) {
                document.querySelector('.achievements-overlay').remove();
            }
        });
    }

    /**
     * Render individual achievement card
     */
    renderAchievementCard(achievement) {
        const isEarned = this.hasAchievement(achievement.id);
        const userAchievement = this.userAchievements.find(a => a.id === achievement.id);
        
        return `
            <div class="achievement-card ${isEarned ? 'earned' : 'locked'}">
                <div class="achievement-card-icon">${achievement.icon}</div>
                <div class="achievement-card-title">${achievement.title}</div>
                <div class="achievement-card-description">${achievement.description}</div>
                ${isEarned ? `
                    <div class="achievement-card-date">
                        Earned: ${new Date(userAchievement.unlockedAt).toLocaleDateString()}
                    </div>
                ` : ''}
                <div class="achievement-card-type">${achievement.type}</div>
            </div>
        `;
    }

    /**
     * Get achievement statistics
     */
    getStats() {
        const totalAchievements = this.achievements.length;
        const earnedAchievements = this.userAchievements.length;
        const byType = this.achievements.reduce((acc, achievement) => {
            acc[achievement.type] = acc[achievement.type] || { total: 0, earned: 0 };
            acc[achievement.type].total++;
            if (this.hasAchievement(achievement.id)) {
                acc[achievement.type].earned++;
            }
            return acc;
        }, {});
        
        return {
            total: totalAchievements,
            earned: earnedAchievements,
            percentage: Math.round((earnedAchievements / totalAchievements) * 100),
            byType
        };
    }
}

// Achievement-related CSS will be added to the main vocabulary CSS file
const achievementStyles = `
/* Achievement Popup Styles */
.achievement-popup {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2000;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    animation: achievementSlideIn 0.5s ease;
    max-width: 350px;
}

.achievement-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
}

.achievement-icon {
    font-size: 2.5rem;
    animation: achievementPulse 2s infinite;
}

.achievement-info {
    flex: 1;
}

.achievement-title {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 0.25rem;
}

.achievement-name {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 0.25rem;
}

.achievement-description {
    font-size: 0.9rem;
    opacity: 0.8;
}

.achievement-close {
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1rem;
}

@keyframes achievementSlideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes achievementPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

/* Achievements Panel Styles */
.achievements-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.achievements-panel {
    background-color: var(--bg-card);
    border-radius: 12px;
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.achievements-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.achievements-progress {
    text-align: center;
    flex: 1;
    margin: 0 2rem;
}

.achievements-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
}

.achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.achievement-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    transition: transform 0.2s ease;
}

.achievement-card.earned {
    border-color: var(--primary-color);
    background: linear-gradient(135deg, var(--bg-secondary) 0%, rgba(var(--primary-color-rgb), 0.1) 100%);
}

.achievement-card.locked {
    opacity: 0.5;
}

.achievement-card:hover {
    transform: translateY(-2px);
}

.achievement-card-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
}

.achievement-card-title {
    font-weight: bold;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
}

.achievement-card-description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.achievement-card-date {
    color: var(--primary-color);
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
}

.achievement-card-type {
    background-color: var(--primary-color);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    text-transform: uppercase;
    display: inline-block;
}
`;

// Add styles to head
if (!document.getElementById('achievement-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'achievement-styles';
    styleSheet.textContent = achievementStyles;
    document.head.appendChild(styleSheet);
}

// Make available globally
window.VocabularyAchievements = VocabularyAchievements;
