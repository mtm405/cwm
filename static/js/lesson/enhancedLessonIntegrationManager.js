/**
 * Enhanced Lesson Integration Manager
 * Central coordinator for all lesson components
 */

import { EnhancedFirebaseLessonService } from './enhancedFirebaseLessonService.js';
import { EnhancedLessonBlockRenderer } from './enhancedLessonBlockRenderer.js';

export class EnhancedLessonIntegrationManager {
    constructor(lessonId, initialData = null) {
        this.lessonId = lessonId;
        this.lessonData = initialData;
        this.userProgress = null;
        this.currentUser = null;
        
        // Initialize services
        this.firebaseService = new EnhancedFirebaseLessonService();
        this.blockRenderer = new EnhancedLessonBlockRenderer();
        
        // State management
        this.initialized = false;
        this.codeEditors = new Map();
        this.quizInstances = new Map();
        
        console.log(`🚀 Enhanced Lesson Integration Manager initialized for lesson: ${lessonId}`);
    }

    async initialize() {
        if (this.initialized) {
            console.log('⚠️ Manager already initialized');
            return;
        }

        try {
            console.log('🔄 Initializing Enhanced Lesson System...');
            
            // Step 1: Initialize Firebase service
            await this.firebaseService.initialize();
            
            // Step 2: Load lesson data if not provided
            if (!this.lessonData) {
                this.lessonData = await this.firebaseService.fetchLesson(this.lessonId);
            }
            
            // Step 3: Get current user and load progress
            this.currentUser = this.getCurrentUser();
            if (this.currentUser) {
                this.userProgress = await this.firebaseService.fetchUserProgress(
                    this.lessonId, 
                    this.currentUser.id
                );
            } else {
                this.userProgress = { completed_blocks: [], progress: 0 };
            }
            
            // Step 4: Transform lesson data to blocks format
            this.lessonData = this.transformLessonData(this.lessonData);
            
            // Step 5: Render lesson content
            await this.renderLessonContent();
            
            // Step 6: Initialize interactive elements
            await this.initializeInteractiveElements();
            
            // Step 7: Set up event listeners
            this.setupEventListeners();
            
            // Step 8: Update progress display
            this.updateProgressDisplay();
            
            this.initialized = true;
            console.log('✅ Enhanced Lesson System initialized successfully');
            
        } catch (error) {
            console.error('❌ Enhanced Lesson System initialization failed:', error);
            this.showErrorState(error);
            throw error;
        }
    }

    transformLessonData(lessonData) {
        if (!lessonData) return null;
        
        // If blocks already exist, return as-is
        if (lessonData.blocks && Array.isArray(lessonData.blocks)) {
            return lessonData;
        }
        
        // Transform legacy format to blocks
        const blocks = [];
        let blockOrder = 0;
        
        // Add content as text blocks
        if (lessonData.content) {
            blocks.push({
                id: `${lessonData.id}-intro`,
                type: 'text',
                title: 'Introduction',
                content: lessonData.content,
                order: blockOrder++
            });
        }
        
        // Add code examples
        if (lessonData.code_examples && Array.isArray(lessonData.code_examples)) {
            lessonData.code_examples.forEach((example, index) => {
                blocks.push({
                    id: `${lessonData.id}-code-${index}`,
                    type: 'code_example',
                    title: example.title || `Code Example ${index + 1}`,
                    code: example.code,
                    language: example.language || 'python',
                    explanation: example.explanation,
                    order: blockOrder++
                });
            });
        }
        
        // Add exercises
        if (lessonData.exercises && Array.isArray(lessonData.exercises)) {
            lessonData.exercises.forEach((exercise, index) => {
                blocks.push({
                    id: `${lessonData.id}-exercise-${index}`,
                    type: 'interactive',
                    title: exercise.title || `Exercise ${index + 1}`,
                    instructions: exercise.instructions,
                    starter_code: exercise.starter_code,
                    language: exercise.language || 'python',
                    tests: exercise.tests,
                    order: blockOrder++
                });
            });
        }
        
        // Add quiz
        if (lessonData.quiz_id) {
            blocks.push({
                id: `${lessonData.id}-quiz`,
                type: 'quiz',
                title: 'Knowledge Check',
                quiz_id: lessonData.quiz_id,
                order: blockOrder++
            });
        }
        
        lessonData.blocks = blocks;
        return lessonData;
    }

