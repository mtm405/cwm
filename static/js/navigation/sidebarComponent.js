/**
 * Sidebar Component
 * Enhanced sidebar management with responsive behavior and accessibility
 * Phase 6 - Navigation & Activity System
 */

class SidebarComponent {
    constructor(options = {}) {
        this.config = {
            selector: options.selector || '.sidebar',
            toggleSelector: options.toggleSelector || '.sidebar-toggle',
            overlaySelector: options.overlaySelector || '.sidebar-overlay',
            breakpoint: options.breakpoint || 768,
            animationDuration: options.animationDuration || 300,
            persistent: options.persistent !== false,
            autoClose: options.autoClose !== false,
            gestureSupport: options.gestureSupport !== false,
            ...options
        };
        
        this.state = {
            isOpen: false,
            isAnimating: false,
            isMobile: window.innerWidth <= this.config.breakpoint,
            gestureStartX: 0,
            gestureCurrentX: 0,
            isDragging: false
        };
        
        this.elements = {};
        this.observers = new Set();
        this.gestureThreshold = 50;
        
        this.init();
    }
    
    /**
     * Initialize sidebar component
     */
    init() {
        this.findElements();
        this.setupEventListeners();
        this.setupGestureSupport();
        this.setupAccessibility();
        this.restoreState();
        
        console.log('📋 Sidebar Component initialized');
    }
    
    /**
     * Find and cache DOM elements
     */
    findElements() {
        this.elements.sidebar = document.querySelector(this.config.selector);
        this.elements.toggle = document.querySelector(this.config.toggleSelector);
        this.elements.overlay = document.querySelector(this.config.overlaySelector);
        
        if (!this.elements.sidebar) {
            console.warn('Sidebar element not found:', this.config.selector);
            return;
        }
        
        // Create overlay if it doesn't exist
        if (!this.elements.overlay) {
            this.createOverlay();
        }
        
        // Create toggle button if it doesn't exist
        if (!this.elements.toggle) {
            this.createToggleButton();
        }
    }
    
    /**
     * Create overlay element
     */
    createOverlay() {
        this.elements.overlay = document.createElement('div');
        this.elements.overlay.className = 'sidebar-overlay';
        this.elements.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: opacity ${this.config.animationDuration}ms ease,
                        visibility ${this.config.animationDuration}ms ease;
        `;
        document.body.appendChild(this.elements.overlay);
    }
    
    /**
     * Create toggle button
     */
    createToggleButton() {
        this.elements.toggle = document.createElement('button');
        this.elements.toggle.className = 'sidebar-toggle';
        this.elements.toggle.innerHTML = `
            <span class="sr-only">Toggle sidebar</span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        this.elements.toggle.setAttribute('aria-expanded', 'false');
        this.elements.toggle.setAttribute('aria-controls', this.elements.sidebar.id || 'sidebar');
        
        // Add to appropriate container
        const navbar = document.querySelector('.navbar, .header');
        if (navbar) {
            navbar.appendChild(this.elements.toggle);
        } else {
            document.body.appendChild(this.elements.toggle);
        }
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Toggle button click
        if (this.elements.toggle) {
            this.elements.toggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }
        
        // Overlay click
        if (this.elements.overlay) {
            this.elements.overlay.addEventListener('click', () => {
                this.close();
            });
        }
        
        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
        
        // Click outside to close
        if (this.config.autoClose) {
            document.addEventListener('click', (e) => {
                this.handleOutsideClick(e);
            });
        }
        
        // Focus management
        this.elements.sidebar.addEventListener('focusin', () => {
            this.handleFocusIn();
        });
        
        this.elements.sidebar.addEventListener('focusout', (e) => {
            this.handleFocusOut(e);
        });
    }
    
