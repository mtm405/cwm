/**
 * Initialization Queue
 * Manages the sequence of lesson system initialization
 */

export class InitializationQueue {
    constructor() {
        this.queue = [];
        this.running = false;
        this.completed = false;
        this.errors = [];
    }

    add(task) {
        if (typeof task !== 'function') {
            throw new Error('Task must be a function');
        }
        
        this.queue.push(task);
        return this;
    }

    async run() {
        if (this.running) {
            console.warn('Initialization queue already running');
            return;
        }
        
        this.running = true;
        console.log(`🚀 Running initialization queue with ${this.queue.length} tasks`);
        
        try {
            for (let i = 0; i < this.queue.length; i++) {
                const task = this.queue[i];
                try {
                    console.log(`📝 Running task ${i + 1}/${this.queue.length}`);
                    await task();
                    console.log(`✅ Task ${i + 1} completed`);
                } catch (error) {
                    console.error(`❌ Task ${i + 1} failed:`, error);
                    this.errors.push({ task: i + 1, error });
                    
                    // Decide whether to continue or stop
                    if (error.critical) {
                        throw error;
                    }
                }
            }
            
            this.completed = true;
            console.log('✅ Initialization queue completed');
            
            if (this.errors.length > 0) {
                console.warn(`⚠️ Completed with ${this.errors.length} errors`);
            }
            
        } catch (error) {
            console.error('❌ Initialization queue failed:', error);
            throw error;
        } finally {
            this.running = false;
        }
    }

    clear() {
        this.queue = [];
        this.errors = [];
        this.completed = false;
        this.running = false;
    }

    getStatus() {
        return {
            running: this.running,
            completed: this.completed,
            tasksTotal: this.queue.length,
            errors: this.errors.length,
            success: this.completed && this.errors.length === 0
        };
    }
}
