/**
 * Connection Issue Recovery System
 * Handles connection errors and provides user feedback
 */

// Only define the ConnectionRecovery class if it doesn't already exist
if (typeof ConnectionRecovery === 'undefined') {
    class ConnectionRecovery {
        constructor() {
            this.connectionIssueElement = null;
            this.retryAttempts = 0;
            this.maxRetries = 3;
        this.retryDelay = 3000; // 3 seconds
        this.init();
    }
    
    /**
     * Initialize connection recovery system
     */
    init() {
        console.log('🔄 Initializing Connection Recovery System...');
        
        // Create connection issue UI if it doesn't exist
        this.createConnectionIssueUI();
        
        // Set up listeners
        this.setupConnectionListeners();
        
        // Listen for specific errors
        this.setupErrorListeners();
        
        console.log('✅ Connection Recovery System initialized');
    }
    
    /**
     * Create connection issue UI
     */
    createConnectionIssueUI() {
        // Check if element already exists
        if (document.getElementById('connection-issue-container')) {
            this.connectionIssueElement = document.getElementById('connection-issue-container');
            return;
        }
        
        // Create container
        this.connectionIssueElement = document.createElement('div');
        this.connectionIssueElement.id = 'connection-issue-container';
        this.connectionIssueElement.className = 'connection-issue-container';
        this.connectionIssueElement.style.display = 'none';
        
        // Create content
        this.connectionIssueElement.innerHTML = `
            <div class="connection-issue-content">
                <div class="connection-issue-icon">
                    <i class="fas fa-wifi"></i>
                </div>
                <div class="connection-issue-message">
                    <h3>📶 Connection Issue</h3>
                    <p>Having trouble loading the lesson? We've saved your progress locally.</p>
                </div>
                <div class="connection-issue-actions">
                    <button class="btn btn-retry">
                        <i class="fas fa-sync-alt"></i> Retry
                    </button>
                    <button class="btn btn-offline">
                        <i class="fas fa-book"></i> Use Offline Mode
                    </button>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .connection-issue-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--bg-card, #ffffff);
                border-radius: 12px;
                box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
                border: 1px solid var(--border-color, rgba(0, 0, 0, 0.1));
                z-index: 9999;
                max-width: 350px;
                animation: slide-in 0.3s ease-out;
            }
            
            @keyframes slide-in {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .connection-issue-content {
                padding: 1.5rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
            }
            
            .connection-issue-icon {
                background: rgba(244, 114, 182, 0.2);
                color: #ec4899;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 12px;
                font-size: 1.5rem;
            }
            
            .connection-issue-message h3 {
                margin: 0 0 0.5rem 0;
                color: var(--text-primary, #111827);
            }
            
            .connection-issue-message p {
                margin: 0;
                color: var(--text-secondary, #4b5563);
            }
            
            .connection-issue-actions {
                display: flex;
                gap: 0.75rem;
            }
            
            .connection-issue-actions .btn {
                padding: 0.6rem 1rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
                border: none;
            }
            
            .btn-retry {
                background-color: var(--primary-color, #6366f1);
                color: white;
            }
            
            .btn-retry:hover {
                background-color: var(--primary-color-dark, #4f46e5);
            }
            
            .btn-offline {
                background-color: transparent;
                color: var(--text-secondary, #4b5563);
                border: 1px solid var(--border-color, #e5e7eb) !important;
            }
            
            .btn-offline:hover {
                background-color: var(--bg-secondary, #f9fafb);
            }
        `;
        
        // Add to DOM
        document.head.appendChild(style);
        document.body.appendChild(this.connectionIssueElement);
        
        // Add event listeners
        this.connectionIssueElement.querySelector('.btn-retry').addEventListener('click', () => {
            this.retryConnection();
        });
        
        this.connectionIssueElement.querySelector('.btn-offline').addEventListener('click', () => {
            this.enableOfflineMode();
        });
    }
    
    /**
     * Show connection issue UI
     */
    showConnectionIssue() {
        if (this.connectionIssueElement) {
            this.connectionIssueElement.style.display = 'block';
        }
    }
    
    /**
     * Hide connection issue UI
     */
    hideConnectionIssue() {
        if (this.connectionIssueElement) {
            this.connectionIssueElement.style.display = 'none';
        }
    }
    
    /**
     * Retry connection
     */
    retryConnection() {
        if (this.retryAttempts >= this.maxRetries) {
            console.warn('⚠️ Max retry attempts reached');
            this.showMaxRetriesReached();
            return;
        }
        
        this.retryAttempts++;
        console.log(`🔄 Retrying connection (attempt ${this.retryAttempts}/${this.maxRetries})...`);
        
        // Update UI
        const retryButton = this.connectionIssueElement.querySelector('.btn-retry');
        const originalText = retryButton.innerHTML;
        retryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Retrying...';
        retryButton.disabled = true;
        
        // Try to reload resources
        setTimeout(() => {
            // Check connection
            if (navigator.onLine) {
                // Try to load Firebase data
                this.loadFirebaseData()
                    .then(success => {
                        if (success) {
                            console.log('✅ Connection restored');
                            this.hideConnectionIssue();
                            
                            // Reset retry count
                            this.retryAttempts = 0;
                            
                            // Attempt to reinitialize
                            if (typeof initializeLesson === 'function') {
                                initializeLesson();
                            }
                        } else {
                            console.warn('⚠️ Connection retry failed');
                            retryButton.innerHTML = originalText;
                            retryButton.disabled = false;
                        }
                    })
                    .catch(error => {
                        console.error('❌ Error retrying connection:', error);
                        retryButton.innerHTML = originalText;
                        retryButton.disabled = false;
                    });
            } else {
                console.warn('⚠️ Browser is offline');
                retryButton.innerHTML = originalText;
                retryButton.disabled = false;
                
                // Update message to indicate offline status
                const messageEl = this.connectionIssueElement.querySelector('.connection-issue-message p');
                messageEl.textContent = 'Your device appears to be offline. Please check your connection.';
            }
        }, this.retryDelay);
    }
    
    /**
     * Show max retries reached message
     */
    showMaxRetriesReached() {
        const messageEl = this.connectionIssueElement.querySelector('.connection-issue-message');
        messageEl.innerHTML = `
            <h3>⚠️ Connection Failed</h3>
            <p>We couldn't restore the connection after multiple attempts. Please try again later or continue in offline mode.</p>
        `;
        
        const retryButton = this.connectionIssueElement.querySelector('.btn-retry');
        retryButton.innerHTML = '<i class="fas fa-sync-alt"></i> Try Again';
        retryButton.disabled = false;
        
        // Reset retry count after a while
        setTimeout(() => {
            this.retryAttempts = 0;
        }, 60000); // Reset after 1 minute
    }
    
    /**
     * Enable offline mode
     */
    enableOfflineMode() {
        console.log('📱 Enabling offline mode...');
        
        // Update UI
        this.connectionIssueElement.querySelector('.connection-issue-message').innerHTML = `
            <h3>📚 Offline Mode Active</h3>
            <p>You're now using cached content. Some features may be limited.</p>
        `;
        
        // Add offline indicator to body
        const offlineIndicator = document.createElement('div');
        offlineIndicator.className = 'offline-mode-indicator';
        offlineIndicator.innerHTML = '<i class="fas fa-wifi"></i> Offline Mode';
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .offline-mode-indicator {
                position: fixed;
                top: 70px;
                right: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(offlineIndicator);
        
        // Set a flag for offline mode
        localStorage.setItem('cwm-offline-mode', 'true');
        
        // Hide notification after a few seconds
        setTimeout(() => {
            this.hideConnectionIssue();
        }, 5000);
        
        // Use local data if available
        this.useLocalData();
    }
    
    /**
     * Set up connection listeners
     */
    setupConnectionListeners() {
        window.addEventListener('online', () => {
            console.log('🌐 Browser is online');
            this.checkConnection();
        });
        
        window.addEventListener('offline', () => {
            console.log('⚠️ Browser is offline');
            this.showConnectionIssue();
        });
    }
    
    /**
     * Set up error listeners
     */
    setupErrorListeners() {
        // Listen for fetch errors
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                return response;
            } catch (error) {
                console.error('❌ Fetch error:', error);
                
                // Show connection issue for network errors
                if (error instanceof TypeError && error.message.includes('fetch')) {
                    this.showConnectionIssue();
                }
                
                throw error;
            }
        };
        
        // Listen for Firebase errors
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            const originalGet = firebase.firestore.DocumentReference.prototype.get;
            firebase.firestore.DocumentReference.prototype.get = async function(...args) {
                try {
                    return await originalGet.apply(this, args);
                } catch (error) {
                    console.error('❌ Firestore error:', error);
                    
                    // Show connection issue for network errors
                    if (error.code === 'unavailable' || error.code === 'resource-exhausted') {
                        window.connectionRecovery.showConnectionIssue();
                    }
                    
                    throw error;
                }
            };
        }
    }
    
    /**
     * Check connection status
     */
    async checkConnection() {
        if (!navigator.onLine) {
            this.showConnectionIssue();
            return false;
        }
        
        try {
            // Try to ping the server
            const response = await fetch('/api/ping', { method: 'HEAD' });
            
            if (response.ok) {
                this.hideConnectionIssue();
                return true;
            } else {
                this.showConnectionIssue();
                return false;
            }
        } catch (error) {
            console.error('❌ Connection check failed:', error);
            this.showConnectionIssue();
            return false;
        }
    }
    
    /**
     * Try to load Firebase data
     */
    async loadFirebaseData() {
        // Check if we're on a lesson page
        if (!window.location.pathname.includes('/lesson/')) {
            return true;
        }
        
        try {
            // Extract lesson ID from URL
            const lessonMatch = window.location.pathname.match(/\/lesson\/([^\/]+)/);
            const lessonId = lessonMatch ? lessonMatch[1] : null;
            
            if (!lessonId) {
                return false;
            }
            
            // Try to fetch lesson data
            const response = await fetch(`/api/lessons/${lessonId}`);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.lesson) {
                    // Update global lesson data
                    globalThis.lessonData = data.lesson;
                    
                    // Transform if needed
                    if (typeof transformLessonDataToBlocks === 'function') {
                        globalThis.lessonData = transformLessonDataToBlocks(globalThis.lessonData);
                    }
                    
                    console.log('✅ Lesson data loaded successfully');
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error loading Firebase data:', error);
            return false;
        }
    }
    
    /**
     * Use local data if available
     */
    useLocalData() {
        try {
            // Check if we're on a lesson page
            if (!window.location.pathname.includes('/lesson/')) {
                return;
            }
            
            // Extract lesson ID from URL
            const lessonMatch = window.location.pathname.match(/\/lesson\/([^\/]+)/);
            const lessonId = lessonMatch ? lessonMatch[1] : null;
            
            if (!lessonId) {
                return;
            }
            
            // Try to load from localStorage
            const cachedLesson = localStorage.getItem(`cwm-lesson-${lessonId}`);
            
            if (cachedLesson) {
                const lessonData = JSON.parse(cachedLesson);
                
                // Update global lesson data
                globalThis.lessonData = lessonData;
                
                // Transform if needed
                if (typeof transformLessonDataToBlocks === 'function') {
                    globalThis.lessonData = transformLessonDataToBlocks(globalThis.lessonData);
                }
                
                console.log('✅ Loaded lesson data from cache');
                
                // Reinitialize if possible
                if (typeof initializeLesson === 'function') {
                    initializeLesson();
                }
            } else {
                console.warn('⚠️ No cached lesson data available');
            }
        } catch (error) {
            console.error('❌ Error using local data:', error);
        }
    }
}

// Initialize connection recovery system
window.connectionRecovery = new ConnectionRecovery();
}

// If ConnectionRecovery already exists, ensure we have a global instance
if (typeof ConnectionRecovery !== 'undefined' && !window.connectionRecovery) {
    window.connectionRecovery = new ConnectionRecovery();
}
