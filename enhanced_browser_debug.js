// =============================================================================
// 🖥️ ENHANCED BROWSER DEBUG SCRIPT - Code with Morais
// Copy and paste this into browser console on the lesson page
// =============================================================================

console.log('🔍 ENHANCED LESSON SYSTEM BROWSER DIAGNOSTICS');
console.log('===============================================');

// 1. Check all JavaScript objects and functions
console.log('\n📦 JAVASCRIPT OBJECTS & FUNCTIONS CHECK:');
const jsObjects = {
    'window.LessonIntegrationManager': typeof window.LessonIntegrationManager,
    'window.ContentBlockRenderer': typeof window.ContentBlockRenderer,
    'window.ProgressTracker': typeof window.ProgressTracker,
    'window.QuizSystem': typeof window.QuizSystem,
    'window.GamificationManager': typeof window.GamificationManager,
    'window.LessonPageManager': typeof window.LessonPageManager,
    'window.lessonIntegration': typeof window.lessonIntegration,
    'window.lessonPageManager': typeof window.lessonPageManager,
    'window.progressTracker': typeof window.progressTracker,
    'window.gamificationManager': typeof window.gamificationManager,
    'window.initializeLessonIntegration': typeof window.initializeLessonIntegration
};

Object.entries(jsObjects).forEach(([name, type]) => {
    const status = type !== 'undefined' ? '✅' : '❌';
    console.log(`${status} ${name}: ${type}`);
});

// 2. Check lesson data in detail
console.log('\n📖 LESSON DATA DETAILED CHECK:');
const lessonId = window.lessonId || document.body.dataset.lessonId || 'NOT FOUND';
console.log('Lesson ID:', lessonId);

// Check if lessonData is in window or script tag
let lessonData = window.lessonData;
if (!lessonData) {
    // Try to find it in script tags
    const scripts = Array.from(document.scripts);
    for (const script of scripts) {
        if (script.innerHTML.includes('lessonData = ')) {
            const match = script.innerHTML.match(/lessonData = ({.*?});/s);
            if (match) {
                try {
                    lessonData = JSON.parse(match[1]);
                    console.log('📊 Found lessonData in script tag');
                    break;
                } catch (e) {
                    console.error('Failed to parse lessonData:', e);
                }
            }
        }
    }
}

if (lessonData) {
    console.log('✅ Lesson data found:', {
        id: lessonData.id,
        title: lessonData.title,
        subtopics: lessonData.subtopics,
        subtopicsType: Array.isArray(lessonData.subtopics) ? 'array' : typeof lessonData.subtopics,
        subtopicsCount: lessonData.subtopics?.length || 0,
        hasBlocks: !!lessonData.blocks,
        blocksCount: lessonData.blocks?.length || 0,
        hasContent: !!lessonData.content,
        contentLength: lessonData.content?.length || 0,
        codeExamplesCount: lessonData.code_examples?.length || 0,
        exercisesCount: lessonData.exercises?.length || 0
    });
    
    // Check subtopics structure
    if (lessonData.subtopics) {
        console.log('\n📋 SUBTOPICS ANALYSIS:');
        lessonData.subtopics.forEach((subtopic, index) => {
            console.log(`${index + 1}. Type: ${typeof subtopic}, Value: "${subtopic}"`);
            if (typeof subtopic === 'object') {
                console.log(`   Keys: ${Object.keys(subtopic)}`);
            }
        });
    }
} else {
    console.error('❌ No lesson data found in window or script tags');
}

// 3. Check DOM elements in detail
console.log('\n🏗️ DOM ELEMENTS DETAILED CHECK:');
const domElements = {
    'lesson-container': document.querySelector('.lesson-container'),
    'lesson-header': document.querySelector('.lesson-header'),
    'lesson-title': document.querySelector('.lesson-title'),
    'subtopic-tabs': document.querySelector('.subtopic-tabs'),
    'subtopic-tab elements': document.querySelectorAll('.subtopic-tab'),
    'lesson-content': document.querySelector('.lesson-content'),
    'lesson-content-container': document.querySelector('#lesson-content-container'),
    'progress-bar': document.querySelector('.progress-bar'),
    'progress-fill': document.querySelector('.progress-fill'),
    'content-blocks': document.querySelectorAll('.content-block'),
    'celebration-overlay': document.querySelector('#celebration-overlay')
};

Object.entries(domElements).forEach(([name, element]) => {
    if (element) {
        if (element.length !== undefined) {
            console.log(`✅ ${name}: Found ${element.length} elements`);
        } else {
            console.log(`✅ ${name}: Found (${element.tagName})`);
        }
    } else {
        console.log(`❌ ${name}: Not found`);
    }
});

