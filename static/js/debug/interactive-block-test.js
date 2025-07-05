/**
 * Debug Script for Interactive Block Testing
 * Run this in browser console to diagnose run button issues
 */

function testInteractiveBlock() {
    console.log('🔍 Testing Interactive Block Functionality');
    console.log('==========================================');
    
    // Step 1: Check if lesson system is loaded
    console.log('1. Checking lesson system...');
    if (!window.lessonSystem) {
        console.error('❌ Lesson system not found');
        return;
    }
    console.log('✅ Lesson system found');
    
    // Step 2: Check if interactions are available
    if (!window.lessonSystem.services || !window.lessonSystem.services.interactions) {
        console.error('❌ LessonInteractions not available');
        return;
    }
    console.log('✅ LessonInteractions available');
    
    // Step 3: Find interactive blocks
    const lessonData = window.lessonSystem.state.lessonData;
    if (!lessonData || !lessonData.blocks) {
        console.error('❌ No lesson data available');
        return;
    }
    
    const interactiveBlocks = lessonData.blocks.filter(block => block.type === 'interactive');
    console.log(`📊 Found ${interactiveBlocks.length} interactive blocks`);
    
    if (interactiveBlocks.length === 0) {
        console.warn('⚠️ No interactive blocks found in this lesson');
        return;
    }
    
    // Step 4: Test the first interactive block
    const testBlock = interactiveBlocks[0];
    console.log(`🎯 Testing block: ${testBlock.id}`);
    
    // Check DOM elements
    const runButton = document.querySelector(`[data-block-id="${testBlock.id}"].run-btn`);
    const outputElement = document.getElementById(`output-${testBlock.id}`);
    const editorElement = document.getElementById(`editor-${testBlock.id}`);
    
    console.log('Run button found:', !!runButton);
    console.log('Output element found:', !!outputElement);
    console.log('Editor element found:', !!editorElement);
    
    if (!runButton) {
        console.error('❌ Run button not found. Checking for alternative selectors...');
        const allRunButtons = document.querySelectorAll('.run-btn');
        console.log(`Found ${allRunButtons.length} elements with .run-btn class`);
        allRunButtons.forEach((btn, index) => {
            console.log(`  Button ${index + 1}:`, btn.dataset.blockId, btn.textContent.trim());
        });
        return;
    }
    
    // Step 5: Check editor registration
    const editorId = `editor-${testBlock.id}`;
    const editor = window.lessonSystem.services.interactions.codeEditors.get(editorId);
    console.log('Editor registered:', !!editor);
    
    if (editor) {
        console.log('Editor type:', typeof editor);
        console.log('Editor has getValue:', typeof editor.getValue === 'function');
        console.log('Editor has runCode:', typeof editor.runCode === 'function');
    }
    
    // Step 6: Test manual code execution
    console.log('🚀 Attempting manual code execution...');
    try {
        window.lessonSystem.services.interactions.runCode(testBlock.id);
        console.log('✅ Manual execution triggered');
    } catch (error) {
        console.error('❌ Manual execution failed:', error);
    }
    
    // Step 7: Test button click simulation
    console.log('🖱️ Simulating button click...');
    try {
        runButton.click();
        console.log('✅ Button click simulated');
    } catch (error) {
        console.error('❌ Button click simulation failed:', error);
    }
    
    console.log('==========================================');
    console.log('🏁 Test completed. Check the output above for issues.');
}

// Run the test
testInteractiveBlock();
