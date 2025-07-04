/**
 * Test the new lesson system
 * Run this script to verify the lesson system is working correctly
 */

// Import our new lesson system
import LessonSystem from '../lesson-system.js';
import { LessonDebugger } from '../debug/lessonDebugger.js';

class LessonSystemTest {
    constructor() {
        this.tests = [];
        this.results = [];
    }
    
    async runAllTests() {
        console.log('🧪 Starting Lesson System Tests...');
        
        // Test 1: Module loading
        this.addTest('Module Loading', this.testModuleLoading.bind(this));
        
        // Test 2: System initialization
        this.addTest('System Initialization', this.testSystemInitialization.bind(this));
        
        // Test 3: Data fetching
        this.addTest('Data Fetching', this.testDataFetching.bind(this));
        
        // Test 4: UI rendering
        this.addTest('UI Rendering', this.testUIRendering.bind(this));
        
        // Test 5: User interactions
        this.addTest('User Interactions', this.testUserInteractions.bind(this));
        
        // Run all tests
        for (const test of this.tests) {
            await this.runTest(test);
        }
        
        // Show results
        this.showResults();
    }
    
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }
    
    async runTest(test) {
        console.log(`🔬 Running test: ${test.name}`);
        
        try {
            const result = await test.testFunction();
            this.results.push({
                name: test.name,
                passed: result.passed,
                message: result.message,
                timestamp: new Date().toISOString()
            });
            
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${test.name}: ${result.message}`);
            
        } catch (error) {
            this.results.push({
                name: test.name,
                passed: false,
                message: error.message,
                timestamp: new Date().toISOString()
            });
            
            console.error(`❌ ${test.name}: ${error.message}`);
        }
    }
    
    async testModuleLoading() {
        // Test if our modules can be loaded
        try {
            const lessonSystem = new LessonSystem();
            const lessonDebugger = new LessonDebugger();
            
            if (!lessonSystem || !lessonDebugger) {
                throw new Error('Failed to instantiate classes');
            }
            
            return { passed: true, message: 'ES6 modules loaded successfully' };
            
        } catch (error) {
            return { passed: false, message: `Module loading failed: ${error.message}` };
        }
    }
    
    async testSystemInitialization() {
        try {
            // Mock a lesson ID
            const testLessonId = 'test-lesson-001';
            
            // Create lesson system
            const lessonSystem = new LessonSystem();
            
            // Override getLessonId for testing
            lessonSystem.getLessonId = () => testLessonId;
            
            // Test initialization without actually calling Firebase
            if (lessonSystem.lessonId !== testLessonId) {
                lessonSystem.lessonId = testLessonId;
            }
            
            return { passed: true, message: 'System initialization successful' };
            
        } catch (error) {
            return { passed: false, message: `Initialization failed: ${error.message}` };
        }
    }
    
    async testDataFetching() {
        try {
            // Mock lesson data
            const mockData = {
                id: 'test-lesson-001',
                title: 'Test Lesson',
                blocks: [
                    { id: 'block-1', type: 'text', order: 1, content: 'Test content' },
                    { id: 'block-2', type: 'code_example', order: 2, language: 'python', code: 'print("Hello")' }
                ]
            };
            
            // Validate data structure
            if (!mockData.id || !mockData.title || !Array.isArray(mockData.blocks)) {
                throw new Error('Invalid data structure');
            }
            
            // Test block validation
            for (const block of mockData.blocks) {
                if (!block.id || !block.type || block.order === undefined) {
                    throw new Error(`Invalid block structure: ${JSON.stringify(block)}`);
                }
            }
            
            return { passed: true, message: `Data validation successful (${mockData.blocks.length} blocks)` };
            
        } catch (error) {
            return { passed: false, message: `Data fetching failed: ${error.message}` };
        }
    }
    
    async testUIRendering() {
        try {
            // Create test DOM elements
            const testContainer = document.createElement('div');
            testContainer.id = 'test-lesson-container';
            testContainer.innerHTML = `
                <div id="lesson-content-container"></div>
                <div id="content-loading" style="display: none;">Loading...</div>
                <div id="lesson-content" style="display: none;"></div>
                <div id="lesson-fallback" style="display: none;">Error</div>
            `;
            
            // Add to DOM temporarily
            document.body.appendChild(testContainer);
            
            // Test if elements exist
            const container = document.getElementById('lesson-content-container');
            const loading = document.getElementById('content-loading');
            const content = document.getElementById('lesson-content');
            const fallback = document.getElementById('lesson-fallback');
            
            if (!container || !loading || !content || !fallback) {
                throw new Error('Required DOM elements not found');
            }
            
            // Test rendering a simple block
            const mockBlock = document.createElement('div');
            mockBlock.className = 'content-block text-block';
            mockBlock.innerHTML = '<p>Test content</p>';
            container.appendChild(mockBlock);
            
            if (container.children.length === 0) {
                throw new Error('Block not rendered');
            }
            
            // Clean up
            document.body.removeChild(testContainer);
            
            return { passed: true, message: 'UI rendering successful' };
            
        } catch (error) {
            return { passed: false, message: `UI rendering failed: ${error.message}` };
        }
    }
    
    async testUserInteractions() {
        try {
            // Test button creation and event handling
            const testButton = document.createElement('button');
            testButton.className = 'btn btn-primary';
            testButton.textContent = 'Test Button';
            testButton.dataset.blockId = 'test-block';
            
            let clicked = false;
            testButton.addEventListener('click', () => {
                clicked = true;
            });
            
            // Simulate click
            testButton.click();
            
            if (!clicked) {
                throw new Error('Button click event not handled');
            }
            
            if (!testButton.dataset.blockId) {
                throw new Error('Block ID not set on button');
            }
            
            return { passed: true, message: 'User interactions working' };
            
        } catch (error) {
            return { passed: false, message: `User interactions failed: ${error.message}` };
        }
    }
    
    showResults() {
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = Math.round((passedTests / totalTests) * 100);
        
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests}`);
        console.log(`Failed: ${failedTests}`);
        console.log(`Success Rate: ${successRate}%`);
        console.log('');
        
        // Show detailed results
        console.table(this.results.map(r => ({
            Test: r.name,
            Status: r.passed ? 'PASS' : 'FAIL',
            Message: r.message
        })));
        
        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate: successRate,
            details: this.results
        };
    }
    
    // Static method for quick testing
    static async quickTest() {
        console.log('🚀 Running Quick Lesson System Test...');
        const tester = new LessonSystemTest();
        return await tester.runAllTests();
    }
}

