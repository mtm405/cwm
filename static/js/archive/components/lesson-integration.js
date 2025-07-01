/**
 * Lesson Integration Manager - Main controller connecting all lesson components
 * Code with Morais - Lesson Template System
 * 
 * This class serves as the central coordinator that connects:
 * - ContentBlockRenderer (for dynamic content)
 * - ProgressTracker (for Firebase sync)
 * - GamificationManager (for celebrations)
 * - InteractiveCodeEditor (for coding challenges)
 * - QuizSystem (for assessments)
 */

class LessonIntegrationManager {
    constructor(lessonId) {
        this.lessonId = lessonId;
        this.lessonData = null;
        this.userProgress = null;
        this.initialized = false;
        
        // Component instances
        this.contentRenderer = null;
        this.progressTracker = null;
        this.gamificationManager = null;
        this.codeEditors = new Map();
        this.quizzes = new Map();
        
        // State management
        this.completedBlocks = new Set();
        this.currentBlock = 0;
        this.isProcessingCompletion = false;
        
        console.log(`🚀 Initializing LessonIntegrationManager for lesson: ${lessonId}`);
    }
    
    /**
     * Initialize the complete lesson system
     */
    async init() {
        if (this.initialized) {
            console.log('⚠️ LessonIntegrationManager already initialized');
            return;
        }
        
        try {
            console.log('🔄 Loading lesson data and components...');
            
            // Step 1: Load lesson data
            await this.loadLessonData();
            await this.loadUserProgress();
            
            // Step 2: Initialize components
            this.initializeComponents();
            
            // Step 3: Render content
            await this.renderLessonContent();
            
            // Step 4: Setup event system
            this.setupEventListeners();
            
            // Step 5: Initialize progress tracking
            this.updateProgressIndicators();
            
            this.initialized = true;
            console.log('✅ LessonIntegrationManager initialized successfully');
            
            // Trigger ready event
            this.dispatchEvent('lessonReady', {
                lessonId: this.lessonId,
                blocksCount: this.lessonData?.blocks?.length || 0,
                progress: this.userProgress?.progress || 0
            });
            
        } catch (error) {
            console.error('❌ Failed to initialize lesson integration:', error);
            this.showErrorFallback(error);
        }
    }
    
