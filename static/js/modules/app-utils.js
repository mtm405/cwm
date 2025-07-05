/**
 * App Utils - Core utility functions for the application
 * Code with Morais - Application Utilities
 */

class AppUtils {
    constructor() {
        this.initialized = false;
        this.init();
    }

    /**
     * Initialize AppUtils
     */
    init() {
        if (this.initialized) return;
        
        this.initialized = true;
        console.log('✅ AppUtils initialized');
    }

    /**
     * Show notification to user
     * @param {string} message - Message to display
     * @param {string} type - Type of notification (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    showNotification(message, type = 'info', duration = 3000) {
        // Use existing notification system if available
        if (window.Utils && window.Utils.showNotification) {
            return window.Utils.showNotification(message, type, duration);
        }

        // Fallback notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 24px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            max-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;

        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            float: right;
            margin-left: 10px;
            opacity: 0.7;
        `;
        closeBtn.onclick = () => this.removeNotification(notification);

        notification.innerHTML = message;
        notification.appendChild(closeBtn);
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        return notification;
    }

    /**
     * Remove notification
     * @param {Element} notification - Notification element to remove
     */
    removeNotification(notification) {
        if (!notification || !notification.parentNode) return;

        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Handle errors with user-friendly messages
     * @param {Error} error - Error object
     * @param {string} context - Context where error occurred
     * @param {boolean} showToUser - Whether to show error to user
     */
    handleError(error, context = 'Unknown', showToUser = true) {
        console.error(`❌ Error in ${context}:`, error);

        if (showToUser) {
            const userMessage = this.getUserFriendlyErrorMessage(error);
            this.showNotification(userMessage, 'error', 5000);
        }

        // Report to analytics if available
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: `${context}: ${error.message}`,
                fatal: false
            });
        }
    }

    /**
     * Get user-friendly error message
     * @param {Error} error - Error object
     * @returns {string} User-friendly error message
     */
    getUserFriendlyErrorMessage(error) {
        if (!error) return 'An unknown error occurred';

        const message = error.message || '';

        // Network errors
        if (message.includes('fetch') || message.includes('NetworkError')) {
            return 'Network connection issue. Please check your internet connection.';
        }

        // Authentication errors
        if (message.includes('Unauthorized') || message.includes('401')) {
            return 'Session expired. Please log in again.';
        }

        // Permission errors
        if (message.includes('Forbidden') || message.includes('403')) {
            return 'You don\'t have permission to perform this action.';
        }

        // Server errors
        if (message.includes('500') || message.includes('Internal Server Error')) {
            return 'Server error. Please try again later.';
        }

        // Module/import errors
        if (message.includes('Cannot use import statement') || message.includes('Unexpected token')) {
            return 'Loading error. Please refresh the page.';
        }

        // Generic fallback
        return 'An error occurred. Please try again.';
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                this.showNotification('Copied to clipboard!', 'success');
                return true;
            } else {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                
                const success = document.execCommand('copy');
                document.body.removeChild(textarea);
                
                if (success) {
                    this.showNotification('Copied to clipboard!', 'success');
                    return true;
                } else {
                    throw new Error('Copy command failed');
                }
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            this.showNotification('Failed to copy to clipboard', 'error');
            return false;
        }
    }

    /**
     * Generate unique ID
     * @param {string} prefix - Prefix for the ID
     * @returns {string} Unique ID
     */
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Debounce function
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
    }

    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Format date to readable string
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return 'Unknown date';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'Invalid date';
        
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Safe JSON parse
     * @param {string} jsonString - JSON string to parse
     * @param {*} fallback - Fallback value if parsing fails
     * @returns {*} Parsed object or fallback
     */
    safeJSONParse(jsonString, fallback = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('Failed to parse JSON:', error);
            return fallback;
        }
    }

    /**
     * Safe JSON stringify
     * @param {*} obj - Object to stringify
     * @param {string} fallback - Fallback string if stringify fails
     * @returns {string} JSON string or fallback
     */
    safeJSONStringify(obj, fallback = '{}') {
        try {
            return JSON.stringify(obj);
        } catch (error) {
            console.warn('Failed to stringify JSON:', error);
            return fallback;
        }
    }

    /**
     * Wait for specified time
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise} Promise that resolves after specified time
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check if element is in viewport
     * @param {Element} element - Element to check
     * @returns {boolean} True if element is in viewport
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
    }

    /**
     * Get browser info
     * @returns {object} Browser information
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        const browser = {
            name: 'Unknown',
            version: 'Unknown',
            platform: navigator.platform
        };

        // Detect browser
        if (ua.includes('Chrome')) {
            browser.name = 'Chrome';
            browser.version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Firefox')) {
            browser.name = 'Firefox';
            browser.version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Safari')) {
            browser.name = 'Safari';
            browser.version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.includes('Edge')) {
            browser.name = 'Edge';
            browser.version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
        }

        return browser;
    }

    /**
     * Validate form data
     * @param {object} data - Form data to validate
     * @param {object} rules - Validation rules
     * @returns {object} Validation result
     */
    validateForm(data, rules) {
        const errors = {};
        let isValid = true;

        for (const [field, rule] of Object.entries(rules)) {
            const value = data[field];

            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = `${field} is required`;
                isValid = false;
                continue;
            }

            if (rule.email && value && !this.isValidEmail(value)) {
                errors[field] = `${field} must be a valid email`;
                isValid = false;
            }

            if (rule.minLength && value && value.length < rule.minLength) {
                errors[field] = `${field} must be at least ${rule.minLength} characters`;
                isValid = false;
            }

            if (rule.maxLength && value && value.length > rule.maxLength) {
                errors[field] = `${field} must not exceed ${rule.maxLength} characters`;
                isValid = false;
            }
        }

        return { isValid, errors };
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Create global instance
window.AppUtils = AppUtils;
window.appUtils = new AppUtils();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppUtils;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return AppUtils; });
}

console.log('✅ AppUtils module loaded');
