/**
 * Module Loader Patch - Fix duplication errors
 * 
 * This patch prevents errors from duplicate class declarations
 * by adding guards to module loading.
 */

(function() {
    // Attempt to get existing ModuleLoader instance
    const moduleLoader = window.CwMModuleLoader || window.moduleLoader;
    
    if (!moduleLoader) {
        console.warn('⚠️ ModuleLoader not found, patch cannot be applied');
        return;
    }
    
    console.log('🔧 Applying ModuleLoader patch...');
    
    // List of classes to add protection for
    const classesToProtect = [
        'BaseComponent', 
        'EditorService', 
        'EditorConfig', 
        'CodeSubmissionHandler',
        'LessonCore', 
        'InteractiveEditor', 
        'ModalManager',
        'QuizEngine',
        'QuizController',
        'QuizState',
        'TrueFalseRenderer',
        'MultipleChoiceRenderer',
        'FillBlankRenderer'
    ];
    
    // Store original _loadScript method
    const originalLoadScript = moduleLoader._loadScript;
    
    // Override _loadScript to add protection
    moduleLoader._loadScript = async function(url, options = {}) {
        // Check if the script is for a protected class
        const protectedClass = classesToProtect.find(className => 
            url.toLowerCase().includes(className.toLowerCase())
        );
        
        if (protectedClass) {
            console.log(`🛡️ Adding protection for ${protectedClass} in ${url}`);
            
            // If class already exists, don't load the script again
            if (window[protectedClass]) {
                console.log(`✅ ${protectedClass} already exists, skipping script load`);
                return { success: true };
            }
            
            // Otherwise, inject a guard script before loading
            const guardScript = document.createElement('script');
            guardScript.textContent = `
                // Guard for ${protectedClass}
                window.__originalDefineProperty = Object.defineProperty;
                Object.defineProperty = function(obj, prop, descriptor) {
                    if (prop === '${protectedClass}' && obj === window && window['${protectedClass}']) {
                        console.log('🛡️ Prevented redeclaration of ${protectedClass}');
                        return obj;
                    }
                    return window.__originalDefineProperty(obj, prop, descriptor);
                };
            `;
            document.head.appendChild(guardScript);
            
            // Call original method
            const result = await originalLoadScript.call(this, url, options);
            
            // Restore original defineProperty
            const restoreScript = document.createElement('script');
            restoreScript.textContent = `
                // Restore original defineProperty
                if (window.__originalDefineProperty) {
                    Object.defineProperty = window.__originalDefineProperty;
                    delete window.__originalDefineProperty;
                }
            `;
            document.head.appendChild(restoreScript);
            
            return result;
        }
        
        // For non-protected classes, just use the original method
        return await originalLoadScript.call(this, url, options);
    };
    
    console.log('✅ ModuleLoader patch applied successfully');
})();
