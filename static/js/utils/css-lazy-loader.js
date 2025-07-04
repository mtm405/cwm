/**
 * CSS Lazy Loader
 * Phase 3A.4: CSS Splitting and Lazy Loading
 * 
 * Client-side utility for lazy loading CSS bundles based on page context,
 * user interactions, and viewport visibility.
 */

class CSSLazyLoader {
    constructor() {
        this.loadedBundles = new Set();
        this.loadingPromises = new Map();
        this.manifest = null;
        this.basePath = '/static/css/bundles/';
        this.debug = false;
        
        this.init();
    }
    
    async init() {
        // Load CSS manifest
        await this.loadManifest();
        
        // Set up intersection observer for lazy loading
        this.setupIntersectionObserver();
        
        // Set up page-specific loading
        this.setupPageSpecificLoading();
        
        this.log('CSSLazyLoader initialized');
    }
    
    async loadManifest() {
        try {
            const response = await fetch('/static/css/bundles/css-manifest.json');
            this.manifest = await response.json();
            this.log('CSS manifest loaded', this.manifest);
        } catch (error) {
            console.error('Failed to load CSS manifest:', error);
            this.manifest = { bundles: {}, pages: {} };
        }
    }
    
    /**
     * Load a CSS bundle
     * @param {string} bundleName - Name of the bundle to load
     * @param {object} options - Loading options
     * @returns {Promise} - Promise that resolves when bundle is loaded
     */
    async loadBundle(bundleName, options = {}) {
        const {
            priority = 'normal',
            timeout = 10000,
            retries = 3
        } = options;
        
        // Check if already loaded
        if (this.loadedBundles.has(bundleName)) {
            this.log(`Bundle ${bundleName} already loaded`);
            return Promise.resolve();
        }
        
        // Check if currently loading
        if (this.loadingPromises.has(bundleName)) {
            return this.loadingPromises.get(bundleName);
        }
        
        // Start loading
        const loadPromise = this.performBundleLoad(bundleName, { priority, timeout, retries });
        this.loadingPromises.set(bundleName, loadPromise);
        
        try {
            await loadPromise;
            this.loadedBundles.add(bundleName);
            this.log(`Bundle ${bundleName} loaded successfully`);
        } catch (error) {
            this.log(`Failed to load bundle ${bundleName}:`, error);
            throw error;
        } finally {
            this.loadingPromises.delete(bundleName);
        }
        
        return loadPromise;
    }
    
    async performBundleLoad(bundleName, options) {
        const { priority, timeout, retries } = options;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const bundleUrl = `${this.basePath}${bundleName}.css`;
                
                // Create link element
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = bundleUrl;
                link.media = 'all';
                
                // Set loading priority
                if (priority === 'high') {
                    link.fetchPriority = 'high';
                } else if (priority === 'low') {
                    link.fetchPriority = 'low';
                }
                
                // Create promise for loading
                const loadPromise = new Promise((resolve, reject) => {
                    const timeoutId = setTimeout(() => {
                        reject(new Error(`Timeout loading ${bundleName}`));
                    }, timeout);
                    
                    link.onload = () => {
                        clearTimeout(timeoutId);
                        resolve();
                    };
                    
                    link.onerror = () => {
                        clearTimeout(timeoutId);
                        reject(new Error(`Failed to load ${bundleName}`));
                    };
                });
                
                // Add to document
                document.head.appendChild(link);
                
                // Wait for load
                await loadPromise;
                
                return; // Success - exit retry loop
                
            } catch (error) {
                if (attempt === retries) {
                    throw error; // Final attempt failed
                }
                
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }
    
    /**
     * Load multiple bundles
     * @param {string[]} bundleNames - Array of bundle names
     * @param {object} options - Loading options
     * @returns {Promise} - Promise that resolves when all bundles are loaded
     */
    async loadBundles(bundleNames, options = {}) {
        const { parallel = true } = options;
        
        if (parallel) {
            // Load all bundles in parallel
            const loadPromises = bundleNames.map(bundleName => 
                this.loadBundle(bundleName, options)
            );
            return Promise.all(loadPromises);
        } else {
            // Load bundles sequentially
            for (const bundleName of bundleNames) {
                await this.loadBundle(bundleName, options);
            }
        }
    }
    
