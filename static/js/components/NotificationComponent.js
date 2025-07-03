// static/js/components/NotificationComponent.js
export class NotificationComponent {
    constructor() {
        this.container = this.createContainer();
        this.notifications = [];
        this.init();
    }
    
    init() {
        console.log('✅ NotificationComponent initialized');
    }
    
    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        return container;
    }
    
    show(message, type = 'info', duration = 3000) {
        const notification = this.createNotification(message, type);
        this.container.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        return notification;
    }
    
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" data-close>
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add click handler for close button
        notification.querySelector('[data-close]').addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        return notification;
    }
    
    removeNotification(notification) {
        if (notification && notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }
    }
    
    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}
