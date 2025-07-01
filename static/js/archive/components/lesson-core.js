/**
 * Lesson Core System - Consolidated Lesson Management
 * Code with Morais - Optimized for performance
 * 
 * This module combines:
 * - LessonPageManager (lesson-manager.js)
 * - LessonIntegrationManager (lesson-integration.js) 
 * - LessonIntegrationTestSuite (lesson-test-suite.js)
 * 
 * Optimized to ~25KB (from 80KB total)
 */

class LessonCore {
    constructor(lessonId) {
        this.lessonId = lessonId || this.getLessonId();
        this.lessonData = null;
        this.userProgress = null;
        this.initialized = false;
        
        // Core components
        this.completedBlocks = new Set();
        this.currentBlock = 0;
        this.isLoading = true;
        
        console.log(`🚀 LessonCore initialized for lesson: ${this.lessonId}`);
    }
    
    /**
     * Main initialization - combines all previous init methods
     */
    async init() {
        if (this.initialized) return;
        
        try {
            this.showLoadingState();
            
            // Load data (from lesson-manager.js)
            await this.loadLessonData();
            await this.loadUserProgress();
            
            // Initialize components (from lesson-integration.js)
            this.initializeComponents();
            
            // Render content
            await this.renderLessonContent();
            
            // Setup events
            this.setupEventListeners();
            this.updateProgressDisplay();
            
            this.initialized = true;
            this.hideLoadingState();
            
            console.log('✅ LessonCore initialized successfully');
            
        } catch (error) {
            console.error('❌ LessonCore initialization failed:', error);
            this.showErrorState(error);
        }
    }
    
    /**
     * Get lesson ID from URL or data attributes
     */
    getLessonId() {
        // Try URL path first
        const pathParts = window.location.pathname.split('/');
        if (pathParts.includes('lesson') && pathParts.length > 2) {
            return pathParts[pathParts.indexOf('lesson') + 1];
        }
        
        // Try data attributes
        const container = document.querySelector('[data-lesson-id]');
        if (container) {
            return container.dataset.lessonId;
        }
        
        // Try global variable
        return window.lessonId || null;
    }
    
