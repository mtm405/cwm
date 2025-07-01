// =============================================================================
// 🖥️ BROWSER DIAGNOSTIC SCRIPT - Code with Morais
// Paste this into browser console on lesson page
// =============================================================================

console.log('🔍 LESSON SYSTEM BROWSER DIAGNOSTICS');
console.log('=====================================');

// 1. Check global objects
console.log('\n📦 GLOBAL OBJECTS CHECK:');
console.log('Window objects:', {
    'LessonIntegrationManager': typeof window.LessonIntegrationManager,
    'ContentBlockRenderer': typeof window.ContentBlockRenderer,
    'ProgressTracker': typeof window.ProgressTracker,
    'QuizSystem': typeof window.QuizSystem,
    'lessonIntegration': typeof window.lessonIntegration,
    'initializeLessonIntegration': typeof window.initializeLessonIntegration
});

// 2. Check lesson data
console.log('\n📖 LESSON DATA CHECK:');
console.log('Lesson ID:', window.lessonId || document.body.dataset.lessonId || 'NOT FOUND');
console.log('Lesson Data:', window.lessonData || 'NOT FOUND');
console.log('Current User:', window.currentUser || 'NOT FOUND');

// 3. Check DOM elements
console.log('\n🏗️ DOM ELEMENTS CHECK:');
const elements = {
    'lesson-container': document.querySelector('.lesson-container'),
    'lesson-content': document.querySelector('.lesson-content'),
    'progress-bar': document.querySelector('.progress-fill'),
    'content-blocks': document.querySelectorAll('.content-block')
};

Object.entries(elements).forEach(([name, element]) => {
    console.log(`${name}:`, element ? '✅ FOUND' : '❌ MISSING');
});

// 4. Check script loading
console.log('\n📜 SCRIPT LOADING CHECK:');
const scripts = Array.from(document.scripts).map(s => s.src).filter(s => s.includes('lesson') || s.includes('quiz'));
console.log('Lesson-related scripts:', scripts);

// 5. Check API connectivity
console.log('\n📡 API CONNECTIVITY CHECK:');
const lessonId = window.lessonId || document.body.dataset.lessonId || 'python-basics-01';

fetch(`/api/lessons/${lessonId}`)
    .then(response => {
        console.log('Lesson API Response:', response.status, response.ok ? '✅ OK' : '❌ FAILED');
        return response.json();
    })
    .then(data => {
        console.log('Lesson Data Structure:', {
            hasTitle: !!data.title,
            hasBlocks: !!data.blocks,
            blocksCount: data.blocks?.length || 0,
            hasContent: !!data.content
        });
    })
    .catch(error => {
        console.error('❌ API Error:', error);
    });

// 6. Test initialization
console.log('\n🚀 INITIALIZATION TEST:');
if (typeof window.initializeLessonIntegration === 'function') {
    console.log('✅ initializeLessonIntegration function available');
    if (lessonId && !window.lessonIntegration) {
        console.log('🔄 Attempting manual initialization...');
        try {
            window.initializeLessonIntegration(lessonId);
            console.log('✅ Manual initialization triggered');
        } catch (error) {
            console.error('❌ Manual initialization failed:', error);
        }
    }
} else {
    console.error('❌ initializeLessonIntegration function missing');
}

// 7. Check event listeners
console.log('\n🎧 EVENT LISTENERS CHECK:');
const events = ['blockCompleted', 'lessonReady', 'progressUpdated'];
events.forEach(eventName => {
    console.log(`Testing ${eventName} event...`);
    document.addEventListener(eventName, (e) => {
        console.log(`✅ ${eventName} event fired:`, e.detail);
    });
});

console.log('\n🏁 DIAGNOSTICS COMPLETE - Check results above');
