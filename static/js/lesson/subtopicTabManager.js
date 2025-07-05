/**
 * Subtopic Tab Navigation System
 * Handles tab switching, progress tracking, and content loading
 * Part of the enhanced lesson system
 */

class SubtopicTabManager {
    constructor() {
        this.currentSubtopicIndex = 0;
        this.subtopics = [];
        this.lessonId = null;
        this.completedSubtopics = [];
        this.init();
    }

    init() {
        console.log('🔄 Initializing Subtopic Tab Manager...');
        
        // Debug: Check if we're in the right context
        console.log('🌍 Current URL:', window.location.href);
        console.log('📄 Document ready state:', document.readyState);
        
        // Get lesson data from global variables
        if (window.lessonData) {
            this.lessonId = window.lessonData.id;
            this.subtopics = window.lessonData.subtopics || [];
            this.currentSubtopicIndex = window.lessonData.current_subtopic_index || 0;
            
            // If subtopics is an array of strings, convert to objects
            if (this.subtopics.length > 0 && typeof this.subtopics[0] === 'string') {
                this.subtopics = this.subtopics.map((title, index) => ({
                    id: `subtopic-${index}`,
                    title: title,
                    order: index,
                    blocks: []
                }));
            }
            
            console.log('📚 Lesson Data:', {
                lessonId: this.lessonId,
                subtopicsCount: this.subtopics.length,
                currentIndex: this.currentSubtopicIndex,
                hasSubtopics: window.lessonData.has_subtopics,
                subtopicsType: typeof this.subtopics[0]
            });
        } else {
            console.warn('⚠️ No lesson data found on window object');
        }

        // Get progress data
        if (window.lessonProgress) {
            this.completedSubtopics = window.lessonProgress.completed_subtopics || [];
            console.log('📈 Progress Data:', this.completedSubtopics);
        } else {
            console.warn('⚠️ No lesson progress data found');
        }

        // Check if subtopic tabs container exists
        const container = document.querySelector('.subtopic-tabs-container');
        if (container) {
            console.log('✅ Subtopic tabs container found:', container);
            console.log('📊 Container styles:', window.getComputedStyle(container));
        } else {
            console.error('❌ Subtopic tabs container NOT found in DOM');
            console.log('🔍 Available elements:', document.querySelectorAll('[class*="subtopic"]'));
        }

        this.setupEventListeners();
        this.updateTabStates();
        
        console.log('✅ Subtopic Tab Manager initialized');
    }

