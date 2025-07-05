/**
 * Auth Debug Loader
 * Load this script to add auth debugging tools to any page
 */

(function() {
    console.log('🔄 Loading Auth Debug Tools...');
    
    // Function to load a script and return a promise
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            
            document.head.appendChild(script);
        });
    };
    
    // Create loading indicator
    const indicator = document.createElement('div');
    indicator.id = 'auth-debug-loading';
    indicator.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
    `;
    indicator.textContent = '🔄 Loading Auth Debug Tools...';
    document.body.appendChild(indicator);
    
    // Load all scripts
    Promise.all([
        loadScript('/static/js/auth/debug/auth-status.js'),
        loadScript('/static/js/auth/debug/google-auth-diagnostics.js')
    ])
    .then(() => {
        indicator.textContent = '✅ Loading Auth Monitor UI...';
        return loadScript('/static/js/auth/debug/auth-monitor.js');
    })
    .then(() => {
        indicator.textContent = '✅ Auth Debug Tools Loaded!';
        
        // Auto-initialize the UI
        if (window.AuthDebugUI && typeof window.AuthDebugUI.init === 'function') {
            window.AuthDebugUI.init();
        }
        
        // Remove the indicator after a delay
        setTimeout(() => {
            indicator.remove();
        }, 2000);
        
        console.log('✅ Auth Debug Tools loaded successfully');
        console.log('📌 Available global functions:');
        console.log('   - checkAuth(): Quick auth status check');
        console.log('   - checkGoogleAuth(): Google auth diagnostics');
        console.log('   - fixAuth(): Attempt to fix auth issues');
        console.log('   - debugAuth(): Comprehensive debug report');
    })
    .catch((error) => {
        indicator.textContent = '❌ Failed to load debug tools';
        indicator.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
        
        console.error('Failed to load Auth Debug Tools:', error);
        
        // Remove the indicator after a delay
        setTimeout(() => {
            indicator.remove();
        }, 5000);
    });
})();
