/**
 * Auth Manager - Google OAuth and session management
 * Code with Morais - Authentication System
 */

class AuthManager {
    constructor() {
        this.user = null;
        this.isAuthenticated = false;
        this.init();
    }
    
    /**
     * Initialize authentication system
     */
    init() {
        this.initGoogleIdentity();
        this.checkAuthStatus();
    }
    
    /**
     * Initialize Google Identity Services
     */
    initGoogleIdentity() {
        if (typeof google !== 'undefined' && google.accounts) {
            console.log('🔐 Google Identity Services loaded');
            
            // Set up credential callback
            window.handleCredentialResponse = this.handleCredentialResponse.bind(this);
        } else {
            console.warn('⚠️ Google Identity Services not available');
        }
    }
    
    /**
     * Handle Google OAuth credential response
     */
    async handleCredentialResponse(response) {
        console.log('🔐 Google Sign-In successful');
        const idToken = response.credential;
        
        // Debug: Log token details (safely)
        console.log('Token length:', idToken.length);
        console.log('Token starts with:', idToken.substring(0, 20) + '...');
        console.log('Token ends with:', '...' + idToken.substring(idToken.length - 20));
        
        // Try to parse the JWT payload for debugging (without verification)
        try {
            const parts = idToken.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(atob(parts[1]));
                console.log('Token payload preview:', {
                    iss: payload.iss,
                    aud: payload.aud,
                    email: payload.email,
                    exp: payload.exp,
                    iat: payload.iat
                });
            }
        } catch (e) {
            console.error('Error parsing token payload:', e);
        }
        
        // Show loading state
        this.showAuthLoading(true);
        
        try {
            // Send token to backend
            const response = await fetch('/auth/sessionLogin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken: idToken })
            });
            
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Backend response:', data);
            
            if (data.success) {
                console.log('✅ Session login successful');
                // Update auth state
                this.isAuthenticated = true;
                this.user = data.user;
                
                // Redirect to dashboard after successful login
                window.location.href = '/dashboard';
            } else {
                console.error('❌ Session login failed:', data.error);
                this.showAuthError('Login failed: ' + data.error);
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            this.showAuthError('Login failed. Please try again.');
        } finally {
            this.showAuthLoading(false);
        }
    }
    
    /**
     * Sign out user
     */
    async signOut() {
        try {
            // Clear session from backend
            const response = await fetch('/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Logout successful');
                this.isAuthenticated = false;
                this.user = null;
                window.location.href = '/';
            } else {
                console.error('❌ Logout failed:', data.error);
                // Force redirect anyway
                window.location.href = '/';
            }
        } catch (error) {
            console.error('❌ Logout error:', error);
            // Force redirect anyway
            window.location.href = '/';
        }
    }
    
    /**
     * Check authentication status
     */
    async checkAuthStatus() {
        try {
            const response = await fetch('/auth/status');
            const data = await response.json();
            
            this.isAuthenticated = data.authenticated || false;
            this.user = data.user || null;
            
            console.log('🔐 Auth status:', this.isAuthenticated ? 'authenticated' : 'not authenticated');
            
        } catch (error) {
            console.error('❌ Failed to check auth status:', error);
            this.isAuthenticated = false;
            this.user = null;
        }
    }
    
    /**
     * Show/hide authentication loading state
     */
    showAuthLoading(show) {
        const authSection = document.querySelector('.auth-section');
        if (authSection) {
            authSection.style.opacity = show ? '0.6' : '1';
            authSection.style.pointerEvents = show ? 'none' : 'auto';
        }
    }
    
    /**
     * Show authentication error
     */
    showAuthError(message) {
        alert(message); // In production, use a better notification system
    }
    
    /**
     * Get current user
     */
    getCurrentUser() {
        return this.user;
    }
    
    /**
     * Check if user is authenticated
     */
    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

// Global reference for template use
window.AuthManager = AuthManager;
