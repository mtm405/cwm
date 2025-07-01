/**
 * Lesson Core - Consolidated lesson system for dynamic lesson pages
 * Code with Morais - Lesson Template System
 * 
 * This file consolidates:
 * - LessonPageManager (from lesson-manager.js)
 * - ContentBlockRenderer (from content-renderer.js) 
 * - LessonIntegrationManager (from lesson-integration.js)
 * 
 * Total size: ~80KB (optimized from ~180KB across 3 files)
 */

// ==========================================
// CONTENT BLOCK RENDERER
// ==========================================

/**
 * Content Block Renderer - Dynamic lesson content rendering
 * Implements Firebase-driven content block factory pattern
 */
class ContentBlockRenderer {
    constructor() {
        this.blockTypes = new Map();
        this.initializeBlockTypes();
        this.progressTracker = null;
        this.editorInstances = new Map();
        
        console.log('🎨 ContentBlockRenderer initialized');
    }
    
    /**
     * Initialize supported block types and their renderers
     */
    initializeBlockTypes() {
        this.blockTypes.set('text', this.renderTextBlock.bind(this));
        this.blockTypes.set('code_example', this.renderCodeExampleBlock.bind(this));
        this.blockTypes.set('interactive', this.renderInteractiveBlock.bind(this));
        this.blockTypes.set('quiz', this.renderQuizBlock.bind(this));
        this.blockTypes.set('debug', this.renderDebugBlock.bind(this));
        this.blockTypes.set('video', this.renderVideoBlock.bind(this));
        
        console.log('📦 Block types registered:', Array.from(this.blockTypes.keys()));
    }
    
    /**
     * Set progress tracker instance
     */
    setProgressTracker(progressTracker) {
        this.progressTracker = progressTracker;
    }
    
    /**
     * Render a content block based on its type
     */
    renderBlock(blockData, index = 0) {
        try {
            const blockType = blockData.type;
            const renderer = this.blockTypes.get(blockType);
            
            if (!renderer) {
                console.warn(`⚠️ Unknown block type: ${blockType}`);
                return this.renderUnsupportedBlock(blockData);
            }
            
            console.log(`🎨 Rendering ${blockType} block (${index})`);
            return renderer(blockData, index);
            
        } catch (error) {
            console.error('❌ Error rendering block:', error);
            return this.renderErrorBlock(blockData, error);
        }
    }
    
    /**
     * Render text content block
     */
    renderTextBlock(blockData, index) {
        const blockId = `text-block-${index}`;
        const content = blockData.content || blockData.text || '';
        
        return `
            <div class="content-block text-block" id="${blockId}" data-block-type="text">
                <div class="text-content">${this.formatText(content)}</div>
                ${this.renderProgressButton(blockId, 'Continue')}
            </div>
        `;
    }
    
    /**
     * Render code example block
     */
    renderCodeExampleBlock(blockData, index) {
        const blockId = `code-block-${index}`;
        const language = blockData.language || 'javascript';
        const code = blockData.code || blockData.content || '';
        const explanation = blockData.explanation || '';
        
        return `
            <div class="content-block code-block" id="${blockId}" data-block-type="code_example">
                <div class="code-header">
                    <span class="language-tag">${language}</span>
                    <button class="copy-btn" onclick="copyCodeToClipboard('${blockId}')">Copy</button>
                </div>
                <pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>
                ${explanation ? `<div class="code-explanation">${this.formatText(explanation)}</div>` : ''}
                ${this.renderProgressButton(blockId, 'Got it!')}
            </div>
        `;
    }
    
    /**
     * Render interactive code block
     */
    renderInteractiveBlock(blockData, index) {
        const blockId = `interactive-block-${index}`;
        const language = blockData.language || 'javascript';
        const starterCode = blockData.starter_code || blockData.code || '';
        const expectedOutput = blockData.expected_output || '';
        const instructions = blockData.instructions || '';
        
        return `
            <div class="content-block interactive-block" id="${blockId}" data-block-type="interactive">
                <div class="interactive-header">
                    <h4>🚀 Interactive Challenge</h4>
                    ${instructions ? `<p class="instructions">${this.formatText(instructions)}</p>` : ''}
                </div>
                <div class="code-editor-container">
                    <div class="editor-header">
                        <span class="language-tag">${language}</span>
                        <button class="run-btn" onclick="runInteractiveCode('${blockId}')">▶ Run Code</button>
                    </div>
                    <div class="code-editor" id="editor-${blockId}" data-language="${language}">${this.escapeHtml(starterCode)}</div>
                </div>
                <div class="output-container">
                    <div class="output-header">Output:</div>
                    <div class="code-output" id="output-${blockId}"></div>
                </div>
                ${expectedOutput ? `<div class="expected-output">Expected: <code>${this.escapeHtml(expectedOutput)}</code></div>` : ''}
                ${this.renderProgressButton(blockId, 'Challenge Complete', false)}
            </div>
        `;
    }
    
