"""
Enhanced Auth Monitor - Client Side JavaScript
This monitors auth state and provides debugging capabilities
"""

class EnhancedAuthMonitor {
    constructor() {
        this.isRunning = false;
        this.updateInterval = 2000; // 2 seconds
        this.debugMode = true;
        this.lastKnownState = {};
        this.stateHistory = [];
        this.maxHistorySize = 20;
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.startMonitoring();
        this.bindEvents();
        console.log('🔍 Enhanced Auth Monitor initialized');
    }
    
    createUI() {
        // Remove existing monitor
        const existing = document.getElementById('enhanced-auth-monitor');
        if (existing) existing.remove();
        
        const monitor = document.createElement('div');
        monitor.id = 'enhanced-auth-monitor';
        monitor.innerHTML = `
            <div class="auth-monitor-header">
                <h3>🔍 Enhanced Auth Monitor</h3>
                <button id="toggle-monitor" class="btn-toggle">⏸️</button>
                <button id="clear-history" class="btn-clear">🗑️</button>
            </div>
            <div class="auth-monitor-content">
                <div class="auth-status-grid">
                    <div class="status-item">
                        <label>Auth Token:</label>
                        <span id="token-status" class="status-value">❌ Checking...</span>
                    </div>
                    <div class="status-item">
                        <label>Token Source:</label>
                        <span id="token-source" class="status-value">-</span>
                    </div>
                    <div class="status-item">
                        <label>User Object:</label>
                        <span id="user-status" class="status-value">❌ Checking...</span>
                    </div>
                    <div class="status-item">
                        <label>Session Active:</label>
                        <span id="session-status" class="status-value">❌ Checking...</span>
                    </div>
                    <div class="status-item">
                        <label>Auth Service:</label>
                        <span id="auth-service-status" class="status-value">❌ Checking...</span>
                    </div>
                    <div class="status-item">
                        <label>Overall Status:</label>
                        <span id="overall-status" class="status-value">❌ Checking...</span>
                    </div>
                </div>
                
                <div class="auth-debug-actions">
                    <button id="run-token-fix" class="btn-action">🔧 Fix Token Issues</button>
                    <button id="export-debug" class="btn-action">📥 Export Debug Data</button>
                    <button id="clear-auth" class="btn-action">🧹 Clear Auth Data</button>
                    <button id="test-auth-flow" class="btn-action">🧪 Test Auth Flow</button>
                </div>
                
                <div class="auth-recommendations">
                    <h4>💡 Recommendations:</h4>
                    <div id="recommendations-list"></div>
                </div>
                
                <div class="auth-debug-log">
                    <h4>📋 Debug Log:</h4>
                    <div id="debug-log" class="log-container"></div>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #enhanced-auth-monitor {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 400px;
                background: #1a1a1a;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 15px;
                color: #fff;
                font-family: monospace;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .auth-monitor-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #333;
            }
            
            .auth-monitor-header h3 {
                margin: 0;
                color: #4CAF50;
            }
            
            .btn-toggle, .btn-clear {
                background: #333;
                color: #fff;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                margin-left: 5px;
            }
            
            .auth-status-grid {
                display: grid;
                grid-template-columns: 1fr;
                gap: 8px;
                margin-bottom: 15px;
            }
            
            .status-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px;
                background: #2a2a2a;
                border-radius: 4px;
            }
            
            .status-item label {
                color: #ccc;
                font-size: 12px;
            }
            
            .status-value {
                font-size: 12px;
                font-weight: bold;
            }
            
            .auth-debug-actions {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 15px;
            }
            
            .btn-action {
                background: #2196F3;
                color: #fff;
                border: none;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 11px;
            }
            
            .btn-action:hover {
                background: #1976D2;
            }
            
            .auth-recommendations {
                margin-bottom: 15px;
            }
            
            .auth-recommendations h4 {
                margin: 0 0 10px 0;
                color: #FF9800;
                font-size: 14px;
            }
            
            #recommendations-list {
                font-size: 12px;
                color: #ccc;
            }
            
            .recommendation-item {
                padding: 5px;
                margin: 3px 0;
                background: #2a2a2a;
                border-radius: 4px;
                border-left: 3px solid #FF9800;
            }
            
            .auth-debug-log h4 {
                margin: 0 0 10px 0;
                color: #9C27B0;
                font-size: 14px;
            }
            
            .log-container {
                max-height: 150px;
                overflow-y: auto;
                font-size: 11px;
                color: #ccc;
            }
            
            .log-entry {
                padding: 3px 5px;
                margin: 2px 0;
                background: #2a2a2a;
                border-radius: 3px;
            }
            
            .log-entry.error { border-left: 3px solid #f44336; }
            .log-entry.warning { border-left: 3px solid #ff9800; }
            .log-entry.info { border-left: 3px solid #2196f3; }
            .log-entry.success { border-left: 3px solid #4caf50; }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(monitor);
    }
    
    bindEvents() {
        document.getElementById('toggle-monitor').addEventListener('click', () => {
            this.toggleMonitoring();
        });
        
        document.getElementById('clear-history').addEventListener('click', () => {
            this.clearHistory();
        });
        
        document.getElementById('run-token-fix').addEventListener('click', () => {
            this.runTokenFix();
        });
        
        document.getElementById('export-debug').addEventListener('click', () => {
            this.exportDebugData();
        });
        
        document.getElementById('clear-auth').addEventListener('click', () => {
            this.clearAuthData();
        });
        
        document.getElementById('test-auth-flow').addEventListener('click', () => {
            this.testAuthFlow();
        });
    }
    
    startMonitoring() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.monitorInterval = setInterval(() => {
            this.checkAuthState();
        }, this.updateInterval);
        
        this.log('Monitor started', 'info');
    }
    
    stopMonitoring() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.monitorInterval);
        this.log('Monitor stopped', 'info');
    }
    
    toggleMonitoring() {
        if (this.isRunning) {
            this.stopMonitoring();
            document.getElementById('toggle-monitor').textContent = '▶️';
        } else {
            this.startMonitoring();
            document.getElementById('toggle-monitor').textContent = '⏸️';
        }
    }
    
    async checkAuthState() {
        try {
            const state = await this.gatherAuthState();
            this.updateUI(state);
            this.recordState(state);
        } catch (error) {
            this.log(`Error checking auth state: ${error.message}`, 'error');
        }
    }
    
    async gatherAuthState() {
        const state = {
            timestamp: new Date().toISOString(),
            
            // Client-side checks
            localStorage_token: !!localStorage.getItem('auth_token'),
            session_token: !!sessionStorage.getItem('auth_token'),
            cwm_user_token: !!localStorage.getItem('cwm_user_token'),
            
            // User objects
            window_user: !!window.currentUser,
            global_user: !!globalThis.currentUser,
            
            // Services
            auth_service: !!window.authService,
            auth_manager: !!window.authManager,
            google_auth: !!(window.google && window.google.accounts),
            
            // Session data
            user_profile: !!localStorage.getItem('cwm_user_profile'),
            
            // Server-side check
            server_state: null
        };
        
        // Check server-side state
        try {
            const response = await fetch('/debug/auth-monitor-data');
            if (response.ok) {
                state.server_state = await response.json();
            }
        } catch (error) {
            this.log(`Server check failed: ${error.message}`, 'warning');
        }
        
        return state;
    }
    
    updateUI(state) {
        // Update status indicators
        document.getElementById('token-status').textContent = 
            state.localStorage_token || state.session_token || state.cwm_user_token ? '✅ Yes' : '❌ No';
        
        document.getElementById('token-source').textContent = 
            state.localStorage_token ? 'localStorage' : 
            state.session_token ? 'sessionStorage' : 
            state.cwm_user_token ? 'cwm_user_token' : 'None';
        
        document.getElementById('user-status').textContent = 
            state.window_user || state.global_user ? '✅ Yes' : '❌ No';
        
        document.getElementById('session-status').textContent = 
            state.user_profile ? '✅ Yes' : '❌ No';
        
        document.getElementById('auth-service-status').textContent = 
            state.auth_service ? '✅ Yes' : '❌ No';
        
        const isAuthenticated = (state.localStorage_token || state.session_token) && 
                              (state.window_user || state.global_user);
        
        document.getElementById('overall-status').textContent = 
            isAuthenticated ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED';
        
        // Update recommendations
        this.updateRecommendations(state);
    }
    
    updateRecommendations(state) {
        const recommendations = [];
        
        if ((state.window_user || state.global_user) && !state.localStorage_token && !state.session_token) {
            recommendations.push("User found but no token - check token storage");
        }
        
        if ((state.localStorage_token || state.session_token) && !state.window_user && !state.global_user) {
            recommendations.push("Token found but no user object - verify auth service");
        }
        
        if (!state.auth_service && !state.auth_manager) {
            recommendations.push("No auth service found - check script loading");
        }
        
        if (state.cwm_user_token && !state.localStorage_token) {
            recommendations.push("Old token format detected - run token fix");
        }
        
        if (state.server_state && state.server_state.recommendations) {
            recommendations.push(...state.server_state.recommendations);
        }
        
        const container = document.getElementById('recommendations-list');
        container.innerHTML = recommendations.length ? 
            recommendations.map(rec => `<div class="recommendation-item">${rec}</div>`).join('') :
            '<div style="color: #4CAF50;">No issues detected</div>';
    }
    
    recordState(state) {
        this.stateHistory.push({
            timestamp: Date.now(),
            state: state
        });
        
        if (this.stateHistory.length > this.maxHistorySize) {
            this.stateHistory.shift();
        }
        
        // Check for state changes
        if (JSON.stringify(state) !== JSON.stringify(this.lastKnownState)) {
            this.log(`Auth state changed`, 'info');
            this.lastKnownState = state;
        }
    }
    
    async runTokenFix() {
        this.log('Running token fix...', 'info');
        
        try {
            const response = await fetch('/debug/auth-token-fix');
            const result = await response.json();
            
            if (result.fixes_applied && result.fixes_applied.length > 0) {
                result.fixes_applied.forEach(fix => {
                    this.log(`Fix applied: ${fix}`, 'success');
                });
            } else {
                this.log('No fixes needed', 'info');
            }
            
            // Refresh state
            this.checkAuthState();
            
        } catch (error) {
            this.log(`Token fix failed: ${error.message}`, 'error');
        }
    }
    
    exportDebugData() {
        const debugData = {
            timestamp: new Date().toISOString(),
            current_state: this.lastKnownState,
            history: this.stateHistory,
            browser_info: {
                userAgent: navigator.userAgent,
                url: window.location.href,
                cookies: document.cookie
            }
        };
        
        const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `auth-debug-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.log('Debug data exported', 'success');
    }
    
