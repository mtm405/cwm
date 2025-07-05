/**
 * DashboardLeaderboard.js
 * Manages the leaderboard display and interaction on the dashboard
 */

export class DashboardLeaderboard {
    constructor() {
        this.container = null;
        this.leaderboardData = [];
        this.currentFilter = 'all';
        this.initialized = false;
        this.refreshInterval = null;
    }

    /**
     * Initialize the leaderboard manager
     */
    async init() {
        this.container = document.querySelector('#leaderboard-tab');
        
        if (!this.container) {
            console.error('Leaderboard container not found');
            return;
        }

        try {
            // Show loading state
            this.showLoading();
            
            // Load leaderboard data
            await this.loadLeaderboardData();
            
            // Render the leaderboard
            this.render();
            
            // Bind events
            this.bindEvents();
            
            // Set up auto-refresh (every 30 seconds)
            this.startAutoRefresh();
            
            this.initialized = true;
            console.log('Leaderboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize leaderboard:', error);
            this.showError('Failed to load leaderboard data');
        }
    }

    /**
     * Load leaderboard data from API
     */
    async loadLeaderboardData() {
        try {
            const response = await fetch('/api/dashboard/leaderboard');
            const data = await response.json();
            
            if (data.success) {
                this.leaderboardData = data.users || [];
                return true;
            } else {
                throw new Error(data.error || 'Failed to load leaderboard');
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            // Use fallback data in case of error
            this.leaderboardData = this.getFallbackData();
            throw error;
        }
    }

    /**
     * Get fallback leaderboard data
     */
    getFallbackData() {
        return [
            {
                uid: 'dev-user-1',
                username: 'DevUser',
                display_name: 'Dev User',
                xp: 1500,
                level: 5,
                pycoins: 2500,
                is_current_user: false
            },
            {
                uid: 'alex-python',
                username: 'AlexPython',
                display_name: 'Alex Python',
                xp: 1200,
                level: 4,
                pycoins: 2000,
                is_current_user: false
            },
            {
                uid: 'code-master',
                username: 'CodeMaster',
                display_name: 'Code Master',
                xp: 1000,
                level: 3,
                pycoins: 1800,
                is_current_user: false
            }
        ];
    }

    /**
     * Show loading state
     */
    showLoading() {
        const leaderboardContent = this.container.querySelector('.leaderboard-content');
        const leaderboardLoading = this.container.querySelector('.leaderboard-loading');
        const leaderboardError = this.container.querySelector('.leaderboard-error');
        
        if (leaderboardContent) leaderboardContent.classList.add('leaderboard-hidden');
        if (leaderboardError) leaderboardError.classList.add('leaderboard-hidden');
        if (leaderboardLoading) leaderboardLoading.classList.remove('leaderboard-hidden');
    }

    /**
     * Show error state
     */
    showError(message) {
        const leaderboardContent = this.container.querySelector('.leaderboard-content');
        const leaderboardLoading = this.container.querySelector('.leaderboard-loading');
        const leaderboardError = this.container.querySelector('.leaderboard-error');
        
        if (leaderboardContent) leaderboardContent.classList.add('leaderboard-hidden');
        if (leaderboardLoading) leaderboardLoading.classList.add('leaderboard-hidden');
        if (leaderboardError) {
            leaderboardError.classList.remove('leaderboard-hidden');
            const errorText = leaderboardError.querySelector('p');
            if (errorText) {
                errorText.textContent = message;
            }
        }
    }

    /**
     * Render the leaderboard
     */
    render() {
        const leaderboardContent = this.container.querySelector('.leaderboard-content');
        const leaderboardLoading = this.container.querySelector('.leaderboard-loading');
        const leaderboardError = this.container.querySelector('.leaderboard-error');
        const leaderboardList = this.container.querySelector('.leaderboard-list');
        
        if (!leaderboardList) {
            console.error('Leaderboard list element not found');
            return;
        }

        // Hide loading and error states
        if (leaderboardLoading) leaderboardLoading.classList.add('leaderboard-hidden');
        if (leaderboardError) leaderboardError.classList.add('leaderboard-hidden');
        
        // Generate leaderboard HTML
        const leaderboardHTML = this.leaderboardData.map((user, index) => {
            return this.generateLeaderboardItem(user, index + 1);
        }).join('');
        
        leaderboardList.innerHTML = leaderboardHTML;
        
        // Show content
        if (leaderboardContent) leaderboardContent.classList.remove('leaderboard-hidden');
    }

    /**
     * Generate a single leaderboard item
     */
    generateLeaderboardItem(user, position) {
        const isCurrentUser = user.is_current_user;
        const avatarUrl = user.avatar_url || '/static/img/default-avatar.svg';
        
        let rankIcon = position;
        if (position <= 3) {
            const rankClass = position === 1 ? 'rank-1' : position === 2 ? 'rank-2' : 'rank-3';
            rankIcon = `<i class="fas fa-trophy ${rankClass}"></i>`;
        }

        return `
            <div class="leaderboard-item-modern ${isCurrentUser ? 'current-user' : ''}">
                <div class="leaderboard-rank">
                    ${rankIcon}
                </div>
                <div class="leaderboard-avatar">
                    <img src="${avatarUrl}" alt="Avatar" onerror="this.src='/static/img/default-avatar.svg'">
                    ${isCurrentUser ? '<span class="you-badge">YOU</span>' : ''}
                </div>
                <div class="leaderboard-info">
                    <span class="username">${user.display_name || user.username}</span>
                    <span class="level">Level ${user.level || 1}</span>
                </div>
                <div class="leaderboard-stats">
                    <div class="stat-item">
                        <span class="xp-value">${user.xp || 0} XP</span>
                    </div>
                    <div class="stat-item">
                        <span class="coin-value">${user.pycoins || 0} <i class="fas fa-coins"></i></span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Filter buttons
        const filterButtons = this.container.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
                
                // Update active button
                filterButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Retry button in error state
        const retryBtn = this.container.querySelector('.leaderboard-error button');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    }

    /**
     * Set filter and reload data if needed
     */
    async setFilter(filter) {
        if (this.currentFilter === filter) return;
        
        this.currentFilter = filter;
        
        // For now, we'll just re-render with the same data
        // In a real implementation, you might want to fetch filtered data
        this.showLoading();
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // In a real app, you'd fetch filtered data here
            // For now, we'll just re-render the existing data
            this.render();
        } catch (error) {
            console.error('Error applying filter:', error);
            this.showError('Failed to apply filter');
        }
    }

    /**
     * Refresh leaderboard data
     */
    async refresh() {
        if (!this.initialized) return;
        
        try {
            this.showLoading();
            await this.loadLeaderboardData();
            this.render();
        } catch (error) {
            console.error('Failed to refresh leaderboard:', error);
            this.showError('Failed to refresh leaderboard');
        }
    }

    /**
     * Start auto-refresh interval
     */
    startAutoRefresh() {
        // Refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, 30000);
    }

    /**
     * Stop auto-refresh interval
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Cleanup when component is destroyed
     */
    destroy() {
        this.stopAutoRefresh();
        this.initialized = false;
    }
}

// Make available globally for dashboard manager
window.DashboardLeaderboard = DashboardLeaderboard;
