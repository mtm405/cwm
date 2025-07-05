/**
 * Auth Debug Suite
 * Code with Morais - Authentication Debugging Toolkit
 * 
 * This script loads all necessary debugging tools for authentication.
 */

(function() {
    'use strict';
    
    // Create loading indicator
    const createLoadingIndicator = () => {
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
        return indicator;
    };
    
    // Update loading indicator
    const updateLoadingIndicator = (message) => {
        const indicator = document.getElementById('auth-debug-loading');
        if (indicator) {
            indicator.textContent = message;
        }
    };
    
    // Remove loading indicator
    const removeLoadingIndicator = () => {
        const indicator = document.getElementById('auth-debug-loading');
        if (indicator) {
            indicator.remove();
        }
    };
    
    // Load a script and return a promise
    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => resolve(src);
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            
            document.head.appendChild(script);
        });
    };
    
    // Main function to load all debug tools
    const loadDebugTools = async () => {
        const indicator = createLoadingIndicator();
        
        try {
            // Load all debug scripts in sequence
            const scripts = [
                '/static/js/debug/auth-monitor.js',
                '/static/js/debug/google-auth-diagnostics.js',
                '/static/js/debug/auth-auto-fix.js'
            ];
            
            for (let i = 0; i < scripts.length; i++) {
                const script = scripts[i];
                updateLoadingIndicator(`🔄 Loading (${i+1}/${scripts.length}): ${script.split('/').pop()}`);
                await loadScript(script);
            }
            
            // Add success message
            updateLoadingIndicator('✅ Auth Debug Tools Loaded');
            
            // Run initial diagnostics
            if (window.GoogleAuthDiagnostics) {
                const results = window.GoogleAuthDiagnostics.run();
                
                // Apply fixes if issues found
                if (results.status === 'error' && window.AuthFixer) {
                    window.AuthFixer.fixCommonIssues();
                }
            }
            
            // Add completion notification
            setTimeout(() => {
                alert('Auth debugging tools loaded. Check the bottom-right corner of the screen for the auth monitor panel.');
                removeLoadingIndicator();
            }, 1500);
            
        } catch (error) {
            console.error('Failed to load auth debug tools:', error);
            updateLoadingIndicator(`❌ Error: ${error.message}`);
            
            setTimeout(() => {
                removeLoadingIndicator();
            }, 3000);
        }
    };
    
    // Start loading when document is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadDebugTools);
    } else {
        loadDebugTools();
    }
})();
