/**
 * Lesson Manager - Main controller for dynamic lesson pages
 * Code with Morais - Lesson Template System
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
            
            // Set up offline caching
            this.setupOfflineCaching();
            
            console.log('✅ Lesson Page Manager initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Lesson Page Manager:', error);
            this.handleInitializationError(error);
        } finally {
            // Hide loading state after initialization
            this.hideLoadingState();
        }
    }
    
    /**
     * Get lesson ID from URL path or data attribute
     */
    getLessonId() {
        // Get from URL path /lesson/lesson-id
        const pathParts = window.location.pathname.split('/');
        const lessonIndex = pathParts.indexOf('lesson');
        
        if (lessonIndex !== -1 && pathParts[lessonIndex + 1]) {
            return pathParts[lessonIndex + 1];
        }
        
        // Fallback to data attribute
        const container = document.querySelector('.lesson-container');
        if (container && container.dataset.lessonId) {
            return container.dataset.lessonId;
        }
        
        // Default for testing
        return 'python-basics';
    }
    
    /**
     * Test Firebase integration and lesson data structure
     */
    async testFirebaseIntegration() {
        console.log('🔥 Testing Firebase integration...');
        
        try {
            // Test 1: Check if lesson data is already loaded from server
            const serverLessonData = window.lessonData || null;
            if (serverLessonData) {
                console.log('✅ Server lesson data available:', serverLessonData);
                this.validateLessonStructure(serverLessonData);
            } else {
                console.log('⚠️ No server lesson data found');
            }
            
            // Test 2: Check lesson structure and blocks
            if (serverLessonData && serverLessonData.blocks) {
                console.log(`📊 Lesson has ${serverLessonData.blocks.length} content blocks`);
                serverLessonData.blocks.forEach((block, index) => {
                    console.log(`  Block ${index + 1}: ${block.type} - ${block.title || block.id}`);
                });
            } else {
                console.log('⚠️ Lesson blocks not found in data structure');
            }
            
            // Test 3: Check progress data
            const serverProgressData = window.lessonProgress || {};
            if (Object.keys(serverProgressData).length > 0) {
                console.log('✅ User progress data available:', serverProgressData);
            } else {
                console.log('ℹ️ No user progress data (new lesson)');
            }
            
            // Test 4: Check Firebase service availability
            if (window.firebase && window.firebase.apps && window.firebase.apps.length > 0) {
                console.log('✅ Firebase SDK available and initialized');
            } else {
                console.log('⚠️ Firebase SDK not detected (using mock data)');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Firebase integration test failed:', error);
            throw error;
        }
    }
    
    /**
     * Validate lesson data structure matches expected format
     */
    validateLessonStructure(lessonData) {
        console.log('🔍 Validating lesson data structure...');
        
        const requiredFields = ['id', 'title', 'difficulty', 'estimated_time', 'xp_reward'];
        const missingFields = requiredFields.filter(field => !lessonData[field]);
        
        if (missingFields.length > 0) {
            console.warn('⚠️ Missing required fields:', missingFields);
        } else {
            console.log('✅ All required lesson fields present');
        }
        
        // Check blocks structure
        if (lessonData.blocks && Array.isArray(lessonData.blocks)) {
            console.log(`✅ Blocks array found with ${lessonData.blocks.length} blocks`);
            
            // Validate each block
            lessonData.blocks.forEach((block, index) => {
                const blockRequired = ['id', 'type', 'order'];
                const blockMissing = blockRequired.filter(field => !block[field]);
                
                if (blockMissing.length > 0) {
                    console.warn(`⚠️ Block ${index} missing fields:`, blockMissing);
                } else {
                    console.log(`✅ Block ${index} (${block.type}) structure valid`);
                }
            });
        } else {
            console.warn('⚠️ No blocks array found in lesson data');
        }
        
        return true;
    }
    
    /**
     * Load lesson data from server or Firebase
     */
    async loadLessonData() {
        console.log('📚 Loading lesson data...');
        
        try {
            // Use server-provided data first
            if (window.lessonData) {
                this.lessonData = window.lessonData;
                console.log('✅ Using server-provided lesson data');
                return;
            }
            
            // Fallback to API call
            const response = await fetch(`/api/lesson/${this.lessonId}`);
            if (response.ok) {
                this.lessonData = await response.json();
                console.log('✅ Loaded lesson data from API');
            } else {
                throw new Error(`Failed to load lesson: ${response.status}`);
            }
            
        } catch (error) {
            console.error('❌ Error loading lesson data:', error);
            // Use mock data for development
            this.lessonData = this.getMockLessonData();
            console.log('🔄 Using mock lesson data');
        }
    }
    
    /**
     * Get mock lesson data for testing
     */
    getMockLessonData() {
        return {
            id: this.lessonId,
            title: 'Python Basics: Variables and Data Types',
            difficulty: 'beginner',
            estimated_time: 30,
            xp_reward: 100,
            coin_reward: 25,
            blocks: [
                {
                    id: 'block_1',
                    type: 'text',
                    order: 1,
                    title: 'Introduction to Variables',
                    content: 'Variables are containers for storing data values. In Python, you create a variable by assigning a value to it.'
                },
                {
                    id: 'block_2',
                    type: 'code_example',
                    order: 2,
                    title: 'Variable Example',
                    language: 'python',
                    code: 'name = "Alice"\nage = 25\nprint(f"{name} is {age} years old")',
                    explanation: 'This example shows how to create variables and use them in a print statement.'
                },
                {
                    id: 'block_3',
                    type: 'interactive',
                    order: 3,
                    title: 'Try It Yourself',
                    instructions: 'Create a variable named "favorite_color" and assign it your favorite color.',
                    starter_code: '# Create your variable here\n',
                    tests: [
                        {
                            name: 'Variable exists',
                            description: 'Check if favorite_color variable is defined',
                            input: '',
                            expected_contains: 'favorite_color'
                        }
                    ]
                }
            ]
        };
    }
    
    /**
     * Initialize components
     */
    initializeComponents() {
        console.log('🔧 Initializing components...');
        
        try {
            // Initialize ContentBlockRenderer
            if (window.ContentBlockRenderer) {
                this.contentRenderer = new ContentBlockRenderer();
                console.log('✅ ContentBlockRenderer initialized');
            }
            
            // Initialize ProgressTracker
            if (window.ProgressTracker) {
                const userId = this.getCurrentUserId();
                this.progressTracker = new ProgressTracker(this.lessonId, userId);
                console.log('✅ ProgressTracker initialized');
                
                // Set total blocks count for progress calculation
                window.currentLessonTotalBlocks = this.lessonData.blocks ? this.lessonData.blocks.length : 0;
            }
            
            // Load user progress data
            this.userProgress = window.lessonProgress || {};
            
            console.log('✅ All components initialized');
        } catch (error) {
            console.error('❌ Error initializing components:', error);
        }
    }
    
    /**
     * Get current user ID
     * @returns {string} User ID
     */
    getCurrentUserId() {
        // Check for existing user data
        if (window.currentUser && window.currentUser.uid) {
            return window.currentUser.uid;
        }
        
        // Fallback to dev user
        return 'dev-user-001';
    }
    
    /**
     * Show loading state while initializing
     */
    showLoadingState() {
        console.log('🔄 Showing loading state...');
        
        // Show skeleton loader for lesson header
        const lessonHeader = document.querySelector('.lesson-header');
        if (lessonHeader) {
            lessonHeader.innerHTML = `
                <div class="skeleton-loader">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-progress"></div>
                    <div class="skeleton-stats"></div>
                </div>
            `;
        }
        
        // Show skeleton loader for content
        const contentContainer = document.getElementById('lesson-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="skeleton-loader">
                    <div class="skeleton-block"></div>
                    <div class="skeleton-block"></div>
                    <div class="skeleton-block"></div>
                </div>
            `;
        }
        
        // Add loading overlay if it doesn't exist
        if (!document.querySelector('.lesson-loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'lesson-loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading lesson content...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        this.isLoading = true;
    }
    
    /**
     * Hide loading state after initialization
     */
    hideLoadingState() {
        console.log('✅ Hiding loading state...');
        
        // Remove loading overlay
        const overlay = document.querySelector('.lesson-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        this.isLoading = false;
    }
    
    /**
     * Load user progress for this lesson from Firebase or API
     */
    async loadUserProgress() {
        console.log('👤 Loading user progress...');
        
        try {
            // Use server-provided progress data first
            if (window.lessonProgress) {
                this.userProgress = window.lessonProgress;
                console.log('✅ Using server-provided progress data:', this.userProgress);
                return;
            }
            
            // Try to fetch from API
            const response = await fetch(`/api/lesson/${this.lessonId}/progress`);
            
            if (response.ok) {
                const data = await response.json();
                this.userProgress = data.progress || {
                    completed: false,
                    progress: 0,
                    completed_blocks: [],
                    current_block: null,
                    time_spent: 0,
                    last_accessed: new Date().toISOString()
                };
                console.log('✅ Loaded progress from API:', this.userProgress);
            } else {
                // Initialize empty progress for new lessons
                this.userProgress = {
                    completed: false,
                    progress: 0,
                    completed_blocks: [],
                    current_block: null,
                    time_spent: 0,
                    last_accessed: new Date().toISOString()
                };
                console.log('ℹ️ Initialized empty progress (new lesson)');
            }
            
        } catch (error) {
            console.warn('⚠️ Failed to load user progress, using defaults:', error);
            this.userProgress = {
                completed: false,
                progress: 0,
                completed_blocks: [],
                current_block: null,
                time_spent: 0,
                last_accessed: new Date().toISOString()
            };
        }
    }
    
    /**
     * Render the complete lesson content
     */
    async renderLessonContent() {
        console.log('🎨 Rendering complete lesson content...');
        
        try {
            // Render lesson header with progress
            this.renderLessonHeader();
            
            // Check what kind of lesson data we have
            const hasServerData = this.lessonData && (this.lessonData.content || this.lessonData.code_examples || this.lessonData.exercises);
            const hasMockBlocks = this.lessonData && this.lessonData.blocks && Array.isArray(this.lessonData.blocks);
            const hasContentRenderer = this.contentRenderer && hasMockBlocks;
            
            if (hasContentRenderer) {
                console.log('🎨 Using ContentBlockRenderer for mock data...');
                const contentContainer = document.getElementById('lesson-content-container') || 
                                        document.getElementById('lesson-content') ||
                                        document.querySelector('.lesson-content');
                                        
                if (contentContainer) {
                    // Clear existing content
                    contentContainer.innerHTML = '';
                    
                    // Render each block using ContentBlockRenderer
                    for (let i = 0; i < this.lessonData.blocks.length; i++) {
                        const block = this.lessonData.blocks[i];
                        const blockElement = this.contentRenderer.renderBlock(block, i);
                        if (blockElement) {
                            contentContainer.appendChild(blockElement);
                        }
                    }
                    
                    console.log(`✅ Rendered ${this.lessonData.blocks.length} content blocks with ContentBlockRenderer`);
                } else {
                    console.error('❌ Content container not found');
                }
            } else if (hasServerData) {
                console.log('🔄 Using fallback content rendering for server data...');
                this.renderContent(); // Fallback to existing method
            } else {
                console.error('❌ No lesson data available for rendering');
                this.showErrorState('No lesson content available');
            }
            
            // Render lesson navigation
            this.renderLessonNavigation();
            
            // Update progress indicators
            this.updateProgressIndicators();
            
            // Notify that content is ready to be shown
            this.notifyContentReady();
            
        } catch (error) {
            console.error('❌ Error rendering lesson content:', error);
            this.showErrorState(error.message);
        }
    }
    
    /**
     * Notify that content is ready to be displayed
     */
    notifyContentReady() {
        // Call the callback if it exists (set by template)
        if (typeof this.onContentReady === 'function') {
            this.onContentReady();
        }
        
        // Also call global function if it exists
        if (typeof window.showLessonContent === 'function') {
            window.showLessonContent();
        }
        
        console.log('✅ Content ready notification sent');
    }
    
    /**
     * Render lesson header with progress bar
     */
    renderLessonHeader() {
        const headerContainer = document.querySelector('.lesson-header');
        if (!headerContainer) return;
        
        const progressPercentage = this.userProgress.progress || 0;
        const timeRemaining = this.lessonData.estimated_time || 30;
        const xpReward = this.lessonData.xp_reward || 100;
        const coinReward = this.lessonData.coin_reward || 25;
        
        headerContainer.innerHTML = `
            <div class="lesson-header-content">
                <h1 class="lesson-title">${this.lessonData.title}</h1>
                <div class="lesson-meta">
                    <span class="difficulty-badge ${this.lessonData.difficulty}">${this.lessonData.difficulty}</span>
                    <span class="time-estimate">⏱️ ${timeRemaining} min</span>
                </div>
                <div class="progress-section">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <span class="progress-text">${Math.round(progressPercentage)}% Complete</span>
                </div>
                <div class="lesson-rewards">
                    <span class="reward-item">🪙 +${coinReward} PyCoins</span>
                    <span class="reward-item">⭐ +${xpReward} XP</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Render lesson navigation footer
     */
    renderLessonNavigation() {
        const navContainer = document.querySelector('.lesson-navigation');
        if (!navContainer) return;
        
        navContainer.innerHTML = `
            <div class="lesson-nav-content">
                <button id="prev-lesson" class="nav-btn secondary">← Previous Lesson</button>
                <button id="lessons-home" class="nav-btn primary">🏠 All Lessons</button>
                <button id="next-lesson" class="nav-btn secondary">Next Lesson →</button>
            </div>
        `;
    }
    
    /**
     * Track when user starts the lesson for analytics
     */
    trackLessonStart() {
        console.log('📊 Tracking lesson start...');
        
        try {
            // Record lesson start time
            this.startTime = new Date().toISOString();
            
            // Track in user progress
            if (this.userProgress) {
                this.userProgress.last_accessed = this.startTime;
                this.userProgress.session_start = this.startTime;
            }
            
            // Send analytics event if available
            if (typeof gtag !== 'undefined') {
                gtag('event', 'lesson_start', {
                    lesson_id: this.lessonId,
                    lesson_title: this.lessonData.title,
                    user_progress: this.userProgress.progress || 0
                });
            }
            
            // Update last accessed time on server
            this.updateLessonAccess();
            
            console.log('✅ Lesson start tracked');
            
        } catch (error) {
            console.warn('⚠️ Failed to track lesson start:', error);
        }
    }
    
    /**
     * Update lesson access time on server
     */
    async updateLessonAccess() {
        try {
            await fetch(`/api/lesson/${this.lessonId}/access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    timestamp: this.startTime,
                    user_id: this.getCurrentUserId()
                })
            });
        } catch (error) {
            console.warn('⚠️ Failed to update lesson access:', error);
        }
    }
    
    /**
     * Update progress indicators throughout the page
     */
    updateProgressIndicators() {
        const completedBlocks = this.userProgress.completed_blocks || [];
        const totalBlocks = this.lessonData.blocks ? this.lessonData.blocks.length : 0;
        const progressPercentage = totalBlocks > 0 ? (completedBlocks.length / totalBlocks) * 100 : 0;
        
        // Update progress bar
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progressPercentage}%`;
        }
        
        // Update progress text
        const progressText = document.querySelector('.progress-text');
        if (progressText) {
            progressText.textContent = `${Math.round(progressPercentage)}% Complete`;
        }
        
        // Update completed block indicators
        completedBlocks.forEach(blockId => {
            const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
            if (blockElement) {
                blockElement.classList.add('completed');
            }
        });
    }
    
    /**
     * Show error state when initialization fails
     */
    showErrorState(errorMessage) {
        console.error('🚨 Showing error state:', errorMessage);
        
        const errorContainer = document.querySelector('.lesson-content') || document.body;
        errorContainer.innerHTML = `
            <div class="lesson-error-state">
                <div class="error-icon">⚠️</div>
                <h2>Unable to Load Lesson</h2>
                <p>We encountered an error while loading this lesson:</p>
                <div class="error-message">${errorMessage}</div>
                <div class="error-actions">
                    <button onclick="location.reload()" class="btn primary">Retry</button>
                    <button onclick="history.back()" class="btn secondary">Go Back</button>
                </div>
            </div>
        `;
        
        // Hide loading state
        this.hideLoadingState();
    }

    /**
     * Render content blocks using ContentBlockRenderer
     */
    renderContent() {
        console.log('🎨 Rendering content blocks with ContentBlockRenderer...');
        
        // Try multiple possible container IDs/classes
        const contentContainer = document.getElementById('lesson-content-container') || 
                                document.getElementById('lesson-content') ||
                                document.querySelector('.lesson-content') ||
                                document.querySelector('main.lesson-content') ||
                                document.querySelector('[id*="lesson-content"]');
        
        if (!contentContainer) {
            console.error('❌ Content container not found. Available containers:', 
                         Array.from(document.querySelectorAll('[id*="lesson"], [class*="lesson"]')).map(el => el.id || el.className));
            this.showErrorState('Content container not found. Please check the lesson template.');
            return;
        }
        
        console.log('✅ Found content container:', contentContainer.id || contentContainer.className);
        
        // Clear any existing content
        contentContainer.innerHTML = '';
        
        // Check if we have lesson data with either content or blocks
        if (!this.lessonData || (!this.lessonData.content && !this.lessonData.blocks)) {
            console.error('❌ No lesson data available for rendering');
            contentContainer.innerHTML = `
                <div class="error-state">
                    <h3>⚠️ Content Not Available</h3>
                    <p>Sorry, this lesson content is not available right now.</p>
                    <button onclick="location.reload()" class="btn btn-primary">Try Again</button>
                </div>
            `;
            return;
        }
        
        // Use blocks array (mock data) or handle content string (server data)
        let contentArray = [];
        
        if (this.lessonData.blocks && Array.isArray(this.lessonData.blocks)) {
            // Use blocks array from mock data
            contentArray = this.lessonData.blocks;
        } else if (this.lessonData.content && typeof this.lessonData.content === 'string') {
            // Convert content string to a single text block
            contentArray = [{
                id: 'content-main',
                type: 'text',
                order: 1,
                content: this.lessonData.content
            }];
            
            // Add code examples if available
            if (this.lessonData.code_examples && Array.isArray(this.lessonData.code_examples)) {
                this.lessonData.code_examples.forEach((example, index) => {
                    contentArray.push({
                        id: `code-example-${index}`,
                        type: 'code_example',
                        order: index + 2,
                        title: example.title,
                        code: example.code,
                        explanation: example.explanation,
                        language: 'python'
                    });
                });
            }
            
            // Add exercises if available
            if (this.lessonData.exercises && Array.isArray(this.lessonData.exercises)) {
                this.lessonData.exercises.forEach((exercise, index) => {
                    contentArray.push({
                        id: `exercise-${index}`,
                        type: 'interactive',
                        order: index + 100,
                        title: exercise.title,
                        instructions: exercise.description,
                        starter_code: exercise.starter_code,
                        hints: exercise.hints
                    });
                });
            }
        } else {
            console.error('❌ No valid lesson content found');
            contentArray = [];
        }
        console.log(`📚 Rendering ${contentArray.length} content blocks...`);
        
        if (contentArray.length === 0) {
            contentContainer.innerHTML = `
                <div class="error-state">
                    <h3>⚠️ Content Not Available</h3>
                    <p>Sorry, this lesson content is not available right now.</p>
                    <button onclick="location.reload()" class="btn btn-primary">Try Again</button>
                </div>
            `;
            return;
        }
        
        // Render each content block
        contentArray.forEach((block, index) => {
            const blockElement = this.createContentBlock(block, index);
            if (blockElement) {
                contentContainer.appendChild(blockElement);
            }
        });
        
        console.log('✅ Content blocks rendered successfully');
        
        // Initialize interactive elements
        this.initializeInteractiveElements();
    }
    
    /**
     * Create a content block element
     */
    createContentBlock(block, index) {
        const blockElement = document.createElement('div');
        blockElement.className = `content-block ${block.type}-block`;
        blockElement.dataset.blockIndex = index;
        blockElement.dataset.blockType = block.type;
        
        switch (block.type) {
            case 'text':
                blockElement.innerHTML = `
                    <div class="text-content">
                        ${this.parseMarkdown(block.content)}
                    </div>
                `;
                break;
                
            case 'code_example':
                blockElement.innerHTML = `
                    <div class="code-example">
                        <div class="code-header">
                            <span class="language-badge">${block.language || 'python'}</span>
                            <button class="btn-copy" onclick="copyCode(this)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <pre><code class="language-${block.language || 'python'}">${this.escapeHtml(block.code)}</code></pre>
                    </div>
                `;
                break;
                
            case 'interactive':
            case 'interactive_challenge':
                blockElement.innerHTML = `
                    <div class="interactive-challenge">
                        <h3>💻 Interactive Challenge</h3>
                        <p class="challenge-instructions">${block.instructions || block.description || 'Complete the coding challenge below.'}</p>
                        <div class="code-editor-container">
                            <div id="editor-${index}" class="code-editor" style="height: 200px;">${block.starter_code || '# Write your code here\n'}</div>
                        </div>
                        <div class="challenge-actions">
                            <button class="btn btn-primary" onclick="runCode(${index})">
                                <i class="fas fa-play"></i> Run Code
                            </button>
                            <button class="btn btn-secondary" onclick="resetCode(${index})">
                                <i class="fas fa-undo"></i> Reset
                            </button>
                        </div>
                        <div id="output-${index}" class="code-output" style="display: none;">
                            <div class="output-header">Output:</div>
                            <pre class="output-content"></pre>
                        </div>
                    </div>
                `;
                break;
                
            case 'quiz':
                blockElement.innerHTML = `
                    <div class="quiz-block">
                        <h3>🧠 Knowledge Check</h3>
                        <p>Quiz content will be loaded here...</p>
                        <div class="quiz-placeholder">
                            <button class="btn btn-primary" onclick="loadQuiz('${block.quiz_id}')">
                                <i class="fas fa-question-circle"></i> Start Quiz
                            </button>
                        </div>
                    </div>
                `;
                break;
                
            default:
                console.warn(`Unknown block type: ${block.type}`);
                blockElement.innerHTML = `
                    <div class="unknown-block">
                        <p>Unknown content type: ${block.type}</p>
                    </div>
                `;
        }
        
        return blockElement;
    }
    
    /**
     * Parse simple markdown
     */
    parseMarkdown(text) {
        return text
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n/gim, '<br>');
    }
    
    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Initialize interactive elements after content is rendered
     */
    initializeInteractiveElements() {
        console.log('🔧 Initializing interactive elements...');
        
        // Initialize ACE editors for interactive challenges
        document.querySelectorAll('.code-editor').forEach((editor, index) => {
            try {
                if (typeof ace !== 'undefined') {
                    const aceEditor = ace.edit(editor.id);
                    aceEditor.setTheme('ace/theme/monokai');
                    aceEditor.session.setMode('ace/mode/python');
                    aceEditor.setOptions({
                        fontSize: '14px',
                        wrap: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true
                    });
                    
                    // Store editor reference
                    this.editors = this.editors || {};
                    this.editors[index] = aceEditor;
                    
                    console.log(`✅ ACE editor initialized for challenge ${index}`);
                } else {
                    console.warn('⚠️ ACE editor not available');
                }
            } catch (error) {
                console.error(`❌ Error initializing editor ${index}:`, error);
            }
        });
        
        // Initialize syntax highlighting for code examples
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        }
    }
    
    /**
     * Set up event listeners for lesson interactions
     */
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Lesson navigation buttons
        const prevBtn = document.getElementById('prev-lesson');
        const nextBtn = document.getElementById('next-lesson');
        const homeBtn = document.getElementById('lessons-home');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.navigateToPreviousLesson());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.navigateToNextLesson());
        }
        
        if (homeBtn) {
            homeBtn.addEventListener('click', () => window.location.href = '/lessons');
        }
        
        // Block completion tracking
        document.addEventListener('click', (e) => {
            if (e.target.matches('.complete-block-btn')) {
                const blockId = e.target.dataset.blockId;
                this.markBlockComplete(blockId);
            }
        });
        
        console.log('✅ Event listeners set up successfully');
    }
    
    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('❌ Lesson Page Manager initialization failed:', error);
        
        // Show user-friendly error message
        const container = document.getElementById('lesson-content-container');
        if (container) {
            container.innerHTML = `
                <div class="initialization-error">
                    <h3>⚠️ Loading Error</h3>
                    <p>There was a problem loading this lesson. Please try refreshing the page.</p>
                    <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
                </div>
            `;
        }
        
        // Hide loading state
        this.hideLoadingState();
    }
    
    /**
     * Navigate to previous lesson
     */
    navigateToPreviousLesson() {
        // This would be implemented based on lesson ordering
        console.log('Navigating to previous lesson...');
    }
    
    /**
     * Navigate to next lesson  
     */
    navigateToNextLesson() {
        // This would be implemented based on lesson ordering
        console.log('Navigating to next lesson...');
    }
    
    /**
     * Mark a content block as complete
     */
    markBlockComplete(blockId) {
        console.log(`Marking block ${blockId} as complete`);
        
        if (this.progressTracker) {
            this.progressTracker.markBlockComplete(blockId);
        }
        
        // Update UI
        const blockElement = document.querySelector(`[data-block-id="${blockId}"]`);
        if (blockElement) {
            blockElement.classList.add('completed');
        }
    }

    /**
     * Set up offline caching for lesson content
     */
    setupOfflineCaching() {
        console.log('🔧 Setting up offline caching...');
        
        try {
            // Cache lesson data
            if (this.lessonData) {
                localStorage.setItem(`lesson_${this.lessonId}_cache`, JSON.stringify(this.lessonData));
            }
            
            // Cache user progress
            if (this.userProgress) {
                localStorage.setItem(`lesson_${this.lessonId}_progress`, JSON.stringify(this.userProgress));
            }
            
            console.log('✅ Offline caching set up successfully');
        } catch (error) {
            console.warn('⚠️ Failed to set up offline caching:', error);
        }
    }

    // ...existing code...
}