    async renderLessonContent() {
        const container = document.getElementById('lesson-content-container');
        if (!container) {
            throw new Error('Lesson content container not found');
        }
        
        container.innerHTML = '';
        
        // Sort blocks by order
        const sortedBlocks = [...this.lessonData.blocks].sort((a, b) => a.order - b.order);
        
        // Render each block
        for (const block of sortedBlocks) {
            const blockElement = this.blockRenderer.renderBlock(block, this.userProgress);
            container.appendChild(blockElement);
        }
        
        console.log(`✅ Rendered ${sortedBlocks.length} lesson blocks`);
    }

    async initializeInteractiveElements() {
        // Initialize code editors
        const codeEditors = document.querySelectorAll('.code-editor');
        for (const editor of codeEditors) {
            await this.initializeCodeEditor(editor);
        }
        
        // Initialize quizzes
        const quizBlocks = document.querySelectorAll('[data-quiz-id]');
        for (const quizBlock of quizBlocks) {
            await this.initializeQuiz(quizBlock);
        }
        
        console.log('✅ Interactive elements initialized');
    }

    async initializeCodeEditor(editorElement) {
        const editorId = editorElement.id;
        const language = editorElement.dataset.language || 'python';
        const initialCode = editorElement.textContent.trim();
        
        try {
            // Try to use ACE editor if available
            if (typeof ace !== 'undefined') {
                const editor = ace.edit(editorId);
                editor.setTheme('ace/theme/monokai');
                editor.session.setMode(`ace/mode/${language}`);
                editor.setOptions({
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    fontSize: 14,
                    showPrintMargin: false,
                    wrap: true
                });
                
                if (initialCode) {
                    editor.setValue(initialCode, -1);
                }
                
                this.codeEditors.set(editorId, editor);
                console.log(`✅ ACE editor initialized for ${editorId}`);
            } else {
                // Fallback to textarea
                this.initializeFallbackEditor(editorElement, initialCode);
            }
        } catch (error) {
            console.error(`❌ Failed to initialize editor ${editorId}:`, error);
            this.initializeFallbackEditor(editorElement, initialCode);
        }
    }

    initializeFallbackEditor(editorElement, initialCode) {
        const textarea = document.createElement('textarea');
        textarea.className = 'fallback-code-editor';
        textarea.value = initialCode;
        textarea.rows = Math.max(8, initialCode.split('\n').length + 2);
        textarea.style.cssText = `
            width: 100%;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            background: #1e1e1e;
            color: #d4d4d4;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 12px;
            resize: vertical;
        `;
        
        editorElement.parentNode.replaceChild(textarea, editorElement);
        this.codeEditors.set(editorElement.id, textarea);
        console.log(`✅ Fallback editor initialized for ${editorElement.id}`);
    }

    async initializeQuiz(quizBlock) {
        const quizId = quizBlock.dataset.quizId;
        // Quiz initialization would go here
        console.log(`Quiz placeholder initialized for ${quizId}`);
    }

    setupEventListeners() {
        // Global event delegation
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        // Progress saving on page unload
        window.addEventListener('beforeunload', this.saveProgress.bind(this));
    }

    handleGlobalClick(event) {
        const target = event.target;
        
        // Handle complete button clicks
        if (target.classList.contains('complete-btn')) {
            const blockId = target.dataset.blockId;
            this.markBlockComplete(blockId);
        }
        
        // Handle run button clicks
        if (target.classList.contains('run-btn')) {
            const blockId = target.dataset.blockId;
            this.runCode(blockId);
        }
        
        // Handle reset button clicks
        if (target.classList.contains('reset-btn')) {
            const blockId = target.dataset.blockId;
            this.resetCode(blockId);
        }
        
        // Handle copy button clicks
        if (target.classList.contains('btn-copy')) {
            const blockId = target.dataset.blockId;
            this.copyCode(blockId);
        }
    }

    async markBlockComplete(blockId) {
        if (!this.userProgress.completed_blocks.includes(blockId)) {
            this.userProgress.completed_blocks.push(blockId);
            
            // Update UI
            const blockElement = document.getElementById(`block-${blockId}`);
            if (blockElement) {
                blockElement.classList.add('completed');
            }
            
            // Save progress
            await this.saveProgress();
            
            // Update progress display
            this.updateProgressDisplay();
            
            console.log(`✅ Block ${blockId} marked as complete`);
        }
    }

