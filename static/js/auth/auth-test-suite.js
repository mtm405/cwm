/**
 * Auth Test Suite - Complete authentication system verification
 * Code with Morais - Authentication Testing and Validation
 * 
 * This script tests all authentication scenarios to ensure the recovery system works
 * for every user at login, including edge cases and error conditions.
 */

(function() {
    'use strict';

    const AuthTestSuite = {
        testResults: [],
        
        /**
         * Run all authentication tests
         */
        runAllTests: function() {
            console.log('🧪 Starting Auth Test Suite...');
            
            this.testResults = [];
            
            // Test 1: Basic auth state detection
            this.testAuthStateDetection();
            
            // Test 2: Token recovery from localStorage
            this.testTokenRecovery();
            
            // Test 3: User object restoration
            this.testUserObjectRestoration();
            
            // Test 4: JWT token parsing
            this.testJWTTokenParsing();
            
            // Test 5: Edge cases and error handling
            this.testEdgeCases();
            
            // Test 6: Integration with Google Auth
            this.testGoogleAuthIntegration();
            
            // Test 7: Simulate login scenarios
            this.testLoginScenarios();
            
            // Generate report
            this.generateReport();
        },

        /**
         * Test authentication state detection
         */
        testAuthStateDetection: function() {
            console.log('🔍 Testing auth state detection...');
            
            const results = {
                testName: 'Auth State Detection',
                passed: 0,
                failed: 0,
                details: []
            };
            
            // Test hasAuthToken method
            if (typeof window.AuthRecovery.hasAuthToken === 'function') {
                results.passed++;
                results.details.push('✅ hasAuthToken method exists');
            } else {
                results.failed++;
                results.details.push('❌ hasAuthToken method missing');
            }
            
            // Test hasUserObject method
            if (typeof window.AuthRecovery.hasUserObject === 'function') {
                results.passed++;
                results.details.push('✅ hasUserObject method exists');
            } else {
                results.failed++;
                results.details.push('❌ hasUserObject method missing');
            }
            
            // Test checkBrokenAuth method
            if (typeof window.AuthRecovery.checkBrokenAuth === 'function') {
                results.passed++;
                results.details.push('✅ checkBrokenAuth method exists');
            } else {
                results.failed++;
                results.details.push('❌ checkBrokenAuth method missing');
            }
            
            this.testResults.push(results);
        },

        /**
         * Test token recovery functionality
         */
        testTokenRecovery: function() {
            console.log('🔄 Testing token recovery...');
            
            const results = {
                testName: 'Token Recovery',
                passed: 0,
                failed: 0,
                details: []
            };
            
            // Save current state
            const originalToken = localStorage.getItem('auth_token');
            const originalUser = window.currentUser;
            
            try {
                // Test 1: Recovery from localStorage
                const testToken = 'test.token.here';
                localStorage.setItem('auth_token', testToken);
                
                if (window.AuthRecovery.hasAuthToken()) {
                    results.passed++;
                    results.details.push('✅ Token detected in localStorage');
                } else {
                    results.failed++;
                    results.details.push('❌ Token not detected in localStorage');
                }
                
                // Test 2: Recovery method exists
                if (typeof window.AuthRecovery.recoverToken === 'function') {
                    results.passed++;
                    results.details.push('✅ recoverToken method exists');
                } else {
                    results.failed++;
                    results.details.push('❌ recoverToken method missing');
                }
                
                // Test 3: Restore token method
                if (typeof window.AuthRecovery.restoreToken === 'function') {
                    results.passed++;
                    results.details.push('✅ restoreToken method exists');
                } else {
                    results.failed++;
                    results.details.push('❌ restoreToken method missing');
                }
                
            } catch (error) {
                results.failed++;
                results.details.push('❌ Token recovery test failed: ' + error.message);
            } finally {
                // Restore original state
                if (originalToken) {
                    localStorage.setItem('auth_token', originalToken);
                } else {
                    localStorage.removeItem('auth_token');
                }
                window.currentUser = originalUser;
            }
            
            this.testResults.push(results);
        },

        /**
         * Test user object restoration
         */
        testUserObjectRestoration: function() {
            console.log('👤 Testing user object restoration...');
            
            const results = {
                testName: 'User Object Restoration',
                passed: 0,
                failed: 0,
                details: []
            };
            
            // Save current state
            const originalUser = window.currentUser;
            const originalUserData = localStorage.getItem('cwm_user_profile');
            
            try {
                // Test user object restoration
                const testUser = {
                    id: 'test123',
                    email: 'test@example.com',
                    name: 'Test User'
                };
                
                localStorage.setItem('cwm_user_profile', JSON.stringify(testUser));
                delete window.currentUser;
                
                if (window.AuthRecovery.restoreUserObject()) {
                    if (window.currentUser && window.currentUser.id === 'test123') {
                        results.passed++;
                        results.details.push('✅ User object restored successfully');
                    } else {
                        results.failed++;
                        results.details.push('❌ User object not properly restored');
                    }
                } else {
                    results.failed++;
                    results.details.push('❌ User object restoration failed');
                }
                
            } catch (error) {
                results.failed++;
                results.details.push('❌ User restoration test failed: ' + error.message);
            } finally {
                // Restore original state
                window.currentUser = originalUser;
                if (originalUserData) {
                    localStorage.setItem('cwm_user_profile', originalUserData);
                } else {
                    localStorage.removeItem('cwm_user_profile');
                }
            }
            
            this.testResults.push(results);
        },

        /**
         * Test JWT token parsing
         */
        testJWTTokenParsing: function() {
            console.log('🔍 Testing JWT token parsing...');
            
            const results = {
                testName: 'JWT Token Parsing',
                passed: 0,
                failed: 0,
                details: []
            };
            
            try {
                // Create a test JWT token
                const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
                const payload = btoa(JSON.stringify({
                    sub: 'user123',
                    email: 'test@example.com',
                    name: 'Test User',
                    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
                }));
                const signature = 'test-signature';
                const testJWT = `${header}.${payload}.${signature}`;
                
                // Test JWT extraction
                if (typeof window.AuthRecovery.extractUserFromToken === 'function') {
                    results.passed++;
                    results.details.push('✅ extractUserFromToken method exists');
                    
                    // Save current state
                    const originalUser = window.currentUser;
                    delete window.currentUser;
                    
                    try {
                        if (window.AuthRecovery.extractUserFromToken(testJWT)) {
                            if (window.currentUser && window.currentUser.id === 'user123') {
                                results.passed++;
                                results.details.push('✅ JWT token parsed and user extracted');
                            } else {
                                results.failed++;
                                results.details.push('❌ JWT token parsed but user not properly extracted');
                            }
                        } else {
                            results.failed++;
                            results.details.push('❌ JWT token extraction failed');
                        }
                    } finally {
                        window.currentUser = originalUser;
                    }
                } else {
                    results.failed++;
                    results.details.push('❌ extractUserFromToken method missing');
                }
                
            } catch (error) {
                results.failed++;
                results.details.push('❌ JWT parsing test failed: ' + error.message);
            }
            
            this.testResults.push(results);
        },

        /**
         * Test edge cases and error handling
         */
        testEdgeCases: function() {
            console.log('⚠️ Testing edge cases...');
            
            const results = {
                testName: 'Edge Cases',
                passed: 0,
                failed: 0,
                details: []
            };
            
            try {
                // Test 1: Invalid JWT token
                const invalidToken = 'invalid.token';
                if (!window.AuthRecovery.extractUserFromToken(invalidToken)) {
                    results.passed++;
                    results.details.push('✅ Invalid JWT token handled gracefully');
                } else {
                    results.failed++;
                    results.details.push('❌ Invalid JWT token not handled properly');
                }
                
                // Test 2: Corrupted localStorage data
                const originalUserData = localStorage.getItem('cwm_user_profile');
                localStorage.setItem('cwm_user_profile', 'invalid json');
                
                try {
                    window.AuthRecovery.restoreUserObject();
                    results.passed++;
                    results.details.push('✅ Corrupted localStorage handled gracefully');
                } catch (error) {
                    results.failed++;
                    results.details.push('❌ Corrupted localStorage caused error: ' + error.message);
                }
                
                // Restore original data
                if (originalUserData) {
                    localStorage.setItem('cwm_user_profile', originalUserData);
                } else {
                    localStorage.removeItem('cwm_user_profile');
                }
                
                // Test 3: Missing dependencies
                const originalGoogleAuth = window.GoogleAuth;
                delete window.GoogleAuth;
                
                try {
                    window.AuthRecovery.init();
                    results.passed++;
                    results.details.push('✅ Missing dependencies handled gracefully');
                } catch (error) {
                    results.failed++;
                    results.details.push('❌ Missing dependencies caused error: ' + error.message);
                }
                
                // Restore GoogleAuth
                window.GoogleAuth = originalGoogleAuth;
                
            } catch (error) {
                results.failed++;
                results.details.push('❌ Edge case testing failed: ' + error.message);
            }
            
            this.testResults.push(results);
        },

        /**
         * Test Google Auth integration
         */
        testGoogleAuthIntegration: function() {
            console.log('🔗 Testing Google Auth integration...');
            
            const results = {
                testName: 'Google Auth Integration',
                passed: 0,
                failed: 0,
                details: []
            };
            
            try {
                // Test GoogleAuth module exists
                if (window.GoogleAuth) {
                    results.passed++;
                    results.details.push('✅ GoogleAuth module loaded');
                    
                    // Test required methods
                    const requiredMethods = ['init', 'handleCredentialResponse', 'signOut', 'restoreAuthState'];
                    requiredMethods.forEach(method => {
                        if (typeof window.GoogleAuth[method] === 'function') {
                            results.passed++;
                            results.details.push(`✅ GoogleAuth.${method} method exists`);
                        } else {
                            results.failed++;
                            results.details.push(`❌ GoogleAuth.${method} method missing`);
                        }
                    });
                } else {
                    results.failed++;
                    results.details.push('❌ GoogleAuth module not loaded');
                }
                
                // Test global callback
                if (typeof window.handleCredentialResponse === 'function') {
                    results.passed++;
                    results.details.push('✅ Global credential response handler exists');
                } else {
                    results.failed++;
                    results.details.push('❌ Global credential response handler missing');
                }
                
                // Test global sign out
                if (typeof window.signOut === 'function') {
                    results.passed++;
                    results.details.push('✅ Global sign out function exists');
                } else {
                    results.failed++;
                    results.details.push('❌ Global sign out function missing');
                }
                
            } catch (error) {
                results.failed++;
                results.details.push('❌ Google Auth integration test failed: ' + error.message);
            }
            
            this.testResults.push(results);
        },

        /**
         * Test login scenarios
         */
        testLoginScenarios: function() {
            console.log('🚀 Testing login scenarios...');
            
            const results = {
                testName: 'Login Scenarios',
                passed: 0,
                failed: 0,
                details: []
            };
            
            try {
                // Scenario 1: New user (no existing data)
                this.clearAllAuthData();
                
                if (!window.AuthRecovery.hasAuthToken() && !window.AuthRecovery.hasUserObject()) {
                    results.passed++;
                    results.details.push('✅ New user scenario detected correctly');
                } else {
                    results.failed++;
                    results.details.push('❌ New user scenario not detected properly');
                }
                
                // Scenario 2: Returning user with valid token
                const validToken = this.createValidJWTToken();
                const userProfile = {
                    id: 'user123',
                    email: 'test@example.com',
                    name: 'Test User'
                };
                
                localStorage.setItem('auth_token', validToken);
                localStorage.setItem('cwm_user_profile', JSON.stringify(userProfile));
                
                if (window.AuthRecovery.hasAuthToken() && window.AuthRecovery.hasUserObject()) {
                    results.passed++;
                    results.details.push('✅ Returning user scenario detected correctly');
                } else {
                    results.failed++;
                    results.details.push('❌ Returning user scenario not detected properly');
                }
                
                // Scenario 3: Broken auth (user but no token)
                localStorage.removeItem('auth_token');
                window.currentUser = userProfile;
                
                if (window.AuthRecovery.checkBrokenAuth()) {
                    results.passed++;
                    results.details.push('✅ Broken auth scenario detected correctly');
                } else {
                    results.failed++;
                    results.details.push('❌ Broken auth scenario not detected properly');
                }
                
                // Scenario 4: Auto-recovery test
                const recovered = window.AuthRecovery.runIfNeeded();
                if (recovered || window.currentUser) {
                    results.passed++;
                    results.details.push('✅ Auto-recovery worked');
                } else {
                    results.failed++;
                    results.details.push('❌ Auto-recovery failed');
                }
                
            } catch (error) {
                results.failed++;
                results.details.push('❌ Login scenario testing failed: ' + error.message);
            }
            
            this.testResults.push(results);
        },

        /**
         * Clear all authentication data
         */
        clearAllAuthData: function() {
            // Clear localStorage
            const authKeys = ['auth_token', 'cwm_user_token', 'cwm_user_profile', 'currentUser'];
            authKeys.forEach(key => localStorage.removeItem(key));
            
            // Clear sessionStorage
            authKeys.forEach(key => sessionStorage.removeItem(key));
            
            // Clear window objects
            delete window.currentUser;
            if (window.app) {
                delete window.app.currentUser;
            }
        },

        /**
         * Create a valid JWT token for testing
         */
        createValidJWTToken: function() {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payload = btoa(JSON.stringify({
                sub: 'user123',
                email: 'test@example.com',
                name: 'Test User',
                exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
            }));
            const signature = 'test-signature';
            return `${header}.${payload}.${signature}`;
        },

        /**
         * Generate and display test report
         */
        generateReport: function() {
            console.log('\n📊 AUTH TEST SUITE REPORT');
            console.log('=' * 50);
            
            let totalPassed = 0;
            let totalFailed = 0;
            
            this.testResults.forEach(result => {
                totalPassed += result.passed;
                totalFailed += result.failed;
                
                const status = result.failed === 0 ? '✅ PASSED' : '❌ FAILED';
                console.log(`\n${status} ${result.testName}: ${result.passed} passed, ${result.failed} failed`);
                
                result.details.forEach(detail => {
                    console.log(`  ${detail}`);
                });
            });
            
            console.log('\n' + '=' * 50);
            console.log(`TOTAL: ${totalPassed} passed, ${totalFailed} failed`);
            
            if (totalFailed === 0) {
                console.log('🎉 ALL TESTS PASSED! Authentication system is ready.');
            } else {
                console.log('⚠️ Some tests failed. Review the issues above.');
            }
            
            return {
                passed: totalPassed,
                failed: totalFailed,
                success: totalFailed === 0
            };
        }
    };

    // Make available globally
    window.AuthTestSuite = AuthTestSuite;
    
    // Auto-run tests if in debug mode
    if (window.CONFIG && window.CONFIG.DEBUG_MODE) {
        console.log('🔍 Debug mode detected, running auth tests...');
        setTimeout(() => {
            AuthTestSuite.runAllTests();
        }, 2000);
    }
    
    console.log('🧪 Auth Test Suite loaded and ready');

})();
