/**
 * Advanced Performance Monitor
 * Production-ready performance tracking and analytics for template rendering,
 * component loading, user interactions, and system performance
 */

class PerformanceMonitor {
    constructor(config = {}) {
        this.config = {
            enableRealTimeMetrics: true,
            enableUserTiming: true,
            enableResourceTiming: true,
            enableLongTaskTracking: true,
            enableMemoryTracking: true,
            enableErrorTracking: true,
            sampleRate: 1.0, // Track 100% of sessions by default
            batchSize: 50,
            flushInterval: 30000, // 30 seconds
            debug: false,
            apiEndpoint: '/api/performance-metrics',
            localStorage: true,
            ...config
        };
        
        // Performance data storage
        this.metrics = {
            templateRenders: [],
            componentLoads: [],
            userInteractions: [],
            resourceTimings: [],
            errorEvents: [],
            customTimings: [],
            vitals: {},
            sessionData: {}
        };
        
        // Performance observers
        this.observers = new Map();
        
        // Session tracking
        this.sessionId = this.generateSessionId();
        this.sessionStartTime = performance.now();
        this.pageLoadTime = null;
        
        // Batch processing
        this.batchQueue = [];
        this.flushTimer = null;
        
        // Real-time metrics
        this.realTimeMetrics = {
            fps: 0,
            memoryUsage: 0,
            renderTime: 0,
            loadTime: 0
        };
        
        this.init();
    }
    
    init() {
        if (Math.random() > this.config.sampleRate) {
            this.log('Performance monitoring disabled due to sampling rate');
            return;
        }
        
        this.setupPerformanceObservers();
        this.setupEventListeners();
        this.startRealTimeTracking();
        this.trackPageLoad();
        this.setupErrorTracking();
        
        // Initialize Web Vitals tracking
        this.initWebVitals();
        
        this.log('Performance monitoring initialized');
    }
    
    // ===== TEMPLATE RENDERING TRACKING =====
    
    trackTemplateRender(templateName, renderStartTime, renderEndTime, cacheHit = false, context = {}) {
        const renderTime = renderEndTime - renderStartTime;
        const timestamp = Date.now();
        
        const templateMetric = {
            templateName,
            renderTime,
            timestamp,
            cacheHit,
            contextSize: this.getObjectSize(context),
            memoryUsage: this.getMemoryUsage(),
            sessionId: this.sessionId,
            pageUrl: window.location.pathname,
            userAgent: navigator.userAgent.substring(0, 100)
        };
        
        this.metrics.templateRenders.push(templateMetric);
        
        // Real-time update
        this.updateRealTimeMetric('renderTime', renderTime);
        
        // Batch for sending
        this.addToBatch('template_render', templateMetric);
        
        // Performance warning
        if (renderTime > 100) { // 100ms threshold
            this.warn(`Slow template render: ${templateName} took ${renderTime.toFixed(2)}ms`);
        }
        
        this.log(`Template render: ${templateName} (${renderTime.toFixed(2)}ms, cache: ${cacheHit})`);
        
        return templateMetric;
    }
    
    // ===== COMPONENT LOADING TRACKING =====
    
    trackComponentLoad(componentName, loadStartTime, loadEndTime, componentSize = 0, props = {}) {
        const loadTime = loadEndTime - loadStartTime;
        const timestamp = Date.now();
        
        const componentMetric = {
            componentName,
            loadTime,
            timestamp,
            componentSize,
            propsCount: Object.keys(props).length,
            memoryUsage: this.getMemoryUsage(),
            sessionId: this.sessionId,
            renderPath: this.getCurrentRenderPath()
        };
        
        this.metrics.componentLoads.push(componentMetric);
        
        // Real-time update
        this.updateRealTimeMetric('loadTime', loadTime);
        
        // Batch for sending
        this.addToBatch('component_load', componentMetric);
        
        // Performance warning
        if (loadTime > 50) { // 50ms threshold for components
            this.warn(`Slow component load: ${componentName} took ${loadTime.toFixed(2)}ms`);
        }
        
        this.log(`Component load: ${componentName} (${loadTime.toFixed(2)}ms)`);
        
        return componentMetric;
    }
    
    // ===== USER INTERACTION TRACKING =====
    
