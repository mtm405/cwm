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
            code_challenge: this.renderCodeChallengeBlock.bind(this),
            video: this.renderVideoBlock.bind(this),
            text_with_questions: this.renderTextWithQuestionsBlock.bind(this),
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

    renderCodeChallengeBlock(block) {
        return `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-puzzle-piece"></i>
                </div>
                <div class="challenge-meta">
                    <span class="challenge-type">Code Challenge</span>
                    <span class="difficulty-badge">${block.difficulty || 'intermediate'}</span>
                </div>
            </div>
            <div class="challenge-content">
                <div class="challenge-instructions">
                    <h4>${block.title || 'Code Challenge'}</h4>
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
                        <button class="btn btn-info hint-btn" data-block-id="${block.id}" style="display: ${block.hints && block.hints.length ? 'inline-block' : 'none'}">
                            <i class="fas fa-lightbulb"></i> Hint
                        </button>
                    </div>
                </div>
                <div id="output-${block.id}" class="code-output"></div>
                ${block.hints && block.hints.length ? `
                <div class="hints-container" style="display: none;">
                    <h5>Hints:</h5>
                    <ul>
                        ${block.hints.map(hint => `<li>${hint}</li>`).join('')}
                    </ul>
                </div>` : ''}
            </div>
        `;
    }

    renderVideoBlock(block) {
        const videoSrc = block.source === 'youtube' 
            ? `https://www.youtube.com/embed/${block.video_id}` 
            : block.video_url;
            
        return `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-video"></i>
                </div>
                <div class="video-meta">
                    <span class="video-type">Video Tutorial</span>
                    ${block.duration ? `<span class="duration-badge">${this.formatDuration(block.duration)}</span>` : ''}
                </div>
            </div>
            <div class="video-content">
                <div class="video-description">
                    <h4>${block.title || 'Video Tutorial'}</h4>
                    <p>${block.description || ''}</p>
                </div>
                <div class="video-container">
                    <iframe 
                        width="100%" 
                        height="315" 
                        src="${videoSrc}" 
                        title="${block.title || 'Video Tutorial'}"
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                </div>
            </div>
        `;
    }

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

    renderTextWithQuestionsBlock(block) {
        const questionHtml = this.renderEmbeddedQuestions(block.questions);
        
        return `
            <div class="block-header">
                <div class="block-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <div class="block-meta">
                    <span class="block-type">Interactive Reading</span>
                    <span class="block-progress-indicator" id="progress-${block.id}">
                        <i class="fas fa-circle"></i>
                    </span>
                </div>
            </div>
            <div class="block-content">
                <div class="text-content">
                    ${block.title ? `<h3>${block.title}</h3>` : ''}
                    ${this.processContent(block.content || '')}
                </div>
                <div class="embedded-questions-container">
                    ${questionHtml}
                </div>
            </div>
            <div class="block-actions">
                <button class="btn btn-success complete-btn" data-block-id="${block.id}">
                    <i class="fas fa-check"></i> Mark as Complete
                </button>
            </div>
        `;
    }

    renderEmbeddedQuestions(questions) {
        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return '<div class="no-questions">No questions available</div>';
        }

        return `
            <div class="embedded-questions">
                <h4>Knowledge Check</h4>
                ${questions.map((question, index) => this.renderQuestion(question, index)).join('')}
            </div>
        `;
    }

    renderQuestion(question, index) {
        const questionId = `embedded-question-${question.id || index}`;

        let questionContent = '';
        
        switch (question.type) {
            case 'multiple_choice':
                questionContent = this.renderMultipleChoiceQuestion(question, questionId);
                break;
            case 'true_false':
                questionContent = this.renderTrueFalseQuestion(question, questionId);
                break;
            case 'fill_blank':
                questionContent = this.renderFillBlankQuestion(question, questionId);
                break;
            case 'open_ended':
                questionContent = this.renderOpenEndedQuestion(question, questionId);
                break;
            default:
                questionContent = `<div class="question-error">Unsupported question type: ${question.type}</div>`;
        }

        return `
            <div class="embedded-question" data-question-id="${question.id || index}" data-question-type="${question.type}">
                <div class="question-number">${index + 1}</div>
                <div class="question-content">
                    ${questionContent}
                </div>
            </div>
        `;
    }

    renderMultipleChoiceQuestion(question, questionId) {
        return `
            <div class="question-text">${question.question}</div>
            <div class="question-options">
                ${question.options.map((option, idx) => `
                    <div class="question-option">
                        <input type="radio" id="${questionId}-option-${idx}" name="${questionId}" value="${idx}" class="embedded-mc-option">
                        <label for="${questionId}-option-${idx}">${option}</label>
                    </div>
                `).join('')}
            </div>
            <div class="question-feedback" style="display: none;"></div>
            <div class="question-actions">
                <button class="btn btn-primary check-answer-btn" data-question-id="${questionId}" data-correct-answer="${question.correct_answer}">
                    Check Answer
                </button>
            </div>
        `;
    }

    renderTrueFalseQuestion(question, questionId) {
        return `
            <div class="question-text">${question.question}</div>
            <div class="question-options tf-options">
                <div class="question-option">
                    <input type="radio" id="${questionId}-true" name="${questionId}" value="true" class="embedded-tf-option">
                    <label for="${questionId}-true">True</label>
                </div>
                <div class="question-option">
                    <input type="radio" id="${questionId}-false" name="${questionId}" value="false" class="embedded-tf-option">
                    <label for="${questionId}-false">False</label>
                </div>
            </div>
            <div class="question-feedback" style="display: none;"></div>
            <div class="question-actions">
                <button class="btn btn-primary check-answer-btn" data-question-id="${questionId}" data-correct-answer="${question.correct_answer}">
                    Check Answer
                </button>
            </div>
        `;
    }

    renderFillBlankQuestion(question, questionId) {
        return `
            <div class="question-text">${question.question}</div>
            <div class="fill-blank-container">
                <input type="text" id="${questionId}-input" class="fill-blank-input" placeholder="Your answer...">
            </div>
            <div class="question-feedback" style="display: none;"></div>
            <div class="question-actions">
                <button class="btn btn-primary check-answer-btn" data-question-id="${questionId}" data-correct-answer="${question.correct_answer}">
                    Check Answer
                </button>
            </div>
        `;
    }

    renderOpenEndedQuestion(question, questionId) {
        return `
            <div class="question-text">${question.question}</div>
            <div class="open-ended-container">
                <textarea id="${questionId}-input" class="open-ended-input" rows="4" placeholder="Write your answer here..."></textarea>
            </div>
            <div class="question-actions">
                <button class="btn btn-primary save-answer-btn" data-question-id="${questionId}">
                    Save Answer
                </button>
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
