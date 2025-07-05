/**
 * Auth Status Checker - Consolidated Debug Tool
 * Code with Morais - Authentication Diagnostics
 * 
 * This utility helps diagnose authentication issues and can be run directly from the console.
 */

(function() {
    'use strict';

    // ===== AUTH STATUS CHECKER =====
    const checkAuthStatus = () => {
        console.group('🔐 Authentication Status Check');
        console.log('Time:', new Date().toISOString());
        
        // Check localStorage for tokens
        const authToken = localStorage.getItem('auth_token');
        const userProfile = localStorage.getItem('cwm_user_profile');
        
        // Check if Google auth is available
        const googleAuthAvailable = typeof window.GoogleAuth === 'object';
        const googleApiAvailable = typeof google !== 'undefined' && !!google.accounts;
        
        // Check if auth service is available
        const authServiceAvailable = typeof window.authService === 'object';
        
        // Check for current user object
        const currentUserAvailable = !!window.currentUser;
        
        // Display results
        console.log('📱 Local Storage:');
        console.log('  - auth_token:', authToken ? '✅ Present' : '❌ Missing');
        console.log('  - user profile:', userProfile ? '✅ Present' : '❌ Missing');
        
        console.log('🔧 Auth Services:');
        console.log('  - Google Auth:', googleAuthAvailable ? '✅ Available' : '❌ Missing');
        console.log('  - Google API:', googleApiAvailable ? '✅ Available' : '❌ Missing');
        console.log('  - Auth Service:', authServiceAvailable ? '✅ Available' : '❌ Missing');
        
        console.log('👤 User State:');
        console.log('  - Current User:', currentUserAvailable ? '✅ Available' : '❌ Missing');
        
        const isAuthenticated = authToken && (currentUserAvailable || authServiceAvailable);
        console.log('🔑 Overall Status:', isAuthenticated ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED');
        
        console.groupEnd();
        
        return {
            isAuthenticated: isAuthenticated,
            storage: {
                authToken: !!authToken,
                userProfile: !!userProfile
            },
            services: {
                googleAuth: googleAuthAvailable,
                googleApi: googleApiAvailable,
                authService: authServiceAvailable
            },
            user: currentUserAvailable
        };
    };

    // ===== GOOGLE AUTH DIAGNOSTICS =====
    const checkGoogleAuth = () => {
        console.group('🔍 Google Auth Diagnostics');
        
        const googleLoaded = typeof google !== 'undefined';
        const googleAccountsAvailable = googleLoaded && !!google.accounts;
        const googleIdAvailable = googleAccountsAvailable && !!google.accounts.id;
        const googleAuthModuleAvailable = typeof window.GoogleAuth === 'object';
        const clientIdConfigured = window.CONFIG && !!window.CONFIG.GOOGLE_CLIENT_ID;
        const clientId = clientIdConfigured ? window.CONFIG.GOOGLE_CLIENT_ID : null;
        
        console.log('🌐 Google SDK:');
        console.log('  - Google SDK Loaded:', googleLoaded ? '✅ Yes' : '❌ No');
        console.log('  - Google Accounts API:', googleAccountsAvailable ? '✅ Available' : '❌ Missing');
        console.log('  - Google Identity API:', googleIdAvailable ? '✅ Available' : '❌ Missing');
        
        console.log('🔧 Configuration:');
        console.log('  - GoogleAuth Module:', googleAuthModuleAvailable ? '✅ Available' : '❌ Missing');
        console.log('  - Client ID Configured:', clientIdConfigured ? '✅ Yes' : '❌ No');
        if (clientId) {
            console.log('  - Client ID:', clientId);
        }
        
        // Get initialization status
        const isInitialized = googleAuthModuleAvailable && window.GoogleAuth.isInitialized;
        console.log('  - Initialization:', isInitialized ? '✅ Initialized' : '❌ Not Initialized');
        
        // Overall status
        const googleAuthWorking = googleLoaded && googleAccountsAvailable && googleIdAvailable && 
                                  googleAuthModuleAvailable && clientIdConfigured && isInitialized;
        
        console.log('🎯 Overall Google Auth Status:', googleAuthWorking ? 
                    '✅ PROPERLY CONFIGURED' : '❌ CONFIGURATION ISSUES DETECTED');
        
        console.groupEnd();
        
        return {
            working: googleAuthWorking,
            sdk: {
                loaded: googleLoaded,
                accounts: googleAccountsAvailable,
                identity: googleIdAvailable
            },
            config: {
                module: googleAuthModuleAvailable,
                clientId: clientIdConfigured,
                initialized: isInitialized
            }
        };
    };

    // ===== AUTH FIXER =====
    const fixAuthIssues = () => {
        console.group('🔧 Auth Fixer');
        
        const fixes = [];
        
        // Fix 1: Check for misnamed auth tokens in localStorage
        const possibleTokenKeys = ['auth_token', 'authToken', 'token', 'cwm_auth_token', 'user_token'];
        let foundToken = null;
        
        for (const key of possibleTokenKeys) {
            const value = localStorage.getItem(key);
            if (value && key !== 'auth_token') {
                foundToken = { key, value };
                break;
            }
        }
        
        if (foundToken && !localStorage.getItem('auth_token')) {
            localStorage.setItem('auth_token', foundToken.value);
            fixes.push(`Fixed: Copied token from '${foundToken.key}' to 'auth_token'`);
        }
        
        // Fix 2: Ensure window.currentUser is set if profile exists
        const userProfile = localStorage.getItem('cwm_user_profile');
        if (userProfile && !window.currentUser) {
            try {
                window.currentUser = JSON.parse(userProfile);
                fixes.push('Fixed: Set window.currentUser from localStorage profile');
            } catch (e) {
                console.error('Failed to parse user profile:', e);
            }
        }
        
        // Fix 3: Initialize Auth Service if available but not initialized
        if (window.authService && typeof window.authService.init === 'function' && !window.authService.initialized) {
            window.authService.init();
            fixes.push('Fixed: Initialized authService');
        }
        
        // Fix 4: Initialize Google Auth if available but not initialized
        if (window.GoogleAuth && typeof window.GoogleAuth.init === 'function' && !window.GoogleAuth.isInitialized) {
            window.GoogleAuth.init();
            fixes.push('Fixed: Initialized GoogleAuth');
        }
        
        if (fixes.length === 0) {
            console.log('✅ No issues found that can be automatically fixed');
        } else {
            console.log('✅ Fixed the following issues:');
            fixes.forEach(fix => console.log('  - ' + fix));
        }
        
        console.groupEnd();
        
        return {
            fixesApplied: fixes.length > 0,
            fixes: fixes
        };
    };

    // ===== PUBLIC API =====
    window.AuthDebug = {
        checkStatus: checkAuthStatus,
        checkGoogleAuth: checkGoogleAuth,
        fix: fixAuthIssues,
        
        // Comprehensive check that runs all diagnostics
        runDiagnostics: () => {
            console.clear();
            console.log('%c=== 🔍 AUTHENTICATION DIAGNOSTICS ===', 'font-size: 16px; font-weight: bold; color: #4CAF50;');
            console.log('URL:', window.location.href);
            console.log('Time:', new Date().toISOString());
            console.log('');
            
            const authStatus = checkAuthStatus();
            console.log('');
            const googleAuthStatus = checkGoogleAuth();
            
            return {
                authStatus,
                googleAuthStatus,
                isFullyAuthenticated: authStatus.isAuthenticated && googleAuthStatus.working
            };
        }
    };

    // Add simple global functions for console use
    window.checkAuth = window.AuthDebug.checkStatus;
    window.checkGoogleAuth = window.AuthDebug.checkGoogleAuth;
    window.fixAuth = window.AuthDebug.fix;
    window.debugAuth = window.AuthDebug.runDiagnostics;

    console.log('✅ Auth Debug Tools loaded successfully');
    console.log('📝 Available functions: checkAuth(), checkGoogleAuth(), fixAuth(), debugAuth()');
})();
