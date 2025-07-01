/**
 * Frontend Validation Script
 * Run this in the browser console to check if all JS components are working
 */

console.log('🚀 Starting Frontend Validation...');

// 1. Check if all JS files are loaded
const jsChecks = [
    { name: 'LessonPageManager', obj: window.LessonPageManager },
    { name: 'ProgressTracker', obj: window.ProgressTracker },
    { name: 'ContentRenderer', obj: window.ContentRenderer }
];

console.log('\n📂 JavaScript File Loading Check:');
jsChecks.forEach(check => {
    if (check.obj) {
        console.log(`✅ ${check.name} loaded successfully`);
    } else {
        console.log(`❌ ${check.name} NOT loaded`);
    }
});

// 2. Check if lesson manager instance exists
console.log('\n🎛️ Lesson Manager Instance Check:');
if (window.lessonManager) {
    console.log('✅ lessonManager instance exists');
    console.log('Lesson ID:', window.lessonManager.lessonId);
    console.log('Lesson Data:', window.lessonManager.lessonData);
} else {
    console.log('❌ lessonManager instance NOT found');
}

// 3. Check if progress tracker instance exists
console.log('\n📊 Progress Tracker Instance Check:');
if (window.progressTracker) {
    console.log('✅ progressTracker instance exists');
    console.log('Progress Data:', window.progressTracker.progressData);
} else {
    console.log('❌ progressTracker instance NOT found');
}

// 4. Check DOM elements
console.log('\n🔍 DOM Elements Check:');
const domChecks = [
    { name: 'Lesson Content Container', selector: '#lesson-content' },
    { name: 'Progress Bar', selector: '#progress-fill' },
    { name: 'Subtopic Tabs', selector: '.subtopic-tab' },
    { name: 'Code Blocks', selector: '.code-block' }
];

domChecks.forEach(check => {
    const element = document.querySelector(check.selector);
    if (element) {
        console.log(`✅ ${check.name} found`);
    } else {
        console.log(`❌ ${check.name} NOT found (${check.selector})`);
    }
});

// 5. Check console errors
console.log('\n⚠️ Console Error Check:');
console.log('Check the browser console for any red error messages');

// 6. Test Firebase connectivity (if available)
console.log('\n🔥 Firebase Connectivity Check:');
if (window.firebase) {
    console.log('✅ Firebase SDK loaded');
} else {
    console.log('❌ Firebase SDK NOT loaded');
}

// 7. Check if lesson content is rendered
console.log('\n📄 Content Rendering Check:');
const contentContainer = document.getElementById('lesson-content');
if (contentContainer && contentContainer.children.length > 0) {
    console.log(`✅ Content rendered (${contentContainer.children.length} elements)`);
} else {
    console.log('❌ No content rendered in lesson container');
}

console.log('\n✅ Frontend Validation Complete!');
console.log('📋 Summary: Check the results above for any ❌ items that need fixing');
