/**
 * Performance Monitor - Lightweight performance tracking
 * Code with Morais - Application Performance Monitoring
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.observers = new Map();
        this.initialized = false;
    }
    
    /**
     * Initialize performance monitoring
     */
    init() {
        if (this.initialized) return;
        
        try {
            // Start basic performance tracking
            this.trackPageLoad();
            this.trackNetworkRequests();
            this.setupPerformanceObserver();
            
            this.initialized = true;
            console.log('✅ PerformanceMonitor initialized');
            
        } catch (error) {
            console.warn('⚠️ PerformanceMonitor initialization failed:', error);
        }
    }
    
    /**
     * Track page load performance
     */
    trackPageLoad() {
        if (typeof performance !== 'undefined' && performance.timing) {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            this.recordMetric('page_load_time', loadTime);
        }
    }
    
    /**
     * Track network requests
     */
    trackNetworkRequests() {
        // Simple request tracking
        if (typeof performance !== 'undefined' && performance.getEntriesByType) {
            const requests = performance.getEntriesByType('resource');
            const slowRequests = requests.filter(req => req.duration > 1000);
            
            this.recordMetric('slow_requests_count', slowRequests.length);
        }
    }
    
    /**
     * Setup performance observer for modern browsers
     */
    setupPerformanceObserver() {
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.recordMetric(`${entry.entryType}_${entry.name}`, entry.duration);
                    }
                });
                
                observer.observe({ entryTypes: ['measure', 'navigation'] });
                this.observers.set('main', observer);
                
            } catch (error) {
                console.warn('⚠️ PerformanceObserver setup failed:', error);
            }
        }
    }
    
    /**
     * Record a performance metric
     */
    recordMetric(name, value) {
        this.metrics.set(name, {
            value,
            timestamp: Date.now()
        });
    }
    
    /**
     * Get all metrics
     */
    getMetrics() {
        return Object.fromEntries(this.metrics);
    }
    
    /**
     * Get specific metric
     */
    getMetric(name) {
        return this.metrics.get(name);
    }
    
    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.metrics.clear();
    }
    
    /**
     * Destroy performance monitor
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.metrics.clear();
        this.initialized = false;
    }
}

// Export for module loader
if (typeof window !== 'undefined') {
    window.PerformanceMonitor = PerformanceMonitor;
}
