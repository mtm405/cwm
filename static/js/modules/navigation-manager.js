/**
 * Navigation Manager - Enhanced navigation with mobile support and accessibility
 * Code with Morais - Navigation System
 */

class NavigationManager {
    constructor() {
        this.mobileMenuOpen = false;
        this.dropdownsOpen = new Set();
        this.scrollThreshold = 100;
        this.lastScrollY = window.scrollY;
        this.init();
    }
    
    /**
     * Initialize navigation management system
     */
    init() {
        this.setupMobileMenu();
        this.setupDropdowns();
        this.setupKeyboardNavigation();
        this.setupScrollEffects();
        this.setupAccessibility();
        console.log('🧭 Navigation Manager initialized');
    }
    
    /**
     * Set up mobile menu functionality
     */
    setupMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
            
            // Close mobile menu when clicking on a link
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        this.closeMobileMenu();
                    }
                });
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            });
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768 && this.mobileMenuOpen) {
                    this.closeMobileMenu();
                }
            });
            
            // Close mobile menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.mobileMenuOpen) {
                    this.closeMobileMenu();
                }
            });
        }
    }
    
    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        this.mobileMenuOpen = !this.mobileMenuOpen;
        
        if (navLinks) {
            navLinks.classList.toggle('mobile-active', this.mobileMenuOpen);
            navLinks.setAttribute('aria-expanded', this.mobileMenuOpen.toString());
        }
        
        if (mobileToggle) {
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                icon.className = this.mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars';
            }
            mobileToggle.setAttribute('aria-expanded', this.mobileMenuOpen.toString());
        }
        
        // Prevent body scroll when mobile menu is open
        document.body.classList.toggle('mobile-menu-open', this.mobileMenuOpen);
        
        // Focus management for accessibility
        if (this.mobileMenuOpen) {
            this.focusFirstMenuItem();
        }
    }
    
    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (this.mobileMenuOpen) {
            this.toggleMobileMenu();
        }
    }
    
    /**
     * Focus first menu item for accessibility
     */
    focusFirstMenuItem() {
        const firstMenuItem = document.querySelector('.nav-links a');
        if (firstMenuItem) {
            firstMenuItem.focus();
        }
    }
    
    /**
     * Set up dropdown menus
     */
    setupDropdowns() {
        const dropdowns = document.querySelectorAll('.user-dropdown, .dropdown');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.dropdown-trigger, .user-avatar, .user-name');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (trigger && menu) {
                // Click to toggle
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleDropdown(dropdown);
                });
                
                // Keyboard support
                trigger.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleDropdown(dropdown);
                    }
                });
                
                // Set up ARIA attributes
                trigger.setAttribute('aria-haspopup', 'true');
                trigger.setAttribute('aria-expanded', 'false');
                menu.setAttribute('role', 'menu');
            }
        });
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });
        
        // Close dropdowns on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }
    
    /**
     * Toggle dropdown menu
     */
    toggleDropdown(dropdown) {
        const isOpen = this.dropdownsOpen.has(dropdown);
        
        if (isOpen) {
            this.closeDropdown(dropdown);
        } else {
            this.closeAllDropdowns(); // Close other dropdowns first
            this.openDropdown(dropdown);
        }
    }
    
    /**
     * Open dropdown menu
     */
    openDropdown(dropdown) {
        dropdown.classList.add('active');
        this.dropdownsOpen.add(dropdown);
        
        // Update ARIA attributes
        const trigger = dropdown.querySelector('.dropdown-trigger, .user-avatar, .user-name');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'true');
        }
        
        // Animate dropdown appearance
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';
            
            requestAnimationFrame(() => {
                menu.style.transition = 'all 0.3s ease';
                menu.style.opacity = '1';
                menu.style.transform = 'translateY(0)';
            });
        }
        
        // Focus first menu item
        this.focusFirstDropdownItem(dropdown);
    }
    
    /**
     * Close dropdown menu
     */
    closeDropdown(dropdown) {
        dropdown.classList.remove('active');
        this.dropdownsOpen.delete(dropdown);
        
        // Update ARIA attributes
        const trigger = dropdown.querySelector('.dropdown-trigger, .user-avatar, .user-name');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
        }
        
        const menu = dropdown.querySelector('.dropdown-menu');
        if (menu) {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(-10px)';
        }
    }
    
    /**
     * Close all open dropdowns
     */
    closeAllDropdowns() {
        this.dropdownsOpen.forEach(dropdown => {
            this.closeDropdown(dropdown);
        });
    }
    
    /**
     * Focus first dropdown item for accessibility
     */
    focusFirstDropdownItem(dropdown) {
        const firstItem = dropdown.querySelector('.dropdown-menu a, .dropdown-menu button');
        if (firstItem) {
            firstItem.focus();
        }
    }
    
    /**
     * Set up keyboard navigation
     */
    setupKeyboardNavigation() {
        // Navigation links keyboard support
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (index + 1) % navLinks.length;
                    navLinks[nextIndex].focus();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = (index - 1 + navLinks.length) % navLinks.length;
                    navLinks[prevIndex].focus();
                }
            });
        });
        
        // Dropdown menu keyboard navigation
        document.addEventListener('keydown', (e) => {
            const activeDropdown = document.querySelector('.dropdown.active');
            if (activeDropdown && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                e.preventDefault();
                this.navigateDropdownItems(activeDropdown, e.key === 'ArrowDown' ? 1 : -1);
            }
        });
    }
    
    /**
     * Navigate dropdown items with keyboard
     */
    navigateDropdownItems(dropdown, direction) {
        const items = dropdown.querySelectorAll('.dropdown-menu a, .dropdown-menu button');
        const currentIndex = Array.from(items).indexOf(document.activeElement);
        
        if (currentIndex !== -1) {
            const nextIndex = (currentIndex + direction + items.length) % items.length;
            items[nextIndex].focus();
        } else if (items.length > 0) {
            items[0].focus();
        }
    }
    
    /**
     * Set up scroll effects for navbar
     */
    setupScrollEffects() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Hide/show navbar on scroll
            if (currentScrollY > this.lastScrollY && currentScrollY > this.scrollThreshold) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            // Add backdrop blur effect when scrolled
            if (currentScrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            this.lastScrollY = currentScrollY;
        });
    }
    
    /**
     * Set up accessibility features
     */
    setupAccessibility() {
        // Skip to main content link
        this.createSkipLink();
        
        // Focus visible when using keyboard
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    /**
     * Create skip to main content link for accessibility
     */
    createSkipLink() {
        const existingSkipLink = document.querySelector('.skip-link');
        if (existingSkipLink) return;
        
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--color-primary);
            color: white;
            padding: 8px 16px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 10000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    /**
     * Get current navigation state
     */
    getNavigationState() {
        return {
            mobileMenuOpen: this.mobileMenuOpen,
            dropdownsOpen: this.dropdownsOpen.size,
            scrollPosition: window.scrollY
        };
    }
    
    /**
     * Smooth scroll to element
     */
    smoothScrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;
        
        const targetPosition = element.offsetTop - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
    
    /**
     * Highlight active navigation item
     */
    updateActiveNavItem() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}

// Global reference for template use
window.NavigationManager = NavigationManager;
