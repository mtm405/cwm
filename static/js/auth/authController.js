/**
 * Authentication Controller
 * Handles UI interactions for authentication forms
 */

class AuthController {
    constructor() {
        this.initialized = false;
        this.loginForm = null;
        this.registerForm = null;
    }
    
    /**
     * Initialize the auth controller
     */
    init() {
        if (this.initialized) return;
        
        try {
            // Find forms
            this.loginForm = document.getElementById('login-form');
            this.registerForm = document.getElementById('register-form');
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ AuthController initialized');
            
        } catch (error) {
            console.error('❌ AuthController initialization failed:', error);
        }
    }
    
    /**
     * Setup form event listeners
     */
    setupEventListeners() {
        // Login form
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            
            // Add loading states to submit button
            const submitBtn = this.loginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => this.addLoadingState(submitBtn));
            }
        }
        
        // Register form
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            
            // Real-time validation
            const inputs = this.registerForm.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
            
            // Password confirmation
            const passwordInput = this.registerForm.querySelector('input[name="password"]');
            const confirmInput = this.registerForm.querySelector('input[name="confirm_password"]');
            if (passwordInput && confirmInput) {
                confirmInput.addEventListener('input', () => {
                    this.validatePasswordMatch(passwordInput, confirmInput);
                });
            }
        }
        
        // Toggle between login and register
        const toggleLinks = document.querySelectorAll('[data-auth-toggle]');
        toggleLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleFormToggle(e));
        });
        
        // Listen for auth events
        if (window.eventBus) {
            window.eventBus.on('auth:login', (user) => this.handleLoginSuccess(user));
            window.eventBus.on('auth:logout', () => this.handleLogout());
        }
    }
    
    /**
     * Handle login form submission
     */
    async handleLogin(event) {
        event.preventDefault();
        
        const formData = new FormData(this.loginForm);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        // Validate inputs
        if (!this.validateLogin(credentials)) {
            return;
        }
        
        try {
            // Show loading state
            this.showFormLoading(this.loginForm, true);
            
            // Attempt login
            const result = await window.authService.login(credentials);
            
            if (result.success) {
                this.showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                this.showMessage(result.message || 'Login failed', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('An error occurred during login', 'error');
        } finally {
            this.showFormLoading(this.loginForm, false);
        }
    }
    
    /**
     * Handle registration form submission
     */
    async handleRegister(event) {
        event.preventDefault();
        
        const formData = new FormData(this.registerForm);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirm_password: formData.get('confirm_password')
        };
        
        // Validate inputs
        if (!this.validateRegistration(userData)) {
            return;
        }
        
        try {
            // Show loading state
            this.showFormLoading(this.registerForm, true);
            
            // Attempt registration
            const result = await window.authService.register(userData);
            
            if (result.success) {
                this.showMessage('Registration successful! Welcome!', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1000);
            } else {
                this.showMessage(result.message || 'Registration failed', 'error');
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('An error occurred during registration', 'error');
        } finally {
            this.showFormLoading(this.registerForm, false);
        }
    }
    
    /**
     * Validate login credentials
     */
    validateLogin(credentials) {
        this.clearAllErrors();
        
        let isValid = true;
        
        if (!credentials.email) {
            this.showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(credentials.email)) {
            this.showFieldError('email', 'Please enter a valid email');
            isValid = false;
        }
        
        if (!credentials.password) {
            this.showFieldError('password', 'Password is required');
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Validate registration data
     */
    validateRegistration(userData) {
        this.clearAllErrors();
        
        let isValid = true;
        
        if (!userData.username) {
            this.showFieldError('username', 'Username is required');
            isValid = false;
        } else if (userData.username.length < 3) {
            this.showFieldError('username', 'Username must be at least 3 characters');
            isValid = false;
        }
        
        if (!userData.email) {
            this.showFieldError('email', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(userData.email)) {
            this.showFieldError('email', 'Please enter a valid email');
            isValid = false;
        }
        
        if (!userData.password) {
            this.showFieldError('password', 'Password is required');
            isValid = false;
        } else if (userData.password.length < 8) {
            this.showFieldError('password', 'Password must be at least 8 characters');
            isValid = false;
        }
        
        if (userData.password !== userData.confirm_password) {
            this.showFieldError('confirm_password', 'Passwords do not match');
            isValid = false;
        }
        
        return isValid;
    }
    
    /**
     * Utility functions
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    showFieldError(fieldName, message) {
        const field = document.querySelector(`input[name="${fieldName}"]`);
        if (field) {
            field.classList.add('error');
            
            let errorDiv = field.parentNode.querySelector('.field-error');
            if (!errorDiv) {
                errorDiv = document.createElement('div');
                errorDiv.className = 'field-error';
                field.parentNode.appendChild(errorDiv);
            }
            errorDiv.textContent = message;
        }
    }
    
    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    clearAllErrors() {
        const errorFields = document.querySelectorAll('.error');
        const errorDivs = document.querySelectorAll('.field-error');
        
        errorFields.forEach(field => field.classList.remove('error'));
        errorDivs.forEach(div => div.remove());
    }
    
    showFormLoading(form, loading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (loading) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Loading...';
                submitBtn.classList.add('loading');
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = submitBtn.dataset.originalText || 'Submit';
                submitBtn.classList.remove('loading');
            }
        }
    }
    
    showMessage(message, type = 'info') {
        // Use notification system if available
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            // Fallback to simple alert
            alert(message);
        }
    }
    
    addLoadingState(button) {
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.textContent;
        }
    }
    
    handleLoginSuccess(user) {
        console.log('User logged in:', user);
    }
    
    handleLogout() {
        console.log('User logged out');
        // Clear any cached data
    }
    
    handleFormToggle(event) {
        event.preventDefault();
        const target = event.target.dataset.authToggle;
        
        // Simple form switching logic
        if (target === 'register') {
            // Switch to register form
            console.log('Switching to register form');
        } else if (target === 'login') {
            // Switch to login form
            console.log('Switching to login form');
        }
    }
    
    validateField(field) {
        // Individual field validation
        const value = field.value.trim();
        const name = field.name;
        
        if (name === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(name, 'Please enter a valid email');
        } else {
            this.clearFieldError(field);
        }
    }
    
    validatePasswordMatch(passwordField, confirmField) {
        if (confirmField.value && passwordField.value !== confirmField.value) {
            this.showFieldError('confirm_password', 'Passwords do not match');
        } else {
            this.clearFieldError(confirmField);
        }
    }
}

// Create global instance
window.AuthController = AuthController;
window.authController = new AuthController();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authController.init();
    });
} else {
    window.authController.init();
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthController;
}

console.log('✅ AuthController loaded');
