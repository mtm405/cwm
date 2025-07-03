/**
 * Authentication Debug Utility
 * Code with Morais - Auth Debug Tools
 * 
 * This utility provides comprehensive debugging tools for authentication state.
 * Usage: Include this file or paste the debugAuth function in your browser console.
 */

/**
 * Comprehensive authentication state debugger
 * @returns {Object} Authentication debug information
 */
window.debugAuth = function() {
    console.log('=== 🔐 Auth Debug Info ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // 1. Check localStorage for tokens
    const localStorageToken = localStorage.getItem('auth_token');
    console.log('📱 LocalStorage auth_token:', localStorageToken ? `${localStorageToken.substring(0, 20)}...` : 'null');
    
    // 2. Check sessionStorage for tokens
    const sessionStorageToken = sessionStorage.getItem('auth_token');
    console.log('💾 SessionStorage auth_token:', sessionStorageToken ? `${sessionStorageToken.substring(0, 20)}...` : 'null');
    
    // 3. Check AuthService if available
    if (window.authService) {
        console.log('🔧 AuthService Status:');
        console.log('  - Available:', !!window.authService);
        console.log('  - Token:', window.authService.token ? `${window.authService.token.substring(0, 20)}...` : 'null');
        console.log('  - Current User:', window.authService.currentUser);
        console.log('  - Is Authenticated:', window.authService.isAuthenticated());
        console.log('  - Is Initialized:', window.authService.initialized);
        
        // Test auth methods
        try {
            console.log('  - getCurrentUser():', window.authService.getCurrentUser());
            console.log('  - getToken():', window.authService.getToken() ? 'Present' : 'null');
        } catch (error) {
            console.log('  - Method test error:', error.message);
        }
    } else {
        console.log('❌ AuthService not available');
    }
    
    // 4. Check AuthManager if available
    if (window.authManager) {
        console.log('🛠️ AuthManager Status:');
        console.log('  - Available:', !!window.authManager);
        console.log('  - Current User:', window.authManager.getCurrentUser());
        console.log('  - Is Authenticated:', window.authManager.isUserAuthenticated());
        console.log('  - Is Initialized:', window.authManager.initialized);
    } else {
        console.log('❌ AuthManager not available');
    }
    
    // 5. Check global user objects
    console.log('🌐 Global User Objects:');
    console.log('  - globalThis.currentUser:', globalThis.currentUser);
    console.log('  - window.currentUser:', window.currentUser);
    
    // 6. Check for other auth-related storage
    const userData = localStorage.getItem('user_data');
    const userProfile = localStorage.getItem('cwm_user_profile');
    const userPrefs = localStorage.getItem('cwm_user_prefs');
    
    console.log('📂 Other Storage:');
    console.log('  - user_data:', userData ? 'Present' : 'null');
    console.log('  - cwm_user_profile:', userProfile ? 'Present' : 'null');
    console.log('  - cwm_user_prefs:', userPrefs ? 'Present' : 'null');
    
    // 7. Check cookies (if accessible)
    console.log('🍪 Cookies:');
    if (document.cookie) {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split('=');
            if (name.includes('auth') || name.includes('session') || name.includes('token')) {
                acc[name] = value ? `${value.substring(0, 10)}...` : 'empty';
            }
            return acc;
        }, {});
        console.log('  - Auth-related cookies:', cookies);
    } else {
        console.log('  - No cookies available');
    }
    
    // 8. Check for JWT token information (if available)
    const token = localStorageToken || sessionStorageToken || (window.authService && window.authService.token);
    if (token) {
        try {
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                console.log('🔑 JWT Token Info:');
                console.log('  - Issued at:', new Date(payload.iat * 1000).toISOString());
                console.log('  - Expires at:', new Date(payload.exp * 1000).toISOString());
                console.log('  - Is expired:', Date.now() > payload.exp * 1000);
                console.log('  - Subject:', payload.sub);
                console.log('  - Email:', payload.email);
            }
        } catch (error) {
            console.log('🔑 JWT Token: Unable to parse (might not be JWT)');
        }
    }
    
    // 9. Test auth API endpoints
    console.log('🌐 Testing Auth API...');
    if (token) {
        fetch('/api/auth/validate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log('  - Auth validate endpoint:', response.status, response.statusText);
            return response.json();
        })
        .then(data => {
            console.log('  - Validate response:', data);
        })
        .catch(error => {
            console.log('  - Validate error:', error.message);
        });
    } else {
        console.log('  - No token available for API test');
    }
    
    // 10. Return comprehensive debug object
    const debugInfo = {
        timestamp: new Date().toISOString(),
        authService: window.authService ? {
            available: true,
            initialized: window.authService.initialized,
            hasToken: !!window.authService.token,
            hasUser: !!window.authService.currentUser,
            isAuthenticated: window.authService.isAuthenticated(),
            user: window.authService.currentUser
        } : { available: false },
        authManager: window.authManager ? {
            available: true,
            initialized: window.authManager.initialized,
            hasUser: !!window.authManager.getCurrentUser(),
            isAuthenticated: window.authManager.isUserAuthenticated(),
            user: window.authManager.getCurrentUser()
        } : { available: false },
        storage: {
            localStorage: {
                auth_token: !!localStorageToken,
                user_data: !!userData,
                user_profile: !!userProfile
            },
            sessionStorage: {
                auth_token: !!sessionStorageToken
            }
        },
        globalUsers: {
            globalThis: !!globalThis.currentUser,
            window: !!window.currentUser
        },
        tokens: {
            localStorage: localStorageToken ? `${localStorageToken.substring(0, 20)}...` : null,
            sessionStorage: sessionStorageToken ? `${sessionStorageToken.substring(0, 20)}...` : null,
            authService: (window.authService && window.authService.token) ? `${window.authService.token.substring(0, 20)}...` : null
        }
    };
    
    console.log('📋 Debug Summary:', debugInfo);
    console.log('=== End Auth Debug ===');
    
    return debugInfo;
};

/**
 * Quick auth status check
 */
window.quickAuthCheck = function() {
    const isAuth = (window.authService && window.authService.isAuthenticated()) || 
                   (window.authManager && window.authManager.isUserAuthenticated()) ||
                   !!localStorage.getItem('auth_token');
    
    console.log(`🔐 Quick Auth Check: ${isAuth ? '✅ Authenticated' : '❌ Not Authenticated'}`);
    return isAuth;
};

/**
 * Clear all auth data (for testing)
 */
window.clearAuthData = function() {
    if (confirm('Clear all authentication data? This will log you out.')) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('cwm_user_profile');
        localStorage.removeItem('cwm_user_prefs');
        sessionStorage.removeItem('auth_token');
        
        if (window.authService) {
            window.authService.logout();
        }
        
        if (window.authManager) {
            window.authManager.signOut();
        }
        
        console.log('🧹 All auth data cleared');
        window.location.reload();
    }
};

// Auto-initialize in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Auth debug tools loaded for development');
    
    // Auto-run debug after a short delay to let other scripts load
    setTimeout(() => {
        if (window.debugAuth) {
            console.log('🔧 Running initial auth debug...');
            try {
                window.debugAuth();
            } catch (error) {
                console.error('Error in initial auth debug:', error);
            }
        }
    }, 2000);
}

console.log('✅ Auth debug utility loaded');
console.log('📝 Available functions: debugAuth(), quickAuthCheck(), clearAuthData()');
