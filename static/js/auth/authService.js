/**
 * Authentication Service
 * Handles user authentication, token management, and auth state
 */

class AuthService {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('auth_token');
        this.initialized = false;
    }
    
    /**
     * Initialize the auth service
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Check if user is already authenticated
            if (this.token) {
                await this.validateToken();
            }
            
            this.initialized = true;
            console.log('✅ AuthService initialized');
            
            // Emit ready event
            if (window.eventBus) {
                window.eventBus.emit('auth:ready');
            }
            
        } catch (error) {
            console.error('❌ AuthService initialization failed:', error);
            this.logout(); // Clear invalid token
        }
    }
    
    /**
     * Validate current token
     */
    async validateToken() {
        if (!this.token) return false;
        
        try {
            const response = await fetch('/api/auth/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                this.currentUser = userData.user;
                return true;
            } else {
                throw new Error('Token validation failed');
            }
            
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }
    
    /**
     * Login with credentials
     */
    async login(credentials) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.token = data.token;
                this.currentUser = data.user;
                localStorage.setItem('auth_token', this.token);
                
                // Emit login event
                if (window.eventBus) {
                    window.eventBus.emit('auth:login', this.currentUser);
                }
                
                return { success: true, user: this.currentUser };
            } else {
                throw new Error(data.message || 'Login failed');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: error.message };
        }
    }
    
    /**
     * Register new user
     */
    async register(userData) {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Auto-login after successful registration
                return await this.login({
                    email: userData.email,
                    password: userData.password
                });
            } else {
                throw new Error(data.message || 'Registration failed');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: error.message };
        }
    }
    
    /**
     * Logout user
     */
    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('auth_token');
        
        // Emit logout event
        if (window.eventBus) {
            window.eventBus.emit('auth:logout');
        }
        
        // Redirect to login page
        window.location.href = '/login';
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!(this.token && this.currentUser);
    }
    
    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Get auth token
     */
    getToken() {
        return this.token;
    }
    
    /**
     * Update user profile
     */
    async updateProfile(profileData) {
        if (!this.isAuthenticated()) {
            throw new Error('User not authenticated');
        }
        
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.currentUser = { ...this.currentUser, ...data.user };
                
                // Emit profile update event
                if (window.eventBus) {
                    window.eventBus.emit('auth:profileUpdated', this.currentUser);
                }
                
                return { success: true, user: this.currentUser };
            } else {
                throw new Error(data.message || 'Profile update failed');
            }
            
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, message: error.message };
        }
    }
}

// Create global instance
window.AuthService = AuthService;
window.authService = new AuthService();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthService;
}

console.log('✅ AuthService loaded');
