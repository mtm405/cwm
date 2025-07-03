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
    if (isCompleted) article.classList.add('completed');
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
            <div class="text-content">
                ${block.content || ''}
            </div>
            ${block.key_points ? `
            <div class="key-points">
                <h4>🔑 Key Points:</h4>
                <ul>
                    ${block.key_points.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>
        <div class="block-actions">
            <button class="btn btn-success complete-btn">
                <i class="fas fa-check"></i> Mark as Read
            </button>
        </div>
    `;
}

function createCodeExampleHTML(block) {
    return `
        <div class="block-header">
            <div class="block-icon">
                <i class="fas fa-code"></i>
            </div>
            <div class="code-meta">
                <span class="language-badge">${(block.language || 'python').toUpperCase()}</span>
                <button class="btn-copy">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
        </div>
        <div class="code-container">
            <div class="code-header">
                <span class="code-title">${block.title || 'Example Code'}</span>
            </div>
            <pre class="code-content" id="code-${block.id}"><code class="language-${block.language || 'python'}">${block.code || ''}</code></pre>
            ${block.explanation ? `
            <div class="code-explanation">
                <h5>💡 Explanation:</h5>
                <p>${block.explanation}</p>
            </div>
            ` : ''}
        </div>
    `;
}

function createInteractiveBlockHTML(block) {
    return `
        <div class="block-header">
            <div class="block-icon">
                <i class="fas fa-laptop-code"></i>
            </div>
            <div class="challenge-meta">
                <span class="challenge-type">${block.challenge_type || 'Code Challenge'}</span>
                <span class="difficulty">${block.difficulty || 'Beginner'}</span>
            </div>
        </div>
        <div class="challenge-content">
            <div class="challenge-instructions">
                <h4>🎯 Your Challenge:</h4>
                <p>${block.instructions || ''}</p>
                ${block.requirements ? `
                <div class="requirements">
                    <h5>📋 Requirements:</h5>
                    <ul>
                        ${block.requirements.map(req => `<li>${req}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
            <div class="code-editor-wrapper">
                <div class="editor-toolbar">
                    <span class="editor-label">${block.language || 'Python'} Editor</span>
                    <div class="editor-actions">
                        <button class="btn btn-sm btn-hint">
                            <i class="fas fa-lightbulb"></i> Hint (5 🪙)
                        </button>
                        <button class="btn btn-sm btn-reset">
                            <i class="fas fa-undo"></i> Reset
                        </button>
                    </div>
                </div>
                <div id="editor-${block.id}" class="code-editor">${block.starter_code || ''}</div>
                <div class="editor-footer">
                    <button class="btn btn-primary run-btn">
                        <i class="fas fa-play"></i> Run Code
                    </button>
                    <button class="btn btn-outline solution-btn">
                        <i class="fas fa-eye"></i> Show Solution
                    </button>
                </div>
            </div>
            <div class="output-section">
                <div class="output-header">
                    <i class="fas fa-terminal"></i> Output & Results
                </div>
                <div id="output-${block.id}" class="ide-output"></div>
                ${block.tests ? `
                <div class="test-results" id="tests-${block.id}">
                    <h5>🧪 Test Results:</h5>
                    <div class="test-list"></div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function createQuizBlockHTML(block) {
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
            <div class="quiz-intro">
                <h4>🧠 Test Your Understanding</h4>
                <p>${block.description || 'Complete this quiz to test your knowledge.'}</p>
            </div>
            <div id="quiz-${block.quiz_id || block.id}" data-quiz-id="${block.quiz_id || block.id}">
                <div class="spinner">Loading quiz...</div>
            </div>
        </div>
    `;
}

function createDefaultBlockHTML(block) {
    return `
        <div class="block-header">
            <div class="block-icon">
                <i class="fas fa-question"></i>
            </div>
            <div class="block-meta">
                <span class="block-type">Unknown Block Type: ${block.type}</span>
            </div>
        </div>
        <div class="block-content">
            <p>This block type (${block.type}) is not yet supported.</p>
            <pre>${JSON.stringify(block, null, 2)}</pre>
        </div>
    `;
}
