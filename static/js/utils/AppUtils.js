/**
 * AppUtils - Utility functions for the Code with Morais Application
 */

const AppUtils = {
    /**
     * Format a date to a readable string
     * @param {string|Date} dateInput - Date to format
     * @param {string} format - Format string (default: 'short')
     * @returns {string} - Formatted date string
     */
    formatDate: function(dateInput, format = 'short') {
        if (!dateInput) return '';
        
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        
        if (isNaN(date.getTime())) return 'Invalid date';
        
        switch(format) {
            case 'short':
                return date.toLocaleDateString();
            case 'long':
                return date.toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            case 'time':
                return date.toLocaleTimeString();
            case 'full':
                return date.toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }) + ' ' + date.toLocaleTimeString();
            default:
                return date.toLocaleDateString();
        }
    },
    
    /**
     * Check if a value is empty (null, undefined, empty string, empty array or object)
     * @param {*} value - Value to check
     * @returns {boolean} - True if empty, false otherwise
     */
    isEmpty: function(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string' && value.trim() === '') return true;
        if (Array.isArray(value) && value.length === 0) return true;
        if (typeof value === 'object' && Object.keys(value).length === 0) return true;
        return false;
    },
    
    /**
     * Generate a random ID
     * @param {number} length - Length of the ID (default: 8)
     * @returns {string} - Random ID
     */
    generateId: function(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let id = '';
        for (let i = 0; i < length; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    },
    
    /**
     * Debounce a function call
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },
    
    /**
     * Format a number with commas
     * @param {number} number - Number to format
     * @returns {string} - Formatted number
     */
    formatNumber: function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    /**
     * Truncate text to a specified length
     * @param {string} text - Text to truncate
     * @param {number} length - Max length
     * @returns {string} - Truncated text
     */
    truncateText: function(text, length = 100) {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },
    
    /**
     * Safely access nested object properties
     * @param {Object} obj - Object to access
     * @param {string} path - Property path (e.g. 'user.profile.name')
     * @param {*} defaultValue - Default value if property doesn't exist
     * @returns {*} - Property value or default value
     */
    getNestedValue: function(obj, path, defaultValue = null) {
        if (!obj || !path) return defaultValue;
        
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result === null || result === undefined || !result.hasOwnProperty(key)) {
                return defaultValue;
            }
            result = result[key];
        }
        
        return result === undefined ? defaultValue : result;
    },

    /**
     * Calculate streak based on daily completions
     * @param {Array} completionDates - Array of ISO date strings when challenges were completed
     * @returns {number} - Current streak count
     */
    calculateStreak: function(completionDates) {
        if (!completionDates || !Array.isArray(completionDates) || completionDates.length === 0) {
            return 0;
        }

        // Sort dates in descending order (newest first)
        const sortedDates = [...completionDates].map(d => new Date(d)).sort((a, b) => b - a);
        
        // Get today and yesterday dates (without time)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if most recent completion is today or yesterday
        const mostRecent = new Date(sortedDates[0]);
        mostRecent.setHours(0, 0, 0, 0);
        
        if (mostRecent < yesterday) {
            // Streak broken - most recent completion is older than yesterday
            return 0;
        }

        // Count consecutive days
        let streak = 1; // Start with 1 for the most recent day
        let currentDate = mostRecent;
        
        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i]);
            prevDate.setHours(0, 0, 0, 0);
            
            // Check if this date is exactly one day before current date
            const expectedPrevDate = new Date(currentDate);
            expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
            
            if (prevDate.getTime() === expectedPrevDate.getTime()) {
                streak++;
                currentDate = prevDate;
            } else if (prevDate.getTime() === currentDate.getTime()) {
                // Same day, ignore duplicate
                continue;
            } else {
                // Gap in streak
                break;
            }
        }
        
        return streak;
    },
    
    /**
     * Format XP or PyCoins with appropriate styling
     * @param {number} amount - Amount to format
     * @param {string} type - 'xp' or 'pycoins'
     * @returns {string} - Formatted HTML string
     */
    formatReward: function(amount, type = 'xp') {
        if (typeof amount !== 'number') return '';
        
        const formattedAmount = this.formatNumber(amount);
        
        if (type.toLowerCase() === 'xp') {
            return `<span class="xp-reward">${formattedAmount} XP</span>`;
        } else if (type.toLowerCase() === 'pycoins') {
            return `<span class="pycoins-reward">${formattedAmount} <i class="fas fa-coins"></i></span>`;
        }
        
        return formattedAmount;
    },
    
    /**
     * Get user-friendly time remaining until next challenge
     * @param {Date|string} nextChallengeTime - Time when next challenge becomes available
     * @returns {string} - Formatted time remaining
     */
    getTimeUntilNextChallenge: function(nextChallengeTime) {
        if (!nextChallengeTime) return 'Unknown';
        
        const next = typeof nextChallengeTime === 'string' ? new Date(nextChallengeTime) : nextChallengeTime;
        const now = new Date();
        
        if (isNaN(next.getTime())) return 'Invalid date';
        
        // If next challenge is in the past, it's available now
        if (next <= now) return 'Available now';
        
        const diffMs = next - now;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHrs > 23) {
            const diffDays = Math.floor(diffHrs / 24);
            return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        }
        
        if (diffHrs > 0) {
            return `${diffHrs}h ${diffMins}m`;
        }
        
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    },
    
    /**
     * Store challenge completion in localStorage for offline tracking
     * @param {string} challengeId - ID of the completed challenge
     * @param {Date} completionDate - Date of completion (defaults to now)
     */
    trackChallengeCompletion: function(challengeId, completionDate = new Date()) {
        if (!challengeId) return;
        
        try {
            // Get existing completions
            const completionsJson = localStorage.getItem('challenge_completions') || '{}';
            const completions = JSON.parse(completionsJson);
            
            // Store completion with timestamp
            completions[challengeId] = {
                completedAt: completionDate.toISOString(),
                synced: false
            };
            
            // Save back to localStorage
            localStorage.setItem('challenge_completions', JSON.stringify(completions));
        } catch (error) {
            console.error('Error tracking challenge completion:', error);
        }
    },
    
    /**
     * Check if a challenge has been completed today
     * @param {string} challengeId - ID of the challenge to check
     * @returns {boolean} - True if completed today
     */
    isChallengeCompletedToday: function(challengeId) {
        if (!challengeId) return false;
        
        try {
            // Get existing completions
            const completionsJson = localStorage.getItem('challenge_completions') || '{}';
            const completions = JSON.parse(completionsJson);
            
            if (!completions[challengeId]) return false;
            
            // Get completion date and today's date (without time)
            const completionDate = new Date(completions[challengeId].completedAt);
            completionDate.setHours(0, 0, 0, 0);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Check if completion was today
            return completionDate.getTime() === today.getTime();
        } catch (error) {
            console.error('Error checking challenge completion:', error);
            return false;
        }
    }
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppUtils;
}

// For browser use
if (typeof window !== 'undefined') {
    window.AppUtils = AppUtils;
}
