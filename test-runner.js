/**
 * Test Runner - Execute LessonSystemTest in Node.js environment
 */
import { LessonSystemTest } from './static/js/core/LessonSystemTest.js';

// Mock browser environment for testing
global.globalThis = global;
global.window = global;
global.document = {
    readyState: 'complete',
    getElementById: () => null,
    querySelectorAll: () => [],
    createElement: () => ({}),
    addEventListener: () => {}
};

// Mock console methods if needed
global.console = console;

// Run the tests
async function runTests() {
    try {
        console.log('🚀 Starting LessonSystemTest suite...\n');
        const results = await LessonSystemTest.runAllTests();
        
        console.log('\n🏁 Test execution completed.');
        process.exit(results.every(r => r.passed) ? 0 : 1);
    } catch (error) {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    }
}

runTests();