    trackUserInteraction(interactionType, targetElement, additionalData = {}) {
        const timestamp = Date.now();
        
        const interactionMetric = {
            interactionType,
            targetElement: this.getElementSelector(targetElement),
            timestamp,
            sessionId: this.sessionId,
            pageUrl: window.location.pathname,
            viewportSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            scrollPosition: {
                x: window.scrollX,
                y: window.scrollY
            },
            ...additionalData
        };
        
        this.metrics.userInteractions.push(interactionMetric);
        
        // Batch for sending
        this.addToBatch('user_interaction', interactionMetric);
        
        this.log(`User interaction: ${interactionType} on ${interactionMetric.targetElement}`);
        
        return interactionMetric;
    }
    
    // ===== CUSTOM TIMING TRACKING =====
    
    startTiming(label) {
        const startTime = performance.now();
        
        if (this.config.enableUserTiming) {
            performance.mark(`${label}-start`);
        }
        
        return {
            label,
            startTime,
            end: () => this.endTiming(label, startTime)
        };
    }
    
    endTiming(label, startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (this.config.enableUserTiming) {
            performance.mark(`${label}-end`);
            performance.measure(label, `${label}-start`, `${label}-end`);
        }
        
        const timingMetric = {
            label,
            duration,
            startTime,
            endTime,
            timestamp: Date.now(),
            sessionId: this.sessionId
        };
        
        this.metrics.customTimings.push(timingMetric);
        this.addToBatch('custom_timing', timingMetric);
        
        this.log(`Custom timing: ${label} (${duration.toFixed(2)}ms)`);
        
        return timingMetric;
    }
    
    // ===== PERFORMANCE OBSERVERS =====
    