    setupEventListeners() {
        console.log('🔗 Setting up subtopic tab event listeners...');
        
        // Tab click events
        const tabs = document.querySelectorAll('.subtopic-tab');
        console.log(`📋 Found ${tabs.length} subtopic tabs`);
        
        if (tabs.length === 0) {
            console.warn('⚠️ No subtopic tabs found! Checking for container...');
            const container = document.querySelector('.subtopic-tabs-container');
            if (container) {
                console.log('✅ Container exists:', container);
            } else {
                console.error('❌ No subtopic tabs container found!');
            }
        }
        
        tabs.forEach((tab, index) => {
            console.log(`🏷️ Setting up tab ${index}:`, tab);
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const subtopicId = tab.dataset.subtopicId;
                const subtopicIndex = parseInt(tab.dataset.subtopicIndex);
                console.log(`🖱️ Tab clicked: ${subtopicId} (index: ${subtopicIndex})`);
                this.switchToSubtopic(subtopicId, subtopicIndex);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousSubtopic();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextSubtopic();
                        break;
                }
            }
        });
    }

    switchToSubtopic(subtopicId, subtopicIndex) {
        console.log(`🔄 Switching to subtopic: ${subtopicId} (index: ${subtopicIndex})`);
        
        // Update URL without page reload
        const newUrl = `/lesson/${this.lessonId}/${subtopicId}`;
        window.history.pushState({ subtopicId, subtopicIndex }, '', newUrl);
        
        // Update current index
        this.currentSubtopicIndex = subtopicIndex;
        
        // Update tab states
        this.updateTabStates();
        
        // Load subtopic content
        this.loadSubtopicContent(subtopicId, subtopicIndex);
        
        // Track analytics
        this.trackSubtopicView(subtopicId);
    }

    updateTabStates() {
        document.querySelectorAll('.subtopic-tab').forEach((tab, index) => {
            const isActive = index === this.currentSubtopicIndex;
            const subtopicId = tab.dataset.subtopicId;
            const isCompleted = this.completedSubtopics.includes(subtopicId);
            
            // Update active state
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive.toString());
            
            // Update completed state
            const checkIcon = tab.querySelector('.subtopic-check');
            if (checkIcon) {
                checkIcon.classList.toggle('completed', isCompleted);
            }
        });
    }
    
    loadSubtopicContent(subtopicId, subtopicIndex) {
        console.log(`📖 Loading content for subtopic: ${subtopicId}`);
        
        // Show loading state
        const container = document.getElementById('lesson-content-container');
        if (container) {
            container.innerHTML = `
                <div class="content-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading ${this.subtopics[subtopicIndex]?.title || 'content'}...</p>
                </div>
            `;
        }

        // Get subtopic data
        const subtopic = this.subtopics[subtopicIndex];
        if (!subtopic) {
            console.error(`Subtopic not found at index ${subtopicIndex}`);
            return;
        }

        // Render subtopic content
        setTimeout(() => {
            this.renderSubtopicContent(subtopic, container);
        }, 300); // Small delay for smooth transition
    }

    renderSubtopicContent(subtopic, container) {
        if (!subtopic || !container) return;

        console.log(`🎨 Rendering subtopic: ${subtopic.title}`);
        
        const blocks = subtopic.blocks || [];
        
        const contentHTML = `
            <div class="subtopic-content-wrapper" data-subtopic-id="${subtopic.id}">
                <div class="subtopic-header">
                    <h2 class="subtopic-title">${subtopic.title}</h2>
                    <div class="subtopic-meta">
                        <span class="subtopic-order">Part ${subtopic.order + 1}</span>
                        <span class="subtopic-progress">${this.completedSubtopics.includes(subtopic.id) ? '✅ Completed' : '📖 In Progress'}</span>
                    </div>
                </div>
                
                <div class="subtopic-blocks">
                    ${blocks.map((block, index) => this.renderBlock(block, index)).join('')}
                </div>
                
                <div class="subtopic-navigation">
                    <button class="btn btn-outline" onclick="window.subtopicManager.previousSubtopic()" ${this.currentSubtopicIndex === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-left"></i> Previous
                    </button>
                    
                    <button class="btn btn-success" onclick="window.subtopicManager.completeSubtopic('${subtopic.id}')">
                        <i class="fas fa-check"></i> Complete & Continue
                    </button>
                    
                    <button class="btn btn-primary" onclick="window.subtopicManager.nextSubtopic()" ${this.currentSubtopicIndex === this.subtopics.length - 1 ? 'disabled' : ''}>
                        Next <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = contentHTML;
        
        // Initialize any interactive elements
        this.initializeBlockInteractions();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderBlock(block, index) {
        const blockTypes = {
            'text': this.renderTextBlock,
            'code_example': this.renderCodeBlock,
            'interactive': this.renderInteractiveBlock,
            'quiz': this.renderQuizBlock
        };

        const renderer = blockTypes[block.type] || this.renderTextBlock;
        return renderer.call(this, block, index);
    }

    renderTextBlock(block, index) {
        return `
            <div class="content-block text-block" data-block-id="${block.id}" data-block-index="${index}">
                <div class="block-content">
                    <h3 class="block-title">${block.title || ''}</h3>
                    <div class="block-text">${this.parseMarkdown(block.content || '')}</div>
                </div>
            </div>
        `;
    }

    renderCodeBlock(block, index) {
        return `
            <div class="content-block code-block" data-block-id="${block.id}" data-block-index="${index}">
                <div class="block-content">
                    <h3 class="block-title">${block.title || 'Code Example'}</h3>
                    <div class="code-container">
                        <pre><code class="language-python">${this.escapeHtml(block.code || '')}</code></pre>
                        <button class="btn btn-sm copy-btn" onclick="window.subtopicManager.copyCode(this)">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    ${block.explanation ? `<div class="block-explanation">${block.explanation}</div>` : ''}
                </div>
            </div>
        `;
    }

    renderInteractiveBlock(block, index) {
        return `
            <div class="content-block interactive-block" data-block-id="${block.id}" data-block-index="${index}">
                <div class="block-content">
                    <h3 class="block-title">${block.title || 'Interactive Exercise'}</h3>
                    <div class="exercise-instructions">${block.instructions || ''}</div>
                    <div class="code-editor">
                        <textarea class="code-input" placeholder="Write your code here...">${block.starter_code || ''}</textarea>
                        <button class="btn btn-primary run-btn" onclick="window.subtopicManager.runCode(this)">
                            <i class="fas fa-play"></i> Run Code
                        </button>
                    </div>
                    <div class="code-output" style="display: none;">
                        <h4>Output:</h4>
                        <pre class="output-content"></pre>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuizBlock(block, index) {
        return `
            <div class="content-block quiz-block" data-block-id="${block.id}" data-block-index="${index}">
                <div class="block-content">
                    <h3 class="block-title">${block.title || 'Knowledge Check'}</h3>
                    <div class="quiz-container">
                        <div class="quiz-questions">
                            ${block.questions ? block.questions.map((q, i) => this.renderQuizQuestion(q, i)).join('') : ''}
                        </div>
                        <button class="btn btn-primary submit-quiz-btn" onclick="window.subtopicManager.submitQuiz(this)">
                            <i class="fas fa-check"></i> Submit Quiz
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    renderQuizQuestion(question, index) {
        const questionTypes = {
            'multiple_choice': this.renderMultipleChoice,
            'true_false': this.renderTrueFalse,
            'fill_blank': this.renderFillBlank
        };

        const renderer = questionTypes[question.type] || this.renderMultipleChoice;
        return renderer.call(this, question, index);
    }

    renderMultipleChoice(question, index) {
        return `
            <div class="quiz-question" data-question-id="${question.id}" data-question-index="${index}">
                <h4 class="question-text">${question.question}</h4>
                <div class="question-options">
                    ${question.options ? question.options.map((option, i) => `
                        <label class="option-label">
                            <input type="radio" name="question-${index}" value="${i}">
                            <span class="option-text">${option}</span>
                        </label>
                    `).join('') : ''}
                </div>
            </div>
        `;
    }

    renderTrueFalse(question, index) {
        return `
            <div class="quiz-question" data-question-id="${question.id}" data-question-index="${index}">
                <h4 class="question-text">${question.question}</h4>
                <div class="question-options">
                    <label class="option-label">
                        <input type="radio" name="question-${index}" value="true">
                        <span class="option-text">True</span>
                    </label>
                    <label class="option-label">
                        <input type="radio" name="question-${index}" value="false">
                        <span class="option-text">False</span>
                    </label>
                </div>
            </div>
        `;
    }

    nextSubtopic() {
        if (this.currentSubtopicIndex < this.subtopics.length - 1) {
            const nextIndex = this.currentSubtopicIndex + 1;
            const nextSubtopic = this.subtopics[nextIndex];
            this.switchToSubtopic(nextSubtopic.id, nextIndex);
        }
    }

    previousSubtopic() {
        if (this.currentSubtopicIndex > 0) {
            const prevIndex = this.currentSubtopicIndex - 1;
            const prevSubtopic = this.subtopics[prevIndex];
            this.switchToSubtopic(prevSubtopic.id, prevIndex);
        }
    }

    async completeSubtopic(subtopicId) {
        console.log(`✅ Completing subtopic: ${subtopicId}`);
        
        try {
            const response = await fetch('/api/lesson/complete-subtopic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    lesson_id: this.lessonId,
                    subtopic_id: subtopicId
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Update local state
                if (!this.completedSubtopics.includes(subtopicId)) {
                    this.completedSubtopics.push(subtopicId);
                }
                
                // Update UI
                this.updateTabStates();
                this.updateProgressIndicator();
                
                // Show success message
                this.showSuccessMessage(result.xp_earned);
                
                // Auto-advance to next subtopic
                setTimeout(() => {
                    this.nextSubtopic();
                }, 1500);
            } else {
                console.error('Failed to complete subtopic:', result.message);
            }
        } catch (error) {
            console.error('Error completing subtopic:', error);
        }
    }

    updateProgressIndicator() {
        const progressFill = document.querySelector('.tab-progress-fill');
        if (progressFill) {
            const completedCount = this.completedSubtopics.length;
            const totalCount = this.subtopics.length;
            const percentage = (completedCount / totalCount) * 100;
            
            progressFill.style.width = `${percentage}%`;
        }
    }

    showSuccessMessage(xpEarned) {
        const message = document.createElement('div');
        message.className = 'success-toast';
        message.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-check-circle"></i>
                <span>Subtopic completed! +${xpEarned} XP</span>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Utility methods
    parseMarkdown(text) {
        return text
            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    copyCode(button) {
        const codeBlock = button.parentElement.querySelector('code');
        if (codeBlock) {
            navigator.clipboard.writeText(codeBlock.textContent);
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        }
    }

    runCode(button) {
        const codeInput = button.parentElement.querySelector('.code-input');
        const outputDiv = button.parentElement.nextElementSibling;
        const outputContent = outputDiv.querySelector('.output-content');
        
        if (codeInput && outputContent) {
            const code = codeInput.value;
            
            // Simple code execution simulation
            try {
                outputContent.textContent = `Running: ${code}\n\n> Code execution simulated\n> In a real environment, this would execute Python code`;
                outputDiv.style.display = 'block';
            } catch (error) {
                outputContent.textContent = `Error: ${error.message}`;
                outputDiv.style.display = 'block';
            }
        }
    }

    initializeBlockInteractions() {
        // Initialize any interactive elements that were just added
        console.log('🎯 Initializing block interactions...');
        
        // Add syntax highlighting if Prism is available
        if (window.Prism) {
            window.Prism.highlightAll();
        }
    }

    trackSubtopicView(subtopicId) {
        // Track analytics
        if (window.gtag) {
            window.gtag('event', 'subtopic_view', {
                lesson_id: this.lessonId,
                subtopic_id: subtopicId
            });
        }
    }

    // Diagnostic function to check CSS styling
    diagnoseTabStyling() {
        console.log('🔍 Diagnosing subtopic tab styling...');
        
        const tabs = document.querySelectorAll('.subtopic-tab');
        const container = document.querySelector('.subtopic-tabs-container');
        
        console.log('📊 Styling Diagnostics:');
        console.log('- Tab count:', tabs.length);
        console.log('- Container exists:', !!container);
        
        if (container) {
            const containerStyles = window.getComputedStyle(container);
            console.log('- Container display:', containerStyles.display);
            console.log('- Container visibility:', containerStyles.visibility);
            console.log('- Container opacity:', containerStyles.opacity);
        }
        
        tabs.forEach((tab, index) => {
            const styles = window.getComputedStyle(tab);
            console.log(`- Tab ${index}:`, {
                display: styles.display,
                visibility: styles.visibility,
                opacity: styles.opacity,
                backgroundColor: styles.backgroundColor,
                borderColor: styles.borderColor,
                color: styles.color,
                fontSize: styles.fontSize,
                fontWeight: styles.fontWeight,
                padding: styles.padding,
                border: styles.border,
                borderRadius: styles.borderRadius,
                transform: styles.transform,
                boxShadow: styles.boxShadow
            });
        });
        
        // Check if CSS variables are available
        const root = document.documentElement;
        const computedStyle = window.getComputedStyle(root);
        console.log('🎨 CSS Variables:');
        console.log('- --primary-color:', computedStyle.getPropertyValue('--primary-color'));
        console.log('- --bg-secondary:', computedStyle.getPropertyValue('--bg-secondary'));
        console.log('- --text-secondary:', computedStyle.getPropertyValue('--text-secondary'));
        console.log('- --border-color:', computedStyle.getPropertyValue('--border-color'));
        
        return {
            tabCount: tabs.length,
            containerExists: !!container,
            cssVariables: {
                primaryColor: computedStyle.getPropertyValue('--primary-color'),
                bgSecondary: computedStyle.getPropertyValue('--bg-secondary'),
                textSecondary: computedStyle.getPropertyValue('--text-secondary'),
                borderColor: computedStyle.getPropertyValue('--border-color')
            }
        };
    }
}

// ES6 async initialization helper
const initializeSubtopicTabsAsync = async () => {
    console.log('🔄 Async initialization starting...');
    
    // Wait for potential async data to load
    const waitForData = (timeout = 5000) => {
        return new Promise((resolve) => {
            const checkData = () => {
                if (window.lessonData || document.querySelector('.subtopic-tabs-container')) {
                    resolve(true);
                } else if (timeout <= 0) {
                    resolve(false);
                } else {
                    setTimeout(checkData, 100);
                    timeout -= 100;
                }
            };
            checkData();
        });
    };
    
    const dataReady = await waitForData();
    
    if (dataReady) {
        console.log('✅ Data ready for subtopic tabs initialization');
        
        const shouldInitialize = (
            window.lessonData && 
            (
                window.lessonData.has_subtopics || 
                (window.lessonData.subtopics && window.lessonData.subtopics.length > 1) ||
                document.querySelector('.subtopic-tabs-container') ||
                document.querySelectorAll('.subtopic-tab').length > 0
            )
        );
        
        if (shouldInitialize && !window.subtopicManager) {
            try {
                window.subtopicManager = new SubtopicTabManager();
                console.log('✅ Async subtopic tab manager initialized');
            } catch (error) {
                console.error('❌ Async initialization error:', error);
            }
        }
    } else {
        console.log('⚠️ Async initialization timeout - no data found');
    }
};

// Global functions for template usage - ES6 compatible
window.switchSubtopic = (subtopicId, subtopicIndex) => {
    if (window.subtopicManager) {
        window.subtopicManager.switchToSubtopic(subtopicId, subtopicIndex);
    }
};

// Initialize when DOM is loaded - ES6 compatible with enhanced error handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 DOM loaded, checking for subtopic tabs...');
    
    // Wait for potential async data loading
    const initializeSubtopicTabs = () => {
        const debugInfo = {
            lessonData: !!window.lessonData,
            hasSubtopics: window.lessonData?.has_subtopics,
            subtopicsArray: window.lessonData?.subtopics,
            subtopicsLength: window.lessonData?.subtopics?.length,
            container: !!document.querySelector('.subtopic-tabs-container'),
            tabElements: document.querySelectorAll('.subtopic-tab').length
        };
        
        console.log('📊 Available data:', debugInfo);
        
        // Enhanced condition checking with fallback options
        const shouldInitialize = (
            window.lessonData && 
            (
                window.lessonData.has_subtopics || 
                (window.lessonData.subtopics && window.lessonData.subtopics.length > 1) ||
                document.querySelector('.subtopic-tabs-container') ||
                document.querySelectorAll('.subtopic-tab').length > 0
            )
        );
        
        if (shouldInitialize) {
            console.log('✅ Initializing subtopic tab system...');
            try {
                window.subtopicManager = new SubtopicTabManager();
                console.log('✅ Subtopic tab manager successfully created');
            } catch (error) {
                console.error('❌ Error creating subtopic tab manager:', error);
                console.error('Stack trace:', error.stack);
            }
        } else {
            console.log('⚠️ Subtopic tab system not initialized:', {
                noLessonData: !window.lessonData,
                noHasSubtopics: !window.lessonData?.has_subtopics,
                noSubtopicsArray: !window.lessonData?.subtopics || window.lessonData.subtopics.length <= 1,
                noContainer: !document.querySelector('.subtopic-tabs-container'),
                noTabElements: document.querySelectorAll('.subtopic-tab').length === 0
            });
        }
    };
    
    // Try immediate initialization
    initializeSubtopicTabs();
    
    // Also try after a short delay in case data is still loading
    setTimeout(() => {
        if (!window.subtopicManager) {
            console.log('🔄 Retrying subtopic tab initialization...');
            initializeSubtopicTabs();
        }
    }, 100);
    
    // Try async initialization as a fallback
    setTimeout(() => {
        if (!window.subtopicManager) {
            console.log('🔄 Trying async initialization...');
            initializeSubtopicTabsAsync();
        }
    }, 500);
});

// Handle browser back/forward buttons - ES6 compatible
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.subtopicId && window.subtopicManager) {
        window.subtopicManager.switchToSubtopic(event.state.subtopicId, event.state.subtopicIndex);
    }
});

// Debugging helper functions - ES6 compatible
window.debugSubtopicTabs = () => {
    console.log('🔍 Subtopic Tabs Debug Information');
    console.log('==================================');
    
    const debugData = {
        managerInstance: !!window.subtopicManager,
        lessonData: window.lessonData,
        hasSubtopicsFlag: window.lessonData?.has_subtopics,
        subtopicsArray: window.lessonData?.subtopics,
        containerElement: document.querySelector('.subtopic-tabs-container'),
        tabElements: document.querySelectorAll('.subtopic-tab'),
        tabCount: document.querySelectorAll('.subtopic-tab').length
    };
    
    Object.entries(debugData).forEach(([key, value], index) => {
        console.log(`${index + 1}. ${key}:`, value);
    });
    
    // Check CSS visibility
    const container = document.querySelector('.subtopic-tabs-container');
    if (container) {
        const styles = window.getComputedStyle(container);
        console.log('8. Container styles:', {
            display: styles.display,
            visibility: styles.visibility,
            opacity: styles.opacity,
            border: styles.border,
            height: styles.height,
            width: styles.width
        });
    }
    
    // If manager exists, show manager state
    if (window.subtopicManager) {
        console.log('9. Manager state:', {
            lessonId: window.subtopicManager.lessonId,
            subtopics: window.subtopicManager.subtopics,
            currentIndex: window.subtopicManager.currentSubtopicIndex,
            completedSubtopics: window.subtopicManager.completedSubtopics
        });
        
        // Run styling diagnostics
        console.log('10. Running styling diagnostics...');
        window.subtopicManager.diagnoseTabStyling();
    }
    
    console.log('==================================');
    return debugData;
};

window.forceInitializeSubtopicTabs = () => {
    console.log('🔧 Force initializing subtopic tabs...');
    
    if (window.subtopicManager) {
        console.log('⚠️ Manager already exists, destroying first...');
        delete window.subtopicManager;
    }
    
    // Force create subtopic data if it doesn't exist
    if (!window.lessonData) {
        console.log('📝 Creating mock lesson data...');
        window.lessonData = {
            id: 'test-lesson',
            title: 'Test Lesson',
            subtopics: [
                { id: 'subtopic-0', title: 'Introduction', order: 0 },
                { id: 'subtopic-1', title: 'Practice', order: 1 },
                { id: 'subtopic-2', title: 'Assessment', order: 2 }
            ],
            has_subtopics: true,
            current_subtopic_index: 0
        };
    } else if (!window.lessonData.has_subtopics) {
        console.log('🔧 Setting has_subtopics flag...');
        window.lessonData.has_subtopics = true;
    }
    
    // Initialize manager
    try {
        window.subtopicManager = new SubtopicTabManager();
        console.log('✅ Subtopic tab manager force initialized');
        return window.subtopicManager;
    } catch (error) {
        console.error('❌ Error force initializing subtopic tab manager:', error);
        console.error('Stack trace:', error.stack);
        return null;
    }
};
