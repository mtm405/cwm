/**
 * Core Utilities Module - ES6
 * Code with Morais - Essential utility functions for lesson system
 * 
 * This module now imports from the consolidated utils and re-exports
 * for ES6 module compatibility while maintaining backward compatibility
 */

// Import from consolidated utils
import { utils as consolidatedUtils } from '../utils.js';

// Re-export the consolidated utilities
export const utils = consolidatedUtils;

// Export default for ES6 modules
export default consolidatedUtils;

// Also make available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.utils = consolidatedUtils;
}

console.log('✅ Core utils module loaded (using consolidated utilities)');