    /**
     * Load lesson data - optimized version
     */
    async loadLessonData() {
        try {
            // Try server data first (faster)
            if (window.lessonData && window.lessonData.id === this.lessonId) {
                this.lessonData = window.lessonData;
                console.log('📖 Using cached lesson data');
                return;
            }
            
            // Fallback to API
            const response = await fetch(`/api/lessons/${this.lessonId}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.lessonData = await response.json();
            console.log('📖 Lesson data loaded:', this.lessonData.title);
            
        } catch (error) {
            console.error('Failed to load lesson data:', error);
            throw error;
        }
    }
    
    /**
     * Load user progress - optimized version
     */
    async loadUserProgress() {
        try {
            // Use server data if available
            if (window.lessonProgress) {
                this.userProgress = window.lessonProgress;
                this.completedBlocks = new Set(this.userProgress.completed_blocks || []);
                return;
            }
            
            // Load from localStorage as fallback
            const saved = localStorage.getItem(`lesson_${this.lessonId}_progress`);
            if (saved) {
                this.userProgress = JSON.parse(saved);
                this.completedBlocks = new Set(this.userProgress.completed_blocks || []);
            } else {
                this.userProgress = { completed_blocks: [], progress: 0 };
            }
            
        } catch (error) {
            console.error('Failed to load user progress:', error);
            this.userProgress = { completed_blocks: [], progress: 0 };
        }
    }
    
    /**
     * Initialize core components
     */
    initializeComponents() {
        // Initialize external components if available
        if (window.ContentBlockRenderer) {
            this.contentRenderer = new ContentBlockRenderer();
        }
        
        if (window.ProgressTracker) {
            this.progressTracker = new ProgressTracker(this.lessonId);
        }
        
        if (window.GamificationManager) {
            this.gamificationManager = window.GamificationManager;
        }
    }
    
    /**
     * Render lesson content - optimized block rendering
     */
    async renderLessonContent() {
        const container = document.getElementById('lesson-content-container');
        if (!container || !this.lessonData?.blocks) return;
        
        container.innerHTML = '';
        
        // Render blocks efficiently
        this.lessonData.blocks.forEach((block, index) => {
            const blockElement = this.createBlockElement(block, index);
            if (blockElement) {
                container.appendChild(blockElement);
                
                // Mark as completed if in progress
                if (this.completedBlocks.has(block.id)) {
                    blockElement.classList.add('completed');
                }
            }
        });
        
        // Initialize interactive elements
        this.initializeInteractiveElements();
    }
    
    /**
     * Create block element - simplified but complete
     */
    createBlockElement(block, index) {
        const article = document.createElement('article');
        article.className = `content-block ${block.type}-block`;
        article.id = `block-${block.id || index}`;
        article.dataset.blockId = block.id || index;
        
        switch(block.type) {
            case 'text':
                article.innerHTML = this.createTextBlock(block);
                break;
            case 'code_example':
                article.innerHTML = this.createCodeBlock(block);
                break;
            case 'interactive':
                article.innerHTML = this.createInteractiveBlock(block);
                break;
            case 'quiz':
                article.innerHTML = this.createQuizBlock(block);
                break;
            default:
                article.innerHTML = this.createDefaultBlock(block);
        }
        
        return article;
    }
    
    /**
     * Create text content block
     */
    createTextBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon"><i class="fas fa-book-open"></i></div>
                <div class="block-meta">
                    <span class="block-type">Reading</span>
                </div>
            </div>
            <div class="block-content">
                <div class="text-content">${block.content || ''}</div>
                ${block.key_points ? `
                    <div class="key-points">
                        <h4>🔑 Key Points:</h4>
                        <ul>${block.key_points.map(point => `<li>${point}</li>`).join('')}</ul>
                    </div>
                ` : ''}
            </div>
            <div class="block-actions">
                <button onclick="lessonCore.markBlockComplete('${block.id}')" class="btn btn-success">
                    <i class="fas fa-check"></i> Mark as Read
                </button>
            </div>
        `;
    }
    
    /**
     * Create code example block
     */
    createCodeBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon"><i class="fas fa-code"></i></div>
                <div class="code-meta">
                    <span class="language-badge">${(block.language || 'python').toUpperCase()}</span>
                    <button class="btn-copy" onclick="lessonCore.copyCode('${block.id}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            </div>
            <div class="code-container">
                <div class="code-header">
                    <span class="code-title">${block.title || 'Example Code'}</span>
                </div>
                <pre class="code-content" id="code-${block.id}"><code class="language-${block.language || 'python'}">${block.code || ''}</code></pre>
                ${block.explanation ? `
                    <div class="code-explanation">
                        <h5>💡 Explanation:</h5>
                        <p>${block.explanation}</p>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Create interactive coding block
     */
    createInteractiveBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon"><i class="fas fa-laptop-code"></i></div>
                <div class="challenge-meta">
                    <span class="challenge-type">${block.challenge_type || 'Code Challenge'}</span>
                    <span class="difficulty">${block.difficulty || 'Beginner'}</span>
                </div>
            </div>
            <div class="challenge-content">
                <div class="challenge-instructions">
                    <h4>🎯 Your Challenge:</h4>
                    <p>${block.instructions || ''}</p>
                </div>
                <div class="code-editor-wrapper">
                    <div class="editor-toolbar">
                        <span class="editor-label">${block.language || 'Python'} Editor</span>
                        <div class="editor-actions">
                            <button onclick="lessonCore.runCode('${block.id}')" class="btn btn-primary">
                                <i class="fas fa-play"></i> Run Code
                            </button>
                        </div>
                    </div>
                    <div id="editor-${block.id}" class="code-editor">${block.starter_code || ''}</div>
                    <div id="output-${block.id}" class="code-output"></div>
                </div>
            </div>
        `;
    }
    
    /**
     * Create quiz block
     */
    createQuizBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon"><i class="fas fa-brain"></i></div>
                <div class="quiz-meta">
                    <span class="quiz-type">Knowledge Check</span>
                </div>
            </div>
            <div class="quiz-content">
                <div class="quiz-intro">
                    <h4>🧠 Test Your Understanding</h4>
                    <p>${block.description || 'Complete this quiz to test your knowledge.'}</p>
                </div>
                <div id="quiz-${block.id}" data-quiz-id="${block.id}">
                    <div class="spinner">Loading quiz...</div>
                </div>
            </div>
        `;
    }
    
    /**
     * Create default block for unknown types
     */
    createDefaultBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon"><i class="fas fa-question"></i></div>
                <div class="block-meta">
                    <span class="block-type">Unknown: ${block.type}</span>
                </div>
            </div>
            <div class="block-content">
                <p>This block type (${block.type}) is not yet supported.</p>
            </div>
        `;
    }
    
    /**
     * Initialize interactive elements
     */
    initializeInteractiveElements() {
        // Initialize ACE editors for code blocks
        document.querySelectorAll('.code-editor').forEach(editor => {
            if (editor.id.startsWith('editor-') && typeof ace !== 'undefined') {
                const aceEditor = ace.edit(editor.id);
                aceEditor.setTheme("ace/theme/monokai");
                aceEditor.session.setMode("ace/mode/python");
                aceEditor.setOptions({
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    fontSize: 14,
                    showPrintMargin: false
                });
            }
        });
        
        // Initialize quiz systems
        document.querySelectorAll('[data-quiz-id]').forEach(quizElement => {
            const quizId = quizElement.dataset.quizId;
            if (window.QuizSystem) {
                new QuizSystem(quizElement, quizId);
            }
        });
    }
    
    /**
     * Mark block as complete
     */
    markBlockComplete(blockId) {
        if (this.completedBlocks.has(blockId)) return;
        
        this.completedBlocks.add(blockId);
        this.userProgress.completed_blocks = Array.from(this.completedBlocks);
        
        // Update UI
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockElement) {
            blockElement.classList.add('completed');
            this.animateBlockCompletion(blockElement);
        }
        
        // Update progress
        this.updateProgressDisplay();
        
        // Save progress
        this.saveProgress();
        
        // Celebrate if enabled
        if (this.gamificationManager) {
            this.gamificationManager.celebrateBlockCompletion(blockId);
        }
    }
    
