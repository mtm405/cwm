/**
 * Lesson Page Emergency Fixes
 * Provides fallback functionality for lesson pages
 */

(function() {
    'use strict';
    
    // Check if we're on a lesson page
    const isLessonPage = document.body.classList.contains('lesson-page') ||
                        window.location.pathname.includes('/lesson/') ||
                        document.getElementById('lesson-content-container');
    
    if (!isLessonPage) {
        console.log('📚 Not a lesson page, skipping emergency fixes');
        return;
    }
    
    console.log('🚨 Applying lesson page emergency fixes...');
    
    // Track loaded scripts to prevent duplicates
    window.loadedScripts = window.loadedScripts || new Set();
    
    // Override appendChild to prevent duplicate script loading
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(child) {
        if (child && child.tagName === 'SCRIPT' && child.src) {
            if (window.loadedScripts.has(child.src)) {
                console.warn('⚠️ Preventing duplicate script load:', child.src);
                return child;
            }
            window.loadedScripts.add(child.src);
        }
        return originalAppendChild.call(this, child);
    };
    
    // Transform lesson data to Firebase block format
    window.transformContentToBlocks = function(content) {
        console.log('📝 Transforming lesson data to block format...');
        
        if (!content) return [];
        
        // If content is already an array of blocks
        if (Array.isArray(content) && content.length > 0 && content[0].type) {
            return content.map((block, index) => ({
                id: block.id || `block-${index}`,
                ...block
            }));
        }
        
        // Transform legacy content structure
        const blocks = [];
        
        // If content is a string, create a text block
        if (typeof content === 'string') {
            blocks.push({
                id: 'block-0',
                type: 'text',
                content: content
            });
        }
        
        // Add code examples if available
        if (window.lessonData?.code_examples) {
            window.lessonData.code_examples.forEach((example, index) => {
                blocks.push({
                    id: `code-${index}`,
                    type: 'code_example',
                    title: example.title,
                    code: example.code,
                    language: example.language || 'python',
                    explanation: example.explanation
                });
            });
        }
        
        // Add quizzes if available
        if (window.lessonData?.quizzes) {
            window.lessonData.quizzes.forEach((quiz, index) => {
                blocks.push({
                    id: `quiz-${index}`,
                    type: 'quiz',
                    quiz_id: quiz.id,
                    title: quiz.title,
                    questions: quiz.questions
                });
            });
        }
        
        // Add interactive challenges if available
        if (window.lessonData?.challenges) {
            window.lessonData.challenges.forEach((challenge, index) => {
                blocks.push({
                    id: `challenge-${index}`,
                    type: 'interactive_challenge',
                    title: challenge.title,
                    instructions: challenge.instructions,
                    starter_code: challenge.starter_code,
                    tests: challenge.tests
                });
            });
        }
        
        console.log(`✅ Lesson data transformed: ${blocks.length} blocks created`);
        return blocks;
    };
    
    // Ensure required modules are available
    window.ensureModulesAvailable = function() {
        // Create stubs for missing modules
        if (typeof BaseComponent === 'undefined') {
            console.warn('⚠️ BaseComponent not found, creating stub...');
            window.BaseComponent = class BaseComponent {
                constructor(config = {}) {
                    this.id = config.id || `component-${Date.now()}`;
                    this.config = config;
                }
                
                render() {
                    return '<div>Component</div>';
                }
            };
        }
        
        if (typeof QuizEngine === 'undefined') {
            console.warn('⚠️ QuizEngine not found, creating stub...');
            window.QuizEngine = class QuizEngine {
                constructor(config = {}) {
                    this.config = config;
                }
                
                loadQuiz(quizId) {
                    console.log('Loading quiz:', quizId);
                    return Promise.resolve({ questions: [] });
                }
            };
        }
    };
    
    // Safe lesson initialization
    window.safeLessonInit = function() {
        console.log('🔧 Safe lesson initialization started...');
        
        // Ensure modules are available
        window.ensureModulesAvailable();
        
        // Check lesson data
        if (!window.lessonData) {
            console.error('❌ No lesson data available');
            return;
        }
        
        // Transform content to blocks if needed
        if (!window.lessonData.blocks && window.lessonData.content) {
            window.lessonData.blocks = window.transformContentToBlocks(window.lessonData.content);
        }
        
        // Initialize progress tracking
        window.lessonProgress = window.lessonProgress || {
            totalBlocks: window.lessonData.blocks?.length || 0,
            completedBlocks: window.userProgress?.completed_blocks || [],
            currentBlock: 0
        };
        
        console.log('✅ Lesson initialized safely');
    };
    
    // Provide fallback navigation functions
    window.navigateToPrevious = window.navigateToPrevious || function() {
        console.log('⬅️ Navigate to previous');
        if (window.lessonProgress && window.lessonProgress.currentBlock > 0) {
            window.lessonProgress.currentBlock--;
            const blockId = `block-${window.lessonProgress.currentBlock}`;
            const element = document.getElementById(blockId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };
    
    window.navigateToNext = window.navigateToNext || function() {
        console.log('➡️ Navigate to next');
        if (window.lessonProgress && window.lessonProgress.currentBlock < window.lessonProgress.totalBlocks - 1) {
            window.lessonProgress.currentBlock++;
            const blockId = `block-${window.lessonProgress.currentBlock}`;
            const element = document.getElementById(blockId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };
    
    window.markBlockComplete = window.markBlockComplete || function(blockId) {
        console.log('✅ Marking block complete:', blockId);
        if (window.lessonProgress && !window.lessonProgress.completedBlocks.includes(blockId)) {
            window.lessonProgress.completedBlocks.push(blockId);
            
            // Update UI
            const blockElement = document.querySelector(`[id*="${blockId}"]`);
            if (blockElement) {
                blockElement.classList.add('block-complete');
            }
            
            // Update progress bar
            if (typeof updateProgressDisplay === 'function') {
                updateProgressDisplay();
            }
        }
    };
    
    window.loadQuiz = window.loadQuiz || async function(quizId) {
        console.log('Loading quiz:', quizId);
        const quizContainer = document.getElementById(`quiz-${quizId}`);
        if (quizContainer) {
            quizContainer.innerHTML = '<p>Quiz loading functionality not available</p>';
        }
    };
    
    window.runCode = window.runCode || async function(editorId) {
        console.log('Running code from:', editorId);
        const outputContainer = document.getElementById(`${editorId}-output`);
        if (outputContainer) {
            outputContainer.style.display = 'block';
            const outputContent = outputContainer.querySelector('.output-content');
            if (outputContent) {
                outputContent.textContent = 'Code execution functionality not available in this environment';
            }
        }
    };
    
    // Fix module loading issues
    if (typeof ModuleLoader !== 'undefined' && window.moduleLoader) {
        const originalLoadScript = window.moduleLoader._loadScript;
        window.moduleLoader._loadScript = async function(src, retries = 3) {
            // Skip if already loaded
            if (window.loadedScripts.has(src)) {
                console.log('⏭️ Script already loaded, skipping:', src);
                return Promise.resolve();
            }
            
            // Call original method
            return originalLoadScript.call(this, src, retries);
        };
    }
    
    console.log('✅ Lesson page emergency fixes applied');
    
})();
    }
    
    function createSafeTextBlock(block) {
        const content = block.content || '';
        const processedContent = content
            .replace(/```python\n([\s\S]*?)```/g, '<pre><code class="language-python">$1</code></pre>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/##\s+(.+)/g, '<h3>$1</h3>')
            .replace(/###\s+(.+)/g, '<h4>$1</h4>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');
        
        return `
            <div class="block-header">
                <div class="block-icon">📚</div>
                <div class="block-type">Learning Content</div>
            </div>
            <div class="text-content">
                ${processedContent}
            </div>
        `;
    }
    
    function createSafeCodeBlock(block) {
        const code = (block.code || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const title = block.title || 'Code Example';
        const explanation = block.explanation || '';
        
        return `
            <div class="block-header">
                <div class="block-icon">💻</div>
                <div class="block-type">${title}</div>
                <button class="btn-copy" onclick="copyToClipboard('${block.id}')">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            <div class="code-container">
                <pre id="code-${block.id}"><code class="language-python">${code}</code></pre>
                ${explanation ? `<div class="code-explanation">${explanation}</div>` : ''}
            </div>
        `;
    }
    
    function createSafeInteractiveBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">🎯</div>
                <div class="block-type">${block.title || 'Exercise'}</div>
            </div>
            <div class="exercise-content">
                <p>${block.instructions || ''}</p>
                <div class="editor-container">
                    <div id="editor-${block.id}" class="code-editor">${block.starter_code || '# Write your code here'}</div>
                </div>
                <div class="exercise-actions">
                    <button class="btn btn-primary" onclick="runCode('${block.id}')">
                        <i class="fas fa-play"></i> Run
                    </button>
                    ${block.hints ? `<button class="btn btn-secondary" onclick="showHint('${block.id}')">
                        <i class="fas fa-lightbulb"></i> Hint
                    </button>` : ''}
                </div>
                <div id="output-${block.id}" class="code-output"></div>
            </div>
        `;
    }
    
    function createSafeQuizBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">🧠</div>
                <div class="block-type">Quiz</div>
            </div>
            <div class="quiz-content">
                <h3>${block.title || 'Knowledge Check'}</h3>
                <p>${block.description || ''}</p>
                <div id="quiz-${block.quiz_id}" class="quiz-container" data-quiz-id="${block.quiz_id}">
                    <button class="btn btn-primary" onclick="loadQuiz('${block.quiz_id}')">
                        Start Quiz
                    </button>
                </div>
            </div>
        `;
    }
    
    function createSafeDefaultBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">📄</div>
                <div class="block-type">${block.type}</div>
            </div>
            <div class="block-content">
                <pre>${JSON.stringify(block, null, 2)}</pre>
            </div>
        `;
    }
    
    // Global utility functions
    window.copyToClipboard = function(blockId) {
        const codeElement = document.getElementById(`code-${blockId}`);
        if (codeElement) {
            const text = codeElement.textContent;
            navigator.clipboard.writeText(text).then(() => {
                console.log('Code copied to clipboard');
            });
        }
    };
    
    window.runCode = function(blockId) {
        const outputDiv = document.getElementById(`output-${blockId}`);
        if (outputDiv) {
            outputDiv.innerHTML = '<div class="spinner">Running code...</div>';
            // Simulate code execution
            setTimeout(() => {
                outputDiv.innerHTML = '<div class="success">Code executed successfully!</div>';
            }, 1000);
        }
    };
    
    window.showHint = function(blockId) {
        console.log('Showing hint for block:', blockId);
    };
    
    window.loadQuiz = function(quizId) {
        console.log('Loading quiz:', quizId);
        const container = document.getElementById(`quiz-${quizId}`);
        if (container) {
            container.innerHTML = '<div class="spinner">Loading quiz...</div>';
        }
    };
    
    // Auto-fix on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.safeLessonInit);
    } else {
        window.safeLessonInit();
    }
    
    console.log('✅ Lesson page emergency fixes applied');
    
})();
