/**
 * Enhanced Lesson Template Initialization
 * Integrates the enhanced Firebase lesson system with the template
 */

// Enhanced lesson template initialization
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Starting Enhanced Lesson Template Initialization...');
    
    try {
        // Get lesson data from template
        const lessonData = window.lessonData || globalThis.lessonData;
        const lessonProgress = window.lessonProgress || globalThis.lessonProgress || {};
        
        if (!lessonData || !lessonData.id) {
            throw new Error('Lesson data not available or missing ID');
        }
        
        console.log(`📚 Initializing lesson: ${lessonData.title}`);
        console.log(`📊 Initial progress: ${Object.keys(lessonProgress).length} items`);
        
        // Initialize enhanced lesson system
        const lessonManager = new EnhancedLessonIntegrationManager(
            lessonData.id,
            lessonData
        );
        
        // Store global reference for cleanup
        window.currentLessonManager = lessonManager;
        
        // Initialize the lesson system
        await lessonManager.initialize();
        
        // Setup template-specific enhancements
        setupTemplateEnhancements(lessonManager);
        
        // Setup responsive design updates
        setupResponsiveUpdates();
        
        // Setup accessibility features
        setupAccessibilityFeatures();
        
        // Track successful initialization
        console.log('✅ Enhanced Lesson Template Initialization Complete');
        
        // Dispatch ready event
        const event = new CustomEvent('enhancedLessonReady', {
            detail: { lessonManager, lessonData, lessonProgress }
        });
        document.dispatchEvent(event);
        
    } catch (error) {
        console.error('❌ Enhanced Lesson Template Initialization Failed:', error);
        
        // Fallback to legacy system
        console.log('🔄 Falling back to legacy lesson system...');
        initializeLegacyLessonSystem();
    }
});

/**
 * Setup template-specific enhancements
 */
function setupTemplateEnhancements(lessonManager) {
    console.log('🎨 Setting up template enhancements...');
    
    // Enhanced header updates
    setupEnhancedHeader(lessonManager);
    
    // Navigation enhancements
    setupEnhancedNavigation(lessonManager);
    
    // Progress visualization
    setupProgressVisualization(lessonManager);
    
    // Keyboard navigation
    setupKeyboardNavigation(lessonManager);
    
    // Theme integration
    setupThemeIntegration();
    
    console.log('✅ Template enhancements setup complete');
}

/**
 * Setup enhanced header with lesson metadata
 */
function setupEnhancedHeader(lessonManager) {
    const headerContainer = document.querySelector('.lesson-header, .modern-lesson-header');
    if (!headerContainer) return;
    
    // Add enhanced metadata display
    const metadataContainer = document.createElement('div');
    metadataContainer.className = 'lesson-metadata enhanced';
    
    const lessonData = lessonManager.lessonData;
    metadataContainer.innerHTML = `
        <div class="metadata-item difficulty">
            <span class="label">Difficulty:</span>
            <span class="value ${lessonData.difficulty || 'beginner'}">${(lessonData.difficulty || 'beginner').toUpperCase()}</span>
        </div>
        <div class="metadata-item duration">
            <span class="label">Duration:</span>
            <span class="value">${lessonData.metadata?.estimatedTime || 15} min</span>
        </div>
        <div class="metadata-item blocks">
            <span class="label">Sections:</span>
            <span class="value">${lessonData.blocks?.length || 0}</span>
        </div>
        ${lessonData.xp_reward ? `
            <div class="metadata-item xp">
                <span class="label">XP Reward:</span>
                <span class="value">${lessonData.xp_reward}</span>
            </div>
        ` : ''}
    `;
    
    headerContainer.appendChild(metadataContainer);
}

/**
 * Setup enhanced navigation
 */
function setupEnhancedNavigation(lessonManager) {
    // Add floating navigation for mobile
    if (window.innerWidth <= 768) {
        createFloatingNavigation(lessonManager);
    }
    
    // Add table of contents
    createTableOfContents(lessonManager);
    
    // Add progress indicators
    createProgressIndicators(lessonManager);
}

/**
 * Create floating navigation for mobile
 */
function createFloatingNavigation(lessonManager) {
    const floatingNav = document.createElement('div');
    floatingNav.className = 'floating-navigation enhanced';
    floatingNav.innerHTML = `
        <button class="nav-btn prev-btn" title="Previous Block">
            <i class="fas fa-chevron-up"></i>
        </button>
        <button class="nav-btn progress-btn" title="Progress">
            <span class="progress-text">0%</span>
        </button>
        <button class="nav-btn next-btn" title="Next Block">
            <i class="fas fa-chevron-down"></i>
        </button>
    `;
    
    document.body.appendChild(floatingNav);
    
    // Setup navigation event listeners
    setupFloatingNavListeners(floatingNav, lessonManager);
}