    /**
     * Load lesson data from API
     */
    async loadLessonData() {
        try {
            const response = await fetch(`/api/lessons/${this.lessonId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.lessonData = await response.json();
            console.log('📖 Lesson data loaded:', this.lessonData.title);
            
            // Validate lesson structure
            if (!this.lessonData.blocks || !Array.isArray(this.lessonData.blocks)) {
                throw new Error('Invalid lesson structure: missing blocks array');
            }
            
        } catch (error) {
            console.error('Failed to load lesson data:', error);
            throw error;
        }
    }
    
    /**
     * Load user progress from API
     */
    async loadUserProgress() {
        try {
            const response = await fetch(`/api/lessons/${this.lessonId}/progress`);
            if (response.ok) {
                this.userProgress = await response.json();
                this.completedBlocks = new Set(this.userProgress.completed_blocks || []);
                console.log('📊 User progress loaded:', this.userProgress.progress_percentage + '%');
            } else {
                // Initialize empty progress
                this.userProgress = {
                    progress_percentage: 0,
                    completed_blocks: [],
                    block_progress: []
                };
                console.log('📊 Initialized empty progress for new lesson');
            }
            
        } catch (error) {
            console.error('Failed to load user progress:', error);
            // Continue with empty progress
            this.userProgress = { progress_percentage: 0, completed_blocks: [] };
        }
    }
    
    /**
     * Initialize all component instances
     */
    initializeComponents() {
        console.log('🔧 Initializing lesson components...');
        
        // Initialize ContentBlockRenderer
        if (window.ContentBlockRenderer) {
            this.contentRenderer = new ContentBlockRenderer();
            this.contentRenderer.setProgressTracker(this);
            console.log('✅ ContentBlockRenderer initialized');
        }
        
        // Initialize ProgressTracker
        if (window.ProgressTracker) {
            this.progressTracker = new ProgressTracker(this.lessonId, this.getCurrentUserId());
            this.progressTracker.init();
            console.log('✅ ProgressTracker initialized');
        }
        
        // Initialize GamificationManager
        if (window.GamificationManager && window.gamificationManager) {
            this.gamificationManager = window.gamificationManager;
            console.log('✅ GamificationManager connected');
        }
        
        // Initialize XP Animation System
        if (window.xpAnimationSystem) {
            console.log('✅ XP Animation System connected');
        }
    }
    
    /**
     * Render lesson content using ContentBlockRenderer
     */
    async renderLessonContent() {
        if (!this.contentRenderer || !this.lessonData.blocks) {
            console.error('Cannot render content: missing renderer or blocks');
            return;
        }
        
        const contentContainer = document.querySelector('.lesson-content');
        if (!contentContainer) {
            console.error('Content container not found');
            return;
        }
        
        console.log(`🎨 Rendering ${this.lessonData.blocks.length} content blocks...`);
        
        // Clear loading skeleton
        contentContainer.innerHTML = '';
        
        // Render each block
        for (let i = 0; i < this.lessonData.blocks.length; i++) {
            const block = this.lessonData.blocks[i];
            const blockElement = this.contentRenderer.renderBlock(block, i);
            
            if (blockElement) {
                contentContainer.appendChild(blockElement);
                
                // Initialize block-specific components
                await this.initializeBlockComponents(block, i);
            }
        }
        
        console.log('✅ Content blocks rendered successfully');
    }
    
    /**
     * Initialize components for specific block types
     */
    async initializeBlockComponents(block, index) {
        const blockId = block.id || `block_${index}`;
        
        // Initialize interactive code editors
        if (block.type === 'interactive' && window.InteractiveCodeEditor) {
            try {
                const editor = new InteractiveCodeEditor(blockId, {
                    starterCode: block.starter_code || '',
                    testCases: block.test_cases || [],
                    hints: block.hints || [],
                    solution: block.solution || ''
                });
                
                await editor.init();
                this.codeEditors.set(blockId, editor);
                console.log(`💻 Code editor initialized for block: ${blockId}`);
                
            } catch (error) {
                console.error(`Failed to initialize code editor for ${blockId}:`, error);
            }
        }
        
        // Initialize quiz components
        if (block.type === 'quiz' && window.QuizSystem) {
            try {
                const quiz = new QuizSystem(blockId, block);
                quiz.init();
                this.quizzes.set(blockId, quiz);
                console.log(`🧠 Quiz initialized for block: ${blockId}`);
                
            } catch (error) {
                console.error(`Failed to initialize quiz for ${blockId}:`, error);
            }
        }
    }
    
    /**
     * Setup event listeners for lesson interactions
     */
    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Block completion events
        document.addEventListener('blockCompleted', (e) => {
            this.handleBlockCompletion(e.detail);
        });
        
        // Code execution events
        document.addEventListener('codeExecuted', (e) => {
            this.handleCodeExecution(e.detail);
        });
        
        // Quiz completion events
        document.addEventListener('quizCompleted', (e) => {
            this.handleQuizCompletion(e.detail);
        });
        
        // Progress update events
        document.addEventListener('progressUpdated', (e) => {
            this.handleProgressUpdate(e.detail);
        });
        
        // Error handling events
        document.addEventListener('componentError', (e) => {
            this.handleComponentError(e.detail);
        });
        
        // Block interaction events
        this.setupBlockInteractionEvents();
        
        console.log('✅ Event listeners configured');
    }
    
    /**
     * Setup block-specific interaction events
     */
    setupBlockInteractionEvents() {
        // Text block reading completion
        document.querySelectorAll('.text-block').forEach(block => {
            this.setupTextBlockCompletion(block);
        });
        
        // Code example copy events
        document.querySelectorAll('.copy-code-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCodeCopy(e);
            });
        });
        
        // Manual completion buttons
        document.querySelectorAll('.mark-complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const blockId = e.target.closest('[data-block-id]')?.dataset.blockId;
                if (blockId) {
                    this.markBlockComplete(blockId, 'manual');
                }
            });
        });
    }
    
    /**
     * Handle block completion from any source
     */
    async handleBlockCompletion(detail) {
        if (this.isProcessingCompletion) {
            console.log('⏳ Block completion already in progress...');
            return;
        }
        
        this.isProcessingCompletion = true;
        
        try {
            const { blockId, blockType, rewards, source } = detail;
            console.log(`🎯 Processing block completion: ${blockId} (${blockType})`);
            
            // Mark as completed locally
            this.completedBlocks.add(blockId);
            
            // Update block visual state
            this.updateBlockVisualState(blockId, 'completed');
            
            // Sync to backend
            await this.syncBlockCompletion(blockId, blockType);
            
            // Trigger celebrations if configured
            if (this.gamificationManager && source !== 'silent') {
                await this.gamificationManager.celebrateBlockCompletion(
                    blockId, blockType, rewards || {}
                );
            }
            
            // Update progress indicators
            this.updateProgressIndicators();
            
            // Check for lesson completion
            this.checkLessonCompletion();
            
            console.log(`✅ Block completion processed: ${blockId}`);
            
        } catch (error) {
            console.error('Failed to process block completion:', error);
            this.showError('Failed to save progress. Please try again.');
            
        } finally {
            this.isProcessingCompletion = false;
        }
    }
    
    /**
     * Sync block completion to backend
     */
    async syncBlockCompletion(blockId, blockType) {
        try {
            const response = await fetch(`/api/lessons/${this.lessonId}/complete-block`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    block_id: blockId,
                    block_type: blockType,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('📡 Block completion synced to backend:', result);
            
            // Update local progress with server response
            if (result.progress !== undefined) {
                this.userProgress.progress_percentage = result.progress;
            }
            
            // Trigger milestone celebrations
            if (result.milestone && this.gamificationManager) {
                await this.gamificationManager.celebrateMilestone(result.milestone);
            }
            
            return result;
            
        } catch (error) {
            console.error('Failed to sync block completion:', error);
            throw error;
        }
    }
    
    /**
     * Update visual state of a block
     */
    updateBlockVisualState(blockId, state) {
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockElement) {
            blockElement.dataset.status = state;
            
            // Update progress indicator
            const indicator = blockElement.querySelector('.block-progress-indicator');
            if (indicator) {
                indicator.innerHTML = this.getStatusIcon(state);
            }
            
            // Add completion animation class
            if (state === 'completed') {
                blockElement.classList.add('celebrating');
                setTimeout(() => {
                    blockElement.classList.remove('celebrating');
                }, 2000);
            }
        }
    }
    
    /**
     * Update progress indicators throughout the page
     */
    updateProgressIndicators() {
        const totalBlocks = this.lessonData?.blocks?.length || 1;
        const completedCount = this.completedBlocks.size;
        const progress = Math.round((completedCount / totalBlocks) * 100);
        
        // Update main progress bar
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
            progressBar.classList.add('progress-update');
            setTimeout(() => progressBar.classList.remove('progress-update'), 1000);
        }
        
        // Update percentage display
        const percentageElement = document.querySelector('.progress-percentage');
        if (percentageElement) {
            percentageElement.textContent = `${progress}%`;
            percentageElement.classList.add('bounce');
            setTimeout(() => percentageElement.classList.remove('bounce'), 500);
        }
        
        // Update lesson header stats
        this.updateLessonHeaderStats(progress, completedCount, totalBlocks);
        
        console.log(`📊 Progress updated: ${completedCount}/${totalBlocks} blocks (${progress}%)`);
    }
    
    /**
     * Public API for external components to mark blocks complete
     */
    async markBlockComplete(blockId, source = 'api', blockType = 'unknown', rewards = {}) {
        if (this.completedBlocks.has(blockId)) {
            console.log(`⚠️ Block ${blockId} already completed`);
            return;
        }
        
        // Dispatch completion event
        this.dispatchEvent('blockCompleted', {
            blockId,
            blockType,
            rewards,
            source,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Utility methods
     */
    getCurrentUserId() {
        // Try multiple sources for user ID
        return window.currentUser?.uid || 
               document.body.dataset.userId || 
               'dev-user-001';
    }
    
    getStatusIcon(status) {
        const icons = {
            'not-started': '⭕',
            'in-progress': '⏳',
            'completed': '✅',
            'locked': '🔒'
        };
        return icons[status] || '⭕';
    }
    
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { 
            detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Error handling and fallbacks
     */
    showErrorFallback(error) {
        console.error('Lesson integration error:', error);
        
        const fallbackContainer = document.getElementById('fallback-content');
        if (fallbackContainer) {
            fallbackContainer.style.display = 'block';
            fallbackContainer.innerHTML = `
                <div class="error-fallback">
                    <h3>⚠️ Unable to Load Lesson</h3>
                    <p>We're having trouble loading this lesson. Please try refreshing the page.</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        <i class="fas fa-refresh"></i> Refresh Page
                    </button>
                </div>
            `;
        }
    }
    
    showError(message) {
        // Use existing notification system or create simple toast
        if (window.showNotification) {
            window.showNotification(message, 'error');
        } else {
            console.error(message);
            alert(message); // Fallback
        }
    }
    
    /**
     * Additional helper methods
     */
    setupTextBlockCompletion(blockElement) {
        // Implement reading completion detection
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const blockId = entry.target.dataset.blockId;
                    if (blockId && !this.completedBlocks.has(blockId)) {
                        // Mark as completed after 3 seconds of viewing
                        setTimeout(() => {
                            if (entry.target.getBoundingClientRect().top < window.innerHeight) {
                                this.markBlockComplete(blockId, 'reading', 'text');
                            }
                        }, 3000);
                    }
                }
            });
        }, { threshold: 0.8 });
        
        observer.observe(blockElement);
    }
    
    handleCodeCopy(event) {
        const button = event.target;
        const codeBlock = button.closest('.code-example').querySelector('code');
        
        if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
                
                // Mark block as completed
                const blockId = button.closest('[data-block-id]')?.dataset.blockId;
                if (blockId) {
                    this.markBlockComplete(blockId, 'copy', 'code_example');
                }
            });
        }
    }
    
    updateLessonHeaderStats(progress, completed, total) {
        // Update lesson header with current stats
        const headerStats = document.querySelector('.lesson-meta');
        if (headerStats) {
            const progressText = headerStats.querySelector('.progress-text');
            if (progressText) {
                progressText.textContent = `${progress}% Complete | ${completed}/${total} blocks`;
            }
        }
    }
    
    checkLessonCompletion() {
        const totalBlocks = this.lessonData?.blocks?.length || 1;
        const completedCount = this.completedBlocks.size;
        
        if (completedCount >= totalBlocks) {
            console.log('🎉 Lesson completed!');
            
            // Trigger lesson completion celebration
            if (this.gamificationManager) {
                this.gamificationManager.celebrateLessonCompletion();
            }
            
            // Update navigation buttons
            const nextBtn = document.querySelector('.lesson-nav-next');
            if (nextBtn) {
                nextBtn.innerHTML = '<i class="fas fa-trophy"></i> Lesson Complete!';
                nextBtn.classList.add('completed');
            }
            
            // Dispatch lesson completion event
            this.dispatchEvent('lessonCompleted', {
                lessonId: this.lessonId,
                completedBlocks: Array.from(this.completedBlocks),
                progress: 100
            });
        }
    }
    
    // Handle component-specific events (stubs for now)
    handleCodeExecution(detail) {
        console.log('Code executed:', detail);
    }
    
    handleQuizCompletion(detail) {
        console.log('Quiz completed:', detail);
    }
    
    handleProgressUpdate(detail) {
        console.log('Progress updated:', detail);
    }
    
    handleComponentError(detail) {
        console.error('Component error:', detail);
        this.showError(`Component error: ${detail.message}`);
    }
}

// Global initialization function
window.initializeLessonIntegration = function(lessonId) {
    if (!lessonId) {
        console.error('Lesson ID required for initialization');
        return null;
    }
    
    const integration = new LessonIntegrationManager(lessonId);
    integration.init();
    
    // Store globally for debugging and external access
    window.lessonIntegration = integration;
    
    return integration;
};

// Auto-initialize if lesson ID is available
document.addEventListener('DOMContentLoaded', () => {
    const lessonId = window.lessonId || 
                    document.body.dataset.lessonId || 
                    document.querySelector('[data-lesson-id]')?.dataset.lessonId;
    
    if (lessonId) {
        console.log('🎯 Auto-initializing lesson integration for:', lessonId);
        window.initializeLessonIntegration(lessonId);
    } else {
        console.log('ℹ️ No lesson ID found, skipping auto-initialization');
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LessonIntegrationManager;
}
