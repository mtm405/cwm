/**
 * Activity Feed
 * Real-time activity feed with optimized rendering and mobile support
 * Phase 6 - Navigation & Activity System
 */

class ActivityFeed {
    constructor(options = {}) {
        this.config = {
            container: options.container || '.activity-feed',
            apiEndpoint: options.apiEndpoint || '/api/activities',
            itemsPerPage: options.itemsPerPage || 20,
            maxItems: options.maxItems || 100,
            refreshInterval: options.refreshInterval || 30000, // 30 seconds
            enableRealtime: options.enableRealtime !== false,
            enableInfiniteScroll: options.enableInfiniteScroll !== false,
            enableVirtualization: options.enableVirtualization || false,
            itemHeight: options.itemHeight || 80,
            bufferSize: options.bufferSize || 5,
            ...options
        };
        
        this.state = {
            activities: [],
            filteredActivities: [],
            currentPage: 1,
            totalPages: 0,
            isLoading: false,
            hasError: false,
            lastUpdate: null,
            selectedFilters: new Set(),
            searchQuery: '',
            sortBy: 'timestamp',
            sortOrder: 'desc'
        };
        
        this.cache = new Map();
        this.observers = new Set();
        this.intersectionObserver = null;
        this.refreshTimer = null;
        this.websocket = null;
        this.virtualScroller = null;
        
        this.init();
    }
    
    /**
     * Initialize activity feed
     */
    init() {
        this.findElements();
        this.setupEventListeners();
        this.setupInfiniteScroll();
        this.setupRealtime();
        this.setupVirtualization();
        this.loadInitialData();
        
        console.log('📱 Activity Feed initialized');
    }
    
    /**
     * Find and cache DOM elements
     */
    findElements() {
        this.elements = {
            container: document.querySelector(this.config.container),
            list: null,
            loadingIndicator: null,
            errorMessage: null,
            emptyState: null,
            filters: null,
            searchInput: null,
            sortSelect: null
        };
        
        if (!this.elements.container) {
            console.error('Activity feed container not found:', this.config.container);
            return;
        }
        
        this.createFeedStructure();
    }
    
    /**
     * Create feed structure if it doesn't exist
     */
    createFeedStructure() {
        if (!this.elements.container.querySelector('.activity-feed-content')) {
            this.elements.container.innerHTML = `
                <div class="activity-feed-header">
                    <div class="activity-feed-controls">
                        <div class="activity-search">
                            <input type="text" 
                                   class="activity-search-input" 
                                   placeholder="Search activities..."
                                   aria-label="Search activities">
                        </div>
                        <div class="activity-filters">
                            <button class="filter-btn" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="lessons">Lessons</button>
                            <button class="filter-btn" data-filter="achievements">Achievements</button>
                            <button class="filter-btn" data-filter="challenges">Challenges</button>
                        </div>
                        <div class="activity-sort">
                            <select class="activity-sort-select" aria-label="Sort activities">
                                <option value="timestamp-desc">Newest First</option>
                                <option value="timestamp-asc">Oldest First</option>
                                <option value="type">By Type</option>
                                <option value="importance">By Importance</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="activity-feed-content">
                    <div class="activity-list" role="log" aria-live="polite" aria-label="Activity feed"></div>
                    <div class="activity-loading" hidden>
                        <div class="loading-spinner"></div>
                        <span>Loading activities...</span>
                    </div>
                    <div class="activity-error" hidden>
                        <div class="error-icon">⚠️</div>
                        <div class="error-message">Failed to load activities</div>
                        <button class="error-retry">Retry</button>
                    </div>
                    <div class="activity-empty" hidden>
                        <div class="empty-icon">📝</div>
                        <div class="empty-message">No activities yet</div>
                        <div class="empty-description">Your learning activities will appear here</div>
                    </div>
                </div>
                <div class="activity-feed-footer">
                    <button class="load-more-btn" hidden>Load More</button>
                </div>
            `;
        }
        
        // Cache elements
        this.elements.list = this.elements.container.querySelector('.activity-list');
        this.elements.loadingIndicator = this.elements.container.querySelector('.activity-loading');
        this.elements.errorMessage = this.elements.container.querySelector('.activity-error');
        this.elements.emptyState = this.elements.container.querySelector('.activity-empty');
        this.elements.filters = this.elements.container.querySelectorAll('.filter-btn');
        this.elements.searchInput = this.elements.container.querySelector('.activity-search-input');
        this.elements.sortSelect = this.elements.container.querySelector('.activity-sort-select');
        this.elements.loadMoreBtn = this.elements.container.querySelector('.load-more-btn');
        this.elements.retryBtn = this.elements.container.querySelector('.error-retry');
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Search input
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }
        
