/**
 * Auth Debug Tools Index
 * Code with Morais - Authentication Debugging Suite
 * 
 * This file serves as an index for all the authentication debugging tools.
 * Include this file to add all auth debugging capabilities to your page.
 */

// Load all debugging tools in the correct order
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 Initializing Auth Debug Tools...');
    
    // Function to load a script
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load: ${src}`));
            
            document.head.appendChild(script);
        });
    };
    
    // Load the core tools first
    loadScript('/static/js/auth/debug/auth-status.js')
        .then(() => loadScript('/static/js/auth/debug/google-auth-diagnostics.js'))
        .then(() => loadScript('/static/js/auth/debug/auth-monitor.js'))
        .then(() => {
            console.log('✅ Auth Debug Tools loaded successfully');
            
            // Auto-initialize the UI if in development
            if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
                window.AuthDebugUI && typeof window.AuthDebugUI.init === 'function') {
                window.AuthDebugUI.init();
            }
        })
        .catch(error => {
            console.error('❌ Failed to load Auth Debug Tools:', error);
        });
});
