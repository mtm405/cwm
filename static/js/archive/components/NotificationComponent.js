/**
 * Notification Component
 * Handles various types of notifications including toasts, alerts, and persistent messages
 */

class NotificationComponent extends BaseComponent {
    constructor(options = {}) {
        const defaultOptions = {
            type: 'info', // info, success, warning, error
            message: '',
            title: '',
            duration: 5000,
            position: 'top-right', // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
            persistent: false,
            dismissible: true,
            showIcon: true,
            showProgress: true,
            maxVisible: 5,
            actions: [], // Array of action buttons
            autoInit: true,
            className: 'notification',
            template: null
        };

        super({ ...defaultOptions, ...options });

        // Notification-specific properties
        this.notifications = new Map();
        this.container = null;
        this.activeNotifications = [];
        this.notificationCounter = 0;

        // Create notification container
        this.createContainer();
    }

    /**
     * Initialize notification system
     */
    async onInit() {
        // Set up global notification listeners
        this.setupGlobalListeners();
        
        // Create default template if none provided
        if (!this.template) {
            this.template = this.createDefaultTemplate();
        }

        // Apply initial styling
        this.applyContainerStyles();

        if (this.options.debugMode) {
            console.log('[NotificationComponent] Initialized');
        }
    }

    /**
     * Create notification container
     */
    createContainer() {
        this.container = document.getElementById('notification-container');
        
        if (!this.container) {
            this.container = Utils.dom.createElement('div', {
                id: 'notification-container',
                className: `notification-container position-${this.options.position}`,
                'aria-live': 'polite',
                'aria-atomic': 'false'
            });
            
            document.body.appendChild(this.container);
        }

        this.element = this.container;
    }