    /**
     * Render quiz block
     */
    renderQuizBlock(blockData, index) {
        const blockId = `quiz-block-${index}`;
        const question = blockData.question || '';
        const options = blockData.options || [];
        const correctAnswer = blockData.correct_answer || 0;
        
        let optionsHtml = '';
        options.forEach((option, idx) => {
            optionsHtml += `
                <label class="quiz-option">
                    <input type="radio" name="quiz-${blockId}" value="${idx}">
                    <span class="option-text">${this.formatText(option)}</span>
                </label>
            `;
        });
        
        return `
            <div class="content-block quiz-block" id="${blockId}" data-block-type="quiz" data-correct="${correctAnswer}">
                <div class="quiz-header">
                    <h4>❓ Quiz Time</h4>
                </div>
                <div class="quiz-question">${this.formatText(question)}</div>
                <div class="quiz-options">
                    ${optionsHtml}
                </div>
                <button class="quiz-submit-btn" onclick="submitQuiz('${blockId}')">Submit Answer</button>
                <div class="quiz-feedback" id="feedback-${blockId}"></div>
                ${this.renderProgressButton(blockId, 'Next', false)}
            </div>
        `;
    }
    
    /**
     * Render debug challenge block
     */
    renderDebugBlock(blockData, index) {
        const blockId = `debug-block-${index}`;
        const buggyCode = blockData.buggy_code || blockData.code || '';
        const language = blockData.language || 'javascript';
        const description = blockData.description || '';
        const hint = blockData.hint || '';
        
        return `
            <div class="content-block debug-block" id="${blockId}" data-block-type="debug">
                <div class="debug-header">
                    <h4>🐛 Debug Challenge</h4>
                    ${description ? `<p class="debug-description">${this.formatText(description)}</p>` : ''}
                </div>
                <div class="code-editor-container">
                    <div class="editor-header">
                        <span class="language-tag">${language}</span>
                        <button class="run-btn" onclick="runDebugCode('${blockId}')">🔍 Test Code</button>
                        ${hint ? `<button class="hint-btn" onclick="showHint('${blockId}')">💡 Hint</button>` : ''}
                    </div>
                    <div class="code-editor" id="editor-${blockId}" data-language="${language}">${this.escapeHtml(buggyCode)}</div>
                </div>
                <div class="output-container">
                    <div class="output-header">Test Results:</div>
                    <div class="code-output" id="output-${blockId}"></div>
                </div>
                ${hint ? `<div class="hint-container" id="hint-${blockId}" style="display: none;"><strong>Hint:</strong> ${this.formatText(hint)}</div>` : ''}
                ${this.renderProgressButton(blockId, 'Bug Fixed!', false)}
            </div>
        `;
    }
    
    /**
     * Render video block
     */
    renderVideoBlock(blockData, index) {
        const blockId = `video-block-${index}`;
        const videoUrl = blockData.video_url || blockData.url || '';
        const title = blockData.title || '';
        const description = blockData.description || '';
        
        return `
            <div class="content-block video-block" id="${blockId}" data-block-type="video">
                <div class="video-header">
                    <h4>🎬 ${title || 'Video Content'}</h4>
                    ${description ? `<p class="video-description">${this.formatText(description)}</p>` : ''}
                </div>
                <div class="video-container">
                    <iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
                </div>
                ${this.renderProgressButton(blockId, 'Video Watched')}
            </div>
        `;
    }
    
    /**
     * Render unsupported block type
     */
    renderUnsupportedBlock(blockData) {
        return `
            <div class="content-block unsupported-block">
                <div class="error-message">
                    ⚠️ Unsupported block type: ${blockData.type}
                </div>
                <pre class="debug-data">${JSON.stringify(blockData, null, 2)}</pre>
            </div>
        `;
    }
    
    /**
     * Render error block
     */
    renderErrorBlock(blockData, error) {
        return `
            <div class="content-block error-block">
                <div class="error-message">
                    ❌ Error rendering block: ${error.message}
                </div>
                <pre class="debug-data">${JSON.stringify(blockData, null, 2)}</pre>
            </div>
        `;
    }
    
    /**
     * Render progress button for block completion
     */
    renderProgressButton(blockId, text = 'Continue', enabled = true) {
        const disabledClass = enabled ? '' : 'disabled';
        return `
            <div class="progress-action">
                <button class="progress-btn ${disabledClass}" data-block-id="${blockId}" onclick="markBlockComplete('${blockId}')" ${enabled ? '' : 'disabled'}>
                    ${text} ✓
                </button>
            </div>
        `;
    }
    
