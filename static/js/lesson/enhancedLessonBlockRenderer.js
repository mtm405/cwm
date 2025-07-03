/**
 * Enhanced Lesson Block Renderer
 * Handles rendering of different lesson block types
 */

export class EnhancedLessonBlockRenderer {
    constructor() {
        this.blockRenderers = {
            text: this.renderTextBlock.bind(this),
            code_example: this.renderCodeBlock.bind(this),
            interactive: this.renderInteractiveBlock.bind(this),
            quiz: this.renderQuizBlock.bind(this),
            default: this.renderDefaultBlock.bind(this)
        };
    }

    renderBlock(block, userProgress = {}) {
        const renderer = this.blockRenderers[block.type] || this.blockRenderers.default;
        const blockElement = document.createElement('article');
        
        blockElement.className = `content-block ${block.type}-block`;
        blockElement.id = `block-${block.id}`;
        blockElement.dataset.blockId = block.id;
        blockElement.dataset.blockType = block.type;
        
        // Check if completed
        const isCompleted = userProgress.completed_blocks?.includes(block.id);
        if (isCompleted) {
            blockElement.classList.add('completed');
        }
        
        blockElement.innerHTML = renderer(block);
        return blockElement;
    }

    renderTextBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <div class="block-meta">
                    <span class="block-type">Reading</span>
                    <span class="block-progress-indicator" id="progress-${block.id}">
                        <i class="fas fa-circle"></i>
                    </span>
                </div>
            </div>
            <div class="block-content">
                <div class="text-content">${this.processContent(block.content || '')}</div>
            </div>
            <div class="block-actions">
                <button class="btn btn-success complete-btn" data-block-id="${block.id}">
                    <i class="fas fa-check"></i> Mark as Read
                </button>
            </div>
        `;
    }

    renderCodeBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-code"></i>
                </div>
                <div class="code-meta">
                    <span class="language-badge">${(block.language || 'python').toUpperCase()}</span>
                    <button class="btn-copy" data-block-id="${block.id}">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
            </div>
            <div class="code-container">
                <pre class="code-content"><code class="language-${block.language || 'python'}">${this.escapeHtml(block.code || '')}</code></pre>
                ${block.explanation ? `
                <div class="code-explanation">
                    <p>${block.explanation}</p>
                </div>
                ` : ''}
            </div>
        `;
    }

    renderInteractiveBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-laptop-code"></i>
                </div>
                <div class="challenge-meta">
                    <span class="challenge-type">Code Challenge</span>
                </div>
            </div>
            <div class="challenge-content">
                <div class="challenge-instructions">
                    <h4>Your Challenge:</h4>
                    <p>${block.instructions || ''}</p>
                </div>
                <div class="code-editor-wrapper">
                    <div id="editor-${block.id}" class="code-editor" data-language="${block.language || 'python'}">${this.escapeHtml(block.starter_code || '')}</div>
                    <div class="editor-actions">
                        <button class="btn btn-primary run-btn" data-block-id="${block.id}">
                            <i class="fas fa-play"></i> Run Code
                        </button>
                        <button class="btn btn-secondary reset-btn" data-block-id="${block.id}">
                            <i class="fas fa-undo"></i> Reset
                        </button>
                    </div>
                </div>
                <div id="output-${block.id}" class="code-output"></div>
            </div>
        `;
    }

    renderQuizBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="quiz-meta">
                    <span class="quiz-type">Knowledge Check</span>
                </div>
            </div>
            <div class="quiz-content">
                <div id="quiz-${block.quiz_id}" data-quiz-id="${block.quiz_id}">
                    <div class="quiz-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Loading quiz...</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderDefaultBlock(block) {
        return `
            <div class="block-content">
                <div class="unknown-block">
                    <i class="fas fa-question-circle"></i>
                    <p>Unsupported block type: ${block.type}</p>
                </div>
            </div>
        `;
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
            .replace(/\n/g, '<br>');
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
