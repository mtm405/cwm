/**
 * Auth State Auto-Fixer
 * This script automatically fixes authentication state issues on page load
 */

(function() {
    'use strict';
    
    console.log('🔄 Auto-checking authentication state...');
    
    // Function to restore user from session
    function restoreUserFromSession() {
        console.log('🔄 Checking session for user data...');
        return fetch('/auth/status', { credentials: 'same-origin' })
            .then(response => {
                console.log('Session response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Session data:', data);
                if (data.success && data.authenticated && data.user) {
                    // Always restore user data from session, even if it exists
                    window.currentUser = data.user;
                    localStorage.setItem('cwm_user_profile', JSON.stringify(data.user));
                    localStorage.setItem('auth_token', 'session_authenticated');
                    console.log('✅ User restored from session:', data.user);
                    return true;
                } else {
                    console.log('❌ No authenticated session found');
                    return false;
                }
            })
            .catch(error => {
                console.error('❌ Failed to check session status:', error);
                return false;
            });
    }
    
    // Function to check and fix auth state
    function autoFixAuthState() {
        const hasToken = !!(localStorage.getItem('auth_token') || localStorage.getItem('cwm_user_token'));
        const hasUser = !!(window.currentUser);
        
        console.log('🔍 Auth state check:', { hasToken, hasUser });
        
        // Always check session first to restore user data
        restoreUserFromSession().then(restored => {
            if (restored) {
                console.log('🎉 Authentication state auto-fixed from session!');
                
                // Refresh debug panel if available
                if (window.AuthDebugUI && typeof window.AuthDebugUI.refresh === 'function') {
                    window.AuthDebugUI.refresh();
                }
            } else {
                console.log('⚠️ No session authentication found');
                
                // If has token but no user, try auth recovery
                if (hasToken && !hasUser && window.AuthRecovery) {
                    setTimeout(() => {
                        window.AuthRecovery.runIfNeeded();
                    }, 1000);
                }
            }
        });
    }
    
    // Run after page loads and scripts are ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(autoFixAuthState, 500);
        });
    } else {
        setTimeout(autoFixAuthState, 500);
    }
    
    // Also run immediately if already loaded
    autoFixAuthState();
    
    // Export for manual use
    window.autoFixAuthState = autoFixAuthState;
    window.restoreUserFromSession = restoreUserFromSession;
    
})();
