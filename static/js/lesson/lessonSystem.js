/**
 * Main Lesson System - ES6 Module
 * Single source of truth for lesson initialization
 */

import { LessonDataService } from './services/LessonDataService.js';
import { LessonRenderer } from './components/LessonRenderer.js';
import { LessonProgress } from './services/LessonProgress.js';
import { LessonInteractions } from './components/LessonInteractions.js';
import { renderLessonBlocks, updateBlockProgress, showBlockFeedback } from './lessonRenderer.js';

export class LessonSystem {
    constructor() {
        this.lessonId = this.getLessonId();
        this.dataService = new LessonDataService();
        this.renderer = new LessonRenderer();
        this.progress = new LessonProgress();
        this.interactions = new LessonInteractions();
        
        this.lessonData = null;
        this.userProgress = null;
        this.currentUser = null;
        
        console.log(`🚀 LessonSystem initialized for lesson: ${this.lessonId}`);
    }
    
    getLessonId() {
        // Get from URL, meta tag, or global data
        const urlParts = window.location.pathname.split('/');
        const urlLessonId = urlParts[urlParts.length - 1];
        
        const metaLessonId = document.querySelector('meta[name="lesson-id"]')?.content;
        const dataLessonId = window.lessonData?.id;
        
        return metaLessonId || dataLessonId || urlLessonId;
    }
    
    async initialize() {
        try {
            console.log('📚 Initializing lesson system...');
            
            // Show loading state
            this.renderer.showLoading();
            
            // Get current user
            this.currentUser = this.getCurrentUser();
            
            // Load quiz system first
            await this.loadQuizSystem();
            
            // Fetch data from Firebase or use provided data
            const [lessonData, userProgress] = await Promise.all([
                this.dataService.fetchLesson(this.lessonId),
                this.progress.fetchUserProgress(this.lessonId, this.currentUser?.id)
            ]);
            
            this.lessonData = lessonData;
            this.userProgress = userProgress;
            
            // Validate lesson data
            if (!this.lessonData) {
                throw new Error(`Lesson ${this.lessonId} not found`);
            }
            
            // Transform lesson data to blocks if needed
            this.lessonData = this.transformLessonData(this.lessonData);
            
            // Render the lesson
            await this.renderer.renderLesson(this.lessonData, this.userProgress);
            
            // Initialize interactions
            this.interactions.initialize(this.lessonData, this.userProgress);
            
            // Set up progress tracking with assessment validation
            this.progress.initialize(this.lessonId, this.userProgress, this.currentUser?.id, this.lessonData);
            
            // Set up quiz event listeners
            this.setupQuizEventListeners();
            
            // Update progress display
            this.updateProgressDisplay();
            
            // Hide loading, show content
            this.renderer.hideLoading();
            
            console.log('✅ Lesson system initialized successfully');
            
        } catch (error) {
            console.error('❌ Lesson initialization failed:', error);
            this.renderer.showError(error.message);
            throw error;
        }
    }
    
    async loadQuizSystem() {
        try {
            console.log('🧠 Loading quiz system components...');
            
            // Check if quiz system is already loaded
            if (window.QuizEngine && window.QuizController && window.QuizState) {
                console.log('✅ Quiz system already loaded');
                return;
            }
            
            // Load quiz system scripts
            const quizScripts = [
                '/static/js/quiz/QuizState.js',
                '/static/js/quiz/QuizEngine.js',
                '/static/js/quiz/QuizController.js'
            ];
            
            for (const scriptPath of quizScripts) {
                await this.loadScript(scriptPath);
            }
            
            // Verify quiz system is loaded
            if (window.QuizEngine && window.QuizController && window.QuizState) {
                console.log('✅ Quiz system loaded successfully');
                
                // Initialize quiz analytics if available
                this.initializeQuizAnalytics();
            } else {
                console.warn('⚠️ Quiz system components not found after loading');
            }
            
        } catch (error) {
            console.error('❌ Failed to load quiz system:', error);
            console.log('📚 Continuing with basic quiz fallback...');
        }
    }
    
    async loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    initializeQuizAnalytics() {
        // Set up quiz analytics tracking
        if (window.QuizEngine) {
            const originalTrackEvent = window.QuizEngine.prototype.trackEvent;
            
            window.QuizEngine.prototype.trackEvent = function(eventName, data) {
                // Call original tracking
                if (originalTrackEvent) {
                    originalTrackEvent.call(this, eventName, data);
                }
                
                // Add lesson context
                const lessonContext = {
                    ...data,
                    lessonId: window.lessonSystem?.lessonId,
                    userId: window.lessonSystem?.currentUser?.id,
                    timestamp: Date.now()
                };
                
                // Send to analytics
                window.lessonSystem?.trackEvent(`quiz_${eventName}`, lessonContext);
            };
        }
    }
    
