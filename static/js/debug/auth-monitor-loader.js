/**
 * Auth Monitor Loader
 * This script injects the auth monitor into any page for debugging
 */

(function() {
    // Create script element
    const script = document.createElement('script');
    script.src = '/static/js/debug/auth-monitor.js';
    script.async = true;
    script.onload = function() {
        console.log('✅ Auth Monitor loaded successfully');
        // Initialize if not already done by the script
        if (window.AuthMonitor && !document.getElementById('auth-debug-panel')) {
            window.AuthMonitor.init();
        }
    };
    script.onerror = function() {
        console.error('❌ Failed to load Auth Monitor');
        alert('Auth Monitor failed to load. Check the console for details.');
    };
    
    // Append to head
    document.head.appendChild(script);
    
    console.log('🔄 Loading Auth Monitor...');
})();
