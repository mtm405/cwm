/**
 * Google Authentication Module - Modern Implementation
 * Code with Morais - Google Identity Services Integration
 * 
 * Uses the latest Google Identity Services API with proper token persistence
 * Optimized for Flask backend integration
 */

(function() {
    'use strict';

    // ==========================================
    // GOOGLE AUTH NAMESPACE - MODERN
    // ==========================================
    
    window.GoogleAuth = {
        isInitialized: false,
        isProcessing: false,
        pendingResponse: null,
        config: {
            clientId: null,
            redirectUrl: '/dashboard',
            scopes: 'openid email profile',
            ux_mode: 'popup',
            auto_select: false
        },
        
        // Token storage keys
        storageKeys: {
            authToken: 'auth_token',
            userToken: 'cwm_user_token', 
            userProfile: 'cwm_user_profile',
            refreshToken: 'cwm_refresh_token'
        },

        /**
         * Initialize Google Identity Services
         */
        init: function() {
            if (this.isInitialized) {
                console.log('🔐 Google Auth already initialized');
                return;
            }
            
            console.log('🔐 Initializing Google Identity Services...');
            
            // Validate configuration
            if (!this.validateConfig()) {
                console.error('❌ Google Auth configuration invalid');
                return;
            }

            // Wait for Google API to be available
            this.waitForGoogleAPI().then(() => {
                this.initializeGoogleServices();
                this.restoreAuthenticationState();
            }).catch(error => {
                console.error('❌ Failed to initialize Google services:', error);
            });
        },

        /**
         * Validate configuration
         */
        validateConfig: function() {
            if (!window.CONFIG || !window.CONFIG.GOOGLE_CLIENT_ID) {
                console.error('❌ Google Client ID not found in CONFIG');
                return false;
            }
            
            this.config.clientId = window.CONFIG.GOOGLE_CLIENT_ID;
            console.log('✅ Google Client ID configured:', this.config.clientId.substring(0, 20) + '...');
            return true;
        },

        /**
         * Wait for Google API to be available
         */
        waitForGoogleAPI: function() {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 50; // 5 seconds max
                
                const checkGoogleAPI = () => {
                    if (typeof google !== 'undefined' && 
                        google.accounts && 
                        google.accounts.id) {
                        console.log('✅ Google Identity Services API available');
                        resolve();
                        return;
                    }
                    
                    attempts++;
                    if (attempts >= maxAttempts) {
                        reject(new Error('Google Identity Services API not available after 5 seconds'));
                        return;
                    }
                    
                    setTimeout(checkGoogleAPI, 100);
                };
                
                checkGoogleAPI();
            });
        },

        /**
         * Initialize Google Identity Services
         */
        initializeGoogleServices: function() {
            try {
                // Initialize Google Identity Services
                google.accounts.id.initialize({
                    client_id: this.config.clientId,
                    callback: this.handleCredentialResponse.bind(this),
                    auto_select: this.config.auto_select,
                    cancel_on_tap_outside: true,
                    ux_mode: this.config.ux_mode,
                    context: 'signin'
                });
                
                console.log('✅ Google Identity Services initialized');
                this.isInitialized = true;
                
                // Process any pending responses
                this.processPendingResponse();
                
            } catch (error) {
                console.error('❌ Error initializing Google Identity Services:', error);
                throw error;
            }
        },

        /**
         * Process pending Google response
         */
        processPendingResponse: function() {
            if (this.pendingResponse || window.pendingGoogleResponse) {
                console.log('🔄 Processing pending Google response...');
                const response = this.pendingResponse || window.pendingGoogleResponse;
                this.handleCredentialResponse(response);
                this.pendingResponse = null;
                window.pendingGoogleResponse = null;
            }
        },

        /**
         * Handle Google credential response - MODERN
         */
        handleCredentialResponse: function(response) {
            console.log('🔐 Google Sign-In credential response received');
            
            // Prevent duplicate processing
            if (this.isProcessing) {
                console.warn('⏳ Authentication already in progress, ignoring duplicate');
                return;
            }

            // Validate response
            if (!this.validateCredentialResponse(response)) {
                return;
            }

            this.isProcessing = true;
            this.setLoadingState(true);
            
            // Extract and process the credential
            const credential = response.credential;
            console.log('📋 Processing JWT credential (length:', credential.length, ')');
            
            // Send credential to Flask backend
            this.sendCredentialToBackend(credential)
                .then(data => this.handleAuthenticationSuccess(data))
                .catch(error => this.handleAuthenticationError(error))
                .finally(() => {
                    this.isProcessing = false;
                    this.setLoadingState(false);
                });
        },

        /**
         * Validate credential response
         */
        validateCredentialResponse: function(response) {
            if (!response) {
                console.error('❌ Empty credential response');
                this.showMessage('Authentication failed: No response received', 'error');
                return false;
            }
            
            if (!response.credential) {
                console.error('❌ No credential in response');
                this.showMessage('Authentication failed: Invalid response format', 'error');
                return false;
            }
            
            // Validate JWT format (should have 3 parts)
            const parts = response.credential.split('.');
            if (parts.length !== 3) {
                console.error('❌ Invalid JWT format');
                this.showMessage('Authentication failed: Invalid credential format', 'error');
                return false;
            }
            
            return true;
        },

        /**
         * Send credential to Flask backend
         */
        sendCredentialToBackend: function(credential) {
            return fetch('/auth/google/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ 
                    token: credential,
                    client_id: this.config.clientId
                })
            }).then(response => {
                console.log('🌐 Backend response status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`Backend authentication failed: ${response.status} ${response.statusText}`);
                }
                
                return response.json();
            }).catch(error => {
                console.error('❌ Backend communication error:', error);
                throw new Error(`Network error: ${error.message}`);
            });
        },

        /**
         * Handle successful authentication
         */
        handleAuthenticationSuccess: function(data) {
            console.log('✅ Authentication successful:', data);
            
            if (!data.success) {
                throw new Error(data.error || 'Authentication failed');
            }
            
            // Store authentication data
            this.storeAuthenticationData(data);
            
            // Set user session
            this.setUserSession(data.user);
            
            // Show success message
            this.showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard
            this.redirectToDashboard(data.redirect_url);
        },

        /**
         * Store authentication data in localStorage
         */
        storeAuthenticationData: function(data) {
            try {
                // Store primary auth token
                if (data.token) {
                    localStorage.setItem(this.storageKeys.authToken, data.token);
                    console.log('💾 Auth token stored');
                }
                
                // Store user token if different
                if (data.user_token && data.user_token !== data.token) {
                    localStorage.setItem(this.storageKeys.userToken, data.user_token);
                    console.log('💾 User token stored');
                }
                
                // Store refresh token if provided
                if (data.refresh_token) {
                    localStorage.setItem(this.storageKeys.refreshToken, data.refresh_token);
                    console.log('💾 Refresh token stored');
                }
                
                // Store user profile
                if (data.user) {
                    localStorage.setItem(this.storageKeys.userProfile, JSON.stringify(data.user));
                    console.log('� User profile stored');
                }
                
            } catch (error) {
                console.error('❌ Error storing authentication data:', error);
                // Continue execution even if storage fails
            }
        },

        /**
         * Set user session in memory
         */
        setUserSession: function(user) {
            if (user) {
                window.currentUser = user;
                console.log('� User session set:', {
                    uid: user.uid,
                    email: user.email,
                    name: user.display_name || user.username
                });
                
                // Emit user login event for other components
                if (window.eventBus && typeof window.eventBus.emit === 'function') {
                    window.eventBus.emit('auth:login', user);
                }
            }
        },

        /**
         * Handle authentication errors
         */
        handleAuthenticationError: function(error) {
            console.error('❌ Authentication error:', error);
            
            let errorMessage = 'Authentication failed. Please try again.';
            
            if (error.message) {
                if (error.message.includes('Network error')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else if (error.message.includes('Invalid')) {
                    errorMessage = 'Invalid credentials. Please try signing in again.';
                } else {
                    errorMessage = error.message;
                }
            }
            
            this.showMessage(errorMessage, 'error');
            
            // Clear any partial authentication state
            this.clearPartialAuthState();
        },

        /**
         * Redirect to dashboard
         */
        redirectToDashboard: function(redirectUrl) {
            const targetUrl = redirectUrl || this.config.redirectUrl;
            console.log('🔄 Redirecting to:', targetUrl);
            
            // Delay redirect slightly to show success message
            setTimeout(() => {
                console.log('🚀 Performing redirect...');
                window.location.href = targetUrl;
            }, 1000);
        },

        /**
         * Set loading state on authentication UI
         */
        setLoadingState: function(isLoading) {
            // Update Google sign-in buttons
            const googleButtons = document.querySelectorAll('.g_id_signin, [data-google-signin], .google-signin-btn');
            googleButtons.forEach(btn => {
                if (btn) {
                    btn.style.opacity = isLoading ? '0.6' : '1';
                    btn.style.pointerEvents = isLoading ? 'none' : 'auto';
                    
                    // Add loading class if available
                    if (isLoading) {
                        btn.classList.add('loading');
                    } else {
                        btn.classList.remove('loading');
                    }
                }
            });
            
            // Update login forms
            const loginForms = document.querySelectorAll('.login-form, .auth-form');
            loginForms.forEach(form => {
                if (form) {
                    const submitButtons = form.querySelectorAll('button[type="submit"], .submit-btn');
                    submitButtons.forEach(btn => {
                        btn.disabled = isLoading;
                    });
                }
            });
        },

        /**
         * Show message to user with fallbacks
         */
        showMessage: function(message, type = 'info') {
            console.log(`📢 ${type.toUpperCase()}: ${message}`);
            
            // Try toast notification first
            if (typeof showToast === 'function') {
                showToast(message, type);
                return;
            }
            
            // Try notification manager
            if (window.notificationManager && typeof window.notificationManager.show === 'function') {
                window.notificationManager.show(message, type);
                return;
            }
            
            // Try custom notification system
            if (window.showNotification && typeof window.showNotification === 'function') {
                window.showNotification(message, type);
                return;
            }
            
            // Fallback to alert for errors, console for others
            if (type === 'error') {
                alert(`Error: ${message}`);
            } else if (type === 'success') {
                // For success, try to show in a subtle way
                console.log(`✅ ${message}`);
            }
        },

        /**
         * Clear partial authentication state
         */
        clearPartialAuthState: function() {
            try {
                // Don't clear everything, just problematic partial state
                const authToken = localStorage.getItem(this.storageKeys.authToken);
                const userProfile = localStorage.getItem(this.storageKeys.userProfile);
                
                // If we have token but no user, or user but no token, clear both
                if ((authToken && !userProfile) || (!authToken && userProfile)) {
                    localStorage.removeItem(this.storageKeys.authToken);
                    localStorage.removeItem(this.storageKeys.userToken);
                    localStorage.removeItem(this.storageKeys.userProfile);
                    console.log('🧹 Cleared partial authentication state');
                }
                
                // Clear in-memory user
                if (window.currentUser) {
                    delete window.currentUser;
                }
                
            } catch (error) {
                console.error('❌ Error clearing partial auth state:', error);
            }
        },

        /**
         * Restore authentication state from storage
         */
        restoreAuthenticationState: function() {
            console.log('🔄 Restoring authentication state...');
            
            try {
                const authToken = localStorage.getItem(this.storageKeys.authToken);
                const userProfile = localStorage.getItem(this.storageKeys.userProfile);
                
                if (authToken && userProfile) {
                    // Validate token before restoring
                    if (this.validateStoredToken(authToken)) {
                        const user = JSON.parse(userProfile);
                        window.currentUser = user;
                        console.log('✅ Authentication state restored:', {
                            uid: user.uid,
                            email: user.email
                        });
                        
                        // Emit restored auth event
                        if (window.eventBus && typeof window.eventBus.emit === 'function') {
                            window.eventBus.emit('auth:restored', user);
                        }
                        
                        return true;
                    } else {
                        console.warn('⚠️ Stored token is invalid, clearing...');
                        this.clearStoredAuthentication();
                    }
                } else if (authToken || userProfile) {
                    console.warn('⚠️ Partial authentication data found, clearing...');
                    this.clearPartialAuthState();
                }
                
            } catch (error) {
                console.error('❌ Error restoring authentication state:', error);
                this.clearStoredAuthentication();
            }
            
            return false;
        },

        /**
         * Validate stored token
         */
        validateStoredToken: function(token) {
            if (!token || typeof token !== 'string') {
                return false;
            }
            
            try {
                // Basic JWT format validation
                const parts = token.split('.');
                if (parts.length !== 3) {
                    console.warn('⚠️ Invalid JWT format in stored token');
                    return false;
                }
                
                // Decode and check expiration
                const payload = this.safeDecodeJWTPayload(parts[1]);
                if (!payload) {
                    console.warn('⚠️ Cannot decode stored token payload');
                    return false;
                }
                
                // Check expiration
                if (payload.exp) {
                    const now = Math.floor(Date.now() / 1000);
                    if (payload.exp <= now) {
                        console.warn('⚠️ Stored token is expired');
                        return false;
                    }
                }
                
                console.log('✅ Stored token is valid');
                return true;
                
            } catch (error) {
                console.error('❌ Error validating stored token:', error);
                return false;
            }
        },

        /**
         * Safe JWT payload decoder
         */
        safeDecodeJWTPayload: function(encodedPayload) {
            try {
                // Add padding if needed
                let padded = encodedPayload;
                while (padded.length % 4) {
                    padded += '=';
                }
                
                // Replace URL-safe characters
                padded = padded.replace(/-/g, '+').replace(/_/g, '/');
                
                // Decode base64
                const decoded = atob(padded);
                return JSON.parse(decoded);
                
            } catch (error) {
                console.warn('⚠️ JWT payload decode failed:', error.message);
                return null;
            }
        },

        /**
         * Sign out user - Complete logout process
         */
        signOut: function() {
            console.log('🔓 Starting comprehensive sign out...');
            
            if (this.isProcessing) {
                console.warn('⚠️ Sign out already in progress');
                return Promise.resolve();
            }
            
            this.isProcessing = true;
            this.showMessage('Signing out...', 'info');
            
            return this.performSignOut()
                .then(() => {
                    console.log('✅ Sign out completed successfully');
                    this.showMessage('Signed out successfully!', 'success');
                    this.redirectToHome();
                })
                .catch(error => {
                    console.error('❌ Sign out error:', error);
                    this.showMessage('Sign out completed with issues', 'warning');
                    // Still redirect even if there were errors
                    this.redirectToHome();
                })
                .finally(() => {
                    this.isProcessing = false;
                });
        },

        /**
         * Perform complete sign out
         */
        performSignOut: function() {
            const signOutPromises = [];
            
            // 1. Clear backend session
            signOutPromises.push(this.clearBackendSession());
            
            // 2. Sign out from Google
            signOutPromises.push(this.signOutFromGoogle());
            
            // 3. Clear local authentication data
            signOutPromises.push(Promise.resolve(this.clearStoredAuthentication()));
            
            return Promise.allSettled(signOutPromises).then(results => {
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        console.warn(`Sign out step ${index + 1} failed:`, result.reason);
                    }
                });
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
                console.log('🗑️ Backend logout response:', response.status);
                return response.json().catch(() => ({ success: false }));
            })
            .then(data => {
                if (data.success) {
                    console.log('✅ Backend session cleared');
                } else {
                    console.warn('⚠️ Backend logout may have failed');
                }
                return data;
            })
            .catch(error => {
                console.error('❌ Backend logout error:', error);
                // Don't throw - continue with other logout steps
                return { success: false, error: error.message };
            });
        },

        /**
         * Sign out from Google Identity Services
         */
        signOutFromGoogle: function() {
            return new Promise((resolve) => {
                try {
                    if (typeof google !== 'undefined' && 
                        google.accounts && 
                        google.accounts.id) {
                        
                        // Disable auto-select for future logins
                        google.accounts.id.disableAutoSelect();
                        console.log('✅ Google auto-select disabled');
                        
                        // Revoke Google session if possible
                        if (google.accounts.id.revoke) {
                            const userEmail = window.currentUser?.email;
                            if (userEmail) {
                                google.accounts.id.revoke(userEmail, () => {
                                    console.log('✅ Google session revoked');
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        } else {
                            resolve();
                        }
                    } else {
                        console.log('ℹ️ Google Identity Services not available for logout');
                        resolve();
                    }
                } catch (error) {
                    console.warn('⚠️ Google logout error (non-critical):', error);
                    resolve(); // Continue even if Google logout fails
                }
            });
        },

        /**
         * Clear all stored authentication data
         */
        clearStoredAuthentication: function() {
            try {
                // Clear localStorage
                Object.values(this.storageKeys).forEach(key => {
                    localStorage.removeItem(key);
                });
                
                // Clear legacy keys for compatibility
                const legacyKeys = ['user_data', 'google_auth_state', 'authToken'];
                legacyKeys.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                // Clear sessionStorage
                Object.values(this.storageKeys).forEach(key => {
                    sessionStorage.removeItem(key);
                });
                
                console.log('🗑️ All authentication data cleared');
                
                // Clear in-memory user
                if (window.currentUser) {
                    delete window.currentUser;
                }
                
                // Emit logout event
                if (window.eventBus && typeof window.eventBus.emit === 'function') {
                    window.eventBus.emit('auth:logout');
                }
                
                return true;
                
            } catch (error) {
                console.error('❌ Error clearing authentication data:', error);
                return false;
            }
        },

        /**
         * Redirect to home page
         */
        redirectToHome: function() {
            setTimeout(() => {
                console.log('🏠 Redirecting to home page...');
                window.location.href = '/';
            }, 1500);
        },

        /**
         * Reset processing state
         */
        reset: function() {
            this.isProcessing = false;
            this.pendingResponse = null;
            this.setLoadingState(false);
        },

        /**
         * Restore authentication state from localStorage
         */
        restoreAuthState: function() {
            console.log('🔄 Restoring authentication state...');
            
            // Check for stored tokens
            const authToken = localStorage.getItem('auth_token');
            const userToken = localStorage.getItem('cwm_user_token');
            const userProfile = localStorage.getItem('cwm_user_profile');
            
            if (authToken) {
                console.log('💾 Found stored auth token');
                
                // Validate token with server
                this.validateTokenWithServer(authToken)
                    .then(isValid => {
                        if (isValid) {
                            console.log('✅ Auth token is valid');
                            
                            // Restore user profile if available
                            if (userProfile) {
                                try {
                                    window.currentUser = JSON.parse(userProfile);
                                    console.log('👤 User profile restored:', window.currentUser);
                                } catch (e) {
                                    console.error('❌ Failed to parse user profile:', e);
                                }
                            }
                            
                            return true;
                        } else {
                            console.warn('⚠️ Auth token is invalid, removing...');
                            localStorage.removeItem('auth_token');
                            localStorage.removeItem('cwm_user_token');
                            localStorage.removeItem('cwm_user_profile');
                            window.currentUser = null;
                            return false;
                        }
                    })
                    .catch(error => {
                        console.error('❌ Error validating token:', error);
                        // Keep token but try to extract user from it
                        this.extractUserFromStoredToken(authToken);
                        return false;
                    });
            }
            
            // Check for user token if no auth token
            if (!authToken && userToken) {
                console.log('💾 Found stored user token');
                
                if (userProfile) {
                    try {
                        window.currentUser = JSON.parse(userProfile);
                        console.log('👤 User profile restored from user token:', window.currentUser);
                        return true;
                    } catch (e) {
                        console.error('❌ Failed to parse user profile:', e);
                    }
                }
            }
            
            console.log('❌ No valid authentication state found');
            return false;
        },

        /**
         * Validate token with server
         */
        validateTokenWithServer: function(token) {
            return fetch('/auth/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'same-origin'
            })
            .then(response => {
                if (response.ok) {
                    return response.json().then(data => {
                        if (data.success && data.user) {
                            // Update user data from server response
                            window.currentUser = data.user;
                            localStorage.setItem('cwm_user_profile', JSON.stringify(data.user));
                            return true;
                        }
                        return false;
                    });
                }
                return false;
            })
            .catch(error => {
                console.warn('⚠️ Token validation failed:', error);
                return false;
            });
        },

        /**
         * Extract user from stored token as fallback
         */
        extractUserFromStoredToken: function(token) {
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payloadStr = this.safeBase64Decode(parts[1]);
                    if (payloadStr) {
                        const payload = JSON.parse(payloadStr);
                        const now = Math.floor(Date.now() / 1000);
                        
                        // Check if token is not expired
                        if (payload.exp && payload.exp > now) {
                            const userInfo = {
                                uid: payload.sub,
                                email: payload.email,
                                name: payload.name,
                                picture: payload.picture,
                                is_admin: payload.is_admin || false,
                                xp: payload.xp || 0,
                                level: payload.level || 1
                            };
                            
                            window.currentUser = userInfo;
                            localStorage.setItem('cwm_user_profile', JSON.stringify(userInfo));
                            console.log('✅ User extracted from stored token:', userInfo);
                            return true;
                        } else {
                            console.warn('⚠️ Stored token is expired, removing...');
                            localStorage.removeItem('auth_token');
                            localStorage.removeItem('cwm_user_token');
                            localStorage.removeItem('cwm_user_profile');
                            window.currentUser = null;
                        }
                    }
                }
            } catch (e) {
                console.error('❌ Failed to extract user from stored token:', e);
            }
            return false;
        },

        /**
         * Safe base64 decode with proper padding
         */
        safeBase64Decode: function(str) {
            if (!str || typeof str !== 'string') return null;

            try {
                // Add padding if missing
                let paddedStr = str;
                while (paddedStr.length % 4) {
                    paddedStr += '=';
                }

                // Replace URL-safe characters
                paddedStr = paddedStr.replace(/-/g, '+').replace(/_/g, '/');

                // Decode
                return atob(paddedStr);
            } catch (error) {
                console.warn('⚠️ Base64 decode failed:', error.message);
                return null;
            }
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