// Global functions for template compatibility
window.switchSubtopic = function(index) {
    if (window.lessonPageManager && typeof window.lessonPageManager.switchSubtopic === 'function') {
        window.lessonPageManager.switchSubtopic(index);
    } else {
        console.warn('switchSubtopic: LessonPageManager not available');
    }
};

window.previousSubtopic = function() {
    if (window.lessonPageManager && typeof window.lessonPageManager.previousSubtopic === 'function') {
        window.lessonPageManager.previousSubtopic();
    } else {
        console.warn('previousSubtopic: LessonPageManager not available');
    }
};

window.nextSubtopic = function() {
    if (window.lessonPageManager && typeof window.lessonPageManager.nextSubtopic === 'function') {
        window.lessonPageManager.nextSubtopic();
    } else {
        console.warn('nextSubtopic: LessonPageManager not available');
    }
};

window.completeCurrentSubtopic = function() {
    if (window.lessonPageManager && typeof window.lessonPageManager.completeCurrentSubtopic === 'function') {
        window.lessonPageManager.completeCurrentSubtopic();
    } else {
        console.warn('completeCurrentSubtopic: LessonPageManager not available');
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 DOM loaded, initializing LessonPageManager...');
    
    // Initialize the LessonPageManager
    if (typeof LessonPageManager !== 'undefined') {
        window.lessonPageManager = new LessonPageManager();
        console.log('✅ LessonPageManager initialized');
    } else {
        console.error('❌ LessonPageManager class not found');
    }
});
