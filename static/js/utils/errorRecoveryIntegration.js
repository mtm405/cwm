/**
 * Error Recovery Integration for Code with Morais
 * This script integrates the comprehensive error recovery system
 * with Flask templates and provides automatic initialization.
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    function initializeErrorRecovery() {
        console.log('🛡️ Initializing Error Recovery Integration...');
        
        // Ensure error recovery system is loaded
        if (!window.errorRecovery) {
            console.warn('⚠️ ErrorRecoverySystem not found, attempting to load...');
            
            // Try to load the error recovery system
            const script = document.createElement('script');
            script.src = '/static/js/utils/errorRecoverySystem.js';
            script.onload = function() {
                console.log('✅ Error Recovery System loaded dynamically');
                initializeRecoveryFeatures();
            };
            script.onerror = function() {
                console.error('❌ Failed to load Error Recovery System');
            };
            document.head.appendChild(script);
        } else {
            initializeRecoveryFeatures();
        }
    }
    
    function initializeRecoveryFeatures() {
        // Set up automatic data caching for critical data
        setupAutomaticCaching();
        
        // Set up network status monitoring
        setupNetworkMonitoring();
        
        // Set up page-specific recovery
        setupPageSpecificRecovery();
        
        // Set up recovery UI controls
        setupRecoveryUI();
        
        // Set up periodic health checks
        setupHealthChecks();
        
        console.log('✅ Error Recovery Integration complete');
    }
    
    function setupAutomaticCaching() {
        // Cache lesson data whenever it's updated
        let originalLessonData = window.lessonData;
        Object.defineProperty(window, 'lessonData', {
            get: function() {
                return originalLessonData;
            },
            set: function(value) {
                originalLessonData = value;
                if (window.errorRecovery && value) {
                    window.errorRecovery.cacheData('lesson_data', value);
                }
            }
        });
        
        // Cache user data whenever it's updated
        if (window.currentUser) {
            window.errorRecovery.cacheData('user_data', window.currentUser);
        }
        
        // Cache quiz data
        if (window.quizData) {
            window.errorRecovery.cacheData('quiz_data', window.quizData);
        }
    }
    
    function setupNetworkMonitoring() {
        // Monitor online/offline status
        window.addEventListener('online', function() {
            console.log('🌐 Network connection restored');
            
            // Remove offline indicator
            const indicator = document.getElementById('offline-indicator');
            if (indicator) {
                indicator.remove();
            }
            
            // Try to sync any pending data
            if (window.errorRecovery) {
                window.errorRecovery.triggerRecovery('network');
            }
            
            // Show success message
            showNotification('Connection restored', 'success');
        });
        
        window.addEventListener('offline', function() {
            console.log('📡 Network connection lost');
            
            // Enable offline mode
            if (window.errorRecovery) {
                window.errorRecovery.enableOfflineMode();
            }
            
            showNotification('You are now offline. Using cached data.', 'warning');
        });
    }
    
    function setupPageSpecificRecovery() {
        const currentPath = window.location.pathname;
        
        // Lesson page specific recovery
        if (currentPath.includes('/lesson/')) {
            setupLessonPageRecovery();
        }
        
        // Dashboard specific recovery
        if (currentPath === '/dashboard') {
            setupDashboardRecovery();
        }
        
        // Quiz specific recovery
        if (currentPath.includes('/quiz/')) {
            setupQuizRecovery();
        }
    }
    
    function setupLessonPageRecovery() {
        // Monitor for lesson data issues
        const checkLessonData = setInterval(function() {
            if (!window.lessonData || !window.lessonData.id) {
                console.warn('⚠️ Lesson data missing, attempting recovery...');
                
                if (window.errorRecovery) {
                    window.errorRecovery.handleError(
                        new Error('Lesson data missing'), 
                        { type: 'data-error', page: 'lesson' }
                    );
                }
                
                clearInterval(checkLessonData);
            }
        }, 5000);
        
        // Stop checking after 30 seconds
        setTimeout(() => clearInterval(checkLessonData), 30000);
    }
    
    function setupDashboardRecovery() {
        // Monitor dashboard components
        setTimeout(function() {
            if (!document.querySelector('.dashboard-content') && 
                !document.querySelector('.loading-spinner')) {
                console.warn('⚠️ Dashboard content missing, attempting recovery...');
                
                if (window.errorRecovery) {
                    window.errorRecovery.reinitializeUIComponents();
                }
            }
        }, 3000);
    }
    
    function setupQuizRecovery() {
        // Monitor quiz functionality
        const checkQuizData = setInterval(function() {
            if (!window.quizData || !window.quizData.questions) {
                console.warn('⚠️ Quiz data missing, attempting recovery...');
                
                if (window.errorRecovery) {
                    window.errorRecovery.handleError(
                        new Error('Quiz data missing'), 
                        { type: 'data-error', page: 'quiz' }
                    );
                }
                
                clearInterval(checkQuizData);
            }
        }, 5000);
        
        setTimeout(() => clearInterval(checkQuizData), 30000);
    }
    
    function setupRecoveryUI() {
        // Add recovery control panel (only in development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            const controlPanel = document.createElement('div');
            controlPanel.id = 'recovery-control-panel';
            controlPanel.innerHTML = `
                <div style="
                    position: fixed;
                    bottom: 10px;
                    left: 10px;
                    background: #2c3e50;
                    color: white;
                    padding: 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    z-index: 10000;
                    max-width: 200px;
                    font-family: monospace;
                ">
                    <div style="font-weight: bold; margin-bottom: 5px;">🛠️ Recovery Panel</div>
                    <button onclick="window.errorRecovery.triggerRecovery('data')" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Fix Data</button>
                    <button onclick="window.errorRecovery.triggerRecovery('modules')" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Fix Modules</button>
                    <button onclick="console.log(window.errorRecovery.getRecoveryStats())" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Stats</button>
                    <button onclick="document.getElementById('recovery-control-panel').style.display='none'" style="margin: 2px; padding: 4px 8px; font-size: 10px;">Hide</button>
                </div>
            `;
            
            document.body.appendChild(controlPanel);
        }
    }
    
    function setupHealthChecks() {
        // Periodic health check every 30 seconds
        setInterval(function() {
            performHealthCheck();
        }, 30000);
        
        // Initial health check after 5 seconds
        setTimeout(performHealthCheck, 5000);
    }
    
    function performHealthCheck() {
        const issues = [];
        
        // Check critical globals
        if (!window.lessonData && window.location.pathname.includes('/lesson/')) {
            issues.push('Missing lesson data');
        }
        
        if (!window.currentUser && window.location.pathname !== '/login') {
            issues.push('Missing user data');
        }
        
        // Check critical services
        if (window.location.pathname.includes('/lesson/') && !window.editorService) {
            issues.push('Editor service not initialized');
        }
        
        if (issues.length > 0) {
            console.warn('🏥 Health check found issues:', issues);
            
            // Attempt automatic recovery
            if (window.errorRecovery) {
                window.errorRecovery.triggerRecovery('data');
            }
        }
    }
    
    function showNotification(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        
        // Add animation styles
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeErrorRecovery);
    } else {
        initializeErrorRecovery();
    }
    
    // Also make some functions globally available
    window.showNotification = showNotification;
    window.performHealthCheck = performHealthCheck;
    
})();