/**
 * Create table of contents
 */
function createTableOfContents(lessonManager) {
    const lessonData = lessonManager.lessonData;
    if (!lessonData.blocks || lessonData.blocks.length <= 3) return;
    
    const tocContainer = document.createElement('div');
    tocContainer.className = 'table-of-contents enhanced';
    tocContainer.innerHTML = `
        <div class="toc-header">
            <h3>Table of Contents</h3>
            <button class="toc-toggle">
                <i class="fas fa-chevron-down"></i>
            </button>
        </div>
        <div class="toc-content">
            ${lessonData.blocks.map((block, index) => `
                <div class="toc-item" data-block-id="${block.id}">
                    <span class="toc-number">${index + 1}</span>
                    <span class="toc-title">${block.title || `Block ${index + 1}`}</span>
                    <span class="toc-status"></span>
                </div>
            `).join('')}
        </div>
    `;
    
    // Insert after lesson header
    const lessonHeader = document.querySelector('.lesson-header, .modern-lesson-header');
    if (lessonHeader) {
        lessonHeader.insertAdjacentElement('afterend', tocContainer);
    }
    
    // Setup TOC interactions
    setupTOCInteractions(tocContainer, lessonManager);
}

/**
 * Setup progress visualization enhancements
 */
function setupProgressVisualization(lessonManager) {
    // Listen for progress updates
    document.addEventListener('progressUpdated', (event) => {
        updateProgressVisualization(event.detail);
    });
    
    // Create progress analytics
    createProgressAnalytics(lessonManager);
}

/**
 * Create progress indicators for the lesson
 * @param {Object} lessonManager - The lesson manager instance
 */
