/**
 * Lesson Renderer Component
 * Handles rendering of lesson content and different block types
 */

export class LessonRenderer {
    constructor() {
        this.container = document.getElementById('lesson-content-container');
        this.loadingEl = document.getElementById('content-loading');
        this.contentEl = document.getElementById('lesson-content');
        this.fallbackEl = document.getElementById('lesson-fallback');
        
        // Block renderers
        this.blockRenderers = {
            text: this.renderTextBlock.bind(this),
            code_example: this.renderCodeBlock.bind(this),
            interactive: this.renderInteractiveBlock.bind(this),
            quiz: this.renderQuizBlock.bind(this),
            default: this.renderDefaultBlock.bind(this)
        };
    }
    
    showLoading() {
        if (this.loadingEl) this.loadingEl.style.display = 'flex';
        if (this.contentEl) this.contentEl.style.display = 'none';
        if (this.fallbackEl) this.fallbackEl.style.display = 'none';
    }
    
    hideLoading() {
        if (this.loadingEl) this.loadingEl.style.display = 'none';
        if (this.contentEl) this.contentEl.style.display = 'block';
    }
    
    showError(message) {
        this.hideLoading();
        if (this.fallbackEl) {
            this.fallbackEl.style.display = 'block';
            const errorMsg = this.fallbackEl.querySelector('.error-content p');
            if (errorMsg) {
                errorMsg.textContent = message;
            }
        }
    }
    
    async renderLesson(lessonData, userProgress) {
        if (!this.container) {
            throw new Error('Lesson container not found');
        }
        
        if (!lessonData || !lessonData.blocks) {
            throw new Error('Invalid lesson data');
        }
        
        console.log(`🎨 Rendering lesson: ${lessonData.title}`);
        
        // Clear container
        this.container.innerHTML = '';
        
        // Sort blocks by order
        const sortedBlocks = [...lessonData.blocks].sort((a, b) => a.order - b.order);
        
        // Render each block
        for (const block of sortedBlocks) {
            try {
                const blockElement = await this.createBlockElement(block, userProgress);
                if (blockElement) {
                    this.container.appendChild(blockElement);
                }
            } catch (error) {
                console.error(`❌ Error rendering block ${block.id}:`, error);
                
                // Render error block instead
                const errorBlock = this.renderErrorBlock(block, error);
                this.container.appendChild(errorBlock);
            }
        }
        
        console.log(`✅ Rendered ${sortedBlocks.length} lesson blocks`);
    }
    
    async createBlockElement(block, userProgress) {
        const article = document.createElement('article');
        article.className = `lesson-block ${block.type}-block`;
        article.id = `block-${block.id}`;
        article.dataset.blockId = block.id;
        article.dataset.blockType = block.type;
        
        // Check if completed
        const isCompleted = userProgress?.completed_blocks?.includes(block.id);
        if (isCompleted) {
            article.classList.add('completed');
            article.setAttribute('data-completion-status', 'completed');
        } else {
            article.setAttribute('data-completion-status', 'incomplete');
        }
        
        // Add assessment requirement attribute
        article.setAttribute('data-assessment-required', block.assessment_required || 'false');
        
        // Render based on type
        const renderer = this.blockRenderers[block.type] || this.blockRenderers.default;
        article.innerHTML = renderer(block);
        
        return article;
    }
    
    renderTextBlock(block) {
        return `
            <div class="lesson-block-header">
                <div class="block-type-indicator">
                    <div class="block-icon text-block-icon">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <span class="block-type-label">Reading</span>
                </div>
                <div class="block-progress-container">
                    <div class="progress-indicator" id="progress-${block.id}">
                        <div class="progress-status incomplete">
                            <i class="fas fa-circle-o"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="lesson-block-content">
                <div class="text-content">${this.processContent(block.content || '')}</div>
            </div>
            <div class="lesson-block-actions">
                <button class="action-btn primary complete-btn" data-block-id="${block.id}">
                    <i class="fas fa-check"></i>
                    <span>Mark as Read</span>
                </button>
            </div>
        `;
    }
    
    renderCodeBlock(block) {
        return `
            <div class="lesson-block-header">
                <div class="block-type-indicator">
                    <div class="block-icon code-block-icon">
                        <i class="fas fa-code"></i>
                    </div>
                    <span class="block-type-label">Code Example</span>
                </div>
                <div class="code-meta">
                    <span class="language-badge ${(block.language || 'python').toLowerCase()}">${(block.language || 'python').toUpperCase()}</span>
                    <button class="action-btn secondary copy-btn" data-block-id="${block.id}" title="Copy code">
                        <i class="fas fa-copy"></i>
                        <span>Copy</span>
                    </button>
                </div>
            </div>
            <div class="lesson-block-content">
                <div class="code-container">
                    <div class="code-block-wrapper">
                        <pre class="code-content"><code class="language-${block.language || 'python'}">${this.escapeHtml(block.code || '')}</code></pre>
                    </div>
                </div>
                ${block.explanation ? `
                <div class="code-explanation">
                    <div class="explanation-header">
                        <i class="fas fa-lightbulb"></i>
                        <span>Explanation</span>
                    </div>
                    <div class="explanation-content">
                        <p>${block.explanation}</p>
                    </div>
                </div>
                ` : ''}
            </div>
            <div class="lesson-block-actions">
                <button class="action-btn primary complete-btn" data-block-id="${block.id}">
                    <i class="fas fa-check"></i>
                    <span>Mark as Understood</span>
                </button>
            </div>
        `;
    }
    