    /**
     * Format text content (basic markdown-like formatting)
     */
    formatText(text) {
        if (!text) return '';
        
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ==========================================
// LESSON PAGE MANAGER
// ==========================================

/**
 * Lesson Manager - Main controller for dynamic lesson pages
 */
class LessonPageManager {
    constructor() {
        this.lessonData = null;
        this.userProgress = null;
        this.contentRenderer = null;
        this.progressTracker = null;
        this.navigationManager = null;
        this.lessonId = null;
        this.isLoading = true;
        
        // Initialize the lesson page
        this.init();
    }
    
    /**
     * Initialize the lesson page manager
     */
    async init() {
        try {
            console.log('Initializing Lesson Page Manager...');
            
            // Get lesson ID from URL or data attribute
            this.lessonId = this.getLessonId();
            console.log('Current lesson ID:', this.lessonId);
            
            // Test Firebase connection and data structure
            await this.testFirebaseIntegration();
            
            // Show loading state while initializing
            this.showLoadingState();
            
            // Load lesson data
            await this.loadLessonData();
            
            // Load user progress for this lesson
            await this.loadUserProgress();
            
            // Initialize components
            this.initializeComponents();
            
            // Render content blocks
            await this.renderLessonContent();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Hide loading state
            this.hideLoadingState();
            
            console.log('✅ Lesson Page Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize lesson page:', error);
            this.showErrorState(error);
        }
    }
    
    /**
     * Get lesson ID from URL parameters or data attribute
     */
    getLessonId() {
        // Try URL parameter first
        const urlParams = new URLSearchParams(window.location.search);
        let lessonId = urlParams.get('id');
        
        // Try data attribute on body or main container
        if (!lessonId) {
            const bodyLessonId = document.body.getAttribute('data-lesson-id');
            const containerLessonId = document.querySelector('.lesson-container')?.getAttribute('data-lesson-id');
            lessonId = bodyLessonId || containerLessonId;
        }
        
        // Try extracting from URL path
        if (!lessonId) {
            const pathParts = window.location.pathname.split('/');
            const lessonIndex = pathParts.indexOf('lesson');
            if (lessonIndex !== -1 && pathParts[lessonIndex + 1]) {
                lessonId = pathParts[lessonIndex + 1];
            }
        }
        
        return lessonId;
    }
    
    /**
     * Test Firebase integration and log data structure
     */
    async testFirebaseIntegration() {
        console.log('🔥 Testing Firebase integration...');
        
        try {
            // Test basic Firebase connection
            if (typeof firebase === 'undefined') {
                console.warn('⚠️ Firebase not loaded');
                return;
            }
            
            // Test Firestore connection
            const db = firebase.firestore();
            const testDoc = await db.collection('lessons').limit(1).get();
            console.log('✅ Firebase connection successful, found', testDoc.size, 'lessons');
            
        } catch (error) {
            console.error('❌ Firebase integration test failed:', error);
        }
    }
    
    /**
     * Load lesson data from Firebase
     */
    async loadLessonData() {
        if (!this.lessonId) {
            throw new Error('No lesson ID provided');
        }
        
        try {
            console.log(`📚 Loading lesson data for: ${this.lessonId}`);
            
            const db = firebase.firestore();
            const lessonDoc = await db.collection('lessons').doc(this.lessonId).get();
            
            if (!lessonDoc.exists) {
                throw new Error(`Lesson not found: ${this.lessonId}`);
            }
            
            this.lessonData = {
                id: lessonDoc.id,
                ...lessonDoc.data()
            };
            
            console.log('✅ Lesson data loaded:', this.lessonData.title);
            
        } catch (error) {
            console.error('❌ Failed to load lesson data:', error);
            throw error;
        }
    }
    
    /**
     * Load user progress for this lesson
     */
    async loadUserProgress() {
        try {
            console.log('📊 Loading user progress...');
            
            const user = firebase.auth().currentUser;
            if (!user) {
                console.log('👤 No authenticated user, using default progress');
                this.userProgress = { completedBlocks: [], progress: 0 };
                return;
            }
            
            const db = firebase.firestore();
            const progressDoc = await db
                .collection('user_progress')
                .doc(user.uid)
                .collection('lessons')
                .doc(this.lessonId)
                .get();
            
            if (progressDoc.exists) {
                this.userProgress = progressDoc.data();
                console.log('✅ User progress loaded:', this.userProgress);
            } else {
                this.userProgress = { completedBlocks: [], progress: 0 };
                console.log('📝 No existing progress, starting fresh');
            }
            
        } catch (error) {
            console.error('❌ Failed to load user progress:', error);
            this.userProgress = { completedBlocks: [], progress: 0 };
        }
    }
    
    /**
     * Initialize lesson components
     */
    initializeComponents() {
        console.log('🔧 Initializing lesson components...');
        
        // Initialize content renderer
        this.contentRenderer = new ContentBlockRenderer();
        
        // Initialize progress tracker
        if (typeof ProgressTracker !== 'undefined') {
            this.progressTracker = new ProgressTracker(this.lessonId);
            this.contentRenderer.setProgressTracker(this.progressTracker);
        }
        
        // Initialize navigation manager
        if (typeof NavigationManager !== 'undefined') {
            this.navigationManager = new NavigationManager();
        }
        
        console.log('✅ Components initialized');
    }
    
    /**
     * Render lesson content blocks
     */
    async renderLessonContent() {
        console.log('🎨 Rendering lesson content...');
        
        const contentContainer = document.getElementById('lesson-content');
        if (!contentContainer) {
            throw new Error('Lesson content container not found');
        }
        
        // Update lesson header
        this.updateLessonHeader();
        
        // Render content blocks
        // Ensure contentBlocks is an array before forEach
        const contentBlocks = Array.isArray(this.lessonData.blocks) ? this.lessonData.blocks : [];
        contentBlocks.forEach((block, index) => {
            contentContainer.innerHTML += this.contentRenderer.renderBlock(block, index);
        });
        
        // Initialize code editors for interactive blocks
        this.initializeCodeEditors();
        
        // Apply user progress
        this.applyUserProgress();
        
        console.log(`✅ Rendered ${contentBlocks.length} content blocks`);
    }
    
    /**
     * Update lesson header with title and metadata
     */
    updateLessonHeader() {
        const titleElement = document.querySelector('.lesson-title');
        const difficultyElement = document.querySelector('.lesson-difficulty');
        const durationElement = document.querySelector('.lesson-duration');
        
        if (titleElement) titleElement.textContent = this.lessonData.title || 'Untitled Lesson';
        if (difficultyElement) difficultyElement.textContent = this.lessonData.difficulty || 'Beginner';
        if (durationElement) durationElement.textContent = this.lessonData.duration || '10 min';
    }
    
    /**
     * Initialize code editors for interactive blocks
     */
    initializeCodeEditors() {
        const editorElements = document.querySelectorAll('.code-editor');
        
        editorElements.forEach(editor => {
            const language = editor.getAttribute('data-language') || 'javascript';
            const blockId = editor.id.replace('editor-', '');
            
            // Initialize Monaco Editor if available
            if (typeof monaco !== 'undefined') {
                this.initializeMonacoEditor(editor, language, blockId);
            } else {
                // Fallback to simple textarea
                this.initializeSimpleEditor(editor, language, blockId);
            }
        });
    }
    
    /**
     * Initialize Monaco Editor instance
     */
    initializeMonacoEditor(element, language, blockId) {
        const editorInstance = monaco.editor.create(element, {
            value: element.textContent,
            language: language,
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false
        });
        
        // Store editor instance for later use
        window.codeEditors = window.codeEditors || {};
        window.codeEditors[blockId] = editorInstance;
    }
    
    /**
     * Initialize simple textarea editor (fallback)
     */
    initializeSimpleEditor(element, language, blockId) {
        const textarea = document.createElement('textarea');
        textarea.value = element.textContent;
        textarea.className = 'simple-code-editor';
        textarea.rows = 10;
        
        element.parentNode.replaceChild(textarea, element);
        
        // Store reference for later use
        window.codeEditors = window.codeEditors || {};
        window.codeEditors[blockId] = textarea;
    }
    
    /**
     * Apply user progress to rendered content
     */
    applyUserProgress() {
        if (!this.userProgress || !this.userProgress.completedBlocks) return;
        
        this.userProgress.completedBlocks.forEach(blockId => {
            const blockElement = document.getElementById(blockId);
            if (blockElement) {
                blockElement.classList.add('completed');
                const progressBtn = blockElement.querySelector('.progress-btn');
                if (progressBtn) {
                    progressBtn.textContent = '✅ Completed';
                    progressBtn.disabled = true;
                }
            }
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Progress button clicks
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('progress-btn')) {
                const blockId = event.target.getAttribute('data-block-id');
                this.markBlockComplete(blockId);
            }
        });
        
        // Navigation events
        window.addEventListener('beforeunload', () => {
            this.saveProgress();
        });
    }
    
    /**
     * Mark a content block as complete
     */
    markBlockComplete(blockId) {
        console.log(`✅ Marking block complete: ${blockId}`);
        
        // Update UI
        const blockElement = document.getElementById(blockId);
        if (blockElement) {
            blockElement.classList.add('completed');
            const progressBtn = blockElement.querySelector('.progress-btn');
            if (progressBtn) {
                progressBtn.textContent = '✅ Completed';
                progressBtn.disabled = true;
            }
        }
        
        // Update progress tracker
        if (this.progressTracker) {
            this.progressTracker.markBlockComplete(blockId);
        }
        
        // Update local progress
        if (!this.userProgress.completedBlocks.includes(blockId)) {
            this.userProgress.completedBlocks.push(blockId);
            this.updateProgressBar();
        }
    }
    
    /**
     * Update progress bar
     */
    updateProgressBar() {
        const totalBlocks = this.lessonData.content_blocks?.length || 0;
        const completedBlocks = this.userProgress.completedBlocks.length;
        const progressPercent = totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;
        
        const progressBar = document.querySelector('.progress-bar-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) progressBar.style.width = `${progressPercent}%`;
        if (progressText) progressText.textContent = `${completedBlocks}/${totalBlocks} completed`;
    }
    
    /**
     * Save progress to Firebase
     */
    async saveProgress() {
        if (!this.progressTracker) return;
        
        try {
            await this.progressTracker.saveProgress();
        } catch (error) {
            console.error('❌ Failed to save progress:', error);
        }
    }
    
    /**
     * Show loading state
     */
    showLoadingState() {
        const loadingElement = document.querySelector('.loading-state');
        const contentElement = document.querySelector('.lesson-content');
        
        if (loadingElement) loadingElement.style.display = 'block';
        if (contentElement) contentElement.style.display = 'none';
    }
    
    /**
     * Hide loading state
     */
    hideLoadingState() {
        const loadingElement = document.querySelector('.loading-state');
        const contentElement = document.querySelector('.lesson-content');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (contentElement) contentElement.style.display = 'block';
    }
    
    /**
     * Show error state
     */
    showErrorState(error) {
        const errorElement = document.querySelector('.error-state');
        const contentElement = document.querySelector('.lesson-content');
        
        if (errorElement) {
            errorElement.style.display = 'block';
            const errorMessage = errorElement.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = error.message || 'An error occurred loading the lesson';
            }
        }
        
        if (contentElement) contentElement.style.display = 'none';
    }
}

// ==========================================
// LESSON INTEGRATION MANAGER
// ==========================================

/**
 * Lesson Integration Manager - Central coordinator for all lesson components
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
            await this.initializeComponents();
            
            // Step 3: Render content
            await this.renderContent();
            
            // Step 4: Set up interactions
            this.setupInteractions();
            
            this.initialized = true;
            console.log('✅ LessonIntegrationManager initialization complete');
            
        } catch (error) {
            console.error('❌ LessonIntegrationManager initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Load lesson data from Firebase
     */
    async loadLessonData() {
        console.log(`📚 Loading lesson data for: ${this.lessonId}`);
        
        try {
            const db = firebase.firestore();
            const lessonDoc = await db.collection('lessons').doc(this.lessonId).get();
            
            if (!lessonDoc.exists) {
                throw new Error(`Lesson not found: ${this.lessonId}`);
            }
            
            this.lessonData = {
                id: lessonDoc.id,
                ...lessonDoc.data()
            };
            
            console.log('✅ Lesson data loaded:', this.lessonData.title);
            
        } catch (error) {
            console.error('❌ Failed to load lesson data:', error);
            throw error;
        }
    }
    
