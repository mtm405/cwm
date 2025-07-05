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
        style.id = 'auth-monitor-styles';
        style.textContent = `
            .auth-debug-panel {
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #fff;
                font-family: monospace;
                padding: 15px;
                border-radius: 5px;
                z-index: 10000;
                max-width: 400px;
                max-height: 600px;
                overflow: auto;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                font-size: 12px;
                transition: all 0.3s ease;
            }
            .auth-debug-panel.minimized {
                height: 30px;
                width: 30px;
                overflow: hidden;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }
            .auth-debug-panel .minimize-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                background: none;
                border: none;
                color: #fff;
                cursor: pointer;
                font-size: 16px;
                padding: 0;
            }
            .auth-debug-panel h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                border-bottom: 1px solid #444;
                padding-bottom: 5px;
            }
            .auth-debug-panel .section {
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px dashed #444;
            }
            .auth-debug-panel .section-title {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .auth-debug-panel .status-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
            }
            .auth-debug-panel .status-true {
                color: #4CAF50;
            }
            .auth-debug-panel .status-false {
                color: #F44336;
            }
            .auth-debug-panel .status-unknown {
                color: #FFC107;
            }
            .auth-debug-panel .debug-btn {
                background: #2196F3;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 3px;
                margin: 5px 0;
                cursor: pointer;
                font-size: 12px;
            }
            .auth-debug-panel .debug-btn:hover {
                background: #0b7dda;
            }
            .auth-debug-panel .debug-btn.danger {
                background: #F44336;
            }
            .auth-debug-panel .debug-btn.danger:hover {
                background: #d32f2f;
            }
            .auth-debug-panel .details {
                background: #333;
                padding: 5px;
                border-radius: 3px;
                margin-top: 5px;
                font-size: 11px;
                white-space: pre-wrap;
                word-break: break-all;
            }
            .auth-debug-panel .toggle-section {
                cursor: pointer;
                user-select: none;
            }
            .auth-debug-panel .toggle-content {
                display: none;
            }
            .auth-debug-panel .toggle-content.show {
                display: block;
            }
            .auth-debug-panel .expand-icon:after {
                content: "▶";
                display: inline-block;
                margin-right: 5px;
                transition: transform 0.2s;
            }
            .auth-debug-panel .toggle-section.expanded .expand-icon:after {
                transform: rotate(90deg);
            }
        `;
        document.head.appendChild(style);
    };

    // ===== AUTH MONITOR UI =====
    const createUI = () => {
        // Remove existing panel if any
        const existingPanel = document.getElementById('auth-debug-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const panel = document.createElement('div');
        panel.id = 'auth-debug-panel';
        panel.className = 'auth-debug-panel';

        // Create panel header
        const header = document.createElement('h3');
        header.textContent = '🔐 Auth Monitor';

        // Create minimize button
        const minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'minimize-btn';
        minimizeBtn.textContent = '−';
        minimizeBtn.addEventListener('click', togglePanel);

        // Add status sections
        const statusSection = createStatusSection();
        const googleAuthSection = createGoogleAuthSection();
        const tokenSection = createTokenSection();
        const actionSection = createActionSection();

        // Assemble panel
        panel.appendChild(minimizeBtn);
        panel.appendChild(header);
        panel.appendChild(statusSection);
        panel.appendChild(googleAuthSection);
        panel.appendChild(tokenSection);
        panel.appendChild(actionSection);

        // Add to body
        document.body.appendChild(panel);

        // Start monitoring
        updateStatus();
        // Disable auto-refresh to prevent infinite reload loops
        // setInterval(updateStatus, 5000);
    };

    // Toggle panel expand/minimize
    const togglePanel = () => {
        const panel = document.getElementById('auth-debug-panel');
        const minimizeBtn = panel.querySelector('.minimize-btn');
        
        if (panel.classList.contains('minimized')) {
            panel.classList.remove('minimized');
            minimizeBtn.textContent = '−';
        } else {
            panel.classList.add('minimized');
            minimizeBtn.textContent = '+';
        }
    };

    // Toggle section visibility
    const toggleSection = (event) => {
        const section = event.currentTarget;
        const content = section.nextElementSibling;
        
        section.classList.toggle('expanded');
        content.classList.toggle('show');
    };

    // ===== SECTION CREATORS =====
    const createStatusSection = () => {
        const section = document.createElement('div');
        section.className = 'section';

        const title = document.createElement('div');
        title.className = 'section-title toggle-section';
        title.innerHTML = '<span class="expand-icon"></span>Authentication Status';
        title.addEventListener('click', toggleSection);

        const content = document.createElement('div');
        content.className = 'toggle-content';
        content.id = 'auth-status-content';

        section.appendChild(title);
        section.appendChild(content);
        return section;
    };

    const createGoogleAuthSection = () => {
        const section = document.createElement('div');
        section.className = 'section';

        const title = document.createElement('div');
        title.className = 'section-title toggle-section';
        title.innerHTML = '<span class="expand-icon"></span>Google Auth Details';
        title.addEventListener('click', toggleSection);

        const content = document.createElement('div');
        content.className = 'toggle-content';
        content.id = 'google-auth-content';

        section.appendChild(title);
        section.appendChild(content);
        return section;
    };

    const createTokenSection = () => {
        const section = document.createElement('div');
        section.className = 'section';

        const title = document.createElement('div');
        title.className = 'section-title toggle-section';
        title.innerHTML = '<span class="expand-icon"></span>Token Information';
        title.addEventListener('click', toggleSection);

        const content = document.createElement('div');
        content.className = 'toggle-content';
        content.id = 'token-content';

        section.appendChild(title);
        section.appendChild(content);
        return section;
    };

    const createActionSection = () => {
        const section = document.createElement('div');
        section.className = 'section';

        const title = document.createElement('div');
        title.className = 'section-title';
        title.textContent = 'Debug Actions';

        const content = document.createElement('div');

        // Create debug actions
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'debug-btn';
        refreshBtn.textContent = '🔄 Refresh Status';
        refreshBtn.addEventListener('click', updateStatus);

        const fixLocalStorageBtn = document.createElement('button');
        fixLocalStorageBtn.className = 'debug-btn';
        fixLocalStorageBtn.textContent = '🔧 Fix localStorage';
        fixLocalStorageBtn.addEventListener('click', fixLocalStorage);

        const clearTokensBtn = document.createElement('button');
        clearTokensBtn.className = 'debug-btn danger';
        clearTokensBtn.textContent = '🗑️ Clear Auth Tokens';
        clearTokensBtn.addEventListener('click', clearAuthTokens);

        const logGoogleAuthBtn = document.createElement('button');
        logGoogleAuthBtn.className = 'debug-btn';
        logGoogleAuthBtn.textContent = '📝 Log Google Auth';
        logGoogleAuthBtn.addEventListener('click', logGoogleAuthDetails);

        content.appendChild(refreshBtn);
        content.appendChild(fixLocalStorageBtn);
        content.appendChild(clearTokensBtn);
        content.appendChild(logGoogleAuthBtn);

        section.appendChild(title);
        section.appendChild(content);
        return section;
    };

    // ===== STATUS UPDATERS =====
    const updateStatus = () => {
        updateAuthStatus();
        updateGoogleAuthStatus();
        updateTokenStatus();
    };

    const updateAuthStatus = () => {
        const statusContent = document.getElementById('auth-status-content');
        if (!statusContent) return;

        // Clear previous content
        statusContent.innerHTML = '';

        // Check for auth token
        const authToken = localStorage.getItem('auth_token') || 
                          localStorage.getItem('cwm_user_token') || 
                          sessionStorage.getItem('auth_token');
        
        // Check for user object
        const userObject = window.currentUser || 
                          (window.app && window.app.currentUser) || 
                          localStorage.getItem('cwm_user_profile');
        
        // Check for auth services
        const hasAuthService = typeof window.authService !== 'undefined';
        const hasAuthManager = typeof window.AuthManager !== 'undefined';
        const hasGoogleAuth = typeof window.GoogleAuth !== 'undefined';

        // Add status items
        addStatusItem(statusContent, 'Auth Token', !!authToken);
        addStatusItem(statusContent, 'User Object', !!userObject);
        addStatusItem(statusContent, 'Auth Service', hasAuthService);
        addStatusItem(statusContent, 'Auth Manager', hasAuthManager);
        addStatusItem(statusContent, 'Google Auth', hasGoogleAuth);

        // Overall status
        const isAuthenticated = !!authToken && (!!userObject || hasAuthService);
        const overallStatus = document.createElement('div');
        overallStatus.className = 'status-item';
        overallStatus.innerHTML = `
            <strong>Overall Status:</strong> 
            <span class="status-${isAuthenticated}">
                ${isAuthenticated ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}
            </span>
        `;
        statusContent.appendChild(overallStatus);

        // Add timestamp
        const timestamp = document.createElement('div');
        timestamp.style.fontSize = '10px';
        timestamp.style.marginTop = '10px';
        timestamp.style.color = '#999';
        timestamp.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        statusContent.appendChild(timestamp);
    };

    const updateGoogleAuthStatus = () => {
        const googleAuthContent = document.getElementById('google-auth-content');
        if (!googleAuthContent) return;

        // Clear previous content
        googleAuthContent.innerHTML = '';

        // Google Auth object
        const googleAuth = window.GoogleAuth;
        const googleSDK = typeof google !== 'undefined' && google.accounts && google.accounts.id;

        // Add status items
        addStatusItem(googleAuthContent, 'Google SDK', !!googleSDK);
        
        if (googleAuth) {
            addStatusItem(googleAuthContent, 'Initialized', googleAuth.isInitialized);
            addStatusItem(googleAuthContent, 'Processing', googleAuth.isProcessing);
            
            // Add config details
            if (googleAuth.config) {
                const configDetails = document.createElement('div');
                configDetails.className = 'details';
                configDetails.textContent = JSON.stringify(googleAuth.config, null, 2);
                
                const configTitle = document.createElement('div');
                configTitle.className = 'section-title toggle-section';
                configTitle.innerHTML = '<span class="expand-icon"></span>Config Details';
                configTitle.addEventListener('click', toggleSection);
                
                googleAuthContent.appendChild(configTitle);
                
                const configContent = document.createElement('div');
                configContent.className = 'toggle-content';
                configContent.appendChild(configDetails);
                googleAuthContent.appendChild(configContent);
            }
        } else {
            const noGoogleAuth = document.createElement('div');
            noGoogleAuth.textContent = 'GoogleAuth object not available';
            noGoogleAuth.style.color = '#F44336';
            googleAuthContent.appendChild(noGoogleAuth);
        }
    };

    const updateTokenStatus = () => {
        const tokenContent = document.getElementById('token-content');
        if (!tokenContent) return;

        // Clear previous content
        tokenContent.innerHTML = '';

        // Try to get tokens from various sources
        const authToken = localStorage.getItem('auth_token') || 
                          localStorage.getItem('cwm_user_token');
        const sessionToken = sessionStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('auth_refresh_token') || 
                             localStorage.getItem('cwm_refresh_token');

        // Display token info
        if (authToken || sessionToken) {
            const tokenSource = document.createElement('div');
            tokenSource.textContent = `Token source: ${authToken ? 'localStorage' : 'sessionStorage'}`;
            tokenContent.appendChild(tokenSource);

            if (authToken) {
                const tokenDetails = document.createElement('div');
                tokenDetails.className = 'details';
                
                // Only show the first and last 10 chars of the token for security
                const tokenLength = authToken.length;
                const truncatedToken = tokenLength > 20 
                    ? `${authToken.substring(0, 10)}...${authToken.substring(tokenLength - 10)}`
                    : authToken;
                
                tokenDetails.textContent = `Auth Token: ${truncatedToken} (${tokenLength} chars)`;
                tokenContent.appendChild(tokenDetails);
            }

            if (refreshToken) {
                const refreshDetails = document.createElement('div');
                refreshDetails.className = 'details';
                refreshDetails.textContent = `Refresh Token: ${refreshToken ? 'Present' : 'Missing'}`;
                tokenContent.appendChild(refreshDetails);
            }

            try {
                // Try to decode JWT if it looks like one
                if (authToken && authToken.split('.').length === 3) {
                    const tokenParts = authToken.split('.');
                    const payload = JSON.parse(atob(tokenParts[1]));
                    
                    if (payload) {
                        const expiryDate = payload.exp ? new Date(payload.exp * 1000) : null;
                        const issuedDate = payload.iat ? new Date(payload.iat * 1000) : null;
                        
                        const tokenInfo = document.createElement('div');
                        tokenInfo.innerHTML = `
                            <strong>Token Info:</strong><br>
                            ${expiryDate ? `Expires: ${expiryDate.toLocaleString()}<br>` : ''}
                            ${issuedDate ? `Issued: ${issuedDate.toLocaleString()}<br>` : ''}
                            ${payload.sub ? `Subject: ${payload.sub}<br>` : ''}
                        `;
                        tokenContent.appendChild(tokenInfo);
                        
                        // Check if token is expired
                        if (expiryDate) {
                            const now = new Date();
                            const isExpired = now > expiryDate;
                            
                            const expiryStatus = document.createElement('div');
                            expiryStatus.innerHTML = `
                                <strong>Status:</strong> 
                                <span class="status-${!isExpired}">
                                    ${isExpired ? '❌ EXPIRED' : '✅ VALID'}
                                </span>
                            `;
                            tokenContent.appendChild(expiryStatus);
                        }
                    }
                }
            } catch (e) {
                const decodeError = document.createElement('div');
                decodeError.textContent = `Token parsing error: ${e.message}`;
                decodeError.style.color = '#F44336';
                tokenContent.appendChild(decodeError);
            }
        } else {
            const noToken = document.createElement('div');
            noToken.textContent = 'No authentication token found';
            noToken.style.color = '#F44336';
            tokenContent.appendChild(noToken);
        }
    };

    // ===== UTILITY FUNCTIONS =====
    const addStatusItem = (container, label, status) => {
        const item = document.createElement('div');
        item.className = 'status-item';
        
        const statusClass = status === true ? 'status-true' : 
                           status === false ? 'status-false' : 'status-unknown';
        
        const statusText = status === true ? '✅ Yes' : 
                          status === false ? '❌ No' : '❓ Unknown';
        
        item.innerHTML = `<span>${label}:</span> <span class="${statusClass}">${statusText}</span>`;
        container.appendChild(item);
    };

    const fixLocalStorage = () => {
        try {
            // Check for common misspellings or inconsistencies
            const commonKeys = [
                {key: 'auth_token', alt: 'authToken'},
                {key: 'cwm_user_token', alt: 'auth_token'},
                {key: 'user_token', alt: 'auth_token'},
                {key: 'cwm_user_profile', alt: 'userProfile'},
                {key: 'user_data', alt: 'cwm_user_profile'}
            ];

            let fixesApplied = 0;

            // Fix missing keys by copying from alternatives
            commonKeys.forEach(({key, alt}) => {
                if (!localStorage.getItem(key) && localStorage.getItem(alt)) {
                    localStorage.setItem(key, localStorage.getItem(alt));
                    fixesApplied++;
                }
            });

            // Check for malformed JSON
            try {
                const userProfile = localStorage.getItem('cwm_user_profile');
                if (userProfile) {
                    JSON.parse(userProfile); // Just to test if it's valid JSON
                }
            } catch (e) {
                // If invalid JSON, remove it
                localStorage.removeItem('cwm_user_profile');
                fixesApplied++;
            }

            // Check window objects
            if (!window.currentUser && localStorage.getItem('cwm_user_profile')) {
                try {
                    window.currentUser = JSON.parse(localStorage.getItem('cwm_user_profile'));
                    fixesApplied++;
                } catch (e) {
                    console.error('Failed to parse user profile:', e);
                }
            }

            // Update status after fixes
            updateStatus();
            
            // Report fixes
            alert(`localStorage check complete. ${fixesApplied} fixes applied.`);
        } catch (e) {
            console.error('Error fixing localStorage:', e);
            alert(`Error fixing localStorage: ${e.message}`);
        }
    };

    const clearAuthTokens = () => {
        if (!confirm('Are you sure you want to clear all authentication tokens? This will log you out.')) {
            return;
        }

        try {
            // Clear localStorage tokens
            localStorage.removeItem('auth_token');
            localStorage.removeItem('cwm_user_token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('auth_refresh_token');
            localStorage.removeItem('cwm_refresh_token');
            localStorage.removeItem('cwm_user_profile');
            localStorage.removeItem('user_data');

            // Clear sessionStorage tokens
            sessionStorage.removeItem('auth_token');
            sessionStorage.removeItem('cwm_user_token');

            // Clear window objects
            window.currentUser = null;
            if (window.app && window.app.currentUser) {
                window.app.currentUser = null;
            }

            // Try to call logout methods if available
            if (window.GoogleAuth && typeof window.GoogleAuth.signOut === 'function') {
                window.GoogleAuth.signOut();
            }
            
            if (window.authService && typeof window.authService.logout === 'function') {
                window.authService.logout();
            }

            // Update status
            updateStatus();
            
            alert('All authentication tokens have been cleared. You are now logged out.');
        } catch (e) {
            console.error('Error clearing auth tokens:', e);
            alert(`Error clearing auth tokens: ${e.message}`);
        }
    };

    const logGoogleAuthDetails = () => {
        console.group('🔍 Google Auth Detailed Debug');
        console.log('Time:', new Date().toISOString());

        // Google Auth object
        console.log('window.GoogleAuth:', window.GoogleAuth);
        
        // Google SDK
        console.log('Google SDK available:', typeof google !== 'undefined');
        if (typeof google !== 'undefined') {
            console.log('Google Accounts API:', !!google.accounts);
            console.log('Google Identity Services:', !!google.accounts?.id);
        }
        
        // Config
        console.log('Config (window.CONFIG):', window.CONFIG);
        if (window.CONFIG) {
            console.log('Google Client ID:', window.CONFIG.GOOGLE_CLIENT_ID);
        }
        
        // Script tags
        const scriptTags = Array.from(document.scripts).filter(s => 
            s.src && (s.src.includes('google') || s.src.includes('auth') || s.src.includes('gsi'))
        );
        console.log('Related script tags:', scriptTags.map(s => s.src));
        
        // Callback function
        console.log('Global callback:', typeof window.handleCredentialResponse === 'function');
        
        console.groupEnd();
        alert('Google Auth details have been logged to the console.');
    };

    // ===== PUBLIC API =====
    window.AuthMonitor = {
        init: () => {
            createStyles();
            createUI();
        },
        refresh: updateStatus,
        checkAuth: () => {
            const authToken = localStorage.getItem('auth_token') || 
                              localStorage.getItem('cwm_user_token') || 
                              sessionStorage.getItem('auth_token');
            
            const userObject = window.currentUser || 
                              (window.app && window.app.currentUser) || 
                              localStorage.getItem('cwm_user_profile');
            
            return {
                isAuthenticated: !!authToken && !!userObject,
                hasToken: !!authToken,
                hasUser: !!userObject,
                tokenSource: localStorage.getItem('auth_token') ? 'localStorage' : 
                             localStorage.getItem('cwm_user_token') ? 'localStorage (cwm_user_token)' : 
                             sessionStorage.getItem('auth_token') ? 'sessionStorage' : null
            };
        },
        fixStorage: fixLocalStorage,
        clearTokens: clearAuthTokens
    };

    // ===== INITIALIZATION =====
    // Initialize when the DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.AuthMonitor.init);
    } else {
        window.AuthMonitor.init();
    }
})();

