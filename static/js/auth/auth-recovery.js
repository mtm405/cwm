/**
 * Auth Token Recovery System
 * Code with Morais - Authentication Helper
 * 
 * This script helps recover lost auth tokens and fix common auth problems
 */

(function() {
    'use strict';

    // Auth token recovery system
    const AuthRecovery = {
        // Configuration
        config: {
            tokenKeys: ['auth_token', 'cwm_user_token', 'authToken'],
            userKeys: ['currentUser', 'cwm_user_profile', 'user_data']
        },

        /**
         * Check if authentication is broken (user exists but token missing)
         */
        checkBrokenAuth: function() {
            const hasUser = this.hasUserObject();
            const hasToken = this.hasAuthToken();

            return hasUser && !hasToken;
        },

        /**
         * Check if auth token exists
         */
        hasAuthToken: function() {
            for (const key of this.config.tokenKeys) {
                if (localStorage.getItem(key) || sessionStorage.getItem(key)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Check if user object exists
         */
        hasUserObject: function() {
            // Check window objects
            if (window.currentUser) return true;
            if (window.app && window.app.currentUser) return true;

            // Check localStorage
            for (const key of this.config.userKeys) {
                const userData = localStorage.getItem(key);
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        if (user && (user.id || user.email || user.userId)) {
                            return true;
                        }
                    } catch (e) {
                        // Invalid JSON, continue checking
                    }
                }
            }

            return false;
        },

        /**
         * Restore user object from localStorage to window.currentUser
         */
        restoreUserObject: function() {
            // If window.currentUser already exists, we're good
            if (window.currentUser) return true;

            console.log('🔄 Attempting to restore user object...');

            // Try to restore from localStorage
            for (const key of this.config.userKeys) {
                const userData = localStorage.getItem(key);
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        if (user && (user.id || user.uid || user.email)) {
                            window.currentUser = user;
                            console.log('✅ Restored window.currentUser from localStorage:', user);
                            return true;
                        }
                    } catch (e) {
                        console.warn('⚠️ Failed to parse user data from', key, ':', e);
                    }
                }
            }

            console.warn('⚠️ Could not restore user object from any source');
            return false;
        },

        /**
         * Try to recover auth token from all possible sources
         */
        recoverToken: function() {
            console.log('🔄 Attempting to recover authentication token...');

            // First check all storage locations
            for (const key of this.config.tokenKeys) {
                // Check localStorage
                const localToken = localStorage.getItem(key);
                if (localToken) {
                    this.restoreToken(localToken);
                    this.extractUserFromToken(localToken); // Extract user from JWT
                    return true;
                }

                // Check sessionStorage
                const sessionToken = sessionStorage.getItem(key);
                if (sessionToken) {
                    this.restoreToken(sessionToken);
                    this.extractUserFromToken(sessionToken); // Extract user from JWT
                    return true;
                }
            }

            // If token not found in storage, try to get from cookies
            const tokenFromCookie = this.getTokenFromCookies();
            if (tokenFromCookie) {
                this.restoreToken(tokenFromCookie);
                this.extractUserFromToken(tokenFromCookie); // Extract user from JWT
                return true;
            }

            // If still no token, try to get from server if we have user info
            return this.requestNewToken();
        },

        /**
         * Extract user information from JWT token
         */
        extractUserFromToken: function(token) {
            if (!token || token === 'session_authenticated') {
                console.log('⚠️ Token is session placeholder, cannot extract user info');
                return false;
            }
            
            if (!token.includes('.')) {
                console.log('⚠️ Token is not a JWT format');
                return false;
            }

            try {
                // Validate token format before decoding
                const parts = token.split('.');
                if (parts.length !== 3) {
                    console.warn('⚠️ Invalid JWT format: token must have 3 parts');
                    return false;
                }

                // Safely decode the payload with proper padding
                let payload;
                try {
                    const encodedPayload = parts[1];
                    // Add padding if needed for base64 decoding
                    const paddedPayload = encodedPayload + '='.repeat((4 - encodedPayload.length % 4) % 4);
                    const decodedPayload = atob(paddedPayload);
                    payload = JSON.parse(decodedPayload);
                } catch (decodeError) {
                    console.warn('⚠️ Failed to decode JWT payload:', decodeError.message);
                    return false;
                }
                
                // Extract user info
                const userInfo = {
                    id: payload.sub || payload.user_id,
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                    given_name: payload.given_name,
                    family_name: payload.family_name
                };
                
                // Only proceed if we have at least an ID or email
                if (userInfo.id || userInfo.email) {
                    // Store user profile
                    localStorage.setItem('cwm_user_profile', JSON.stringify(userInfo));
                    window.currentUser = userInfo;
                    
                    console.log('✅ User profile extracted and restored from token:', userInfo);
                    return true;
                }
                
            } catch (error) {
                console.error('❌ Failed to extract user from token:', error);
            }
            
            return false;
        },

        /**
         * Look for auth token in cookies
         */
        getTokenFromCookies: function() {
            const cookies = document.cookie.split(';');
            for (const cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (this.config.tokenKeys.includes(name)) {
                    return decodeURIComponent(value);
                }
            }
            return null;
        },

        /**
         * Restore token to localStorage
         */
        restoreToken: function(token) {
            if (!token) return false;

            console.log('✅ Found valid token, restoring...');
            localStorage.setItem('auth_token', token);
            
            // Also set other common token names for compatibility
            localStorage.setItem('cwm_user_token', token);
            
            console.log('✅ Auth token restored successfully');
            return true;
        },

        /**
         * Request a new token from server using existing user info
         */
        requestNewToken: async function() {
            if (!this.hasUserObject()) return false;

            try {
                console.log('🔄 Requesting new token from server...');
                
                // Get user ID or email from available sources
                const userInfo = this.extractUserInfo();
                if (!userInfo) {
                    console.error('❌ Could not extract user info for token refresh');
                    return false;
                }

                // Request new token with proper error handling
                const response = await fetch('/api/auth/refresh-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userInfo)
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.token) {
                        this.restoreToken(data.token);
                        return true;
                    }
                } else if (response.status === 404) {
                    console.warn('⚠️ Token refresh endpoint not available - continuing without refresh');
                    return false;
                }
                
                console.warn('⚠️ Server did not provide a new token');
                return false;
            } catch (error) {
                if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
                    console.warn('⚠️ Network error during token refresh - continuing without refresh');
                } else {
                    console.error('❌ Error requesting new token:', error);
                }
                return false;
            }
        },

        /**
         * Extract user info from available sources
         */
        extractUserInfo: function() {
            // Try window.currentUser first
            if (window.currentUser) {
                if (typeof window.currentUser === 'object') {
                    return {
                        userId: window.currentUser.id || window.currentUser.userId,
                        email: window.currentUser.email
                    };
                } else {
                    return { userId: window.currentUser };
                }
            }

            // Try app.currentUser
            if (window.app && window.app.currentUser) {
                const user = window.app.currentUser;
                return {
                    userId: user.id || user.userId,
                    email: user.email
                };
            }

            // Try localStorage
            for (const key of this.config.userKeys) {
                const userData = localStorage.getItem(key);
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        if (user) {
                            return {
                                userId: user.id || user.userId,
                                email: user.email
                            };
                        }
                    } catch (e) {
                        // Invalid JSON, continue checking
                    }
                }
            }

            return null;
        },

        /**
         * Run the recovery process if needed
         */
        runIfNeeded: function() {
            let recovered = false;
            
            // Check for broken auth (user exists but token missing)
            if (this.checkBrokenAuth()) {
                console.warn('⚠️ Broken authentication detected (user without token)');
                recovered = this.recoverToken();
            }
            
            // Check for missing user object but token exists
            const hasToken = this.hasAuthToken();
            const hasUser = window.currentUser;
            
            if (hasToken && !hasUser) {
                console.warn('⚠️ Missing user object detected (token without user)');
                
                // First try to restore from localStorage
                const userRestored = this.restoreUserObject();
                if (userRestored) {
                    console.log('✅ User object restored from localStorage');
                    recovered = true;
                } else {
                    // Try to extract user from the token itself
                    console.log('🔍 Attempting to extract user from token...');
                    const token = localStorage.getItem('auth_token') || 
                                  localStorage.getItem('cwm_user_token') || 
                                  sessionStorage.getItem('auth_token');
                    
                    if (token && this.extractUserFromToken(token)) {
                        console.log('✅ User object extracted from token');
                        recovered = true;
                    }
                }
            }
            
            return recovered;
        },

        /**
         * Initialize the recovery system
         */
        init: function() {
            console.log('🔐 Auth Recovery system initialized');
            
            // Run immediately but don't reload automatically
            const recovered = this.runIfNeeded();
            if (recovered) {
                console.log('🔄 Auth state restored - NOT reloading automatically');
                // Don't auto-reload, let user decide
            }
            
            // Also try to restore Google Auth state if available
            if (window.GoogleAuth && typeof window.GoogleAuth.restoreAuthState === 'function') {
                try {
                    window.GoogleAuth.restoreAuthState();
                    console.log('✅ Attempted to restore Google Auth state');
                } catch (e) {
                    console.error('❌ Failed to restore Google Auth state:', e);
                }
            }
            
            // Disable periodic checks for now to prevent loops
            // setInterval(() => {
            //     this.runIfNeeded();
            // }, 60000); // Check every minute
        }
    };

    // Initialize recovery system
    window.AuthRecovery = AuthRecovery;
    
    // Run when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AuthRecovery.init());
    } else {
        AuthRecovery.init();
    }
})();