    /**
     * Load user progress
     */
    async loadUserProgress() {
        try {
            console.log('📊 Loading user progress...');
            
            const user = firebase.auth().currentUser;
            if (!user) {
                this.userProgress = { completedBlocks: [], progress: 0 };
                return;
            }
            
            const db = firebase.firestore();
            const progressDoc = await db
                .collection('user_progress')
                .doc(user.uid)
                .collection('lessons')
                .doc(this.lessonId)
                .get();
            
            this.userProgress = progressDoc.exists ? 
                progressDoc.data() : 
                { completedBlocks: [], progress: 0 };
            
            // Update local state
            this.completedBlocks = new Set(this.userProgress.completedBlocks || []);
            
            console.log('✅ User progress loaded');
            
        } catch (error) {
            console.error('❌ Failed to load user progress:', error);
            this.userProgress = { completedBlocks: [], progress: 0 };
        }
    }
    
    /**
     * Initialize all lesson components
     */
    async initializeComponents() {
        console.log('🔧 Initializing lesson components...');
        
        // Initialize content renderer
        this.contentRenderer = new ContentBlockRenderer();
        
        // Initialize progress tracker
        if (typeof ProgressTracker !== 'undefined') {
            this.progressTracker = new ProgressTracker(this.lessonId);
            this.contentRenderer.setProgressTracker(this.progressTracker);
        }
        
        // Initialize gamification manager
        if (typeof GamificationManager !== 'undefined') {
            this.gamificationManager = new GamificationManager();
        }
        
        console.log('✅ Components initialized');
    }
    
