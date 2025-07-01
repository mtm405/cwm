/**
 * Modern Dashboard Manager - Skeleton-Free Version
 * Handles all dashboard functionality with direct content loading
 * 
 * REFACTORED: Removed all skeleton loader functionality for simplified loading
 * - No more skeleton placeholders during loading
 * - Direct content display for better performance
 * - Simplified loading state management
 */

import '../../js/games/WordleGame.js';

class ModernDashboardManager {
    constructor() {
        this.initialized = false;
        this.stats = {};
        this.refreshInterval = null;
        this.animationDelay = 100;
        this.charts = {};
        
        // Register globally for refresh function access
        window.dashboardManager = this;
    }

    async init() {
        if (this.initialized) return;
        
        console.log('🚀 Initializing Modern Dashboard...');
        
        try {
            // Make stats content visible immediately - no skeleton loaders
            this.showStatsContent();
            
            this.setupEventListeners();
            await this.loadDashboardData();
            this.initializeAnimations();
            this.startAutoRefresh();
            
            this.initialized = true;
            console.log('✅ Modern Dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showError('Failed to load dashboard. Please refresh the page.');
        }
    }
    
    showStatsContent() {
        // Ensure stats content is visible and remove skeleton loaders
        const statsContent = document.getElementById('stats-content');
        if (statsContent) {
            statsContent.style.display = 'grid';
            statsContent.style.opacity = '1';
        }
        
        // Remove any skeleton loaders if they exist
        const statsSkeleton = document.getElementById('stats-skeleton');
        if (statsSkeleton) {
            statsSkeleton.style.display = 'none';
        }
        
        // Mark dashboard as loaded
        document.querySelector('.dashboard-container')?.classList.add('loaded');
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.querySelector('.refresh-dashboard, .btn-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }

        // Search bar
        const searchBtn = document.querySelector('.btn-search');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                document.querySelector('.search-container').classList.toggle('active');
                const searchInput = document.getElementById('dashboard-search');
                if (document.querySelector('.search-container').classList.contains('active')) {
                    searchInput.focus();
                }
            });
        }

        // Tab navigation
        this.setupTabNavigation();

        // Theme changes
        document.addEventListener('themeChanged', () => {
            this.updateThemeStyles();
        });

        // Card hover effects
        this.setupCardInteractions();

        // Mobile responsive handlers
        this.setupResponsiveHandlers();

        // Digital Clock
        this.startDigitalClock();