// Add a global function for checking auth status from console
window.checkAuth = function() {
    return window.AuthMonitor.checkAuth();
};

// Add a global function for comprehensive debugging
window.debugAuth = function() {
    console.group('🔐 Auth Debug Report');
    console.log('Timestamp:', new Date().toISOString());
    
    // Storage tokens
    console.group('📦 Storage Tokens');
    console.log('localStorage.auth_token:', localStorage.getItem('auth_token'));
    console.log('localStorage.cwm_user_token:', localStorage.getItem('cwm_user_token'));
    console.log('sessionStorage.auth_token:', sessionStorage.getItem('auth_token'));
    console.log('localStorage.cwm_user_profile:', localStorage.getItem('cwm_user_profile'));
    console.groupEnd();
    
    // Window objects
    console.group('🪟 Window Objects');
    console.log('window.currentUser:', window.currentUser);
    console.log('window.GoogleAuth:', window.GoogleAuth);
    console.log('window.authService:', window.authService);
    console.log('window.AuthManager:', window.AuthManager);
    console.groupEnd();
    
    // Google SDK
    console.group('🔍 Google SDK');
    console.log('typeof google:', typeof google);
    console.log('google.accounts:', typeof google !== 'undefined' ? google.accounts : undefined);
    console.log('google.accounts.id:', typeof google !== 'undefined' && google.accounts ? google.accounts.id : undefined);
    console.groupEnd();
    
    // Config
    console.group('⚙️ Configuration');
    console.log('window.CONFIG:', window.CONFIG);
    if (window.CONFIG) {
        console.log('CONFIG.AUTH_TOKEN_KEY:', window.CONFIG.AUTH_TOKEN_KEY);
        console.log('CONFIG.GOOGLE_CLIENT_ID:', window.CONFIG.GOOGLE_CLIENT_ID);
    }
    console.groupEnd();
    
    console.groupEnd();
    
    // Return summary
    return window.AuthMonitor.checkAuth();
};

console.log('✅ Auth Monitor loaded. Open the debug panel or use checkAuth() or debugAuth() functions in console.');
