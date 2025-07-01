/**
 * Navigation Controller
 * Enhanced navigation management with smooth scrolling and mobile optimization
 * Phase 6 - Navigation & Activity System
 */

class NavigationController {
    constructor() {
        this.state = {
            currentRoute: window.location.pathname,
            isNavigating: false,
            scrollBehavior: 'smooth',
            mobileBreakpoint: 768
        };
        
        this.observers = new Set();
        this.routeCache = new Map();
        this.navigationHistory = [];
        
        this.init();
    }
    
    /**
     * Initialize navigation controller
     */
    init() {
        this.setupEventListeners();
        this.setupRouteHandling();
        this.setupSmoothScrolling();
        this.setupNavigationTracking();
        this.bindKeyboardShortcuts();
        
        console.log('🧭 Navigation Controller initialized');
    }
    
    /**
     * Set up navigation event listeners
     */
    setupEventListeners() {
        // Handle navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && this.shouldHandleNavigation(link)) {
                e.preventDefault();
                this.navigateTo(link.href, { trigger: 'click' });
            }
        });
        
        // Handle browser navigation
        window.addEventListener('popstate', (e) => {
            this.handlePopState(e);
        });
        
        // Handle window resize for mobile navigation
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Handle scroll for navigation effects
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16));
    }
    
    /**
     * Set up route handling
     */
    setupRouteHandling() {
        this.routes = new Map([
            ['/', { handler: this.handleHome, preload: true }],
            ['/lessons', { handler: this.handleLessons, preload: true }],
            ['/dashboard', { handler: this.handleDashboard, preload: false }],
            ['/profile', { handler: this.handleProfile, preload: false }],
            ['/challenges', { handler: this.handleChallenges, preload: false }]
        ]);
        
        // Preload critical routes
        this.preloadCriticalRoutes();
    }
    
    /**
     * Set up smooth scrolling behavior
     */
    setupSmoothScrolling() {
        // Smooth scroll to anchors
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (anchor) {
                e.preventDefault();
                this.smoothScrollToAnchor(anchor.getAttribute('href'));
            }
        });
        
        // Smooth scroll to top on logo click
        const logo = document.querySelector('.logo, .brand');
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.smoothScrollToTop();
            });
        }
    }
    
    /**
     * Set up navigation tracking
     */
    setupNavigationTracking() {
        this.trackPageView(this.state.currentRoute);
        
        // Track navigation performance
        this.navigationMetrics = {
            startTime: performance.now(),
            navigations: 0,
            averageTime: 0
        };
    }
    
    /**
     * Navigate to a new route
     * @param {string} url - Target URL
     * @param {Object} options - Navigation options
     */
    async navigateTo(url, options = {}) {
        if (this.state.isNavigating) {
            console.warn('Navigation already in progress');
            return;
        }
        
        const startTime = performance.now();
        this.state.isNavigating = true;
        
        try {
            // Parse URL
            const targetUrl = new URL(url, window.location.origin);
            const route = targetUrl.pathname;
            
            // Check if route exists
            if (!this.routes.has(route) && !route.startsWith('/lesson/')) {
                throw new Error(`Route not found: ${route}`);
            }
            
            // Update history if not back/forward navigation
            if (options.trigger !== 'popstate') {
                this.navigationHistory.push({
                    from: this.state.currentRoute,
                    to: route,
                    timestamp: Date.now(),
                    trigger: options.trigger || 'programmatic'
                });
                
                history.pushState({ route }, '', url);
            }
            
            // Show loading indicator
            this.showNavigationLoading();
            
            // Execute route handler
            await this.executeRoute(route, options);
            
            // Update current route
            this.state.currentRoute = route;
            
            // Track performance
            const navigationTime = performance.now() - startTime;
            this.updateNavigationMetrics(navigationTime);
            
            // Notify observers
            this.notifyObservers('navigationComplete', { route, time: navigationTime });
            
        } catch (error) {
            console.error('Navigation failed:', error);
            this.handleNavigationError(error);
        } finally {
            this.state.isNavigating = false;
            this.hideNavigationLoading();
        }
    }
    
    /**
     * Execute route handler
     * @param {string} route - Route path
     * @param {Object} options - Execution options
     */
    async executeRoute(route, options = {}) {
        const routeConfig = this.routes.get(route);
        
        if (routeConfig) {
            // Check cache first
            if (this.routeCache.has(route) && !options.forceRefresh) {
                return this.routeCache.get(route);
            }
            
            // Execute handler
            const result = await routeConfig.handler(options);
            
            // Cache result if applicable
            if (routeConfig.cacheable !== false) {
                this.routeCache.set(route, result);
            }
            
            return result;
        }
        
        // Handle dynamic routes (like lessons)
        if (route.startsWith('/lesson/')) {
            return this.handleLessonRoute(route, options);
        }
        
        throw new Error(`No handler for route: ${route}`);
    }
    
    /**
     * Smooth scroll to anchor
     * @param {string} anchor - Anchor hash
     */
    smoothScrollToAnchor(anchor) {
        const targetId = anchor.substring(1);
        const target = document.getElementById(targetId);
        
        if (target) {
            const offset = this.getScrollOffset();
            const targetPosition = target.offsetTop - offset;
            
            this.smoothScrollTo(targetPosition);
            
            // Update URL hash
            history.replaceState(null, '', anchor);
            
            // Focus for accessibility
            target.focus({ preventScroll: true });
        }
    }
    
    /**
     * Smooth scroll to top
     */
    smoothScrollToTop() {
        this.smoothScrollTo(0);
    }
    
    /**
     * Smooth scroll to position
     * @param {number} position - Target scroll position
     * @param {number} duration - Animation duration
     */
    smoothScrollTo(position, duration = 500) {
        const startPosition = window.pageYOffset;
        const distance = position - startPosition;
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-in-out)
            const easing = progress < 0.5 
                ? 2 * progress * progress 
                : -1 + (4 - 2 * progress) * progress;
            
            window.scrollTo(0, startPosition + distance * easing);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    }
    
    /**
     * Handle browser back/forward navigation
     * @param {PopStateEvent} event - Pop state event
     */
    handlePopState(event) {
        const route = event.state?.route || window.location.pathname;
        this.navigateTo(window.location.href, { trigger: 'popstate' });
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        const isMobile = window.innerWidth <= this.state.mobileBreakpoint;
        this.notifyObservers('viewportChange', { isMobile, width: window.innerWidth });
    }
    
    /**
     * Handle scroll events
     */
    handleScroll() {
        const scrollY = window.pageYOffset;
        const direction = scrollY > this.lastScrollY ? 'down' : 'up';
        
        this.notifyObservers('scroll', {
            scrollY,
            direction,
            isAtTop: scrollY === 0,
            isNearBottom: scrollY + window.innerHeight >= document.body.scrollHeight - 100
        });
        
        this.lastScrollY = scrollY;
    }
    
    /**
     * Get scroll offset for fixed headers
     * @returns {number} Offset in pixels
     */
    getScrollOffset() {
        const header = document.querySelector('.navbar, .header');
        return header ? header.offsetHeight + 20 : 20;
    }
    
    /**
     * Bind keyboard shortcuts
     */
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + Left: Go back
            if (e.altKey && e.key === 'ArrowLeft') {
                e.preventDefault();
                this.goBack();
            }
            
            // Alt + Right: Go forward
            if (e.altKey && e.key === 'ArrowRight') {
                e.preventDefault();
                this.goForward();
            }
            
            // Ctrl/Cmd + Home: Go to home
            if ((e.ctrlKey || e.metaKey) && e.key === 'Home') {
                e.preventDefault();
                this.navigateTo('/');
            }
        });
    }
    
    /**
     * Go back in navigation history
     */
    goBack() {
        if (this.navigationHistory.length > 0) {
            window.history.back();
        }
    }
    
    /**
     * Go forward in navigation history
     */
    goForward() {
        window.history.forward();
    }
    
    /**
     * Preload critical routes
     */
    async preloadCriticalRoutes() {
        const criticalRoutes = Array.from(this.routes.entries())
            .filter(([, config]) => config.preload)
            .map(([route]) => route);
        
        for (const route of criticalRoutes) {
            try {
                await this.prefetchRoute(route);
            } catch (error) {
                console.warn(`Failed to preload route ${route}:`, error);
            }
        }
    }
    
    /**
     * Prefetch route data
     * @param {string} route - Route to prefetch
     */
    async prefetchRoute(route) {
        if (this.routeCache.has(route)) return;
        
        const routeConfig = this.routes.get(route);
        if (routeConfig && routeConfig.prefetch) {
            const data = await routeConfig.prefetch();
            this.routeCache.set(route, data);
        }
    }
    
    /**
     * Show navigation loading indicator
     */
    showNavigationLoading() {
        document.body.classList.add('navigation-loading');
        
        // Show progress bar if available
        const progressBar = document.querySelector('.navigation-progress');
        if (progressBar) {
            progressBar.style.width = '0%';
            progressBar.style.opacity = '1';
            
            // Animate progress
            setTimeout(() => {
                progressBar.style.width = '70%';
            }, 100);
        }
    }
    
    /**
     * Hide navigation loading indicator
     */
    hideNavigationLoading() {
        document.body.classList.remove('navigation-loading');
        
        const progressBar = document.querySelector('.navigation-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressBar.style.opacity = '0';
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 300);
            }, 200);
        }
    }
    
    /**
     * Check if navigation should be handled by this controller
     * @param {HTMLAnchorElement} link - Link element
     * @returns {boolean} Should handle navigation
     */
    shouldHandleNavigation(link) {
        const href = link.getAttribute('href');
        
        // Skip external links
        if (href.startsWith('http') && !href.startsWith(window.location.origin)) {
            return false;
        }
        
        // Skip download links
        if (link.hasAttribute('download')) {
            return false;
        }
        
        // Skip target blank links
        if (link.getAttribute('target') === '_blank') {
            return false;
        }
        
        // Skip anchor-only links in same page
        if (href.startsWith('#') && window.location.pathname === '/') {
            return false;
        }
        
        return true;
    }
    
    /**
     * Track page view
     * @param {string} route - Route path
     */
    trackPageView(route) {
        // Integration with analytics
        if (window.gtag) {
            window.gtag('config', 'GA_TRACKING_ID', {
                page_path: route
            });
        }
        
        // Custom analytics
        this.notifyObservers('pageView', { route, timestamp: Date.now() });
    }
    
    /**
     * Update navigation metrics
     * @param {number} navigationTime - Time taken for navigation
     */
    updateNavigationMetrics(navigationTime) {
        this.navigationMetrics.navigations++;
        this.navigationMetrics.averageTime = 
            (this.navigationMetrics.averageTime * (this.navigationMetrics.navigations - 1) + navigationTime) 
            / this.navigationMetrics.navigations;
    }
    
    /**
     * Handle navigation errors
     * @param {Error} error - Navigation error
     */
    handleNavigationError(error) {
        console.error('Navigation error:', error);
        
        // Show user-friendly error message
        this.notifyObservers('navigationError', { error: error.message });
        
        // Fallback to standard navigation
        window.location.href = this.state.currentRoute;
    }
    
    /**
     * Add navigation observer
     * @param {Function} observer - Observer function
     */
    addObserver(observer) {
        this.observers.add(observer);
    }
    
    /**
     * Remove navigation observer
     * @param {Function} observer - Observer function
     */
    removeObserver(observer) {
        this.observers.delete(observer);
    }
    
    /**
     * Notify all observers
     * @param {string} event - Event name
     * @param {Object} data - Event data
     */
    notifyObservers(event, data) {
        this.observers.forEach(observer => {
            try {
                observer(event, data);
            } catch (error) {
                console.error('Observer error:', error);
            }
        });
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
     * Utility: Throttle function
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
    
    // Route handlers (to be implemented based on app structure)
    async handleHome(options) {
        console.log('Handling home route');
        // Implementation specific to your app
    }
    
    async handleLessons(options) {
        console.log('Handling lessons route');
        // Implementation specific to your app
    }
    
    async handleDashboard(options) {
        console.log('Handling dashboard route');
        // Implementation specific to your app
    }
    
    async handleProfile(options) {
        console.log('Handling profile route');
        // Implementation specific to your app
    }
    
    async handleChallenges(options) {
        console.log('Handling challenges route');
        // Implementation specific to your app
    }
    
    async handleLessonRoute(route, options) {
        console.log('Handling lesson route:', route);
        // Implementation specific to your app
    }
    
    /**
     * Get current navigation state
     * @returns {Object} Current state
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Get navigation history
     * @returns {Array} Navigation history
     */
    getHistory() {
        return [...this.navigationHistory];
    }
    
    /**
     * Get navigation metrics
     * @returns {Object} Navigation metrics
     */
    getMetrics() {
        return { ...this.navigationMetrics };
    }
    
    /**
     * Destroy navigation controller
     */
    destroy() {
        this.observers.clear();
        this.routeCache.clear();
        this.navigationHistory = [];
        console.log('🧭 Navigation Controller destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationController;
} else {
    window.NavigationController = NavigationController;
}
