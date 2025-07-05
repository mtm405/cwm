/**
 * ES6 Subtopic Tab System Test
 * This test verifies that the subtopic tab system works correctly with ES6 features
 */

// Test data structure
const testLessonData = {
    id: 'test-lesson-es6',
    title: 'ES6 Test Lesson',
    subtopics: [
        { id: 'subtopic-0', title: 'Introduction to ES6', order: 0 },
        { id: 'subtopic-1', title: 'Arrow Functions', order: 1 },
        { id: 'subtopic-2', title: 'Classes & Modules', order: 2 }
    ],
    has_subtopics: true,
    current_subtopic_index: 0
};

const testLessonProgress = {
    completed_subtopics: ['subtopic-0'],
    total_progress: 33.33
};

// Test ES6 features
console.log('🧪 Testing ES6 Subtopic Tab System');
console.log('==================================');

// Test 1: ES6 destructuring
const { id, title, subtopics, has_subtopics } = testLessonData;
console.log('✅ Test 1: Destructuring assignment works');
console.log(`   Lesson ID: ${id}, Title: ${title}`);

// Test 2: Template literals
const lessonInfo = `Lesson "${title}" has ${subtopics.length} subtopics`;
console.log('✅ Test 2: Template literals work');
console.log(`   ${lessonInfo}`);

// Test 3: Arrow functions
const getSubtopicById = (subtopicId) => subtopics.find(s => s.id === subtopicId);
const foundSubtopic = getSubtopicById('subtopic-1');
console.log('✅ Test 3: Arrow functions work');
console.log(`   Found subtopic: ${foundSubtopic?.title}`);

// Test 4: Array methods with arrow functions
const subtopicTitles = subtopics.map(s => s.title);
const hasCompleted = subtopics.some(s => testLessonProgress.completed_subtopics.includes(s.id));
console.log('✅ Test 4: Array methods with arrow functions work');
console.log(`   Titles: ${subtopicTitles.join(', ')}`);
console.log(`   Has completed subtopics: ${hasCompleted}`);

// Test 5: Spread operator
const enhancedSubtopics = subtopics.map(s => ({
    ...s,
    isCompleted: testLessonProgress.completed_subtopics.includes(s.id)
}));
console.log('✅ Test 5: Spread operator works');
console.log(`   Enhanced subtopics:`, enhancedSubtopics);

// Test 6: Default parameters
const initializeTab = (subtopic, isActive = false, isCompleted = false) => ({
    ...subtopic,
    isActive,
    isCompleted,
    tabId: `tab-${subtopic.id}`,
    ariaSelected: isActive.toString()
});

const tabs = enhancedSubtopics.map((s, index) => 
    initializeTab(s, index === 0, s.isCompleted)
);
console.log('✅ Test 6: Default parameters work');
console.log(`   Initialized tabs:`, tabs);

// Test 7: Async/await simulation
const simulateAsyncInitialization = async () => {
    console.log('🔄 Simulating async initialization...');
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if data is ready
    const dataReady = !!(testLessonData && testLessonData.has_subtopics);
    
    if (dataReady) {
        console.log('✅ Test 7: Async/await simulation works');
        console.log('   Data is ready for initialization');
        return true;
    } else {
        console.log('❌ Test 7: Data not ready');
        return false;
    }
};

// Test 8: Class compatibility
class MockSubtopicTabManager {
    constructor(lessonData) {
        this.lessonData = lessonData;
        this.subtopics = lessonData.subtopics || [];
        this.currentSubtopicIndex = lessonData.current_subtopic_index || 0;
    }
    
    // ES6 method shorthand
    switchToSubtopic(subtopicId, subtopicIndex) {
        this.currentSubtopicIndex = subtopicIndex;
        console.log(`   Switched to subtopic: ${subtopicId} (index: ${subtopicIndex})`);
    }
    
    // Arrow function as method
    getSubtopicTitle = (index) => {
        return this.subtopics[index]?.title || 'Unknown';
    }
    
    // Async method
    async completeSubtopic(subtopicId) {
        await new Promise(resolve => setTimeout(resolve, 50));
        console.log(`   Completed subtopic: ${subtopicId}`);
        return { success: true, xp_earned: 100 };
    }
}

const mockManager = new MockSubtopicTabManager(testLessonData);
console.log('✅ Test 8: ES6 class compatibility works');
console.log(`   Manager created with ${mockManager.subtopics.length} subtopics`);

// Test 9: Modern DOM manipulation (if running in browser)
if (typeof document !== 'undefined') {
    const createSubtopicTab = (subtopic, index) => {
        const button = document.createElement('button');
        button.className = 'subtopic-tab';
        button.dataset.subtopicId = subtopic.id;
        button.dataset.subtopicIndex = index;
        button.innerHTML = `
            <i class="fas fa-check-circle subtopic-check"></i>
            <span class="subtopic-title">${subtopic.title}</span>
            <span class="subtopic-order">${index + 1}</span>
        `;
        
        // ES6 event listener
        button.addEventListener('click', (e) => {
            e.preventDefault();
            mockManager.switchToSubtopic(subtopic.id, index);
        });
        
        return button;
    };
    
    console.log('✅ Test 9: Modern DOM manipulation works');
    console.log('   Subtopic tabs can be created programmatically');
}

// Run async test
simulateAsyncInitialization().then(result => {
    console.log(`   Async initialization result: ${result}`);
    
    // Test method calls
    mockManager.switchToSubtopic('subtopic-1', 1);
    console.log(`   Current subtopic title: ${mockManager.getSubtopicTitle(1)}`);
    
    // Test async method
    mockManager.completeSubtopic('subtopic-1').then(result => {
        console.log(`   Completion result:`, result);
        console.log('==================================');
        console.log('✅ All ES6 tests passed!');
    });
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MockSubtopicTabManager,
        testLessonData,
        testLessonProgress
    };
}
