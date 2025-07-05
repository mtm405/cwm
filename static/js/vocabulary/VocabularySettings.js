/**
 * Vocabulary Settings Panel - User Customization Interface
 */

class VocabularySettings {
    constructor(vocabularyManager) {
        this.manager = vocabularyManager;
        this.isOpen = false;
    }

    /**
     * Create and show settings panel
     */
    show() {
        if (this.isOpen) return;
        
        const settingsHtml = `
            <div class="settings-overlay">
                <div class="settings-panel">
                    <div class="settings-header">
                        <h3><i class="fas fa-cog"></i> Vocabulary Settings</h3>
                        <button class="close-settings">&times;</button>
                    </div>
                    
                    <div class="settings-content">
                        <!-- Study Preferences -->
                        <div class="settings-section">
                            <h4>Study Preferences</h4>
                            
                            <div class="setting-item">
                                <label class="setting-label">
                                    <input type="checkbox" id="spaced-repetition" ${this.manager.studySettings.spacedRepetition ? 'checked' : ''}>
                                    <span class="checkmark"></span>
                                    Enable Spaced Repetition
                                </label>
                                <p class="setting-description">Show terms that need review more frequently</p>
                            </div>
                            
                            <div class="setting-item">
                                <label class="setting-label">
                                    <input type="checkbox" id="auto-advance" ${this.manager.studySettings.autoAdvance ? 'checked' : ''}>
                                    <span class="checkmark"></span>
                                    Auto-advance Cards
                                </label>
                                <p class="setting-description">Automatically move to next card after rating difficulty</p>
                            </div>
                            
                            <div class="setting-item">
                                <label class="setting-label">
                                    <input type="checkbox" id="show-hints" ${this.manager.studySettings.showHints ? 'checked' : ''}>
                                    <span class="checkmark"></span>
                                    Show Hints
                                </label>
                                <p class="setting-description">Display helpful hints on flashcards</p>
                            </div>
                        </div>
                        
                        <!-- Daily Goals -->
                        <div class="settings-section">
                            <h4>Daily Goals</h4>
                            
                            <div class="setting-item">
                                <label class="setting-label">Daily Study Goal</label>
                                <div class="slider-container">
                                    <input type="range" id="daily-goal" min="5" max="50" step="5" value="${this.manager.studySettings.dailyGoal}">
                                    <span class="slider-value">${this.manager.studySettings.dailyGoal} cards</span>
                                </div>
                                <p class="setting-description">Number of cards to study each day</p>
                            </div>
                        </div>
                        
                        <!-- Data Management -->
                        <div class="settings-section">
                            <h4>Data Management</h4>
                            
                            <div class="setting-item">
                                <button class="btn btn-outline-primary" id="export-progress">
                                    <i class="fas fa-download"></i> Export Progress
                                </button>
                                <p class="setting-description">Download your study progress as JSON</p>
                            </div>
                            
                            <div class="setting-item">
                                <button class="btn btn-outline-secondary" id="reset-progress">
                                    <i class="fas fa-refresh"></i> Reset Progress
                                </button>
                                <p class="setting-description">Clear all study progress (cannot be undone)</p>
                            </div>
                        </div>
                        
                        <!-- Statistics -->
                        <div class="settings-section">
                            <h4>Study Statistics</h4>
                            <div class="stats-grid" id="detailed-stats">
                                <!-- Will be populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-footer">
                        <button class="btn btn-primary" id="save-settings">Save Settings</button>
                        <button class="btn btn-secondary" id="cancel-settings">Cancel</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', settingsHtml);
        this.isOpen = true;
        
        this.setupEventListeners();
        this.updateDetailedStats();
    }

    /**
     * Setup event listeners for settings panel
     */
    setupEventListeners() {
        // Close buttons
        document.querySelector('.close-settings').addEventListener('click', () => this.close());
        document.querySelector('#cancel-settings').addEventListener('click', () => this.close());
        
        // Save settings
        document.querySelector('#save-settings').addEventListener('click', () => this.saveSettings());
        
        // Export progress
        document.querySelector('#export-progress').addEventListener('click', () => this.exportProgress());
        
        // Reset progress
        document.querySelector('#reset-progress').addEventListener('click', () => this.resetProgress());
        
        // Daily goal slider
        const dailyGoalSlider = document.querySelector('#daily-goal');
        const dailyGoalValue = document.querySelector('.slider-value');
        
        dailyGoalSlider.addEventListener('input', (e) => {
            dailyGoalValue.textContent = `${e.target.value} cards`;
        });
        
        // Close on overlay click
        document.querySelector('.settings-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('settings-overlay')) {
                this.close();
            }
        });
    }

    /**
     * Save settings
     */
    saveSettings() {
        this.manager.studySettings.spacedRepetition = document.querySelector('#spaced-repetition').checked;
        this.manager.studySettings.autoAdvance = document.querySelector('#auto-advance').checked;
        this.manager.studySettings.showHints = document.querySelector('#show-hints').checked;
        this.manager.studySettings.dailyGoal = parseInt(document.querySelector('#daily-goal').value);
        
        this.manager.saveUserSettings();
        this.manager.updateStats();
        
        this.manager.showNotification('Settings saved successfully!', 'success');
        this.close();
    }

    /**
     * Export progress data
     */
    exportProgress() {
        const exportData = {
            userProgress: this.manager.userProgress,
            studySettings: this.manager.studySettings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `vocabulary-progress-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.manager.showNotification('Progress exported successfully!', 'success');
    }