    setupPerformanceObservers() {
        // Long Task Observer
        if (this.config.enableLongTaskTracking && 'PerformanceObserver' in window) {
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.trackLongTask(entry);
                    }
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                this.observers.set('longtask', longTaskObserver);
            } catch (e) {
                this.warn('Long task tracking not supported');
            }
        }
        
        // Resource Timing Observer
        if (this.config.enableResourceTiming && 'PerformanceObserver' in window) {
            try {
                const resourceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.trackResourceTiming(entry);
                    }
                });
                resourceObserver.observe({ entryTypes: ['resource'] });
                this.observers.set('resource', resourceObserver);
            } catch (e) {
                this.warn('Resource timing tracking not supported');
            }
        }
        
        // Navigation Timing
        if ('PerformanceObserver' in window) {
            try {
                const navigationObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.trackNavigationTiming(entry);
                    }
                });
                navigationObserver.observe({ entryTypes: ['navigation'] });
                this.observers.set('navigation', navigationObserver);
            } catch (e) {
                this.warn('Navigation timing tracking not supported');
            }
        }
    }
    
    trackLongTask(entry) {
        const longTaskMetric = {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now(),
            sessionId: this.sessionId
        };
        
        this.addToBatch('long_task', longTaskMetric);
        this.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
    }
    
    trackResourceTiming(entry) {
        // Only track significant resources
        if (entry.duration < 10) return; // Skip very fast resources
        
        const resourceMetric = {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize || entry.encodedBodySize || 0,
            type: this.getResourceType(entry.name),
            timestamp: Date.now(),
            sessionId: this.sessionId,
            fetchStart: entry.fetchStart,
            responseEnd: entry.responseEnd
        };
        
        this.metrics.resourceTimings.push(resourceMetric);
        this.addToBatch('resource_timing', resourceMetric);
    }
    
    trackNavigationTiming(entry) {
        const navigationMetric = {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            domInteractive: entry.domInteractive - entry.navigationStart,
            firstPaint: entry.responseEnd - entry.requestStart,
            totalLoadTime: entry.loadEventEnd - entry.navigationStart,
            timestamp: Date.now(),
            sessionId: this.sessionId
        };
        
        this.pageLoadTime = navigationMetric.totalLoadTime;
        this.addToBatch('navigation_timing', navigationMetric);
    }
    
    // ===== WEB VITALS TRACKING =====
    
    initWebVitals() {
        // Largest Contentful Paint (LCP)
        this.observeWebVital('largest-contentful-paint', (entries) => {
            const lastEntry = entries[entries.length - 1];
            this.metrics.vitals.lcp = lastEntry.startTime;
            this.addToBatch('web_vital', {
                name: 'LCP',
                value: lastEntry.startTime,
                timestamp: Date.now(),
                sessionId: this.sessionId
            });
        });
        
        // First Input Delay (FID)
        this.observeWebVital('first-input', (entries) => {
            const firstEntry = entries[0];
            this.metrics.vitals.fid = firstEntry.processingStart - firstEntry.startTime;
            this.addToBatch('web_vital', {
                name: 'FID',
                value: firstEntry.processingStart - firstEntry.startTime,
                timestamp: Date.now(),
                sessionId: this.sessionId
            });
        });
        
        // Cumulative Layout Shift (CLS)
        this.observeWebVital('layout-shift', (entries) => {
            let clsValue = 0;
            for (const entry of entries) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.metrics.vitals.cls = clsValue;
            this.addToBatch('web_vital', {
                name: 'CLS',
                value: clsValue,
                timestamp: Date.now(),
                sessionId: this.sessionId
            });
        });
    }
    
    observeWebVital(entryType, callback) {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    callback(list.getEntries());
                });
                observer.observe({ entryTypes: [entryType] });
                this.observers.set(entryType, observer);
            } catch (e) {
                this.warn(`${entryType} tracking not supported`);
            }
        }
    }
    
    // ===== REAL-TIME METRICS =====
    
    startRealTimeTracking() {
        if (!this.config.enableRealTimeMetrics) return;
        
        // FPS tracking
        this.trackFPS();
        
        // Memory tracking
        if (this.config.enableMemoryTracking) {
            setInterval(() => this.trackMemoryUsage(), 5000);
        }
        
        // Regular real-time updates
        setInterval(() => this.updateRealTimeMetrics(), 1000);
    }
    
    trackFPS() {
        let lastTime = performance.now();
        let frames = 0;
        
        const updateFPS = (currentTime) => {
            frames++;
            
            if (currentTime >= lastTime + 1000) {
                this.realTimeMetrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        requestAnimationFrame(updateFPS);
    }
    
    trackMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            this.realTimeMetrics.memoryUsage = {
                used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
                total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
                limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) // MB
            };
        }
    }
    
    updateRealTimeMetric(metric, value) {
        this.realTimeMetrics[metric] = value;
    }
    
    updateRealTimeMetrics() {
        // Emit real-time metrics event
        this.emit('realTimeMetrics', this.realTimeMetrics);
    }
    
    // ===== EVENT SYSTEM =====
    
    setupEventListeners() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.trackUserInteraction('visibility_change', document, {
                hidden: document.hidden
            });
        });
        
        // Track major user interactions
        ['click', 'scroll', 'keydown', 'resize'].forEach(eventType => {
            window.addEventListener(eventType, (event) => {
                this.throttleTrackInteraction(eventType, event.target, event);
            }, { passive: true });
        });
        
        // Track page unload
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
            this.flush();
        });
    }
    
    throttleTrackInteraction = this.throttle((eventType, target, event) => {
        const additionalData = {};
        
        if (eventType === 'scroll') {
            additionalData.scrollTop = window.scrollY;
            additionalData.scrollHeight = document.documentElement.scrollHeight;
        } else if (eventType === 'resize') {
            additionalData.windowSize = {
                width: window.innerWidth,
                height: window.innerHeight
            };
        }
        
        this.trackUserInteraction(eventType, target, additionalData);
    }, 100);
    
    // ===== ERROR TRACKING =====
    
    setupErrorTracking() {
        if (!this.config.enableErrorTracking) return;
        
        window.addEventListener('error', (event) => {
            this.trackError({
                type: 'javascript_error',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError({
                type: 'unhandled_promise',
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack
            });
        });
    }
    
    trackError(errorData) {
        const errorMetric = {
            ...errorData,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            url: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100)
        };
        
        this.metrics.errorEvents.push(errorMetric);
        this.addToBatch('error', errorMetric);
        
        this.error('Performance Monitor Error:', errorData);
    }
    
    // ===== DATA MANAGEMENT =====
    
    addToBatch(type, data) {
        this.batchQueue.push({
            type,
            data,
            timestamp: Date.now()
        });
        
        if (this.batchQueue.length >= this.config.batchSize) {
            this.flush();
        } else if (!this.flushTimer) {
            this.flushTimer = setTimeout(() => this.flush(), this.config.flushInterval);
        }
    }
    
    async flush() {
        if (this.batchQueue.length === 0) return;
        
        const batch = [...this.batchQueue];
        this.batchQueue = [];
        
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
        
        try {
            await this.sendMetrics(batch);
            this.log(`Flushed ${batch.length} metrics to server`);
        } catch (error) {
            this.error('Failed to send metrics:', error);
            
            // Store in localStorage as fallback
            if (this.config.localStorage) {
                this.storeMetricsLocally(batch);
            }
        }
    }
    
    async sendMetrics(batch) {
        const payload = {
            sessionId: this.sessionId,
            sessionStartTime: this.sessionStartTime,
            pageLoadTime: this.pageLoadTime,
            metrics: batch,
            realTimeMetrics: this.realTimeMetrics,
            browserInfo: this.getBrowserInfo(),
            timestamp: Date.now()
        };
        
        const response = await fetch(this.config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
    }
    
    storeMetricsLocally(batch) {
        try {
            const stored = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
            stored.push(...batch);
            
            // Keep only last 1000 entries
            if (stored.length > 1000) {
                stored.splice(0, stored.length - 1000);
            }
            
            localStorage.setItem('performance_metrics', JSON.stringify(stored));
        } catch (error) {
            this.error('Failed to store metrics locally:', error);
        }
    }
    
    // ===== ANALYTICS & REPORTING =====
    
    getAnalytics() {
        return {
            session: {
                id: this.sessionId,
                startTime: this.sessionStartTime,
                duration: performance.now() - this.sessionStartTime,
                pageLoadTime: this.pageLoadTime
            },
            templateRenders: this.analyzeTemplateRenders(),
            componentLoads: this.analyzeComponentLoads(),
            userInteractions: this.analyzeUserInteractions(),
            webVitals: this.metrics.vitals,
            realTimeMetrics: this.realTimeMetrics,
            errors: this.metrics.errorEvents.length,
            performance: this.getPerformanceSummary()
        };
    }
    
    analyzeTemplateRenders() {
        const renders = this.metrics.templateRenders;
        if (renders.length === 0) return null;
        
        const renderTimes = renders.map(r => r.renderTime);
        const cacheHitRate = renders.filter(r => r.cacheHit).length / renders.length * 100;
        
        return {
            count: renders.length,
            averageRenderTime: this.average(renderTimes),
            medianRenderTime: this.median(renderTimes),
            maxRenderTime: Math.max(...renderTimes),
            cacheHitRate: cacheHitRate.toFixed(1),
            slowRenders: renders.filter(r => r.renderTime > 100).length
        };
    }
    
    analyzeComponentLoads() {
        const loads = this.metrics.componentLoads;
        if (loads.length === 0) return null;
        
        const loadTimes = loads.map(l => l.loadTime);
        
        return {
            count: loads.length,
            averageLoadTime: this.average(loadTimes),
            medianLoadTime: this.median(loadTimes),
            maxLoadTime: Math.max(...loadTimes),
            slowLoads: loads.filter(l => l.loadTime > 50).length
        };
    }
    
    analyzeUserInteractions() {
        const interactions = this.metrics.userInteractions;
        if (interactions.length === 0) return null;
        
        const interactionTypes = {};
        interactions.forEach(i => {
            interactionTypes[i.interactionType] = (interactionTypes[i.interactionType] || 0) + 1;
        });
        
        return {
            count: interactions.length,
            types: interactionTypes,
            sessionEngagement: this.calculateEngagement()
        };
    }
    
    getPerformanceSummary() {
        return {
            fps: this.realTimeMetrics.fps,
            memoryUsage: this.realTimeMetrics.memoryUsage,
            longTasks: this.batchQueue.filter(b => b.type === 'long_task').length,
            resourceTimings: this.metrics.resourceTimings.length,
            errorCount: this.metrics.errorEvents.length
        };
    }
    
    // ===== UTILITY METHODS =====
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getElementSelector(element) {
        if (!element) return 'unknown';
        
        let selector = element.tagName?.toLowerCase() || 'unknown';
        if (element.id) selector += `#${element.id}`;
        if (element.className) selector += `.${element.className.split(' ').join('.')}`;
        
        return selector;
    }
    
    getCurrentRenderPath() {
        return window.location.pathname;
    }
    
    getResourceType(url) {
        const extension = url.split('.').pop()?.toLowerCase();
        const typeMap = {
            'js': 'script',
            'css': 'stylesheet',
            'png': 'image',
            'jpg': 'image',
            'jpeg': 'image',
            'gif': 'image',
            'svg': 'image',
            'woff': 'font',
            'woff2': 'font',
            'ttf': 'font'
        };
        return typeMap[extension] || 'other';
    }
    
    getObjectSize(obj) {
        try {
            return JSON.stringify(obj).length;
        } catch {
            return 0;
        }
    }
    
    getMemoryUsage() {
        if ('memory' in performance) {
            return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        return 0;
    }
    
    getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }
    
    trackSessionEnd() {
        const sessionData = {
            sessionId: this.sessionId,
            duration: performance.now() - this.sessionStartTime,
            pageViews: 1, // Could be enhanced for SPA
            interactions: this.metrics.userInteractions.length,
            errors: this.metrics.errorEvents.length,
            endTime: Date.now()
        };
        
        this.addToBatch('session_end', sessionData);
    }
    
    trackPageLoad() {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.pageLoadTime = loadTime;
            
            this.addToBatch('page_load', {
                loadTime,
                sessionId: this.sessionId,
                url: window.location.href,
                timestamp: Date.now()
            });
        });
    }
    
    calculateEngagement() {
        const interactions = this.metrics.userInteractions.length;
        const sessionDuration = (performance.now() - this.sessionStartTime) / 1000; // seconds
        
        if (sessionDuration < 10) return 'low';
        
        const engagementRate = interactions / sessionDuration;
        
        if (engagementRate > 0.1) return 'high';
        if (engagementRate > 0.05) return 'medium';
        return 'low';
    }
    
    // ===== STATISTICAL HELPERS =====
    
    average(arr) {
        return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    }
    
    median(arr) {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        
        return function (...args) {
            const currentTime = Date.now();
            
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
    
    // ===== EVENT EMITTER =====
    
    emit(eventName, data) {
        const event = new CustomEvent(`performance:${eventName}`, {
            detail: data
        });
        window.dispatchEvent(event);
    }
    
    // ===== LOGGING =====
    
    log(...args) {
        if (this.config.debug) {
            console.log('[PerformanceMonitor]', ...args);
        }
    }
    
    warn(...args) {
        if (this.config.debug) {
            console.warn('[PerformanceMonitor]', ...args);
        }
    }
    
    error(...args) {
        console.error('[PerformanceMonitor]', ...args);
    }
}

// ===== HELPER FUNCTIONS =====

// Easy template render tracking
function trackTemplateRender(templateName, renderFunction, context = {}) {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();
    
    if (window.performanceMonitor) {
        window.performanceMonitor.trackTemplateRender(templateName, startTime, endTime, false, context);
    }
    
    return result;
}

// Easy component load tracking
function trackComponentLoad(componentName, loadFunction, props = {}) {
    const startTime = performance.now();
    const result = loadFunction();
    const endTime = performance.now();
    
    if (window.performanceMonitor) {
        window.performanceMonitor.trackComponentLoad(componentName, startTime, endTime, 0, props);
    }
    
    return result;
}

// Performance decorator for functions
function withPerformanceTracking(label) {
    return function(target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        
        descriptor.value = function(...args) {
            const timer = window.performanceMonitor?.startTiming(`${label}_${propertyKey}`);
            
            try {
                const result = originalMethod.apply(this, args);
                
                if (result instanceof Promise) {
                    return result.finally(() => timer?.end());
                } else {
                    timer?.end();
                    return result;
                }
            } catch (error) {
                timer?.end();
                throw error;
            }
        };
        
        return descriptor;
    };
}

// ===== INITIALIZATION =====

// Auto-initialize performance monitoring
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with default config
    window.performanceMonitor = new PerformanceMonitor({
        debug: localStorage.getItem('performance_debug') === 'true',
        sampleRate: parseFloat(localStorage.getItem('performance_sample_rate')) || 1.0
    });
    
    // Make tracking functions globally available
    window.trackTemplateRender = trackTemplateRender;
    window.trackComponentLoad = trackComponentLoad;
    window.withPerformanceTracking = withPerformanceTracking;
    
    console.log('Performance monitoring initialized');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PerformanceMonitor, trackTemplateRender, trackComponentLoad, withPerformanceTracking };
}
