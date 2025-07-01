/**
 * Emergency Application Bootstrapper
 * For handling module loading failures and ensuring lesson content displays
 */

// Create a synthetic event bus if the real one isn't available
if (!window.eventBus) {
    window.eventBus = {
        emit: function(event, data) {
            console.log(`📢 Event emitted (synthetic): ${event}`, data);
        },
        on: function(event, callback) {
            console.log(`📢 Event listener registered (synthetic): ${event}`);
            return { off: function() {} };
        },
        off: function() {},
        once: function() {}
    };
}

// Create a minimal auth manager if the real one isn't loaded
if (!window.authManager) {
    window.authManager = {
        isAuthenticated: function() { return true; },
        getCurrentUser: function() { 
            return { 
                id: 'guest-user',
                name: 'Guest User',
                role: 'student'
            };
        },
        checkAuthentication: function() {
            console.log('👤 Auth check (synthetic)');
            return Promise.resolve(true);
        }
    };
    console.log('✅ Emergency auth manager created');
}

// Initialize the lesson immediately
window.setTimeout(function() {
    if (typeof window.safeInitializeLesson === 'function') {
        console.log('🚀 Emergency lesson initialization');
        window.safeInitializeLesson();
    } else if (typeof window.renderSubtopic === 'function') {
        console.log('🚀 Emergency subtopic rendering');
        window.renderSubtopic(0);
    }
}, 500);

console.log('✅ Emergency bootstrapper loaded');
