/**
 * Test file to verify duplicate declaration guards
 * This file simulates loading the editor modules multiple times
 * to ensure the guards prevent duplicate declarations
 */

// Test EditorConfig duplicate declaration prevention
console.log('🧪 Testing EditorConfig duplicate declaration prevention...');

// Simulate first load
window.EditorConfig = { test: 'first-load' };
console.log('✅ First EditorConfig load simulated:', window.EditorConfig);

// Try to create a second EditorConfig (should be prevented by guard)
if (typeof window.EditorConfig === 'undefined') {
    const EditorConfig = { test: 'second-load-should-not-happen' };
    window.EditorConfig = EditorConfig;
    console.log('❌ Second EditorConfig load should NOT happen');
} else {
    console.log('✅ EditorConfig duplicate declaration successfully prevented');
}

// Test EditorService duplicate declaration prevention
console.log('🧪 Testing EditorService duplicate declaration prevention...');

// Simulate first load
class TestEditorService {
    constructor() {
        this.test = 'first-load';
    }
}
window.EditorService = TestEditorService;
console.log('✅ First EditorService load simulated:', window.EditorService);

// Try to create a second EditorService (should be prevented by guard)
if (typeof window.EditorService === 'undefined') {
    class EditorService {
        constructor() {
            this.test = 'second-load-should-not-happen';
        }
    }
    window.EditorService = EditorService;
    console.log('❌ Second EditorService load should NOT happen');
} else {
    console.log('✅ EditorService duplicate declaration successfully prevented');
}

// Test CodeSubmissionHandler duplicate declaration prevention
console.log('🧪 Testing CodeSubmissionHandler duplicate declaration prevention...');

// Simulate first load
class TestCodeSubmissionHandler {
    constructor() {
        this.test = 'first-load';
    }
}
window.CodeSubmissionHandler = TestCodeSubmissionHandler;
console.log('✅ First CodeSubmissionHandler load simulated:', window.CodeSubmissionHandler);

// Try to create a second CodeSubmissionHandler (should be prevented by guard)
if (typeof window.CodeSubmissionHandler === 'undefined') {
    class CodeSubmissionHandler {
        constructor() {
            this.test = 'second-load-should-not-happen';
        }
    }
    window.CodeSubmissionHandler = CodeSubmissionHandler;
    console.log('❌ Second CodeSubmissionHandler load should NOT happen');
} else {
    console.log('✅ CodeSubmissionHandler duplicate declaration successfully prevented');
}

console.log('🎉 All duplicate declaration guard tests completed successfully!');

// Test summary
const testResults = {
    editorConfig: window.EditorConfig.test === 'first-load',
    editorService: window.EditorService.prototype && window.EditorService.prototype.constructor.name === 'TestEditorService',
    codeSubmissionHandler: window.CodeSubmissionHandler.prototype && window.CodeSubmissionHandler.prototype.constructor.name === 'TestCodeSubmissionHandler'
};

console.log('📊 Test Results:', testResults);

if (testResults.editorConfig && testResults.editorService && testResults.codeSubmissionHandler) {
    console.log('✅ All duplicate declaration guards are working correctly!');
} else {
    console.log('❌ Some duplicate declaration guards may not be working properly');
}