    /**
     * Update progress display
     */
    updateProgressDisplay() {
        const totalBlocks = this.lessonData?.blocks?.length || 0;
        const completedCount = this.completedBlocks.size;
        const progress = totalBlocks > 0 ? Math.round((completedCount / totalBlocks) * 100) : 0;
        
        // Update progress bar
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-percentage');
        const blocksText = document.getElementById('completed-blocks-text');
        
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) progressText.textContent = progress + '%';
        if (blocksText) blocksText.textContent = `${completedCount} of ${totalBlocks} blocks completed`;
        
        // Update lesson progress
        this.userProgress.progress = progress;
        
        // Check for milestones
        this.checkMilestones(progress);
    }
    
    /**
     * Check and celebrate milestones
     */
    checkMilestones(progress) {
        const milestones = [25, 50, 75, 100];
        const messages = {
            25: "🎯 Great start!",
            50: "🔥 Halfway there!",
            75: "⭐ Almost done!",
            100: "🎉 Lesson mastered!"
        };
        
        milestones.forEach(milestone => {
            if (progress >= milestone && !this.userProgress[`milestone_${milestone}`]) {
                this.userProgress[`milestone_${milestone}`] = true;
                console.log(messages[milestone]);
                
                if (this.gamificationManager) {
                    this.gamificationManager.celebrateMilestone(milestone);
                }
            }
        });
    }
    
    /**
     * Copy code to clipboard
     */
    copyCode(blockId) {
        const codeElement = document.getElementById(`code-${blockId}`);
        if (codeElement) {
            const text = codeElement.textContent;
            navigator.clipboard.writeText(text).then(() => {
                console.log('Code copied to clipboard');
                // Could add visual feedback here
            });
        }
    }
    
    /**
     * Run code in interactive blocks
     */
    runCode(blockId) {
        const editorId = `editor-${blockId}`;
        const outputId = `output-${blockId}`;
        
        if (typeof ace !== 'undefined') {
            const editor = ace.edit(editorId);
            const code = editor.getValue();
            const outputDiv = document.getElementById(outputId);
            
            if (outputDiv) {
                outputDiv.innerHTML = '<div class="spinner">Running...</div>';
                
                // Submit to backend
                fetch('/api/submit-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        code: code,
                        lesson_id: this.lessonId,
                        block_id: blockId
                    })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        outputDiv.innerHTML = result.output || 'Code executed successfully!';
                        if (result.passed_tests) {
                            this.markBlockComplete(blockId);
                        }
                    } else {
                        outputDiv.innerHTML = `<div class="error">Error: ${result.error}</div>`;
                    }
                })
                .catch(error => {
                    outputDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
                });
            }
        }
    }
    
    /**
     * Save progress to localStorage and server
     */
    saveProgress() {
        // Save locally
        localStorage.setItem(`lesson_${this.lessonId}_progress`, JSON.stringify(this.userProgress));
        
        // Sync to server if user is logged in
        if (window.currentUser && this.progressTracker) {
            this.progressTracker.syncToFirebase(this.userProgress);
        }
    }
    
    /**
     * Animate block completion
     */
    animateBlockCompletion(element) {
        element.style.transform = 'scale(1.02)';
        element.style.boxShadow = '0 4px 20px rgba(74, 144, 226, 0.3)';
        setTimeout(() => {
            element.style.transform = '';
            element.style.boxShadow = '';
        }, 300);
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for component events
        document.addEventListener('blockCompleted', (e) => {
            this.markBlockComplete(e.detail.blockId);
        });
        
        document.addEventListener('progressUpdated', (e) => {
            this.updateProgressDisplay();
        });
    }
    
    /**
     * Show loading state
     */
    showLoadingState() {
        const loading = document.getElementById('content-loading');
        const content = document.getElementById('lesson-content');
        
        if (loading) loading.style.display = 'block';
        if (content) content.style.display = 'none';
    }
    
    /**
     * Hide loading state
     */
    hideLoadingState() {
        const loading = document.getElementById('content-loading');
        const content = document.getElementById('lesson-content');
        
        if (loading) loading.style.display = 'none';
        if (content) content.style.display = 'block';
    }
    
    /**
     * Show error state
     */
    showErrorState(error) {
        const fallback = document.getElementById('fallback-content');
        if (fallback) {
            fallback.innerHTML = `
                <div class="alert alert-danger">
                    <h4>⚠️ Error Loading Lesson</h4>
                    <p>${error.message}</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        <i class="fas fa-refresh"></i> Try Again
                    </button>
                </div>
            `;
            fallback.style.display = 'block';
        }
        
        this.hideLoadingState();
    }
    
    /**
     * Simple test runner for basic validation
     */
    runBasicTests() {
        const tests = [
            { name: 'Lesson data loaded', test: () => !!this.lessonData },
            { name: 'Progress initialized', test: () => !!this.userProgress },
            { name: 'Blocks rendered', test: () => document.querySelectorAll('.content-block').length > 0 },
            { name: 'Progress bar exists', test: () => !!document.getElementById('progress-fill') }
        ];
        
        console.log('🧪 Running basic tests...');
        
        tests.forEach(({ name, test }) => {
            const result = test();
            console.log(`${result ? '✅' : '❌'} ${name}`);
        });
    }
}

// Global initialization function
window.initializeLessonCore = function(lessonId) {
    if (!window.lessonCore) {
        window.lessonCore = new LessonCore(lessonId);
        return window.lessonCore.init();
    }
    return Promise.resolve();
};

// Auto-initialize if lesson ID is available
document.addEventListener('DOMContentLoaded', function() {
    const lessonId = new LessonCore().getLessonId();
    if (lessonId) {
        window.initializeLessonCore(lessonId);
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LessonCore;
}
