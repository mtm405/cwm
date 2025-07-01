/**
 * Simple Lesson Initialization - Fixed Implementation
 * For Code with Morais - Debugging Version
 */

// Global functions to fix JavaScript errors
window.switchSubtopic = function(index) {
    console.log(`Switching to subtopic ${index}`);
    // Basic implementation
    const tabs = document.querySelectorAll('.subtopic-tab');
    tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
};

window.previousSubtopic = function() {
    console.log('Previous subtopic');
    // Basic implementation - find current active tab and go to previous
    const tabs = document.querySelectorAll('.subtopic-tab');
    const activeIndex = Array.from(tabs).findIndex(tab => tab.classList.contains('active'));
    if (activeIndex > 0) {
        switchSubtopic(activeIndex - 1);
    }
};

window.nextSubtopic = function() {
    console.log('Next subtopic');
    // Basic implementation - find current active tab and go to next
    const tabs = document.querySelectorAll('.subtopic-tab');
    const activeIndex = Array.from(tabs).findIndex(tab => tab.classList.contains('active'));
    if (activeIndex < tabs.length - 1) {
        switchSubtopic(activeIndex + 1);
    }
};

window.completeCurrentSubtopic = function() {
    console.log('Completing current subtopic');
    // Basic implementation
    const activeTab = document.querySelector('.subtopic-tab.active');
    if (activeTab) {
        activeTab.classList.add('completed');
        // Show success message
        showNotification('Subtopic completed! +50 XP', 'success');
    }
};

// Simple notification function
window.showNotification = function(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Create simple notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#6366f1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
};

// Simple progress tracker
class SimpleProgressTracker {
    constructor(lessonId) {
        this.lessonId = lessonId;
        this.progress = 0;
        console.log(`📊 SimpleProgressTracker initialized for lesson: ${lessonId}`);
    }
    
    initialize() {
        console.log('✅ Simple progress tracker ready');
        this.updateProgressBar();
    }
    
    updateProgressBar() {
        const progressBar = document.getElementById('lesson-progress-bar') || 
                           document.querySelector('.progress-bar') ||
                           document.querySelector('.progress-fill');
        
        if (progressBar) {
            progressBar.style.width = `${this.progress}%`;
            console.log(`📈 Progress updated: ${this.progress}%`);
        }
        
        const progressText = document.getElementById('lesson-progress-text') ||
                            document.querySelector('.progress-text');
        
        if (progressText) {
            progressText.textContent = `${Math.round(this.progress)}% Complete`;
        }
    }
    
    completeCurrentSubtopic() {
        const tabs = document.querySelectorAll('.subtopic-tab');
        const completedTabs = document.querySelectorAll('.subtopic-tab.completed');
        
        this.progress = (completedTabs.length / tabs.length) * 100;
        this.updateProgressBar();
        
        console.log(`📊 Progress: ${this.progress}%`);
    }
}

// Simple lesson manager
class SimpleLessonManager {
    constructor(lessonData) {
        this.lessonData = lessonData;
        console.log('🚀 SimpleLessonManager initialized');
    }
    
    initialize() {
        console.log('✅ Simple lesson manager ready');
        this.renderBasicContent();
    }
    
