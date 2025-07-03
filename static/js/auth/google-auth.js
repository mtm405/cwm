/**
 * Google Authentication Module - Completely Isolated
 * Code with Morais - Google Sign-In Handler
 * 
 * This module is completely self-contained and will not interfere with other JS functionality.
 * It only handles Google authentication and does not depend on other modules.
 */

(function() {
    'use strict';

    // ==========================================
    // GOOGLE AUTH NAMESPACE - ISOLATED
    // ==========================================
    
    window.GoogleAuth = {
        isInitialized: false,
        isProcessing: false,
        pendingResponse: null,
        config: {
            clientId: null,
            redirectUrl: '/dashboard'
        },

        /**
         * Initialize Google Auth from global config
         */
        init: function() {
            if (this.isInitialized) return;
            
            console.log('🔐 Initializing Google Auth module...');
            
            // Get client ID from global config
            if (window.CONFIG && window.CONFIG.GOOGLE_CLIENT_ID) {
                this.config.clientId = window.CONFIG.GOOGLE_CLIENT_ID;
                console.log('✅ Google Auth config loaded');
                
                // Initialize Google Identity Services if available
                if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                    try {
                        console.log('🔄 Initializing Google Identity Services with client ID:', this.config.clientId);
                        google.accounts.id.initialize({
                            client_id: this.config.clientId,
                            callback: this.handleCredentialResponse.bind(this),
                            auto_select: false,
                            cancel_on_tap_outside: true
                        });
                        console.log('✅ Google Identity Services initialized successfully');
                    } catch (error) {
                        console.error('❌ Failed to initialize Google Identity Services:', error);
                    }
                } else {
                    console.warn('⚠️ Google Identity Services not yet available');
                    // The script might still be loading, we'll rely on the global callback
                }
            } else {
                console.warn('⚠️ Google Auth config not found');
                return;
            }

            this.isInitialized = true;
            
            // Process any pending response
            if (this.pendingResponse || window.pendingGoogleResponse) {
                console.log('🔄 Processing pending Google response...');
                this.handleCredentialResponse(this.pendingResponse || window.pendingGoogleResponse);
                this.pendingResponse = null;
                window.pendingGoogleResponse = null;
            }
        },

        /**
         * Handle Google credential response - ISOLATED
         */
        handleCredentialResponse: function(response) {
            console.log('🔐 Google Sign-In response received by isolated module');
            
            if (this.isProcessing) {
                console.log('⏳ Already processing authentication, ignoring duplicate');
                return;
            }

            if (!response || !response.credential) {
                console.error('❌ Invalid Google Sign-In response');
                return;
            }

            this.isProcessing = true;
            const idToken = response.credential;
            
            // Show loading state on all Google sign-in buttons
            this.setButtonsLoading(true);
            
            // Send token to backend
            fetch('/auth/google/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ token: idToken })
            })
            .then(response => {
                console.log('🌐 Backend response status:', response.status);
                if (!response.ok) {
                    throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('📦 Backend response:', data);
                this.handleAuthResponse(data);
            })
            .catch(error => {
                console.error('❌ Network error during authentication:', error);
                this.handleAuthError(error.message || 'Network error. Please check your connection and try again.');
            })
            .finally(() => {
                this.isProcessing = false;
                this.setButtonsLoading(false);
            });
        },

        /**
         * Handle successful authentication response
         */
        handleAuthResponse: function(data) {
            if (data.success) {
                console.log('✅ Authentication successful');
                
                // Show success feedback
                this.showMessage('Login successful! Redirecting...', 'success');
                
                // Store user data if available
                if (data.user) {
                    window.currentUser = data.user;
                    console.log('👤 User data stored:', data.user);
                }
                
                // Redirect to dashboard
                const redirectUrl = data.redirect_url || this.config.redirectUrl;
                console.log('🔄 Redirecting to:', redirectUrl);
                
                setTimeout(() => {
                    console.log('🚀 Performing redirect...');
                    window.location.href = redirectUrl;
                }, 800);
            } else {
                console.error('❌ Authentication failed:', data.error);
                this.handleAuthError(data.error || 'Authentication failed');
            }
        },

        /**
         * Handle authentication error
         */
        handleAuthError: function(errorMessage) {
            this.showMessage(errorMessage, 'error');
            this.setButtonsLoading(false);
        },

        /**
         * Set loading state on Google sign-in buttons
         */
        setButtonsLoading: function(isLoading) {
            const authButtons = document.querySelectorAll('.g_id_signin, [data-google-signin]');
            authButtons.forEach(btn => {
                if (btn) {
                    btn.style.opacity = isLoading ? '0.6' : '1';
                    btn.style.pointerEvents = isLoading ? 'none' : 'auto';
                }
            });
        },

        /**
         * Show message to user (with fallback)
         */
        showMessage: function(message, type) {
            // Try to use toast function if available
            if (typeof showToast === 'function') {
                showToast(message, type);
            } 
            // Try to use notification system if available
            else if (window.notificationManager && typeof window.notificationManager.show === 'function') {
                window.notificationManager.show(message, type);
            }
            // Fallback to alert
            else {
                alert(message);
            }
        },

        /**
         * Reset authentication state
         */
        reset: function() {
            this.isProcessing = false;
            this.pendingResponse = null;
            this.setButtonsLoading(false);
        },

        /**
         * Sign out user - handles both Google and backend logout
         */
        signOut: function() {
            console.log('🔓 Starting sign out process...');
            
            // Prevent multiple simultaneous logout attempts
            if (this.isProcessing) {
                console.log('⚠️ Sign out already in progress, ignoring duplicate call');
                return;
            }
            
            this.isProcessing = true;
            this.showMessage('Signing out...', 'info');
            
            // Step 1: Clear backend session
            this.clearBackendSession()
                .then(() => {
                    console.log('✅ Backend session cleared');
                    
                    // Step 2: Sign out from Google if available
                    return this.signOutFromGoogle();
                })
                .then(() => {
                    console.log('✅ Google sign out completed');
                    
                    // Step 3: Clear local data
                    this.clearLocalData();
                    
                    // Step 4: Show success and redirect
                    this.showMessage('Signed out successfully!', 'success');
                    
                    setTimeout(() => {
                        console.log('🏠 Redirecting to home page...');
                        window.location.href = '/';
                    }, 1000);
                })
                .catch(error => {
                    console.error('❌ Sign out error:', error);
                    this.showMessage('Sign out completed with some issues', 'warning');
                    
                    // Even if there are errors, clear local data and redirect
                    this.clearLocalData();
                    setTimeout(() => {
                        console.log('🏠 Redirecting to home page (after error)...');
                        window.location.href = '/';
                    }, 1500);
                })
                .finally(() => {
                    this.isProcessing = false;
                });
        },

        /**
         * Clear backend session
         */
        clearBackendSession: function() {
            return fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin'
            })
            .then(response => {
                console.log('Backend logout response status:', response.status);
                if (!response.ok) {
                    console.warn(`Backend logout returned status ${response.status}`);
                }
                return response.json().catch(() => {
                    // Handle case where response isn't valid JSON
                    return { success: false, error: 'Invalid response' };
                });
            })
            .then(data => {
                if (!data.success) {
                    console.warn('Backend logout reported failure:', data.error);
                }
                console.log('🗑️ Backend session cleared (or attempted)');
                return data;
            })
            .catch(error => {
                console.error('Error during backend logout:', error);
                // Continue with process despite errors
                return { success: false, error: error.message };
            });
        },

        /**
         * Sign out from Google if Google Identity Services is available
         */
        signOutFromGoogle: function() {
            return new Promise((resolve) => {
                // Check if Google Identity Services is available
                if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
                    try {
                        // Disable auto-select
                        google.accounts.id.disableAutoSelect();
                        console.log('🔓 Google auto-select disabled');
                        
                        // If there's a way to revoke the session, do it
                        if (google.accounts.id.revoke) {
                            google.accounts.id.revoke(this.config.clientId, () => {
                                console.log('🔓 Google session revoked');
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    } catch (error) {
                        console.warn('⚠️ Google sign out error (non-critical):', error);
                        resolve(); // Continue even if Google logout fails
                    }
                } else {
                    console.log('ℹ️ Google Identity Services not available for logout');
                    resolve();
                }
            });
        },

        /**
         * Clear local data
         */
        clearLocalData: function() {
            // Clear user data
            if (window.currentUser) {
                delete window.currentUser;
            }
            
            // Clear any auth tokens in localStorage
            try {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('google_auth_state');
                console.log('🗑️ Local storage cleared');
            } catch (error) {
                console.warn('⚠️ Could not clear localStorage:', error);
            }
            
            // Clear any sessionStorage
            try {
                sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('user_data');
                console.log('🗑️ Session storage cleared');
            } catch (error) {
                console.warn('⚠️ Could not clear sessionStorage:', error);
            }
            
            // Reset module state
            this.reset();
        },

        /**
         * Fallback logout method when signOut fails
         */
        fallbackLogout: function() {
            console.log('🔄 Using fallback logout method...');
            
            this.clearBackendSession()
                .then(() => {
                    this.clearLocalData();
                    console.log('🏠 Redirecting to home page (fallback)...');
                    window.location.href = '/';
                })
                .catch(error => {
                    console.error('❌ Fallback logout error:', error);
                    // Force redirect even if backend fails
                    this.clearLocalData();
                    window.location.href = '/';
                });
        },
    };

    // ==========================================
    // GLOBAL CALLBACK - ISOLATED
    // ==========================================
    
    /**
     * Global callback for Google Sign-In - points to isolated module
     */
    window.handleCredentialResponse = function(response) {
        console.log('🔗 Global callback received, routing to isolated Google Auth module');
        
        if (window.GoogleAuth.isInitialized) {
            window.GoogleAuth.handleCredentialResponse(response);
        } else {
            console.log('📦 Google Auth not initialized yet, storing response');
            window.GoogleAuth.pendingResponse = response;
            window.GoogleAuth.init();
        }
    };

    /**
     * Global sign out function - points to isolated module
     */
    window.signOut = function() {
        console.log('🔗 Global signOut called, routing to isolated Google Auth module');
        
        // Check if GoogleAuth module is available and initialized
        if (window.GoogleAuth) {
            console.log('✅ GoogleAuth module found');
            
            if (typeof window.GoogleAuth.signOut === 'function') {
                console.log('✅ GoogleAuth.signOut method found, calling it...');
                window.GoogleAuth.signOut();
            } else {
                console.error('❌ GoogleAuth.signOut method not found');
                window.GoogleAuth.fallbackLogout();
            }
        } else {
            console.error('❌ Google Auth module not available for logout');
            // Fallback: clear session and redirect
            console.log('🔄 Using fallback logout method...');
            fetch('/auth/logout', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            })
                .then(response => {
                    console.log(`✅ Fallback logout response: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    console.log('✅ Fallback logout successful:', data);
                    window.location.href = '/';
                })
                .catch(error => {
                    console.error('❌ Fallback logout failed:', error);
                    window.location.href = '/';
                });
        }
    };

    // ==========================================
    // AUTO-INITIALIZATION
    // ==========================================
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            window.GoogleAuth.init();
        });
    } else {
        window.GoogleAuth.init();
    }

    // Also initialize when config becomes available
    if (window.CONFIG) {
        window.GoogleAuth.init();
    } else {
        // Wait for config to load
        const configCheckInterval = setInterval(function() {
            if (window.CONFIG) {
                clearInterval(configCheckInterval);
                window.GoogleAuth.init();
            }
        }, 100);
        
        // Stop checking after 5 seconds
        setTimeout(function() {
            clearInterval(configCheckInterval);
        }, 5000);
    }

    console.log('🔐 Google Auth module loaded and isolated');

})();