    /**
     * Load CSS for a specific page
     * @param {string} pageName - Name of the page
     * @param {object} options - Loading options
     */
    async loadPageCSS(pageName, options = {}) {
        const pageMapping = this.manifest?.pages || {};
        const bundleNames = pageMapping[pageName] || pageMapping['default'] || [];
        
        // Separate bundles by priority
        const criticalBundles = bundleNames.filter(name => 
            this.manifest?.bundles?.[name]?.priority === 'high'
        );
        const normalBundles = bundleNames.filter(name => 
            this.manifest?.bundles?.[name]?.priority === 'medium'
        );
        const lowPriorityBundles = bundleNames.filter(name => 
            this.manifest?.bundles?.[name]?.priority === 'low'
        );
        
        // Load critical bundles first
        if (criticalBundles.length > 0) {
            await this.loadBundles(criticalBundles, { ...options, priority: 'high' });
        }
        
        // Load normal bundles
        if (normalBundles.length > 0) {
            await this.loadBundles(normalBundles, { ...options, priority: 'normal' });
        }
        
        // Load low priority bundles (can be delayed)
        if (lowPriorityBundles.length > 0) {
            // Use requestIdleCallback if available
            if (window.requestIdleCallback) {
                window.requestIdleCallback(() => {
                    this.loadBundles(lowPriorityBundles, { ...options, priority: 'low' });
                });
            } else {
                setTimeout(() => {
                    this.loadBundles(lowPriorityBundles, { ...options, priority: 'low' });
                }, 100);
            }
        }
    }
    
    /**
     * Setup intersection observer for lazy loading based on viewport
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) {
            return; // Fallback for older browsers
        }
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const bundleName = element.getAttribute('data-css-bundle');
                    
                    if (bundleName) {
                        this.loadBundle(bundleName, { priority: 'low' });
                        observer.unobserve(element);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
        
        // Observe elements that need lazy-loaded CSS
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('[data-css-bundle]').forEach(element => {
                observer.observe(element);
            });
        });
    }
    
    /**
     * Setup page-specific loading based on current route
     */
    setupPageSpecificLoading() {
        // Get current page from URL or meta tag
        const currentPage = this.getCurrentPage();
        
        if (currentPage) {
            // Load page-specific CSS immediately
            this.loadPageCSS(currentPage, { priority: 'normal' });
        }
        
        // Listen for route changes (for SPAs)
        window.addEventListener('popstate', () => {
            const newPage = this.getCurrentPage();
            if (newPage) {
                this.loadPageCSS(newPage, { priority: 'normal' });
            }
        });
    }
    
    /**
     * Get current page identifier
     * @returns {string} - Current page name
     */
    getCurrentPage() {
        // Try to get from meta tag
        const metaPage = document.querySelector('meta[name="page"]');
        if (metaPage) {
            return metaPage.getAttribute('content');
        }
        
        // Try to get from URL path
        const path = window.location.pathname;
        if (path === '/' || path === '/dashboard') {
            return 'dashboard';
        } else if (path.startsWith('/lesson')) {
            return 'lesson';
        } else if (path.startsWith('/auth') || path.startsWith('/login')) {
            return 'auth';
        } else if (path.startsWith('/profile')) {
            return 'profile';
        }
        
        return 'default';
    }
    
    /**
     * Preload CSS bundles for anticipated navigation
     * @param {string[]} bundleNames - Array of bundle names to preload
     */
    preloadBundles(bundleNames) {
        bundleNames.forEach(bundleName => {
            if (!this.loadedBundles.has(bundleName)) {
                // Create preload link
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = `${this.basePath}${bundleName}.css`;
                link.as = 'style';
                
                document.head.appendChild(link);
                this.log(`Preloading bundle: ${bundleName}`);
            }
        });
    }
    
    /**
     * Get loading statistics
     * @returns {object} - Loading statistics
     */
    getStats() {
        return {
            loadedBundles: Array.from(this.loadedBundles),
            loadingCount: this.loadingPromises.size,
            manifestLoaded: !!this.manifest
        };
    }
    
    /**
     * Enable/disable debug logging
     * @param {boolean} enabled - Whether to enable debug logging
     */
    setDebug(enabled) {
        this.debug = enabled;
    }
    
    /**
     * Log debug message
     * @param {...any} args - Arguments to log
     */
    log(...args) {
        if (this.debug) {
            console.log('[CSSLazyLoader]', ...args);
        }
    }
}

// Global instance
window.cssLoader = new CSSLazyLoader();

// Export for module usage
export default CSSLazyLoader;
