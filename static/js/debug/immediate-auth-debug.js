// ==========================================
// IMMEDIATE AUTH DEBUG - PASTE INTO CONSOLE
// ==========================================

// This is a standalone debug function that doesn't require any external files
// Just copy and paste this entire code block into your browser console

(function() {
    console.log('%c=== 🔐 AUTH DEBUG REPORT ===', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
    console.log('Timestamp:', new Date().toISOString());
    console.log('URL:', window.location.href);
    
    // Check 1: Storage Tokens
    console.log('\n%c📱 STORAGE CHECK', 'color: #2196F3; font-weight: bold;');
    const localToken = localStorage.getItem('auth_token');
    const sessionToken = sessionStorage.getItem('auth_token');
    console.log('localStorage auth_token:', localToken ? `✅ Present (${localToken.length} chars)` : '❌ Not found');
    console.log('sessionStorage auth_token:', sessionToken ? `✅ Present (${sessionToken.length} chars)` : '❌ Not found');
    
    // Check other storage keys
    const storageKeys = Object.keys(localStorage).filter(key => 
        key.includes('auth') || key.includes('user') || key.includes('token') || key.includes('session')
    );
    console.log('Other auth-related storage:', storageKeys.length ? storageKeys : 'None found');
    
    // Check 2: Auth Services
    console.log('\n%c🔧 AUTH SERVICES CHECK', 'color: #FF9800; font-weight: bold;');
    
    // AuthService check
    if (window.authService) {
        console.log('✅ AuthService available');
        console.log('  - Token:', window.authService.token ? '✅ Present' : '❌ Missing');
        console.log('  - Current User:', window.authService.currentUser ? '✅ Present' : '❌ Missing');
        console.log('  - Initialized:', window.authService.initialized ? '✅ Yes' : '❌ No');
        
        try {
            console.log('  - isAuthenticated():', window.authService.isAuthenticated() ? '✅ True' : '❌ False');
        } catch (e) {
            console.log('  - isAuthenticated() error:', e.message);
        }
    } else {
        console.log('❌ AuthService not available');
    }
    
    // AuthManager check
    if (window.authManager) {
        console.log('✅ AuthManager available');
        console.log('  - Initialized:', window.authManager.initialized ? '✅ Yes' : '❌ No');
        
        try {
            console.log('  - getCurrentUser():', window.authManager.getCurrentUser() ? '✅ Present' : '❌ Missing');
            console.log('  - isUserAuthenticated():', window.authManager.isUserAuthenticated() ? '✅ True' : '❌ False');
        } catch (e) {
            console.log('  - Method error:', e.message);
        }
    } else {
        console.log('❌ AuthManager not available');
    }
    
    // Check 3: Global User Objects
    console.log('\n%c🌐 GLOBAL USER OBJECTS', 'color: #9C27B0; font-weight: bold;');
    console.log('window.currentUser:', window.currentUser ? '✅ Present' : '❌ Missing');
    console.log('globalThis.currentUser:', globalThis.currentUser ? '✅ Present' : '❌ Missing');
    
    if (window.currentUser) {
        console.log('window.currentUser details:', window.currentUser);
    }
    if (globalThis.currentUser) {
        console.log('globalThis.currentUser details:', globalThis.currentUser);
    }
    
    // Check 4: Third-party Services
    console.log('\n%c🔌 THIRD-PARTY SERVICES', 'color: #607D8B; font-weight: bold;');
    console.log('Google API available:', typeof google !== 'undefined' ? '✅ Yes' : '❌ No');
    if (typeof google !== 'undefined') {
        console.log('  - google.accounts:', !!google.accounts ? '✅ Available' : '❌ Missing');
        console.log('  - google.accounts.id:', !!(google.accounts && google.accounts.id) ? '✅ Available' : '❌ Missing');
    }
    
    console.log('Firebase available:', typeof firebase !== 'undefined' ? '✅ Yes' : '❌ No');
    if (typeof firebase !== 'undefined') {
        console.log('  - firebase.auth:', !!firebase.auth ? '✅ Available' : '❌ Missing');
    }
    
    // Check 5: Cookies
    console.log('\n%c🍪 COOKIES CHECK', 'color: #795548; font-weight: bold;');
    if (document.cookie) {
        const authCookies = document.cookie.split(';')
            .map(cookie => cookie.trim())
            .filter(cookie => {
                const name = cookie.split('=')[0].toLowerCase();
                return name.includes('auth') || name.includes('session') || name.includes('token');
            });
        
        console.log('Auth-related cookies:', authCookies.length ? authCookies : 'None found');
    } else {
        console.log('No cookies available');
    }
    
    // Check 6: Page Scripts
    console.log('\n%c📜 LOADED SCRIPTS', 'color: #E91E63; font-weight: bold;');
    const authScripts = Array.from(document.scripts)
        .filter(script => script.src && (
            script.src.includes('auth') || 
            script.src.includes('google') || 
            script.src.includes('firebase') ||
            script.src.includes('login')
        ))
        .map(script => script.src);
    
    console.log('Auth-related scripts:', authScripts.length ? authScripts : 'None found');
    
    // Summary
    console.log('\n%c📊 SUMMARY', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
    
    const hasToken = !!(localToken || sessionToken || (window.authService && window.authService.token));
    const hasAuthService = !!(window.authService || window.authManager);
    const hasUser = !!(window.currentUser || globalThis.currentUser || 
                      (window.authService && window.authService.currentUser) ||
                      (window.authManager && window.authManager.getCurrentUser()));
    
    const isAuthenticated = hasToken && hasUser && hasAuthService;
    
    console.log('🔍 Authentication Status:', isAuthenticated ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED');
    console.log('🔑 Has Token:', hasToken ? '✅ Yes' : '❌ No');
    console.log('👤 Has User:', hasUser ? '✅ Yes' : '❌ No');
    console.log('🔧 Has Auth Service:', hasAuthService ? '✅ Yes' : '❌ No');
    
    // Recommendations
    console.log('\n%c💡 RECOMMENDATIONS', 'color: #FF5722; font-weight: bold;');
    
    if (!hasAuthService) {
        console.log('❗ No auth service found - check if auth scripts are loaded');
    }
    
    if (!hasToken) {
        console.log('❗ No auth token found - user may need to login');
    }
    
    if (!hasUser) {
        console.log('❗ No user object found - auth state may be incomplete');
    }
    
    if (typeof google === 'undefined') {
        console.log('❗ Google API not loaded - Google Sign-In may not work');
    }
    
    console.log('\n%c=== END DEBUG REPORT ===', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
    
    // Return debug object for further inspection
    return {
        timestamp: new Date().toISOString(),
        authentication: {
            isAuthenticated,
            hasToken,
            hasUser,
            hasAuthService
        },
        tokens: {
            localStorage: !!localToken,
            sessionStorage: !!sessionToken,
            authService: !!(window.authService && window.authService.token)
        },
        services: {
            authService: !!window.authService,
            authManager: !!window.authManager,
            google: typeof google !== 'undefined',
            firebase: typeof firebase !== 'undefined'
        },
        users: {
            windowCurrentUser: !!window.currentUser,
            globalCurrentUser: !!globalThis.currentUser,
            authServiceUser: !!(window.authService && window.authService.currentUser),
            authManagerUser: !!(window.authManager && window.authManager.getCurrentUser())
        }
    };
})();

// Also create the debugAuth function for future use
window.debugAuth = function() {
    return (function() {
        // Same debug code as above, but condensed for repeated use
        console.log('=== Auth Debug ===');
        console.log('Token in localStorage:', localStorage.getItem('auth_token'));
        console.log('Token in authService:', window.authService ? window.authService.token : 'AuthService not available');
        console.log('Current User:', window.authService ? window.authService.currentUser : 'AuthService not available');
        console.log('Is Authenticated:', window.authService ? window.authService.isAuthenticated() : 'AuthService not available');
        console.log('Is Initialized:', window.authService ? window.authService.initialized : 'AuthService not available');
        return window.authService || { error: 'AuthService not available' };
    })();
};

console.log('✅ Debug functions loaded. You can now run debugAuth() anytime.');
