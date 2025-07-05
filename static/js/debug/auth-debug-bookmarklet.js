/**
 * Add this function to your browser bookmarks as a bookmarklet
 * to instantly add debugging tools to any page
 */

javascript:(function(){
    console.log('🔍 Loading auth debugging tools...');
    
    // Load the full debug suite
    const script = document.createElement('script');
    script.src = '/static/js/debug/auth-debug-suite.js';
    script.async = true;
    
    // Handle errors
    script.onerror = function() {
        console.error('Failed to load debug suite. Loading fallback...');
        
        // Load a standalone version if the full suite fails
        const fallbackScript = document.createElement('script');
        fallbackScript.src = '/static/js/debug/auth-monitor.js';
        fallbackScript.async = true;
        document.head.appendChild(fallbackScript);
    };
    
    document.head.appendChild(script);
})();