function createProgressIndicators(lessonManager) {
    if (!lessonManager || !lessonManager.lessonData) return;
    
    console.log('📊 Creating progress indicators...');
    
    const lessonData = lessonManager.lessonData;
    const blocks = lessonData.blocks || [];
    const progressContainer = document.querySelector('.lesson-progress-header, .progress-indicators');
    
    if (!progressContainer) {
        console.warn('⚠️ Progress container not found');
        return;
    }
    
    // Clear existing indicators
    const existingIndicators = progressContainer.querySelector('.progress-markers');
    if (existingIndicators) {
        existingIndicators.remove();
    }
    
    // Create markers container
    const markersContainer = document.createElement('div');
    markersContainer.className = 'progress-markers';
    
    // Create individual markers
    blocks.forEach((block, index) => {
        const marker = document.createElement('div');
        marker.className = 'progress-marker';
        marker.dataset.blockId = block.id;
        marker.dataset.blockIndex = index;
        
        // Check if block is completed
        if (lessonManager.completedBlocks.has(block.id)) {
            marker.classList.add('completed');
        }
        
        // Add tooltip
        marker.title = block.title || `Block ${index + 1}`;
        
        // Add click handler to navigate to block
        marker.addEventListener('click', () => {
            const blockElement = document.querySelector(`[data-block-id="${block.id}"]`);
            if (blockElement) {
                blockElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        markersContainer.appendChild(marker);
    });
    
    // Add progress line to connect markers
    const progressLine = document.createElement('div');
    progressLine.className = 'progress-line';
    markersContainer.appendChild(progressLine);
    
    // Add fill element to show completion percentage
    const progressFill = document.createElement('div');
    progressFill.className = 'progress-fill';
    
    // Calculate progress percentage
    const completedCount = lessonManager.completedBlocks.size;
    const totalBlocks = blocks.length;
    const percentage = totalBlocks > 0 ? Math.round((completedCount / totalBlocks) * 100) : 0;
    
    progressFill.style.width = `${percentage}%`;
    progressLine.appendChild(progressFill);
    
    // Add progress text
    const progressText = document.createElement('div');
    progressText.className = 'progress-text';
    progressText.innerHTML = `
        <span class="completed-count">${completedCount}</span> / 
        <span class="total-count">${totalBlocks}</span> blocks completed
        <span class="progress-percentage">${percentage}%</span>
    `;
    
    // Add to DOM
    progressContainer.appendChild(markersContainer);
    progressContainer.appendChild(progressText);
    
    console.log('✅ Progress indicators created');
    
    // Setup progress update listener
    document.addEventListener('progressUpdated', (event) => {
        updateProgressIndicators(event.detail.progressData);
    });
    
    return markersContainer;
}

/**
 * Update progress indicators based on progress data
 * @param {Object} progressData - The updated progress data
 */
function updateProgressIndicators(progressData) {
    if (!progressData) return;
    
    const completedBlocks = progressData.completedBlocks || [];
    const progressContainer = document.querySelector('.lesson-progress-header, .progress-indicators');
    
    if (!progressContainer) return;
    
    // Update markers
    const markers = progressContainer.querySelectorAll('.progress-marker');
    markers.forEach(marker => {
        const blockId = marker.dataset.blockId;
        if (blockId && completedBlocks.includes(blockId)) {
            marker.classList.add('completed');
        }
    });
    
    // Update progress fill
    const progressFill = progressContainer.querySelector('.progress-fill');
    if (progressFill) {
        const totalBlocks = markers.length;
        const percentage = totalBlocks > 0 ? Math.round((completedBlocks.length / totalBlocks) * 100) : 0;
        progressFill.style.width = `${percentage}%`;
    }
    
    // Update text
    const completedElement = progressContainer.querySelector('.completed-count');
    const percentageElement = progressContainer.querySelector('.progress-percentage');
    
    if (completedElement) {
        completedElement.textContent = completedBlocks.length;
    }
    
    if (percentageElement) {
        const totalBlocks = markers.length;
        const percentage = totalBlocks > 0 ? Math.round((completedBlocks.length / totalBlocks) * 100) : 0;
        percentageElement.textContent = `${percentage}%`;
    }
}

/**
 * Setup responsive design updates
 */
function setupResponsiveUpdates() {
    // Create responsive observer
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    function handleResponsiveChange(e) {
        const isMobile = e.matches;
        document.body.classList.toggle('mobile-layout', isMobile);
        
        // Adjust lesson layout for mobile
        adjustLessonLayoutForMobile(isMobile);
    }
    
    // Initial check
    handleResponsiveChange(mediaQuery);
    
    // Listen for changes
    mediaQuery.addListener(handleResponsiveChange);
}

/**
 * Setup accessibility features
 */
function setupAccessibilityFeatures() {
    console.log('♿ Setting up accessibility features...');
    
    // Add skip links
    createSkipLinks();
    
    // Setup keyboard navigation
    setupAccessibleKeyboardNavigation();
    
    // Add ARIA labels and roles
    enhanceARIASupport();
    
    // Setup focus management
    setupFocusManagement();
    
    // Add screen reader announcements
    setupScreenReaderAnnouncements();
    
    console.log('✅ Accessibility features setup complete');
}

/**
 * Create skip links for accessibility
 */
function createSkipLinks() {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
        <a href="#lesson-content" class="skip-link">Skip to lesson content</a>
        <a href="#lesson-navigation" class="skip-link">Skip to navigation</a>
    `;
    
    document.body.insertBefore(skipLinks, document.body.firstChild);
}

/**
 * Setup accessible keyboard navigation
 */
function setupAccessibleKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        // Alt + N for next block
        if (event.altKey && event.key === 'n') {
            navigateToNextBlock();
            event.preventDefault();
        }
        
        // Alt + P for previous block
        if (event.altKey && event.key === 'p') {
            navigateToPreviousBlock();
            event.preventDefault();
        }
        
        // Alt + T for table of contents
        if (event.altKey && event.key === 't') {
            toggleTableOfContents();
            event.preventDefault();
        }
        
        // Alt + R for progress report
        if (event.altKey && event.key === 'r') {
            announceProgress();
            event.preventDefault();
        }
    });
}

/**
 * Enhance ARIA support
 */
function enhanceARIASupport() {
    // Add ARIA labels to lesson blocks
    const lessonBlocks = document.querySelectorAll('.lesson-block');
    lessonBlocks.forEach((block, index) => {
        block.setAttribute('role', 'article');
        block.setAttribute('aria-labelledby', `block-title-${index}`);
        
        const title = block.querySelector('.block-title, .block-header h3, .block-header h4');
        if (title) {
            title.id = `block-title-${index}`;
        }
    });
    
    // Add ARIA labels to interactive elements
    const interactiveBlocks = document.querySelectorAll('.interactive-block');
    interactiveBlocks.forEach((block) => {
        block.setAttribute('role', 'application');
        block.setAttribute('aria-label', 'Interactive coding exercise');
    });
}

/**
 * Setup focus management
 */
function setupFocusManagement() {
    // Focus management for block navigation
    document.addEventListener('blockCompleted', (event) => {
        const nextBlock = findNextIncompleteBlock(event.detail.blockId);
        if (nextBlock) {
            focusBlock(nextBlock);
        }
    });
}

/**
 * Setup screen reader announcements
 */
function setupScreenReaderAnnouncements() {
    // Create announcement region
    const announcer = document.createElement('div');
    announcer.id = 'lesson-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
    
    // Store global reference
    window.lessonAnnouncer = announcer;
    
    // Setup announcement listeners
    document.addEventListener('blockCompleted', (event) => {
        announce(`Block completed: ${event.detail.blockTitle || 'Block'}`);
    });
    
    document.addEventListener('lessonCompleted', () => {
        announce('Congratulations! You have completed this lesson.');
    });
}

/**
 * Setup Table of Contents interactions
 * @param {HTMLElement} tocContainer - The TOC container element
 * @param {Object} lessonManager - The lesson manager instance
 */
function setupTOCInteractions(tocContainer, lessonManager) {
    if (!tocContainer || !lessonManager) return;
    
    console.log('📑 Setting up TOC interactions...');
    
    const tocItems = tocContainer.querySelectorAll('.toc-item');
    const lessonData = lessonManager.lessonData;
    
    // Skip if no TOC items found
    if (!tocItems || tocItems.length === 0) {
        console.log('⚠️ No TOC items found to set up');
        return;
    }
    
    // Attach click handlers to TOC items
    tocItems.forEach(item => {
        const blockId = item.dataset.blockId;
        if (!blockId) return;
        
        item.addEventListener('click', (event) => {
            event.preventDefault();
            
            // Find target block in DOM
            const targetBlock = document.querySelector(`[data-block-id="${blockId}"]`);
            if (targetBlock) {
                // Smooth scroll to block
                targetBlock.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Highlight block temporarily
                targetBlock.classList.add('highlight-block');
                setTimeout(() => {
                    targetBlock.classList.remove('highlight-block');
                }, 2000);
                
                // Track TOC navigation in analytics
                if (window.firebaseAnalytics) {
                    window.firebaseAnalytics.logEvent('toc_navigation', {
                        lesson_id: lessonData.id,
                        block_id: blockId
                    });
                }
            }
        });
    });
    
    // Setup scroll spy to highlight current section in TOC
    const blocks = document.querySelectorAll('.block-wrapper');
    
    // Setup intersection observer for scroll spy
    const options = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.5 // trigger when 50% of block is visible
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const blockId = entry.target.dataset.blockId;
                if (blockId) {
                    // Update active state in TOC
                    tocItems.forEach(item => {
                        item.classList.remove('active');
                        if (item.dataset.blockId === blockId) {
                            item.classList.add('active');
                        }
                    });
                }
            }
        });
    }, options);
    
    // Observe all blocks
    blocks.forEach(block => observer.observe(block));
    
    // Setup toggle functionality for mobile
    const tocToggle = document.querySelector('.toc-toggle');
    if (tocToggle) {
        tocToggle.addEventListener('click', () => {
            tocContainer.classList.toggle('toc-expanded');
            tocToggle.setAttribute(
                'aria-expanded', 
                tocContainer.classList.contains('toc-expanded')
            );
        });
    }
    
    console.log('✅ TOC interactions setup complete');
}

/**
 * Utility functions
 */
function announce(message) {
    const announcer = window.lessonAnnouncer;
    if (announcer) {
        announcer.textContent = message;
    }
}

function focusBlock(blockId) {
    const block = document.querySelector(`[data-block-id="${blockId}"]`);
    if (block) {
        block.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus first interactive element or the block itself
        const focusable = block.querySelector('button, input, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
            focusable.focus();
        } else {
            block.setAttribute('tabindex', '-1');
            block.focus();
        }
    }
}

function navigateToNextBlock() {
    // Implementation for keyboard navigation
    console.log('⌨️ Navigate to next block');
}

function navigateToPreviousBlock() {
    // Implementation for keyboard navigation
    console.log('⌨️ Navigate to previous block');
}

function toggleTableOfContents() {
    const toc = document.querySelector('.table-of-contents');
    if (toc) {
        toc.classList.toggle('expanded');
    }
}

function announceProgress() {
    const progressHeader = document.querySelector('.lesson-progress-header');
    if (progressHeader) {
        const completed = progressHeader.querySelector('.completed-count')?.textContent || '0';
        const total = progressHeader.querySelector('.total-count')?.textContent || '0';
        announce(`Progress: ${completed} of ${total} blocks completed`);
    }
}

/**
 * Fallback to legacy system if enhanced system fails
 */
function initializeLegacyLessonSystem() {
    console.log('🔄 Initializing legacy lesson system...');
    
    // Use existing lesson initialization code as fallback
    if (typeof window.initializeLessonPage === 'function') {
        window.initializeLessonPage();
    } else if (typeof globalThis.lessonData !== 'undefined') {
        // Basic fallback rendering
        renderBasicLessonContent(globalThis.lessonData);
    }
}

function renderBasicLessonContent(lessonData) {
    const container = document.querySelector('.lesson-content');
    if (!container || !lessonData) return;
    
    container.innerHTML = `
        <div class="basic-lesson-content">
            <h1>${lessonData.title || 'Lesson'}</h1>
            <div class="lesson-description">
                ${lessonData.description || ''}
            </div>
            <div class="lesson-content-blocks">
                ${(lessonData.content || []).map((block, index) => `
                    <div class="content-block ${block.type || 'text'}">
                        ${block.content || ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/**
 * Render a subtopic section in legacy mode
 * Used as a fallback when enhanced system fails
 * @param {Object} subtopic - The subtopic data to render
 * @param {HTMLElement} container - The container to render into
 * @param {number} index - The index of the subtopic
 */
function renderSubtopic(subtopic, container, index) {
    if (!subtopic || !container) return;
    
    console.log(`📑 Rendering legacy subtopic: ${subtopic.title || `Subtopic ${index + 1}`}`);
    
    // Create subtopic container
    const subtopicElement = document.createElement('div');
    subtopicElement.className = 'lesson-subtopic';
    subtopicElement.dataset.subtopicId = subtopic.id || `subtopic-${index}`;
    
    // Add subtopic header
    const subtopicHeader = document.createElement('h2');
    subtopicHeader.className = 'subtopic-title';
    subtopicHeader.textContent = subtopic.title || `Subtopic ${index + 1}`;
    subtopicElement.appendChild(subtopicHeader);
    
    // Add subtopic content
    if (subtopic.content) {
        const contentElement = document.createElement('div');
        contentElement.className = 'subtopic-content';
        contentElement.innerHTML = subtopic.content;
        subtopicElement.appendChild(contentElement);
    }
    
    // Add code examples if available
    if (subtopic.codeExamples && subtopic.codeExamples.length > 0) {
        subtopic.codeExamples.forEach((example, exampleIndex) => {
            const codeElement = document.createElement('div');
            codeElement.className = 'code-example';
            
            if (example.title) {
                const titleElement = document.createElement('h3');
                titleElement.className = 'code-title';
                titleElement.textContent = example.title;
                codeElement.appendChild(titleElement);
            }
            
            // Add code
            const codeBlock = document.createElement('pre');
            const codeContent = document.createElement('code');
            codeContent.className = example.language || 'language-javascript';
            codeContent.textContent = example.code || '';
            codeBlock.appendChild(codeContent);
            codeElement.appendChild(codeBlock);
            
            // Add explanation if available
            if (example.explanation) {
                const explanationElement = document.createElement('div');
                explanationElement.className = 'code-explanation';
                explanationElement.innerHTML = example.explanation;
                codeElement.appendChild(explanationElement);
            }
            
            subtopicElement.appendChild(codeElement);
        });
    }
    
    // Add exercises if available
    if (subtopic.exercises && subtopic.exercises.length > 0) {
        const exercisesContainer = document.createElement('div');
        exercisesContainer.className = 'exercises-container';
        
        subtopic.exercises.forEach((exercise, exerciseIndex) => {
            const exerciseElement = document.createElement('div');
            exerciseElement.className = 'exercise';
            exerciseElement.innerHTML = `
                <h3 class="exercise-title">${exercise.title || `Exercise ${exerciseIndex + 1}`}</h3>
                <div class="exercise-description">${exercise.description || ''}</div>
                ${exercise.code ? `
                    <pre><code class="language-${exercise.language || 'javascript'}">${exercise.code}</code></pre>
                ` : ''}
            `;
            
            exercisesContainer.appendChild(exerciseElement);
        });
        
        subtopicElement.appendChild(exercisesContainer);
    }
    
    // Add to container
    container.appendChild(subtopicElement);
    
    return subtopicElement;
}

// Export for debugging
if (typeof window !== 'undefined') {
    window.enhancedLessonTemplate = {
        setupTemplateEnhancements,
        setupAccessibilityFeatures,
        announce,
        focusBlock
    };
}