        // Challenge button
        const challengeBtn = document.querySelector('.challenge-start-btn');
        if (challengeBtn) {
            challengeBtn.addEventListener('click', (e) => {
                const challengeId = e.target.dataset.challengeId;
                this.startChallenge(challengeId);
            });
        }
    }

    setupTabNavigation() {
        // Get all tab buttons and panes
        const tabButtons = document.querySelectorAll('.nav-tab[data-tab], .nav-tab');
        const tabPanes = document.querySelectorAll('.tab-pane');

        console.log(`Found ${tabButtons.length} tab buttons and ${tabPanes.length} tab panes`);

        // Add click event listeners to all tab buttons
        tabButtons.forEach((button, index) => {
            console.log(`Setting up tab button ${index}:`, button);
            
            // Handle both data-tab and text-based tab identification
            const getTargetTab = (btn) => {
                if (btn.dataset.tab) {
                    return btn.dataset.tab;
                }
                
                // Fallback: extract from button text or class
                const text = btn.textContent.toLowerCase().trim();
                if (text.includes('overview')) return 'overview';
                if (text.includes('challenge')) return 'challenge';
                if (text.includes('leaderboard')) return 'leaderboard';
                if (text.includes('activity')) return 'activity';
                if (text.includes('vocabulary')) return 'vocabulary';
                if (text.includes('games')) return 'games';
                
                return 'overview'; // default
            };

            // Add event listeners for multiple event types to ensure responsiveness
            ['click', 'touchstart'].forEach(eventType => {
                button.addEventListener(eventType, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const targetTab = getTargetTab(button);
                    console.log(`Tab ${eventType} - switching to:`, targetTab);
                    
                    // Remove active class from all tabs and panes
                    tabButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.setAttribute('aria-selected', 'false');
                    });
                    tabPanes.forEach(pane => {
                        pane.classList.remove('active');
                        // Keep display block for transitions, but hide with opacity/height
                    });
                    
                    // Add active class to clicked tab
                    button.classList.add('active');
                    button.setAttribute('aria-selected', 'true');
                    
                    // Show corresponding tab pane
                    const targetPane = document.getElementById(`${targetTab}-tab`);
                    if (targetPane) {
                        targetPane.classList.add('active');
                        console.log(`Activated pane: ${targetTab}-tab`);
                    } else {
                        console.warn(`Tab pane not found: ${targetTab}-tab`);
                    }
                    
                    // Handle tab-specific functionality
                    this.handleTabSwitch(targetTab);
                    
                    // Update URL hash for better UX
                    window.location.hash = targetTab;
                }, { passive: false });
            });

            // Add keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });

            // Ensure proper ARIA attributes
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', button.classList.contains('active') ? 'true' : 'false');
        });

        // Initialize the first tab as active if none are active
        if (!document.querySelector('.nav-tab.active')) {
            const firstTab = tabButtons[0];
            if (firstTab) {
                firstTab.classList.add('active');
                firstTab.setAttribute('aria-selected', 'true');
                
                const firstTabId = firstTab.dataset.tab || 'overview';
                const firstPane = document.getElementById(`${firstTabId}-tab`);
                if (firstPane) {
                    firstPane.classList.add('active');
                    firstPane.style.display = 'block';
                }
            }
        }

        // Handle URL hash on page load
        const hash = window.location.hash.substring(1);
        if (hash && ['overview', 'challenge', 'leaderboard', 'activity', 'vocabulary', 'games'].includes(hash)) {
            const targetButton = Array.from(tabButtons).find(btn => 
                (btn.dataset.tab === hash) || 
                btn.textContent.toLowerCase().includes(hash)
            );
            if (targetButton) {
                targetButton.click();
            }
        }
    }

    handleTabSwitch(tabId) {
        console.log(`Switching to tab: ${tabId}`);
        
        switch(tabId) {
            case 'overview':
                // Already loaded
                break;
            case 'challenge':
                this.loadDailyChallenge();
                break;
            case 'leaderboard':
                this.loadLeaderboard();
                break;
            case 'activity':
                this.loadActivityFeed();
                break;
            case 'vocabulary':
                // Future implementation
                break;
            case 'games':
                this.renderGamesTab();
                break;
        }
    }

    showLoadingState() {
        console.log('🔄 Loading dashboard data...');
        // Simply log loading state - no skeleton loaders
    }

    hideLoadingState() {
        // Ensure stats content is visible
        const statsContent = document.getElementById('stats-content');
        if (statsContent) {
            statsContent.style.display = 'grid';
            statsContent.style.opacity = '1';
        }
        
        // Mark dashboard as loaded
        const container = document.querySelector('.dashboard-container');
        if (container) {
            container.classList.add('loaded');
        }
        
        console.log('✅ Dashboard content displayed');
    }

    showError(message) {
        console.error('Dashboard Error:', message);
        this.showToast(message, 'error');
    }

    async loadDashboardData() {
        try {
            console.log('🔄 Loading dashboard data...');

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

            console.log('✅ Dashboard data loaded successfully');

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data. Please refresh the page.');
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
        const welcomeElement = document.querySelector('#welcome-message');
        if (welcomeElement) {
            // Get user display name with priority order
            const displayName = user?.display_name || 
                              user?.first_name || 
                              (user?.username && user.username !== 'anonymous' ? user.username : null) || 
                              'Guest';
            
            const timeOfDay = this.getTimeOfDay();
            
            // Update immediately to prevent flash, but only if it's currently showing "Student" or default text
            const currentText = welcomeElement.textContent;
            if (currentText.includes('Student') || currentText.includes('Welcome back')) {
                welcomeElement.textContent = `${timeOfDay}, ${displayName}! 🚀`;
            }
        }

        const subtitleElement = document.querySelector('.dashboard-subtitle');
        if (subtitleElement && !subtitleElement.textContent.trim()) {
            subtitleElement.textContent = `Ready to continue your Python journey?`;
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

        console.log('🎯 Updating stats cards with data:', user);
        console.log('📊 Available stat cards:', document.querySelectorAll('.stat-card-modern').length);

        // Update each existing stat card with animation
        for (let i = 0; i < statsData.length; i++) {
            const stat = statsData[i];
            await this.updateStatCard(stat, i * this.animationDelay);
        }
    }

    async updateStatCard(stat, delay = 0) {
        const card = document.querySelector(stat.selector);
        if (!card) {
            console.warn(`❌ Stat card not found: ${stat.selector}`);
            console.log('Available cards:', document.querySelectorAll('[data-stat]'));
            return;
        }

        console.log(`✅ Found stat card for ${stat.selector}:`, card);

        // Add loading animation
        card.classList.add('loading');

        setTimeout(async () => {
            // Update the value in the modern card structure
            const valueElement = card.querySelector('.stat-value-large, .stat-value');
            const iconElement = card.querySelector('.stat-icon');
            
            if (valueElement) {
                console.log(`📊 Updating ${stat.label}: ${valueElement.textContent} → ${stat.value}`);
                // Animate number counting
                await this.animateNumber(valueElement, parseInt(valueElement.textContent) || 0, stat.value);
            } else {
                console.warn(`❌ Value element not found in card ${stat.selector}`);
            }

            if (iconElement) {
                iconElement.className = `stat-icon ${stat.icon}`;
                iconElement.style.color = stat.color;
            } else {
                console.warn(`❌ Icon element not found in card ${stat.selector}`);
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
        // Enhanced hover effects for stat cards (both old and modern)
        const statCards = document.querySelectorAll('.stat-card, .stat-card-modern');
        
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

    /**
     * Get time-based greeting
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            return 'Good morning';
        } else if (hour >= 12 && hour < 17) {
            return 'Good afternoon';
        } else if (hour >= 17 && hour < 22) {
            return 'Good evening';
        } else {
            return 'Good night';
        }
    }

    /**
     * Setup responsive handlers for mobile/tablet
     */
    setupResponsiveHandlers() {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 1024;
        
        // Adjust grid columns based on screen size
        const statsGrid = document.querySelector('.stats-grid-modern');
        if (statsGrid) {
            if (isMobile) {
                statsGrid.style.gridTemplateColumns = '1fr';
            } else if (isTablet) {
                statsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else {
                statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
            }
        }
    }

    /**
     * Auto refresh dashboard data
     */
    startAutoRefresh() {
        // Refresh every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
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
        const refreshBtn = document.querySelector('.refresh-dashboard, .btn-refresh');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('fa-spin');
            refreshBtn.classList.add('refreshing');
            refreshBtn.disabled = true;
        }
    }

    showRefreshSuccess() {
        const refreshBtn = document.querySelector('.refresh-dashboard, .btn-refresh');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.classList.remove('fa-spin');
            refreshBtn.classList.remove('refreshing');
            refreshBtn.disabled = false;
            
            // Brief success indication
            refreshBtn.style.color = 'var(--success-color)';
            setTimeout(() => {
                refreshBtn.style.color = '';
            }, 1000);
        }

        // Single toast message only
        this.showToast('Dashboard refreshed!', 'success');
    }

    showRefreshError() {
        const refreshBtn = document.querySelector('.refresh-dashboard, .btn-refresh');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.classList.remove('fa-spin');
            refreshBtn.classList.remove('refreshing');
            refreshBtn.disabled = false;
            
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
        const cards = document.querySelectorAll('.stat-card, .stat-card-modern');
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
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
        this.initialized = false;
    }

    startDigitalClock() {
        const clockElement = document.getElementById('digital-clock');
        if (!clockElement) return;

        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            clockElement.textContent = timeString;
        };

        updateClock();
        this.clockInterval = setInterval(updateClock, 1000);
    }

    async loadLeaderboard() {
        console.log('Loading leaderboard...');
        // TODO: Implement leaderboard loading
    }

    async loadActivityFeed() {
        console.log('🔄 Loading activity feed...');
        const feedContainer = document.querySelector('.activity-feed-modern');
        
        if (!feedContainer) {
            console.warn('Activity feed container not found.');
            return;
        }

        // Add loading indicator
        feedContainer.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading activities...</div>';

        try {
            const response = await fetch('/api/dashboard/activity');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Activity data received:', data);
            
            // Clear loading indicator
            feedContainer.innerHTML = '';
            
            if (!data || !data.activities || data.activities.length === 0) {
                this.showEmptyActivityState(feedContainer);
                return;
            }
            
            // Render each activity item
            data.activities.forEach(activity => {
                const activityHTML = this.createActivityItemHTML(activity);
                feedContainer.insertAdjacentHTML('beforeend', activityHTML);
            });
            
            // Add fade-in animation to items
            this.animateItems(feedContainer.querySelectorAll('.activity-item-large'));
            
        } catch (error) {
            console.error('Error loading activity feed:', error);
            feedContainer.innerHTML = `
                <div class="activity-error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Oops!</h4>
                    <p>Failed to load activity data. Please try again.</p>
                </div>
            `;
        }
    }
    
    showEmptyActivityState(container) {
        container.innerHTML = `
            <div class="activity-empty-state">
                <i class="fas fa-history"></i>
                <h4>No Recent Activity</h4>
                <p>Complete lessons or challenges to see your progress here!</p>
            </div>
        `;
    }
    
    createActivityItemHTML(activity) {
        // Map activity type to icon and color
        const iconMap = {
            'lesson_completed': { icon: 'fa-graduation-cap', class: 'success' },
            'quiz_passed': { icon: 'fa-check-circle', class: 'success' },
            'challenge_solved': { icon: 'fa-trophy', class: 'warning' },
            'achievement': { icon: 'fa-star', class: 'primary' },
            'streak': { icon: 'fa-fire', class: 'danger' },
            'level_up': { icon: 'fa-level-up-alt', class: 'primary' }
        };
        
        const iconInfo = iconMap[activity.type] || { icon: 'fa-bell', class: 'secondary' };
        
        // Format the rewards section if present
        let rewardsHTML = '';
        if (activity.rewards) {
            rewardsHTML = '<div class="activity-rewards">';
            if (activity.rewards.xp) {
                rewardsHTML += `<span class="reward-badge">+${activity.rewards.xp} XP</span>`;
            }
            if (activity.rewards.pycoins) {
                rewardsHTML += `<span class="reward-badge">+${activity.rewards.pycoins} PyCoins</span>`;
            }
            if (activity.rewards.badge) {
                rewardsHTML += `<span class="reward-badge special">🏆 ${activity.rewards.badge}</span>`;
            }
            rewardsHTML += '</div>';
        }
        
        return `
            <div class="activity-item-large">
                <div class="activity-icon-large ${iconInfo.class}">
                    <i class="fas ${iconInfo.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                    ${rewardsHTML}
                    <span class="activity-time">${this.formatTimeAgo(activity.timestamp)}</span>
                </div>
            </div>
        `;
    }
    
    formatTimeAgo(timestamp) {
        if (!timestamp) return 'Just now';
        
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffMs = now - activityTime;
        const diffSecs = Math.floor(diffMs / 1000);
        
        if (diffSecs < 60) return 'Just now';
        
        const diffMins = Math.floor(diffSecs / 60);
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return activityTime.toLocaleDateString();
    }
    
    animateItems(items) {
        Array.from(items).forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    async loadDailyChallenge() {
        console.log('Loading daily challenge...');
        // TODO: Implement daily challenge loading
    }

    async loadExamObjectives() {
        console.log('Loading exam objectives...');
        // TODO: Implement exam objectives loading
    }

    updateProgressSection(progress) {
        // Update progress indicators
        if (progress) {
            const progressElements = document.querySelectorAll('.progress-value');
            progressElements.forEach(element => {
                if (element.dataset.type === 'lessons') {
                    element.textContent = `${progress.completed_lessons || 0}/${progress.total_lessons || 10}`;
                }
            });
        }
    }

    triggerEntranceAnimations() {
        // Add entrance animations to stat cards
        const statCards = document.querySelectorAll('.stat-card-modern');
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    initializeAnimations() {
        // Initialize any required animations
        console.log('Initializing dashboard animations...');
    }

    setupCardAnimations(card) {
        // Setup individual card animations
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    async renderGamesTab() {
        // Find or create the games grid
        let gamesGrid = document.querySelector('.games-grid-modern');
        if (!gamesGrid) {
            gamesGrid = document.createElement('div');
            gamesGrid.className = 'games-grid-modern stats-grid-modern';
            const gamesTab = document.querySelector('[data-tab="games"] .tab-pane');
            if (gamesTab) gamesTab.appendChild(gamesGrid);
        }
        // Add Wordle card if not present
        if (!gamesGrid.querySelector('.stat-card-modern.wordle-card')) {
            const card = document.createElement('div');
            card.className = 'stat-card-modern info wordle-card';
            card.innerHTML = `
                <div class="stat-header">
                    <i class="stat-icon fas fa-keyboard"></i>
                    <span class="stat-trend">Daily</span>
                </div>
                <div class="stat-body">
                    <span class="stat-value-large">Wordle</span>
                    <span class="stat-label">Python Edition</span>
                </div>
                <div class="stat-progress">
                    <div class="progress-bar-mini"><div class="progress-fill-mini" style="width:100%"></div></div>
                </div>
            `;
            card.style.cursor = 'pointer';
            card.onclick = () => {
                ModalManager.showModal('wordle-modal');
                setTimeout(() => {
                    if (!window.wordleGameInstance) {
                        window.wordleGameInstance = new WordleGame('wordle-game-container', () => {
                            document.getElementById('wordle-success-message').style.display = '';
                            document.getElementById('wordle-success-message').textContent = 'Congratulations! You earned 10 PyCoins!';
                            // TODO: Award PyCoins via API or updateUserStats
                        });
                    }
                }, 100);
            };
            gamesGrid.appendChild(card);
        }
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

// Global refresh function for backwards compatibility
window.refreshDashboard = function() {
    if (window.modernDashboardManager) {
        window.modernDashboardManager.refreshDashboard();
    } else {
        console.warn('Dashboard manager not initialized');
        location.reload(); // Fallback
    }
};

// --- GLOBALS for legacy compatibility ---
window.openLeaderboardModal = function() {
    // Try to use ModalManager if available, else fallback
    if (window.ModalManager && typeof window.ModalManager.showModal === 'function') {
        window.ModalManager.showModal('leaderboard-modal');
    } else {
        // fallback: show modal by id
        const modal = document.getElementById('leaderboard-modal');
        if (modal) {
            modal.style.display = 'flex';
            requestAnimationFrame(() => modal.classList.add('active'));
        } else {
            alert('Leaderboard modal not found.');
        }
    }
};

window.toggleSearch = function() {
    // Toggle a dashboard search bar if present
    const searchBar = document.querySelector('.dashboard-search, #dashboard-search');
    if (searchBar) {
        const isVisible = searchBar.style.display !== 'none';
        searchBar.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) searchBar.querySelector('input')?.focus();
    } else {
        alert('Search bar not found on dashboard.');
    }
};

// Auto-initialize when DOM is ready
function initWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (document.body.classList.contains('dashboard-page') || 
                document.body.dataset.page === 'dashboard' ||
                window.location.pathname.includes('dashboard')) {
                console.log('🚀 Initializing dashboard...');
                initializeDashboard();
            }
        });
    } else {
        if (document.body.classList.contains('dashboard-page') || 
            document.body.dataset.page === 'dashboard' ||
            window.location.pathname.includes('dashboard')) {
            console.log('🚀 Initializing dashboard...');
            initializeDashboard();
        }
    }
}

// Initialize immediately
initWhenReady();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModernDashboardManager, initializeDashboard };
}
