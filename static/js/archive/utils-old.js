/**
 * Utility Functions Module - Consolidated
 * Bridge between ES6 core/utils.js and global window.Utils for backward compatibility
 * 
 * This file now imports from core/utils.js and exposes utilities globally
 * for templates and legacy code that expects window.Utils
 */

// Import core utilities (this will be transformed for non-module environments)
let coreUtils = null;
try {
    // Try to import core utilities
    import('./core/utils.js').then(module => {
        coreUtils = module.utils;
        // Expose core utilities globally
        if (coreUtils) {
            window.utils = coreUtils;
        }
    }).catch(() => {
        console.warn('⚠️ Could not import core/utils.js, using fallback utilities');
    });
} catch (e) {
    console.warn('⚠️ ES6 modules not supported, using fallback utilities');
}

// Prevent redeclaration errors on multiple script loads
if (typeof window.Utils === 'undefined') {
    console.log('🔧 Initializing Utils (consolidated with core/utils.js)...');
    
    window.Utils = {
        // Notification System
        showToast: function(message, type = 'info', duration = 3000) {
            // Toast implementation for backward compatibility
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-content">
                    <i class="fas fa-${this.getToastIcon(type)}"></i>
                    <span>${message}</span>
                </div>
                <button class="toast-close" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Style the toast
            Object.assign(toast.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                zIndex: '10000',
                minWidth: '300px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                animation: 'slideIn 0.3s ease-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            });
            
            document.body.appendChild(toast);
            
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, duration);
        },
        
        getToastIcon: function(type) {
            const icons = {
                success: 'check-circle',
                error: 'exclamation-circle', 
                warning: 'exclamation-triangle',
                info: 'info-circle'
            };
            return icons[type] || 'info-circle';
        },

        // DOM Manipulation Helpers
        dom: {
            /**
             * Get element by ID with error handling
         * @param {string} id - Element ID
         * @returns {HTMLElement|null}
         */
        getElementById(id) {
            try {
                return document.getElementById(id);
            } catch (error) {
                console.error(`Error getting element with ID ${id}:`, error);
                return null;
            }
        },

        /**
         * Get elements by class name
         * @param {string} className - Class name
         * @param {HTMLElement} parent - Parent element (optional)
         * @returns {NodeList}
         */
        getElementsByClass(className, parent = document) {
            return parent.getElementsByClassName(className);
        },

        /**
         * Query selector with error handling
         * @param {string} selector - CSS selector
         * @param {HTMLElement} parent - Parent element (optional)
         * @returns {HTMLElement|null}
         */
        querySelector(selector, parent = document) {
            try {
                return parent.querySelector(selector);
            } catch (error) {
                console.error(`Error with selector ${selector}:`, error);
                return null;
            }
        },

        /**
         * Query all selectors
         * @param {string} selector - CSS selector
         * @param {HTMLElement} parent - Parent element (optional)
         * @returns {NodeList}
         */
        querySelectorAll(selector, parent = document) {
            try {
                return parent.querySelectorAll(selector);
            } catch (error) {
                console.error(`Error with selector ${selector}:`, error);
                return [];
            }
        },

        /**
         * Add class to element
         * @param {HTMLElement} element 
         * @param {string} className 
         */
        addClass(element, className) {
            if (element && element.classList) {
                element.classList.add(className);
            }
        },

        /**
         * Remove class from element
         * @param {HTMLElement} element 
         * @param {string} className 
         */
        removeClass(element, className) {
            if (element && element.classList) {
                element.classList.remove(className);
            }
        },

        /**
         * Toggle class on element
         * @param {HTMLElement} element 
         * @param {string} className 
         */
        toggleClass(element, className) {
            if (element && element.classList) {
                element.classList.toggle(className);
            }
        },

        /**
         * Show element
         * @param {HTMLElement} element 
         */
        show(element) {
            if (element) {
                element.style.display = '';
                this.removeClass(element, 'hidden');
            }
        },

        /**
         * Hide element
         * @param {HTMLElement} element 
         */
        hide(element) {
            if (element) {
                element.style.display = 'none';
            }
        },

        /**
         * Create element with attributes
         * @param {string} tag - HTML tag
         * @param {Object} attributes - Element attributes
         * @param {string} textContent - Text content
         * @returns {HTMLElement}
         */
        createElement(tag, attributes = {}, textContent = '') {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            if (textContent) {
                element.textContent = textContent;
            }
            
            return element;
        }
    },

    // Validation Functions
    validation: {
        /**
         * Check if value is empty
         * @param {*} value 
         * @returns {boolean}
         */
        isEmpty(value) {
            return value === null || value === undefined || value === '' || 
                   (Array.isArray(value) && value.length === 0) ||
                   (typeof value === 'object' && Object.keys(value).length === 0);
        },

        /**
         * Validate email format
         * @param {string} email 
         * @returns {boolean}
         */
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        /**
         * Validate password strength
         * @param {string} password 
         * @returns {Object}
         */
        validatePassword(password) {
            const minLength = 8;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            const isValid = password.length >= minLength && hasUpperCase && 
                           hasLowerCase && hasNumbers && hasSpecialChar;
            
            return {
                isValid,
                issues: {
                    minLength: password.length < minLength,
                    hasUpperCase: !hasUpperCase,
                    hasLowerCase: !hasLowerCase,
                    hasNumbers: !hasNumbers,
                    hasSpecialChar: !hasSpecialChar
                }
            };
        },

        /**
         * Sanitize input string
         * @param {string} input 
         * @returns {string}
         */
        sanitizeInput(input) {
            if (typeof input !== 'string') return '';
            return input.replace(/[<>]/g, '').trim();
        }
    },

    // Formatting Utilities
    format: {
        /**
         * Format date to readable string
         * @param {Date|string} date 
         * @returns {string}
         */
        formatDate(date) {
            try {
                const dateObj = new Date(date);
                return dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (error) {
                console.error('Error formatting date:', error);
                return 'Invalid Date';
            }
        },

        /**
         * Format time to readable string
         * @param {Date|string} date 
         * @returns {string}
         */
        formatTime(date) {
            try {
                const dateObj = new Date(date);
                return dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (error) {
                console.error('Error formatting time:', error);
                return 'Invalid Time';
            }
        },

        /**
         * Capitalize first letter
         * @param {string} str 
         * @returns {string}
         */
        capitalize(str) {
            if (typeof str !== 'string') return '';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },

        /**
         * Format number with commas
         * @param {number} num 
         * @returns {string}
         */
        formatNumber(num) {
            return new Intl.NumberFormat().format(num);
        },

        /**
         * Truncate text with ellipsis
         * @param {string} text 
         * @param {number} maxLength 
         * @returns {string}
         */
        truncateText(text, maxLength) {
            if (typeof text !== 'string') return '';
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        }
    },

    // Error Handling Wrapper
    error: {
        /**
         * Wrap function with error handling
         * @param {Function} fn 
         * @param {string} context 
         * @returns {Function}
         */
        wrap(fn, context = 'Unknown') {
            return function(...args) {
                try {
                    return fn.apply(this, args);
                } catch (error) {
                    console.error(`Error in ${context}:`, error);
                    return null;
                }
            };
        },

        /**
         * Log error with context
         * @param {Error} error 
         * @param {string} context 
         */
        log(error, context = 'Application') {
            console.error(`[${context}] Error:`, {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        },

        /**
         * Handle async errors
         * @param {Promise} promise 
         * @param {string} context 
         * @returns {Promise}
         */
        async handleAsync(promise, context = 'Async Operation') {
            try {
                return await promise;
            } catch (error) {
                this.log(error, context);
                throw error;
            }
        }
    },

    // General Utilities
    /**
     * Debounce function calls
     * @param {Function} func 
     * @param {number} wait 
     * @returns {Function}
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
     * Throttle function calls
     * @param {Function} func 
     * @param {number} limit 
     * @returns {Function}
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Generate unique ID
     * @param {string} prefix 
     * @returns {string}
     */
    generateId(prefix = 'id') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Deep clone object
     * @param {*} obj 
     * @returns {*}
     */
    deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            console.error('Error deep cloning object:', error);
            return obj;
        }
    }
};

    // Export for module use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = window.Utils;
    }
    
    console.log('✅ Utils created successfully');
} else {
    console.log('ℹ️ Utils already exists, skipping redeclaration');
}

// Always ensure Utils is available globally
if (!window.Utils) {
    console.error('❌ Utils failed to initialize properly');
} else {
    console.log('✅ Utils is available globally');
}