    /**
     * Apply container styles based on position
     */
    applyContainerStyles() {
        const positions = {
            'top-right': { top: '20px', right: '20px' },
            'top-left': { top: '20px', left: '20px' },
            'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
            'bottom-right': { bottom: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' },
            'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
        };

        const style = positions[this.options.position];
        if (style) {
            Object.assign(this.container.style, {
                position: 'fixed',
                zIndex: '9999',
                pointerEvents: 'none',
                maxWidth: '400px',
                ...style
            });
        }
    }

    /**
     * Setup global event listeners
     */
    setupGlobalListeners() {
        // Listen for notification events
        eventBus.on(Constants.EVENTS.NOTIFICATION_SHOW, this.show.bind(this));
        eventBus.on(Constants.EVENTS.NOTIFICATION_HIDE, this.hide.bind(this));
        
        // Listen for auth events
        eventBus.on(Constants.EVENTS.USER_LOGIN, (data) => {
            if (data.status === 'success') {
                this.success(Constants.MESSAGES.LOGIN_SUCCESS);
            }
        });

        eventBus.on(Constants.EVENTS.USER_LOGOUT, () => {
            this.info(Constants.MESSAGES.LOGOUT_SUCCESS);
        });

        eventBus.on(Constants.EVENTS.AUTH_ERROR, (data) => {
            this.error(data.error || Constants.MESSAGES.GENERIC_ERROR);
        });
    }

    /**
     * Create default notification template
     */
    createDefaultTemplate() {
        return (data) => {
            const { id, type, title, message, showIcon, showProgress, actions, dismissible } = data;
            
            const iconMap = {
                info: '&#8505;',
                success: '&#10003;',
                warning: '&#9888;',
                error: '&#10007;'
            };

            return `
                <div class="notification notification-${type}" data-notification-id="${id}" role="alert">
                    <div class="notification-content">
                        ${showIcon ? `<div class="notification-icon">${iconMap[type] || iconMap.info}</div>` : ''}
                        <div class="notification-body">
                            ${title ? `<div class="notification-title">${Utils.format.capitalize(title)}</div>` : ''}
                            <div class="notification-message">${message}</div>
                            ${actions.length > 0 ? this.createActionsHTML(actions) : ''}
                        </div>
                        ${dismissible ? '<button class="notification-close" aria-label="Close notification">&times;</button>' : ''}
                    </div>
                    ${showProgress ? '<div class="notification-progress"><div class="notification-progress-bar"></div></div>' : ''}
                </div>
            `;
        };
    }

    /**
     * Create actions HTML
     * @param {Array} actions - Action buttons
     */
    createActionsHTML(actions) {
        if (!actions.length) return '';
        
        return `
            <div class="notification-actions">
                ${actions.map((action, index) => 
                    `<button class="notification-action" data-action-index="${index}">${action.label}</button>`
                ).join('')}
            </div>
        `;
    }

    /**
     * Show notification
     * @param {Object|string} options - Notification options or message string
     */
    show(options = {}) {
        // Handle string message
        if (typeof options === 'string') {
            options = { message: options };
        }

        // Merge with defaults
        const notificationData = {
            id: `notification_${++this.notificationCounter}`,
            type: this.options.type,
            message: this.options.message,
            title: this.options.title,
            duration: this.options.duration,
            persistent: this.options.persistent,
            dismissible: this.options.dismissible,
            showIcon: this.options.showIcon,
            showProgress: this.options.showProgress,
            actions: this.options.actions,
            ...options
        };

        // Check max visible limit
        if (this.activeNotifications.length >= this.options.maxVisible) {
            this.removeOldest();
        }

        // Create notification element
        const notificationElement = this.createNotificationElement(notificationData);
        
        // Store notification
        this.notifications.set(notificationData.id, {
            ...notificationData,
            element: notificationElement,
            startTime: Date.now()
        });

        // Add to active list
        this.activeNotifications.push(notificationData.id);

        // Add to container
        this.container.appendChild(notificationElement);

        // Animate in
        requestAnimationFrame(() => {
            Utils.dom.addClass(notificationElement, 'notification-show');
        });

        // Setup auto-dismiss timer
        if (!notificationData.persistent && notificationData.duration > 0) {
            this.setupAutoDismiss(notificationData.id, notificationData.duration);
        }

        // Setup progress bar
        if (notificationData.showProgress && !notificationData.persistent) {
            this.animateProgress(notificationData.id, notificationData.duration);
        }

        // Setup event listeners
        this.setupNotificationListeners(notificationData.id);

        this.emit('show', { notification: notificationData });

        return notificationData.id;
    }

    /**
     * Hide notification
     * @param {string} id - Notification ID
     */
    hide(id) {
        if (typeof id === 'object') {
            id = id.id;
        }

        const notification = this.notifications.get(id);
        if (!notification) return;

        const element = notification.element;
        
        // Animate out
        Utils.dom.addClass(element, 'notification-hide');
        
        // Remove after animation
        setTimeout(() => {
            this.removeNotification(id);
        }, 300);

        this.emit('hide', { notification });
    }

    /**
     * Remove notification from DOM and storage
     * @param {string} id - Notification ID
     */
    removeNotification(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        // Remove from DOM
        if (notification.element.parentNode) {
            notification.element.parentNode.removeChild(notification.element);
        }

        // Remove from storage
        this.notifications.delete(id);

        // Remove from active list
        const index = this.activeNotifications.indexOf(id);
        if (index > -1) {
            this.activeNotifications.splice(index, 1);
        }

        this.emit('remove', { notification });
    }

    /**
     * Remove oldest notification
     */
    removeOldest() {
        if (this.activeNotifications.length > 0) {
            const oldestId = this.activeNotifications[0];
            this.hide(oldestId);
        }
    }

    /**
     * Create notification DOM element
     * @param {Object} data - Notification data
     */
    createNotificationElement(data) {
        const div = document.createElement('div');
        div.innerHTML = this.template(data);
        const element = div.firstChild;
        
        // Make container interactive
        element.style.pointerEvents = 'auto';
        
        return element;
    }

    /**
     * Setup notification-specific event listeners
     * @param {string} id - Notification ID
     */
    setupNotificationListeners(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        const element = notification.element;

        // Close button
        const closeBtn = element.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide(id);
            });
        }

        // Action buttons
        const actionBtns = element.querySelectorAll('.notification-action');
        actionBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const action = notification.actions[index];
                if (action && typeof action.action === 'function') {
                    action.action(notification);
                }
                
                // Auto-hide unless action specifies otherwise
                if (!action.keepOpen) {
                    this.hide(id);
                }
            });
        });

        // Hover to pause auto-dismiss
        if (!notification.persistent) {
            element.addEventListener('mouseenter', () => {
                this.pauseAutoDismiss(id);
            });

            element.addEventListener('mouseleave', () => {
                this.resumeAutoDismiss(id);
            });
        }
    }

    /**
     * Setup auto-dismiss timer
     * @param {string} id - Notification ID
     * @param {number} duration - Duration in milliseconds
     */
    setupAutoDismiss(id, duration) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        notification.dismissTimer = setTimeout(() => {
            this.hide(id);
        }, duration);
    }

    /**
     * Pause auto-dismiss timer
     * @param {string} id - Notification ID
     */
    pauseAutoDismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.dismissTimer) return;

        clearTimeout(notification.dismissTimer);
        notification.pausedAt = Date.now();
        notification.remainingTime = notification.duration - (notification.pausedAt - notification.startTime);
    }

    /**
     * Resume auto-dismiss timer
     * @param {string} id - Notification ID
     */
    resumeAutoDismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification || !notification.pausedAt) return;

        notification.dismissTimer = setTimeout(() => {
            this.hide(id);
        }, notification.remainingTime);

        delete notification.pausedAt;
    }

    /**
     * Animate progress bar
     * @param {string} id - Notification ID
     * @param {number} duration - Duration in milliseconds
     */
    animateProgress(id, duration) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        const progressBar = notification.element.querySelector('.notification-progress-bar');
        if (!progressBar) return;

        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '0%';
    }

    // Convenience methods for different notification types
    
    /**
     * Show info notification
     * @param {string} message - Message
     * @param {Object} options - Additional options
     */
    info(message, options = {}) {
        return this.show({ ...options, message, type: 'info' });
    }

    /**
     * Show success notification
     * @param {string} message - Message
     * @param {Object} options - Additional options
     */
    success(message, options = {}) {
        return this.show({ ...options, message, type: 'success' });
    }

    /**
     * Show warning notification
     * @param {string} message - Message
     * @param {Object} options - Additional options
     */
    warning(message, options = {}) {
        return this.show({ ...options, message, type: 'warning' });
    }

    /**
     * Show error notification
     * @param {string} message - Message
     * @param {Object} options - Additional options
     */
    error(message, options = {}) {
        return this.show({ 
            ...options, 
            message, 
            type: 'error',
            duration: options.duration || 7000 // Longer duration for errors
        });
    }

    /**
     * Show persistent notification
     * @param {string} message - Message
     * @param {Object} options - Additional options
     */
    persistent(message, options = {}) {
        return this.show({ 
            ...options, 
            message, 
            persistent: true,
            showProgress: false
        });
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        this.activeNotifications.slice().forEach(id => {
            this.hide(id);
        });
    }

    /**
     * Clear notifications by type
     * @param {string} type - Notification type
     */
    clearByType(type) {
        this.activeNotifications.forEach(id => {
            const notification = this.notifications.get(id);
            if (notification && notification.type === type) {
                this.hide(id);
            }
        });
    }

    /**
     * Get active notifications
     * @returns {Array} Active notifications
     */
    getActive() {
        return this.activeNotifications.map(id => this.notifications.get(id));
    }

    /**
     * Get notification count by type
     * @param {string} type - Notification type
     * @returns {number} Count
     */
    getCountByType(type) {
        return this.getActive().filter(n => n.type === type).length;
    }

    /**
     * Update notification position
     * @param {string} position - New position
     */
    setPosition(position) {
        this.options.position = position;
        this.container.className = `notification-container position-${position}`;
        this.applyContainerStyles();
    }

    /**
     * Update max visible notifications
     * @param {number} maxVisible - Maximum visible notifications
     */
    setMaxVisible(maxVisible) {
        this.options.maxVisible = maxVisible;
        
        // Remove excess notifications
        while (this.activeNotifications.length > maxVisible) {
            this.removeOldest();
        }
    }

    /**
     * Component cleanup
     */
    async onDestroy() {
        this.clearAll();
        
        // Remove global listeners
        eventBus.off(Constants.EVENTS.NOTIFICATION_SHOW, this.show);
        eventBus.off(Constants.EVENTS.NOTIFICATION_HIDE, this.hide);
    }
}

// Create global notification instance
const notificationComponent = new NotificationComponent({
    position: window.Config?.ui?.notifications?.position || 'top-right',
    duration: window.Config?.ui?.notifications?.duration || 5000,
    maxVisible: window.Config?.ui?.notifications?.maxVisible || 5
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationComponent, notificationComponent };
} else {
    // Make available globally
    window.NotificationComponent = NotificationComponent;
    window.notificationComponent = notificationComponent;
    
    // Global convenience functions
    window.notify = {
        show: (message, options) => notificationComponent.show(message, options),
        info: (message, options) => notificationComponent.info(message, options),
        success: (message, options) => notificationComponent.success(message, options),
        warning: (message, options) => notificationComponent.warning(message, options),
        error: (message, options) => notificationComponent.error(message, options),
        persistent: (message, options) => notificationComponent.persistent(message, options),
        clear: () => notificationComponent.clearAll()
    };
}
