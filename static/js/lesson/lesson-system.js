/**
 * Lesson System - Main Entry Point
 * Consolidated ES6 Module for Code with Morais Learning Platform
 * 
 * This is the single entry point for all lesson functionality.
 * It manages lesson loading, rendering, progress tracking, and interactions.
 */

import { LessonDataService } from './services/LessonDataService.js';
import { LessonRenderer } from './components/LessonRenderer.js';
import { LessonProgress } from './services/LessonProgress.js';
import { LessonInteractions } from './components/LessonInteractions.js';

export class LessonSystem {
    constructor() {
        this.lessonId = this.getLessonId();
        this.services = {
            data: new LessonDataService(),
            progress: new LessonProgress(),
            renderer: new LessonRenderer(),
            interactions: new LessonInteractions()
        };
        
        this.state = {
            lessonData: null,
            userProgress: null,
            currentUser: null,
            initialized: false
        };
        
        console.log(`🚀 LessonSystem initialized for lesson: ${this.lessonId}`);
    }
    
    /**
     * Get lesson ID from URL, meta tag, or global data
     */
    getLessonId() {
        // Check meta tag first
        const metaLessonId = document.querySelector('meta[name="lesson-id"]')?.content;
        if (metaLessonId) return metaLessonId;
        
        // Check global data
        const dataLessonId = window.lessonData?.id;
        if (dataLessonId) return dataLessonId;
        
        // Fall back to URL
        const urlParts = window.location.pathname.split('/');
        return urlParts[urlParts.length - 1];
    }
    
    /**
     * Initialize the complete lesson system
     */
    async initialize() {
        try {
            console.log('📚 Initializing lesson system...');
            
            // Show loading state
            this.services.renderer.showLoading();
            
            // Get current user
            this.state.currentUser = this.getCurrentUser();
            
            // Load external dependencies
            await this.loadDependencies();
            
            // Load lesson data and user progress
            await this.loadLessonData();
            
            // Validate lesson data
            if (!this.state.lessonData) {
                throw new Error(`Lesson ${this.lessonId} not found`);
            }
            
            // Transform lesson data to blocks if needed
            this.state.lessonData = this.transformLessonData(this.state.lessonData);
            
            // Render the lesson
            await this.services.renderer.renderLesson(this.state.lessonData, this.state.userProgress);
            
            // Initialize interactions
            this.services.interactions.initialize(this.state.lessonData, this.state.userProgress);
            
            // Set up progress tracking
            this.services.progress.initialize(
                this.lessonId, 
                this.state.userProgress, 
                this.state.currentUser?.id, 
                this.state.lessonData
            );
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Update progress display
            this.updateProgressDisplay();
            
            // Hide loading, show content
            this.services.renderer.hideLoading();
            
            this.state.initialized = true;
            console.log('✅ Lesson system initialized successfully');
            
        } catch (error) {
            console.error('❌ Lesson initialization failed:', error);
            this.services.renderer.showError(error.message);
            throw error;
        }
    }
    
    /**
     * Load external dependencies (Quiz system, etc.)
     */
    async loadDependencies() {
        try {
            console.log('🧠 Loading lesson dependencies...');
            
            // Load quiz system if needed
            if (this.needsQuizSystem()) {
                await this.loadQuizSystem();
            }
            
            // Load code editor if needed
            if (this.needsCodeEditor()) {
                await this.loadCodeEditor();
            }
            
            console.log('✅ Dependencies loaded successfully');
            
        } catch (error) {
            console.warn('⚠️ Some dependencies failed to load:', error);
            // Continue without blocking - use fallbacks
        }
    }
    
    /**
     * Load lesson data and user progress
     */
    async loadLessonData() {
        try {
            // First try to use provided data from template
            if (window.lessonData && Object.keys(window.lessonData).length > 0) {
                this.state.lessonData = window.lessonData;
                this.state.userProgress = window.lessonProgress || {};
                console.log('📖 Using lesson data from template');
            } else {
                // Fetch from API
                const [lessonData, userProgress] = await Promise.all([
                    this.services.data.fetchLesson(this.lessonId),
                    this.services.progress.fetchUserProgress(this.lessonId, this.state.currentUser?.id)
                ]);
                
                this.state.lessonData = lessonData;
                this.state.userProgress = userProgress;
                console.log('📖 Fetched lesson data from API');
            }
            
        } catch (error) {
            console.error('❌ Failed to load lesson data:', error);
            throw error;
        }
    }
    
    /**
     * Get current user from global data
     */
    getCurrentUser() {
        return window.currentUser || null;
    }
    
    /**
     * Check if lesson needs quiz system
     */
    needsQuizSystem() {
        return window.lessonData?.blocks?.some(block => block.type === 'quiz') || false;
    }
    
    /**
     * Check if lesson needs code editor
     */
    needsCodeEditor() {
        return window.lessonData?.blocks?.some(block => 
            block.type === 'code_example' || block.type === 'interactive'
        ) || false;
    }
    
