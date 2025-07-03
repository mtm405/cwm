/**
 * Emergency Lesson Page Diagnostic
 * Run this in the browser console to diagnose lesson loading issues
 */

(function() {
    console.log('%c🔍 LESSON PAGE DIAGNOSTIC', 'color: #FF6B6B; font-weight: bold; font-size: 18px;');
    console.log('Time:', new Date().toISOString());
    console.log('URL:', window.location.href);
    
    // 1. Check if we're on a lesson page
    const isLessonPage = window.location.pathname.includes('/lesson/');
    console.log('🎯 Is Lesson Page:', isLessonPage);
    
    if (!isLessonPage) {
        console.log('❌ Not on a lesson page, stopping diagnostic');
        return;
    }
    
    // 2. Extract lesson ID from URL
    const urlMatch = window.location.pathname.match(/\/lesson\/([^\/]+)/);
    const lessonId = urlMatch ? urlMatch[1] : null;
    console.log('📝 Lesson ID:', lessonId);
    
    // 3. Check DOM elements
    console.log('\n📄 DOM ELEMENTS CHECK:');
    const elements = {
        'lesson-container': document.querySelector('.lesson-container'),
        'lesson-content': document.getElementById('lesson-content'),
        'lesson-content-container': document.getElementById('lesson-content-container'),
        'content-loading': document.getElementById('content-loading'),
        'fallback-content': document.getElementById('fallback-content')
    };
    
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`  ${name}:`, element ? '✅ Found' : '❌ Missing');
        if (element) {
            console.log(`    Style display:`, element.style.display);
            console.log(`    Children count:`, element.children.length);
        }
    });
    
    // 4. Check JavaScript data
    console.log('\n💾 JAVASCRIPT DATA:');
    console.log('  globalThis.lessonData:', !!globalThis.lessonData);
    console.log('  window.lessonData:', !!window.lessonData);
    console.log('  globalThis.lessonProgress:', !!globalThis.lessonProgress);
    console.log('  globalThis.currentUser:', !!globalThis.currentUser);
    
    if (globalThis.lessonData) {
        console.log('  Lesson data details:');
        console.log('    ID:', globalThis.lessonData.id);
        console.log('    Title:', globalThis.lessonData.title);
        console.log('    Blocks:', globalThis.lessonData.blocks?.length || 0);
        console.log('    Subtopics:', globalThis.lessonData.subtopics?.length || 0);
    }
    
    // 5. Check JavaScript errors
    console.log('\n🚨 ERROR MONITORING:');
    const errors = [];
    const originalError = console.error;
    console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
    };
    
    // 6. Check script loading
    console.log('\n📜 SCRIPT LOADING:');
    const scripts = Array.from(document.scripts);
    const lessonScripts = scripts.filter(script => 
        script.src && (
            script.src.includes('lesson') ||
            script.src.includes('auth') ||
            script.src.includes('debug')
        )
    );
    
    console.log('Total scripts:', scripts.length);
    console.log('Lesson-related scripts:', lessonScripts.length);
    lessonScripts.forEach(script => {
        console.log(`  📄 ${script.src}`);
    });
    
    // 7. Check functions availability
    console.log('\n🔧 FUNCTION AVAILABILITY:');
    const functions = [
        'initializeLesson',
        'debugAuth',
        'switchSubtopic',
        'renderSubtopic',
        'transformLessonDataToBlocks',
        'testFirebaseIntegration'
    ];
    
    functions.forEach(funcName => {
        const exists = typeof window[funcName] === 'function';
        console.log(`  ${funcName}:`, exists ? '✅ Available' : '❌ Missing');
    });
    
    // 8. Check initialization status
    console.log('\n🚀 INITIALIZATION STATUS:');
    console.log('  Document ready state:', document.readyState);
    console.log('  Window loaded:', document.readyState === 'complete');
    
    // 9. Try to identify the issue
    console.log('\n🎯 ISSUE IDENTIFICATION:');
    
    if (!globalThis.lessonData) {
        console.log('❌ ISSUE: No lesson data available');
        console.log('💡 SOLUTION: Check if lesson data is being passed from backend');
    }
    
    if (elements['lesson-content-container'] && elements['lesson-content-container'].children.length === 0) {
        console.log('❌ ISSUE: Content container is empty');
        console.log('💡 SOLUTION: Initialization may have failed');
    }
    
    if (elements['content-loading'] && elements['content-loading'].style.display !== 'none') {
        console.log('❌ ISSUE: Still showing loading state');
        console.log('💡 SOLUTION: Initialization never completed');
    }
    
    // 10. Manual initialization attempt
    console.log('\n🔄 MANUAL INITIALIZATION ATTEMPT:');
    
    if (typeof window.initializeLesson === 'function') {
        console.log('Attempting manual initialization...');
        try {
            window.initializeLesson();
            console.log('✅ Manual initialization completed');
        } catch (error) {
            console.log('❌ Manual initialization failed:', error);
        }
    } else {
        console.log('❌ initializeLesson function not available');
        
        // Try emergency content display
        console.log('🚨 Attempting emergency content display...');
        try {
            if (elements['content-loading']) {
                elements['content-loading'].style.display = 'none';
            }
            if (elements['lesson-content']) {
                elements['lesson-content'].style.display = 'block';
            }
            if (elements['lesson-content-container']) {
                elements['lesson-content-container'].innerHTML = `
                    <div class="emergency-content">
                        <h3>⚠️ Lesson Loading Issue</h3>
                        <p>The lesson initialization system encountered an error.</p>
                        <p><strong>Lesson ID:</strong> ${lessonId}</p>
                        <button onclick="window.location.reload()" class="btn">Refresh Page</button>
                    </div>
                `;
            }
            console.log('✅ Emergency content displayed');
        } catch (error) {
            console.log('❌ Emergency content display failed:', error);
        }
    }
    
    // 11. Monitor for errors for a few seconds
    setTimeout(() => {
        console.log('\n📊 ERROR SUMMARY:');
        if (errors.length === 0) {
            console.log('✅ No JavaScript errors detected');
        } else {
            console.log(`❌ ${errors.length} errors detected:`);
            errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        // Restore original console.error
        console.error = originalError;
        
        // Final status
        console.log('\n🏁 DIAGNOSTIC COMPLETE');
        const contentVisible = elements['lesson-content'] && elements['lesson-content'].style.display !== 'none';
        const hasContent = elements['lesson-content-container'] && elements['lesson-content-container'].children.length > 0;
        
        console.log('Final Status:', contentVisible && hasContent ? '✅ WORKING' : '❌ NOT WORKING');
        
    }, 3000);
    
    return {
        isLessonPage,
        lessonId,
        elements,
        hasLessonData: !!globalThis.lessonData,
        scriptsLoaded: lessonScripts.length,
        errors
    };
})();
