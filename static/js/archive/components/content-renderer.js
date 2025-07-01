/**
 * Content Block Renderer - Dynamic lesson content rendering
 * Code with Morais - Lesson Template System
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
            
            console.log(`🎨 Rendering ${blockType} block: ${blockData.title || blockData.id}`);
            return renderer(blockData, index);
            
        } catch (error) {
            console.error('❌ Error rendering block:', error);
            return this.renderErrorBlock(blockData, error);
        }
    }
    
    /**
     * Render text block with reading progress tracking
     */
    renderTextBlock(blockData, index) {
        const isCompleted = this.isBlockCompleted(blockData.id);
        const progressStatus = isCompleted ? 'completed' : 'not-started';
        
        const blockElement = document.createElement('article');
        blockElement.className = 'content-block text-block';
        blockElement.id = `block-${blockData.id}`;
        blockElement.dataset.blockId = blockData.id;
        blockElement.dataset.blockType = 'text';
        blockElement.dataset.status = progressStatus;
        
        blockElement.innerHTML = `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <div class="block-meta">
                    <span class="block-type">Reading</span>
                    <span class="block-progress-indicator">
                        <i class="fas fa-${isCompleted ? 'check-circle' : 'circle'}"></i>
                    </span>
                </div>
            </div>
            
            <div class="block-content">
                <div class="text-content">
                    ${this.processTextContent(blockData.content)}
                </div>
                
                ${blockData.key_points ? this.renderKeyPoints(blockData.key_points) : ''}
            </div>
            
            <div class="block-actions">
                <button onclick="contentRenderer.markTextBlockComplete('${blockData.id}')" 
                        class="btn btn-primary complete-btn ${isCompleted ? 'completed' : ''}"
                        ${isCompleted ? 'disabled' : ''}>
                    <i class="fas fa-${isCompleted ? 'check' : 'eye'}"></i> 
                    ${isCompleted ? 'Completed' : 'Mark as Read'}
                </button>
            </div>
        `;
        
        // Set up view tracking
        this.setupViewTracking(blockElement, blockData.id);
        
        return blockElement;
    }
    
    /**
     * Render code example block with copy functionality
     */
    renderCodeExampleBlock(blockData, index) {
        const isCompleted = this.isBlockCompleted(blockData.id);
        const progressStatus = isCompleted ? 'completed' : 'not-started';
        
        const blockElement = document.createElement('article');
        blockElement.className = 'content-block code-example-block';
        blockElement.id = `block-${blockData.id}`;
        blockElement.dataset.blockId = blockData.id;
        blockElement.dataset.blockType = 'code_example';
        blockElement.dataset.status = progressStatus;
        
        const language = blockData.language || 'python';
        const uniqueId = `code-${blockData.id}`;
        
        blockElement.innerHTML = `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-code"></i>
                </div>
                <div class="code-meta">
                    <span class="language-badge">${language.toUpperCase()}</span>
                    <button class="btn-copy" onclick="contentRenderer.copyCode('${uniqueId}')">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            </div>
            
            <div class="code-container">
                <div class="code-header">
                    <span class="code-title">${blockData.title || 'Code Example'}</span>
                    <div class="code-actions">
                        <button onclick="contentRenderer.runExampleCode('${blockData.id}')" 
                                class="btn btn-sm btn-run">
                            <i class="fas fa-play"></i> Run
                        </button>
                    </div>
                </div>
                
                <pre class="code-content" id="${uniqueId}"><code class="language-${language}">${this.escapeHtml(blockData.code)}</code></pre>
                
                ${blockData.explanation ? `
                    <div class="code-explanation">
                        <h5>💡 Explanation:</h5>
                        <p>${blockData.explanation}</p>
                    </div>
                ` : ''}
                
                <div class="code-output" id="output-${blockData.id}" style="display: none;">
                    <div class="output-header">
                        <i class="fas fa-terminal"></i> Output:
                    </div>
                    <div class="output-content"></div>
                </div>
            </div>
        `;
        
        // Initialize syntax highlighting if available
        this.initializeSyntaxHighlighting(blockElement, language);
        
        return blockElement;
    }
    
    /**
     * Render interactive challenge block with ACE editor integration
     */
    renderInteractiveBlock(blockData, index) {
        const isCompleted = this.isBlockCompleted(blockData.id);
        const progressStatus = isCompleted ? 'completed' : 'not-started';
        
        const blockElement = document.createElement('article');
        blockElement.className = 'content-block interactive-block';
        blockElement.id = `block-${blockData.id}`;
        blockElement.dataset.blockId = blockData.id;
        blockElement.dataset.blockType = 'interactive';
        blockElement.dataset.status = progressStatus;
        
        const editorId = `editor-${blockData.id}`;
        const language = blockData.language || 'python';
        
        blockElement.innerHTML = `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-laptop-code"></i>
                </div>
                <div class="challenge-meta">
                    <span class="challenge-type">${blockData.challenge_type || 'Code Challenge'}</span>
                    <span class="difficulty">${blockData.difficulty || 'Beginner'}</span>
                </div>
            </div>
            
            <div class="challenge-content">
                <div class="challenge-instructions">
                    <h4>🎯 Your Challenge:</h4>
                    <p>${blockData.instructions}</p>
                    
                    ${blockData.requirements ? this.renderRequirements(blockData.requirements) : ''}
                </div>
                
                <div class="code-editor-wrapper">
                    <div class="editor-toolbar">
                        <span class="editor-label">${language.charAt(0).toUpperCase() + language.slice(1)} Editor</span>
                        <div class="editor-actions">
                            <button onclick="contentRenderer.getHint('${blockData.id}')" 
                                    class="btn btn-sm btn-hint">
                                <i class="fas fa-lightbulb"></i> Hint (5 🪙)
                            </button>
                            <button onclick="contentRenderer.resetCode('${blockData.id}')" 
                                    class="btn btn-sm btn-reset">
                                <i class="fas fa-undo"></i> Reset
                            </button>
                        </div>
                    </div>
                    
                    <div id="${editorId}" class="code-editor">${blockData.starter_code || '# Your code here\\n'}</div>
                    
                    <div class="editor-footer">
                        <button onclick="contentRenderer.runInteractiveCode('${blockData.id}')" 
                                class="btn btn-primary run-btn">
                            <i class="fas fa-play"></i> Run Code
                        </button>
                        <button onclick="contentRenderer.showSolution('${blockData.id}')" 
                                class="btn btn-outline solution-btn">
                            <i class="fas fa-eye"></i> Show Solution
                        </button>
                    </div>
                </div>
                
                <div class="output-section">
                    <div class="output-header">
                        <i class="fas fa-terminal"></i> Output & Results
                    </div>
                    <div id="output-${blockData.id}" class="ide-output"></div>
                    
                    ${blockData.tests ? `
                        <div class="test-results" id="tests-${blockData.id}">
                            <h5>🧪 Test Results:</h5>
                            <div class="test-list">
                                <!-- Test results will be populated here -->
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div id="hint-${blockData.id}" class="hint-section" style="display: none;">
                    <div class="alert alert-info">
                        <h5>💡 Hint:</h5>
                        <p class="hint-content"></p>
                    </div>
                </div>
                
                <div id="solution-${blockData.id}" class="solution-section" style="display: none;">
                    <div class="alert alert-success">
                        <h5>✅ Solution:</h5>
                        <pre><code class="language-${language}">${this.escapeHtml(blockData.solution || 'No solution provided')}</code></pre>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize ACE editor
        setTimeout(() => {
            this.initializeACEEditor(editorId, language, blockData.starter_code || '# Your code here\\n');
        }, 100);
        
        return blockElement;
    }
    
    /**
     * Render quiz block connecting to existing QuizSystem
     */
    renderQuizBlock(blockData, index) {
        const isCompleted = this.isBlockCompleted(blockData.id);
        const progressStatus = isCompleted ? 'completed' : 'not-started';
        
        const blockElement = document.createElement('article');
        blockElement.className = 'content-block quiz-block';
        blockElement.id = `block-${blockData.id}`;
        blockElement.dataset.blockId = blockData.id;
        blockElement.dataset.blockType = 'quiz';
        blockElement.dataset.status = progressStatus;
        
        blockElement.innerHTML = `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="quiz-meta">
                    <span class="quiz-type">Knowledge Check</span>
                    <span class="question-count">${blockData.questions ? blockData.questions.length : 1} Questions</span>
                </div>
            </div>
            
            <div class="quiz-content">
                <div class="quiz-intro">
                    <h4>🧠 Test Your Understanding</h4>
                    <p>${blockData.description || 'Complete this quiz to test your knowledge.'}</p>
                    
                    <div class="quiz-stats">
                        <span><i class="fas fa-question-circle"></i> ${blockData.questions ? blockData.questions.length : 1} questions</span>
                        <span><i class="fas fa-percentage"></i> Pass: ${blockData.passing_score || 70}%</span>
                        <span><i class="fas fa-star"></i> ${blockData.xp_reward || 25} XP</span>
                    </div>
                </div>
                
                <div id="quiz-container-${blockData.id}" class="quiz-container">
                    <!-- Quiz content will be loaded here -->
                </div>
                
                <div class="quiz-actions">
                    <button onclick="contentRenderer.startQuiz('${blockData.id}')" 
                            class="btn btn-primary start-quiz-btn">
                        <i class="fas fa-play"></i> Start Quiz
                    </button>
                </div>
            </div>
        `;
        
        return blockElement;
    }
    
    /**
     * Render debug challenge block for code fixing exercises
     */
    renderDebugBlock(blockData, index) {
        const isCompleted = this.isBlockCompleted(blockData.id);
        const progressStatus = isCompleted ? 'completed' : 'not-started';
        
        const blockElement = document.createElement('article');
        blockElement.className = 'content-block debug-block';
        blockElement.id = `block-${blockData.id}`;
        blockElement.dataset.blockId = blockData.id;
        blockElement.dataset.blockType = 'debug';
        blockElement.dataset.status = progressStatus;
        
        const editorId = `debug-editor-${blockData.id}`;
        const language = blockData.language || 'python';
        
        blockElement.innerHTML = `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-bug"></i>
                </div>
                <div class="debug-meta">
                    <span class="debug-type">Debug Challenge</span>
                    <span class="difficulty">${blockData.difficulty || 'Beginner'}</span>
                </div>
            </div>
            
            <div class="debug-content">
                <div class="debug-instructions">
                    <h4>🐛 Debug This Code:</h4>
                    <p>${blockData.instructions}</p>
                    <div class="expected-output">
                        <strong>Expected Output:</strong> <code>${blockData.expected_output || 'See instructions'}</code>
                    </div>
                </div>
                
                <div class="code-editor-wrapper">
                    <div class="editor-toolbar">
                        <span class="editor-label">Buggy ${language.charAt(0).toUpperCase() + language.slice(1)} Code</span>
                        <div class="editor-actions">
                            <button onclick="contentRenderer.runDebugCode('${blockData.id}')" 
                                    class="btn btn-sm btn-run">
                                <i class="fas fa-play"></i> Test Code
                            </button>
                        </div>
                    </div>
                    
                    <div id="${editorId}" class="code-editor">${blockData.buggy_code || '# Buggy code here\\n'}</div>
                </div>
                
                <div class="debug-output">
                    <div id="debug-output-${blockData.id}" class="output-container"></div>
                </div>
            </div>
        `;
        
        // Initialize ACE editor for debugging
        setTimeout(() => {
            this.initializeACEEditor(editorId, language, blockData.buggy_code || '# Buggy code here\\n');
        }, 100);
        
        return blockElement;
    }
    
    /**
     * Render video block for embedded content
     */
    renderVideoBlock(blockData, index) {
        const isCompleted = this.isBlockCompleted(blockData.id);
        const progressStatus = isCompleted ? 'completed' : 'not-started';
        
        const blockElement = document.createElement('article');
        blockElement.className = 'content-block video-block';
        blockElement.id = `block-${blockData.id}`;
        blockElement.dataset.blockId = blockData.id;
        blockElement.dataset.blockType = 'video';
        blockElement.dataset.status = progressStatus;
        
        blockElement.innerHTML = `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="video-meta">
                    <span class="video-type">Video Lesson</span>
                    <span class="duration">${blockData.duration || '5'} min</span>
                </div>
            </div>
            
            <div class="video-content">
                <div class="video-intro">
                    <h4>📹 ${blockData.title || 'Video Lesson'}</h4>
                    <p>${blockData.description || 'Watch this video to learn more.'}</p>
                </div>
                
                <div class="video-container">
                    ${this.renderVideoEmbed(blockData)}
                </div>
                
                <div class="video-progress">
                    <div class="progress-info">
                        <span>Progress: <span id="video-progress-${blockData.id}">0%</span></span>
                        <span>Watch 80% to complete</span>
                    </div>
                </div>
            </div>
        `;
        
        return blockElement;
    }
    
    /**
     * Render unsupported block type
     */
    renderUnsupportedBlock(blockData) {
        const blockElement = document.createElement('article');
        blockElement.className = 'content-block unsupported-block';
        blockElement.innerHTML = `
            <div class="alert alert-warning">
                <h4>⚠️ Unsupported Block Type</h4>
                <p>Block type "${blockData.type}" is not yet supported.</p>
                <details>
                    <summary>Block Data</summary>
                    <pre>${JSON.stringify(blockData, null, 2)}</pre>
                </details>
            </div>
        `;
        return blockElement;
    }
    
    /**
     * Render error block when rendering fails
     */
    renderErrorBlock(blockData, error) {
        const blockElement = document.createElement('article');
        blockElement.className = 'content-block error-block';
        blockElement.innerHTML = `
            <div class="alert alert-danger">
                <h4>❌ Rendering Error</h4>
                <p>Failed to render block: ${error.message}</p>
                <details>
                    <summary>Error Details</summary>
                    <pre>${error.stack}</pre>
                </details>
            </div>
        `;
        return blockElement;
    }
    
    // =========================================
    // HELPER METHODS
    // =========================================
    
    /**
     * Process text content with markdown-like formatting
     */
    processTextContent(content) {
        if (!content) return '';
        
        // Simple markdown-like processing
        return content
            .replace(/\\n/g, '<br>')
            .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
            .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/#{1,6}\\s(.+)/g, (match, text) => {
                const level = match.indexOf(' ') - match.indexOf('#');
                return `<h${Math.min(level, 6)}>${text}</h${Math.min(level, 6)}>`;
            });
    }
    
    /**
     * Render key points section
     */
    renderKeyPoints(keyPoints) {
        if (!Array.isArray(keyPoints)) return '';
        
        const pointsList = keyPoints.map(point => `<li>${point}</li>`).join('');
        return `
            <div class="key-points">
                <h4>🔑 Key Points:</h4>
                <ul>${pointsList}</ul>
            </div>
        `;
    }
    
    /**
     * Render requirements section
     */
    renderRequirements(requirements) {
        if (!Array.isArray(requirements)) return '';
        
        const reqList = requirements.map(req => `<li>${req}</li>`).join('');
        return `
            <div class="requirements">
                <h5>📋 Requirements:</h5>
                <ul>${reqList}</ul>
            </div>
        `;
    }
    
    /**
     * Render video embed based on URL
     */
    renderVideoEmbed(blockData) {
        const videoUrl = blockData.video_url || blockData.url;
        
        if (!videoUrl) {
            return '<p class="text-muted">No video URL provided</p>';
        }
        
        // YouTube embed
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const videoId = this.extractYouTubeId(videoUrl);
            return `
                <iframe width="100%" height="400" 
                        src="https://www.youtube.com/embed/${videoId}" 
                        frameborder="0" allowfullscreen>
                </iframe>
            `;
        }
        
        // Generic video
        return `<video width="100%" height="400" controls><source src="${videoUrl}"></video>`;
    }
    
    /**
     * Extract YouTube video ID from URL
     */
    extractYouTubeId(url) {
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : '';
    }
    
    /**
     * Escape HTML for safe rendering
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Check if block is completed
     */
    isBlockCompleted(blockId) {
        if (!window.lessonProgress || !window.lessonProgress.completed_blocks) {
            return false;
        }
        return window.lessonProgress.completed_blocks.includes(blockId);
    }
    
    /**
     * Set up view tracking for text blocks
     */
    setupViewTracking(blockElement, blockId) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Track that user has viewed this block
                    setTimeout(() => {
                        this.markTextBlockComplete(blockId);
                    }, 3000); // Mark complete after 3 seconds of viewing
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(blockElement);
    }
    
    /**
     * Initialize syntax highlighting if Prism.js is available
     */
    initializeSyntaxHighlighting(blockElement, language) {
        if (window.Prism) {
            setTimeout(() => {
                window.Prism.highlightAllUnder(blockElement);
            }, 100);
        }
    }
    
    /**
     * Initialize ACE editor for interactive blocks
     */
    initializeACEEditor(editorId, language, initialCode) {
        if (!window.ace) {
            console.warn('ACE editor not available');
            return;
        }
        
        try {
            const editor = window.ace.edit(editorId);
            editor.setTheme('ace/theme/monokai');
            editor.session.setMode(`ace/mode/${language}`);
            editor.setValue(initialCode, -1);
            editor.setOptions({
                fontSize: '14px',
                showPrintMargin: false,
                wrap: true
            });
            
            // Store editor instance
            this.editorInstances.set(editorId, editor);
            
            console.log(`✅ ACE editor initialized for ${editorId}`);
            
        } catch (error) {
            console.error('❌ Failed to initialize ACE editor:', error);
        }
    }
    
    // =========================================
    // INTERACTIVE METHODS (called from UI)
    // =========================================
    
    /**
     * Mark text block as complete
     */
    markTextBlockComplete(blockId) {
        if (this.progressTracker) {
            this.progressTracker.markBlockComplete(blockId);
        }
        
        // Update UI
        const blockElement = document.getElementById(`block-${blockId}`);
        if (blockElement) {
            blockElement.dataset.status = 'completed';
            const button = blockElement.querySelector('.complete-btn');
            const icon = blockElement.querySelector('.block-progress-indicator i');
            
            if (button) {
                button.innerHTML = '<i class="fas fa-check"></i> Completed';
                button.disabled = true;
                button.classList.add('completed');
            }
            
            if (icon) {
                icon.className = 'fas fa-check-circle';
            }
        }
    }
    
    /**
     * Copy code to clipboard
     */
    async copyCode(codeId) {
        const codeElement = document.getElementById(codeId);
        if (!codeElement) return;
        
        try {
            await navigator.clipboard.writeText(codeElement.textContent);
            
            // Show feedback
            const copyButton = document.querySelector(`[onclick*="${codeId}"]`);
            if (copyButton) {
                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyButton.innerHTML = originalText;
                }, 2000);
            }
            
            // Mark block as interacted with
            const blockElement = codeElement.closest('.content-block');
            if (blockElement) {
                this.markTextBlockComplete(blockElement.dataset.blockId);
            }
            
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    }
    
    /**
     * Run example code
     */
    async runExampleCode(blockId) {
        console.log(`🏃 Running example code for block ${blockId}`);
        // Implementation will be added in future sessions
    }
    
    /**
     * Run interactive code
     */
    async runInteractiveCode(blockId) {
        console.log(`🎮 Running interactive code for block ${blockId}`);
        // Implementation will be added in future sessions
    }
    
    /**
     * Get hint for interactive block
     */
    getHint(blockId) {
        console.log(`💡 Getting hint for block ${blockId}`);
        // Implementation will be added in future sessions
    }
    
    /**
     * Reset code in interactive block
     */
    resetCode(blockId) {
        console.log(`🔄 Resetting code for block ${blockId}`);
        // Implementation will be added in future sessions
    }
    
    /**
     * Show solution for interactive block
     */
    showSolution(blockId) {
        console.log(`👁️ Showing solution for block ${blockId}`);
        // Implementation will be added in future sessions
    }
    
    /**
     * Start quiz
     */
    /**
     * Start quiz for a specific block
     */
    async startQuiz(blockId) {
        console.log(`🧠 Starting quiz for block ${blockId}`);
        
        try {
            const blockElement = document.getElementById(`block-${blockId}`);
            if (!blockElement) {
                console.error(`Quiz block ${blockId} not found`);
                return;
            }
            
            // Get quiz data from the block
            const quizContainer = document.getElementById(`quiz-container-${blockId}`);
            const startButton = blockElement.querySelector('.start-quiz-btn');
            
            // Hide start button and show loading
            startButton.style.display = 'none';
            quizContainer.innerHTML = '<div class="loading-spinner">Loading quiz...</div>';
            
            // Get lesson data to find quiz information
            const lessonManager = window.lessonPageManager;
            if (!lessonManager || !lessonManager.lessonData) {
                throw new Error('Lesson data not available');
            }
            
            // Find the quiz block data
            const quizBlockData = lessonManager.lessonData.blocks.find(block => block.id === blockId);
            if (!quizBlockData) {
                throw new Error(`Quiz block data not found for ${blockId}`);
            }
            
            // Prepare quiz data for QuizSystem
            const quizData = {
                id: blockId,
                title: quizBlockData.title || 'Knowledge Check',
                description: quizBlockData.description || 'Test your understanding of this lesson',
                questions: quizBlockData.questions || [],
                passing_score: quizBlockData.passing_score || 70,
                xp_reward: quizBlockData.xp_reward || 25,
                coins_reward: quizBlockData.coins_reward || 5,
                time_limit: quizBlockData.time_limit || null,
                retries_allowed: quizBlockData.retries_allowed || 3
            };
            
            // Create and initialize QuizSystem instance
            const quizSystem = new QuizSystem(blockId, quizData);
            
            // Store reference for later use
            this.activeQuizzes = this.activeQuizzes || new Map();
            this.activeQuizzes.set(blockId, quizSystem);
            
            // Set up quiz container and event handlers
            quizContainer.innerHTML = `<div id="quiz-${blockId}"></div>`;
            
            // Override quiz completion callback to integrate with lesson progress
            const originalOnComplete = quizSystem.onComplete;
            quizSystem.onComplete = (results) => {
                this.handleQuizCompletion(blockId, results, quizData);
                if (originalOnComplete) {
                    originalOnComplete.call(quizSystem, results);
                }
            };
            
            // Initialize the quiz
            quizSystem.container = document.getElementById(`quiz-${blockId}`);
            quizSystem.init();
            
            console.log(`✅ Quiz ${blockId} initialized successfully`);
            
        } catch (error) {
            console.error('Error starting quiz:', error);
            
            // Show error message
            const quizContainer = document.getElementById(`quiz-container-${blockId}`);
            if (quizContainer) {
                quizContainer.innerHTML = `
                    <div class="alert alert-error">
                        <h5>⚠️ Quiz Loading Error</h5>
                        <p>Unable to load the quiz. Please try again.</p>
                        <button onclick="contentRenderer.startQuiz('${blockId}')" class="btn btn-primary">
                            <i class="fas fa-refresh"></i> Retry
                        </button>
                    </div>
                `;
            }
        }
    }
    
    /**
     * Handle quiz completion and integrate with lesson progress
     */
    async handleQuizCompletion(blockId, results, quizData) {
        console.log(`🎯 Quiz ${blockId} completed:`, results);
        
        try {
            const blockElement = document.getElementById(`block-${blockId}`);
            const passed = results.percentage >= quizData.passing_score;
            
            // Update block visual status
            blockElement.dataset.status = passed ? 'completed' : 'failed';
            
            // Calculate rewards based on performance
            let xpEarned = 0;
            let coinsEarned = 0;
            
            if (passed) {
                // Base rewards for passing
                xpEarned = quizData.xp_reward || 25;
                coinsEarned = quizData.coins_reward || 5;
                
                // Bonus rewards for perfect score
                if (results.percentage === 100) {
                    xpEarned += Math.floor(xpEarned * 0.5); // 50% bonus XP
                    coinsEarned += Math.floor(coinsEarned * 0.5); // 50% bonus coins
                }
                
                // Speed bonus if completed quickly
                if (results.timeTaken && quizData.time_limit) {
                    const timePercentage = results.timeTaken / (quizData.time_limit * 1000);
                    if (timePercentage < 0.5) {
                        xpEarned += 10; // Speed bonus
                        coinsEarned += 2;
                    }
                }
            }
            
            // Update progress tracker
            const progressTracker = window.progressTracker;
            if (progressTracker && passed) {
                await progressTracker.markBlockComplete(blockId, {
                    type: 'quiz',
                    score: results.percentage,
                    timeTaken: results.timeTaken,
                    attempts: results.attempt,
                    xpEarned: xpEarned,
                    coinsEarned: coinsEarned
                });
            }
            
            // Show completion feedback
            this.showQuizCompletionFeedback(blockId, results, passed, xpEarned, coinsEarned);
            
            // Auto-advance to next block if quiz passed
            if (passed) {
                setTimeout(() => {
                    this.scrollToNextBlock(blockId);
                }, 3000); // Wait 3 seconds to show feedback
            }
            
        } catch (error) {
            console.error('Error handling quiz completion:', error);
        }
    }
    
    /**
     * Show quiz completion feedback with rewards
     */
    showQuizCompletionFeedback(blockId, results, passed, xpEarned, coinsEarned) {
        const blockElement = document.getElementById(`block-${blockId}`);
        const quizContainer = document.getElementById(`quiz-container-${blockId}`);
        
        const feedbackClass = passed ? 'success' : 'error';
        const icon = passed ? '🎉' : '😔';
        const message = passed ? 'Congratulations!' : 'Keep trying!';
        
        // Add completion feedback
        const feedbackElement = document.createElement('div');
        feedbackElement.className = `quiz-completion-feedback alert alert-${feedbackClass}`;
        feedbackElement.innerHTML = `
            <div class="feedback-header">
                <span class="feedback-icon">${icon}</span>
                <h4>${message}</h4>
            </div>
            
            <div class="quiz-results">
                <div class="result-stat">
                    <span class="stat-value">${results.percentage}%</span>
                    <span class="stat-label">Score</span>
                </div>
                <div class="result-stat">
                    <span class="stat-value">${results.correctAnswers}/${results.totalQuestions}</span>
                    <span class="stat-label">Correct</span>
                </div>
                ${results.timeTaken ? `
                <div class="result-stat">
                    <span class="stat-value">${Math.round(results.timeTaken / 1000)}s</span>
                    <span class="stat-label">Time</span>
                </div>
                ` : ''}
            </div>
            
            ${passed ? `
            <div class="rewards-earned">
                <h5>🎁 Rewards Earned:</h5>
                <div class="reward-items">
                    <span class="reward-item">
                        <i class="fas fa-star"></i> +${xpEarned} XP
                    </span>
                    <span class="reward-item">
                        <i class="fas fa-coins"></i> +${coinsEarned} PyCoins
                    </span>
                </div>
            </div>
            ` : `
            <div class="retry-options">
                <p>Need more practice? You can retake this quiz.</p>
                <button onclick="contentRenderer.retryQuiz('${blockId}')" class="btn btn-primary">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
            `}
        `;
        
        // Insert feedback after quiz container
        quizContainer.parentNode.insertBefore(feedbackElement, quizContainer.nextSibling);
    }
    
    /**
     * Retry quiz functionality
     */
    async retryQuiz(blockId) {
        console.log(`🔄 Retrying quiz ${blockId}`);
        
        // Remove existing feedback
        const feedbackElement = document.querySelector(`#block-${blockId} .quiz-completion-feedback`);
        if (feedbackElement) {
            feedbackElement.remove();
        }
        
        // Reset quiz container and restart
        const quizContainer = document.getElementById(`quiz-container-${blockId}`);
        quizContainer.innerHTML = '';
        
        // Clean up active quiz instance
        if (this.activeQuizzes && this.activeQuizzes.has(blockId)) {
            this.activeQuizzes.delete(blockId);
        }
        
        // Restart the quiz
        await this.startQuiz(blockId);
    }
    
    /**
     * Scroll to next block after quiz completion
     */
    scrollToNextBlock(blockId) {
        const currentBlock = document.getElementById(`block-${blockId}`);
        if (!currentBlock) return;
        
        const nextBlock = currentBlock.nextElementSibling;
        if (nextBlock && nextBlock.classList.contains('content-block')) {
            nextBlock.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // Highlight the next block briefly
            nextBlock.classList.add('highlight-next');
            setTimeout(() => {
                nextBlock.classList.remove('highlight-next');
            }, 2000);
        }
    }
}

// Create global instance
window.contentRenderer = new ContentBlockRenderer();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentBlockRenderer;
}
