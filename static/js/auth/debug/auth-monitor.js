/**
 * Auth Monitor - Real-time Authentication Debugging Tool
 * Code with Morais - Auth Debug System
 * 
 * This utility provides comprehensive debugging tools for authentication state
 * including Google Auth specific diagnostics.
 */

(function() {
    'use strict';

    // ===== AUTH MONITOR STYLES =====
    const createStyles = () => {
        const style = document.createElement('style');
        style.id = 'auth-debug-styles';
        style.textContent = `
            #auth-debug-panel {
                position: fixed;
                bottom: 10px;
                right: 10px;
                width: 350px;
                max-height: 500px;
                background: rgba(33, 37, 41, 0.85);
                backdrop-filter: blur(4px);
                border-radius: 8px;
                color: white;
                font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                font-size: 12px;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                overflow: hidden;
                transition: height 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            #auth-debug-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                cursor: pointer;
            }
            #auth-debug-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
            }
            #auth-debug-content {
                padding: 12px;
                overflow-y: auto;
                max-height: 450px;
            }
            .auth-debug-section {
                margin-bottom: 16px;
            }
            .auth-debug-section-header {
                font-weight: 600;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
            }
            .auth-debug-section-content {
                padding-left: 12px;
                border-left: 1px solid rgba(255, 255, 255, 0.1);
            }
            .auth-debug-status-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
            }
            .auth-debug-button {
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                margin-right: 4px;
                transition: background-color 0.2s;
            }
            .auth-debug-button:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            .auth-debug-status-success {
                color: #4CAF50;
            }
            .auth-debug-status-error {
                color: #F44336;
            }
            .auth-debug-status-warning {
                color: #FF9800;
            }
            .auth-debug-badge {
                padding: 1px 6px;
                border-radius: 10px;
                font-size: 10px;
                text-transform: uppercase;
            }
            .auth-debug-badge-success {
                background: rgba(76, 175, 80, 0.2);
                color: #4CAF50;
            }
            .auth-debug-badge-error {
                background: rgba(244, 67, 54, 0.2);
                color: #F44336;
            }
            .auth-debug-minimize {
                font-size: 18px;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            .auth-debug-minimize:hover {
                opacity: 1;
            }
            .auth-debug-separator {
                height: 1px;
                background: rgba(255, 255, 255, 0.1);
                margin: 12px 0;
            }
        `;
        document.head.appendChild(style);
    };

    // ===== AUTH MONITOR UI =====
    const createUI = () => {
        const panel = document.createElement('div');
        panel.id = 'auth-debug-panel';
        
        panel.innerHTML = `
            <div id="auth-debug-header">
                <h3>🔐 Auth Debug</h3>
                <span class="auth-debug-minimize">−</span>
            </div>
            <div id="auth-debug-content">
                <!-- Sections will be added here -->
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add event listener for minimize button
        panel.querySelector('.auth-debug-minimize').addEventListener('click', togglePanel);
        
        // Create sections
        const content = panel.querySelector('#auth-debug-content');
        content.appendChild(createStatusSection());
        content.appendChild(createGoogleAuthSection());
        content.appendChild(createTokenSection());
        content.appendChild(createActionSection());
        
        // Add section toggle listeners
        panel.querySelectorAll('.auth-debug-section-header').forEach(header => {
            header.addEventListener('click', toggleSection);
        });
        
        return panel;
    };

    // Toggle panel expand/minimize
    const togglePanel = () => {
        const content = document.getElementById('auth-debug-content');
        const minimizeBtn = document.querySelector('.auth-debug-minimize');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            minimizeBtn.textContent = '−';
        } else {
            content.style.display = 'none';
            minimizeBtn.textContent = '+';
        }
    };

    // Toggle section visibility
    const toggleSection = (event) => {
        const header = event.currentTarget;
        const content = header.nextElementSibling;
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            header.querySelector('.toggle-icon').textContent = '−';
        } else {
            content.style.display = 'none';
            header.querySelector('.toggle-icon').textContent = '+';
        }
    };

    // ===== SECTION CREATORS =====
    const createStatusSection = () => {
        const section = document.createElement('div');
        section.className = 'auth-debug-section';
        section.innerHTML = `
            <div class="auth-debug-section-header">
                <span>🔑 Authentication Status</span>
                <span class="toggle-icon">−</span>
            </div>
            <div class="auth-debug-section-content" id="auth-status-section">
                <div class="auth-debug-status-item">
                    <span>Overall Status:</span>
                    <span id="overall-auth-status">Checking...</span>
                </div>
                <div class="auth-debug-status-item">
                    <span>Auth Token:</span>
                    <span id="auth-token-status">Checking...</span>
                </div>
                <div class="auth-debug-status-item">
                    <span>Current User:</span>
                    <span id="current-user-status">Checking...</span>
                </div>
                <div class="auth-debug-status-item">
                    <span>Auth Service:</span>
                    <span id="auth-service-status">Checking...</span>
                </div>
            </div>
        `;
        return section;
    };

    const createGoogleAuthSection = () => {
        const section = document.createElement('div');
        section.className = 'auth-debug-section';
        section.innerHTML = `
            <div class="auth-debug-section-header">
                <span>🌐 Google Auth</span>
                <span class="toggle-icon">−</span>
            </div>
            <div class="auth-debug-section-content" id="google-auth-section">
                <div class="auth-debug-status-item">
                    <span>Google SDK:</span>
                    <span id="google-sdk-status">Checking...</span>
                </div>
                <div class="auth-debug-status-item">
                    <span>Google Identity:</span>
                    <span id="google-identity-status">Checking...</span>
                </div>
                <div class="auth-debug-status-item">
                    <span>GoogleAuth Module:</span>
                    <span id="google-auth-module-status">Checking...</span>
                </div>
                <div class="auth-debug-status-item">
                    <span>Client ID:</span>
                    <span id="google-client-id-status">Checking...</span>
                </div>
                <div class="auth-debug-status-item">
                    <span>Initialization:</span>
                    <span id="google-init-status">Checking...</span>
                </div>
            </div>
        `;
        return section;
    };

    const createTokenSection = () => {
        const section = document.createElement('div');
        section.className = 'auth-debug-section';
        section.innerHTML = `
            <div class="auth-debug-section-header">
                <span>🔒 Token Info</span>
                <span class="toggle-icon">−</span>
            </div>
            <div class="auth-debug-section-content" id="token-section">
                <div class="auth-debug-status-item">
                    <span>Token Type:</span>
                    <span id="token-type">Checking...</span>
                </div>
                <div class="auth-debug-status-item">
                    <span>Issued At:</span>
                    <span id="token-issued">Checking...</span>
                </div>
                <div class="auth-debug-status-item">
                    <span>Expires:</span>
                    <span id="token-expires">Checking...</span>
                </div>
            </div>
        `;
        return section;
    };

    const createActionSection = () => {
        const section = document.createElement('div');
        section.className = 'auth-debug-section';
        section.innerHTML = `
            <div class="auth-debug-section-header">
                <span>🔧 Actions</span>
                <span class="toggle-icon">−</span>
            </div>
            <div class="auth-debug-section-content">
                <button id="auth-debug-refresh" class="auth-debug-button">Refresh Status</button>
                <button id="auth-debug-fix" class="auth-debug-button">Auto Fix Issues</button>
                <button id="auth-debug-clear" class="auth-debug-button">Clear Auth Data</button>
                <div class="auth-debug-separator"></div>
                <button id="auth-debug-google-check" class="auth-debug-button">Check Google Auth</button>
                <button id="auth-debug-console-log" class="auth-debug-button">Log to Console</button>
            </div>
        `;
        
        // Add event listeners after DOM is added
        setTimeout(() => {
            document.getElementById('auth-debug-refresh').addEventListener('click', updateStatus);
            document.getElementById('auth-debug-fix').addEventListener('click', fixAuthIssues);
            document.getElementById('auth-debug-clear').addEventListener('click', clearAuthTokens);
            document.getElementById('auth-debug-google-check').addEventListener('click', checkGoogleAuth);
            document.getElementById('auth-debug-console-log').addEventListener('click', logToConsole);
        }, 0);
        
        return section;
    };

    // ===== STATUS UPDATERS =====
    const updateStatus = () => {
        updateAuthStatus();
        updateGoogleAuthStatus();
        updateTokenStatus();
    };

    const updateAuthStatus = () => {
        // Check auth token in multiple locations
        const authToken = localStorage.getItem('auth_token') || localStorage.getItem('cwm_user_token');
        const authTokenEl = document.getElementById('auth-token-status');
        authTokenEl.textContent = authToken ? '✅ Present' : '❌ Missing';
        authTokenEl.className = authToken ? 'auth-debug-status-success' : 'auth-debug-status-error';
        
        // Check current user in multiple locations
        const currentUser = window.currentUser || 
                           (localStorage.getItem('cwm_user_profile') && JSON.parse(localStorage.getItem('cwm_user_profile'))) ||
                           (window.authService && window.authService.currentUser);
        const currentUserEl = document.getElementById('current-user-status');
        currentUserEl.textContent = currentUser ? '✅ Present' : '❌ Missing';
        currentUserEl.className = currentUser ? 'auth-debug-status-success' : 'auth-debug-status-error';
        
        // Check auth service
        const authService = window.authService && window.authService.isAuthenticated && window.authService.isAuthenticated();
        const authServiceEl = document.getElementById('auth-service-status');
        authServiceEl.textContent = authService ? '✅ Authenticated' : '❌ Not Authenticated';
        authServiceEl.className = authService ? 'auth-debug-status-success' : 'auth-debug-status-error';
        
        // Update overall status - improved logic
        const isAuthenticated = authToken && (currentUser || authService);
        const overallEl = document.getElementById('overall-auth-status');
        overallEl.textContent = isAuthenticated ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED';
        overallEl.className = isAuthenticated ? 'auth-debug-status-success' : 'auth-debug-status-error';
        
        // If we have a token but no user, try to restore it
        if (authToken && !window.currentUser) {
            // Try to restore user from localStorage
            const userProfile = localStorage.getItem('cwm_user_profile');
            if (userProfile) {
                try {
                    window.currentUser = JSON.parse(userProfile);
                    console.log('🔄 Auto-restored window.currentUser from storage');
                    // Update the display
                    currentUserEl.textContent = '✅ Present (Auto-restored)';
                    currentUserEl.className = 'auth-debug-status-success';
                } catch (e) {
                    console.error('❌ Failed to restore user from storage:', e);
                }
            }
        }
    };

    const updateGoogleAuthStatus = () => {
        // Check Google SDK
        const googleSDK = typeof google !== 'undefined';
        const googleSDKEl = document.getElementById('google-sdk-status');
        googleSDKEl.textContent = googleSDK ? '✅ Loaded' : '❌ Not Loaded';
        googleSDKEl.className = googleSDK ? 'auth-debug-status-success' : 'auth-debug-status-error';
        
        // Check Google Identity
        const googleIdentity = googleSDK && google.accounts && google.accounts.id;
        const googleIdentityEl = document.getElementById('google-identity-status');
        googleIdentityEl.textContent = googleIdentity ? '✅ Available' : '❌ Missing';
        googleIdentityEl.className = googleIdentity ? 'auth-debug-status-success' : 'auth-debug-status-error';
        
        // Check GoogleAuth module
        const googleAuthModule = window.GoogleAuth;
        const googleAuthModuleEl = document.getElementById('google-auth-module-status');
        googleAuthModuleEl.textContent = googleAuthModule ? '✅ Available' : '❌ Missing';
        googleAuthModuleEl.className = googleAuthModule ? 'auth-debug-status-success' : 'auth-debug-status-error';
        
        // Check Client ID
        const clientId = window.CONFIG && window.CONFIG.GOOGLE_CLIENT_ID;
        const clientIdEl = document.getElementById('google-client-id-status');
        clientIdEl.textContent = clientId ? '✅ Configured' : '❌ Missing';
        clientIdEl.className = clientId ? 'auth-debug-status-success' : 'auth-debug-status-error';
        
        // Check initialization
        const initialized = googleAuthModule && googleAuthModule.isInitialized;
        const initEl = document.getElementById('google-init-status');
        initEl.textContent = initialized ? '✅ Initialized' : '❌ Not Initialized';
        initEl.className = initialized ? 'auth-debug-status-success' : 'auth-debug-status-error';
    };

    const updateTokenStatus = () => {
        const authToken = localStorage.getItem('auth_token');
        
        if (!authToken) {
            document.getElementById('token-type').textContent = 'N/A';
            document.getElementById('token-issued').textContent = 'N/A';
            document.getElementById('token-expires').textContent = 'N/A';
            return;
        }
        
        // Try to decode the token if it's a JWT
        try {
            const parts = authToken.split('.');
            if (parts.length === 3) {
                // It's a JWT, decode it
                const payload = JSON.parse(atob(parts[1]));
                
                document.getElementById('token-type').textContent = 'JWT';
                
                if (payload.iat) {
                    const issuedDate = new Date(payload.iat * 1000);
                    document.getElementById('token-issued').textContent = issuedDate.toLocaleString();
                } else {
                    document.getElementById('token-issued').textContent = 'Unknown';
                }
                
                if (payload.exp) {
                    const expiryDate = new Date(payload.exp * 1000);
                    const now = new Date();
                    const isExpired = expiryDate < now;
                    
                    document.getElementById('token-expires').textContent = isExpired ? 
                        `❌ Expired (${expiryDate.toLocaleString()})` : 
                        `✅ ${expiryDate.toLocaleString()}`;
                    
                    document.getElementById('token-expires').className = isExpired ? 
                        'auth-debug-status-error' : 'auth-debug-status-success';
                } else {
                    document.getElementById('token-expires').textContent = 'No expiry';
                }
            } else {
                // Not a JWT
                document.getElementById('token-type').textContent = 'Custom (non-JWT)';
                document.getElementById('token-issued').textContent = 'Unknown';
                document.getElementById('token-expires').textContent = 'Unknown';
            }
        } catch (e) {
            // Error decoding token
            document.getElementById('token-type').textContent = 'Invalid format';
            document.getElementById('token-issued').textContent = 'Unknown';
            document.getElementById('token-expires').textContent = 'Unknown';
        }
    };

    // ===== UTILITY FUNCTIONS =====
    const fixAuthIssues = () => {
        console.log('🔧 Running comprehensive auth fix...');
        let fixed = false;
        let fixes = [];
        
        // Fix 1: Restore user object from localStorage if missing
        if (!window.currentUser) {
            const userProfile = localStorage.getItem('cwm_user_profile');
            if (userProfile) {
                try {
                    window.currentUser = JSON.parse(userProfile);
                    fixed = true;
                    fixes.push('Restored window.currentUser from localStorage');
                    console.log('✅ Restored window.currentUser:', window.currentUser);
                } catch (e) {
                    console.error('❌ Failed to restore user from storage:', e);
                }
            }
        }
        
        // Fix 2: Try to extract user from token if still missing
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
                        fixed = true;
                        fixes.push('Extracted and restored user from token');
                        console.log('✅ Extracted user from token:', userInfo);
                    }
                } catch (e) {
                    console.error('❌ Failed to extract user from token:', e);
                }
            }
        }
        
        // Fix 3: Check for misnamed auth tokens
        const tokenKeys = ['authToken', 'token', 'cwm_token', 'user_token'];
        for (const key of tokenKeys) {
            const value = localStorage.getItem(key);
            if (value && !localStorage.getItem('auth_token')) {
                localStorage.setItem('auth_token', value);
                fixed = true;
                fixes.push(`Moved token from ${key} to auth_token`);
                break;
            }
        }
        
        // Fix 4: Initialize Google Auth if available
        if (window.GoogleAuth && !window.GoogleAuth.isInitialized) {
            try {
                window.GoogleAuth.init();
                fixed = true;
                fixes.push('Initialized Google Auth');
            } catch (e) {
                console.error('❌ Failed to initialize Google Auth:', e);
            }
        }
        
        // Fix 5: Run AuthRecovery if available
        if (window.AuthRecovery && typeof window.AuthRecovery.runIfNeeded === 'function') {
            try {
                const recovered = window.AuthRecovery.runIfNeeded();
                if (recovered) {
                    fixed = true;
                    fixes.push('Ran AuthRecovery system');
                }
            } catch (e) {
                console.error('❌ AuthRecovery failed:', e);
            }
        }
        
        // Fix 6: Try to restore Google Auth state
        if (window.GoogleAuth && typeof window.GoogleAuth.restoreAuthState === 'function') {
            try {
                const restored = window.GoogleAuth.restoreAuthState();
                if (restored) {
                    fixed = true;
                    fixes.push('Restored Google Auth state');
                }
            } catch (e) {
                console.error('❌ Failed to restore Google Auth state:', e);
            }
        }
        
        // Show results
        if (fixed) {
            const message = `Applied ${fixes.length} fix(es):\n• ${fixes.join('\n• ')}`;
            alert(message);
            console.log('✅ Auth fixes applied:', fixes);
        } else {
            alert('No fixable issues found. Authentication appears to be working correctly.');
            console.log('ℹ️ No auth issues found to fix');
        }
        
        // Refresh the status display
        updateStatus();
        
        return { fixed, fixes };
    };

    const clearAuthTokens = () => {
        if (confirm('Are you sure you want to clear all authentication data?')) {
            // Clear localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('cwm_user_profile');
            localStorage.removeItem('cwm_refresh_token');
            
            // Clear other potential keys
            const authKeys = ['authToken', 'token', 'user_token', 'userProfile', 'refreshToken'];
            authKeys.forEach(key => localStorage.removeItem(key));
            
            // Clear window objects
            window.currentUser = null;
            
            // Sign out from Google if available
            if (window.GoogleAuth && window.GoogleAuth.signOut) {
                window.GoogleAuth.signOut();
            }
            
            // Sign out from Auth Service if available
            if (window.authService && window.authService.logout) {
                try {
                    window.authService.logout();
                } catch (e) {
                    console.error('Error during logout:', e);
                }
            }
            
            alert('Authentication data cleared. Status will refresh.');
            updateStatus();
        }
    };

    const checkGoogleAuth = () => {
        if (window.AuthDebug && window.AuthDebug.checkGoogleAuth) {
            window.AuthDebug.checkGoogleAuth();
        } else {
            console.group('🔍 Google Auth Status');
            console.log('Google API loaded:', typeof google !== 'undefined');
            if (typeof google !== 'undefined') {
                console.log('Google Accounts API:', !!google.accounts);
                console.log('Google Identity API:', google.accounts && !!google.accounts.id);
            }
            console.log('GoogleAuth module:', typeof window.GoogleAuth === 'object');
            if (window.GoogleAuth) {
                console.log('GoogleAuth initialized:', !!window.GoogleAuth.isInitialized);
            }
            console.log('Client ID configured:', window.CONFIG && !!window.CONFIG.GOOGLE_CLIENT_ID);
            console.groupEnd();
        }
        
        updateGoogleAuthStatus();
    };

    const logToConsole = () => {
        if (window.AuthDebug && window.AuthDebug.runDiagnostics) {
            window.AuthDebug.runDiagnostics();
        } else {
            console.group('🔐 Authentication Status');
            console.log('Auth Token:', localStorage.getItem('auth_token') ? 'Present' : 'Missing');
            console.log('Current User:', window.currentUser ? 'Present' : 'Missing');
            console.log('Auth Service:', window.authService ? 'Available' : 'Missing');
            if (window.authService) {
                console.log('Auth Service Authenticated:', window.authService.isAuthenticated ? window.authService.isAuthenticated() : 'Unknown');
            }
            console.log('Google Auth:', window.GoogleAuth ? 'Available' : 'Missing');
            if (window.GoogleAuth) {
                console.log('Google Auth Initialized:', window.GoogleAuth.isInitialized);
            }
            console.groupEnd();
        }
    };

    // ===== PUBLIC API =====
    window.AuthDebugUI = {
        init: () => {
            if (document.getElementById('auth-debug-panel')) {
                console.log('Auth Debug Panel already initialized.');
                return;
            }
            
            createStyles();
            createUI();
            updateStatus();
            
            console.log('Auth Debug Panel initialized.');
        },
        refresh: updateStatus,
        show: () => {
            const panel = document.getElementById('auth-debug-panel');
            const content = document.getElementById('auth-debug-content');
            if (panel && content) {
                panel.style.display = 'block';
                content.style.display = 'block';
                document.querySelector('.auth-debug-minimize').textContent = '−';
            } else {
                window.AuthDebugUI.init();
            }
        },
        hide: () => {
            const panel = document.getElementById('auth-debug-panel');
            if (panel) {
                panel.style.display = 'none';
            }
        },
        toggle: () => {
            const panel = document.getElementById('auth-debug-panel');
            if (panel) {
                if (panel.style.display === 'none') {
                    window.AuthDebugUI.show();
                } else {
                    window.AuthDebugUI.hide();
                }
            } else {
                window.AuthDebugUI.init();
            }
        }
    };

    // Auto-initialize if in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Delay to ensure other scripts are loaded
        setTimeout(() => {
            window.AuthDebugUI.init();
        }, 1000);
    }
})();
