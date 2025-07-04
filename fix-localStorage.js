/**
 * Browser Console Fix Script
 * Run this in your browser's console to clear corrupted localStorage data
 */

// Clear corrupted localStorage data
console.log('🔧 Clearing corrupted localStorage data...');

// List of keys that might be corrupted
const keysToCheck = [
    'cwm_theme',
    'theme',
    'cwm_preferences',
    'preferences',
    'cwm_user',
    'user',
    'cwm_progress',
    'progress'
];

keysToCheck.forEach(key => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            console.log(`Found ${key}:`, item);
            
            // Check if it's corrupted JSON
            if (item.startsWith('{') || item.startsWith('[')) {
                try {
                    JSON.parse(item);
                    console.log(`✅ ${key} is valid JSON`);
                } catch (e) {
                    console.log(`❌ ${key} is corrupted JSON, removing...`);
                    localStorage.removeItem(key);
                }
            } else {
                console.log(`ℹ️ ${key} is a plain string:`, item);
            }
        }
    } catch (e) {
        console.error(`Error checking ${key}:`, e);
    }
});

// Set default theme if not present
if (!localStorage.getItem('cwm_theme')) {
    localStorage.setItem('cwm_theme', 'dark');
    console.log('✅ Set default theme to dark');
}

console.log('✅ localStorage cleanup complete');
console.log('🔄 Please refresh the page to see if the errors are resolved');
