/**
 * TabSystem - Isolated component for dashboard tab navigation
 * 
 * This standalone module handles tab functionality without depending on
 * other dashboard components, ensuring stability when other JS changes.
 */

// Use IIFE to avoid global scope pollution
(function() {
    'use strict';
    
    // Store tab system state
    const tabState = {
        activeTab: null,
        initialized: false
    };
    
    /**
     * Initialize tab system
     */
    function initTabSystem() {
        if (tabState.initialized) return;
        
        console.log('📋 Initializing isolated tab system...');
        
        // Get all tab buttons and panes
        const tabButtons = document.querySelectorAll('.nav-tab[data-tab], .nav-tab');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        console.log(`Found ${tabButtons.length} tab buttons and ${tabPanes.length} tab panes`);
        
        // Add click event listeners to all tab buttons
        tabButtons.forEach((button, index) => {
            setupTabButton(button, tabButtons, tabPanes);
        });
        
        // Initialize the first tab as active if none are active (default to challenge tab)
        if (!document.querySelector('.nav-tab.active')) {
            // Try to get challenge tab first
            const challengeTab = Array.from(tabButtons).find(btn => 
                (btn.dataset.tab === 'challenge') || 
                btn.textContent.toLowerCase().includes('challenge')
            );
            
            if (challengeTab) {
                challengeTab.click();
            } else if (tabButtons.length > 0) {
                // Fallback to first tab
                tabButtons[0].click();
            }
        }
        
        // Handle URL hash on page load
        handleUrlHash(tabButtons);
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => handleUrlHash(tabButtons));
        
        tabState.initialized = true;
        console.log('✅ Tab system initialized successfully');
    }
    
    /**
     * Set up a tab button with all necessary event listeners
     */
    function setupTabButton(button, allButtons, allPanes) {
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
                
                // Prevent double events
                if (eventType === 'touchstart') {
                    e.stopPropagation();
                }
                
                const tabId = getTargetTab(button);
                
                // Set URL hash without triggering scroll
                const scrollPos = window.scrollY;
                window.location.hash = tabId;
                window.scrollTo(0, scrollPos);
                
                // Update active tab
                allButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-selected', 'false');
                });
                
                button.classList.add('active');
                button.setAttribute('aria-selected', 'true');
                
                // Hide all panes
                allPanes.forEach(pane => {
                    pane.classList.remove('active');
                    pane.style.display = 'none';
                });
                
                // Show selected pane
                const targetPane = document.getElementById(`${tabId}-tab`);
                if (targetPane) {
                    targetPane.classList.add('active');
                    targetPane.style.display = 'block';
                    
                    // Trigger custom event for tab change
                    const tabChangeEvent = new CustomEvent('tabChanged', {
                        detail: { tabId: tabId }
                    });
                    document.dispatchEvent(tabChangeEvent);
                    
                    // Store active tab
                    tabState.activeTab = tabId;
                }
            }, { passive: false });
        });
        
        // Add keyboard support
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                button.click();
            }
        });
        
        // Ensure proper ARIA attributes
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', button.classList.contains('active') ? 'true' : 'false');
    }
    
    /**
     * Handle URL hash for direct tab access
     */
    function handleUrlHash(tabButtons) {
        const hash = window.location.hash.substring(1);
        if (hash && ['overview', 'challenge', 'leaderboard', 'activity', 'vocabulary', 'games'].includes(hash)) {
            const targetButton = Array.from(tabButtons).find(btn => 
                (btn.dataset.tab === hash) || 
                btn.textContent.toLowerCase().includes(hash)
            );
            
            if (targetButton && !targetButton.classList.contains('active')) {
                targetButton.click();
            }
        }
    }
    
    /**
     * Get the current active tab
     */
    function getActiveTab() {
        return tabState.activeTab;
    }
    
    /**
     * Manually switch to a specific tab
     */
    function switchToTab(tabId) {
        const tabButton = document.querySelector(`.nav-tab[data-tab="${tabId}"]`) || 
                          Array.from(document.querySelectorAll('.nav-tab')).find(btn => 
                              btn.textContent.toLowerCase().includes(tabId)
                          );
        
        if (tabButton) {
            tabButton.click();
            return true;
        }
        
        return false;
    }
    
    // Expose public API
    window.TabSystem = {
        init: initTabSystem,
        getActiveTab: getActiveTab,
        switchToTab: switchToTab
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTabSystem);
    } else {
        initTabSystem();
    }
})();
