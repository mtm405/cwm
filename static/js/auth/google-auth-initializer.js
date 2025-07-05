/**
 * Google Auth Initializer - Auto-initializes Google Auth when loaded
 * Code with Morais
 */

(function() {
    'use strict';
    
    // Helper function to check if all requirements are loaded
    const checkGoogleAuthRequirements = () => {
        // Check if Google SDK is loaded
        const googleLoaded = typeof google !== 'undefined' && !!google.accounts && !!google.accounts.id;
        
        // Check if GoogleAuth module is loaded
        const googleAuthLoaded = typeof window.GoogleAuth === 'object' && typeof window.GoogleAuth.init === 'function';
        
        // Check if CONFIG is available with client ID
        const configLoaded = window.CONFIG && !!window.CONFIG.GOOGLE_CLIENT_ID;
        
        return googleLoaded && googleAuthLoaded && configLoaded;
    };
    
    // Initialize Google Auth when all dependencies are available
    const initializeGoogleAuth = () => {
        if (checkGoogleAuthRequirements()) {
            // If already initialized, skip
            if (window.GoogleAuth.isInitialized) {
                console.log('✅ Google Auth already initialized');
                return true;
            }
            
            console.log('✅ Initializing Google Auth automatically...');
            window.GoogleAuth.init();
            return true;
        }
        
        return false;
    };
    
    // Try immediate initialization
    if (!initializeGoogleAuth()) {
        console.log('⏳ Waiting for Google Auth dependencies to load...');
        
        // Set up a periodic check to initialize when dependencies are ready
        const checkInterval = setInterval(() => {
            if (initializeGoogleAuth()) {
                clearInterval(checkInterval);
            }
        }, 100);
        
        // Stop checking after 10 seconds (prevent infinite loop)
        setTimeout(() => {
            clearInterval(checkInterval);
            
            // Final check
            if (!window.GoogleAuth || !window.GoogleAuth.isInitialized) {
                console.warn('⚠️ Google Auth initialization timed out. Manual initialization might be required.');
                
                // Try one last time with more detailed logging
                if (typeof google === 'undefined') {
                    console.error('❌ Google SDK not loaded');
                } else if (!google.accounts || !google.accounts.id) {
                    console.error('❌ Google Identity Services not loaded properly');
                } else if (!window.GoogleAuth) {
                    console.error('❌ GoogleAuth module not loaded');
                } else if (!window.CONFIG || !window.CONFIG.GOOGLE_CLIENT_ID) {
                    console.error('❌ CONFIG.GOOGLE_CLIENT_ID not available');
                }
            }
        }, 10000);
    }
    
    // Fix for Google script loading order issues in templates
    const headTemplate = document.querySelector('head');
    
    if (headTemplate) {
        // Check script loading order
        const scripts = document.querySelectorAll('script[src]');
        let googleScriptIndex = -1;
        let authScriptIndex = -1;
        
        scripts.forEach((script, index) => {
            const src = script.src.toLowerCase();
            if (src.includes('accounts.google.com/gsi/client')) {
                googleScriptIndex = index;
            } else if (src.includes('google-auth.js')) {
                authScriptIndex = index;
            }
        });
        
        // If Google script loads after auth script, this is a problem
        if (googleScriptIndex > authScriptIndex) {
            console.warn('⚠️ Google Identity Services script is loaded after google-auth.js. This might cause initialization issues.');
        }
    }
})();
