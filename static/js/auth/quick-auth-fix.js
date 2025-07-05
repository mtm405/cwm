/**
 * Quick Authentication Fix
 * This script will manually run authentication recovery and restore user state
 */

(function() {
    'use strict';
    
    console.log('🔧 Running quick authentication fix...');
    
    // Step 1: Check what we have in storage
    console.log('=== Current Storage State ===');
    console.log('auth_token:', localStorage.getItem('auth_token') ? 'Present' : 'Missing');
    console.log('cwm_user_token:', localStorage.getItem('cwm_user_token') ? 'Present' : 'Missing');
    console.log('cwm_user_profile:', localStorage.getItem('cwm_user_profile') ? 'Present' : 'Missing');
    console.log('window.currentUser:', window.currentUser ? 'Present' : 'Missing');
    
    // Step 2: Try to restore user profile
    const userProfile = localStorage.getItem('cwm_user_profile');
    if (userProfile && !window.currentUser) {
        try {
            window.currentUser = JSON.parse(userProfile);
            console.log('✅ Restored window.currentUser from localStorage:', window.currentUser);
        } catch (e) {
            console.error('❌ Failed to parse user profile:', e);
        }
    }
    
    // Step 3: Try to extract user from token if no profile
    if (!window.currentUser) {
        const authToken = localStorage.getItem('auth_token') || localStorage.getItem('cwm_user_token');
        if (authToken && authToken.includes('.')) {
            try {
                const payload = JSON.parse(atob(authToken.split('.')[1]));
                
                const userInfo = {
                    id: payload.sub || payload.user_id,
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                    given_name: payload.given_name,
                    family_name: payload.family_name
                };
                
                if (userInfo.id || userInfo.email) {
                    window.currentUser = userInfo;
                    localStorage.setItem('cwm_user_profile', JSON.stringify(userInfo));
                    console.log('✅ Extracted and restored user from token:', userInfo);
                }
            } catch (e) {
                console.error('❌ Failed to extract user from token:', e);
            }
        }
    }
    
    // Step 4: Run AuthRecovery if available
    if (window.AuthRecovery && typeof window.AuthRecovery.runIfNeeded === 'function') {
        try {
            const recovered = window.AuthRecovery.runIfNeeded();
            console.log('AuthRecovery result:', recovered);
        } catch (e) {
            console.error('❌ AuthRecovery failed:', e);
        }
    }
    
    // Step 5: Update auth status if debug panel is available
    if (window.AuthDebugUI && typeof window.AuthDebugUI.refresh === 'function') {
        try {
            window.AuthDebugUI.refresh();
            console.log('✅ Debug panel refreshed');
        } catch (e) {
            console.error('❌ Failed to refresh debug panel:', e);
        }
    }
    
    // Step 6: Final status check
    console.log('=== Final Status ===');
    console.log('window.currentUser:', window.currentUser ? 'Present' : 'Missing');
    console.log('auth_token:', localStorage.getItem('auth_token') ? 'Present' : 'Missing');
    
    if (window.currentUser) {
        console.log('✅ Authentication fix successful!');
        console.log('User:', window.currentUser);
    } else {
        console.log('❌ Authentication fix failed - no user found');
    }
})();
