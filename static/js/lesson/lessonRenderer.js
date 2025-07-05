// Rendering utilities for lesson system

export function renderLessonBlocks(blocks, lessonProgress) {
    const container = document.getElementById('lesson-content-container');
    if (!container) return;
    container.innerHTML = '';
    blocks.forEach((block, index) => {
        const blockElement = createBlockElement(block, index, lessonProgress);
        if (blockElement) container.appendChild(blockElement);
    });
    // Optionally, initialize interactive elements here
}

function createBlockElement(block, index, lessonProgress) {
    if (!block) return null;
    const article = document.createElement('article');
    article.className = `content-block ${block.type || 'unknown'}-block`;
    article.id = `block-${block.id || index}`;
    article.dataset.blockId = block.id || index;
    article.dataset.blockType = block.type || 'text';
    const isCompleted = lessonProgress?.completed_blocks && Array.isArray(lessonProgress.completed_blocks) && lessonProgress.completed_blocks.includes(block.id);
    if (isCompleted) {
        article.classList.add('completed');
        article.setAttribute('data-completion-status', 'completed');
    } else {
        article.setAttribute('data-completion-status', 'incomplete');
    }
    // Add assessment requirement attribute
    article.setAttribute('data-assessment-required', block.assessment_required || 'false');
    
    // Render based on block type
    switch(block.type) {
        case 'text':
            article.innerHTML = createTextBlockHTML(block);
            break;
        case 'code_example':
            article.innerHTML = createCodeExampleHTML(block);
            break;
        case 'interactive':
            article.innerHTML = createInteractiveBlockHTML(block);
            break;
        case 'quiz':
            article.innerHTML = createQuizBlockHTML(block);
            break;
        default:
            article.innerHTML = createDefaultBlockHTML(block);
    }
    return article;
}

