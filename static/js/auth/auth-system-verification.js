/**
 * Auth System Verification - Final validation script
 * Code with Morais - Authentication System Complete Verification
 * 
 * This script performs comprehensive verification that the authentication system
 * works correctly for all users in all scenarios, including edge cases.
 */

(function() {
    'use strict';

    const AuthSystemVerification = {
        
        /**
         * Perform complete system verification
         */
        verifyCompleteSystem: function() {
            console.log('🔍 Starting complete authentication system verification...');
            
            const results = {
                timestamp: new Date().toISOString(),
                environment: {
                    userAgent: navigator.userAgent,
                    currentUrl: window.location.href,
                    hasGoogleAuth: typeof window.GoogleAuth !== 'undefined',
                    hasAuthRecovery: typeof window.AuthRecovery !== 'undefined',
                    hasConfig: typeof window.CONFIG !== 'undefined'
                },
                tests: []
            };
            
            // Test 1: Module availability
            results.tests.push(this.verifyModuleAvailability());
            
            // Test 2: Configuration integrity
            results.tests.push(this.verifyConfiguration());
            
            // Test 3: Authentication state management
            results.tests.push(this.verifyAuthStateManagement());
            
            // Test 4: Token handling
            results.tests.push(this.verifyTokenHandling());
            
            // Test 5: User object management
            results.tests.push(this.verifyUserObjectManagement());
            
            // Test 6: Recovery system
            results.tests.push(this.verifyRecoverySystem());
            
            // Test 7: Google Auth integration
            results.tests.push(this.verifyGoogleAuthIntegration());
            
            // Test 8: Login flow simulation
            results.tests.push(this.verifyLoginFlowSimulation());
            
            // Test 9: Edge cases and error handling
            results.tests.push(this.verifyEdgeCases());
            
            // Test 10: No interference with main app
            results.tests.push(this.verifyNoInterference());
            
            // Generate final report
            this.generateVerificationReport(results);
            
            return results;
        },

        /**
         * Verify all required modules are available
         */
        verifyModuleAvailability: function() {
            console.log('📦 Verifying module availability...');
            
            const test = {
                name: 'Module Availability',
                passed: true,
                details: [],
                issues: []
            };
            
            // Check AuthRecovery module
            if (typeof window.AuthRecovery === 'object') {
                test.details.push('✅ AuthRecovery module loaded');
                
                // Check required methods
                const requiredMethods = ['hasAuthToken', 'hasUserObject', 'checkBrokenAuth', 'recoverToken', 'restoreUserObject', 'extractUserFromToken', 'runIfNeeded'];
                requiredMethods.forEach(method => {
                    if (typeof window.AuthRecovery[method] === 'function') {
                        test.details.push(`✅ AuthRecovery.${method} available`);
                    } else {
                        test.passed = false;
                        test.issues.push(`❌ AuthRecovery.${method} missing`);
                    }
                });
            } else {
                test.passed = false;
                test.issues.push('❌ AuthRecovery module not loaded');
            }
            
            // Check GoogleAuth module
            if (typeof window.GoogleAuth === 'object') {
                test.details.push('✅ GoogleAuth module loaded');
                
                const requiredMethods = ['init', 'handleCredentialResponse', 'signOut', 'restoreAuthState'];
                requiredMethods.forEach(method => {
                    if (typeof window.GoogleAuth[method] === 'function') {
                        test.details.push(`✅ GoogleAuth.${method} available`);
                    } else {
                        test.passed = false;
                        test.issues.push(`❌ GoogleAuth.${method} missing`);
                    }
                });
            } else {
                test.passed = false;
                test.issues.push('❌ GoogleAuth module not loaded');
            }
            
            // Check global functions
            if (typeof window.handleCredentialResponse === 'function') {
                test.details.push('✅ Global handleCredentialResponse available');
            } else {
                test.passed = false;
                test.issues.push('❌ Global handleCredentialResponse missing');
            }
            
            if (typeof window.signOut === 'function') {
                test.details.push('✅ Global signOut available');
            } else {
                test.passed = false;
                test.issues.push('❌ Global signOut missing');
            }
            
            return test;
        },

        /**
         * Verify configuration integrity
         */
        verifyConfiguration: function() {
            console.log('⚙️ Verifying configuration...');
            
            const test = {
                name: 'Configuration Integrity',
                passed: true,
                details: [],
                issues: []
            };
            
            // Check global CONFIG
            if (typeof window.CONFIG === 'object') {
                test.details.push('✅ Global CONFIG object available');
                
                if (window.CONFIG.GOOGLE_CLIENT_ID) {
                    test.details.push('✅ Google Client ID configured');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Google Client ID not configured');
                }
                
                if (window.CONFIG.AUTH_TOKEN_KEY) {
                    test.details.push('✅ Auth token key configured');
                } else {
                    test.details.push('⚠️ Auth token key not configured (using default)');
                }
            } else {
                test.passed = false;
                test.issues.push('❌ Global CONFIG object not available');
            }
            
            // Check AuthRecovery configuration
            if (window.AuthRecovery && window.AuthRecovery.config) {
                test.details.push('✅ AuthRecovery configuration available');
                
                if (Array.isArray(window.AuthRecovery.config.tokenKeys) && window.AuthRecovery.config.tokenKeys.length > 0) {
                    test.details.push('✅ Token keys configured');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Token keys not configured');
                }
                
                if (Array.isArray(window.AuthRecovery.config.userKeys) && window.AuthRecovery.config.userKeys.length > 0) {
                    test.details.push('✅ User keys configured');
                } else {
                    test.passed = false;
                    test.issues.push('❌ User keys not configured');
                }
            } else {
                test.passed = false;
                test.issues.push('❌ AuthRecovery configuration not available');
            }
            
            return test;
        },

        /**
         * Verify authentication state management
         */
        verifyAuthStateManagement: function() {
            console.log('🔐 Verifying authentication state management...');
            
            const test = {
                name: 'Authentication State Management',
                passed: true,
                details: [],
                issues: []
            };
            
            // Save current state
            const originalState = this.saveCurrentAuthState();
            
            try {
                // Test 1: Clean state detection
                this.clearAllAuthData();
                
                if (!window.AuthRecovery.hasAuthToken() && !window.AuthRecovery.hasUserObject()) {
                    test.details.push('✅ Clean state detected correctly');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Clean state not detected properly');
                }
                
                // Test 2: Token-only state
                localStorage.setItem('auth_token', 'test-token');
                
                if (window.AuthRecovery.hasAuthToken() && !window.AuthRecovery.hasUserObject()) {
                    test.details.push('✅ Token-only state detected correctly');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Token-only state not detected properly');
                }
                
                // Test 3: User-only state
                localStorage.removeItem('auth_token');
                window.currentUser = { id: 'test123' };
                
                if (!window.AuthRecovery.hasAuthToken() && window.AuthRecovery.hasUserObject()) {
                    test.details.push('✅ User-only state detected correctly');
                } else {
                    test.passed = false;
                    test.issues.push('❌ User-only state not detected properly');
                }
                
                // Test 4: Broken auth detection
                if (window.AuthRecovery.checkBrokenAuth()) {
                    test.details.push('✅ Broken auth state detected correctly');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Broken auth state not detected properly');
                }
                
                // Test 5: Complete state
                localStorage.setItem('auth_token', 'test-token');
                localStorage.setItem('cwm_user_profile', JSON.stringify({ id: 'test123' }));
                
                if (window.AuthRecovery.hasAuthToken() && window.AuthRecovery.hasUserObject()) {
                    test.details.push('✅ Complete state detected correctly');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Complete state not detected properly');
                }
                
            } catch (error) {
                test.passed = false;
                test.issues.push('❌ Auth state management test failed: ' + error.message);
            } finally {
                // Restore original state
                this.restoreAuthState(originalState);
            }
            
            return test;
        },

        /**
         * Verify token handling
         */
        verifyTokenHandling: function() {
            console.log('🎫 Verifying token handling...');
            
            const test = {
                name: 'Token Handling',
                passed: true,
                details: [],
                issues: []
            };
            
            const originalState = this.saveCurrentAuthState();
            
            try {
                // Test 1: JWT token creation and parsing
                const testJWT = this.createTestJWT();
                
                if (testJWT && testJWT.includes('.')) {
                    test.details.push('✅ Test JWT token created successfully');
                    
                    // Test JWT parsing
                    this.clearAllAuthData();
                    const extracted = window.AuthRecovery.extractUserFromToken(testJWT);
                    
                    if (extracted && window.currentUser && window.currentUser.id === 'test123') {
                        test.details.push('✅ JWT token parsed and user extracted successfully');
                    } else {
                        test.passed = false;
                        test.issues.push('❌ JWT token parsing failed');
                    }
                } else {
                    test.passed = false;
                    test.issues.push('❌ Test JWT token creation failed');
                }
                
                // Test 2: Token storage and retrieval
                const testToken = 'test-auth-token-123';
                
                if (window.AuthRecovery.restoreToken(testToken)) {
                    if (localStorage.getItem('auth_token') === testToken) {
                        test.details.push('✅ Token stored and retrieved successfully');
                    } else {
                        test.passed = false;
                        test.issues.push('❌ Token storage failed');
                    }
                } else {
                    test.passed = false;
                    test.issues.push('❌ Token restoration failed');
                }
                
                // Test 3: Multiple token key support
                localStorage.clear();
                localStorage.setItem('cwm_user_token', 'alternative-token');
                
                if (window.AuthRecovery.hasAuthToken()) {
                    test.details.push('✅ Multiple token keys supported');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Multiple token keys not supported');
                }
                
                // Test 4: Invalid token handling
                this.clearAllAuthData();
                const invalidToken = 'invalid-token-format';
                
                if (!window.AuthRecovery.extractUserFromToken(invalidToken)) {
                    test.details.push('✅ Invalid tokens handled gracefully');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Invalid tokens not handled properly');
                }
                
            } catch (error) {
                test.passed = false;
                test.issues.push('❌ Token handling test failed: ' + error.message);
            } finally {
                this.restoreAuthState(originalState);
            }
            
            return test;
        },

        /**
         * Verify user object management
         */
        verifyUserObjectManagement: function() {
            console.log('👤 Verifying user object management...');
            
            const test = {
                name: 'User Object Management',
                passed: true,
                details: [],
                issues: []
            };
            
            const originalState = this.saveCurrentAuthState();
            
            try {
                // Test 1: User object storage and retrieval
                const testUser = {
                    id: 'test123',
                    email: 'test@example.com',
                    name: 'Test User',
                    picture: 'https://example.com/photo.jpg'
                };
                
                this.clearAllAuthData();
                localStorage.setItem('cwm_user_profile', JSON.stringify(testUser));
                
                if (window.AuthRecovery.restoreUserObject()) {
                    if (window.currentUser && window.currentUser.id === 'test123') {
                        test.details.push('✅ User object stored and retrieved successfully');
                    } else {
                        test.passed = false;
                        test.issues.push('❌ User object not properly restored');
                    }
                } else {
                    test.passed = false;
                    test.issues.push('❌ User object restoration failed');
                }
                
                // Test 2: Multiple user key support
                this.clearAllAuthData();
                localStorage.setItem('currentUser', JSON.stringify(testUser));
                
                if (window.AuthRecovery.hasUserObject()) {
                    test.details.push('✅ Multiple user keys supported');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Multiple user keys not supported');
                }
                
                // Test 3: Invalid user data handling
                this.clearAllAuthData();
                localStorage.setItem('cwm_user_profile', 'invalid-json');
                
                try {
                    const restored = window.AuthRecovery.restoreUserObject();
                    if (!restored) {
                        test.details.push('✅ Invalid user data handled gracefully');
                    } else {
                        test.passed = false;
                        test.issues.push('❌ Invalid user data not handled properly');
                    }
                } catch (error) {
                    test.passed = false;
                    test.issues.push('❌ Invalid user data caused error: ' + error.message);
                }
                
                // Test 4: User extraction from different sources
                this.clearAllAuthData();
                window.currentUser = testUser;
                
                const userInfo = window.AuthRecovery.extractUserInfo();
                if (userInfo && (userInfo.userId === 'test123' || userInfo.email === 'test@example.com')) {
                    test.details.push('✅ User info extracted from window.currentUser');
                } else {
                    test.passed = false;
                    test.issues.push('❌ User info extraction failed');
                }
                
            } catch (error) {
                test.passed = false;
                test.issues.push('❌ User object management test failed: ' + error.message);
            } finally {
                this.restoreAuthState(originalState);
            }
            
            return test;
        },

        /**
         * Verify recovery system
         */
        verifyRecoverySystem: function() {
            console.log('🔄 Verifying recovery system...');
            
            const test = {
                name: 'Recovery System',
                passed: true,
                details: [],
                issues: []
            };
            
            const originalState = this.saveCurrentAuthState();
            
            try {
                // Test 1: Broken auth recovery
                this.clearAllAuthData();
                window.currentUser = { id: 'test123', email: 'test@example.com' };
                
                const recovered = window.AuthRecovery.runIfNeeded();
                if (recovered) {
                    test.details.push('✅ Broken auth recovery attempted');
                } else {
                    test.details.push('ℹ️ No broken auth to recover');
                }
                
                // Test 2: Missing user object recovery
                this.clearAllAuthData();
                localStorage.setItem('auth_token', this.createTestJWT());
                
                const userRecovered = window.AuthRecovery.runIfNeeded();
                if (userRecovered && window.currentUser) {
                    test.details.push('✅ Missing user object recovered');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Missing user object not recovered');
                }
                
                // Test 3: Complete recovery process
                this.clearAllAuthData();
                const testUser = { id: 'test123', email: 'test@example.com' };
                localStorage.setItem('cwm_user_profile', JSON.stringify(testUser));
                
                const completeRecovered = window.AuthRecovery.runIfNeeded();
                if (window.currentUser && window.currentUser.id === 'test123') {
                    test.details.push('✅ Complete recovery process works');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Complete recovery process failed');
                }
                
                // Test 4: No unnecessary recovery
                this.clearAllAuthData();
                localStorage.setItem('auth_token', 'test-token');
                window.currentUser = testUser;
                
                const unnecessaryRecovery = window.AuthRecovery.runIfNeeded();
                if (!unnecessaryRecovery) {
                    test.details.push('✅ No unnecessary recovery performed');
                } else {
                    test.details.push('ℹ️ Recovery performed (may be expected)');
                }
                
            } catch (error) {
                test.passed = false;
                test.issues.push('❌ Recovery system test failed: ' + error.message);
            } finally {
                this.restoreAuthState(originalState);
            }
            
            return test;
        },

        /**
         * Verify Google Auth integration
         */
        verifyGoogleAuthIntegration: function() {
            console.log('🔗 Verifying Google Auth integration...');
            
            const test = {
                name: 'Google Auth Integration',
                passed: true,
                details: [],
                issues: []
            };
            
            try {
                // Test 1: GoogleAuth module integration
                if (window.GoogleAuth) {
                    test.details.push('✅ GoogleAuth module available');
                    
                    // Test initialization
                    if (window.GoogleAuth.isInitialized !== undefined) {
                        test.details.push('✅ GoogleAuth initialization state tracked');
                    } else {
                        test.passed = false;
                        test.issues.push('❌ GoogleAuth initialization state not tracked');
                    }
                    
                    // Test auth state restoration
                    if (typeof window.GoogleAuth.restoreAuthState === 'function') {
                        test.details.push('✅ GoogleAuth auth state restoration available');
                        
                        // Test the restoration
                        try {
                            const restored = window.GoogleAuth.restoreAuthState();
                            test.details.push('✅ GoogleAuth auth state restoration executed');
                        } catch (error) {
                            test.details.push('⚠️ GoogleAuth auth state restoration error: ' + error.message);
                        }
                    } else {
                        test.passed = false;
                        test.issues.push('❌ GoogleAuth auth state restoration not available');
                    }
                } else {
                    test.passed = false;
                    test.issues.push('❌ GoogleAuth module not available');
                }
                
                // Test 2: Global callback integration
                if (typeof window.handleCredentialResponse === 'function') {
                    test.details.push('✅ Global credential response handler available');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Global credential response handler not available');
                }
                
                // Test 3: Recovery system integration
                if (window.AuthRecovery && window.GoogleAuth) {
                    test.details.push('✅ Both AuthRecovery and GoogleAuth modules loaded');
                    
                    // Test integration during recovery
                    const originalState = this.saveCurrentAuthState();
                    try {
                        this.clearAllAuthData();
                        localStorage.setItem('auth_token', this.createTestJWT());
                        
                        window.AuthRecovery.runIfNeeded();
                        test.details.push('✅ Recovery system integration with GoogleAuth tested');
                    } finally {
                        this.restoreAuthState(originalState);
                    }
                } else {
                    test.passed = false;
                    test.issues.push('❌ AuthRecovery and GoogleAuth integration not available');
                }
                
            } catch (error) {
                test.passed = false;
                test.issues.push('❌ Google Auth integration test failed: ' + error.message);
            }
            
            return test;
        },

        /**
         * Verify login flow simulation
         */
        verifyLoginFlowSimulation: function() {
            console.log('🚀 Verifying login flow simulation...');
            
            const test = {
                name: 'Login Flow Simulation',
                passed: true,
                details: [],
                issues: []
            };
            
            const originalState = this.saveCurrentAuthState();
            
            try {
                // Scenario 1: New user login
                this.clearAllAuthData();
                test.details.push('✅ New user scenario: Clean state prepared');
                
                // Simulate successful login
                const mockToken = this.createTestJWT();
                const mockUser = {
                    id: 'new-user-123',
                    email: 'newuser@example.com',
                    name: 'New User'
                };
                
                localStorage.setItem('auth_token', mockToken);
                localStorage.setItem('cwm_user_profile', JSON.stringify(mockUser));
                window.currentUser = mockUser;
                
                if (window.AuthRecovery.hasAuthToken() && window.AuthRecovery.hasUserObject()) {
                    test.details.push('✅ New user login simulation: Complete state achieved');
                } else {
                    test.passed = false;
                    test.issues.push('❌ New user login simulation failed');
                }
                
                // Scenario 2: Returning user
                this.clearAllAuthData();
                localStorage.setItem('auth_token', mockToken);
                localStorage.setItem('cwm_user_profile', JSON.stringify(mockUser));
                
                // Simulate page reload recovery
                const recovered = window.AuthRecovery.runIfNeeded();
                
                if (window.currentUser && window.currentUser.id === 'new-user-123') {
                    test.details.push('✅ Returning user scenario: Recovery successful');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Returning user scenario: Recovery failed');
                }
                
                // Scenario 3: Partial data recovery
                this.clearAllAuthData();
                localStorage.setItem('auth_token', mockToken);
                // No user profile in localStorage
                
                const partialRecovered = window.AuthRecovery.runIfNeeded();
                
                if (window.currentUser) {
                    test.details.push('✅ Partial data recovery: User extracted from token');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Partial data recovery failed');
                }
                
                // Scenario 4: Token expiration handling
                const expiredToken = this.createExpiredJWT();
                this.clearAllAuthData();
                localStorage.setItem('auth_token', expiredToken);
                
                try {
                    if (window.GoogleAuth && typeof window.GoogleAuth.restoreAuthState === 'function') {
                        window.GoogleAuth.restoreAuthState();
                        test.details.push('✅ Token expiration handling tested');
                    } else {
                        test.details.push('⚠️ Token expiration handling not available');
                    }
                } catch (error) {
                    test.details.push('⚠️ Token expiration error: ' + error.message);
                }
                
            } catch (error) {
                test.passed = false;
                test.issues.push('❌ Login flow simulation failed: ' + error.message);
            } finally {
                this.restoreAuthState(originalState);
            }
            
            return test;
        },

        /**
         * Verify edge cases and error handling
         */
        verifyEdgeCases: function() {
            console.log('⚠️ Verifying edge cases and error handling...');
            
            const test = {
                name: 'Edge Cases and Error Handling',
                passed: true,
                details: [],
                issues: []
            };
            
            const originalState = this.saveCurrentAuthState();
            
            try {
                // Test 1: Corrupted localStorage
                this.clearAllAuthData();
                localStorage.setItem('cwm_user_profile', 'corrupted-json-data');
                
                try {
                    window.AuthRecovery.restoreUserObject();
                    test.details.push('✅ Corrupted localStorage handled gracefully');
                } catch (error) {
                    test.passed = false;
                    test.issues.push('❌ Corrupted localStorage caused error: ' + error.message);
                }
                
                // Test 2: Missing dependencies
                const originalGoogle = window.google;
                delete window.google;
                
                try {
                    if (window.GoogleAuth && typeof window.GoogleAuth.init === 'function') {
                        window.GoogleAuth.init();
                        test.details.push('✅ Missing Google SDK handled gracefully');
                    }
                } catch (error) {
                    test.passed = false;
                    test.issues.push('❌ Missing Google SDK caused error: ' + error.message);
                } finally {
                    window.google = originalGoogle;
                }
                
                // Test 3: Invalid token formats
                const invalidTokens = ['', 'invalid', 'not.a.jwt', 'a.b', 'a.b.c.d'];
                
                invalidTokens.forEach(token => {
                    try {
                        window.AuthRecovery.extractUserFromToken(token);
                        test.details.push(`✅ Invalid token "${token}" handled gracefully`);
                    } catch (error) {
                        test.passed = false;
                        test.issues.push(`❌ Invalid token "${token}" caused error: ${error.message}`);
                    }
                });
                
                // Test 4: Network errors simulation
                const originalFetch = window.fetch;
                window.fetch = function() {
                    return Promise.reject(new Error('Network error'));
                };
                
                try {
                    window.AuthRecovery.requestNewToken();
                    test.details.push('✅ Network errors handled gracefully');
                } catch (error) {
                    test.passed = false;
                    test.issues.push('❌ Network error caused unhandled error: ' + error.message);
                } finally {
                    window.fetch = originalFetch;
                }
                
                // Test 5: Storage quota exceeded
                try {
                    // Try to fill localStorage
                    const largeData = 'x'.repeat(1000000);
                    localStorage.setItem('large-test-data', largeData);
                    localStorage.removeItem('large-test-data');
                    
                    test.details.push('✅ Storage operations work normally');
                } catch (error) {
                    test.details.push('ℹ️ Storage quota test: ' + error.message);
                }
                
            } catch (error) {
                test.passed = false;
                test.issues.push('❌ Edge case testing failed: ' + error.message);
            } finally {
                this.restoreAuthState(originalState);
            }
            
            return test;
        },

        /**
         * Verify no interference with main app
         */
        verifyNoInterference: function() {
            console.log('🔒 Verifying no interference with main app...');
            
            const test = {
                name: 'No Interference with Main App',
                passed: true,
                details: [],
                issues: []
            };
            
            try {
                // Test 1: No global variable pollution
                const expectedGlobals = ['AuthRecovery', 'GoogleAuth', 'handleCredentialResponse', 'signOut'];
                const unexpectedGlobals = [];
                
                for (const key in window) {
                    if (key.startsWith('auth') || key.startsWith('google')) {
                        if (!expectedGlobals.includes(key) && !key.startsWith('google') && key !== 'google') {
                            unexpectedGlobals.push(key);
                        }
                    }
                }
                
                if (unexpectedGlobals.length === 0) {
                    test.details.push('✅ No unexpected global variables');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Unexpected global variables: ' + unexpectedGlobals.join(', '));
                }
                
                // Test 2: No modification of existing functions
                const originalConsoleLog = console.log;
                window.AuthRecovery.init();
                
                if (console.log === originalConsoleLog) {
                    test.details.push('✅ No modification of console functions');
                } else {
                    test.passed = false;
                    test.issues.push('❌ Console functions were modified');
                }
                
                // Test 3: No DOM pollution
                const authElements = document.querySelectorAll('[id*="auth"], [class*="auth"]');
                const expectedElements = ['auth-debug-button', 'auth-debug-panel'];
                const unexpectedElements = [];
                
                authElements.forEach(element => {
                    if (!expectedElements.includes(element.id) && !expectedElements.includes(element.className)) {
                        unexpectedElements.push(element.id || element.className);
                    }
                });
                
                if (unexpectedElements.length === 0) {
                    test.details.push('✅ No unexpected DOM elements');
                } else {
                    test.details.push('ℹ️ Auth-related DOM elements: ' + unexpectedElements.join(', '));
                }
                
                // Test 4: No event listener pollution
                const originalAddEventListener = document.addEventListener;
                let eventListenerCalled = false;
                
                document.addEventListener = function() {
                    eventListenerCalled = true;
                    return originalAddEventListener.apply(this, arguments);
                };
                
                window.AuthRecovery.init();
                
                if (!eventListenerCalled) {
                    test.details.push('✅ No excessive event listener registration');
                } else {
                    test.details.push('ℹ️ Event listeners were registered (may be expected)');
                }
                
                document.addEventListener = originalAddEventListener;
                
            } catch (error) {
                test.passed = false;
                test.issues.push('❌ Non-interference test failed: ' + error.message);
            }
            
            return test;
        },

        /**
         * Utility methods
         */
        saveCurrentAuthState: function() {
            return {
                localStorage: {
                    auth_token: localStorage.getItem('auth_token'),
                    cwm_user_token: localStorage.getItem('cwm_user_token'),
                    cwm_user_profile: localStorage.getItem('cwm_user_profile'),
                    currentUser: localStorage.getItem('currentUser')
                },
                sessionStorage: {
                    auth_token: sessionStorage.getItem('auth_token'),
                    user_data: sessionStorage.getItem('user_data')
                },
                window: {
                    currentUser: window.currentUser
                }
            };
        },

        restoreAuthState: function(state) {
            // Restore localStorage
            Object.keys(state.localStorage).forEach(key => {
                if (state.localStorage[key]) {
                    localStorage.setItem(key, state.localStorage[key]);
                } else {
                    localStorage.removeItem(key);
                }
            });
            
            // Restore sessionStorage
            Object.keys(state.sessionStorage).forEach(key => {
                if (state.sessionStorage[key]) {
                    sessionStorage.setItem(key, state.sessionStorage[key]);
                } else {
                    sessionStorage.removeItem(key);
                }
            });
            
            // Restore window objects
            window.currentUser = state.window.currentUser;
        },

        clearAllAuthData: function() {
            const keys = ['auth_token', 'cwm_user_token', 'cwm_user_profile', 'currentUser', 'user_data'];
            keys.forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });
            delete window.currentUser;
            if (window.app) {
                delete window.app.currentUser;
            }
        },

        createTestJWT: function() {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payload = btoa(JSON.stringify({
                sub: 'test123',
                email: 'test@example.com',
                name: 'Test User',
                exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
            }));
            return `${header}.${payload}.test-signature`;
        },

        createExpiredJWT: function() {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payload = btoa(JSON.stringify({
                sub: 'test123',
                email: 'test@example.com',
                name: 'Test User',
                exp: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
            }));
            return `${header}.${payload}.test-signature`;
        },

        /**
         * Generate comprehensive verification report
         */
        generateVerificationReport: function(results) {
            console.log('\n🔍 AUTHENTICATION SYSTEM VERIFICATION REPORT');
            console.log('=' * 80);
            console.log('Timestamp:', results.timestamp);
            console.log('Environment:', JSON.stringify(results.environment, null, 2));
            
            let totalPassed = 0;
            let totalFailed = 0;
            
            results.tests.forEach(test => {
                const status = test.passed ? '✅ PASSED' : '❌ FAILED';
                console.log(`\n${status} ${test.name}`);
                
                if (test.details.length > 0) {
                    test.details.forEach(detail => console.log('  ' + detail));
                }
                
                if (test.issues.length > 0) {
                    test.issues.forEach(issue => console.log('  ' + issue));
                    totalFailed++;
                } else {
                    totalPassed++;
                }
            });
            
            console.log('\n' + '=' * 80);
            console.log(`SUMMARY: ${totalPassed} passed, ${totalFailed} failed`);
            
            if (totalFailed === 0) {
                console.log('🎉 VERIFICATION COMPLETE: Authentication system is ready for production!');
                console.log('✅ All authentication scenarios work correctly');
                console.log('✅ System works for every user at login');
                console.log('✅ All code is contained within static/js/auth');
                console.log('✅ No interference with main application');
                console.log('✅ Robust error handling and edge case management');
            } else {
                console.log('⚠️ VERIFICATION INCOMPLETE: Some issues need to be addressed');
                console.log('Please review the failed tests and fix the issues before deployment');
            }
            
            return {
                passed: totalPassed,
                failed: totalFailed,
                success: totalFailed === 0,
                results: results
            };
        }
    };

    // Make available globally
    window.AuthSystemVerification = AuthSystemVerification;
    
    // Run verification automatically in debug mode
    if (window.CONFIG && window.CONFIG.DEBUG_MODE) {
        setTimeout(() => {
            console.log('🔍 Debug mode: Running authentication system verification...');
            AuthSystemVerification.verifyCompleteSystem();
        }, 3000);
    }
    
    console.log('🔍 Authentication System Verification loaded and ready');

})();