    renderInteractiveBlock(block) {
        return `
            <div class="lesson-block-header">
                <div class="block-type-indicator">
                    <div class="block-icon interactive-block-icon">
                        <i class="fas fa-laptop-code"></i>
                    </div>
                    <span class="block-type-label">Code Challenge</span>
                </div>
                <div class="challenge-meta">
                    <span class="language-badge ${(block.language || 'python').toLowerCase()}">${(block.language || 'python').toUpperCase()}</span>
                    <span class="difficulty-badge ${(block.difficulty || 'beginner').toLowerCase()}">${block.difficulty || 'Beginner'}</span>
                </div>
            </div>
            <div class="lesson-block-content">
                <div class="challenge-content">
                    <div class="challenge-instructions">
                        <div class="instructions-header">
                            <i class="fas fa-bullseye"></i>
                            <span>Your Challenge</span>
                        </div>
                        <div class="instructions-content">
                            <p>${block.instructions || 'Complete the code below.'}</p>
                        </div>
                    </div>
                    <div class="code-editor-container">
                        <div class="editor-toolbar">
                            <span class="editor-label">
                                <i class="fas fa-code"></i>
                                Code Editor
                            </span>
                            <div class="editor-actions">
                                <button class="action-btn secondary reset-btn" data-block-id="${block.id}" title="Reset code">
                                    <i class="fas fa-undo"></i>
                                    <span>Reset</span>
                                </button>
                                <button class="action-btn primary run-btn" data-block-id="${block.id}" title="Run code">
                                    <i class="fas fa-play"></i>
                                    <span>Run Code</span>
                                </button>
                            </div>
                        </div>
                        <div class="code-editor-wrapper">
                            <div id="editor-${block.id}" class="code-editor" data-language="${block.language || 'python'}">${this.escapeHtml(block.starter_code || '# Write your code here')}</div>
                        </div>
                    </div>
                    <div class="output-section" id="output-${block.id}" style="display: none;">
                        <div class="output-header">
                            <i class="fas fa-terminal"></i>
                            <span>Output</span>
                        </div>
                        <div class="output-content"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderQuizBlock(block) {
        return `
            <div class="lesson-block-header">
                <div class="block-type-indicator">
                    <div class="block-icon quiz-block-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <span class="block-type-label">Knowledge Check</span>
                </div>
                <div class="quiz-meta">
                    <span class="quiz-type-badge">Assessment</span>
                    <div class="progress-indicator" id="quiz-progress-${block.id}">
                        <div class="progress-status incomplete">
                            <i class="fas fa-circle-o"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="lesson-block-content">
                <div class="quiz-content">
                    <div class="quiz-intro">
                        <div class="quiz-intro-header">
                            <i class="fas fa-question-circle"></i>
                            <span>Test Your Understanding</span>
                        </div>
                        <div class="quiz-intro-content">
                            <p>${block.description || 'Test your knowledge with this quiz.'}</p>
                        </div>
                    </div>
                    <div class="quiz-container">
                        <div id="quiz-${block.quiz_id}" data-quiz-id="${block.quiz_id}" data-block-id="${block.id}">
                            <div class="quiz-loading">
                                <div class="loading-spinner"></div>
                                <span>Loading quiz questions...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderDefaultBlock(block) {
        return `
            <div class="block-content">
                <div class="unknown-block">
                    <div class="unknown-icon">
                        <i class="fas fa-question-circle"></i>
                    </div>
                    <h4>Unknown Block Type</h4>
                    <p>Block type "${block.type}" is not supported.</p>
                    <details>
                        <summary>Block Data</summary>
                        <pre>${JSON.stringify(block, null, 2)}</pre>
                    </details>
                </div>
            </div>
        `;
    }
    
    renderErrorBlock(block, error) {
        const article = document.createElement('article');
        article.className = 'content-block error-block';
        article.id = `block-${block.id}`;
        article.dataset.blockId = block.id;
        article.dataset.blockType = 'error';
        
        article.innerHTML = `
            <div class="block-content">
                <div class="error-block-content">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h4>Error Rendering Block</h4>
                    <p>Failed to render block "${block.id}": ${error.message}</p>
                    <details>
                        <summary>Error Details</summary>
                        <pre>${error.stack || error.message}</pre>
                    </details>
                </div>
            </div>
        `;
        
        return article;
    }
    
    processContent(content) {
        if (!content) return '';
        
        // Simple markdown processing
        return content
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```([\\s\\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\\n/g, '<br>');
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Update progress indicators for completed blocks
    updateBlockProgress(completedBlocks) {
        completedBlocks.forEach(blockId => {
            const blockElement = document.getElementById(`block-${blockId}`);
            const progressIndicator = document.getElementById(`progress-${blockId}`);
            
            if (blockElement) {
                blockElement.classList.add('completed');
            }
            
            if (progressIndicator) {
                progressIndicator.innerHTML = '<i class="fas fa-check-circle"></i>';
                progressIndicator.style.color = '#10b981';
            }
        });
    }
}
