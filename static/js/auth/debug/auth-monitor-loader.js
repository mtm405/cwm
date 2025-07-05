/**
 * Auth Monitor Loader
 * 
 * This script ensures the auth monitor is properly loaded and initialized
 */

(function() {
    'use strict';
    
    // Add manual auth fix button to page
    const addManualAuthFix = () => {
        if (document.getElementById('manual-auth-fix-btn')) return;
        
        const fixBtn = document.createElement('button');
        fixBtn.id = 'manual-auth-fix-btn';
        fixBtn.innerHTML = '🔧 Fix Auth';
        fixBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 12px;
            cursor: pointer;
            z-index: 9999;
            font-family: monospace;
        `;
        
        fixBtn.addEventListener('click', () => {
            console.log('🔧 Manual auth fix requested');
            
            // Try auth recovery if available
            if (window.AuthRecovery) {
                const recovered = window.AuthRecovery.runIfNeeded();
                if (recovered) {
                    alert('Auth token recovered! You may need to refresh the page.');
                    // Don't auto-reload, let user decide
                } else {
                    alert('No auth issues found or recovery failed. Check console for details.');
                }
            } else {
                // Manual recovery
                console.log('🔄 Running manual auth recovery...');
                
                // Check for user without token
                const hasUser = !!(window.currentUser || localStorage.getItem('cwm_user_profile'));
                const hasToken = !!(localStorage.getItem('auth_token') || localStorage.getItem('cwm_user_token'));
                
                if (hasUser && !hasToken) {
                    alert('Found user without auth token. Please sign in again.');
                    window.location.href = '/login';
                } else if (!hasUser && !hasToken) {
                    alert('No user or token found. Please sign in.');
                    window.location.href = '/login';
                } else {
                    alert('Auth status appears normal. Check debug panel for details.');
                }
            }
        });
        
        document.body.appendChild(fixBtn);
    };
    
    // Check if the auth monitor is already loaded
    if (window.AuthMonitor) {
        console.log('Auth Monitor already loaded, initializing...');
        if (typeof window.AuthMonitor.init === 'function') {
            window.AuthMonitor.init();
        }
        addManualAuthFix();
        return;
    }
    
    console.log('Loading Auth Monitor...');
    
    // Load the auth monitor script
    const script = document.createElement('script');
    script.src = '/static/js/auth/debug/auth-monitor.js';
    script.onload = function() {
        console.log('✅ Auth Monitor script loaded successfully');
        addManualAuthFix();
    };
    script.onerror = function() {
        console.error('❌ Failed to load Auth Monitor script');
        addManualAuthFix();
    };
    
    document.head.appendChild(script);
})();
