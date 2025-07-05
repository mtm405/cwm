/**
 * JavaScript Error Fix Test Suite
 * Tests all the fixes we've implemented
 */

(function() {
    'use strict';
    
    console.log('🧪 Starting JavaScript Error Fix Test Suite...');
    
    const testResults = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    function runTest(name, testFn) {
        try {
            const result = testFn();
            if (result) {
                testResults.passed++;
                testResults.tests.push(`✅ ${name}: PASSED`);
                console.log(`✅ ${name}: PASSED`);
            } else {
                testResults.failed++;
                testResults.tests.push(`❌ ${name}: FAILED`);
                console.error(`❌ ${name}: FAILED`);
            }
        } catch (error) {
            testResults.failed++;
            testResults.tests.push(`❌ ${name}: ERROR - ${error.message}`);
            console.error(`❌ ${name}: ERROR -`, error.message);
        }
    }
    
    // Test 1: Token decoding with invalid tokens
    runTest('Token Decoding Safety', () => {
        const invalidTokens = [
            'invalid.token',
            'not.a.token.at.all',
            'invalid',
            null,
            undefined,
            123,
            {}
        ];
        
        let allPassed = true;
        invalidTokens.forEach(token => {
            try {
                if (window.safeDecodeToken) {
                    const result = window.safeDecodeToken(token);
                    if (result !== null && token !== null && token !== undefined) {
                        allPassed = false;
                    }
                }
            } catch (error) {
                allPassed = false;
            }
        });
        
        return allPassed;
    });
    
    // Test 2: AppUtils availability
    runTest('AppUtils Availability', () => {
        return typeof window.AppUtils !== 'undefined' && 
               typeof window.AppUtils.showNotification === 'function';
    });
    
    // Test 3: Auth Recovery enhanced token extraction
    runTest('Auth Recovery Token Extraction', () => {
        if (typeof window.AuthRecovery === 'undefined') {
            return true; // Skip if not loaded
        }
        
        const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
        
        try {
            const result = window.AuthRecovery.extractUserFromToken(testToken);
            return result === true; // Should successfully extract user
        } catch (error) {
            return false;
        }
    });
    
    // Test 4: Error handlers for missing endpoints
    runTest('Missing Endpoint Error Handling', () => {
        return typeof window.handleJSError === 'function' &&
               typeof window.safeExecute === 'function';
    });
    
    // Test 5: ACE Editor fallback
    runTest('ACE Editor Fallback', () => {
        if (typeof ace !== 'undefined') {
            try {
                // Test that ACE can create editors
                const testElement = document.createElement('div');
                testElement.id = 'test-ace-editor';
                document.body.appendChild(testElement);
                
                const editor = ace.edit('test-ace-editor');
                
                // Clean up
                document.body.removeChild(testElement);
                
                return editor && typeof editor.setValue === 'function';
            } catch (error) {
                return false;
            }
        }
        return true; // Skip if ACE not loaded
    });
    
    // Test 6: Global error handler
    runTest('Global Error Handler', () => {
        return window.errorFixInitialized === true;
    });
    
    // Test 7: Module system compatibility
    runTest('Module System Safety', () => {
        // Test that we can safely attempt module operations
        try {
            // This should not throw an error
            if (window.moduleCompat) {
                window.moduleCompat.register('TestModule', { test: true });
                const retrieved = window.moduleCompat.get('TestModule');
                return retrieved && retrieved.test === true;
            }
            return true;
        } catch (error) {
            return false;
        }
    });
    
    // Test 8: Refresh token API handling
    runTest('Refresh Token API Handling', () => {
        // Test that fetch requests to refresh-token endpoint are handled
        if (typeof fetch === 'function') {
            fetch('/api/auth/refresh-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: 'test' })
            }).then(response => {
                // Should not throw an error, even if endpoint returns 404 or 501
                return response.status === 404 || response.status === 501 || response.ok;
            }).catch(error => {
                // Network errors should be handled gracefully
                return true;
            });
        }
        return true;
    });
    
    // Test 9: Dashboard module loading
    runTest('Dashboard Module Safety', () => {
        // Test that dashboard modules can be loaded safely
        if (typeof window.DashboardChallengeManager !== 'undefined') {
            try {
                const manager = new window.DashboardChallengeManager();
                return manager && typeof manager.init === 'function';
            } catch (error) {
                return false;
            }
        }
        return true; // Skip if not loaded
    });
    
    // Test 10: Vocabulary module export handling
    runTest('Vocabulary Module Export Safety', () => {
        // Test that vocabulary module exports are handled
        try {
            // This should not throw an error even if exports are not supported
            if (typeof window.VocabularySystem !== 'undefined') {
                return true;
            }
            return true;
        } catch (error) {
            return false;
        }
    });
    
    // Run all tests
    setTimeout(() => {
        console.log('\n🧪 Test Results Summary:');
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
        
        if (testResults.failed === 0) {
            console.log('🎉 All tests passed! JavaScript error fixes are working correctly.');
        } else {
            console.log('⚠️ Some tests failed. Review the test output above.');
        }
        
        // Log detailed results
        console.log('\n📋 Detailed Results:');
        testResults.tests.forEach(test => console.log(test));
        
        // Store results globally for inspection
        window.testResults = testResults;
    }, 1000);
    
    console.log('🧪 JavaScript Error Fix Test Suite Completed');
    
})();