    clearAuthData() {
        if (confirm('Clear all authentication data? This will log you out.')) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('cwm_user_token');
            localStorage.removeItem('cwm_user_profile');
            sessionStorage.removeItem('auth_token');
            
            // Clear user objects
            window.currentUser = null;
            globalThis.currentUser = null;
            
            this.log('Auth data cleared', 'warning');
            
            // Refresh page after short delay
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
    
    async testAuthFlow() {
        this.log('Testing auth flow...', 'info');
        
        // Test various auth endpoints
        const tests = [
            { name: 'Auth status', url: '/api/auth/status' },
            { name: 'User profile', url: '/api/user/profile' },
            { name: 'Firebase status', url: '/api/firebase-status' }
        ];
        
        for (const test of tests) {
            try {
                const response = await fetch(test.url);
                const status = response.ok ? 'PASS' : 'FAIL';
                this.log(`${test.name}: ${status} (${response.status})`, 
                        response.ok ? 'success' : 'error');
            } catch (error) {
                this.log(`${test.name}: ERROR - ${error.message}`, 'error');
            }
        }
    }
    
    clearHistory() {
        this.stateHistory = [];
        document.getElementById('debug-log').innerHTML = '';
        this.log('History cleared', 'info');
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        const container = document.getElementById('debug-log');
        container.appendChild(logEntry);
        container.scrollTop = container.scrollHeight;
        
        console.log(`[AuthMonitor] ${message}`);
    }
}

// Initialize the enhanced auth monitor
window.enhancedAuthMonitor = new EnhancedAuthMonitor();

// Export for external use
window.EnhancedAuthMonitor = EnhancedAuthMonitor;