        // Filter buttons
        this.elements.filters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilterChange(e.target.dataset.filter);
            });
        });
        
        // Sort select
        if (this.elements.sortSelect) {
            this.elements.sortSelect.addEventListener('change', (e) => {
                this.handleSortChange(e.target.value);
            });
        }
        
        // Load more button
        if (this.elements.loadMoreBtn) {
            this.elements.loadMoreBtn.addEventListener('click', () => {
                this.loadMoreActivities();
            });
        }
        
        // Retry button
        if (this.elements.retryBtn) {
            this.elements.retryBtn.addEventListener('click', () => {
                this.retry();
            });
        }
        
        // Keyboard navigation
        this.elements.list.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });
        
        // Window focus for refresh
        window.addEventListener('focus', () => {
            this.handleWindowFocus();
        });
        
        // Visibility change for pause/resume
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }
    
    /**
     * Set up infinite scroll
     */
    setupInfiniteScroll() {
        if (!this.config.enableInfiniteScroll) return;
        
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.state.isLoading) {
                    this.loadMoreActivities();
                }
            });
        }, {
            root: this.elements.container,
            rootMargin: '100px'
        });
        
        // Create sentinel element
        this.sentinelElement = document.createElement('div');
        this.sentinelElement.className = 'scroll-sentinel';
        this.sentinelElement.style.height = '1px';
        this.elements.list.appendChild(this.sentinelElement);
        
        this.intersectionObserver.observe(this.sentinelElement);
    }
    
    /**
     * Set up real-time updates
     */
    setupRealtime() {
        if (!this.config.enableRealtime) return;
        
        // WebSocket connection for real-time updates
        this.connectWebSocket();
        
        // Polling fallback
        this.startRefreshTimer();
    }
    
    /**
     * Set up virtualization for large lists
     */
    setupVirtualization() {
        if (!this.config.enableVirtualization) return;
        
        this.virtualScroller = new VirtualScroller({
            container: this.elements.list,
            itemHeight: this.config.itemHeight,
            bufferSize: this.config.bufferSize,
            renderItem: (item, index) => this.renderActivityItem(item, index)
        });
    }
    
    /**
     * Connect WebSocket for real-time updates
     */
    connectWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}/ws/activities`;
            
            this.websocket = new WebSocket(wsUrl);
            
            this.websocket.onopen = () => {
                console.log('📡 Activity feed WebSocket connected');
                this.notifyObservers('websocketConnected');
            };
            
            this.websocket.onmessage = (event) => {
                this.handleRealtimeUpdate(JSON.parse(event.data));
            };
            
            this.websocket.onclose = (event) => {
                console.log('📡 Activity feed WebSocket disconnected');
                this.notifyObservers('websocketDisconnected');
                
                // Attempt to reconnect after delay
                setTimeout(() => {
                    this.connectWebSocket();
                }, 5000);
            };
            
            this.websocket.onerror = (error) => {
                console.error('📡 Activity feed WebSocket error:', error);
            };
            
        } catch (error) {
            console.warn('WebSocket not supported, using polling fallback');
        }
    }
    
    /**
     * Start refresh timer for periodic updates
     */
    startRefreshTimer() {
        this.refreshTimer = setInterval(() => {
            if (!document.hidden && !this.state.isLoading) {
                this.refreshActivities();
            }
        }, this.config.refreshInterval);
    }
    
    /**
     * Load initial activity data
     */
    async loadInitialData() {
        this.state.isLoading = true;
        this.showLoading();
        
        try {
            const data = await this.fetchActivities({
                page: 1,
                limit: this.config.itemsPerPage
            });
            
            this.processActivityData(data);
            this.state.lastUpdate = Date.now();
            
        } catch (error) {
            this.handleError(error);
        } finally {
            this.state.isLoading = false;
            this.hideLoading();
        }
    }
    
    /**
     * Load more activities (pagination)
     */
    async loadMoreActivities() {
        if (this.state.isLoading || this.state.currentPage >= this.state.totalPages) {
            return;
        }
        
        this.state.isLoading = true;
        this.showLoading();
        
        try {
            const data = await this.fetchActivities({
                page: this.state.currentPage + 1,
                limit: this.config.itemsPerPage
            });
            
            // Append new activities
            this.state.activities.push(...data.activities);
            this.state.currentPage = data.currentPage;
            this.state.totalPages = data.totalPages;
            
            this.applyFiltersAndSort();
            this.renderActivities();
            
        } catch (error) {
            this.handleError(error);
        } finally {
            this.state.isLoading = false;
            this.hideLoading();
        }
    }
    
    /**
     * Refresh activities (check for new items)
     */
    async refreshActivities() {
        try {
            const data = await this.fetchActivities({
                since: this.state.lastUpdate,
                limit: this.config.itemsPerPage
            });
            
            if (data.activities.length > 0) {
                // Prepend new activities
                this.state.activities.unshift(...data.activities);
                
                // Limit total items
                if (this.state.activities.length > this.config.maxItems) {
                    this.state.activities = this.state.activities.slice(0, this.config.maxItems);
                }
                
                this.state.lastUpdate = Date.now();
                this.applyFiltersAndSort();
                this.renderActivities();
                
                this.notifyObservers('newActivities', { count: data.activities.length });
            }
            
        } catch (error) {
            console.warn('Failed to refresh activities:', error);
        }
    }
    
    /**
     * Fetch activities from API
     */
    async fetchActivities(params = {}) {
        const url = new URL(this.config.apiEndpoint, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, value);
            }
        });
        
        // Check cache first
        const cacheKey = url.toString();
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
                return cached.data;
            }
        }
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache the result
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
        
        return data;
    }
    
    /**
     * Process activity data from API
     */
    processActivityData(data) {
        this.state.activities = data.activities || [];
        this.state.currentPage = data.currentPage || 1;
        this.state.totalPages = data.totalPages || 1;
        
        this.applyFiltersAndSort();
        this.renderActivities();
    }
    
    /**
     * Apply filters and sorting
     */
    applyFiltersAndSort() {
        let filtered = [...this.state.activities];
        
        // Apply search filter
        if (this.state.searchQuery) {
            const query = this.state.searchQuery.toLowerCase();
            filtered = filtered.filter(activity => 
                activity.title?.toLowerCase().includes(query) ||
                activity.description?.toLowerCase().includes(query) ||
                activity.type?.toLowerCase().includes(query)
            );
        }
        
        // Apply type filters
        if (this.state.selectedFilters.size > 0 && !this.state.selectedFilters.has('all')) {
            filtered = filtered.filter(activity => 
                this.state.selectedFilters.has(activity.type)
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            const [sortField, sortDirection] = this.state.sortBy.includes('-') 
                ? this.state.sortBy.split('-')
                : [this.state.sortBy, this.state.sortOrder];
            
            let comparison = 0;
            
            switch (sortField) {
                case 'timestamp':
                    comparison = new Date(b.timestamp) - new Date(a.timestamp);
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
                case 'importance':
                    comparison = (b.importance || 0) - (a.importance || 0);
                    break;
                default:
                    comparison = 0;
            }
            
            return sortDirection === 'asc' ? -comparison : comparison;
        });
        
        this.state.filteredActivities = filtered;
    }
    
    /**
     * Render activities
     */
    renderActivities() {
        if (this.config.enableVirtualization && this.virtualScroller) {
            this.virtualScroller.updateItems(this.state.filteredActivities);
        } else {
            this.renderStandardList();
        }
        
        this.updateFeedState();
    }
    
    /**
     * Render standard (non-virtualized) list
     */
    renderStandardList() {
        const fragment = document.createDocumentFragment();
        
        this.state.filteredActivities.forEach((activity, index) => {
            const element = this.renderActivityItem(activity, index);
            fragment.appendChild(element);
        });
        
        // Clear existing items (keep sentinel)
        const existingItems = this.elements.list.querySelectorAll('.activity-item');
        existingItems.forEach(item => item.remove());
        
        // Insert new items before sentinel
        if (this.sentinelElement) {
            this.elements.list.insertBefore(fragment, this.sentinelElement);
        } else {
            this.elements.list.appendChild(fragment);
        }
    }
    
    /**
     * Render individual activity item
     */
    renderActivityItem(activity, index) {
        const item = document.createElement('div');
        item.className = `activity-item activity-${activity.type}`;
        item.setAttribute('role', 'article');
        item.setAttribute('tabindex', '0');
        item.dataset.activityId = activity.id;
        
        const timeAgo = this.formatTimeAgo(activity.timestamp);
        const iconClass = this.getActivityIcon(activity.type);
        
        item.innerHTML = `
            <div class="activity-icon">
                <i class="${iconClass}" aria-hidden="true"></i>
            </div>
            <div class="activity-content">
                <div class="activity-header">
                    <h3 class="activity-title">${this.escapeHtml(activity.title)}</h3>
                    <time class="activity-time" datetime="${activity.timestamp}">${timeAgo}</time>
                </div>
                <div class="activity-description">${this.escapeHtml(activity.description)}</div>
                ${activity.metadata ? this.renderActivityMetadata(activity.metadata) : ''}
            </div>
            <div class="activity-actions">
                ${activity.actionUrl ? `<a href="${activity.actionUrl}" class="activity-action-btn">View</a>` : ''}
            </div>
        `;
        
        // Add click handler
        item.addEventListener('click', () => {
            this.handleActivityClick(activity);
        });
        
        // Add keyboard handler
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleActivityClick(activity);
            }
        });
        
        return item;
    }
    
    /**
     * Render activity metadata
     */
    renderActivityMetadata(metadata) {
        const items = Object.entries(metadata)
            .filter(([key, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `
                <span class="metadata-item">
                    <span class="metadata-key">${this.escapeHtml(key)}:</span>
                    <span class="metadata-value">${this.escapeHtml(String(value))}</span>
                </span>
            `);
        
        return items.length > 0 ? `<div class="activity-metadata">${items.join('')}</div>` : '';
    }
    
    /**
     * Get icon class for activity type
     */
    getActivityIcon(type) {
        const icons = {
            lesson: 'fas fa-book',
            achievement: 'fas fa-trophy',
            challenge: 'fas fa-puzzle-piece',
            quiz: 'fas fa-question-circle',
            project: 'fas fa-code',
            certificate: 'fas fa-certificate',
            badge: 'fas fa-shield-alt',
            default: 'fas fa-circle'
        };
        
        return icons[type] || icons.default;
    }
    
    /**
     * Format timestamp to relative time
     */
    formatTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return past.toLocaleDateString();
    }
    
    /**
     * Update feed state (empty, error, etc.)
     */
    updateFeedState() {
        const hasActivities = this.state.filteredActivities.length > 0;
        const hasError = this.state.hasError;
        
        // Show/hide appropriate states
        this.elements.emptyState.hidden = hasActivities || hasError;
        this.elements.errorMessage.hidden = !hasError;
        this.elements.list.hidden = hasError;
        
        // Update load more button
        if (this.elements.loadMoreBtn) {
            this.elements.loadMoreBtn.hidden = 
                this.state.currentPage >= this.state.totalPages || 
                !this.config.enableInfiniteScroll;
        }
        
        // Update accessibility
        this.elements.list.setAttribute('aria-busy', String(this.state.isLoading));
    }
    
    /**
     * Handle search input
     */
    handleSearch(query) {
        this.state.searchQuery = query.trim();
        this.applyFiltersAndSort();
        this.renderActivities();
        
        this.notifyObservers('search', { query: this.state.searchQuery });
    }
    
    /**
     * Handle filter change
     */
    handleFilterChange(filter) {
        // Update filter selection
        this.elements.filters.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        if (filter === 'all') {
            this.state.selectedFilters.clear();
            this.state.selectedFilters.add('all');
        } else {
            this.state.selectedFilters.clear();
            this.state.selectedFilters.add(filter);
        }
        
        this.applyFiltersAndSort();
        this.renderActivities();
        
        this.notifyObservers('filterChange', { filter });
    }
    
    /**
     * Handle sort change
     */
    handleSortChange(sortValue) {
        if (sortValue.includes('-')) {
            const [field, order] = sortValue.split('-');
            this.state.sortBy = field;
            this.state.sortOrder = order;
        } else {
            this.state.sortBy = sortValue;
            this.state.sortOrder = 'desc';
        }
        
        this.applyFiltersAndSort();
        this.renderActivities();
        
        this.notifyObservers('sortChange', { 
            sortBy: this.state.sortBy, 
            sortOrder: this.state.sortOrder 
        });
    }
    
    /**
     * Handle activity click
     */
    handleActivityClick(activity) {
        this.notifyObservers('activityClick', { activity });
        
        // Navigate to activity if URL provided
        if (activity.actionUrl) {
            window.location.href = activity.actionUrl;
        }
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeyboardNavigation(e) {
        const items = Array.from(this.elements.list.querySelectorAll('.activity-item'));
        const currentIndex = items.indexOf(document.activeElement);
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < items.length - 1) {
                    items[currentIndex + 1].focus();
                }
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    items[currentIndex - 1].focus();
                }
                break;
                
            case 'Home':
                e.preventDefault();
                if (items.length > 0) {
                    items[0].focus();
                }
                break;
                
            case 'End':
                e.preventDefault();
                if (items.length > 0) {
                    items[items.length - 1].focus();
                }
                break;
        }
    }
    
    /**
     * Handle real-time update from WebSocket
     */
    handleRealtimeUpdate(data) {
        switch (data.type) {
            case 'new_activity':
                this.addNewActivity(data.activity);
                break;
                
            case 'activity_updated':
                this.updateActivity(data.activity);
                break;
                
            case 'activity_deleted':
                this.removeActivity(data.activityId);
                break;
        }
    }
    
    /**
     * Add new activity to feed
     */
    addNewActivity(activity) {
        // Prepend to activities list
        this.state.activities.unshift(activity);
        
        // Limit total items
        if (this.state.activities.length > this.config.maxItems) {
            this.state.activities.pop();
        }
        
        this.applyFiltersAndSort();
        this.renderActivities();
        
        this.notifyObservers('newActivity', { activity });
    }
    
    /**
     * Update existing activity
     */
    updateActivity(updatedActivity) {
        const index = this.state.activities.findIndex(a => a.id === updatedActivity.id);
        if (index !== -1) {
            this.state.activities[index] = updatedActivity;
            this.applyFiltersAndSort();
            this.renderActivities();
            
            this.notifyObservers('activityUpdated', { activity: updatedActivity });
        }
    }
    
    /**
     * Remove activity from feed
     */
    removeActivity(activityId) {
        this.state.activities = this.state.activities.filter(a => a.id !== activityId);
        this.applyFiltersAndSort();
        this.renderActivities();
        
        this.notifyObservers('activityRemoved', { activityId });
    }
    
    /**
     * Handle window focus
     */
    handleWindowFocus() {
        // Refresh activities when window gains focus
        if (Date.now() - (this.state.lastUpdate || 0) > 60000) { // 1 minute
            this.refreshActivities();
        }
    }
    
    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause real-time updates when hidden
            if (this.refreshTimer) {
                clearInterval(this.refreshTimer);
                this.refreshTimer = null;
            }
        } else {
            // Resume real-time updates when visible
            if (!this.refreshTimer) {
                this.startRefreshTimer();
            }
        }
    }
    
    /**
     * Show loading indicator
     */
    showLoading() {
        this.elements.loadingIndicator.hidden = false;
    }
    
    /**
     * Hide loading indicator
     */
    hideLoading() {
        this.elements.loadingIndicator.hidden = true;
    }
    
    /**
     * Handle error
     */
    handleError(error) {
        this.state.hasError = true;
        this.state.isLoading = false;
        
        console.error('Activity feed error:', error);
        
        this.elements.errorMessage.hidden = false;
        this.elements.errorMessage.querySelector('.error-message').textContent = 
            error.message || 'Failed to load activities';
        
        this.notifyObservers('error', { error });
    }
    
    /**
     * Retry after error
     */
    retry() {
        this.state.hasError = false;
        this.elements.errorMessage.hidden = true;
        this.loadInitialData();
    }
    
    /**
     * Add observer
     */
    addObserver(observer) {
        this.observers.add(observer);
    }
    
    /**
     * Remove observer
     */
    removeObserver(observer) {
        this.observers.delete(observer);
    }
    
    /**
     * Notify observers
     */
    notifyObservers(event, data = {}) {
        this.observers.forEach(observer => {
            try {
                observer(event, { ...data, state: this.getState() });
            } catch (error) {
                console.error('Activity feed observer error:', error);
            }
        });
    }
    
    /**
     * Get current state
     */
    getState() {
        return {
            activityCount: this.state.activities.length,
            filteredCount: this.state.filteredActivities.length,
            currentPage: this.state.currentPage,
            totalPages: this.state.totalPages,
            isLoading: this.state.isLoading,
            hasError: this.state.hasError,
            lastUpdate: this.state.lastUpdate
        };
    }
    
    /**
     * Utility: Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Utility: Debounce function
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
     * Destroy activity feed
     */
    destroy() {
        // Clean up observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // Clean up timers
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        // Clean up WebSocket
        if (this.websocket) {
            this.websocket.close();
        }
        
        // Clean up virtual scroller
        if (this.virtualScroller) {
            this.virtualScroller.destroy();
        }
        
        // Clear observers
        this.observers.clear();
        
        console.log('📱 Activity Feed destroyed');
    }
}

// Simple Virtual Scroller implementation
class VirtualScroller {
    constructor(options) {
        this.container = options.container;
        this.itemHeight = options.itemHeight;
        this.bufferSize = options.bufferSize;
        this.renderItem = options.renderItem;
        
        this.items = [];
        this.visibleItems = [];
        this.scrollTop = 0;
        
        this.init();
    }
    
    init() {
        this.container.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }
    
    updateItems(items) {
        this.items = items;
        this.render();
    }
    
    handleScroll() {
        this.scrollTop = this.container.scrollTop;
        this.render();
    }
    
    render() {
        const containerHeight = this.container.clientHeight;
        const startIndex = Math.floor(this.scrollTop / this.itemHeight);
        const endIndex = Math.min(
            this.items.length - 1,
            Math.ceil((this.scrollTop + containerHeight) / this.itemHeight)
        );
        
        const bufferedStart = Math.max(0, startIndex - this.bufferSize);
        const bufferedEnd = Math.min(this.items.length - 1, endIndex + this.bufferSize);
        
        // Clear container
        this.container.innerHTML = '';
        
        // Create spacer for items above viewport
        if (bufferedStart > 0) {
            const topSpacer = document.createElement('div');
            topSpacer.style.height = `${bufferedStart * this.itemHeight}px`;
            this.container.appendChild(topSpacer);
        }
        
        // Render visible items
        for (let i = bufferedStart; i <= bufferedEnd; i++) {
            if (this.items[i]) {
                const element = this.renderItem(this.items[i], i);
                this.container.appendChild(element);
            }
        }
        
        // Create spacer for items below viewport
        if (bufferedEnd < this.items.length - 1) {
            const bottomSpacer = document.createElement('div');
            bottomSpacer.style.height = `${(this.items.length - bufferedEnd - 1) * this.itemHeight}px`;
            this.container.appendChild(bottomSpacer);
        }
    }
    
    destroy() {
        // Clean up event listeners
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ActivityFeed;
} else {
    window.ActivityFeed = ActivityFeed;
}