    setupQuizEventListeners() {
        // Listen for quiz completion events
        document.addEventListener('quizCompleted', (event) => {
            const { blockId, quizId, results } = event.detail;
            console.log(`🎉 Quiz completed: ${quizId} in block ${blockId}`);
            
            // Update lesson progress
            this.handleQuizCompletion(blockId, results);
        });
        
        // Listen for quiz errors
        document.addEventListener('quizError', (event) => {
            const { blockId, quizId, error } = event.detail;
            console.error(`❌ Quiz error: ${quizId} in block ${blockId}:`, error);
            
            // Handle quiz error
            this.handleQuizError(blockId, error);
        });
        
        // Listen for quiz progress updates
        document.addEventListener('quizProgress', (event) => {
            const { blockId, progress } = event.detail;
            console.log(`📊 Quiz progress: block ${blockId}`, progress);
            
            // Update UI progress
            this.updateQuizProgress(blockId, progress);
        });
    }
    
    async handleQuizCompletion(blockId, results) {
        try {
            // Prepare assessment results for the progress tracker
            const assessmentResults = {
                score: results.score,
                passed: results.passed,
                attempts: (this.userProgress.quizResults?.[blockId]?.attempts || 0) + 1,
                tests_passed: results.correct_answers || 0,
                total_tests: results.total_questions || 0,
                success: results.passed,
                error: null,
                output: results.feedback || null,
                timestamp: Date.now()
            };
            
            // Try to mark block as completed with assessment results
            const completed = await this.progress.markBlockComplete(blockId, assessmentResults);
            
            if (completed) {
                console.log(`✅ Block ${blockId} completed with quiz results`);
                
                // Update quiz-specific progress
                await this.updateQuizResults(blockId, results);
                
                // Update progress display
                this.updateProgressDisplay();
                
                // Show completion notification
                this.showCompletionNotification(blockId, results);
            } else {
                console.log(`❌ Block ${blockId} not completed - assessment requirements not met`);
                
                // Show assessment feedback
                const assessmentProgress = this.progress.getBlockAssessmentProgress(blockId);
                if (assessmentProgress) {
                    this.showAssessmentFeedback(blockId, assessmentProgress, results);
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to handle quiz completion:', error);
        }
    }
    
    async updateQuizResults(blockId, results) {
        try {
            // Update quiz results in progress data
            if (!this.userProgress.quizResults) {
                this.userProgress.quizResults = {};
            }
            
            this.userProgress.quizResults[blockId] = {
                score: results.score,
                passed: results.passed,
                attempts: (this.userProgress.quizResults[blockId]?.attempts || 0) + 1,
                bestScore: Math.max(
                    results.score,
                    this.userProgress.quizResults[blockId]?.bestScore || 0
                ),
                completedAt: Date.now()
            };
            
            console.log(`📊 Updated quiz results for block ${blockId}`);
            
        } catch (error) {
            console.error('❌ Failed to update quiz results:', error);
        }
    }
    
    handleQuizError(blockId, error) {
        // Log error for debugging
        console.error(`Quiz error in block ${blockId}:`, error);
        
        // Track error event
        this.trackEvent('quiz_error', {
            blockId: blockId,
            error: error.message || error,
            timestamp: Date.now()
        });
        
        // Show user-friendly error message
        this.showNotification('error', 'Quiz Error', 'An error occurred with the quiz. Please try again.');
    }
    
    updateQuizProgress(blockId, progress) {
        // Update progress indicators in UI
        const progressElement = document.getElementById(`quiz-progress-${blockId}`);
        if (progressElement) {
            const percentage = Math.round((progress.current / progress.total) * 100);
            progressElement.style.setProperty('--progress', `${percentage}%`);
            progressElement.title = `Quiz Progress: ${percentage}%`;
        }
    }
    
    showCompletionNotification(blockId, results) {
        const message = results.passed 
            ? `🎉 Quiz completed successfully! Score: ${Math.round(results.score)}%`
            : `📚 Quiz completed. Score: ${Math.round(results.score)}%. Keep learning!`;
        
        this.showNotification(results.passed ? 'success' : 'info', 'Quiz Completed', message);
    }
    
    showAssessmentFeedback(blockId, assessmentProgress, results) {
        const { canRetry, attempts, maxAttempts } = assessmentProgress;
        
        let message = '';
        let type = 'warning';
        
        if (canRetry) {
            const attemptsRemaining = maxAttempts - attempts;
            message = `Assessment not passed. You have ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`;
            
            if (results.score < 70) {
                message += ` You need at least 70% to pass. Review the material and try again.`;
            }
        } else {
            message = `Assessment not passed. You've used all ${maxAttempts} attempts. Please review the material and ask for help if needed.`;
            type = 'error';
        }
        
        this.showNotification(type, 'Assessment Feedback', message);
    }
    
    showNotification(type, title, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <h5>${title}</h5>
                <p>${message}</p>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    trackEvent(eventName, data) {
        // Basic event tracking
        console.log(`📊 Event: ${eventName}`, data);
        
        // Send to analytics service if available
        if (window.analytics && typeof window.analytics.track === 'function') {
            window.analytics.track(eventName, data);
        }
    }
    
    transformLessonData(lessonData) {
        if (!lessonData) return null;
        
        // If blocks already exist, return as-is
        if (lessonData.blocks && Array.isArray(lessonData.blocks)) {
            return lessonData;
        }
        
        // Transform legacy format to blocks
        const blocks = [];
        let blockOrder = 0;
        
        // Add content as text blocks
        if (lessonData.content) {
            blocks.push({
                id: `${lessonData.id}-intro`,
                type: 'text',
                title: 'Introduction',
                content: lessonData.content,
                order: blockOrder++
            });
        }
        
        // Add code examples
        if (lessonData.code_examples && Array.isArray(lessonData.code_examples)) {
            lessonData.code_examples.forEach((example, index) => {
                blocks.push({
                    id: `${lessonData.id}-code-${index}`,
                    type: 'code_example',
                    title: example.title || `Code Example ${index + 1}`,
                    code: example.code,
                    language: example.language || 'python',
                    explanation: example.explanation,
                    order: blockOrder++
                });
            });
        }
        
        // Add exercises
        if (lessonData.exercises && Array.isArray(lessonData.exercises)) {
            lessonData.exercises.forEach((exercise, index) => {
                blocks.push({
                    id: `${lessonData.id}-exercise-${index}`,
                    type: 'interactive',
                    title: exercise.title || `Exercise ${index + 1}`,
                    instructions: exercise.instructions,
                    starter_code: exercise.starter_code,
                    language: exercise.language || 'python',
                    tests: exercise.tests,
                    order: blockOrder++
                });
            });
        }
        
        // Add quiz
        if (lessonData.quiz_id) {
            blocks.push({
                id: `${lessonData.id}-quiz`,
                type: 'quiz',
                title: 'Knowledge Check',
                quiz_id: lessonData.quiz_id,
                order: blockOrder++
            });
        }
        
        lessonData.blocks = blocks;
        return lessonData;
    }
    
    getCurrentUser() {
        // Get current user from various sources
        return window.currentUser || 
               globalThis.currentUser || 
               JSON.parse(localStorage.getItem('user_data') || 'null') ||
               null;
    }
    
    updateProgressDisplay() {
        if (!this.lessonData || !this.userProgress) return;
        
        const totalBlocks = this.lessonData.blocks?.length || 0;
        const completedBlocks = this.userProgress.completed_blocks?.length || 0;
        const percentage = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;
        
        // Update progress bar
        const progressBar = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-percentage');
        const blocksText = document.getElementById('completed-blocks-text');
        
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
        if (blocksText) blocksText.textContent = `${completedBlocks} of ${totalBlocks} blocks completed`;
        
        // Update lesson title if needed
        const titleElement = document.querySelector('.lesson-title');
        if (titleElement && this.lessonData.title) {
            titleElement.innerHTML = `
                <i class="fas fa-${this.lessonData.icon || 'code'}"></i>
                ${this.lessonData.title}
            `;
        }
    }
    
    // Event handlers for lesson interactions
    async markBlockComplete(blockId, assessmentResults = null) {
        return await this.progress.markBlockComplete(blockId, assessmentResults);
    }
    
    async executeCode(blockId, code) {
        return await this.interactions.executeCode(blockId, code);
    }
    
    async saveProgress() {
        return await this.progress.saveProgress();
    }
    
    // Debugging helper
    getDebugInfo() {
        return {
            lessonId: this.lessonId,
            lessonData: this.lessonData,
            userProgress: this.userProgress,
            currentUser: this.currentUser,
            initialized: !!(this.lessonData && this.userProgress)
        };
    }
}

// Auto-initialize when DOM is ready if not loaded as module
if (typeof window !== 'undefined' && !window.lessonSystemInitialized) {
    window.lessonSystemInitialized = true;
    
    // Make LessonSystem available globally for debugging
    window.LessonSystem = LessonSystem;
}
