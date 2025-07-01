/**
 * Emergency Initialization System
 * Forces lesson to render despite application failures
 * 
 * This script provides a fail-safe initialization system that will
 * render the lesson content even if other parts of the application fail.
 */

(function() {
    console.log('🚀 Emergency Initialization System loading...');
    
    // Set a flag to track if rendering has been attempted
    window.__emergencyRenderAttempted = false;
    
    // Force render function - ignores all dependencies
    window.emergencyRenderLesson = function() {
        if (window.__emergencyRenderAttempted) {
            console.log('🔄 Emergency render already attempted, skipping');
            return;
        }
        
        window.__emergencyRenderAttempted = true;
        console.log('🚨 EMERGENCY RENDER: Forcing lesson content to display');
        
        try {
            // Apply critical fixes
            if (typeof window.fixContentDataStructure === 'function') {
                window.fixContentDataStructure();
            } else {
                // Create the function if it doesn't exist
                window.fixContentDataStructure = function() {
                    if (!window.lessonData) window.lessonData = {};
                    if (!Array.isArray(window.lessonData.blocks)) window.lessonData.blocks = [];
                    if (!Array.isArray(window.lessonData.content)) window.lessonData.content = [];
                    if (!Array.isArray(window.lessonData.subtopics)) window.lessonData.subtopics = [];
                };
                window.fixContentDataStructure();
            }
            
            // Use existing renderSubtopic if available
            if (typeof window.renderSubtopic === 'function') {
                console.log('📋 Using existing renderSubtopic function');
                window.renderSubtopic(0);
                return;
            }
            
            // Emergency implementation
            console.log('⚠️ No renderSubtopic function found, using emergency renderer');
            const container = document.getElementById('lesson-content-container');
            if (!container) {
                console.error('❌ Lesson content container not found');
                return;
            }
            
            // Clear container
            container.innerHTML = '';
            
            // Try to get content from any available source
            const blocks = Array.isArray(window.lessonData?.blocks) ? window.lessonData.blocks :
                           Array.isArray(window.lessonData?.content) ? window.lessonData.content :
                           Array.isArray(window.lessonData?.subtopics?.[0]?.content) ? window.lessonData.subtopics[0].content : [];
            
            if (blocks.length > 0) {
                // Render each block
                blocks.forEach((block, index) => {
                    const blockElement = document.createElement('div');
                    blockElement.className = 'content-block';
                    blockElement.setAttribute('data-block-index', index);
                    
                    let content = '';
                    const blockType = block.type || 'text';
                    const blockTitle = block.title || block.name || '';
                    const blockText = block.content || block.text || block.description || '';
                    
                    content = `
                        <div class="block-header">
                            <div class="block-icon">📝</div>
                            <div class="block-type">${blockType.charAt(0).toUpperCase() + blockType.slice(1)}</div>
                        </div>
                        <div class="block-content">
                            ${blockTitle ? `<h3>${blockTitle}</h3>` : ''}
                            <div>${typeof blockText === 'string' ? blockText : 'Content unavailable'}</div>
                        </div>
                    `;
                    
                    blockElement.innerHTML = content;
                    container.appendChild(blockElement);
                });
            } else {
                // Fallback content
                container.innerHTML = `
                    <div class="content-block text-block">
                        <div class="block-header">
                            <div class="block-icon">📚</div>
                            <div class="block-type">Learning Content</div>
                        </div>
                        <div class="block-content">
                            <h3>Welcome to this lesson!</h3>
                            <p>This is an emergency rendering of the lesson content.</p>
                            <p>Some features might be limited. Please try refreshing the page if you encounter issues.</p>
                        </div>
                    </div>
                `;
            }
            
            console.log('✅ Emergency render completed successfully');
            
        } catch (error) {
            console.error('❌ Emergency render failed:', error);
            
            // Last resort fallback
            const container = document.getElementById('lesson-content-container');
            if (container) {
                container.innerHTML = `
                    <div class="content-block error-block" style="border: 1px solid #f44336; padding: 20px; margin: 20px 0; border-radius: 4px;">
                        <h3 style="color: #f44336;">Emergency Recovery Mode</h3>
                        <p>We're experiencing technical difficulties with this lesson.</p>
                        <p>Please try refreshing the page or return to the dashboard.</p>
                        <div style="margin-top: 20px;">
                            <button onclick="location.reload()" style="background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 4px; margin-right: 10px; cursor: pointer;">
                                Refresh Page
                            </button>
                            <button onclick="window.location.href='/dashboard'" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    };
    
    // Schedule emergency rendering to happen if regular rendering fails
    const emergencyTimeout = setTimeout(function() {
        // Only run if lesson content isn't already visible
        const container = document.getElementById('lesson-content-container');
        if (container && container.children.length === 0) {
            console.log('⚠️ Lesson not rendered after timeout, triggering emergency render');
            window.emergencyRenderLesson();
        }
    }, 5000); // 5 second timeout
    
    // Add to DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
        // Check if we're on a lesson page
        if (window.location.pathname.includes('/lesson/')) {
            console.log('📋 Lesson page detected, emergency system ready');
            
            // Clear emergency timeout if successful rendering happens
            const checkInterval = setInterval(function() {
                const container = document.getElementById('lesson-content-container');
                if (container && container.children.length > 0) {
                    console.log('✅ Lesson content detected, disabling emergency system');
                    clearTimeout(emergencyTimeout);
                    clearInterval(checkInterval);
                }
            }, 1000); // Check every second
            
            // Fallback check
            setTimeout(function() {
                clearInterval(checkInterval);
            }, 20000); // Stop checking after 20 seconds
        }
    });
    
    console.log('✅ Emergency Initialization System loaded');
})();