    async runCode(blockId) {
        const editorId = `editor-${blockId}`;
        const editor = this.codeEditors.get(editorId);
        const outputElement = document.getElementById(`output-${blockId}`);
        
        if (!editor || !outputElement) {
            console.error('Editor or output element not found');
            return;
        }
        
        // Get code from editor
        const code = editor.getValue ? editor.getValue() : editor.value;
        
        // Show loading state
        outputElement.innerHTML = `
            <div class="output-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <span>Running code...</span>
            </div>
        `;
        
        try {
            // Execute code via API
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language: 'python' })
            });
            
            const result = await response.json();
            
            // Display result
            outputElement.innerHTML = `
                <div class="output-result ${result.success ? 'output-success' : 'output-error'}">
                    ${result.output ? `<pre>${result.output}</pre>` : ''}
                    ${result.error ? `<div class="error-message">${result.error}</div>` : ''}
                </div>
            `;
            
            // Mark as complete if successful
            if (result.success) {
                await this.markBlockComplete(blockId);
            }
            
        } catch (error) {
            console.error('Code execution failed:', error);
            outputElement.innerHTML = `
                <div class="output-error">
                    <div class="error-message">Error: ${error.message}</div>
                </div>
            `;
        }
    }

    resetCode(blockId) {
        const editorId = `editor-${blockId}`;
        const editor = this.codeEditors.get(editorId);
        
        if (!editor) {
            console.error('Editor not found');
            return;
        }
        
        // Find the original starter code
        const block = this.lessonData.blocks.find(b => b.id === blockId);
        const starterCode = block?.starter_code || '';
        
        // Reset editor
        if (editor.setValue) {
            editor.setValue(starterCode, -1);
        } else {
            editor.value = starterCode;
        }
        
        // Clear output
        const outputElement = document.getElementById(`output-${blockId}`);
        if (outputElement) {
            outputElement.innerHTML = '';
        }
        
        console.log(`✅ Code reset for block ${blockId}`);
    }

    async copyCode(blockId) {
        const block = this.lessonData.blocks.find(b => b.id === blockId);
        const code = block?.code || '';
        
        try {
            await navigator.clipboard.writeText(code);
            
            // Show feedback
            const button = document.querySelector(`[data-block-id="${blockId}"].btn-copy`);
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    button.innerHTML = originalText;
                }, 2000);
            }
            
            console.log(`✅ Code copied for block ${blockId}`);
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    }

    updateProgressDisplay() {
        const totalBlocks = this.lessonData.blocks?.length || 0;
        const completedBlocks = this.userProgress.completed_blocks?.length || 0;
        const percentage = totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0;
        
        // Update progress bar
        const progressBar = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-percentage');
        const blocksText = document.getElementById('completed-blocks-text');
        
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${percentage}%`;
        if (blocksText) blocksText.textContent = `${completedBlocks} of ${totalBlocks} blocks completed`;
        
        console.log(`📊 Progress updated: ${percentage}%`);
    }

    async saveProgress() {
        if (!this.currentUser) {
            console.log('No user logged in, progress not saved');
            return;
        }
        
        const progressData = {
            ...this.userProgress,
            last_updated: new Date().toISOString(),
            progress: Math.round((this.userProgress.completed_blocks.length / this.lessonData.blocks.length) * 100)
        };
        
        try {
            await this.firebaseService.updateUserProgress(
                this.lessonId,
                this.currentUser.id,
                progressData
            );
            console.log('✅ Progress saved successfully');
        } catch (error) {
            console.error('❌ Failed to save progress:', error);
        }
    }

    getCurrentUser() {
        // Get current user from global state or session
        return window.currentUser || globalThis.currentUser || null;
    }

    showErrorState(error) {
        const container = document.getElementById('lesson-content-container');
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 class="error-title">Failed to Load Lesson</h3>
                    <div class="error-content">
                        <p>We encountered an error while loading this lesson:</p>
                        <p class="error-message">${error.message}</p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-refresh"></i> Try Again
                        </button>
                    </div>
                </div>
            `;
        }
    }
}
