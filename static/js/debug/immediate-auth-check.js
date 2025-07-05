/**
 * Auth Status Checker - For Console Use
 * 
 * Copy and paste this entire script into your browser console to check authentication status.
 * This script is completely self-contained and doesn't require loading external files.
 */

(function() {
    console.clear();
    console.log('%c🔐 Authentication Status Check', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', window.location.href);
    
    // Check LocalStorage
    console.group('%c📦 LocalStorage', 'font-weight: bold; color: #2196F3;');
    const authToken = localStorage.getItem('auth_token');
    const userToken = localStorage.getItem('cwm_user_token');
    const userProfile = localStorage.getItem('cwm_user_profile');
    
    console.log('auth_token:', authToken ? `✅ Present (${authToken.length} chars)` : '❌ Missing');
    console.log('cwm_user_token:', userToken ? `✅ Present (${userToken.length} chars)` : '❌ Missing');
    console.log('cwm_user_profile:', userProfile ? '✅ Present' : '❌ Missing');
    
    // Look for all auth-related keys
    const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('auth') || key.includes('token') || key.includes('user') || key.includes('cwm')
    );
    
    if (authKeys.length > 0) {
        console.log('All auth-related keys:', authKeys);
    }
    console.groupEnd();
    
    // Check SessionStorage
    console.group('%c🔒 SessionStorage', 'font-weight: bold; color: #2196F3;');
    const sessionToken = sessionStorage.getItem('auth_token');
    console.log('auth_token:', sessionToken ? `✅ Present (${sessionToken.length} chars)` : '❌ Missing');
    console.groupEnd();
    
    // Check Window Objects
    console.group('%c🪟 Window Objects', 'font-weight: bold; color: #2196F3;');
    console.log('window.currentUser:', window.currentUser ? '✅ Present' : '❌ Missing');
    console.log('window.GoogleAuth:', typeof window.GoogleAuth === 'object' ? '✅ Present' : '❌ Missing');
    console.log('window.authService:', typeof window.authService === 'object' ? '✅ Present' : '❌ Missing');
    console.log('window.AuthManager:', typeof window.AuthManager !== 'undefined' ? '✅ Present' : '❌ Missing');
    
    if (window.GoogleAuth) {
        console.log('GoogleAuth.isInitialized:', window.GoogleAuth.isInitialized ? '✅ Yes' : '❌ No');
        console.log('GoogleAuth.config:', window.GoogleAuth.config);
    }
    console.groupEnd();
    
    // Check Google SDK
    console.group('%c🔍 Google SDK', 'font-weight: bold; color: #2196F3;');
    console.log('Google SDK loaded:', typeof google !== 'undefined' ? '✅ Yes' : '❌ No');
    
    if (typeof google !== 'undefined') {
        console.log('Google Accounts API:', google.accounts ? '✅ Available' : '❌ Missing');
        console.log('Google Identity Services:', google.accounts && google.accounts.id ? '✅ Available' : '❌ Missing');
    }
    console.groupEnd();
    
    // Check Global Callback
    console.group('%c📞 Callback Functions', 'font-weight: bold; color: #2196F3;');
    console.log('handleCredentialResponse:', typeof window.handleCredentialResponse === 'function' ? '✅ Present' : '❌ Missing');
    console.groupEnd();
    
    // Check Config
    console.group('%c⚙️ Configuration', 'font-weight: bold; color: #2196F3;');
    console.log('window.CONFIG:', typeof window.CONFIG === 'object' ? '✅ Present' : '❌ Missing');
    
    if (typeof window.CONFIG === 'object') {
        console.log('GOOGLE_CLIENT_ID:', window.CONFIG.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing');
        console.log('AUTH_TOKEN_KEY:', window.CONFIG.AUTH_TOKEN_KEY ? '✅ Set' : '❌ Missing');
        
        if (window.CONFIG.features) {
            console.log('Authentication enabled:', window.CONFIG.features.authentication ? '✅ Yes' : '❌ No');
        }
    }
    console.groupEnd();
    
    // Check Script Tags
    console.group('%c📄 Script Tags', 'font-weight: bold; color: #2196F3;');
    const scripts = Array.from(document.scripts);
    const googleScripts = scripts.filter(script => 
        script.src && (script.src.includes('google') || script.src.includes('gsi'))
    );
    const authScripts = scripts.filter(script => 
        script.src && (script.src.includes('auth') || script.src.includes('login'))
    );
    
    console.log('Google-related scripts:', googleScripts.length > 0 ? googleScripts.map(s => s.src) : 'None found');
    console.log('Auth-related scripts:', authScripts.length > 0 ? authScripts.map(s => s.src) : 'None found');
    console.groupEnd();
    
    // Overall Authentication Status
    console.group('%c🔐 Overall Status', 'font-weight: bold; color: #2196F3;');
    const isAuthenticated = !!(authToken || userToken || sessionToken) && !!window.currentUser;
    
    console.log('Authentication status:', isAuthenticated ? 
        '%c✅ AUTHENTICATED' : '%c❌ NOT AUTHENTICATED', 
        isAuthenticated ? 'color: green; font-weight: bold' : 'color: red; font-weight: bold'
    );
    
    if (!isAuthenticated) {
        console.log('Possible issues:');
        
        if (!authToken && !userToken && !sessionToken) {
            console.log('❌ No authentication token found');
        }
        
        if (!window.currentUser) {
            console.log('❌ No current user object');
        }
        
        if (typeof window.GoogleAuth === 'undefined') {
            console.log('❌ GoogleAuth object not found');
        } else if (!window.GoogleAuth.isInitialized) {
            console.log('❌ GoogleAuth not initialized');
        }
        
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
            console.log('❌ Google Identity Services not loaded');
        }
        
        if (typeof window.handleCredentialResponse !== 'function') {
            console.log('❌ Global callback function missing');
        }
    }
    console.groupEnd();
    
    console.log('%c📋 Quick fix suggestions:', 'font-weight: bold');
    console.log('1. Run fixAuthIssues() to attempt automatic fixes');
    console.log('2. Add the auth-debug-suite.js script to your page');
    console.log('3. Check browser console for Google authentication errors');
    
    return {
        isAuthenticated: isAuthenticated,
        hasToken: !!(authToken || userToken || sessionToken),
        hasUserObject: !!window.currentUser,
        hasGoogleAuth: typeof window.GoogleAuth === 'object',
        hasGoogleSDK: typeof google !== 'undefined' && !!google.accounts,
        hasGlobalCallback: typeof window.handleCredentialResponse === 'function'
    };
})();