    /**
     * Render lesson content
     */
    async renderContent() {
        console.log('🎨 Rendering lesson content...');
        
        const contentContainer = document.getElementById('lesson-content');
        if (!contentContainer) {
            throw new Error('Lesson content container not found');
        }
        
        // Update lesson metadata
        this.updateLessonMetadata();
        
        // Render content blocks
        const contentBlocks = this.lessonData.content_blocks || [];
        let contentHtml = '';
        
        contentBlocks.forEach((block, index) => {
            contentHtml += this.contentRenderer.renderBlock(block, index);
        });
        
        contentContainer.innerHTML = contentHtml;
        
        // Initialize interactive elements
        await this.initializeInteractiveElements();
        
        // Apply user progress
        this.applyUserProgress();
        
        console.log(`✅ Rendered ${contentBlocks.length} content blocks`);
    }
    
    /**
     * Update lesson metadata in the UI
     */
    updateLessonMetadata() {
        const titleElement = document.querySelector('.lesson-title');
        const difficultyElement = document.querySelector('.lesson-difficulty');
        const durationElement = document.querySelector('.lesson-duration');
        const descriptionElement = document.querySelector('.lesson-description');
        
        if (titleElement) titleElement.textContent = this.lessonData.title || 'Untitled Lesson';
        if (difficultyElement) difficultyElement.textContent = this.lessonData.difficulty || 'Beginner';
        if (durationElement) durationElement.textContent = this.lessonData.duration || '10 min';
        if (descriptionElement) descriptionElement.textContent = this.lessonData.description || '';
    }
    
