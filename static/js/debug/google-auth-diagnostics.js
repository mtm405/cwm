/**
 * Google Auth Diagnostics Tool
 * Code with Morais - Auth Debug System
 * 
 * This utility specifically diagnoses issues with Google Auth configuration and integration.
 */

(function() {
    'use strict';

    // ===== GOOGLE AUTH DIAGNOSTICS =====
    const runGoogleAuthDiagnostics = () => {
        console.group('🔍 Google Auth Diagnostics');
        console.log('Time:', new Date().toISOString());
        
        const issues = [];
        const warnings = [];
        const report = {
            status: 'checking',
            issues: issues,
            warnings: warnings,
            details: {}
        };
        
        // Check 1: Is Google SDK loaded?
        const googleSDKLoaded = typeof google !== 'undefined';
        report.details.googleSDK = googleSDKLoaded;
        
        if (!googleSDKLoaded) {
            issues.push('Google SDK is not loaded.');
        } else {
            // Check 1.1: Is Google Accounts API available?
            const accountsAPIAvailable = !!google.accounts;
            report.details.accountsAPI = accountsAPIAvailable;
            
            if (!accountsAPIAvailable) {
                issues.push('Google Accounts API is not available.');
            } else {
                // Check 1.2: Is Google Identity Services available?
                const identityServicesAvailable = !!google.accounts.id;
                report.details.identityServices = identityServicesAvailable;
                
                if (!identityServicesAvailable) {
                    issues.push('Google Identity Services is not available.');
                }
            }
        }
        
        // Check 2: Is GoogleAuth object initialized?
        const googleAuthAvailable = typeof window.GoogleAuth === 'object';
        report.details.googleAuthObject = googleAuthAvailable;
        
        if (!googleAuthAvailable) {
            issues.push('GoogleAuth object is not available.');
        } else {
            // Check 2.1: Is GoogleAuth initialized?
            const googleAuthInitialized = window.GoogleAuth.isInitialized;
            report.details.googleAuthInitialized = googleAuthInitialized;
            
            if (!googleAuthInitialized) {
                issues.push('GoogleAuth is not initialized.');
            }
            
            // Check 2.2: Check GoogleAuth config
            const clientIdConfigured = !!(window.GoogleAuth.config && window.GoogleAuth.config.clientId);
            report.details.clientIdConfigured = clientIdConfigured;
            
            if (!clientIdConfigured) {
                issues.push('GoogleAuth client ID is not configured.');
            }
        }
        
        // Check 3: Is global callback function available?
        const globalCallbackAvailable = typeof window.handleCredentialResponse === 'function';
        report.details.globalCallback = globalCallbackAvailable;
        
        if (!globalCallbackAvailable) {
            issues.push('Global callback function (handleCredentialResponse) is not available.');
        }
        
        // Check 4: Is CONFIG object available and properly configured?
        const configAvailable = typeof window.CONFIG === 'object';
        report.details.configObject = configAvailable;
        
        if (!configAvailable) {
            issues.push('CONFIG object is not available.');
        } else {
            // Check 4.1: Is Google client ID in CONFIG?
            const clientIdInConfig = !!window.CONFIG.GOOGLE_CLIENT_ID;
            report.details.clientIdInConfig = clientIdInConfig;
            
            if (!clientIdInConfig) {
                issues.push('Google client ID is not set in CONFIG.');
            } else {
                // Check 4.2: Does it look like a valid client ID?
                const validClientIdFormat = /^\\d+(-[a-z0-9]+)?\\.apps\\.googleusercontent\\.com$/.test(window.CONFIG.GOOGLE_CLIENT_ID);
                report.details.validClientIdFormat = validClientIdFormat;
                
                if (!validClientIdFormat) {
                    warnings.push('Google client ID format looks invalid.');
                }
            }
        }
        
        // Check 5: Check for necessary script tags
        const scripts = Array.from(document.scripts);
        const googleScripts = scripts.filter(script => 
            script.src && (
                script.src.includes('accounts.google.com') || 
                script.src.includes('gsi') || 
                script.src.includes('oauth2')
            )
        );
        
        report.details.googleScripts = googleScripts.map(script => script.src);
        
        if (googleScripts.length === 0) {
            issues.push('No Google authentication scripts found.');
        }
        
        // Check 6: Check auth-related script tags
        const authScripts = scripts.filter(script => 
            script.src && (
                script.src.includes('auth') || 
                script.src.includes('google-auth')
            )
        );
        
        report.details.authScripts = authScripts.map(script => script.src);
        
        // Check for duplicate scripts
        const scriptSources = authScripts.map(script => script.src);
        const duplicateScripts = scriptSources.filter((src, index, array) => 
            array.indexOf(src) !== index
        );
        
        if (duplicateScripts.length > 0) {
            warnings.push('Duplicate authentication scripts found.');
            report.details.duplicateScripts = duplicateScripts;
        }
        
        // Check 7: Check for event listener issues
        try {
            const listeners = getEventListeners(document);
            const clickListeners = listeners && listeners.click ? listeners.click.length : 'unknown';
            report.details.documentClickListeners = clickListeners;
        } catch (e) {
            // getEventListeners might not be available in all browsers
            report.details.eventListenersCheckFailed = true;
        }
        
        // Check 8: Look for misspelled keys in localStorage
        const authRelatedKeys = Object.keys(localStorage).filter(key => 
            key.includes('auth') || 
            key.includes('token') || 
            key.includes('user') || 
            key.includes('google') ||
            key.includes('cwm')
        );
        
        report.details.authRelatedKeys = authRelatedKeys;
        
        // Look for similar but different keys
        const expectedKeys = ['auth_token', 'cwm_user_token', 'cwm_user_profile'];
        const similarKeys = [];
        
        authRelatedKeys.forEach(key => {
            expectedKeys.forEach(expectedKey => {
                if (key !== expectedKey && 
                    (key.toLowerCase().includes(expectedKey.toLowerCase()) || 
                     levenshteinDistance(key, expectedKey) <= 3)) {
                    similarKeys.push({actual: key, expected: expectedKey});
                }
            });
        });
        
        if (similarKeys.length > 0) {
            warnings.push('Potentially misspelled storage keys found.');
            report.details.similarKeys = similarKeys;
        }
        
        // Final status
        report.status = issues.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'ok';
        
        // Log the results
        console.log('Diagnostics complete.');
        console.log('Status:', report.status);
        
        if (issues.length > 0) {
            console.group('Issues Found:');
            issues.forEach(issue => console.log('❌', issue));
            console.groupEnd();
        }
        
        if (warnings.length > 0) {
            console.group('Warnings:');
            warnings.forEach(warning => console.log('⚠️', warning));
            console.groupEnd();
        }
        
        console.log('Details:', report.details);
        console.groupEnd();
        
        return report;
    };
    
    // Calculate Levenshtein distance between two strings
    // (to find similar but misspelled keys)
    const levenshteinDistance = (a, b) => {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        
        const matrix = [];
        
        // Initialize matrix
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        // Fill matrix
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                const cost = a[j - 1] === b[i - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }
        
        return matrix[b.length][a.length];
    };
    
    // ===== GOOGLE AUTH FIXES =====
    const fixGoogleAuth = () => {
        console.group('🔧 Google Auth Fixes');
        console.log('Time:', new Date().toISOString());
        
        const fixes = [];
        
        // Fix 1: Try to initialize GoogleAuth if available but not initialized
        if (typeof window.GoogleAuth === 'object' && !window.GoogleAuth.isInitialized) {
            console.log('Attempting to initialize GoogleAuth...');
            
            try {
                window.GoogleAuth.init();
                fixes.push('Initialized GoogleAuth');
            } catch (e) {
                console.error('Failed to initialize GoogleAuth:', e);
            }
        }
        
        // Fix 2: Create global callback if missing
        if (typeof window.handleCredentialResponse !== 'function' && 
            typeof window.GoogleAuth === 'object' && 
            typeof window.GoogleAuth.handleCredentialResponse === 'function') {
            
            console.log('Creating global callback function...');
            
            window.handleCredentialResponse = function(response) {
                console.log('Global callback received response, forwarding to GoogleAuth');
                window.GoogleAuth.handleCredentialResponse(response);
            };
            
            fixes.push('Created global callback function');
        }
        
        // Fix 3: Check for missing or incorrectly loaded scripts
        const hasGoogleAuthScript = Array.from(document.scripts).some(script => 
            script.src && script.src.includes('google-auth.js')
        );
        
        const hasGoogleButtonsScript = Array.from(document.scripts).some(script => 
            script.src && script.src.includes('google-buttons.js')
        );
        
        if (!hasGoogleAuthScript) {
            console.log('Google Auth script not found, attempting to load...');
            
            const script = document.createElement('script');
            script.src = '/static/js/auth/google-auth.js';
            script.async = true;
            document.head.appendChild(script);
            
            fixes.push('Loaded google-auth.js script');
        }
        
        if (!hasGoogleButtonsScript) {
            console.log('Google Buttons script not found, attempting to load...');
            
            const script = document.createElement('script');
            script.src = '/static/js/auth/google-buttons.js';
            script.async = true;
            document.head.appendChild(script);
            
            fixes.push('Loaded google-buttons.js script');
        }
        
        // Fix 4: Check for missing Google Identity Services script
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
            console.log('Google Identity Services not loaded, attempting to load...');
            
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
            
            fixes.push('Loaded Google Identity Services script');
        }
        
        // Fix 5: Fix misspelled localStorage keys
        const potentialMisspellings = [
            {correct: 'auth_token', incorrect: ['auth-token', 'authtoken', 'auth_tokenn']},
            {correct: 'cwm_user_token', incorrect: ['cwm-user-token', 'cwmusertoken', 'cwm_user_tokenn']},
            {correct: 'cwm_user_profile', incorrect: ['cwm-user-profile', 'cwmuserprofile', 'cwm_user_profilee']}
        ];
        
        potentialMisspellings.forEach(({correct, incorrect}) => {
            // Check if correct key is missing
            if (!localStorage.getItem(correct)) {
                // Check for incorrect versions
                for (const misspelled of incorrect) {
                    const value = localStorage.getItem(misspelled);
                    if (value) {
                        console.log(`Found misspelled key: ${misspelled}, copying to ${correct}`);
                        localStorage.setItem(correct, value);
                        fixes.push(`Fixed misspelled key: ${misspelled} → ${correct}`);
                        break;
                    }
                }
            }
        });
        
        // Fix 6: Fix window.currentUser if missing
        if (!window.currentUser) {
            const userProfile = localStorage.getItem('cwm_user_profile');
            
            if (userProfile) {
                try {
                    window.currentUser = JSON.parse(userProfile);
                    fixes.push('Restored window.currentUser from localStorage');
                } catch (e) {
                    console.error('Failed to parse user profile:', e);
                }
            }
        }
        
        console.log('Fixes applied:', fixes.length > 0 ? fixes : 'None needed');
        console.groupEnd();
        
        return {
            status: fixes.length > 0 ? 'fixed' : 'no_fixes_needed',
            fixesApplied: fixes
        };
    };
    
    // ===== PUBLIC API =====
    window.GoogleAuthDiagnostics = {
        run: runGoogleAuthDiagnostics,
        fix: fixGoogleAuth,
        
        // Convenience method to run diagnostics and fix in one go
        diagnoseAndFix: () => {
            const diagnostics = runGoogleAuthDiagnostics();
            const fixes = fixGoogleAuth();
            
            return {
                diagnostics: diagnostics,
                fixes: fixes
            };
        }
    };
    
    console.log('✅ Google Auth Diagnostics loaded. Use GoogleAuthDiagnostics.run() to check for issues.');
})();

// Add a global function for easy access from console
window.checkGoogleAuth = function() {
    return window.GoogleAuthDiagnostics.run();
};

window.fixGoogleAuth = function() {
    return window.GoogleAuthDiagnostics.fix();
};
