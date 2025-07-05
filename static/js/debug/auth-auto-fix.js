/**
 * Auth Auto-Fix Script
 * Code with Morais - Auth Issue Resolver
 * 
 * This script automatically detects and fixes common authentication issues.
 */

(function() {
    'use strict';

    // ===== COMMON ISSUES FIXER =====
    const fixCommonIssues = () => {
        console.group('🔧 Auth Auto-Fix');
        console.log('Time:', new Date().toISOString());
        
        const fixes = [];
        
        // Fix 1: Correct storage key inconsistencies
        const storageKeys = {
            'auth_token': ['authToken', 'cwm_user_token', 'token'],
            'cwm_user_profile': ['userProfile', 'user_data', 'userData', 'current_user'],
            'cwm_refresh_token': ['refreshToken', 'auth_refresh_token']
        };
        
        Object.entries(storageKeys).forEach(([primaryKey, alternateKeys]) => {
            // Try to find a value from any of the keys
            let value = localStorage.getItem(primaryKey);
            
            if (!value) {
                // Check alternate keys
                for (const altKey of alternateKeys) {
                    const altValue = localStorage.getItem(altKey);
                    if (altValue) {
                        // Found a value in an alternate key, use it for the primary key
                        localStorage.setItem(primaryKey, altValue);
                        fixes.push(`Copied value from ${altKey} to ${primaryKey}`);
                        value = altValue;
                        break;
                    }
                }
            }
            
            // If still no value, check sessionStorage
            if (!value) {
                const sessionValue = sessionStorage.getItem(primaryKey) || 
                                    alternateKeys.map(key => sessionStorage.getItem(key)).find(v => v);
                
                if (sessionValue) {
                    localStorage.setItem(primaryKey, sessionValue);
                    fixes.push(`Copied value from sessionStorage to localStorage.${primaryKey}`);
                }
            }
        });
        
        // Fix 2: Ensure window.currentUser is set if data exists in storage
        if (!window.currentUser) {
            const userProfile = localStorage.getItem('cwm_user_profile');
            
            if (userProfile) {
                try {
                    window.currentUser = JSON.parse(userProfile);
                    fixes.push('Restored window.currentUser from localStorage');
                } catch (e) {
                    console.error('Failed to parse user profile:', e);
                    
                    // Handle invalid JSON by removing it
                    localStorage.removeItem('cwm_user_profile');
                    fixes.push('Removed invalid user profile JSON from localStorage');
                }
            }
        }
        
        // Fix 3: Ensure authService is initialized if available
        if (window.authService && typeof window.authService.init === 'function' && !window.authService.initialized) {
            try {
                window.authService.init();
                fixes.push('Initialized authService');
            } catch (e) {
                console.error('Failed to initialize authService:', e);
            }
        }
        
        // Fix 4: Fix broken script includes
        const requiredScripts = [
            { name: 'Google Auth', path: '/static/js/auth/google-auth.js' },
            { name: 'Auth Service', path: '/static/js/auth/authService.js' }
        ];
        
        const loadedScripts = Array.from(document.scripts).map(script => script.src);
        
        requiredScripts.forEach(({ name, path }) => {
            const isLoaded = loadedScripts.some(src => src.includes(path));
            
            if (!isLoaded) {
                console.log(`${name} script not loaded, adding it now...`);
                
                const script = document.createElement('script');
                script.src = path;
                script.async = true;
                document.head.appendChild(script);
                
                fixes.push(`Added missing ${name} script`);
            }
        });
        
        // Fix 5: Fix CONFIG issues if needed
        if (window.CONFIG) {
            // Fix missing CONFIG keys
            const requiredConfigKeys = {
                'AUTH_TOKEN_KEY': 'auth_token',
                'AUTH_USER_KEY': 'cwm_user_profile',
                'AUTH_REFRESH_KEY': 'cwm_refresh_token'
            };
            
            Object.entries(requiredConfigKeys).forEach(([key, defaultValue]) => {
                if (!window.CONFIG[key]) {
                    window.CONFIG[key] = defaultValue;
                    fixes.push(`Added missing CONFIG.${key}`);
                }
            });
            
            // Fix feature flags if needed
            if (window.CONFIG.features && window.CONFIG.features.authentication === false) {
                window.CONFIG.features.authentication = true;
                fixes.push('Enabled authentication feature flag');
            }
        }
        
        // Fix 6: Try to initialize Google Auth if available but not initialized
        if (typeof window.GoogleAuth === 'object' && !window.GoogleAuth.isInitialized) {
            try {
                window.GoogleAuth.init();
                fixes.push('Initialized Google Auth');
            } catch (e) {
                console.error('Failed to initialize Google Auth:', e);
            }
        }
        
        // Fix 7: Create global callback if missing
        if (typeof window.handleCredentialResponse !== 'function' && 
            typeof window.GoogleAuth === 'object' && 
            typeof window.GoogleAuth.handleCredentialResponse === 'function') {
            
            window.handleCredentialResponse = function(response) {
                console.log('Global callback received response, forwarding to GoogleAuth');
                window.GoogleAuth.handleCredentialResponse(response);
            };
            
            fixes.push('Created global callback function');
        }
        
        console.log('Fixes applied:', fixes.length > 0 ? fixes : 'None needed');
        console.groupEnd();
        
        return {
            status: fixes.length > 0 ? 'fixed' : 'no_fixes_needed',
            fixesApplied: fixes
        };
    };
    
    // ===== PUBLIC API =====
    window.AuthFixer = {
        fixCommonIssues: fixCommonIssues,
        
        // Auto-fix all issues and report
        autoFix: () => {
            const results = fixCommonIssues();
            
            // Show notification to user
            const message = results.fixesApplied.length > 0
                ? `Fixed ${results.fixesApplied.length} authentication issues. Please try again.`
                : 'No authentication issues detected.';
            
            alert(message);
            
            return results;
        }
    };
    
    // Auto-run on page load with delay to ensure everything is loaded
    setTimeout(() => {
        fixCommonIssues();
    }, 2000);
    
    console.log('✅ Auth Fixer loaded. Use AuthFixer.autoFix() to automatically fix common issues.');
})();

// Add a global function for easy access from console
window.fixAuthIssues = function() {
    return window.AuthFixer.autoFix();
};
