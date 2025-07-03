/**
 * Google Auth Buttons Initialization
 * Ensures that all Google Sign-in buttons are properly initialized
 */

(function() {
    'use strict';
    
    // Wait for DOM content to be loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a short time to ensure Google Identity Services has loaded
        setTimeout(initializeGoogleButtons, 1000);
    });
    
    /**
     * Initialize all Google Sign-in buttons
     */
    function initializeGoogleButtons() {
        if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
            console.warn('⚠️ Google Identity Services not available for button initialization');
            // Try again in a second if Google API isn't loaded yet
            setTimeout(initializeGoogleButtons, 1000);
            return;
        }
        
        console.log('🔄 Initializing Google Sign-in buttons...');
        
        // Find all Google Sign-in button containers
        const buttonContainers = document.querySelectorAll('[data-google-signin]');
        
        if (buttonContainers.length === 0) {
            console.log('ℹ️ No Google Sign-in buttons found on this page');
            return;
        }
        
        // Get the client ID
        const clientId = window.CONFIG && window.CONFIG.GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.error('❌ Google client ID not available');
            return;
        }
        
        // Initialize Google Identity Services if not already done
        try {
            console.log('🔄 Ensuring Google Identity Services is initialized...');
            
            // Initialize with global callback
            google.accounts.id.initialize({
                client_id: clientId,
                callback: function(response) {
                    if (window.handleCredentialResponse) {
                        window.handleCredentialResponse(response);
                    } else {
                        console.error('❌ Global handleCredentialResponse not available');
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true
            });
            
            // Render buttons
            buttonContainers.forEach(function(container, index) {
                const buttonOptions = {
                    type: container.dataset.type || 'standard',
                    theme: container.dataset.theme || 'outline',
                    size: container.dataset.size || 'large',
                    text: container.dataset.text || 'signin_with',
                    shape: container.dataset.shape || 'rectangular',
                    logo_alignment: container.dataset.logoAlignment || 'left'
                };
                
                console.log(`🔄 Rendering Google button #${index + 1} with options:`, buttonOptions);
                
                google.accounts.id.renderButton(
                    container,
                    buttonOptions
                );
            });
            
            console.log('✅ Google Sign-in buttons initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Google Sign-in buttons:', error);
        }
    }
})();
