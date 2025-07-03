/**
 * Google Auth Isolation Verification Script
 * Run this in browser console to verify isolation
 */

(function verifyGoogleAuthIsolation() {
    console.log('🔍 Verifying Google Auth Isolation...');
    
    const results = {
        isolation: true,
        issues: [],
        status: []
    };
    
    // Check 1: Google Auth module exists and is properly namespaced
    if (typeof window.GoogleAuth !== 'object') {
        results.isolation = false;
        results.issues.push('GoogleAuth namespace not found');
    } else {
        results.status.push('✅ GoogleAuth namespace exists');
        
        // Check if it has expected methods
        const expectedMethods = ['init', 'handleCredentialResponse', 'reset'];
        expectedMethods.forEach(method => {
            if (typeof window.GoogleAuth[method] !== 'function') {
                results.isolation = false;
                results.issues.push(`GoogleAuth.${method} method missing`);
            } else {
                results.status.push(`✅ GoogleAuth.${method} exists`);
            }
        });
    }
    
    // Check 2: Global callback exists and points to isolated module
    if (typeof window.handleCredentialResponse !== 'function') {
        results.isolation = false;
        results.issues.push('Global handleCredentialResponse not found');
    } else {
        results.status.push('✅ Global handleCredentialResponse exists');
        
        // Check if it references the isolated module
        const callbackSource = window.handleCredentialResponse.toString();
        if (!callbackSource.includes('GoogleAuth')) {
            results.isolation = false;
            results.issues.push('Global callback does not reference GoogleAuth module');
        } else {
            results.status.push('✅ Global callback properly routed to GoogleAuth module');
        }
    }
    
    // Check 3: No conflicts with other modules
    const mainAppExists = typeof window.mainApp !== 'undefined' || typeof MainApp !== 'undefined';
    if (mainAppExists) {
        results.status.push('✅ Main app exists alongside Google Auth');
    }
    
    // Check 4: Dashboard functionality works
    const dashboardManagerExists = typeof window.modernDashboardManager !== 'undefined' || 
                                   typeof window.dashboardManager !== 'undefined';
    if (dashboardManagerExists) {
        results.status.push('✅ Dashboard manager exists alongside Google Auth');
    }
    
    // Check 5: Check for multiple definitions (conflicts)
    let googleAuthDefinitions = 0;
    if (window.GoogleAuth) googleAuthDefinitions++;
    
    const scripts = document.querySelectorAll('script[src]');
    let authScriptCount = 0;
    scripts.forEach(script => {
        if (script.src.includes('auth') && script.src.includes('google')) {
            authScriptCount++;
        }
    });
    
    if (authScriptCount > 1) {
        results.isolation = false;
        results.issues.push(`Multiple Google Auth scripts detected: ${authScriptCount}`);
    } else {
        results.status.push('✅ Single Google Auth script loaded');
    }
    
    // Check 6: Verify config loading
    if (window.CONFIG && window.CONFIG.GOOGLE_CLIENT_ID) {
        results.status.push('✅ Google Auth config available');
    } else {
        results.issues.push('Google Auth config not found');
    }
    
    // Final report
    console.log('\n📊 Google Auth Isolation Report:');
    console.log('================================');
    
    results.status.forEach(status => console.log(status));
    
    if (results.issues.length > 0) {
        console.log('\n❌ Issues Found:');
        results.issues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    console.log(`\n🎯 Overall Status: ${results.isolation ? '✅ PROPERLY ISOLATED' : '❌ ISOLATION ISSUES DETECTED'}`);
    
    return results;
})();