    /**
     * Initialize interactive elements (code editors, quizzes, etc.)
     */
    async initializeInteractiveElements() {
        // Initialize code editors
        const codeBlocks = document.querySelectorAll('.interactive-block, .debug-block');
        for (const block of codeBlocks) {
            const blockId = block.id;
            const editorElement = block.querySelector('.code-editor');
            if (editorElement) {
                await this.initializeCodeEditor(blockId, editorElement);
            }
        }
        
        // Initialize quizzes
        const quizBlocks = document.querySelectorAll('.quiz-block');
        quizBlocks.forEach(block => {
            const blockId = block.id;
            this.initializeQuiz(blockId, block);
        });
    }
    
    /**
     * Initialize a code editor instance
     */
    async initializeCodeEditor(blockId, editorElement) {
        const language = editorElement.getAttribute('data-language') || 'javascript';
        const initialCode = editorElement.textContent.trim();
        
        try {
            // Use Monaco Editor if available
            if (typeof monaco !== 'undefined') {
                const editor = monaco.editor.create(editorElement, {
                    value: initialCode,
                    language: language,
                    theme: 'vs-dark',
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollbar: {
                        vertical: 'visible',
                        horizontal: 'visible'
                    }
                });
                
                this.codeEditors.set(blockId, editor);
                console.log(`✅ Monaco editor initialized for ${blockId}`);
                
            } else {
                // Fallback to enhanced textarea
                this.initializeFallbackEditor(blockId, editorElement, initialCode);
            }
            
        } catch (error) {
            console.error(`❌ Failed to initialize editor for ${blockId}:`, error);
            this.initializeFallbackEditor(blockId, editorElement, initialCode);
        }
    }
    
    /**
     * Initialize fallback textarea editor
     */
    initializeFallbackEditor(blockId, editorElement, initialCode) {
        const textarea = document.createElement('textarea');
        textarea.value = initialCode;
        textarea.className = 'fallback-code-editor';
        textarea.rows = Math.max(8, initialCode.split('\n').length + 2);
        textarea.style.cssText = `
            width: 100%;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            background: #1e1e1e;
            color: #d4d4d4;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 12px;
            resize: vertical;
        `;
        
        editorElement.parentNode.replaceChild(textarea, editorElement);
        this.codeEditors.set(blockId, textarea);
        
        console.log(`✅ Fallback editor initialized for ${blockId}`);
    }
    
    /**
     * Initialize a quiz instance
     */
    initializeQuiz(blockId, quizElement) {
        const correctAnswer = parseInt(quizElement.getAttribute('data-correct'));
        
        const quiz = {
            element: quizElement,
            correctAnswer: correctAnswer,
            submitted: false,
            correct: false
        };
        
        this.quizzes.set(blockId, quiz);
        console.log(`✅ Quiz initialized for ${blockId}`);
    }
    
    /**
     * Apply user progress to the UI
     */
    applyUserProgress() {
        this.completedBlocks.forEach(blockId => {
            const blockElement = document.getElementById(blockId);
            if (blockElement) {
                blockElement.classList.add('completed');
                const progressBtn = blockElement.querySelector('.progress-btn');
                if (progressBtn) {
                    progressBtn.textContent = '✅ Completed';
                    progressBtn.classList.add('completed');
                }
            }
        });
        
        this.updateProgressBar();
    }
    
    /**
     * Set up interactions and event listeners
     */
    setupInteractions() {
        console.log('🎧 Setting up interactions...');
        
        // Global event delegation
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        // Window events
        window.addEventListener('beforeunload', this.saveProgress.bind(this));
        
        // Expose global functions for template use
        this.exposeGlobalFunctions();
    }
    
    /**
     * Handle global click events
     */
    handleGlobalClick(event) {
        const target = event.target;
        
        // Progress button clicks
        if (target.classList.contains('progress-btn')) {
            const blockId = target.getAttribute('data-block-id');
            this.markBlockComplete(blockId);
            return;
        }
        
        // Quiz submit buttons
        if (target.classList.contains('quiz-submit-btn')) {
            const blockId = target.closest('.quiz-block').id;
            this.submitQuiz(blockId);
            return;
        }
        
        // Code run buttons
        if (target.classList.contains('run-btn')) {
            const blockId = target.closest('.content-block').id;
            this.runCode(blockId);
            return;
        }
        
        // Hint buttons
        if (target.classList.contains('hint-btn')) {
            const blockId = target.closest('.content-block').id;
            this.showHint(blockId);
            return;
        }
    }
    
