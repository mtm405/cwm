/**
 * Modern Dashboard Manager
 * Handles all dashboard functionality with animations and real-time updates
 */

class ModernDashboardManager {
    constructor() {
        this.initialized = false;
        this.stats = {};
        this.refreshInterval = null;
        this.animationDelay = 100;
        this.charts = {};
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Modern Dashboard...');
        
        try {
            this.setupEventListeners();
            await this.loadDashboardData();
            this.initializeAnimations();
            this.startAutoRefresh();
            
            this.initialized = true;
            console.log('✅ Modern Dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showErrorState();
        }
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.querySelector('.refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }

        // Theme changes
        document.addEventListener('themeChanged', () => {
            this.updateThemeStyles();
        });

        // Card hover effects
        this.setupCardInteractions();

        // Mobile responsive handlers
        this.setupResponsiveHandlers();

        // Challenge button
        const challengeBtn = document.querySelector('.challenge-start-btn');
        if (challengeBtn) {
            challengeBtn.addEventListener('click', (e) => {
                const challengeId = e.target.dataset.challengeId;
                this.startChallenge(challengeId);
            });
        }
    }

    async loadDashboardData() {
        try {
            // Show loading state
            this.showLoadingState();

            // Load dashboard stats
            const response = await fetch('/api/dashboard/stats');
            const data = await response.json();
            
            if (data && data.user) {
                this.stats = data;
                await this.updateDashboardUI(data);
            } else {
                throw new Error('No dashboard data received');
            }

            // Load additional data in parallel
            await Promise.all([
                this.loadExamObjectives(),
                this.loadActivityFeed(),
                this.loadDailyChallenge()
            ]);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data. Please refresh the page.');
        } finally {
            this.hideLoadingState();
        }
    }

    async updateDashboardUI(data) {
        // Update user welcome message
        this.updateWelcomeMessage(data.user);
        
        // Update stats cards with animations
        await this.updateStatsCards(data.user);
        
        // Update progress section
        this.updateProgressSection(data.progress);
        
        // Trigger entrance animations
        this.triggerEntranceAnimations();
    }

    updateWelcomeMessage(user) {
        const welcomeElement = document.querySelector('.dashboard-header h1');
        if (welcomeElement) {
            const displayName = user.display_name || user.username || 'Student';
            welcomeElement.textContent = `Welcome back, ${displayName}! 🚀`;
        }

        const subtitleElement = document.querySelector('.dashboard-subtitle');
        if (subtitleElement) {
            const timeOfDay = this.getTimeOfDay();
            subtitleElement.textContent = `Good ${timeOfDay}! Ready to continue your Python journey?`;
        }
    }

    async updateStatsCards(user) {
        const statsData = [
            {
                selector: '[data-stat="xp"]',
                value: user.xp || 0,
                icon: 'fas fa-star',
                label: 'Total XP',
                color: 'var(--primary-color)'
            },
            {
                selector: '[data-stat="pycoins"]',
                value: user.pycoins || 0,
                icon: 'fas fa-coins',
                label: 'PyCoins',
                color: 'var(--warning-color)'
            },
            {
                selector: '[data-stat="level"]',
                value: user.level || 1,
                icon: 'fas fa-trophy',
                label: 'Level',
                color: 'var(--success-color)'
            },
            {
                selector: '[data-stat="streak"]',
                value: user.streak || 0,
                icon: 'fas fa-fire',
                label: 'Day Streak',
                color: 'var(--danger-color)'
            }
        ];

        // Create stats grid if it doesn't exist
        if (!document.querySelector('.stats-grid')) {
            this.createStatsGrid();
        }

        // Update each stat card with animation
        for (let i = 0; i < statsData.length; i++) {
            const stat = statsData[i];
            await this.updateStatCard(stat, i * this.animationDelay);
        }
    }

    createStatsGrid() {
        const container = document.querySelector('.dashboard-container');
        if (!container) return;

        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';
        statsGrid.innerHTML = `
            <div class="stat-card" data-stat="xp">
                <i class="stat-icon fas fa-star"></i>
                <span class="stat-value">0</span>
                <span class="stat-label">Total XP</span>
            </div>
            <div class="stat-card" data-stat="pycoins">
                <i class="stat-icon fas fa-coins"></i>
                <span class="stat-value">0</span>
                <span class="stat-label">PyCoins</span>
            </div>
            <div class="stat-card" data-stat="level">
                <i class="stat-icon fas fa-trophy"></i>
                <span class="stat-value">1</span>
                <span class="stat-label">Level</span>
            </div>
            <div class="stat-card" data-stat="streak">
                <i class="stat-icon fas fa-fire"></i>
                <span class="stat-value">0</span>
                <span class="stat-label">Day Streak</span>
            </div>
        `;

        // Insert after dashboard header
        const header = container.querySelector('.dashboard-header');
        if (header) {
            header.insertAdjacentElement('afterend', statsGrid);
        } else {
            container.insertBefore(statsGrid, container.firstChild);
        }
    }

    async updateStatCard(stat, delay = 0) {
        const card = document.querySelector(stat.selector);
        if (!card) return;

        // Add loading animation
        card.classList.add('loading');

        setTimeout(async () => {
            const valueElement = card.querySelector('.stat-value');
            const iconElement = card.querySelector('.stat-icon');
            
            if (valueElement) {
                // Animate number counting
                await this.animateNumber(valueElement, parseInt(valueElement.textContent) || 0, stat.value);
            }

            if (iconElement) {
                iconElement.className = stat.icon;
                iconElement.style.color = stat.color;
            }

            // Add pulse effect for significant changes
            if (stat.value > (parseInt(valueElement?.textContent) || 0)) {
                card.classList.add('stat-improved');
                setTimeout(() => card.classList.remove('stat-improved'), 1000);
            }

            card.classList.remove('loading');
        }, delay);
    }

    async animateNumber(element, start, end, duration = 1000) {
        return new Promise(resolve => {
            if (start === end) {
                resolve();
                return;
            }

            const startTime = performance.now();
            const difference = end - start;

            const updateNumber = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth animation
                const easeOutCubic = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(start + difference * easeOutCubic);
                
                element.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateNumber);
                } else {
                    resolve();
                }
            };

            requestAnimationFrame(updateNumber);
        });
    }

    setupCardInteractions() {
        // Enhanced hover effects for stat cards
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addCardHoverEffect(card);
            });

            card.addEventListener('mouseleave', () => {
                this.removeCardHoverEffect(card);
            });

            card.addEventListener('click', () => {
                this.handleStatCardClick(card);
            });
        });

        // Enhanced card interactions for other sections
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            this.setupCardAnimations(card);
        });
    }

    addCardHoverEffect(card) {
        card.style.transform = 'translateY(-8px) scale(1.02)';
        card.style.boxShadow = '0 20px 40px rgba(108, 99, 255, 0.2)';
        
        const icon = card.querySelector('.stat-icon');
        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(5deg)';
        }
    }

    removeCardHoverEffect(card) {
        card.style.transform = '';
        card.style.boxShadow = '';
        
        const icon = card.querySelector('.stat-icon');
        if (icon) {
            icon.style.transform = '';
        }
    }

    handleStatCardClick(card) {
        const statType = card.dataset.stat;
        
        // Add click animation
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Show detailed stat modal or navigate to relevant section
        this.showStatDetails(statType);
    }

    showStatDetails(statType) {
        const details = {
            xp: {
                title: 'Experience Points',
                description: 'Earn XP by completing lessons, challenges, and quizzes!',
                tips: ['Complete daily challenges for bonus XP', 'Perfect quiz scores give extra points', 'Consistent learning streaks multiply your XP']
            },
            pycoins: {
                title: 'PyCoins',
                description: 'Virtual currency earned through achievements and milestones.',
                tips: ['Spend PyCoins on cosmetic upgrades', 'Save for special challenge unlocks', 'Bonus coins for helping other students']
            },
            level: {
                title: 'Student Level',
                description: 'Your overall progress and mastery indicator.',
                tips: ['Higher levels unlock advanced content', 'Each level requires more XP', 'Level up for exclusive rewards']
            },
            streak: {
                title: 'Learning Streak',
                description: 'Consecutive days of active learning.',
                tips: ['Maintain streaks for multiplier bonuses', 'Even 10 minutes counts toward your streak', 'Longest streaks earn special badges']
            }
        };

        this.showModal(details[statType]);
    }

    showModal(content) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('stat-modal');
        if (!modal) {
            modal = this.createModal();
        }

        // Update modal content
        modal.querySelector('.modal-title').textContent = content.title;
        modal.querySelector('.modal-description').textContent = content.description;
        
        const tipsList = modal.querySelector('.modal-tips');
        tipsList.innerHTML = content.tips.map(tip => `<li><i class="fas fa-lightbulb"></i> ${tip}</li>`).join('');

        // Show modal with animation
        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    }

    createModal() {
        const modal = document.createElement('div');
        modal.id = 'stat-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="window.dashboardManager.closeModal()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title"></h3>
                    <button class="modal-close" onclick="window.dashboardManager.closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="modal-description"></p>
                    <div class="modal-section">
                        <h4><i class="fas fa-tips"></i> Pro Tips:</h4>
                        <ul class="modal-tips"></ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.dashboardManager.closeModal()">
                        Got it!
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    closeModal() {
        const modal = document.getElementById('stat-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    setupResponsiveHandlers() {
        // Handle responsive layout changes
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResponsiveChanges();
            }, 250);
        });

        // Initial responsive setup
        this.handleResponsiveChanges();
    }

    handleResponsiveChanges() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;

        // Adjust grid layouts
        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid) {
            if (isMobile) {
                statsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else if (isTablet) {
                statsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else {
                statsGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            }
        }

        // Adjust animation delays for mobile
        this.animationDelay = isMobile ? 50 : 100;

        // Update chart sizes if they exist
        this.resizeCharts();
    }

    resizeCharts() {
        // Resize any charts that might exist
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    startAutoRefresh() {
        // Auto-refresh dashboard data every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.refreshDashboard();
        }, 5 * 60 * 1000);
    }

    async refreshDashboard() {
        console.log('🔄 Refreshing dashboard data...');
        
        try {
            // Show subtle loading indicator
            this.showRefreshIndicator();

            // Reload dashboard data
            await this.loadDashboardData();

            // Show success feedback
            this.showRefreshSuccess();

        } catch (error) {
            console.error('Dashboard refresh failed:', error);
            this.showRefreshError();
        }
    }

    showRefreshIndicator() {
        const refreshBtn = document.querySelector('.refresh-dashboard');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('fa-spin');
        }
    }

    showRefreshSuccess() {
        const refreshBtn = document.querySelector('.refresh-dashboard');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.classList.remove('fa-spin');
            
            // Brief success indication
            refreshBtn.style.color = 'var(--success-color)';
            setTimeout(() => {
                refreshBtn.style.color = '';
            }, 1000);
        }

        this.showToast('Dashboard updated!', 'success');
    }

    showRefreshError() {
        const refreshBtn = document.querySelector('.refresh-dashboard');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.classList.remove('fa-spin');
            
            // Brief error indication
            refreshBtn.style.color = 'var(--danger-color)';
            setTimeout(() => {
                refreshBtn.style.color = '';
            }, 2000);
        }

        this.showToast('Failed to refresh dashboard', 'error');
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;

        // Add to DOM
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    updateThemeStyles() {
        // Update any theme-specific elements
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach(card => {
            // Trigger a reflow to update CSS variables
            card.style.display = 'none';
            card.offsetHeight; // trigger reflow
            card.style.display = '';
        });
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        this.initialized = false;
    }
}

// Initialize dashboard when function is called
function initializeDashboard() {
    if (window.modernDashboardManager) {
        window.modernDashboardManager.destroy();
    }
    
    window.modernDashboardManager = new ModernDashboardManager();
    window.modernDashboardManager.init();
}

// Auto-initialize if on dashboard page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.body.dataset.page === 'dashboard') {
            initializeDashboard();
        }
    });
} else {
    if (document.body.dataset.page === 'dashboard') {
        initializeDashboard();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModernDashboardManager, initializeDashboard };
}
