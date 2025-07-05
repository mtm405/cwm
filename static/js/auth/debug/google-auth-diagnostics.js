/**
 * Google Auth Diagnostics - Dedicated Helper for Google Authentication Issues
 * Code with Morais - Authentication Diagnostics
 * 
 * This utility helps diagnose and fix Google Auth specific issues.
 */

(function() {
    'use strict';

    // ===== GOOGLE AUTH DIAGNOSTICS =====
    const runDiagnostics = () => {
        console.group('🔍 Google Auth Diagnostics');
        console.log('Time:', new Date().toISOString());
        
        const issues = [];
        const warnings = [];
        const report = {
            status: 'checking',
            issues: issues,
            warnings: warnings,
            details: {}
        };
        
        // Check 1: Is Google SDK loaded?
        const googleSDKLoaded = typeof google !== 'undefined';
        report.details.googleSDK = googleSDKLoaded;
        
        if (!googleSDKLoaded) {
            issues.push('Google SDK is not loaded. The <script> tag for Google Identity Services might be missing or blocked.');
            console.error('❌ Google SDK is not loaded');
        } else {
            console.log('✅ Google SDK is loaded');
            
            // Check 1.1: Google Accounts API
            const googleAccountsAvailable = !!google.accounts;
            report.details.googleAccounts = googleAccountsAvailable;
            
            if (!googleAccountsAvailable) {
                issues.push('Google Accounts API is not available. Make sure the correct Google SDK is loaded.');
                console.error('❌ Google Accounts API is not available');
            } else {
                console.log('✅ Google Accounts API is available');
                
                // Check 1.2: Google Identity API
                const googleIdentityAvailable = !!google.accounts.id;
                report.details.googleIdentity = googleIdentityAvailable;
                
                if (!googleIdentityAvailable) {
                    issues.push('Google Identity API is not available. The Google SDK might be partially loaded.');
                    console.error('❌ Google Identity API is not available');
                } else {
                    console.log('✅ Google Identity API is available');
                }
            }
        }
        
        // Check 2: Is GoogleAuth object initialized?
        const googleAuthAvailable = typeof window.GoogleAuth === 'object';
        report.details.googleAuthObject = googleAuthAvailable;
        
        if (!googleAuthAvailable) {
            issues.push('GoogleAuth object is not available. The google-auth.js script might be missing or have errors.');
            console.error('❌ GoogleAuth object is not available');
        } else {
            console.log('✅ GoogleAuth object is available');
            
            // Check 2.1: Is GoogleAuth initialized?
            const googleAuthInitialized = window.GoogleAuth.isInitialized === true;
            report.details.googleAuthInitialized = googleAuthInitialized;
            
            if (!googleAuthInitialized) {
                issues.push('GoogleAuth is not initialized. The GoogleAuth.init() method might not have been called.');
                console.error('❌ GoogleAuth is not initialized');
            } else {
                console.log('✅ GoogleAuth is initialized');
            }
        }
        
        // Check 3: Client ID Configuration
        const configAvailable = typeof window.CONFIG === 'object';
        const clientIdConfigured = configAvailable && !!window.CONFIG.GOOGLE_CLIENT_ID;
        report.details.clientIdConfigured = clientIdConfigured;
        
        if (!configAvailable) {
            issues.push('CONFIG object is not available. Make sure config.js is loaded before auth scripts.');
            console.error('❌ CONFIG object is not available');
        } else if (!clientIdConfigured) {
            issues.push('Google Client ID is not configured in CONFIG object. Check CONFIG.GOOGLE_CLIENT_ID.');
            console.error('❌ Google Client ID is not configured');
        } else {
            console.log('✅ Google Client ID is configured');
            console.log('   Client ID:', window.CONFIG.GOOGLE_CLIENT_ID);
        }
        
        // Check 4: Script Loading Order
        const scripts = document.querySelectorAll('script[src]');
        let googleScriptIndex = -1;
        let authScriptIndex = -1;
        
        scripts.forEach((script, index) => {
            const src = script.src.toLowerCase();
            if (src.includes('accounts.google.com/gsi/client')) {
                googleScriptIndex = index;
            } else if (src.includes('google-auth.js')) {
                authScriptIndex = index;
            }
        });
        
        if (googleScriptIndex !== -1 && authScriptIndex !== -1) {
            if (googleScriptIndex > authScriptIndex) {
                warnings.push('Google Identity Services script is loaded after google-auth.js. This might cause initialization issues.');
                console.warn('⚠️ Google Identity Services script is loaded after google-auth.js');
            } else {
                console.log('✅ Script loading order is correct');
            }
        }
        
        // Check 5: Authorization Endpoints
        try {
            fetch('/auth/google/callback', { method: 'HEAD' })
                .then(response => {
                    if (response.status === 404) {
                        console.warn('⚠️ Google Auth callback endpoint (/auth/google/callback) returns 404');
                        warnings.push('Google Auth callback endpoint (/auth/google/callback) might not be implemented on the server.');
                    } else {
                        console.log('✅ Google Auth callback endpoint exists');
                    }
                })
                .catch(error => {
                    console.warn('⚠️ Could not check Google Auth callback endpoint:', error);
                });
        } catch (e) {
            // Skip this check if fetch is not available or other issues
        }
        
        // Final report
        if (issues.length === 0) {
            report.status = 'ok';
            console.log('✅ No critical issues found with Google Auth configuration');
        } else {
            report.status = 'error';
            console.error(`❌ Found ${issues.length} issues with Google Auth configuration`);
            console.log('Issues:');
            issues.forEach(issue => console.log(`- ${issue}`));
        }
        
        if (warnings.length > 0) {
            console.warn(`⚠️ Found ${warnings.length} warnings with Google Auth configuration`);
            console.log('Warnings:');
            warnings.forEach(warning => console.log(`- ${warning}`));
        }
        
        console.groupEnd();
        
        return report;
    };
    
    // ===== GOOGLE AUTH FIXES =====
    const fixGoogleAuth = () => {
        console.group('🔧 Google Auth Fixes');
        console.log('Time:', new Date().toISOString());
        
        const fixes = [];
        
        // Fix 1: Re-initialize GoogleAuth if available but not initialized
        if (window.GoogleAuth && typeof window.GoogleAuth.init === 'function' && !window.GoogleAuth.isInitialized) {
            try {
                window.GoogleAuth.init();
                fixes.push('Re-initialized GoogleAuth module');
                console.log('✅ Re-initialized GoogleAuth module');
            } catch (e) {
                console.error('❌ Failed to re-initialize GoogleAuth:', e);
            }
        }
        
        // Fix 2: Load Google Identity Services if missing
        if (typeof google === 'undefined' || !google.accounts) {
            try {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    console.log('✅ Loaded Google Identity Services dynamically');
                    
                    // Try to initialize GoogleAuth after loading
                    if (window.GoogleAuth && typeof window.GoogleAuth.init === 'function') {
                        try {
                            window.GoogleAuth.init();
                            console.log('✅ Initialized GoogleAuth after loading Google Identity Services');
                        } catch (e) {
                            console.error('❌ Failed to initialize GoogleAuth after loading Google Identity Services:', e);
                        }
                    }
                };
                document.head.appendChild(script);
                fixes.push('Loaded Google Identity Services script dynamically');
                console.log('🔄 Loading Google Identity Services dynamically...');
            } catch (e) {
                console.error('❌ Failed to load Google Identity Services dynamically:', e);
            }
        }
        
        // Fix 3: Fix onload handler if missing
        const googleScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
        if (googleScript && !googleScript.onload) {
            googleScript.onload = () => {
                console.log('✅ Added missing onload handler to Google Identity Services script');
                
                // Try to initialize GoogleAuth
                if (window.GoogleAuth && typeof window.GoogleAuth.init === 'function') {
                    try {
                        window.GoogleAuth.init();
                        console.log('✅ Initialized GoogleAuth from fixed onload handler');
                    } catch (e) {
                        console.error('❌ Failed to initialize GoogleAuth from fixed onload handler:', e);
                    }
                }
            };
            fixes.push('Added missing onload handler to Google Identity Services script');
            console.log('✅ Added missing onload handler to Google Identity Services script');
        }
        
        if (fixes.length === 0) {
            console.log('ℹ️ No automatic fixes applied');
        } else {
            console.log(`✅ Applied ${fixes.length} fixes`);
        }
        
        console.groupEnd();
        
        return {
            fixesApplied: fixes.length > 0,
            fixes: fixes
        };
    };
    
    // ===== PUBLIC API =====
    window.GoogleAuthDiagnostics = {
        run: runDiagnostics,
        fix: fixGoogleAuth,
        
        // Run diagnostics and apply fixes
        diagnoseAndFix: () => {
            const report = runDiagnostics();
            
            if (report.status === 'error') {
                console.log('🔧 Applying automatic fixes for detected issues...');
                const fixResult = fixGoogleAuth();
                
                return {
                    diagnostics: report,
                    fixes: fixResult
                };
            }
            
            return {
                diagnostics: report,
                fixes: { fixesApplied: false, fixes: [] }
            };
        }
    };
    
    // Add global functions for easy console access
    window.checkGoogleAuth = window.GoogleAuthDiagnostics.run;
    window.fixGoogleAuth = window.GoogleAuthDiagnostics.fix;
    
    console.log('✅ Google Auth Diagnostics loaded successfully');
})();
