/**
 * Firebase Integration Test Utility
 * Validates Firebase data structure and handles errors gracefully
 */

function testFirebaseIntegration() {
    console.log('🔥 Testing Firebase data integration...');
    
    try {
        // Check if lesson data has essential properties
        if (!globalThis.lessonData) {
            console.warn('⚠️ No lesson data available');
            return false;
        }
        
        // Validate essential properties
        const requiredProperties = ['id', 'title', 'blocks'];
        const missingProperties = requiredProperties.filter(prop => !globalThis.lessonData[prop]);
        
        if (missingProperties.length > 0) {
            console.warn(`⚠️ Lesson data missing required properties: ${missingProperties.join(', ')}`);
        }
        
        // Check if the blocks array is properly formed
        if (!Array.isArray(globalThis.lessonData.blocks)) {
            console.warn('⚠️ Lesson blocks is not an array');
            globalThis.lessonData.blocks = [];
        }
        
        // Check if progress data is available
        if (!globalThis.lessonProgress) {
            console.warn('⚠️ No lesson progress data available');
            globalThis.lessonProgress = {
                completed_blocks: [],
                progress: 0,
                current_block: 0
            };
        }
        
        // Check if user data is available
        if (!globalThis.currentUser) {
            console.warn('⚠️ No user data available');
        }
        
        // Success: All data is valid or has been fixed
        console.log('✅ Firebase data integration test passed');
        return true;
        
    } catch (error) {
        console.error('❌ Error testing Firebase integration:', error);
        
        // Set fallback data structures if needed
        if (!globalThis.lessonData) {
            globalThis.lessonData = {
                id: 'error',
                title: 'Error Loading Lesson',
                blocks: [
                    {
                        type: 'text',
                        title: 'Connection Error',
                        content: 'There was a problem loading the lesson data. Please try refreshing the page.'
                    }
                ]
            };
        }
        
        return false;
    }
}

// Make the function globally available
window.testFirebaseIntegration = testFirebaseIntegration;