    /**
     * Set up gesture support for mobile
     */
    setupGestureSupport() {
        if (!this.config.gestureSupport) return;
        
        // Touch events for swipe gestures
        document.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });
        
        // Mouse events for desktop drag simulation
        this.elements.sidebar.addEventListener('mousedown', (e) => {
            this.handleMouseDown(e);
        });
        
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        document.addEventListener('mouseup', (e) => {
            this.handleMouseUp(e);
        });
    }
    
    /**
     * Set up accessibility features
     */
    setupAccessibility() {
        if (!this.elements.sidebar.hasAttribute('role')) {
            this.elements.sidebar.setAttribute('role', 'navigation');
        }
        
        if (!this.elements.sidebar.hasAttribute('aria-label')) {
            this.elements.sidebar.setAttribute('aria-label', 'Main navigation');
        }
        
        // Add landmark role
        this.elements.sidebar.setAttribute('aria-hidden', 'true');
        
        // Focus trap elements
        this.focusableElements = this.getFocusableElements();
        this.firstFocusable = this.focusableElements[0];
        this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
    }
    
    /**
     * Open sidebar
     */
    open() {
        if (this.state.isOpen || this.state.isAnimating) return;
        
        this.state.isAnimating = true;
        this.state.isOpen = true;
        
        // Add classes
        this.elements.sidebar.classList.add('sidebar-open');
        document.body.classList.add('sidebar-open');
        
        // Show overlay on mobile
        if (this.state.isMobile && this.elements.overlay) {
            this.elements.overlay.style.visibility = 'visible';
            this.elements.overlay.style.opacity = '1';
        }
        
        // Update toggle button
        if (this.elements.toggle) {
            this.elements.toggle.classList.add('active');
            this.elements.toggle.setAttribute('aria-expanded', 'true');
        }
        
        // Accessibility
        this.elements.sidebar.setAttribute('aria-hidden', 'false');
        
        // Focus management
        this.trapFocus();
        
        // Animation end handler
        const handleTransitionEnd = () => {
            this.state.isAnimating = false;
            this.elements.sidebar.removeEventListener('transitionend', handleTransitionEnd);
            this.notifyObservers('opened');
        };
        
        this.elements.sidebar.addEventListener('transitionend', handleTransitionEnd);
        
        // Fallback for animation end
        setTimeout(() => {
            if (this.state.isAnimating) {
                this.state.isAnimating = false;
                this.notifyObservers('opened');
            }
        }, this.config.animationDuration + 50);
        
        // Save state
        this.saveState();
        
        this.notifyObservers('opening');
    }
    
    /**
     * Close sidebar
     */
    close() {
        if (!this.state.isOpen || this.state.isAnimating) return;
        
        this.state.isAnimating = true;
        this.state.isOpen = false;
        
        // Remove classes
        this.elements.sidebar.classList.remove('sidebar-open');
        document.body.classList.remove('sidebar-open');
        
        // Hide overlay
        if (this.elements.overlay) {
            this.elements.overlay.style.opacity = '0';
            this.elements.overlay.style.visibility = 'hidden';
        }
        
        // Update toggle button
        if (this.elements.toggle) {
            this.elements.toggle.classList.remove('active');
            this.elements.toggle.setAttribute('aria-expanded', 'false');
        }
        
        // Accessibility
        this.elements.sidebar.setAttribute('aria-hidden', 'true');
        
        // Release focus trap
        this.releaseFocus();
        
        // Animation end handler
        const handleTransitionEnd = () => {
            this.state.isAnimating = false;
            this.elements.sidebar.removeEventListener('transitionend', handleTransitionEnd);
            this.notifyObservers('closed');
        };
        
        this.elements.sidebar.addEventListener('transitionend', handleTransitionEnd);
        
        // Fallback for animation end
        setTimeout(() => {
            if (this.state.isAnimating) {
                this.state.isAnimating = false;
                this.notifyObservers('closed');
            }
        }, this.config.animationDuration + 50);
        
        // Save state
        this.saveState();
        
        this.notifyObservers('closing');
    }
    
    /**
     * Toggle sidebar
     */
    toggle() {
        if (this.state.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        const wasMobile = this.state.isMobile;
        this.state.isMobile = window.innerWidth <= this.config.breakpoint;
        
        // Close sidebar when switching to mobile
        if (!wasMobile && this.state.isMobile && this.state.isOpen) {
            this.close();
        }
        
        // Adjust sidebar for desktop/mobile
        if (this.state.isMobile !== wasMobile) {
            this.adjustForViewport();
        }
        
        this.notifyObservers('resize', {
            isMobile: this.state.isMobile,
            width: window.innerWidth
        });
    }
    
    /**
     * Adjust sidebar for current viewport
     */
    adjustForViewport() {
        if (this.state.isMobile) {
            // Mobile adjustments
            this.elements.sidebar.style.transform = this.state.isOpen ? 'translateX(0)' : 'translateX(-100%)';
        } else {
            // Desktop adjustments
            this.elements.sidebar.style.transform = '';
            if (this.elements.overlay) {
                this.elements.overlay.style.visibility = 'hidden';
                this.elements.overlay.style.opacity = '0';
            }
        }
    }
    
    /**
     * Handle keyboard events
     */
    handleKeydown(e) {
        if (!this.state.isOpen) return;
        
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
                
            case 'Tab':
                this.handleTabKey(e);
                break;
        }
    }
    
    /**
     * Handle tab key for focus trapping
     */
    handleTabKey(e) {
        if (!this.focusableElements.length) return;
        
        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === this.firstFocusable) {
                e.preventDefault();
                this.lastFocusable.focus();
            }
        } else {
            // Tab
            if (document.activeElement === this.lastFocusable) {
                e.preventDefault();
                this.firstFocusable.focus();
            }
        }
    }
    
    /**
     * Handle outside click
     */
    handleOutsideClick(e) {
        if (!this.state.isOpen) return;
        
        if (!this.elements.sidebar.contains(e.target) && 
            !this.elements.toggle.contains(e.target)) {
            this.close();
        }
    }
    
    /**
     * Handle focus in
     */
    handleFocusIn() {
        this.focusableElements = this.getFocusableElements();
        this.firstFocusable = this.focusableElements[0];
        this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];
    }
    
    /**
     * Handle focus out
     */
    handleFocusOut(e) {
        // Check if focus is moving outside sidebar
        if (!this.elements.sidebar.contains(e.relatedTarget)) {
            // Focus is leaving sidebar
        }
    }
    
    /**
     * Handle touch start for gestures
     */
    handleTouchStart(e) {
        if (!this.state.isMobile) return;
        
        const touch = e.touches[0];
        this.state.gestureStartX = touch.clientX;
        this.state.gestureCurrentX = touch.clientX;
        
        // Enable gesture if touch starts from edge or sidebar is open
        if (touch.clientX < 20 || this.state.isOpen) {
            this.state.isDragging = true;
        }
    }
    
    /**
     * Handle touch move for gestures
     */
    handleTouchMove(e) {
        if (!this.state.isDragging) return;
        
        const touch = e.touches[0];
        this.state.gestureCurrentX = touch.clientX;
        const deltaX = this.state.gestureCurrentX - this.state.gestureStartX;
        
        // Update sidebar position during drag
        if (this.state.isOpen) {
            // Closing gesture
            if (deltaX < 0) {
                const progress = Math.max(0, 1 + deltaX / this.elements.sidebar.offsetWidth);
                this.elements.sidebar.style.transform = `translateX(${-100 * (1 - progress)}%)`;
                if (this.elements.overlay) {
                    this.elements.overlay.style.opacity = progress * 0.5;
                }
            }
        } else {
            // Opening gesture
            if (deltaX > 0) {
                const progress = Math.min(1, deltaX / this.elements.sidebar.offsetWidth);
                this.elements.sidebar.style.transform = `translateX(${-100 * (1 - progress)}%)`;
                if (this.elements.overlay) {
                    this.elements.overlay.style.opacity = progress * 0.5;
                    this.elements.overlay.style.visibility = 'visible';
                }
            }
        }
        
        // Prevent scrolling during gesture
        if (Math.abs(deltaX) > 10) {
            e.preventDefault();
        }
    }
    
    /**
     * Handle touch end for gestures
     */
    handleTouchEnd(e) {
        if (!this.state.isDragging) return;
        
        this.state.isDragging = false;
        const deltaX = this.state.gestureCurrentX - this.state.gestureStartX;
        
        // Reset sidebar transform
        this.elements.sidebar.style.transform = '';
        
        if (this.state.isOpen) {
            // Closing gesture
            if (deltaX < -this.gestureThreshold) {
                this.close();
            } else {
                // Snap back open
                this.open();
            }
        } else {
            // Opening gesture
            if (deltaX > this.gestureThreshold) {
                this.open();
            } else {
                // Snap back closed
                this.close();
            }
        }
    }
    
    /**
     * Handle mouse down for desktop drag
     */
    handleMouseDown(e) {
        if (this.state.isMobile) return;
        
        this.state.gestureStartX = e.clientX;
        this.state.isDragging = true;
        this.elements.sidebar.style.userSelect = 'none';
    }
    
    /**
     * Handle mouse move for desktop drag
     */
    handleMouseMove(e) {
        if (!this.state.isDragging || this.state.isMobile) return;
        
        this.state.gestureCurrentX = e.clientX;
        // Desktop drag implementation could be added here
    }
    
    /**
     * Handle mouse up for desktop drag
     */
    handleMouseUp(e) {
        if (!this.state.isDragging || this.state.isMobile) return;
        
        this.state.isDragging = false;
        this.elements.sidebar.style.userSelect = '';
        // Complete desktop drag implementation
    }
    
    /**
     * Get focusable elements within sidebar
     */
    getFocusableElements() {
        const selector = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
        return Array.from(this.elements.sidebar.querySelectorAll(selector))
            .filter(el => !el.disabled && !el.hasAttribute('aria-hidden'));
    }
    
    /**
     * Trap focus within sidebar
     */
    trapFocus() {
        if (this.firstFocusable) {
            this.firstFocusable.focus();
        }
    }
    
    /**
     * Release focus trap
     */
    releaseFocus() {
        if (this.elements.toggle) {
            this.elements.toggle.focus();
        }
    }
    
    /**
     * Save sidebar state
     */
    saveState() {
        if (this.config.persistent) {
            localStorage.setItem('sidebar-state', JSON.stringify({
                isOpen: this.state.isOpen,
                timestamp: Date.now()
            }));
        }
    }
    
    /**
     * Restore sidebar state
     */
    restoreState() {
        if (!this.config.persistent) return;
        
        try {
            const savedState = JSON.parse(localStorage.getItem('sidebar-state') || '{}');
            const isRecent = Date.now() - (savedState.timestamp || 0) < 24 * 60 * 60 * 1000; // 24 hours
            
            if (savedState.isOpen && isRecent && !this.state.isMobile) {
                this.open();
            }
        } catch (error) {
            console.warn('Failed to restore sidebar state:', error);
        }
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
                console.error('Sidebar observer error:', error);
            }
        });
    }
    
    /**
     * Get current state
     */
    getState() {
        return {
            isOpen: this.state.isOpen,
            isAnimating: this.state.isAnimating,
            isMobile: this.state.isMobile
        };
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Re-initialize if needed
        if (newConfig.gestureSupport !== undefined) {
            this.setupGestureSupport();
        }
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
     * Destroy sidebar component
     */
    destroy() {
        // Remove event listeners
        // Clean up elements
        this.observers.clear();
        
        console.log('📋 Sidebar Component destroyed');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarComponent;
} else {
    window.SidebarComponent = SidebarComponent;
}
