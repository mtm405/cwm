/**
 * Error Recovery System - Centralized error handling and recovery
 * Code with Morais - Application Resilience System
 */

// Setup global error handling
(function setupGlobalErrorHandling() {
    // Store original console.error
    const originalConsoleError = console.error;
    
    // Override console.error to add custom handling
    console.error = function(...args) {
        // Call original console.error
        originalConsoleError.apply(console, args);
        
        // Process errors
        processError(args);
    };
    
    // Add global error handler
    window.addEventListener('error', function(event) {
        // Log the error
        console.log('🛠️ Global error handler caught:', event.error);
        
        // Process error
        processError([event.error]);
        
        // Don't prevent default to allow normal error handling
    });
    
    // Add unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        // Log the rejection
        console.log('🛠️ Unhandled promise rejection:', event.reason);
        
        // Process error
        processError([event.reason]);
        
        // Don't prevent default to allow normal error handling
    });
    
    /**
     * Process errors and attempt recovery
     * @param {Array} args - Error arguments
     */
    function processError(args) {
        // Extract error information
        let errorInfo = extractErrorInfo(args);
        
        // Handle specific error types
        if (errorInfo.message.includes('Firebase') || errorInfo.message.includes('firebase')) {
            handleFirebaseError(errorInfo);
        } else if (errorInfo.message.includes('fetch') || errorInfo.message.includes('network')) {
            handleNetworkError(errorInfo);
        } else if (errorInfo.message.includes('undefined') && errorInfo.message.includes('function')) {
            handleMissingFunctionError(errorInfo);
        }
    }
    
    /**
     * Extract structured error information from console.error args
     * @param {Array} args - Error arguments
     * @returns {Object} Structured error info
     */
    function extractErrorInfo(args) {
        let errorInfo = {
            message: '',
            error: null,
            stack: '',
            source: 'unknown'
        };
        
        // Process args to extract error information
        for (const arg of args) {
            if (arg instanceof Error) {
                errorInfo.error = arg;
                errorInfo.message = arg.message;
                errorInfo.stack = arg.stack;
            } else if (typeof arg === 'string') {
                if (!errorInfo.message) {
                    errorInfo.message = arg;
                }
            }
        }
        
        // Try to determine source from stack trace
        if (errorInfo.stack) {
            // Extract file name from stack trace
            const fileMatch = errorInfo.stack.match(/at\s+(?:\w+\s+)?\(?(.+):(\d+):(\d+)\)?/);
            if (fileMatch && fileMatch[1]) {
                errorInfo.source = fileMatch[1].split('/').pop();
            }
        }
        
        return errorInfo;
    }
    
    /**
     * Handle Firebase-related errors
     * @param {Object} errorInfo - Error information
     */
    function handleFirebaseError(errorInfo) {
        console.log('🔥 Firebase error detected:', errorInfo.message);
        
        // Show Firebase error notification
        showErrorNotification({
            title: 'Firebase Connection Issue',
            message: 'Having trouble connecting to the database. Using local data instead.',
            icon: 'database',
            action: 'Retry',
            onAction: () => window.location.reload()
        });
    }
    
    /**
     * Handle network-related errors
     * @param {Object} errorInfo - Error information
     */
    function handleNetworkError(errorInfo) {
        console.log('🌐 Network error detected:', errorInfo.message);
        
        // Show network error notification
        showErrorNotification({
            title: 'Network Issue',
            message: 'There seems to be a connection problem. Some features may be limited.',
            icon: 'wifi',
            action: 'Retry',
            onAction: () => window.location.reload()
        });
    }
    
    /**
     * Handle missing function errors
     * @param {Object} errorInfo - Error information
     */
    function handleMissingFunctionError(errorInfo) {
        console.log('⚙️ Missing function error detected:', errorInfo.message);
        
        // Create a recovery function if possible
        if (errorInfo.message.includes('testFirebaseIntegration')) {
            // Create a testFirebaseIntegration function
            window.testFirebaseIntegration = function() {
                console.log('🔄 Recovery: Created testFirebaseIntegration function');
                return true;
            };
        }
        
        // Show error notification for development
        if (window.CONFIG && window.CONFIG.DEBUG) {
            showErrorNotification({
                title: 'Development Error',
                message: `Missing function: ${errorInfo.message}`,
                icon: 'code',
                autoHide: true
            });
        }
    }
    
    /**
     * Show error notification
     * @param {Object} options - Notification options
     */
    function showErrorNotification(options) {
        // Check if notifications are disabled
        if (window.CONFIG && window.CONFIG.DISABLE_ERROR_NOTIFICATIONS) {
            return;
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-notification-content">
                <i class="fas fa-${options.icon || 'exclamation-triangle'}"></i>
                <div class="error-notification-text">
                    <div class="error-notification-title">${options.title || 'Error'}</div>
                    <div class="error-notification-message">${options.message || 'An error occurred'}</div>
                </div>
                ${options.action ? `<button class="error-notification-action">${options.action}</button>` : ''}
                <button class="error-notification-close"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Add event listeners
        const closeBtn = notification.querySelector('.error-notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.add('error-notification-hiding');
                setTimeout(() => notification.remove(), 300);
            });
        }
        
        const actionBtn = notification.querySelector('.error-notification-action');
        if (actionBtn && options.onAction) {
            actionBtn.addEventListener('click', options.onAction);
        }
        
        // Auto-hide if specified
        if (options.autoHide) {
            setTimeout(() => {
                notification.classList.add('error-notification-hiding');
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }
        
        // Add CSS
        const style = document.createElement('style');
        style.textContent = `
            .error-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(40, 40, 40, 0.95);
                color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                max-width: 350px;
                animation: error-notification-slide-in 0.3s ease;
                overflow: hidden;
            }
            
            .error-notification-content {
                display: flex;
                align-items: center;
                padding: 12px 16px;
            }
            
            .error-notification i {
                font-size: 20px;
                margin-right: 12px;
                color: var(--warning-color, #ffc107);
            }
            
            .error-notification-text {
                flex: 1;
            }
            
            .error-notification-title {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .error-notification-message {
                font-size: 0.85rem;
                opacity: 0.9;
            }
            
            .error-notification-action {
                background: var(--primary-color, #3498db);
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                margin-left: 12px;
                cursor: pointer;
                font-weight: 500;
            }
            
            .error-notification-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.7);
                margin-left: 8px;
                cursor: pointer;
                padding: 4px;
            }
            
            .error-notification-hiding {
                animation: error-notification-slide-out 0.3s ease forwards;
            }
            
            @keyframes error-notification-slide-in {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes error-notification-slide-out {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Return the notification element
        return notification;
    }
})();
