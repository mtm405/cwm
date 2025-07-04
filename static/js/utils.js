/**
 * Consolidated Utilities Module - Complete JavaScript Utility Library
 * Code with Morais - Python Learning Platform
 * 
 * This file consolidates all utility functions from:
 * - static/js/utils.js
 * - static/js/core/utils.js  
 * - static/js/modules/app-utils.js
 * 
 * Provides both ES6 module exports and global window.Utils for backward compatibility
 */

// ES6 Module Export
export const utils = {
    
    // ===== PERFORMANCE UTILITIES =====
    
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function to limit function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // ===== STRING UTILITIES =====
    
    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHTML(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * Capitalize first letter of string
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    // ===== VALIDATION UTILITIES =====
    
    /**
     * Check if value is empty
     * @param {*} value - Value to check
     * @returns {boolean} True if empty
     */
    isEmpty(value) {
        return value === null || value === undefined || value === '' || 
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result with score and feedback
     */
    validatePassword(password) {
        const result = {
            score: 0,
            feedback: [],
            isValid: false
        };

        if (!password) {
            result.feedback.push('Password is required');
            return result;
        }

        if (password.length >= 8) result.score += 1;
        else result.feedback.push('Password must be at least 8 characters');

        if (/[A-Z]/.test(password)) result.score += 1;
        else result.feedback.push('Password must contain uppercase letters');

        if (/[a-z]/.test(password)) result.score += 1;
        else result.feedback.push('Password must contain lowercase letters');

        if (/\d/.test(password)) result.score += 1;
        else result.feedback.push('Password must contain numbers');

        if (/[^A-Za-z0-9]/.test(password)) result.score += 1;
        else result.feedback.push('Password must contain special characters');

        result.isValid = result.score >= 4;
        return result;
    },

    // ===== OBJECT UTILITIES =====
    
    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
        return obj;
    },

    /**
     * Merge objects deeply
     * @param {Object} target - Target object
     * @param {Object} source - Source object
     * @returns {Object} Merged object
     */
    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    result[key] = this.deepMerge(result[key] || {}, source[key]);
                } else {
                    result[key] = source[key];
                }
            }
        }
        return result;
    },

    // ===== ID & TIME UTILITIES =====
    
    /**
     * Generate unique ID
     * @param {string} prefix - Prefix for the ID
     * @returns {string} Unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Create a promise that resolves after specified time
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise} Promise that resolves after timeout
     */
    asyncTimeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // ===== FORMATTING UTILITIES =====
    
    /**
     * Format date to readable string
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Format time to readable string
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted time
     */
    formatTime(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Format duration from seconds
     * @param {number} seconds - Duration in seconds
     * @returns {string} Formatted duration
     */
    formatDuration(seconds) {
        if (!seconds || seconds < 0) return '0s';
        if (seconds < 60) return `${Math.round(seconds)}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    },

    /**
     * Format number with commas
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    formatNumber(num) {
        if (!num && num !== 0) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // ===== DOM UTILITIES =====
    
    /**
     * Check if element is in viewport
     * @param {Element} element - Element to check
     * @returns {boolean} True if in viewport
     */
    isInViewport(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Get query parameters as object
     * @returns {Object} Query parameters
     */
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const result = document.execCommand('copy');
                document.body.removeChild(textArea);
                return result;
            }
        } catch (error) {
            console.error('Failed to copy text:', error);
            return false;
        }
    },

    // ===== LOCAL STORAGE UTILITIES =====
    
    storage: {
        /**
         * Set item in localStorage with error handling
         * @param {string} key - Storage key
         * @param {*} value - Value to store
         * @returns {boolean} Success status
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.error('Failed to set localStorage item:', error);
                return false;
            }
        },

        /**
         * Get item from localStorage with error handling
         * @param {string} key - Storage key
         * @param {*} defaultValue - Default value if key doesn't exist
         * @returns {*} Retrieved value or default
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Failed to get localStorage item:', error);
                return defaultValue;
            }
        },

        /**
         * Remove item from localStorage
         * @param {string} key - Storage key
         * @returns {boolean} Success status
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Failed to remove localStorage item:', error);
                return false;
            }
        },

        /**
         * Clear all localStorage
         * @returns {boolean} Success status
         */
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Failed to clear localStorage:', error);
                return false;
            }
        }
    },

    // ===== ERROR HANDLING UTILITIES =====
    
    error: {
        /**
         * Wrap function with error handling
         * @param {Function} fn - Function to wrap
         * @param {string} context - Context for error logging
         * @returns {Function} Wrapped function
         */
        wrap(fn, context = 'Unknown') {
            return function(...args) {
                try {
                    return fn.apply(this, args);
                } catch (error) {
                    console.error(`[${context}] Error:`, error);
                    return null;
                }
            };
        },

        /**
         * Handle async errors
         * @param {Promise} promise - Promise to handle
         * @param {string} context - Context for error logging
         * @returns {Promise} Handled promise
         */
        async handleAsync(promise, context = 'Async Operation') {
            try {
                return await promise;
            } catch (error) {
                console.error(`[${context}] Async Error:`, error);
                return null;
            }
        },

        /**
         * Log error with context
         * @param {Error} error - Error to log
         * @param {string} context - Context information
         */
        log(error, context = 'Application') {
            console.error(`[${context}] Error:`, {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }
    },

    // ===== NOTIFICATION UTILITIES =====
    
    notification: {
        /**
         * Show toast notification
         * @param {string} message - Message to display
         * @param {string} type - Type of notification (success, error, warning, info)
         * @param {number} duration - Duration in milliseconds
         */
        show(message, type = 'info', duration = 3000) {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-${this.getIcon(type)}"></i>
                    <span>${message}</span>
                </div>
                <button class="notification-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Style the notification
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                minWidth: '300px',
                maxWidth: '500px',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: '10000',
                animation: 'slideInRight 0.3s ease-out'
            });

            // Add type-specific styling
            const styles = {
                success: { backgroundColor: '#d4edda', color: '#155724', borderLeft: '4px solid #28a745' },
                error: { backgroundColor: '#f8d7da', color: '#721c24', borderLeft: '4px solid #dc3545' },
                warning: { backgroundColor: '#fff3cd', color: '#856404', borderLeft: '4px solid #ffc107' },
                info: { backgroundColor: '#d1ecf1', color: '#0c5460', borderLeft: '4px solid #17a2b8' }
            };
            
            Object.assign(notification.style, styles[type] || styles.info);
            
            document.body.appendChild(notification);
            
            // Auto-remove after duration
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOutRight 0.3s ease-in';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }
            }, duration);
        },

        /**
         * Get icon for notification type
         * @param {string} type - Notification type
         * @returns {string} Icon class
         */
        getIcon(type) {
            const icons = {
                success: 'check-circle',
                error: 'exclamation-circle',
                warning: 'exclamation-triangle',
                info: 'info-circle'
            };
            return icons[type] || icons.info;
        }
    }
};

// ===== GLOBAL WINDOW UTILITIES (BACKWARD COMPATIBILITY) =====

// Prevent redeclaration errors on multiple script loads
if (typeof window !== 'undefined' && typeof window.Utils === 'undefined') {
    console.log('🔧 Initializing consolidated Utils...');
    
    // Create global Utils object
    window.Utils = {
        // Core utilities
        debounce: utils.debounce,
        throttle: utils.throttle,
        sanitizeHTML: utils.sanitizeHTML,
        capitalize: utils.capitalize,
        truncateText: utils.truncateText,
        isEmpty: utils.isEmpty,
        isValidEmail: utils.isValidEmail,
        validatePassword: utils.validatePassword,
        deepClone: utils.deepClone,
        deepMerge: utils.deepMerge,
        generateId: utils.generateId,
        asyncTimeout: utils.asyncTimeout,
        formatDate: utils.formatDate,
        formatTime: utils.formatTime,
        formatDuration: utils.formatDuration,
        formatNumber: utils.formatNumber,
        isInViewport: utils.isInViewport,
        getQueryParams: utils.getQueryParams,
        copyToClipboard: utils.copyToClipboard,
        
        // Namespaced utilities
        storage: utils.storage,
        error: utils.error,
        notification: utils.notification,
        
        // Backward compatibility aliases
        showToast: utils.notification.show,
        showNotification: utils.notification.show
    };
    
    // Also expose utils directly for ES6 imports
    window.utils = utils;
    
    console.log('✅ Consolidated Utils initialized successfully');
} else if (typeof window !== 'undefined') {
    console.log('ℹ️ Utils already exists, skipping redeclaration');
}

// CSS for notifications (inject into head)
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .notification {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            line-height: 1.4;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notification-close {
            position: absolute;
            top: 8px;
            right: 8px;
            background: none;
            border: none;
            cursor: pointer;
            opacity: 0.7;
            font-size: 12px;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
    `;
    
    if (!document.head.querySelector('style[data-utils-notifications]')) {
        style.setAttribute('data-utils-notifications', 'true');
        document.head.appendChild(style);
    }
}

// Export default for ES6 modules
export default utils;

console.log('✅ Consolidated utilities module loaded successfully');
