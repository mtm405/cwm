/**
 * Quick Frontend Test Script
 * Check this in the browser console after loading the lesson page
 */

setTimeout(() => {
    console.log('🔍 Quick Frontend Check:');
    
    // Check for major JS errors
    if (window.LessonPageManager) {
        console.log('✅ LessonPageManager class found');
    } else {
        console.log('❌ LessonPageManager class missing');
    }
    
    if (window.lessonManager) {
        console.log('✅ lessonManager instance found');
        console.log('   Lesson ID:', window.lessonManager.lessonId);
    } else {
        console.log('❌ lessonManager instance missing');
    }
    
    if (window.ProgressTracker) {
        console.log('✅ ProgressTracker class found');
    } else {
        console.log('❌ ProgressTracker class missing');
    }
    
    if (window.progressTracker) {
        console.log('✅ progressTracker instance found');
    } else {
        console.log('❌ progressTracker instance missing');
    }
    
    // Check DOM content
    const contentContainer = document.getElementById('lesson-content');
    if (contentContainer) {
        console.log(`✅ Content container found with ${contentContainer.children.length} child elements`);
    } else {
        console.log('❌ Content container missing');
    }
    
    console.log('🎯 Test completed - check results above');
}, 2000);

console.log('⏳ Frontend test will run in 2 seconds...');