function createTextBlockHTML(block) {
    return `
        <div class="block-header">
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
        <div class="block-content">
            <div class="text-content">
                ${block.content || ''}
            </div>
            ${block.key_points ? `
            <div class="key-points-section">
                <h4 class="key-points-header">
                    <i class="fas fa-key"></i>
                    Key Points
                </h4>
                <ul class="key-points-list">
                    ${block.key_points.map(point => `<li class="key-point">${point}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
        <div class="block-actions">
            <button class="action-btn primary complete-btn" data-block-id="${block.id}">
                <i class="fas fa-check"></i>
                <span>Mark as Read</span>
            </button>
        </div>
    `;
}

function createCodeExampleHTML(block) {
    return `
        <div class="block-header">
            <div class="block-type-indicator">
                <div class="block-icon code-block-icon">
                    <i class="fas fa-code"></i>
                </div>
                <span class="block-type-label">Code Example</span>
            </div>
            <div class="code-meta">
                <span class="language-badge ${(block.language || 'python').toLowerCase()}">${(block.language || 'python').toUpperCase()}</span>
                <button class="action-btn secondary copy-btn" data-block-id="${block.id}">
                    <i class="fas fa-copy"></i>
                    <span>Copy</span>
                </button>
            </div>
        </div>
        <div class="block-content">
            <div class="code-container">
                <div class="code-header">
                    <span class="code-title">${block.title || 'Example Code'}</span>
                </div>
                <div class="code-block-wrapper">
                    <pre class="code-content" id="code-${block.id}"><code class="language-${block.language || 'python'}">${block.code || ''}</code></pre>
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
        </div>
        <div class="block-actions">
            <button class="action-btn primary complete-btn" data-block-id="${block.id}">
                <i class="fas fa-check"></i>
                <span>Mark as Understood</span>
            </button>
        </div>
    `;
}

function createInteractiveBlockHTML(block) {
    return `
        <div class="block-header">
            <div class="block-type-indicator">
                <div class="block-icon interactive-block-icon">
                    <i class="fas fa-laptop-code"></i>
                </div>
                <span class="block-type-label">Code Challenge</span>
            </div>
            <div class="challenge-meta">
                <span class="challenge-type-badge">${block.challenge_type || 'Coding'}</span>
                <span class="difficulty-badge ${(block.difficulty || 'beginner').toLowerCase()}">${block.difficulty || 'Beginner'}</span>
            </div>
        </div>
        <div class="block-content">
            <div class="challenge-content">
                <div class="challenge-instructions">
                    <div class="instructions-header">
                        <i class="fas fa-bullseye"></i>
                        <span>Your Challenge</span>
                    </div>
                    <div class="instructions-content">
                        <p>${block.instructions || ''}</p>
                    </div>
                    ${block.requirements ? `
                    <div class="requirements-section">
                        <div class="requirements-header">
                            <i class="fas fa-list-check"></i>
                            <span>Requirements</span>
                        </div>
                        <ul class="requirements-list">
                            ${block.requirements.map(req => `<li class="requirement">${req}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                <div class="code-editor-container">
                    <div class="editor-toolbar">
                        <span class="editor-label">
                            <i class="fas fa-code"></i>
                            ${block.language || 'Python'} Editor
                        </span>
                        <div class="editor-actions">
                            <button class="action-btn secondary hint-btn" data-block-id="${block.id}">
                                <i class="fas fa-lightbulb"></i>
                                <span>Hint (5 🪙)</span>
                            </button>
                            <button class="action-btn secondary reset-btn" data-block-id="${block.id}">
                                <i class="fas fa-undo"></i>
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                    <div class="code-editor-wrapper">
                        <div id="editor-${block.id}" class="code-editor" data-language="${block.language || 'python'}">${block.starter_code || ''}</div>
                    </div>
                    <div class="editor-footer">
                        <button class="action-btn primary run-btn" data-block-id="${block.id}">
                            <i class="fas fa-play"></i>
                            <span>Run Code</span>
                        </button>
                        <button class="action-btn outline solution-btn" data-block-id="${block.id}">
                            <i class="fas fa-eye"></i>
                            <span>Show Solution</span>
                        </button>
                    </div>
                </div>
                <div class="output-section">
                    <div class="output-header">
                        <i class="fas fa-terminal"></i>
                        <span>Output & Results</span>
                    </div>
                    <div id="output-${block.id}" class="code-output"></div>
                    ${block.tests ? `
                    <div class="test-results-section" id="tests-${block.id}">
                        <div class="test-header">
                            <i class="fas fa-flask"></i>
                            <span>Test Results</span>
                        </div>
                        <div class="test-list"></div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function createQuizBlockHTML(block) {
    return `
        <div class="block-header">
            <div class="block-type-indicator">
                <div class="block-icon quiz-block-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <span class="block-type-label">Knowledge Check</span>
            </div>
            <div class="quiz-meta">
                <span class="quiz-type-badge">Assessment</span>
            </div>
        </div>
        <div class="block-content">
            <div class="quiz-content">
                <div class="quiz-intro">
                    <div class="quiz-intro-header">
                        <i class="fas fa-question-circle"></i>
                        <span>Test Your Understanding</span>
                    </div>
                    <div class="quiz-intro-content">
                        <p>${block.description || 'Complete this quiz to test your knowledge and mark this section as complete.'}</p>
                    </div>
                </div>
                <div class="quiz-container" id="quiz-${block.quiz_id || block.id}" data-quiz-id="${block.quiz_id || block.id}">
                    <div class="quiz-loading">
                        <div class="loading-spinner"></div>
                        <span>Loading quiz...</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createDefaultBlockHTML(block) {
    return `
        <div class="block-header">
            <div class="block-type-indicator">
                <div class="block-icon unknown-block-icon">
                    <i class="fas fa-question"></i>
                </div>
                <span class="block-type-label">Unknown Block Type: ${block.type}</span>
            </div>
        </div>
        <div class="block-content">
            <div class="unknown-block-content">
                <p>This block type (${block.type}) is not yet supported.</p>
                <details>
                    <summary>Block Data</summary>
                    <pre class="block-data">${JSON.stringify(block, null, 2)}</pre>
                </details>
            </div>
        </div>
    `;
}

// Progress animation utilities
export function updateBlockProgress(blockId, progressData) {
    const blockElement = document.getElementById(`block-${blockId}`);
    const progressIndicator = document.getElementById(`progress-${blockId}`);
    
    if (!blockElement || !progressIndicator) return;
    
    const progressStatus = progressIndicator.querySelector('.progress-status');
    const progressIcon = progressStatus.querySelector('i');
    
    if (progressData.completed) {
        // Animate completion
        blockElement.classList.add('completing');
        progressStatus.classList.remove('incomplete');
        progressStatus.classList.add('complete');
        progressIcon.className = 'fas fa-check-circle';
        
        // Add completion animation
        setTimeout(() => {
            blockElement.classList.remove('completing');
            blockElement.classList.add('completed');
            blockElement.setAttribute('data-completion-status', 'completed');
        }, 500);
    } else {
        // Reset to incomplete state
        blockElement.classList.remove('completed', 'completing');
        blockElement.setAttribute('data-completion-status', 'incomplete');
        progressStatus.classList.remove('complete');
        progressStatus.classList.add('incomplete');
        progressIcon.className = 'fas fa-circle-o';
    }
}

export function showBlockFeedback(blockId, feedbackType, message) {
    const blockElement = document.getElementById(`block-${blockId}`);
    if (!blockElement) return;
    
    // Remove existing feedback
    const existingFeedback = blockElement.querySelector('.block-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Create new feedback element
    const feedbackElement = document.createElement('div');
    feedbackElement.className = `block-feedback ${feedbackType}`;
    feedbackElement.innerHTML = `
        <div class="feedback-content">
            <i class="fas fa-${feedbackType === 'success' ? 'check' : feedbackType === 'error' ? 'times' : 'info'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Insert feedback
    const blockActions = blockElement.querySelector('.block-actions');
    if (blockActions) {
        blockActions.insertBefore(feedbackElement, blockActions.firstChild);
    }
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        feedbackElement.remove();
    }, 3000);
}

export function highlightBlockRequirements(blockId, requirements) {
    const blockElement = document.getElementById(`block-${blockId}`);
    if (!blockElement) return;
    
    blockElement.classList.add('requirements-highlighted');
    
    // Add requirement indicators
    requirements.forEach(requirement => {
        const indicator = document.createElement('div');
        indicator.className = 'requirement-indicator';
        indicator.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${requirement}</span>
        `;
        blockElement.appendChild(indicator);
    });
}