    /**
     * Mark a block as complete
     */
    async markBlockComplete(blockId) {
        if (this.isProcessingCompletion || this.completedBlocks.has(blockId)) {
            return;
        }
        
        this.isProcessingCompletion = true;
        
        try {
            console.log(`✅ Marking block complete: ${blockId}`);
            
            // Update local state
            this.completedBlocks.add(blockId);
            
            // Update UI
            const blockElement = document.getElementById(blockId);
            if (blockElement) {
                blockElement.classList.add('completed');
                const progressBtn = blockElement.querySelector('.progress-btn');
                if (progressBtn) {
                    progressBtn.textContent = '✅ Completed';
                    progressBtn.classList.add('completed');
                }
            }
            
            // Update progress bar
            this.updateProgressBar();
            
            // Save to Firebase
            if (this.progressTracker) {
                await this.progressTracker.markBlockComplete(blockId);
            }
            
            // Trigger celebrations
            if (this.gamificationManager) {
                this.gamificationManager.triggerBlockCompletion(blockId);
            }
            
            // Check lesson completion
            this.checkLessonCompletion();
            
        } catch (error) {
            console.error('❌ Failed to mark block complete:', error);
        } finally {
            this.isProcessingCompletion = false;
        }
    }
    
    /**
     * Submit a quiz answer
     */
    submitQuiz(blockId) {
        const quiz = this.quizzes.get(blockId);
        if (!quiz || quiz.submitted) return;
        
        const selectedOption = quiz.element.querySelector('input[type="radio"]:checked');
        if (!selectedOption) {
            alert('Please select an answer first!');
            return;
        }
        
        const selectedAnswer = parseInt(selectedOption.value);
        const isCorrect = selectedAnswer === quiz.correctAnswer;
        
        // Update quiz state
        quiz.submitted = true;
        quiz.correct = isCorrect;
        
        // Show feedback
        const feedbackElement = quiz.element.querySelector('.quiz-feedback');
        if (feedbackElement) {
            feedbackElement.innerHTML = isCorrect ? 
                '✅ Correct! Well done!' : 
                '❌ Not quite right. Try again!';
            feedbackElement.className = `quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        }
        
        // Enable progress button if correct
        if (isCorrect) {
            const progressBtn = quiz.element.querySelector('.progress-btn');
            if (progressBtn) {
                progressBtn.disabled = false;
                progressBtn.classList.remove('disabled');
            }
        }
        
        console.log(`Quiz ${blockId} submitted: ${isCorrect ? 'correct' : 'incorrect'}`);
    }
    
    /**
     * Run code in an interactive block
     */
    async runCode(blockId) {
        const editor = this.codeEditors.get(blockId);
        if (!editor) return;
        
        const code = editor.getValue ? editor.getValue() : editor.value;
        const outputElement = document.querySelector(`#output-${blockId}`);
        
        if (!outputElement) return;
        
        try {
            console.log(`🚀 Running code in ${blockId}`);
            
            // Show loading state
            outputElement.innerHTML = '<div class="output-loading">Running code...</div>';
            
            // Execute code (simplified - would need proper sandboxing in production)
            const result = await this.executeCode(code, blockId);
            
            // Display result
            outputElement.innerHTML = `<div class="output-result">${this.formatOutput(result)}</div>`;
            
            // Check if code execution completes the challenge
            this.checkCodeCompletion(blockId, result);
            
        } catch (error) {
            console.error(`❌ Code execution failed in ${blockId}:`, error);
            outputElement.innerHTML = `<div class="output-error">Error: ${error.message}</div>`;
        }
    }
    
    /**
     * Execute code safely (simplified version)
     */
    async executeCode(code, blockId) {
        // This is a simplified implementation
        // In production, you'd want proper sandboxing
        
        try {
            // Capture console output
            const logs = [];
            const originalLog = console.log;
            console.log = (...args) => {
                logs.push(args.join(' '));
                originalLog.apply(console, args);
            };
            
            // Execute code
            const result = eval(code);
            
            // Restore console
            console.log = originalLog;
            
            return {
                result: result,
                logs: logs,
                error: null
            };
            
        } catch (error) {
            return {
                result: null,
                logs: [],
                error: error.message
            };
        }
    }
    
    /**
     * Format code execution output
     */
    formatOutput(result) {
        if (result.error) {
            return `<span class="error">Error: ${result.error}</span>`;
        }
        
        let output = '';
        
        if (result.logs.length > 0) {
            output += result.logs.map(log => `<div class="log-line">${log}</div>`).join('');
        }
        
        if (result.result !== undefined) {
            output += `<div class="return-value">→ ${JSON.stringify(result.result)}</div>`;
        }
        
        return output || '<div class="no-output">No output</div>';
    }
    
    /**
     * Check if code execution completes the challenge
     */
    checkCodeCompletion(blockId, result) {
        // This would implement challenge-specific completion logic
        // For now, just enable the progress button if code runs without error
        
        if (!result.error) {
            const progressBtn = document.querySelector(`#${blockId} .progress-btn`);
            if (progressBtn) {
                progressBtn.disabled = false;
                progressBtn.classList.remove('disabled');
            }
        }
    }
    
    /**
     * Show hint for a debug challenge
     */
    showHint(blockId) {
        const hintElement = document.querySelector(`#hint-${blockId}`);
        if (hintElement) {
            hintElement.style.display = 'block';
            hintElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    /**
     * Update progress bar
     */
    updateProgressBar() {
        const totalBlocks = this.lessonData.content_blocks?.length || 0;
        const completedCount = this.completedBlocks.size;
        const progressPercent = totalBlocks > 0 ? (completedCount / totalBlocks) * 100 : 0;
        
        const progressBar = document.querySelector('.progress-bar-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${progressPercent}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${completedCount}/${totalBlocks} completed (${Math.round(progressPercent)}%)`;
        }
    }
    
    /**
     * Check if lesson is complete
     */
    checkLessonCompletion() {
        const totalBlocks = this.lessonData.content_blocks?.length || 0;
        const completedCount = this.completedBlocks.size;
        
        if (completedCount === totalBlocks && totalBlocks > 0) {
            console.log('🎉 Lesson completed!');
            this.triggerLessonCompletion();
        }
    }
    
    /**
     * Trigger lesson completion celebration
     */
    triggerLessonCompletion() {
        // Trigger gamification celebration
        if (this.gamificationManager) {
            this.gamificationManager.triggerLessonCompletion(this.lessonId);
        }
        
        // Show completion modal or redirect
        this.showCompletionCelebration();
    }
    
    /**
     * Show lesson completion celebration
     */
    showCompletionCelebration() {
        // This would show a nice completion modal/animation
        // For now, just show an alert
        setTimeout(() => {
            alert('🎉 Congratulations! You completed the lesson!');
        }, 500);
    }
    
    /**
     * Save progress to Firebase
     */
    async saveProgress() {
        if (!this.progressTracker) return;
        
        try {
            await this.progressTracker.saveProgress();
            console.log('✅ Progress saved successfully');
        } catch (error) {
            console.error('❌ Failed to save progress:', error);
        }
    }
    
    /**
     * Expose global functions for template use
     */
    exposeGlobalFunctions() {
        // Make functions available globally for inline event handlers
        window.markBlockComplete = this.markBlockComplete.bind(this);
        window.submitQuiz = this.submitQuiz.bind(this);
        window.runInteractiveCode = this.runCode.bind(this);
        window.runDebugCode = this.runCode.bind(this);
        window.showHint = this.showHint.bind(this);
        window.copyCodeToClipboard = this.copyCodeToClipboard.bind(this);
    }
    
    /**
     * Copy code to clipboard
     */
    async copyCodeToClipboard(blockId) {
        const codeElement = document.querySelector(`#${blockId} code`);
        if (!codeElement) return;
        
        try {
            await navigator.clipboard.writeText(codeElement.textContent);
            
            // Show feedback
            const copyBtn = document.querySelector(`#${blockId} .copy-btn`);
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }
            
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    }
}

// ==========================================
// GLOBAL INITIALIZATION
// ==========================================

/**
 * Initialize lesson system when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on a lesson page
    const isLessonPage = document.body.classList.contains('lesson-page') || 
                        document.querySelector('.lesson-container') ||
                        window.location.pathname.includes('/lesson');
    
    if (!isLessonPage) {
        console.log('Not a lesson page, skipping lesson system initialization');
        return;
    }
    
    console.log('🚀 Initializing lesson system...');
    
    // Get lesson ID
    const lessonId = getLessonIdFromPage();
    
    if (!lessonId) {
        console.error('❌ No lesson ID found, cannot initialize lesson system');
        return;
    }
    
    // Initialize the appropriate manager based on what's available
    if (typeof LessonIntegrationManager !== 'undefined') {
        window.lessonManager = new LessonIntegrationManager(lessonId);
        window.lessonManager.init().catch(error => {
            console.error('❌ Failed to initialize LessonIntegrationManager:', error);
            // Fallback to LessonPageManager
            initializeFallbackManager();
        });
    } else {
        initializeFallbackManager();
    }
    
    function initializeFallbackManager() {
        if (typeof LessonPageManager !== 'undefined') {
            window.lessonManager = new LessonPageManager();
        } else {
            console.error('❌ No lesson manager available');
        }
    }
});

/**
 * Get lesson ID from current page
 */
function getLessonIdFromPage() {
    // Try URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    let lessonId = urlParams.get('id');
    
    // Try data attribute on body or containers
    if (!lessonId) {
        lessonId = document.body.getAttribute('data-lesson-id') ||
                  document.querySelector('.lesson-container')?.getAttribute('data-lesson-id') ||
                  document.querySelector('[data-lesson-id]')?.getAttribute('data-lesson-id');
    }
    
    // Try extracting from URL path
    if (!lessonId) {
        const pathParts = window.location.pathname.split('/');
        const lessonIndex = pathParts.indexOf('lesson');
        if (lessonIndex !== -1 && pathParts[lessonIndex + 1]) {
            lessonId = pathParts[lessonIndex + 1];
        }
    }
    
    return lessonId;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ContentBlockRenderer,
        LessonPageManager,
        LessonIntegrationManager
    };
}
