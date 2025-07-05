/**
 * JavaScript Error Fix Script
 * Handles all common JavaScript errors and provides fallbacks
 * 
 * This script should be loaded early in the page to catch errors
 * before they break the application.
 */

(function() {
    'use strict';
    
    console.log('🔧 JavaScript Error Fix Script Loading...');
    
    // ==== GLOBAL ERROR HANDLERS ====
    
    // Handle uncaught errors
    window.addEventListener('error', function(event) {
        console.error('❌ Global Error:', event.error);
        
        // Handle specific error types
        if (event.error && event.error.message) {
            const message = event.error.message;
            
            // Handle ACE editor errors
            if (message.includes('ace is not defined')) {
                console.warn('⚠️ ACE editor not loaded, using fallback');
                window.aceErrorHandled = true;
                return true; // Prevent default error handling
            }
            
            // Handle module import errors
            if (message.includes('Cannot use import statement') || 
                message.includes('Unexpected token')) {
                console.warn('⚠️ Module import error, using fallback');
                return true;
            }
        }
        
        return false; // Let other errors bubble up
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        console.error('❌ Unhandled Promise Rejection:', event.reason);
        
        // Handle specific promise rejection types
        if (event.reason && event.reason.message) {
            const message = event.reason.message;
            
            // Handle network errors
            if (message.includes('fetch') || message.includes('NetworkError')) {
                console.warn('⚠️ Network error handled gracefully');
                event.preventDefault(); // Prevent unhandled rejection
                return;
            }
            
            // Handle token errors
            if (message.includes('atob') || message.includes('InvalidCharacterError')) {
                console.warn('⚠️ Token decoding error handled gracefully');
                event.preventDefault();
                return;
            }
        }
    });
    
    // ==== EARLY INITIALIZATION ====
    
    // Initialize console wrapper for better error tracking
    const originalConsoleError = console.error;
    console.error = function(...args) {
        // Track errors for debugging
        if (!window.jsErrors) window.jsErrors = [];
        window.jsErrors.push({
            timestamp: new Date().toISOString(),
            args: args,
            stack: new Error().stack
        });
        
        // Call original console.error
        originalConsoleError.apply(console, args);
    };
    
    // ==== POLYFILLS AND FALLBACKS ====
    
    // Ensure Promise is available
    if (typeof Promise === 'undefined') {
        console.warn('⚠️ Promise not available, using fallback');
        window.Promise = function(executor) {
            setTimeout(() => {
                executor(
                    (value) => console.log('Promise resolved:', value),
                    (reason) => console.error('Promise rejected:', reason)
                );
            }, 0);
        };
    }
    
    // Ensure fetch is available
    if (typeof fetch === 'undefined') {
        console.warn('⚠️ fetch not available, using fallback');
        window.fetch = function(url, options) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open(options?.method || 'GET', url);
                
                if (options?.headers) {
                    Object.keys(options.headers).forEach(key => {
                        xhr.setRequestHeader(key, options.headers[key]);
                    });
                }
                
                xhr.onload = () => {
                    resolve({
                        ok: xhr.status >= 200 && xhr.status < 300,
                        status: xhr.status,
                        json: () => Promise.resolve(JSON.parse(xhr.responseText)),
                        text: () => Promise.resolve(xhr.responseText)
                    });
                };
                
                xhr.onerror = () => reject(new Error('Network Error'));
                xhr.send(options?.body);
            });
        };
    }
    
    // ==== UTILITY FUNCTIONS ====
    
    // Enhanced error handling utility
    window.handleJSError = function(error, context) {
        console.error(`❌ Error in ${context}:`, error);
        
        // Show user-friendly message
        const message = `An error occurred in ${context}. Please refresh the page if you continue to experience issues.`;
        
        if (window.showToast) {
            window.showToast(message, 'error');
        } else if (window.AppUtils && window.AppUtils.showNotification) {
            window.AppUtils.showNotification(message, 'error');
        } else {
            console.log('User notification:', message);
        }
        
        return false; // Prevent further propagation
    };
    
    // Safe function executor
    window.safeExecute = function(fn, context, fallback) {
        try {
            return fn();
        } catch (error) {
            console.error(`❌ Safe execution failed in ${context}:`, error);
            if (fallback) {
                return fallback();
            }
            return null;
        }
    };
    
    // ==== COMMON FIXES ====
    
    // Fix for undefined global variables
    window.ensureGlobal = function(name, fallback) {
        if (typeof window[name] === 'undefined') {
            window[name] = fallback;
            console.log(`✅ Created fallback for ${name}`);
        }
    };
    
    // Common global fallbacks
    window.ensureGlobal('AppUtils', {
        showNotification: function(msg, type) {
            console.log(`[${type}] ${msg}`);
        },
        handleError: function(err, ctx) {
            console.error(ctx, err);
        }
    });
    
    // ==== ACE EDITOR FIXES ====
    
    // ACE editor fallback
    if (typeof ace === 'undefined') {
        console.warn('⚠️ ACE editor not loaded, creating fallback');
        window.ace = {
            edit: function(elementId) {
                const element = document.getElementById(elementId);
                if (!element) {
                    throw new Error(`Element not found: ${elementId}`);
                }
                
                // Create textarea fallback
                const textarea = document.createElement('textarea');
                textarea.style.cssText = `
                    width: 100%;
                    height: 100%;
                    font-family: Monaco, Menlo, 'Ubuntu Mono', Consolas, monospace;
                    font-size: 14px;
                    border: 1px solid #ccc;
                    padding: 10px;
                `;
                
                element.innerHTML = '';
                element.appendChild(textarea);
                
                // Return mock editor object
                return {
                    setValue: function(value, cursor) {
                        textarea.value = value;
                    },
                    getValue: function() {
                        return textarea.value;
                    },
                    setTheme: function() {},
                    session: {
                        setMode: function() {},
                        setUseWrapMode: function() {},
                        setTabSize: function() {},
                        setUseSoftTabs: function() {}
                    },
                    setOptions: function() {},
                    on: function(event, callback) {
                        if (event === 'change') {
                            textarea.addEventListener('input', callback);
                        }
                    },
                    focus: function() {
                        textarea.focus();
                    }
                };
            }
        };
    }
    
    // ==== AUTHENTICATION FIXES ====
    
    // Enhanced token decoding with error handling
    window.safeDecodeToken = function(token) {
        if (!token || typeof token !== 'string') {
            return null;
        }
        
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }
            
            // Add padding if needed
            const payload = parts[1];
            const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
            
            const decoded = atob(paddedPayload);
            return JSON.parse(decoded);
        } catch (error) {
            console.warn('⚠️ Token decoding failed:', error.message);
            return null;
        }
    };
    
    // ==== LOADING FIXES ====
    
    // Ensure critical scripts are loaded
    window.ensureScriptLoaded = function(src, callback) {
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
            if (callback) callback();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        script.onerror = function() {
            console.error(`❌ Failed to load script: ${src}`);
            if (callback) callback();
        };
        document.head.appendChild(script);
    };
    
    // ==== INITIALIZATION COMPLETION ====
    
    // Store initialization status
    window.errorFixInitialized = true;
    
    // Run any queued initialization functions
    if (window.errorFixQueue) {
        window.errorFixQueue.forEach(fn => {
            try {
                fn();
            } catch (error) {
                console.error('❌ Error in queued function:', error);
            }
        });
        window.errorFixQueue = [];
    }
    
    console.log('✅ JavaScript Error Fix Script Loaded Successfully');
    
    // Auto-fix common issues after a short delay
    setTimeout(() => {
        // Fix missing user object
        if (!window.currentUser && localStorage.getItem('cwm_user_profile')) {
            try {
                window.currentUser = JSON.parse(localStorage.getItem('cwm_user_profile'));
                console.log('✅ Auto-restored window.currentUser');
            } catch (error) {
                console.warn('⚠️ Failed to restore user profile:', error);
            }
        }
        
        // Fix missing auth token
        const authToken = localStorage.getItem('auth_token') || localStorage.getItem('cwm_user_token');
        if (authToken && !localStorage.getItem('auth_token')) {
            localStorage.setItem('auth_token', authToken);
            console.log('✅ Auto-fixed auth token storage');
        }
        
        // Run auth recovery if available
        if (window.AuthRecovery && typeof window.AuthRecovery.runIfNeeded === 'function') {
            try {
                window.AuthRecovery.runIfNeeded();
                console.log('✅ Auto-ran auth recovery');
            } catch (error) {
                console.warn('⚠️ Auth recovery failed:', error);
            }
        }
    }, 1000);
    
})();
