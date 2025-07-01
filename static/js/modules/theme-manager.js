/**
 * Theme Manager - Advanced theme system with transitions and preferences
 * Code with Morais - UI Theme System
 */

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.availableThemes = ['light', 'dark', 'auto'];
        this.transitionDuration = 300; // ms
        this.init();
    }
    
    /**
     * Initialize theme management system
     */
    init() {
        this.setupThemeTransitions();
        this.applyTheme(this.currentTheme);
        this.setupThemeControls();
        this.setupSystemThemeDetection();
        console.log('🎨 Theme Manager initialized');
    }
    
    /**
     * Set up smooth theme transitions
     */
    setupThemeTransitions() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                transition: background-color ${this.transitionDuration}ms ease,
                           color ${this.transitionDuration}ms ease,
                           border-color ${this.transitionDuration}ms ease,
                           box-shadow ${this.transitionDuration}ms ease !important;
            }
        `;
        document.head.appendChild(style);
        
        // Remove transition styles after a delay to prevent interference
        setTimeout(() => {
            style.remove();
        }, this.transitionDuration + 100);
    }
    
    /**
     * Apply a theme to the page
     */
    applyTheme(theme) {
        // Validate theme
        if (!this.availableThemes.includes(theme)) {
            console.warn(`⚠️ Invalid theme: ${theme}, falling back to dark`);
            theme = 'dark';
        }
        
        // Apply theme class to body
        document.body.className = `theme-${theme}`;
        this.currentTheme = theme;
        
        // Save to localStorage
        localStorage.setItem('theme', theme);
        
        // Update theme selector UI
        this.updateThemeSelector(theme);
        
        // Notify other components of theme change
        this.dispatchThemeChange(theme);
        
        // Update backend preference
        this.updateThemeBackend(theme);
        
        console.log(`🎨 Theme applied: ${theme}`);
    }
    
    /**
     * Update theme selector UI
     */
    updateThemeSelector(theme) {
        const themeSelector = document.querySelector('.theme-switcher select');
        const themeButtons = document.querySelectorAll('.theme-btn');
        
        if (themeSelector) {
            themeSelector.value = theme;
        }
        
        themeButtons.forEach(btn => {
            const btnTheme = btn.getAttribute('data-theme');
            btn.classList.toggle('active', btnTheme === theme);
        });
    }
    
    /**
     * Set up theme control event listeners
     */
    setupThemeControls() {
        // Theme selector dropdown
        const themeSelector = document.querySelector('.theme-switcher select');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });
        }
        
        // Theme toggle buttons
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                this.setTheme(theme);
            });
        });
        
        // Keyboard shortcut for theme toggle (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }
    
    /**
     * Set up automatic system theme detection
     */
    setupSystemThemeDetection() {
        // Detect system theme preference
        if (window.matchMedia) {
            const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Listen for system theme changes
            darkMediaQuery.addEventListener('change', (e) => {
                if (this.currentTheme === 'auto') {
                    this.applySystemTheme();
                }
            });
            
            // Apply system theme if auto is selected
            if (this.currentTheme === 'auto') {
                this.applySystemTheme();
            }
        }
    }
    
    /**
     * Apply system theme preference
     */
    applySystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.className = 'theme-dark';
        } else {
            document.body.className = 'theme-light';
        }
    }
    
    /**
     * Set theme with validation and animation
     */
    setTheme(theme) {
        if (theme === this.currentTheme) return;
        
        // Add transition effect
        document.body.classList.add('theme-transitioning');
        
        setTimeout(() => {
            this.applyTheme(theme);
            
            setTimeout(() => {
                document.body.classList.remove('theme-transitioning');
            }, this.transitionDuration);
        }, 50);
    }
    
    /**
     * Toggle between light and dark themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    /**
     * Get current theme
     */
    getCurrentTheme() {
        return this.currentTheme;
    }
    
    /**
     * Get available themes
     */
    getAvailableThemes() {
        return [...this.availableThemes];
    }
    
    /**
     * Check if dark theme is active
     */
    isDarkTheme() {
        if (this.currentTheme === 'auto') {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return this.currentTheme === 'dark';
    }
    
    /**
     * Dispatch theme change event
     */
    dispatchThemeChange(theme) {
        const event = new CustomEvent('themeChanged', { 
            detail: { 
                theme: theme,
                isDark: this.isDarkTheme()
            } 
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Update theme preference on backend
     */
    async updateThemeBackend(theme) {
        try {
            await fetch('/api/update-theme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ theme })
            });
        } catch (error) {
            console.warn('⚠️ Failed to update theme on backend:', error);
        }
    }
    
    /**
     * Reset theme to default
     */
    resetTheme() {
        this.setTheme('dark'); // Default theme
    }
    
    /**
     * Get theme-aware CSS custom properties
     */
    getThemeProperties() {
        const computedStyle = getComputedStyle(document.body);
        return {
            primary: computedStyle.getPropertyValue('--color-primary').trim(),
            secondary: computedStyle.getPropertyValue('--color-secondary').trim(),
            background: computedStyle.getPropertyValue('--color-background').trim(),
            text: computedStyle.getPropertyValue('--color-text').trim(),
            accent: computedStyle.getPropertyValue('--color-accent').trim()
        };
    }
}

// Legacy function for backward compatibility
function setTheme(theme) {
    if (window.themeManager) {
        window.themeManager.setTheme(theme);
    } else {
        // Fallback to basic implementation
        document.body.className = `theme-${theme}`;
        localStorage.setItem('theme', theme);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}

// Global reference for template use
window.ThemeManager = ThemeManager;
