/**
 * Authentication System Auto-Test
 * Code with Morais - Automated Testing for Auth System
 * 
 * This script runs comprehensive tests on the authentication system
 * to verify it works correctly for all users.
 */

(function() {
    'use strict';

    // Test results storage
    let testResults = {
        passed: 0,
        failed: 0,
        tests: []
    };

    // Test runner utilities
    const TestRunner = {
        log: function(message, type = 'info') {
            const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
            const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
            console.log(logMessage);
            
            // Add to test results
            testResults.tests.push({
                timestamp,
                message,
                type,
                passed: type === 'success'
            });
        },

        assert: function(condition, message) {
            if (condition) {
                this.log(`✅ PASS: ${message}`, 'success');
                testResults.passed++;
            } else {
                this.log(`❌ FAIL: ${message}`, 'error');
                testResults.failed++;
            }
        },

        asyncTest: function(testFunction, description) {
            this.log(`🔬 Starting test: ${description}`, 'info');
            return new Promise(resolve => {
                try {
                    testFunction(resolve);
                } catch (error) {
                    this.log(`❌ Test "${description}" threw error: ${error.message}`, 'error');
                    testResults.failed++;
                    resolve();
                }
            });
        }
    };

    // Individual test functions
    const Tests = {
        // Test 1: Check if debug tools are available
        checkDebugTools: function() {
            TestRunner.log('🔍 Testing debug tools availability...');
            
            // Check for debug button
            const debugButton = document.getElementById('auth-debug-button');
            TestRunner.assert(debugButton !== null, 'Debug button exists in DOM');
            TestRunner.assert(debugButton && debugButton.style.display !== 'none', 'Debug button is visible');
            
            // Check for manual fix button
            const fixButton = document.getElementById('manual-auth-fix-btn');
            TestRunner.assert(fixButton !== null, 'Manual fix button exists in DOM');
            
            // Check for debug scripts
            TestRunner.assert(typeof window.AuthDebugUI === 'object', 'AuthDebugUI is available');
            TestRunner.assert(typeof window.AuthRecovery === 'object', 'AuthRecovery is available');
        },

        // Test 2: Check configuration
        checkConfiguration: function() {
            TestRunner.log('⚙️ Testing configuration...');
            
            TestRunner.assert(typeof window.CONFIG === 'object', 'Global CONFIG object exists');
            TestRunner.assert(window.CONFIG && window.CONFIG.GOOGLE_CLIENT_ID, 'Google Client ID is configured');
            TestRunner.assert(window.CONFIG && window.CONFIG.AUTH_TOKEN_KEY, 'Auth token key is configured');
        },

        // Test 3: Check localStorage functionality
        checkLocalStorage: function() {
            TestRunner.log('💾 Testing localStorage functionality...');
            
            const testKey = 'auth_test_' + Date.now();
            const testValue = 'test_value_' + Math.random();
            
            try {
                localStorage.setItem(testKey, testValue);
                const retrieved = localStorage.getItem(testKey);
                TestRunner.assert(retrieved === testValue, 'localStorage read/write works');
                localStorage.removeItem(testKey);
                TestRunner.assert(localStorage.getItem(testKey) === null, 'localStorage removal works');
            } catch (error) {
                TestRunner.assert(false, 'localStorage is available and functional');
            }
        },

        // Test 4: Check auth state
        checkAuthState: function() {
            TestRunner.log('🔐 Testing authentication state...');
            
            const hasToken = !!(localStorage.getItem('auth_token') || localStorage.getItem('cwm_user_token'));
            const hasUserProfile = !!(localStorage.getItem('cwm_user_profile') || window.currentUser);
            
            TestRunner.log(`Auth token present: ${hasToken}`, hasToken ? 'success' : 'warning');
            TestRunner.log(`User profile present: ${hasUserProfile}`, hasUserProfile ? 'success' : 'warning');
            
            if (hasToken && hasUserProfile) {
                TestRunner.assert(true, 'User is properly authenticated');
            } else if (!hasToken && !hasUserProfile) {
                TestRunner.assert(true, 'User is properly unauthenticated');
            } else {
                TestRunner.assert(false, 'Auth state is inconsistent (partial authentication)');
            }
        },

        // Test 5: Test auth recovery
        checkAuthRecovery: function() {
            TestRunner.log('🔄 Testing auth recovery system...');
            
            if (window.AuthRecovery && typeof window.AuthRecovery.runIfNeeded === 'function') {
                TestRunner.assert(true, 'Auth recovery function is available');
                
                try {
                    const recoveryResult = window.AuthRecovery.runIfNeeded();
                    TestRunner.assert(typeof recoveryResult === 'boolean', 'Auth recovery returns boolean result');
                    TestRunner.log(`Recovery result: ${recoveryResult ? 'Recovery performed' : 'No recovery needed'}`, 'info');
                } catch (error) {
                    TestRunner.assert(false, 'Auth recovery function executes without errors');
                }
            } else {
                TestRunner.assert(false, 'Auth recovery function is available');
            }
        },

        // Test 6: Test Google Auth integration
        checkGoogleAuth: function() {
            TestRunner.log('🔍 Testing Google Auth integration...');
            
            TestRunner.assert(typeof window.GoogleAuth === 'object', 'GoogleAuth object is available');
            TestRunner.assert(typeof window.gapi !== 'undefined' || typeof window.google !== 'undefined', 
                'Google API is loaded');
            
            if (window.GoogleAuth && typeof window.GoogleAuth.checkAuthState === 'function') {
                TestRunner.assert(true, 'Google Auth check function is available');
            }
        },

        // Test 7: Test debug panel functionality
        checkDebugPanel: function() {
            TestRunner.log('🖥️ Testing debug panel functionality...');
            
            if (window.AuthDebugUI) {
                TestRunner.assert(typeof window.AuthDebugUI.init === 'function', 'Debug panel init function exists');
                TestRunner.assert(typeof window.AuthDebugUI.show === 'function', 'Debug panel show function exists');
                TestRunner.assert(typeof window.AuthDebugUI.hide === 'function', 'Debug panel hide function exists');
                TestRunner.assert(typeof window.AuthDebugUI.toggle === 'function', 'Debug panel toggle function exists');
            }
        }
    };

    // Main test runner
    const runAllTests = async function() {
        TestRunner.log('🚀 Starting Authentication System Tests...', 'info');
        TestRunner.log('=' * 50, 'info');
        
        // Reset test results
        testResults = { passed: 0, failed: 0, tests: [] };
        
        // Run all tests
        Tests.checkDebugTools();
        Tests.checkConfiguration();
        Tests.checkLocalStorage();
        Tests.checkAuthState();
        Tests.checkAuthRecovery();
        Tests.checkGoogleAuth();
        Tests.checkDebugPanel();
        
        // Report results
        TestRunner.log('=' * 50, 'info');
        TestRunner.log(`📊 Test Results: ${testResults.passed} passed, ${testResults.failed} failed`, 
            testResults.failed === 0 ? 'success' : 'warning');
        
        if (testResults.failed === 0) {
            TestRunner.log('🎉 All tests passed! Authentication system is working correctly.', 'success');
        } else {
            TestRunner.log('⚠️ Some tests failed. Please review the results above.', 'warning');
        }
        
        return testResults;
    };

    // Auto-run tests on page load (in development)
    const autoRunTests = function() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            setTimeout(runAllTests, 2000); // Wait 2 seconds for everything to load
        }
    };

    // Expose test runner globally
    window.AuthSystemTester = {
        runAllTests,
        testResults,
        Tests,
        TestRunner
    };

    // Auto-run in development
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoRunTests);
    } else {
        autoRunTests();
    }

})();
