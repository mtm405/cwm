/**
 * Theme Controller Component - ES6 Module
 * Manages application theme switching, persistence, and system preferences
 */

export class ThemeController {
    constructor() {
        this.themes = ['dark', 'light', 'cyberpunk', 'ocean', 'forest', 'sunset', 'minimal'];
        this.currentTheme = this.getStoredTheme() || 'dark';
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        this.setupControls();
        console.log('✅ ThemeController initialized with theme:', this.currentTheme);
    }
    
    getStoredTheme() {
        try {
            return localStorage.getItem('cwm_theme');
        } catch (error) {
            console.warn('localStorage not available:', error);
            return null;
        }
    }
    
    setStoredTheme(theme) {
        try {
            localStorage.setItem('cwm_theme', theme);
        } catch (error) {
            console.warn('localStorage not available:', error);
        }
    }
    
    applyTheme(theme) {
        // Remove all theme classes
        this.themes.forEach(t => {
            document.body.classList.remove(`theme-${t}`);
        });
        
        // Add new theme class
        document.body.classList.add(`theme-${theme}`);
        
        // Store the theme
        this.setStoredTheme(theme);
        this.currentTheme = theme;
        
        // Update theme controls
        this.updateThemeControls(theme);
        
        console.log('🎨 Theme applied:', theme);
        
        // Dispatch theme change event
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme, controller: this } 
        }));
    }
    
    setupControls() {
        // Theme toggle buttons
        document.querySelectorAll('[data-theme-toggle]').forEach(button => {
            button.addEventListener('click', () => {
                this.toggleTheme();
            });
        });
        
        // Theme selector dropdowns
        document.querySelectorAll('[data-theme-selector]').forEach(selector => {
            selector.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        });
        
        // Individual theme buttons
        document.querySelectorAll('[data-theme]').forEach(button => {
            button.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                if (this.themes.includes(theme)) {
                    this.applyTheme(theme);
                }
            });
        });
    }
    
    toggleTheme() {
        const currentIndex = this.themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        const nextTheme = this.themes[nextIndex];
        this.applyTheme(nextTheme);
    }
    
    updateThemeControls(theme) {
        // Update selectors
        document.querySelectorAll('[data-theme-selector]').forEach(selector => {
            selector.value = theme;
        });
        
        // Update theme buttons
        document.querySelectorAll('[data-theme]').forEach(button => {
            button.classList.toggle('active', button.dataset.theme === theme);
        });
        
        // Update toggle button text
        document.querySelectorAll('[data-theme-toggle]').forEach(button => {
            const label = button.querySelector('.theme-label');
            if (label) {
                label.textContent = this.getThemeDisplayName(theme);
            }
        });
    }
    
    getThemeDisplayName(theme) {
        const displayNames = {
            dark: 'Dark',
            light: 'Light',
            cyberpunk: 'Cyberpunk',
            ocean: 'Ocean',
            forest: 'Forest',
            sunset: 'Sunset',
            minimal: 'Minimal'
        };
        return displayNames[theme] || theme;
    }
    
    getTheme() {
        return this.currentTheme;
    }
    
    getAvailableThemes() {
        return [...this.themes];
    }
    
    // System theme detection (optional)
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
    
    // Auto theme that follows system preference
    enableAutoTheme() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const updateTheme = (e) => {
                const systemTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(systemTheme);
            };
            
            // Initial application
            updateTheme(mediaQuery);
            
            // Listen for changes
            mediaQuery.addEventListener('change', updateTheme);
            
            console.log('🔄 Auto theme enabled');
        }
    }
}
