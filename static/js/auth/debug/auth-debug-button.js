/**
 * Auth Debug Button - Quick access to auth debugging tools
 * Code with Morais - Auth Debug System
 */

(function() {
    'use strict';
    
    // Create floating debug button
    function createDebugButton() {
        // Check if button already exists
        if (document.getElementById('auth-debug-button')) {
            return;
        }
        
        // Create button styles
        const style = document.createElement('style');
        style.textContent = `
            #auth-debug-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: #2196F3;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                z-index: 9999;
                font-size: 24px;
                border: none;
                transition: all 0.3s ease;
            }
            
            #auth-debug-button:hover {
                background-color: #0b7dda;
                transform: scale(1.1);
            }
            
            #auth-debug-button:active {
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(style);
        
        // Create button
        const button = document.createElement('button');
        button.id = 'auth-debug-button';
        button.innerHTML = '🔐';
        button.title = 'Auth Debug Tools';
        
        // Add click event to button
        button.addEventListener('click', function() {
            // Check if AuthDebugUI is available and initialize/show it
            if (window.AuthDebugUI) {
                if (document.getElementById('auth-debug-panel')) {
                    // Toggle panel visibility
                    window.AuthDebugUI.toggle();
                } else {
                    // Initialize auth debug UI
                    window.AuthDebugUI.init();
                }
            } else {
                // If AuthDebugUI is not available, load it
                console.log('Loading Auth Debug Tools...');
                
                // Try to run the debug function
                if (typeof window.debugAuth === 'function') {
                    window.debugAuth();
                } else {
                    // Load the auth monitor script
                    const script = document.createElement('script');
                    script.src = '/static/js/auth/debug/auth-monitor.js';
                    script.onload = function() {
                        console.log('✅ Auth Monitor script loaded successfully');
                        if (window.AuthDebugUI) {
                            window.AuthDebugUI.init();
                        } else if (typeof window.debugAuth === 'function') {
                            window.debugAuth();
                        }
                    };
                    script.onerror = function() {
                        console.error('❌ Failed to load Auth Monitor script');
                        alert('Could not load debug tools. Check console for details.');
                    };
                    
                    document.head.appendChild(script);
                }
            }
        });
        
        // Add button to document
        document.body.appendChild(button);
    }
    
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createDebugButton);
    } else {
        createDebugButton();
    }
})();
