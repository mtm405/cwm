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
        article.className = `content-block ${block.type}-block`;
        article.id = `block-${block.id}`;
        article.dataset.blockId = block.id;
        article.dataset.blockType = block.type;
        
        // Check if completed
        const isCompleted = userProgress?.completed_blocks?.includes(block.id);
        if (isCompleted) {
            article.classList.add('completed');
        }
        
        // Render based on type
        const renderer = this.blockRenderers[block.type] || this.blockRenderers.default;
        article.innerHTML = renderer(block);
        
        return article;
    }
    
    renderTextBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <div class="block-meta">
                    <span class="block-type">Reading</span>
                    <span class="block-title">${block.title || 'Content'}</span>
                </div>
                <div class="block-actions">
                    <span class="block-progress-indicator" id="progress-${block.id}">
                        <i class="fas fa-circle"></i>
                    </span>
                </div>
            </div>
            <div class="block-content">
                <div class="text-content">${this.processContent(block.content || '')}</div>
                <div class="block-footer">
                    <button class="btn btn-success complete-btn" data-block-id="${block.id}">
                        <i class="fas fa-check"></i> Mark as Read
                    </button>
                </div>
            </div>
        `;
    }
    
    renderCodeBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-code"></i>
                </div>
                <div class="block-meta">
                    <span class="block-type">Code Example</span>
                    <span class="block-title">${block.title || 'Code Example'}</span>
                </div>
                <div class="block-actions">
                    <span class="language-badge">${(block.language || 'python').toUpperCase()}</span>
                    <button class="btn-copy" data-block-id="${block.id}" title="Copy code">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <div class="block-content">
                <div class="code-container">
                    <pre class="code-content"><code class="language-${block.language || 'python'}">${this.escapeHtml(block.code || '')}</code></pre>
                </div>
                ${block.explanation ? `
                <div class="code-explanation">
                    <h4>Explanation:</h4>
                    <p>${block.explanation}</p>
                </div>
                ` : ''}
                <div class="block-footer">
                    <button class="btn btn-success complete-btn" data-block-id="${block.id}">
                        <i class="fas fa-check"></i> Mark as Understood
                    </button>
                </div>
            </div>
        `;
    }
    
    renderInteractiveBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-laptop-code"></i>
                </div>
                <div class="block-meta">
                    <span class="block-type">Code Challenge</span>
                    <span class="block-title">${block.title || 'Exercise'}</span>
                </div>
                <div class="block-actions">
                    <span class="language-badge">${(block.language || 'python').toUpperCase()}</span>
                </div>
            </div>
            <div class="block-content">
                <div class="challenge-instructions">
                    <h4><i class="fas fa-target"></i> Your Challenge:</h4>
                    <p>${block.instructions || 'Complete the code below.'}</p>
                </div>
                <div class="code-editor-wrapper">
                    <div class="editor-header">
                        <span class="editor-title">Code Editor</span>
                        <div class="editor-controls">
                            <button class="btn btn-secondary reset-btn" data-block-id="${block.id}" title="Reset code">
                                <i class="fas fa-undo"></i> Reset
                            </button>
                            <button class="btn btn-primary run-btn" data-block-id="${block.id}" title="Run code">
                                <i class="fas fa-play"></i> Run Code
                            </button>
                        </div>
                    </div>
                    <div id="editor-${block.id}" class="code-editor" data-language="${block.language || 'python'}">${this.escapeHtml(block.starter_code || '# Write your code here')}</div>
                </div>
                <div id="output-${block.id}" class="code-output" style="display: none;">
                    <div class="output-header">
                        <i class="fas fa-terminal"></i> Output
                    </div>
                    <div class="output-content"></div>
                </div>
            </div>
        `;
    }
    
    renderQuizBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="block-meta">
                    <span class="block-type">Knowledge Check</span>
                    <span class="block-title">${block.title || 'Quiz'}</span>
                </div>
                <div class="block-actions">
                    <span class="quiz-progress-indicator" id="quiz-progress-${block.id}">
                        <i class="fas fa-circle"></i>
                    </span>
                </div>
            </div>
            <div class="block-content">
                <div class="quiz-intro">
                    <p>${block.description || 'Test your knowledge with this quiz.'}</p>
                </div>
                <div class="quiz-container">
                    <div id="quiz-${block.quiz_id}" data-quiz-id="${block.quiz_id}" data-block-id="${block.id}">
                        <div class="quiz-loading">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Loading quiz questions...</span>
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