    renderBasicContent() {
        const contentContainer = document.getElementById('lesson-content');
        if (!contentContainer) {
            console.warn('⚠️ Content container not found');
            return;
        }
        
        // If content is empty, add basic structure
        if (!contentContainer.innerHTML.trim()) {
            contentContainer.innerHTML = `
                <div class="content-blocks">
                    ${this.lessonData.content ? this.lessonData.content.map((block, index) => this.renderContentBlock(block, index)).join('') : ''}
                    
                    <div class="lesson-completion">
                        <h3>🎉 Great job!</h3>
                        <p>You're making excellent progress in your Python journey.</p>
                        <button class="btn btn-primary" onclick="completeCurrentSubtopic()">
                            Mark Section Complete
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    renderContentBlock(block, index) {
        const blockId = `block-${index}`;
        
        switch (block.type) {
            case 'text':
                return `
                    <div class="content-block text-block" id="${blockId}">
                        <div class="block-content">
                            ${this.markdownToHtml(block.content)}
                        </div>
                    </div>
                `;
                
            case 'code_example':
                return `
                    <div class="content-block code-block" id="${blockId}">
                        <div class="code-header">
                            <span class="language-tag">${block.language || 'python'}</span>
                            <button class="copy-btn" onclick="copyCode(this)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <pre><code class="language-${block.language || 'python'}">${block.code}</code></pre>
                    </div>
                `;
                
            case 'interactive_challenge':
                return `
                    <div class="content-block interactive-block" id="${blockId}">
                        <h4>🎯 Try It Yourself</h4>
                        <p>${block.instructions}</p>
                        <div class="code-editor">
                            <textarea placeholder="Write your code here..." rows="6">${block.starter_code || ''}</textarea>
                            <button class="btn btn-primary run-btn">Run Code</button>
                        </div>
                    </div>
                `;
                
            default:
                return `
                    <div class="content-block" id="${blockId}">
                        <p>Content block type: ${block.type}</p>
                    </div>
                `;
        }
    }
    
    markdownToHtml(text) {
        if (!text) return '';
        
        // Simple markdown conversion
        return text
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
}

// Copy code function
window.copyCode = function(button) {
    const codeBlock = button.closest('.code-block').querySelector('code');
    if (!codeBlock) return;
    
    const text = codeBlock.textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Simple lesson initialization starting...');
    
    // Get lesson data from template or create mock data
    const lessonData = window.lessonData || {
        id: 'python-basics',
        title: 'Python Basics',
        content: [
            {
                type: 'text',
                content: '# Welcome to Python Basics!\n\nPython is a powerful, versatile programming language that is perfect for beginners.'
            },
            {
                type: 'code_example',
                language: 'python',
                code: '# This is a comment\nprint("Hello, World!")\n\n# Variables\nname = "Code with Morais"\nage = 16\nprint(f"Welcome to {name}!")'
            }
        ]
    };
    
    // Initialize components
    if (lessonData.id) {
        window.progressTracker = new SimpleProgressTracker(lessonData.id);
        window.progressTracker.init();
        
        window.lessonManager = new SimpleLessonManager(lessonData);
        window.lessonManager.initialize();
    }
    
    console.log('✅ Simple lesson initialization complete');
});

// Add basic CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .subtopic-tab.completed {
        background-color: #10b981 !important;
        color: white !important;
    }
    
    .content-blocks {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }
    
    .content-block {
        margin-bottom: 2rem;
        padding: 1.5rem;
        border-radius: 12px;
        background: var(--block-bg, #f8f9fa);
        border: 1px solid var(--block-border, #e9ecef);
    }
    
    .code-block {
        background: #1e293b !important;
        color: #e2e8f0;
        border: 1px solid #334155;
    }
    
    .code-block pre {
        margin: 0;
        background: none;
        border: none;
        padding: 0;
    }
    
    .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #334155;
    }
    
    .language-tag {
        background: #6366f1;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.875rem;
    }
    
    .copy-btn {
        background: #374151;
        border: 1px solid #4b5563;
        color: #e5e7eb;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
    }
    
    .copy-btn:hover {
        background: #4b5563;
    }
    
    .interactive-block {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white;
        border: none;
    }
    
    .interactive-block textarea {
        width: 100%;
        background: #1e293b;
        color: #e2e8f0;
        border: 1px solid #334155;
        border-radius: 6px;
        padding: 1rem;
        font-family: 'Fira Code', 'Monaco', monospace;
        margin: 1rem 0;
    }
    
    .run-btn {
        background: #10b981;
        border: none;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
    }
    
    .run-btn:hover {
        background: #059669;
    }
    
    .lesson-completion {
        text-align: center;
        padding: 2rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        margin-top: 3rem;
    }
`;
document.head.appendChild(style);