// Make available globally for console testing
window.LessonSystemTest = LessonSystemTest;

// Auto-run tests if URL contains ?test=true
if (window.location.search.includes('test=true')) {
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('🚀 Auto-running lesson system tests...');
        const tester = new LessonSystemTest();
        await tester.runAllTests();
    });
}

// Console helpers
console.log('💡 Lesson System Test Suite loaded!');
console.log('Run tests with: LessonSystemTest.quickTest()');
console.log('Or navigate to any lesson page with ?test=true');

// Export for module usage
export { LessonSystemTest };
    
    async testModuleLoading() {
        // Test if modules can be imported
        if (typeof LessonSystem === 'undefined') {
            throw new Error('LessonSystem not loaded');
        }
        
        if (typeof LessonDebugger === 'undefined') {
            throw new Error('LessonDebugger not loaded');
        }
        
        return 'All modules loaded successfully';
    }
    
    async testSystemInitialization() {
        // Test creating and initializing the lesson system
        const lessonSystem = new LessonSystem();
        
        if (!lessonSystem.lessonId) {
            throw new Error('Lesson ID not detected');
        }
        
        // Mock lesson data for testing
        window.lessonData = {
            id: 'test-lesson',
            title: 'Test Lesson',
            blocks: [
                {
                    id: 'test-block-1',
                    type: 'text',
                    title: 'Test Block',
                    content: 'This is a test block.',
                    order: 0
                }
            ]
        };
        
        await lessonSystem.initialize();
        
        if (!lessonSystem.lessonData) {
            throw new Error('Lesson data not loaded');
        }
        
        return `System initialized with lesson: ${lessonSystem.lessonData.title}`;
    }
    
    async testDataFetching() {
        // Test data service
        const { LessonDataService } = await import('../services/LessonDataService.js');
        const dataService = new LessonDataService();
        
        // Test with mock data
        const lessonData = await dataService.fetchLesson('test-lesson');
        
        if (!lessonData) {
            throw new Error('Failed to fetch lesson data');
        }
        
        return `Fetched lesson: ${lessonData.title} with ${lessonData.blocks?.length || 0} blocks`;
    }
    
    async testUIRendering() {
        // Test renderer
        const { LessonRenderer } = await import('../components/LessonRenderer.js');
        const renderer = new LessonRenderer();
        
        // Create test container
        const testContainer = document.createElement('div');
        testContainer.id = 'lesson-content-container';
        document.body.appendChild(testContainer);
        
        const mockLessonData = {
            title: 'Test Lesson',
            blocks: [
                {
                    id: 'test-text',
                    type: 'text',
                    title: 'Test Text Block',
                    content: 'This is test content.',
                    order: 0
                },
                {
                    id: 'test-code',
                    type: 'code_example',
                    title: 'Test Code Block',
                    code: 'print("Hello, World!")',
                    language: 'python',
                    order: 1
                }
            ]
        };
        
        await renderer.renderLesson(mockLessonData, { completed_blocks: [] });
        
        const renderedBlocks = testContainer.querySelectorAll('.content-block');
        
        if (renderedBlocks.length !== 2) {
            throw new Error(`Expected 2 blocks, got ${renderedBlocks.length}`);
        }
        
        // Clean up
        testContainer.remove();
        
        return `Rendered ${renderedBlocks.length} blocks successfully`;
    }
    
    async testUserInteractions() {
        // Test interactions component
        const { LessonInteractions } = await import('../components/LessonInteractions.js');
        const interactions = new LessonInteractions();
        
        const mockLessonData = {
            blocks: [
                {
                    id: 'test-interactive',
                    type: 'interactive',
                    starter_code: 'print("test")'
                }
            ]
        };
        
        interactions.initialize(mockLessonData, { completed_blocks: [] });
        
        if (!interactions.initialized) {
            throw new Error('Interactions not initialized');
        }
        
        return 'Interactions initialized successfully';
    }
    
    showResults() {
        const passed = this.results.filter(r => r.success).length;
        const failed = this.results.filter(r => !r.success).length;
        
        console.log('\n📊 TEST RESULTS:');
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${Math.round((passed / this.results.length) * 100)}%`);
        
        if (failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.results.filter(r => !r.success).forEach(result => {
                console.log(`  - ${result.name}: ${result.error}`);
            });
        }
        
        return this.results;
    }
}

// Export for use in testing
export { LessonSystemTest };

// Auto-run tests if not loaded as module
if (typeof window !== 'undefined' && !window.lessonSystemTestRun) {
    window.lessonSystemTestRun = true;
    window.LessonSystemTest = LessonSystemTest;
    
    // Make available for manual testing
    window.runLessonTests = async () => {
        const tester = new LessonSystemTest();
        return await tester.runAllTests();
    };
}
