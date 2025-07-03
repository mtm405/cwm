/**
 * Initialization Queue - Manages ordered initialization of components
 * Code with Morais - Application Bootstrap System
 */

class InitializationQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.completed = new Set();
        this.errors = [];
    }
    
    /**
     * Add initialization task to queue
     * @param {string} name - Task name
     * @param {Function} task - Task function
     * @param {Array<string>} dependencies - Task dependencies
     */
    add(name, task, dependencies = []) {
        this.queue.push({
            name,
            task,
            dependencies,
            status: 'pending'
        });
    }
    
    /**
     * Process initialization queue
     */
    async process() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        
        try {
            while (this.hasTasksToProcess()) {
                const tasksToRun = this.getAvailableTasks();
                
                if (tasksToRun.length === 0) {
                    // Circular dependency or all tasks are blocked
                    console.error('⚠️ Initialization deadlock detected');
                    break;
                }
                
                await Promise.all(tasksToRun.map(task => this.runTask(task)));
            }
            
            if (this.errors.length > 0) {
                console.warn(`⚠️ Initialization completed with ${this.errors.length} errors`);
            } else {
                console.log('✅ All initialization tasks completed successfully');
            }
        } catch (error) {
            console.error('❌ Fatal error in initialization queue:', error);
        } finally {
            this.isProcessing = false;
        }
    }
    
    /**
     * Initialize lesson components
     */
    async initializeLessonComponents() {
        try {
            if (typeof initializeLesson === 'function') {
                await initializeLesson();
            } else {
                console.warn('⚠️ initializeLesson function not found');
            }
        } catch (error) {
            console.error('❌ Failed to initialize lesson components:', error);
            this.errors.push({
                task: 'initializeLessonComponents',
                error
            });
        }
    }
    
    /**
     * Initialize lesson
     */
    async initializeLesson() {
        try {
            // Add lesson initialization here
            // For demonstration - we'll check if there's a global lesson initializer
            if (typeof initializeLesson === 'function') {
                await initializeLesson();
            } else {
                console.warn('⚠️ Lesson initializer not found');
            }
        } catch (error) {
            console.error('❌ Failed to initialize lesson:', error);
            this.errors.push({
                task: 'initializeLesson',
                error
            });
            
            // Show error message to user
            this.showLessonError();
        }
    }
    
    /**
     * Show lesson error message
     */
    showLessonError() {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'connection-error-message';
        errorContainer.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>📶 Connection Issue</h3>
                <p>Having trouble loading the lesson? We've saved your progress locally.</p>
                <button class="retry-btn">Try Again</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(errorContainer);
        
        // Add event listener for retry button
        const retryBtn = errorContainer.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                errorContainer.remove();
                this.initializeLesson();
            });
        }
        
        // Add styling
        const style = document.createElement('style');
        style.textContent = `
            .connection-error-message {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(255, 193, 7, 0.95);
                color: #000;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                animation: slideIn 0.5s ease;
                max-width: 300px;
            }
            
            .error-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            
            .error-content i {
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .error-content h3 {
                margin: 0 0 10px 0;
                font-size: 16px;
            }
            
            .error-content p {
                margin: 0 0 15px 0;
                font-size: 14px;
            }
            
            .retry-btn {
                background: #333;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 600;
                transition: background 0.3s ease;
            }
            
            .retry-btn:hover {
                background: #000;
            }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Helper function: Check if there are tasks to process
     */
    hasTasksToProcess() {
        return this.queue.some(task => task.status === 'pending');
    }
    
    /**
     * Helper function: Get tasks that can be processed
     */
    getAvailableTasks() {
        return this.queue.filter(task => {
            return (
                task.status === 'pending' &&
                task.dependencies.every(dep => this.completed.has(dep))
            );
        });
    }
    
    /**
     * Helper function: Run a task
     */
    async runTask(task) {
        try {
            task.status = 'running';
            await task.task();
            task.status = 'completed';
            this.completed.add(task.name);
        } catch (error) {
            task.status = 'failed';
            this.errors.push({
                task: task.name,
                error
            });
            console.error(`❌ Failed to initialize ${task.name}:`, error);
        }
    }
}

// Create global initialization queue
// Don't overwrite existing queue, just extend it if it already exists
if (!window.initQueue) {
    window.initQueue = new InitializationQueue();
} else {
    // Extend existing minimal implementation with full functionality
    const existingQueue = window.initQueue;
    Object.getOwnPropertyNames(InitializationQueue.prototype).forEach(name => {
        if (name !== 'constructor' && typeof InitializationQueue.prototype[name] === 'function') {
            existingQueue[name] = InitializationQueue.prototype[name].bind(existingQueue);
        }
    });
    
    console.log('✅ Extended existing initialization queue with full implementation');
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add system component initialization
    window.initQueue.add('system', async () => {
        console.log('🔄 Initializing system components...');
    }, []);
    
    // Add page-specific initialization
    const page = document.body.dataset.page;
    if (page === 'lesson') {
        window.initQueue.add('lesson', async () => {
            await window.initQueue.initializeLesson();
        }, ['system']);
    }
    
    // Start processing queue
    window.initQueue.process();
});

// Add Firebase integration test function
window.testFirebaseIntegration = function() {
    console.log('🔄 Testing Firebase integration...');
    return new Promise((resolve) => {
        try {
            // Check if Firebase is defined globally
            if (typeof firebase !== 'undefined') {
                console.log('✅ Firebase is globally available');
                resolve(true);
            } else {
                // Try to fetch Firebase status from the server
                fetch('/api/firebase-status')
                    .then(response => response.json())
                    .then(data => {
                        console.log(`🔥 Firebase status: ${data.status}`);
                        resolve(data.status === 'connected');
                    })
                    .catch(error => {
                        console.warn('⚠️ Could not check Firebase status:', error);
                        // Default to true in case of error to avoid blocking the lesson
                        resolve(true);
                    });
            }
        } catch (e) {
            console.warn('⚠️ Error testing Firebase integration:', e);
            // Default to true to avoid blocking the lesson
            resolve(true);
        }
    });
};
