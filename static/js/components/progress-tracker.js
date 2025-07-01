/**
 * Progress Tracker - User progress tracking and management
 * Code with Morais - Progress Management System
 */

class ProgressTracker {
    constructor(lessonId = null, userId = null) {
        this.lessonId = lessonId;
        this.userId = userId;
        this.progressData = {
            currentLesson: null,
            completedLessons: [],
            totalXP: 0,
            currentStreak: 0,
            lessonsProgress: {}
        };
        this.initialized = false;
    }
    
    /**
     * Initialize progress tracker
     */
    init() {
        if (this.initialized) return;
        
        try {
            this.loadProgressData();
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ ProgressTracker initialized');
            
        } catch (error) {
            console.error('❌ ProgressTracker initialization failed:', error);
        }
    }
    
    /**
     * Load progress data from localStorage or API
     */
    loadProgressData() {
        try {
            // Try to load from window first (server-side data)
            if (window.userProgress) {
                this.progressData = { ...this.progressData, ...window.userProgress };
                return;
            }
            
            // Fallback to localStorage
            const saved = localStorage.getItem('user_progress');
            if (saved) {
                this.progressData = { ...this.progressData, ...JSON.parse(saved) };
            }
            
        } catch (error) {
            console.warn('⚠️ Failed to load progress data:', error);
        }
    }
    
    /**
     * Save progress data
     */
    saveProgressData() {
        try {
            localStorage.setItem('user_progress', JSON.stringify(this.progressData));
            
            // Also save to server if API is available
            if (this.userId) {
                this.syncProgressToServer();
            }
            
        } catch (error) {
            console.warn('⚠️ Failed to save progress data:', error);
        }
    }
    
    /**
     * Set current lesson
     */
    setCurrentLesson(lessonId, lessonProgress = {}) {
        this.lessonId = lessonId;
        this.progressData.currentLesson = lessonId;
        
        if (lessonProgress) {
            this.progressData.lessonsProgress[lessonId] = lessonProgress;
        }
        
        this.saveProgressData();
    }
    
    /**
     * Update lesson progress
     */
    updateLessonProgress(lessonId, progress) {
        if (!this.progressData.lessonsProgress[lessonId]) {
            this.progressData.lessonsProgress[lessonId] = {};
        }
        
        Object.assign(this.progressData.lessonsProgress[lessonId], progress);
        this.saveProgressData();
        
        // Emit progress update event
        this.emitProgressUpdate(lessonId, progress);
    }
    
    /**
     * Mark lesson as completed
     */
    completLesson(lessonId, xpGained = 100) {
        if (!this.progressData.completedLessons.includes(lessonId)) {
            this.progressData.completedLessons.push(lessonId);
            this.progressData.totalXP += xpGained;
            this.updateStreak();
        }
        
        this.saveProgressData();
        this.emitLessonComplete(lessonId, xpGained);
    }
    
    /**
     * Update learning streak
     */
    updateStreak() {
        // Simple streak logic - could be enhanced
        this.progressData.currentStreak += 1;
        this.progressData.lastActivity = new Date().toISOString();
    }
    
    /**
     * Get progress for specific lesson
     */
    getLessonProgress(lessonId) {
        return this.progressData.lessonsProgress[lessonId] || {};
    }
    
    /**
     * Get overall progress stats
     */
    getProgressStats() {
        return {
            totalLessons: this.progressData.completedLessons.length,
            totalXP: this.progressData.totalXP,
            currentStreak: this.progressData.currentStreak,
            currentLesson: this.progressData.currentLesson
        };
    }
    
    /**
     * Load user progress from server
     */
    async loadUserProgress() {
        if (!this.userId) {
            console.warn('⚠️ No user ID provided for progress loading');
            return;
        }
        
        try {
            const response = await fetch(`/api/users/${this.userId}/progress`);
            if (response.ok) {
                const serverProgress = await response.json();
                this.progressData = { ...this.progressData, ...serverProgress };
                this.saveProgressData();
            }
        } catch (error) {
            console.warn('⚠️ Failed to load user progress from server:', error);
        }
    }
    
    /**
     * Sync progress to server
     */
    async syncProgressToServer() {
        if (!this.userId) return;
        
        try {
            await fetch(`/api/users/${this.userId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.progressData)
            });
        } catch (error) {
            console.warn('⚠️ Failed to sync progress to server:', error);
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for progress events
        document.addEventListener('lesson:progress', (event) => {
            if (event.detail.lessonId) {
                this.updateLessonProgress(event.detail.lessonId, event.detail.progress);
            }
        });
        
        document.addEventListener('lesson:complete', (event) => {
            if (event.detail.lessonId) {
                this.completLesson(event.detail.lessonId, event.detail.xp || 100);
            }
        });
    }
    
    /**
     * Emit progress update event
     */
    emitProgressUpdate(lessonId, progress) {
        const event = new CustomEvent('progress:updated', {
            detail: {
                lessonId,
                progress,
                stats: this.getProgressStats()
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Emit lesson complete event
     */
    emitLessonComplete(lessonId, xpGained) {
        const event = new CustomEvent('progress:lesson_complete', {
            detail: {
                lessonId,
                xpGained,
                stats: this.getProgressStats()
            }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Destroy progress tracker
     */
    destroy() {
        this.saveProgressData();
        this.initialized = false;
    }
}

// Export for module loader
if (typeof window !== 'undefined') {
    window.ProgressTracker = ProgressTracker;
}