    /**
     * Reset progress with confirmation
     */
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
            this.manager.userProgress = {};
            this.manager.studySettings.studyStreak = 0;
            this.manager.saveUserProgress();
            this.manager.saveUserSettings();
            this.manager.updateStats();
            
            // Clear performance metrics
            localStorage.removeItem('vocabulary_metrics');
            localStorage.removeItem('vocabulary_last_study_date');
            
            this.manager.showNotification('Progress reset successfully!', 'success');
            this.close();
        }
    }

    /**
     * Update detailed statistics
     */
    updateDetailedStats() {
        const stats = this.calculateDetailedStats();
        const statsGrid = document.querySelector('#detailed-stats');
        
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${stats.totalStudySessions}</div>
                <div class="stat-label">Study Sessions</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.averageAccuracy}%</div>
                <div class="stat-label">Overall Accuracy</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.totalTimeStudied}</div>
                <div class="stat-label">Time Studied</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${stats.streakRecord}</div>
                <div class="stat-label">Best Streak</div>
            </div>
        `;
    }

    /**
     * Calculate detailed statistics
     */
    calculateDetailedStats() {
        const progress = this.manager.userProgress;
        
        let totalSessions = 0;
        let totalCorrect = 0;
        let totalAttempts = 0;
        
        Object.values(progress).forEach(termProgress => {
            totalSessions += termProgress.attempts || 0;
            totalCorrect += termProgress.correct || 0;
            totalAttempts += termProgress.attempts || 0;
        });
        
        const averageAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
        
        // Get time studied from performance metrics
        let totalTime = 0;
        try {
            const metrics = JSON.parse(localStorage.getItem('vocabulary_metrics') || '[]');
            totalTime = metrics.reduce((sum, metric) => sum + (metric.totalTime || 0), 0);
        } catch (error) {
            console.error('Error loading performance metrics:', error);
        }
        
        const timeStudied = this.formatTime(totalTime);
        
        // Calculate best streak (could be stored separately in the future)
        const streakRecord = Math.max(this.manager.studySettings.studyStreak || 0, 0);
        
        return {
            totalStudySessions: totalSessions,
            averageAccuracy,
            totalTimeStudied: timeStudied,
            streakRecord
        };
    }

    /**
     * Format time in milliseconds to human readable format
     */
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    /**
     * Close settings panel
     */
    close() {
        const overlay = document.querySelector('.settings-overlay');
        if (overlay) {
            overlay.remove();
        }
        this.isOpen = false;
    }
}

// Add settings button to vocabulary controls
document.addEventListener('DOMContentLoaded', () => {
    const controlGroup = document.querySelector('.vocabulary-controls .control-group:last-child');
    if (controlGroup) {
        const settingsButton = document.createElement('button');
        settingsButton.className = 'btn btn-outline-secondary settings-btn';
        settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
        settingsButton.title = 'Vocabulary Settings';
        
        settingsButton.addEventListener('click', () => {
            if (window.vocabularyManager) {
                const settings = new VocabularySettings(window.vocabularyManager);
                settings.show();
            }
        });
        
        controlGroup.appendChild(settingsButton);
    }
});

// Make available globally
window.VocabularySettings = VocabularySettings;
