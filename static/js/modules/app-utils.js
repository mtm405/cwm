/**
 * App Utils - Common utilities and helper functions
 * Code with Morais - Utility Functions
 */

class AppUtils {
    constructor() {
        this.init();
    }
    
    /**
     * Initialize utility functions
     */
    init() {
        this.setupGlobalHelpers();
        this.setupEventDelegation();
        this.setupKeyboardShortcuts();
        this.setupSmoothScrolling();
        this.setupNotificationSystem();
        console.log('🔧 App Utils initialized');
    }
    
    /**
     * Set up global helper functions
     */
    setupGlobalHelpers() {
        // Expose common utilities globally
        window.showNotification = this.showNotification.bind(this);
        window.updateUserStats = this.updateUserStats.bind(this);
        window.formatTime = this.formatTime.bind(this);
        window.formatNumber = this.formatNumber.bind(this);
        window.debounce = this.debounce.bind(this);
        window.throttle = this.throttle.bind(this);
    }
    
    /**
     * Set up event delegation for common UI elements
     */
    setupEventDelegation() {
        document.addEventListener('click', (e) => {
            // Handle copy buttons
            if (e.target.classList.contains('copy-btn')) {
                this.handleCopyButton(e.target);
            }
            
            // Handle modal close buttons
            if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
                this.closeModal(e.target.closest('.modal-overlay'));
            }
            
            // Handle external links
            if (e.target.tagName === 'A' && e.target.target === '_blank') {
                this.trackExternalLink(e.target.href);
            }
        });
    }
    
    /**
     * Set up global keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Escape to close modals
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.focusSearch();
            }
            
            // Ctrl/Cmd + / for help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.showKeyboardShortcuts();
            }
        });
    }
    
    /**
     * Set up smooth scrolling for anchor links
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    /**
     * Set up notification system
     */
    setupNotificationSystem() {
        // Create notification container if it doesn't exist
        if (!document.querySelector('.notification-container')) {
            const container = document.createElement('div');
            container.className = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'success', duration = 4000) {
        const container = document.querySelector('.notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 300px;
            max-width: 500px;
            pointer-events: auto;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 14px;
            line-height: 1.4;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" style="margin-left: auto; background: none; border: none; color: white; cursor: pointer; padding: 0; font-size: 16px;">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        container.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
        
        return notification;
    }
    
    /**
     * Remove notification
     */
    removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    /**
     * Get notification color based on type
     */
    getNotificationColor(type) {
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };
        return colors[type] || colors.info;
    }
    
    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }
    
    /**
     * Update user stats in UI
     */
    updateUserStats(xp = 0, coins = 0) {
        const xpElement = document.getElementById('user-xp');
        const coinsElement = document.getElementById('user-coins');
        
        if (xpElement && xp > 0) {
            const currentXP = parseInt(xpElement.textContent) || 0;
            const newXP = currentXP + xp;
            this.animateNumberChange(xpElement, currentXP, newXP);
        }
        
        if (coinsElement && coins > 0) {
            const currentCoins = parseInt(coinsElement.textContent) || 0;
            const newCoins = currentCoins + coins;
            this.animateNumberChange(coinsElement, currentCoins, newCoins);
        }
        
        if (xp > 0 || coins > 0) {
            this.showNotification(`+${xp} XP, +${coins} coins earned!`, 'success');
        }
    }
    
    /**
     * Animate number change in element
     */
    animateNumberChange(element, from, to, duration = 1000) {
        const startTime = performance.now();
        const change = to - from;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + (change * easeOut));
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Handle copy button clicks
     */
    async handleCopyButton(button) {
        try {
            const targetSelector = button.getAttribute('data-copy-target');
            const targetElement = targetSelector ? 
                document.querySelector(targetSelector) : 
                button.parentNode.querySelector('code, pre');
            
            if (!targetElement) return;
            
            const textToCopy = targetElement.textContent;
            await navigator.clipboard.writeText(textToCopy);
            
            // Show feedback
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
            
        } catch (error) {
            console.error('Failed to copy text:', error);
            this.showNotification('Failed to copy text', 'error');
        }
    }
    
    /**
     * Close modal
     */
    closeModal(modalElement) {
        if (!modalElement) return;
        
        modalElement.classList.add('closing');
        setTimeout(() => {
            modalElement.style.display = 'none';
            modalElement.classList.remove('active', 'closing');
        }, 300);
    }
    
    /**
     * Close all open modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal-overlay.active');
        modals.forEach(modal => this.closeModal(modal));
    }
    
    /**
     * Focus search input
     */
    focusSearch() {
        const searchInput = document.querySelector('#search-input, .search-input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        } else {
            // If no search input, try to open search
            const searchToggle = document.querySelector('.search-toggle');
            if (searchToggle) {
                searchToggle.click();
            }
        }
    }
    
    /**
     * Show keyboard shortcuts help
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Ctrl/Cmd + K', description: 'Open search' },
            { key: 'Ctrl/Cmd + /', description: 'Show this help' },
            { key: 'Ctrl/Cmd + Shift + T', description: 'Toggle theme' },
            { key: 'Escape', description: 'Close modals/dropdowns' },
            { key: 'Tab', description: 'Navigate through elements' },
            { key: 'Enter', description: 'Activate focused element' }
        ];
        
        const shortcutsList = shortcuts.map(s => 
            `<div class="shortcut-item">
                <kbd>${s.key}</kbd>
                <span>${s.description}</span>
            </div>`
        ).join('');
        
        this.showModal('Keyboard Shortcuts', `
            <div class="shortcuts-help">
                ${shortcutsList}
            </div>
            <style>
                .shortcuts-help { display: flex; flex-direction: column; gap: 8px; }
                .shortcut-item { display: flex; justify-content: space-between; align-items: center; }
                .shortcut-item kbd { 
                    background: #f1f1f1; 
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    font-size: 12px; 
                    font-family: monospace;
                }
            </style>
        `);
    }
    
    /**
     * Show modal with custom content
     */
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
        
        return modal;
    }
    
    /**
     * Track external link clicks
     */
    trackExternalLink(url) {
        // Analytics tracking would go here
        console.log('External link clicked:', url);
    }
    
    /**
     * Format time duration
     */
    formatTime(seconds) {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        return `${Math.round(seconds / 3600)}h`;
    }
    
    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * Debounce function
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
    }
    
    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    /**
     * Get query parameters as object
     */
    getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
    
    /**
     * Generate random ID
     */
    generateId(prefix = 'id') {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Deep clone object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(this.deepClone);
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
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppUtils;
}

// Global reference for template use
window.AppUtils = AppUtils;
