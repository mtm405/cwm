// Test script to run in browser console to check current issues
console.log('=== TESTING CURRENT LESSON ISSUES ===');

// Test 1: Check if lesson-manager.js loads without syntax errors
try {
    if (typeof LessonPageManager !== 'undefined') {
        console.log('✅ LessonPageManager class is available');
        
        // Test instantiation
        try {
            const testManager = new LessonPageManager();
            console.log('✅ LessonPageManager can be instantiated');
        } catch (e) {
            console.log('❌ Error instantiating LessonPageManager:', e.message);
        }
    } else {
        console.log('❌ LessonPageManager class not found');
    }
} catch (e) {
    console.log('❌ Error with LessonPageManager:', e.message);
}

// Test 2: Check ProgressTracker initialization
try {
    if (typeof ProgressTracker !== 'undefined') {
        console.log('✅ ProgressTracker class is available');
        
        // Test if init method exists (not initialize)
        const testTracker = new ProgressTracker('test', 'test-user');
        if (typeof testTracker.init === 'function') {
            console.log('✅ ProgressTracker.init() method exists');
        } else {
            console.log('❌ ProgressTracker.init() method not found');
            console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(testTracker)));
        }
        
        if (typeof testTracker.initialize === 'function') {
            console.log('⚠️  ProgressTracker.initialize() method exists (deprecated)');
        }
    } else {
        console.log('❌ ProgressTracker class not found');
    }
} catch (e) {
    console.log('❌ Error with ProgressTracker:', e.message);
}

// Test 3: Check if window objects are properly initialized
console.log('Window objects check:');
console.log('- window.lessonPageManager:', typeof window.lessonPageManager);
console.log('- window.progressTracker:', typeof window.progressTracker);
console.log('- window.contentRenderer:', typeof window.contentRenderer);
console.log('- window.gamificationManager:', typeof window.gamificationManager);

// Test 4: Check lesson data availability  
try {
    if (typeof lessonData !== 'undefined') {
        console.log('✅ lessonData is available');
        console.log('- Lesson ID:', lessonData.id);
        console.log('- Lesson Title:', lessonData.title);
        console.log('- Has subtopics:', !!lessonData.subtopics);
        console.log('- Subtopics type:', typeof lessonData.subtopics);
        if (lessonData.subtopics) {
            console.log('- Subtopics:', lessonData.subtopics);
        }
    } else {
        console.log('❌ lessonData not found');
    }
} catch (e) {
    console.log('❌ Error accessing lessonData:', e.message);
}

// Test 5: Check template elements
const elements = {
    '.lesson-container': document.querySelector('.lesson-container'),
    '.subtopic-tabs': document.querySelector('.subtopic-tabs'),
    '#lesson-content-container': document.getElementById('lesson-content-container'),
    '#lesson-progress-bar': document.getElementById('lesson-progress-bar'),
    '.subtopic-tab': document.querySelectorAll('.subtopic-tab')
};

console.log('DOM Elements check:');
Object.entries(elements).forEach(([selector, element]) => {
    if (element && element.length !== undefined) {
        // NodeList
        console.log(`- ${selector}: ✅ Found ${element.length} elements`);
    } else if (element) {
        // Single element
        console.log(`- ${selector}: ✅ Found`);
    } else {
        console.log(`- ${selector}: ❌ Not found`);
    }
});

// Test 6: Check console errors
console.log('Checking for JavaScript errors...');
setTimeout(() => {
    console.log('=== CONSOLE ERROR CHECK COMPLETE ===');
}, 1000);

// Test 7: Try to manually trigger functions
console.log('Testing function availability:');
try {
    if (typeof renderLessonContent === 'function') {
        console.log('✅ renderLessonContent function available');
    } else {
        console.log('❌ renderLessonContent function not available');
    }
    
    if (typeof runCode === 'function') {
        console.log('✅ runCode function available');
    } else {
        console.log('❌ runCode function not available');
    }
    
    if (typeof switchSubtopic === 'function') {
        console.log('✅ switchSubtopic function available');
    } else {
        console.log('❌ switchSubtopic function not available');
    }
} catch (e) {
    console.log('❌ Error checking functions:', e.message);
}

console.log('=== TEST COMPLETE ===');
