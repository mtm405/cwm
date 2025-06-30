// Modern Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Tab functionality
    const tabButtons = document.querySelectorAll('.nav-tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active class from all tabs and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding pane
            this.classList.add('active');
            const targetPane = document.getElementById(targetTab + '-tab');
            if (targetPane) {
                targetPane.classList.add('active');
            }
            
            // Add smooth animation
            targetPane?.style.setProperty('animation', 'fadeInUp 0.5s ease');
        });
    });
    
    // Stats card hover effects
    const statCards = document.querySelectorAll('.stat-card-modern');
    
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Progress bar animations
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill, .progress-fill-mini');
        
        progressBars.forEach((bar, index) => {
            const width = bar.style.width || '0%';
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.transition = 'width 1s ease-out';
                bar.style.width = width;
            }, index * 200);
        });
    }
    
    // Animate progress bars on load
    setTimeout(animateProgressBars, 800);
    
    // Refresh dashboard functionality
    const refreshButton = document.querySelector('.refresh-dashboard');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            // Add spinning animation
            const icon = this.querySelector('i');
            icon.style.transform = 'rotate(360deg)';
            icon.style.transition = 'transform 0.5s ease';
            
            setTimeout(() => {
                icon.style.transform = 'rotate(0deg)';
                animateProgressBars();
                showNotification('Dashboard refreshed!', 'success');
            }, 500);
        });
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Make showNotification globally available
    window.showNotification = showNotification;
    
    // Dashboard card interactions
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Activity feed interactions
    const activityItems = document.querySelectorAll('.activity-item-large');
    activityItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Leaderboard interactions
    const leaderboardItems = document.querySelectorAll('.leaderboard-item-modern');
    leaderboardItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            if (!this.classList.contains('current-user')) {
                this.style.transform = 'translateX(8px)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Challenge card interactions
    const challengeButtons = document.querySelectorAll('.challenge-actions-modern .btn');
    challengeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const challengeId = this.dataset.challengeId;
            if (challengeId) {
                showNotification('Starting challenge...', 'info');
                // Add challenge start logic here
            }
        });
    });
    
    // Auto-update timer for daily challenge
    function updateChallengeTimer() {
        const timerElement = document.getElementById('daily-timer');
        if (timerElement) {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const timeLeft = tomorrow - now;
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
            timerElement.textContent = `${hours}h ${minutes}m`;
        }
    }
    
    // Update timer every minute
    updateChallengeTimer();
    setInterval(updateChallengeTimer, 60000);
    
});

// Add notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 250px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        background: linear-gradient(135deg, #10b981, #34d399);
    }
    
    .notification-error {
        background: linear-gradient(135deg, #ef4444, #f87171);
    }
    
    .notification-info {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
    }
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