// 4. Check script loading status
console.log('\n📜 SCRIPT LOADING DETAILED CHECK:');
const allScripts = Array.from(document.scripts);
const lessonScripts = allScripts.filter(s => 
    s.src.includes('lesson') || 
    s.src.includes('quiz') || 
    s.src.includes('progress') || 
    s.src.includes('gamification') ||
    s.src.includes('content-renderer')
);

console.log(`Total scripts: ${allScripts.length}`);
console.log(`Lesson-related scripts: ${lessonScripts.length}`);
lessonScripts.forEach((script, index) => {
    const url = script.src || 'inline';
    const loaded = script.readyState === 'complete' || !script.readyState;
    console.log(`${index + 1}. ${loaded ? '✅' : '⏳'} ${url}`);
});

// 5. Check CSS loading
console.log('\n🎨 CSS LOADING CHECK:');
const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
const lessonCSS = cssLinks.filter(link => 
    link.href.includes('lesson') || 
    link.href.includes('components')
);
console.log(`Lesson CSS files loaded: ${lessonCSS.length}`);
lessonCSS.forEach((link, index) => {
    console.log(`${index + 1}. ${link.href}`);
});

// 6. Test API connectivity with detailed response
console.log('\n📡 API CONNECTIVITY DETAILED TEST:');
async function testAPIs() {
    const apis = [
        `/api/lessons/${lessonId}`,
        `/api/lessons/${lessonId}/progress`,
        `/api/lessons`
    ];
    
    for (const apiUrl of apis) {
        try {
            console.log(`Testing: ${apiUrl}`);
            const response = await fetch(apiUrl);
            console.log(`${response.ok ? '✅' : '❌'} Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                if (apiUrl.includes('/progress')) {
                    console.log(`  Progress data keys: ${Object.keys(data)}`);
                } else if (apiUrl.endsWith(lessonId)) {
                    console.log(`  Lesson data keys: ${Object.keys(data)}`);
                    console.log(`  Has blocks: ${!!data.blocks}`);
                    console.log(`  Has subtopics: ${!!data.subtopics}`);
                } else {
                    console.log(`  Response type: ${Array.isArray(data) ? 'array' : 'object'}`);
                }
            }
        } catch (error) {
            console.error(`❌ ${apiUrl} failed:`, error.message);
        }
    }
}

testAPIs();

// 7. Check console errors
console.log('\n🚨 CONSOLE ERRORS CHECK:');
const originalError = console.error;
const errors = [];
console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
};

setTimeout(() => {
    console.log(`Captured ${errors.length} errors in the last 2 seconds:`);
    errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
    });
    console.error = originalError;
}, 2000);

// 8. Test initialization manually
console.log('\n🚀 MANUAL INITIALIZATION TEST:');
if (lessonData && lessonData.id) {
    if (typeof window.initializeLessonIntegration === 'function') {
        console.log('🔄 Attempting manual lesson integration initialization...');
        try {
            const integration = window.initializeLessonIntegration(lessonData.id);
            console.log('✅ Manual initialization successful:', integration);
        } catch (error) {
            console.error('❌ Manual initialization failed:', error);
        }
    }
    
    if (typeof window.LessonPageManager === 'function') {
        console.log('🔄 Attempting manual LessonPageManager initialization...');
        try {
            const manager = new window.LessonPageManager();
            console.log('✅ LessonPageManager created:', manager);
        } catch (error) {
            console.error('❌ LessonPageManager initialization failed:', error);
        }
    }
}

// 9. Check event listeners
console.log('\n🎧 EVENT SYSTEM TEST:');
const testEvents = ['blockCompleted', 'lessonReady', 'progressUpdated', 'DOMContentLoaded'];
testEvents.forEach(eventName => {
    document.addEventListener(eventName, (e) => {
        console.log(`✅ Event captured: ${eventName}`, e.detail || 'no detail');
    });
});

// Trigger a test event
setTimeout(() => {
    const testEvent = new CustomEvent('testEvent', { detail: { test: true } });
    document.dispatchEvent(testEvent);
}, 1000);

console.log('\n🏁 ENHANCED DIAGNOSTICS COMPLETE');
console.log('================================================');
console.log('📋 SUMMARY:');
console.log('1. Check JavaScript objects status above');
console.log('2. Verify lesson data structure');
console.log('3. Confirm DOM elements are present');
console.log('4. Review script loading status');
console.log('5. Test API responses');
console.log('6. Watch for console errors');
console.log('7. Try manual initialization if needed');