    /**
     * Load quiz system components
     */
    async loadQuizSystem() {
        try {
            // Check if already loaded
            if (window.QuizEngine && window.QuizController && window.QuizState) {
                console.log('✅ Quiz system already loaded');
                return;
            }
            
            const quizScripts = [
                '/static/js/quiz/QuizState.js',
                '/static/js/quiz/QuizEngine.js',
                '/static/js/quiz/QuizController.js'
            ];
            
            await Promise.all(quizScripts.map(script => this.loadScript(script)));
            
            if (window.QuizEngine && window.QuizController && window.QuizState) {
                console.log('✅ Quiz system loaded successfully');
            } else {
                console.warn('⚠️ Quiz system components not found after loading');
            }
            
        } catch (error) {
            console.error('❌ Failed to load quiz system:', error);
            throw error;
        }
    }
    
    /**
     * Load code editor (ACE)
     */
    async loadCodeEditor() {
        try {
            if (window.ace) {
                console.log('✅ Code editor already loaded');
                return;
            }
            
            const aceScripts = [
                'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/ace.js',
                'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/mode-python.js',
                'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.14/theme-monokai.js'
            ];
            
            await Promise.all(aceScripts.map(script => this.loadScript(script)));
            
            console.log('✅ Code editor loaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to load code editor:', error);
            throw error;
        }
    }
    
    /**
     * Load external script
     */
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
    
    /**
     * Transform lesson data to standardized format
     */
    transformLessonData(lessonData) {
        // Ensure blocks array exists
        if (!lessonData.blocks || !Array.isArray(lessonData.blocks)) {
            lessonData.blocks = [];
        }
        
        // Normalize block data
        lessonData.blocks = lessonData.blocks.map((block, index) => ({
            id: block.id || `block-${index}`,
            type: block.type || 'text',
            content: block.content || '',
            title: block.title || '',
            assessment_required: block.assessment_required || false,
            ...block
        }));
        
        return lessonData;
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Quiz completion events
        document.addEventListener('quiz-completed', this.handleQuizCompleted.bind(this));
        
        // Block completion events
        document.addEventListener('block-completed', this.handleBlockCompleted.bind(this));
        
        // Progress events
        document.addEventListener('progress-updated', this.handleProgressUpdated.bind(this));
        
        // Error events
        document.addEventListener('lesson-error', this.handleLessonError.bind(this));
    }
    
    /**
     * Handle quiz completion
     */
    handleQuizCompleted(event) {
        const { blockId, score, passed } = event.detail;
        console.log(`🧠 Quiz completed: ${blockId}, Score: ${score}, Passed: ${passed}`);
        
        if (passed) {
            this.services.progress.markBlockCompleted(blockId);
            this.updateProgressDisplay();
        }
    }
    
    /**
     * Handle block completion
     */
    handleBlockCompleted(event) {
        const { blockId } = event.detail;
        console.log(`✅ Block completed: ${blockId}`);
        
        this.services.progress.markBlockCompleted(blockId);
        this.updateProgressDisplay();
    }
    
    /**
     * Handle progress updates
     */
    handleProgressUpdated(event) {
        console.log('📊 Progress updated:', event.detail);
        this.updateProgressDisplay();
    }
    
    /**
     * Handle lesson errors
     */
    handleLessonError(event) {
        const { error, blockId } = event.detail;
        console.error(`❌ Lesson error in block ${blockId}:`, error);
        
        // Show user-friendly error message
        this.services.renderer.showBlockError(blockId, error);
    }
    
    /**
     * Update progress display
     */
    updateProgressDisplay() {
        if (!this.state.initialized) return;
        
        const progress = this.services.progress.getProgress();
        const progressBar = document.querySelector('.lesson-progress-bar');
        const progressText = document.querySelector('.lesson-progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress.percentage}%`;
            progressBar.setAttribute('aria-valuenow', progress.percentage);
        }
        
        if (progressText) {
            progressText.textContent = `${progress.completed} / ${progress.total} completed`;
        }
        
        // Update URL with progress
        this.updateUrlWithProgress(progress);
    }
    
    /**
     * Update URL with progress for bookmarking
     */
    updateUrlWithProgress(progress) {
        const url = new URL(window.location);
        url.searchParams.set('progress', progress.percentage);
        url.searchParams.set('block', progress.currentBlock || 0);
        
        // Update URL without reloading
        window.history.replaceState({}, '', url.toString());
    }
    
    /**
     * Public API for external access
     */
    getApi() {
        return {
            // Data access
            getLessonData: () => this.state.lessonData,
            getUserProgress: () => this.state.userProgress,
            getCurrentUser: () => this.state.currentUser,
            
            // Progress control
            markBlockCompleted: (blockId) => this.services.progress.markBlockCompleted(blockId),
            getProgress: () => this.services.progress.getProgress(),
            
            // Rendering control
            rerenderLesson: () => this.services.renderer.renderLesson(this.state.lessonData, this.state.userProgress),
            showError: (message) => this.services.renderer.showError(message),
            
            // State
            isInitialized: () => this.state.initialized
        };
    }
}

// Export for use in templates
export default LessonSystem;
