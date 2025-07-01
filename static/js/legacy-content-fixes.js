/**
 * renderLegacyContent Safety Patch
 * Handles the content.forEach is not a function error
 */

(function() {
    // Capture original method if it exists
    const originalRenderLegacyContent = window.renderLegacyContent;
    
    // Safe version of renderLegacyContent
    window.renderLegacyContent = function(content, container) {
        console.log('📜 Rendering legacy content safely...');
        
        try {
            // Make sure container exists
            if (!container) {
                console.error('❌ Container not provided for legacy content');
                return;
            }
            
            // Ensure content is an array
            if (!Array.isArray(content)) {
                console.warn('⚠️ Legacy content is not an array, converting...', content);
                
                // Convert to array if possible
                if (content && typeof content === 'object') {
                    // If it's an object with numeric keys, convert to array
                    if (Object.keys(content).every(key => !isNaN(parseInt(key)))) {
                        content = Object.values(content);
                    } else {
                        // If it's a regular object, wrap in array
                        content = [content];
                    }
                } else if (typeof content === 'string') {
                    // If it's a string, create a text block
                    content = [{
                        type: 'text',
                        content: content
                    }];
                } else {
                    // Last resort: empty array
                    content = [];
                }
            }
            
            // Clear container
            container.innerHTML = '';
            
            // Check if we have content
            if (content.length === 0) {
                console.warn('⚠️ No legacy content to render');
                container.innerHTML = `
                    <div class="content-block">
                        <div class="block-header">
                            <div class="block-icon">ℹ️</div>
                            <div class="block-type">Notice</div>
                        </div>
                        <div class="block-content">
                            <p>This lesson content is being prepared.</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            // Now safely iterate
            content.forEach((contentBlock, index) => {
                try {
                    // If original function exists, call it for this specific block
                    if (originalRenderLegacyContent && typeof originalRenderLegacyContent === 'function') {
                        originalRenderLegacyContent([contentBlock], container);
                    } else {
                        // Basic block rendering fallback
                        const blockElement = document.createElement('div');
                        blockElement.className = 'content-block';
                        blockElement.setAttribute('data-block-index', index);
                        
                        let blockContent = '';
                        const blockType = contentBlock.type || 'text';
                        const blockTitle = contentBlock.title || contentBlock.name || '';
                        const blockText = contentBlock.content || contentBlock.text || contentBlock.description || '';
                        
                        blockContent = `
                            <div class="block-header">
                                <div class="block-icon">${getIconForType(blockType)}</div>
                                <div class="block-type">${formatBlockType(blockType)}</div>
                            </div>
                            <div class="block-content">
                                ${blockTitle ? `<h3>${blockTitle}</h3>` : ''}
                                ${formatBlockContent(blockText, blockType)}
                            </div>
                        `;
                        
                        blockElement.innerHTML = blockContent;
                        container.appendChild(blockElement);
                    }
                } catch (blockError) {
                    console.error(`❌ Error rendering legacy block ${index}:`, blockError);
                    
                    // Fallback for this specific block
                    const errorBlock = document.createElement('div');
                    errorBlock.className = 'content-block error-block';
                    errorBlock.innerHTML = `
                        <div class="block-header">
                            <div class="block-icon">⚠️</div>
                            <div class="block-type">Block Error</div>
                        </div>
                        <div class="block-content">
                            <p>There was an error rendering this content block.</p>
                        </div>
                    `;
                    container.appendChild(errorBlock);
                }
            });
            
            console.log('✅ Legacy content rendered successfully');
            
        } catch (error) {
            console.error('❌ Failed to render legacy content:', error);
            
            // Emergency fallback
            container.innerHTML = `
                <div class="content-block error-block">
                    <div class="block-header">
                        <div class="block-icon">⚠️</div>
                        <div class="block-type">Error</div>
                    </div>
                    <div class="block-content">
                        <p>There was an error rendering the lesson content.</p>
                        <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
                    </div>
                </div>
            `;
        }
    };
    
    // Helper functions
    function getIconForType(type) {
        const icons = {
            'text': '📝',
            'code': '💻',
            'quiz': '❓',
            'image': '🖼️',
            'video': '🎬',
            'exercise': '🏋️',
            'challenge': '🏆'
        };
        return icons[type.toLowerCase()] || '📄';
    }
    
    function formatBlockType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
    
    function formatBlockContent(content, type) {
        if (typeof content !== 'string') {
            return '<p>Content unavailable</p>';
        }
        
        if (type === 'code') {
            return `<pre><code>${escapeHtml(content)}</code></pre>`;
        }
        
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(.+)(?!<\/p>)$/g, '<p>$1</p>');
    }
    
    function escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    console.log('✅ renderLegacyContent safety patch installed');
})();
