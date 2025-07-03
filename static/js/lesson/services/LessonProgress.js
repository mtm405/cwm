/**
 * Lesson Progress Service
 * Handles user progress tracking and persistence
 */

export class LessonProgress {
    constructor() {
        this.db = null;
        this.lessonId = null;
        this.userId = null;
        this.progressData = {
            completed_blocks: [],
            progress: 0,
            last_updated: null,
            time_spent: 0
        };
        this.startTime = Date.now();
        this.initializeFirebase();
    }
    
    initializeFirebase() {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            this.db = firebase.firestore();
            console.log('✅ Firebase initialized for LessonProgress');
        } else {
            console.warn('⚠️ Firebase not available for progress tracking');
        }
    }
    
    initialize(lessonId, initialProgress, userId) {
        this.lessonId = lessonId;
        this.userId = userId;
        this.progressData = {
            completed_blocks: [],
            progress: 0,
            last_updated: null,
            time_spent: 0,
            ...initialProgress
        };
        
        console.log(`📊 Progress tracker initialized for lesson ${lessonId}`);
        
        // Set up auto-save interval
        this.setupAutoSave();
    }
    
    async fetchUserProgress(lessonId, userId) {
        if (!userId) {
            console.log('👤 No user ID provided, returning empty progress');
            return this.getDefaultProgress();
        }
        
        // Try window data first
        if (window.lessonProgress && Object.keys(window.lessonProgress).length > 0) {
            console.log('📄 Using server-rendered progress data');
            return window.lessonProgress;
        }
        
        try {
            if (this.db) {
                // Fetch from Firebase
                console.log(`🔥 Fetching progress from Firebase for user ${userId}, lesson ${lessonId}`);
                const doc = await this.db
                    .collection('user_progress')
                    .doc(userId)
                    .collection('lessons')
                    .doc(lessonId)
                    .get();
                
                return doc.exists ? doc.data() : this.getDefaultProgress();
            } else {
                // Fallback to API
                console.log(`🌐 Fetching progress from API for lesson ${lessonId}`);
                const response = await fetch(`/api/lessons/${lessonId}/progress`);
                
                if (response.ok) {
                    return await response.json();
                }
                
                return this.getDefaultProgress();
            }
        } catch (error) {
            console.error(`❌ Error fetching user progress for lesson ${lessonId}:`, error);
            return this.getDefaultProgress();
        }
    }
    
    getDefaultProgress() {
        return {
            completed_blocks: [],
            progress: 0,
            last_updated: null,
            time_spent: 0
        };
    }
    
    async markBlockComplete(blockId) {
        if (!blockId) {
            console.error('Block ID is required');
            return false;
        }
        
        if (this.progressData.completed_blocks.includes(blockId)) {
            console.log(`Block ${blockId} already completed`);
            return true;
        }
        
        // Add to completed blocks
        this.progressData.completed_blocks.push(blockId);
        this.progressData.last_updated = new Date().toISOString();
        
        // Calculate new progress percentage
        const totalBlocks = this.getTotalBlocks();
        this.progressData.progress = totalBlocks > 0 ? 
            Math.round((this.progressData.completed_blocks.length / totalBlocks) * 100) : 0;
        
        // Update UI immediately
        this.updateProgressUI();
        
        // Save to backend
        const saved = await this.saveProgress();
        
        if (saved) {
            console.log(`✅ Block ${blockId} marked as complete (${this.progressData.progress}%)`);
            
            // Dispatch event for other components
            this.dispatchProgressEvent('blockCompleted', { blockId, progress: this.progressData.progress });
            
            // Check for milestones
            this.checkMilestones();
        }
        
        return saved;
    }
    
    async saveProgress() {
        if (!this.userId || !this.lessonId) {
            console.log('👤 No user ID or lesson ID, progress not saved');
            return false;
        }
        
        // Update time spent
        this.progressData.time_spent = Math.floor((Date.now() - this.startTime) / 1000);
        this.progressData.last_updated = new Date().toISOString();
        
        try {
            if (this.db) {
                // Save to Firebase
                await this.db
                    .collection('user_progress')
                    .doc(this.userId)
                    .collection('lessons')
                    .doc(this.lessonId)
                    .set(this.progressData, { merge: true });
                
                console.log('💾 Progress saved to Firebase');
            } else {
                // Fallback to API
                const response = await fetch(`/api/lessons/${this.lessonId}/progress`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.progressData)
                });
                
                if (!response.ok) {
                    throw new Error(`API save failed: ${response.status}`);
                }
                
                console.log('💾 Progress saved via API');
            }
            
            return true;
        } catch (error) {
            console.error(`❌ Error saving progress for lesson ${this.lessonId}:`, error);
            return false;
        }
    }
    
    updateProgressUI() {
        const totalBlocks = this.getTotalBlocks();
        const completedBlocks = this.progressData.completed_blocks.length;
        const percentage = this.progressData.progress;
        
        // Update progress bar
        const progressBar = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-percentage');
        const blocksText = document.getElementById('completed-blocks-text');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${percentage}%`;
        }
        
        if (blocksText) {
            blocksText.textContent = `${completedBlocks} of ${totalBlocks} blocks completed`;
        }
        
        // Update completed block indicators
        this.progressData.completed_blocks.forEach(blockId => {
            const blockElement = document.getElementById(`block-${blockId}`);
            if (blockElement) {
                blockElement.classList.add('completed');
            }
        });
    }
    
    getTotalBlocks() {
        // Get total blocks from lesson data or DOM
        if (window.lessonSystem?.lessonData?.blocks) {
            return window.lessonSystem.lessonData.blocks.length;
        }
        
        return document.querySelectorAll('.content-block').length;
    }
    
    checkMilestones() {
        const progress = this.progressData.progress;
        
        // Check for major milestones
        if (progress === 25) {
            this.showMilestone('🚀 25% Complete!', 'You\'re making great progress!');
        } else if (progress === 50) {
            this.showMilestone('⭐ Halfway There!', 'You\'re doing amazing!');
        } else if (progress === 75) {
            this.showMilestone('🔥 75% Complete!', 'Almost finished!');
        } else if (progress === 100) {
            this.showMilestone('🎉 Lesson Complete!', 'Congratulations! You\'ve completed this lesson!');
        }
    }
    
    showMilestone(title, message) {
        // Create milestone notification
        const notification = document.createElement('div');
        notification.className = 'milestone-notification';
        notification.innerHTML = `
            <div class="milestone-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 10000;
            text-align: center;
            animation: milestone-pop 0.5s ease-out;
        `;
        
        // Add animation styles
        if (!document.getElementById('milestone-styles')) {
            const style = document.createElement('style');
            style.id = 'milestone-styles';
            style.textContent = `
                @keyframes milestone-pop {
                    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'milestone-pop 0.3s ease-in reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    dispatchProgressEvent(eventType, data) {
        const event = new CustomEvent(eventType, {
            detail: {
                lessonId: this.lessonId,
                userId: this.userId,
                progress: this.progressData.progress,
                completedBlocks: this.progressData.completed_blocks.length,
                ...data
            }
        });
        
        document.dispatchEvent(event);
    }
    
    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            if (this.progressData.completed_blocks.length > 0) {
                this.saveProgress();
            }
        }, 30000);
        
        // Save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });
    }
    
    // Debugging helper
    getProgressInfo() {
        return {
            lessonId: this.lessonId,
            userId: this.userId,
            progressData: this.progressData,
            totalBlocks: this.getTotalBlocks(),
            timeSpent: Math.floor((Date.now() - this.startTime) / 1000)
        };
    }
}
