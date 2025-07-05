/**
 * Quick Auth Fix Script
 * Run this in your browser console to immediately diagnose and fix auth issues
 */

(function() {
    console.log('%c🔧 Quick Auth Fix Script', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
    console.log('Time:', new Date().toISOString());
    
    const fixes = [];
    const issues = [];
    
    // Check 1: Token presence and consistency
    const tokens = {
        localStorage_auth: localStorage.getItem('auth_token'),
        localStorage_cwm: localStorage.getItem('cwm_user_token'),
        sessionStorage_auth: sessionStorage.getItem('auth_token'),
        user_profile: localStorage.getItem('cwm_user_profile')
    };
    
    console.log('🔍 Token Check:', tokens);
    
    // Fix 1: Consolidate tokens
    if (tokens.localStorage_cwm && !tokens.localStorage_auth) {
        localStorage.setItem('auth_token', tokens.localStorage_cwm);
        fixes.push('Copied cwm_user_token to auth_token');
    }
    
    if (tokens.sessionStorage_auth && !tokens.localStorage_auth) {
        localStorage.setItem('auth_token', tokens.sessionStorage_auth);
        fixes.push('Copied sessionStorage token to localStorage');
    }
    
    // Check 2: User object consistency
    const users = {
        window_current: window.currentUser,
        global_current: globalThis.currentUser,
        profile_storage: tokens.user_profile ? JSON.parse(tokens.user_profile) : null
    };
    
    console.log('👤 User Check:', users);
    
    // Fix 2: Ensure user object is available
    if (users.profile_storage && !users.window_current) {
        window.currentUser = users.profile_storage;
        fixes.push('Restored window.currentUser from storage');
    }
    
    if (users.window_current && !users.global_current) {
        globalThis.currentUser = users.window_current;
        fixes.push('Set globalThis.currentUser');
    }
    
    // Check 3: Auth service availability
    const services = {
        authService: !!window.authService,
        authManager: !!window.authManager,
        googleAuth: !!(window.google && window.google.accounts)
    };
    
    console.log('🔧 Service Check:', services);
    
    // Fix 3: Initialize missing services
    if (!services.authService && !services.authManager) {
        // Create minimal auth service
        window.authService = {
            initialized: true,
            token: localStorage.getItem('auth_token'),
            currentUser: window.currentUser || globalThis.currentUser,
            isAuthenticated: function() {
                return !!(this.token && this.currentUser);
            },
            getToken: function() {
                return this.token;
            },
            getCurrentUser: function() {
                return this.currentUser;
            }
        };
        fixes.push('Created minimal auth service');
    }
    
    // Check 4: Session consistency
    const hasToken = !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token'));
    const hasUser = !!(window.currentUser || globalThis.currentUser);
    
    if (hasUser && !hasToken) {
        issues.push('User found but no token - may need to re-authenticate');
    }
    
    if (hasToken && !hasUser) {
        issues.push('Token found but no user - may need to fetch user data');
    }
    
    // Fix 4: Test server connection
    if (hasToken) {
        fetch('/api/auth/status')
            .then(response => response.json())
            .then(data => {
                console.log('🌐 Server auth status:', data);
                if (!data.authenticated) {
                    issues.push('Server does not recognize authentication');
                }
            })
            .catch(error => {
                console.warn('⚠️ Could not check server auth status:', error);
            });
    }
    
    // Check 5: Local storage corruption
    try {
        const testKey = 'auth_test_' + Date.now();
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
    } catch (error) {
        issues.push('localStorage may be corrupted or quota exceeded');
    }
    
    // Summary
    console.log('\n%c📊 Summary', 'color: #2196F3; font-weight: bold; font-size: 14px;');
    console.log('✅ Fixes Applied:', fixes.length ? fixes : 'None needed');
    console.log('⚠️ Issues Found:', issues.length ? issues : 'None');
    
    const finalStatus = {
        hasToken: !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')),
        hasUser: !!(window.currentUser || globalThis.currentUser),
        hasAuthService: !!(window.authService || window.authManager),
        isAuthenticated: false
    };
    
    finalStatus.isAuthenticated = finalStatus.hasToken && finalStatus.hasUser && finalStatus.hasAuthService;
    
    console.log('🎯 Final Status:', finalStatus);
    
    // Return repair report
    return {
        timestamp: new Date().toISOString(),
        fixes: fixes,
        issues: issues,
        status: finalStatus,
        nextSteps: getNextSteps(finalStatus, issues)
    };
    
    function getNextSteps(status, issues) {
        const steps = [];
        
        if (!status.hasToken) {
            steps.push('User needs to log in to get a token');
        }
        
        if (!status.hasUser) {
            steps.push('Fetch user data from server');
        }
        
        if (!status.hasAuthService) {
            steps.push('Load auth service scripts');
        }
        
        if (issues.includes('Server does not recognize authentication')) {
            steps.push('Check server-side session/token validation');
        }
        
        if (issues.includes('localStorage may be corrupted or quota exceeded')) {
            steps.push('Clear browser storage and re-authenticate');
        }
        
        return steps;
    }
})();

// Also create a function to run the fix manually
window.runQuickAuthFix = function() {
    return (function() {
        // Same logic as above, but as a callable function
        console.log('🔧 Running Quick Auth Fix...');
        
        const report = arguments.callee();
        
        // Also try to trigger any available auth recovery
        if (window.AuthRecovery && typeof window.AuthRecovery.runIfNeeded === 'function') {
            window.AuthRecovery.runIfNeeded();
        }
        
        return report;
    })();
};

console.log('✅ Quick Auth Fix loaded. Run runQuickAuthFix() to diagnose and fix auth issues.');
