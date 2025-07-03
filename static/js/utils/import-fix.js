/**
 * Fix missing imports utility for Code with Morais
 * 
 * This script adds missing script imports to the page dynamically
 * to resolve reference errors without having to modify HTML templates
 */

(function() {
    console.log('🔧 Starting import fix utility...');
    
    // Check if already run
    if (window._importFixRun) {
        console.log('⚠️ Import fix already applied');
        return;
    }
    
    // Track missing imports
    const missingImports = [];
    
    // Check for ThemeManager
    if (typeof ThemeManager === 'undefined') {
        missingImports.push({
            name: 'ThemeManager',
            url: '/static/js/modules/theme-manager.js'
        });
    }
    
    // Check for Firebase test utility
    if (typeof testFirebaseIntegration === 'undefined' && 
        window.location.pathname.includes('/lesson/')) {
        missingImports.push({
            name: 'Firebase Test Utility',
            url: '/static/js/utils/firebase-test.js'
        });
    }
    
    // Check for other critical modules based on page type
    if (document.body.dataset.page === 'lesson' || 
        window.location.pathname.includes('/lesson/')) {
        
        // Check for lesson-specific modules
        if (typeof InitializationQueue === 'undefined') {
            missingImports.push({
                name: 'Initialization Queue',
                url: '/static/js/modules/initializationQueue.js'
            });
        }
        
        if (typeof DataStructureNormalizer === 'undefined') {
            missingImports.push({
                name: 'Data Structure Normalizer',
                url: '/static/js/utils/dataStructureNormalizer.js'
            });
        }
    }
    
    // Load missing imports
    if (missingImports.length > 0) {
        console.log(`🔄 Loading ${missingImports.length} missing imports...`);
        
        const loadPromises = missingImports.map(module => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = module.url;
                script.async = true;
                
                script.onload = () => {
                    console.log(`✅ Loaded: ${module.name}`);
                    resolve(module);
                };
                
                script.onerror = () => {
                    console.error(`❌ Failed to load: ${module.name}`);
                    reject(new Error(`Failed to load ${module.name}`));
                };
                
                document.head.appendChild(script);
            });
        });
        
        // Wait for all imports to load
        Promise.all(loadPromises)
            .then(modules => {
                console.log(`✅ All ${modules.length} modules loaded successfully`);
                
                // Fix system status endpoint
                fixSystemStatusEndpoint();
                
                // Retry initialization if needed
                if (typeof window.mainApp !== 'undefined' && !window.mainApp.initialized) {
                    console.log('🔄 Retrying application initialization...');
                    window.mainApp.init();
                }
                
                // Retry lesson initialization if needed
                if (document.body.dataset.page === 'lesson' && typeof initializeLesson === 'function') {
                    console.log('🔄 Retrying lesson initialization...');
                    initializeLesson();
                }
            })
            .catch(error => {
                console.error('❌ Error loading required modules:', error);
            });
    } else {
        console.log('✅ All required imports are present');
    }
    
    // Fix system status endpoint
    function fixSystemStatusEndpoint() {
        // Monkey patch the checkFirebaseAvailability method
        if (window.mainApp && window.mainApp.checkFirebaseAvailability) {
            const originalMethod = window.mainApp.checkFirebaseAvailability;
            
            window.mainApp.checkFirebaseAvailability = async function() {
                try {
                    // Use relative URL instead of absolute
                    const response = await fetch('/api/system-status');
                    const data = await response.json();
                    window.mainApp.firebaseAvailable = data.firebase_available === true;
                    console.log(`🔥 Firebase availability: ${window.mainApp.firebaseAvailable}`);
                    
                    // Rest of the method remains the same...
                    // Add status indicator to the DOM
                    if (!window.mainApp.firebaseAvailable) {
                        console.warn('⚠️ Firebase is not available - using mock data');
                    }
                } catch (error) {
                    console.error('Error checking Firebase availability:', error);
                    window.mainApp.firebaseAvailable = false;
                    
                    // Create mock response
                    return {
                        status: 'online',
                        environment: 'development',
                        firebase_available: false,
                        server_time: new Date().toISOString(),
                        version: '2.0.0',
                        maintenance_mode: false
                    };
                }
            };
            
            console.log('✅ Fixed system status endpoint');
        }
    }
    
    // Mark as run
    window._importFixRun = true;
    
})();
