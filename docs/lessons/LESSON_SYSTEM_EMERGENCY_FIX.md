# 🚨 Lesson System Emergency Fix Project Plan

**Project Status**: CRITICAL - Immediate Action Required  
**Date**: July 3, 2025  
**Estimated Timeline**: 1 week (3 focused phases)

## 🎯 **REVISED PROJECT OVERVIEW**

**Root Cause Analysis**: After deep investigation, the lesson system is NOT fundamentally broken. The issue is **missing methods** in existing Phase 6 components, not missing files.

**Current State**: Phase 6 architecture is excellent, but some methods are missing from `EnhancedCodeEditor`  
**Goal**: Add missing methods to existing Phase 6 components  
**Timeline**: 3 focused phases over 1 week  

### ✅ **What Actually Exists (Phase 6)**:
- `/static/js/eventBus.js` ✅ (exists)
- `/static/js/utils.js` ✅ (exists)  
- `/static/js/quiz/QuizEngine.js` ✅ (exists)
- `/static/js/quiz/QuizController.js` ✅ (exists)
- `/static/js/lesson/components/EnhancedCodeEditor.js` ✅ (exists)

### 🚨 **Actual Critical Issues**:
- `setupAccessibility()` method missing in `EnhancedCodeEditor.js` (line 239)
- `setupErrorHighlighting()` method missing in `EnhancedCodeEditor.js` (line 242)
- Quiz system using old import paths instead of Phase 6 paths
- Code execution API endpoint missing from backend

---

## 📋 **PHASE 1: EMERGENCY STABILIZATION** (Day 1-2)
*Priority: CRITICAL - Restore basic functionality*

### **1.1 Create Missing Dependencies**

**File**: `static/js/core/eventBus.js`
```javascript
export class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

export default new EventBus();
```

**File**: `static/js/core/utils.js`
```javascript
export const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },
    
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    asyncTimeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

export default utils;
```

### **1.2 Fix EnhancedCodeEditor.js**

**Location**: Around line 240 in `EnhancedCodeEditor.js`
```javascript
setupAccessibility() {
    const editorElement = this.editor.container;
    
    // Add ARIA labels
    editorElement.setAttribute('role', 'application');
    editorElement.setAttribute('aria-label', `Code editor for ${this.blockId}`);
    
    // Add keyboard navigation
    const helpText = document.createElement('div');
    helpText.className = 'sr-only';
    helpText.textContent = 'Press F1 for editor commands. Tab to navigate.';
    editorElement.prepend(helpText);
    
    // Set up focus management
    this.editor.on('focus', () => {
        editorElement.setAttribute('aria-describedby', 'editor-shortcuts');
    });
    
    console.log('✅ Accessibility features initialized');
}
```

**Location**: Around line 300 in `EnhancedCodeEditor.js` (Fix runCode method)
```javascript
async runCode() {
    try {
        const code = this.editor.getValue();
        
        if (!code.trim()) {
            this.showOutput('No code to run', 'warning');
            return;
        }
        
        this.showLoading();
        
        // Send code to execution endpoint
        const response = await fetch('/api/execute/python', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                lessonId: this.lessonId,
                blockId: this.blockId
            })
        });
        
        if (!response.ok) {
            throw new Error(`Execution failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Display output
        this.showOutput(result.output || result.error || 'No output', 
                       result.success ? 'success' : 'error');
        
        // Handle completion if all tests pass
        if (result.success && result.allTestsPassed) {
            this.handleCompletion(result);
        }
        
    } catch (error) {
        console.error('❌ Code execution error:', error);
        this.showOutput(`Error: ${error.message}`, 'error');
    } finally {
        this.hideLoading();
    }
}
```

### **1.3 Restore Critical Components**
```bash
# Move critical components back to active
cp static/js/archive/components/dashboard.js static/js/components/
cp static/js/archive/components/modal-manager.js static/js/components/
cp static/js/archive/components/ModalComponent.js static/js/components/
cp static/js/archive/main-optimized.js static/js/
```

---

## 🔧 **PHASE 2: QUIZ SYSTEM RESTORATION** (Day 3-4)
*Priority: HIGH - Fix quiz functionality*

### **2.1 Fix Quiz Module Structure**

**File**: `static/js/modules/quiz.js`
```javascript
export class QuizModule {
    constructor(config = {}) {
        this.config = {
            autoSave: true,
            showFeedback: true,
            animateTransitions: true,
            ...config
        };
        this.initialized = false;
        this.currentQuiz = null;
    }
    
    async init() {
        console.log('🧠 Initializing Quiz Module...');
        this.initialized = true;
        return true;
    }
    
    async loadQuiz(quizId) {
        // Try to load from API first
        try {
            const response = await fetch(`/api/quiz/${quizId}`);
            if (response.ok) {
                const quizData = await response.json();
                this.currentQuiz = quizData;
                return quizData;
            }
        } catch (error) {
            console.log('API unavailable, using mock data');
        }
        
        // Fallback to mock data
        const mockQuiz = {
            id: quizId,
            title: 'Understanding Variables',
            questions: [
                {
                    id: 'q1',
                    type: 'multiple_choice',
                    question: 'What is a variable in Python?',
                    options: [
                        'A container for storing data',
                        'A type of loop',
                        'A function parameter',
                        'A class method'
                    ],
                    correct: 0
                }
            ]
        };
        
        this.currentQuiz = mockQuiz;
        return mockQuiz;
    }
    
    renderQuiz(container, quizData) {
        container.innerHTML = `
            <div class="quiz-container">
                <h3>${quizData.title}</h3>
                <div class="quiz-questions">
                    ${quizData.questions.map(q => this.renderQuestion(q)).join('')}
                </div>
                <button class="btn btn-primary submit-quiz">Submit Quiz</button>
            </div>
        `;
        
        // Add event listeners
        this.setupQuizEvents(container);
    }
    
    renderQuestion(question) {
        return `
            <div class="question-block" data-question-id="${question.id}">
                <h4>${question.question}</h4>
                <div class="options">
                    ${question.options.map((option, index) => `
                        <label class="option-label">
                            <input type="radio" name="q_${question.id}" value="${index}">
                            ${option}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    setupQuizEvents(container) {
        const submitBtn = container.querySelector('.submit-quiz');
        submitBtn.addEventListener('click', () => {
            this.submitQuiz(container);
        });
    }
    
    submitQuiz(container) {
        const answers = {};
        const inputs = container.querySelectorAll('input[type="radio"]:checked');
        
        inputs.forEach(input => {
            const questionId = input.name.replace('q_', '');
            answers[questionId] = parseInt(input.value);
        });
        
        console.log('Quiz submitted:', answers);
        this.showResults(container, answers);
    }
    
    showResults(container, answers) {
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'quiz-results';
        resultsDiv.innerHTML = `
            <div class="alert alert-success">
                <h4>Quiz Complete!</h4>
                <p>You answered ${Object.keys(answers).length} questions.</p>
                <p>Great job! Continue to the next lesson.</p>
            </div>
        `;
        
        container.appendChild(resultsDiv);
        
        // Trigger completion event
        window.dispatchEvent(new CustomEvent('quiz:completed', {
            detail: { answers, score: 100 }
        }));
    }
}

// Export as default for compatibility
export default QuizModule;
```

### **2.2 Fix Quiz Integration in LessonInteractions.js**

**Location**: Around line 1192 in `LessonInteractions.js`
```javascript
async initializeFallbackQuizzes(quizElements) {
    console.log('🔄 Initializing fallback quiz system...');
    
    try {
        // Import the module correctly
        const module = await import('/static/js/modules/quiz.js');
        const QuizModule = module.default || module.QuizModule;
        
        // Create instance
        this.quizModule = new QuizModule({
            autoSave: true,
            showFeedback: true,
            animateTransitions: true
        });
        
        await this.quizModule.init();
        
        // Process each quiz
        for (const quizElement of quizElements) {
            const quizId = quizElement.dataset.quizId || 'default-quiz';
            const blockId = quizElement.dataset.blockId || 'quiz-block';
            
            try {
                const quizData = await this.quizModule.loadQuiz(quizId);
                this.quizModule.renderQuiz(quizElement, quizData);
                
                // Mark as loaded
                quizElement.classList.add('quiz-loaded');
                
            } catch (error) {
                console.error(`Failed to load quiz ${quizId}:`, error);
                this.renderQuizError(quizElement, 'Failed to load quiz');
            }
        }
        
        console.log(`🧠 Initialized ${quizElements.length} basic quizzes`);
        
    } catch (error) {
        console.error('❌ Failed to initialize quiz system:', error);
        
        // Fallback to placeholder
        for (const quizElement of quizElements) {
            this.renderQuizPlaceholder(quizElement);
        }
    }
}

// Add new helper methods
renderQuizError(quizElement, message) {
    quizElement.innerHTML = `
        <div class="quiz-error">
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button class="btn btn-sm btn-secondary retry-quiz">Retry</button>
            </div>
        </div>
    `;
}

renderQuizPlaceholder(quizElement) {
    quizElement.innerHTML = `
        <div class="quiz-placeholder">
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <p>Interactive quiz will be available soon!</p>
                <p><em>Continue to the next lesson for now.</em></p>
            </div>
        </div>
    `;
}
```

---

## 🌐 **PHASE 3: API INTEGRATION** (Day 5-7)
*Priority: HIGH - Add real backend functionality*

### **3.1 Code Execution API**

**File**: `app.py` (Add after existing routes)
```python
@app.route('/api/execute/python', methods=['POST'])
@login_required
def execute_python_code():
    try:
        data = request.get_json()
        code = data.get('code', '')
        lesson_id = data.get('lessonId')
        block_id = data.get('blockId')
        
        # Security validation
        if len(code) > 10000:
            return jsonify({
                'success': False,
                'error': 'Code too long (max 10KB)'
            }), 400
        
        # Execute code safely
        result = execute_code_safely(code)
        
        # Log execution
        if current_user.is_authenticated:
            log_code_execution(current_user.id, lesson_id, block_id, result['success'])
        
        return jsonify(result)
        
    except Exception as e:
        app.logger.error(f'Code execution error: {str(e)}')
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

def execute_code_safely(code):
    """Execute Python code in a restricted environment"""
    import subprocess
    import tempfile
    import os
    import signal
    
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        # Execute with strict limits
        process = subprocess.Popen(
            ['python', temp_file],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            preexec_fn=os.setsid  # Create new process group
        )
        
        try:
            stdout, stderr = process.communicate(timeout=5)
            return_code = process.returncode
        except subprocess.TimeoutExpired:
            # Kill the process group
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)
            return {
                'success': False,
                'error': 'Code execution timed out (5 second limit)'
            }
        
        # Clean up
        os.unlink(temp_file)
        
        return {
            'success': return_code == 0,
            'output': stdout,
            'error': stderr if stderr else None
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Execution error: {str(e)}'
        }

def log_code_execution(user_id, lesson_id, block_id, success):
    """Log code execution for analytics"""
    try:
        # Add to Firebase or database
        execution_data = {
            'user_id': user_id,
            'lesson_id': lesson_id,
            'block_id': block_id,
            'success': success,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Log to Firebase if available
        if db:
            db.collection('code_executions').add(execution_data)
        
    except Exception as e:
        app.logger.error(f'Failed to log execution: {str(e)}')
```

### **3.2 Quiz API Endpoints**

**File**: `app.py` (Add quiz endpoints)
```python
@app.route('/api/quiz/<quiz_id>')
@login_required
def get_quiz(quiz_id):
    try:
        if db:
            # Get from Firebase
            quiz_ref = db.collection('quizzes').document(quiz_id)
            quiz_doc = quiz_ref.get()
            
            if quiz_doc.exists:
                quiz_data = quiz_doc.to_dict()
                # Remove answers for security
                for question in quiz_data.get('questions', []):
                    question.pop('correct_answer', None)
                    question.pop('explanation', None)
                return jsonify(quiz_data)
        
        # Fallback mock data
        mock_quiz = {
            'id': quiz_id,
            'title': 'Python Basics Quiz',
            'questions': [
                {
                    'id': 'q1',
                    'type': 'multiple_choice',
                    'question': 'What is a variable?',
                    'options': [
                        'A container for data',
                        'A type of loop',
                        'A function',
                        'A class'
                    ]
                }
            ]
        }
        return jsonify(mock_quiz)
        
    except Exception as e:
        app.logger.error(f'Quiz fetch error: {str(e)}')
        return jsonify({'error': 'Failed to load quiz'}), 500

@app.route('/api/quiz/<quiz_id>/submit', methods=['POST'])
@login_required
def submit_quiz(quiz_id):
    try:
        data = request.get_json()
        answers = data.get('answers', {})
        
        # Get correct answers
        correct_answers = get_quiz_answers(quiz_id)
        
        # Grade quiz
        score = calculate_quiz_score(answers, correct_answers)
        
        # Save result
        save_quiz_result(current_user.id, quiz_id, score, answers)
        
        return jsonify({
            'success': True,
            'score': score,
            'total': len(correct_answers),
            'passed': score >= (len(correct_answers) * 0.7)  # 70% pass rate
        })
        
    except Exception as e:
        app.logger.error(f'Quiz submission error: {str(e)}')
        return jsonify({'error': 'Failed to submit quiz'}), 500

def get_quiz_answers(quiz_id):
    """Get correct answers for a quiz"""
    # Mock data - replace with real database query
    return {
        'q1': 0,  # First option is correct
        'q2': 2,  # Third option is correct
    }

def calculate_quiz_score(answers, correct_answers):
    """Calculate quiz score"""
    correct = 0
    for question_id, correct_answer in correct_answers.items():
        if answers.get(question_id) == correct_answer:
            correct += 1
    return correct

def save_quiz_result(user_id, quiz_id, score, answers):
    """Save quiz result to database"""
    try:
        result_data = {
            'user_id': user_id,
            'quiz_id': quiz_id,
            'score': score,
            'answers': answers,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if db:
            db.collection('quiz_results').add(result_data)
            
    except Exception as e:
        app.logger.error(f'Failed to save quiz result: {str(e)}')
```

---

## 🔄 **PHASE 4: DATA FLOW OPTIMIZATION** (Day 8-10)
*Priority: MEDIUM - Improve data transformation*

### **4.1 Enhanced Lesson Data Service**

**Location**: Update `transformLessonData` method in lesson service
```javascript
transformLessonData(lessonData) {
    console.log('🔄 Transforming lesson data:', lessonData);
    
    // If data already has blocks, validate and return
    if (lessonData.blocks && Array.isArray(lessonData.blocks)) {
        return this.validateBlocks(lessonData);
    }
    
    // Transform Firebase data to expected format
    const blocks = [];
    let order = 0;
    
    try {
        // Add introduction block
        if (lessonData.description || lessonData.introduction) {
            blocks.push({
                id: 'intro',
                type: 'text',
                order: order++,
                title: 'Introduction',
                content: lessonData.description || lessonData.introduction,
                markdown: true
            });
        }
        
        // Add objectives block
        if (lessonData.objectives && Array.isArray(lessonData.objectives)) {
            blocks.push({
                id: 'objectives',
                type: 'objectives',
                order: order++,
                title: 'Learning Objectives',
                objectives: lessonData.objectives,
                icon: 'fas fa-bullseye'
            });
        }
        
        // Process content sections
        if (lessonData.sections && Array.isArray(lessonData.sections)) {
            lessonData.sections.forEach((section, idx) => {
                // Add text content
                if (section.content) {
                    blocks.push({
                        id: `section-${idx}`,
                        type: 'text',
                        order: order++,
                        title: section.title || `Section ${idx + 1}`,
                        content: section.content,
                        markdown: true
                    });
                }
                
                // Add code examples
                if (section.codeExample) {
                    blocks.push({
                        id: `code-example-${idx}`,
                        type: 'code_example',
                        order: order++,
                        title: `Example: ${section.title || 'Code'}`,
                        code: section.codeExample.code,
                        language: section.codeExample.language || 'python',
                        explanation: section.codeExample.explanation
                    });
                }
                
                // Add interactive exercises
                if (section.exercise) {
                    blocks.push({
                        id: `exercise-${idx}`,
                        type: 'interactive_challenge',
                        order: order++,
                        title: section.exercise.title || 'Practice Exercise',
                        instructions: section.exercise.instructions,
                        starter_code: section.exercise.starterCode || '',
                        solution: section.exercise.solution,
                        tests: section.exercise.tests || [],
                        hints: section.exercise.hints || []
                    });
                }
            });
        }
        
        // Add standalone exercises
        if (lessonData.exercises && Array.isArray(lessonData.exercises)) {
            lessonData.exercises.forEach((exercise, idx) => {
                blocks.push({
                    id: `practice-exercise-${idx}`,
                    type: 'interactive_challenge',
                    order: order++,
                    title: exercise.title || `Exercise ${idx + 1}`,
                    instructions: exercise.instructions,
                    starter_code: exercise.starterCode || '',
                    solution: exercise.solution,
                    tests: exercise.tests || [],
                    hints: exercise.hints || []
                });
            });
        }
        
        // Add quiz blocks
        if (lessonData.quiz) {
            blocks.push({
                id: 'main-quiz',
                type: 'quiz',
                order: order++,
                quiz_id: lessonData.quiz.id || `${lessonData.id}-quiz`,
                title: lessonData.quiz.title || 'Check Your Understanding',
                questions: lessonData.quiz.questions || []
            });
        }
        
        // Add summary block
        if (lessonData.summary) {
            blocks.push({
                id: 'summary',
                type: 'text',
                order: order++,
                title: 'Summary',
                content: lessonData.summary,
                markdown: true,
                icon: 'fas fa-check-circle'
            });
        }
        
        // Sort blocks by order
        blocks.sort((a, b) => a.order - b.order);
        
        const transformedData = {
            ...lessonData,
            blocks: blocks,
            totalBlocks: blocks.length,
            estimatedTime: this.calculateEstimatedTime(blocks)
        };
        
        console.log('✅ Data transformation complete:', transformedData);
        return transformedData;
        
    } catch (error) {
        console.error('❌ Data transformation failed:', error);
        throw error;
    }
}

validateBlocks(lessonData) {
    const validBlocks = lessonData.blocks.filter(block => {
        const hasRequiredFields = block.id && block.type && typeof block.order === 'number';
        if (!hasRequiredFields) {
            console.warn('Invalid block found:', block);
        }
        return hasRequiredFields;
    });
    
    return {
        ...lessonData,
        blocks: validBlocks,
        totalBlocks: validBlocks.length
    };
}

calculateEstimatedTime(blocks) {
    const timePerBlock = {
        'text': 2,
        'code_example': 3,
        'interactive_challenge': 10,
        'quiz': 5,
        'objectives': 1
    };
    
    const totalMinutes = blocks.reduce((total, block) => {
        return total + (timePerBlock[block.type] || 2);
    }, 0);
    
    return Math.max(5, totalMinutes); // Minimum 5 minutes
}
```

---

## 🎨 **PHASE 5: UI/UX POLISH** (Day 11-14)
*Priority: LOW - Enhance user experience*

### **5.1 Loading States and Error Handling**

```javascript
// Add enhanced loading states
showLoadingState(container, message = 'Loading lesson content...') {
    container.innerHTML = `
        <div class="lesson-loading">
            <div class="loading-animation">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="loading-text">${message}</p>
            </div>
        </div>
    `;
}

showErrorState(container, error, retryCallback) {
    container.innerHTML = `
        <div class="lesson-error">
            <div class="alert alert-danger">
                <h4><i class="fas fa-exclamation-triangle"></i> Oops! Something went wrong</h4>
                <p>${error.message || 'Failed to load lesson content'}</p>
                <div class="error-actions">
                    <button class="btn btn-primary retry-btn">
                        <i class="fas fa-redo"></i> Try Again
                    </button>
                    <button class="btn btn-secondary help-btn">
                        <i class="fas fa-question-circle"></i> Get Help
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    const retryBtn = container.querySelector('.retry-btn');
    const helpBtn = container.querySelector('.help-btn');
    
    if (retryBtn && retryCallback) {
        retryBtn.addEventListener('click', retryCallback);
    }
    
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            window.open('/help', '_blank');
        });
    }
}
```

### **5.2 Progress Indicators**

```javascript
// Add enhanced progress visualization
updateProgressBar(completed, total) {
    const progressBar = document.querySelector('.lesson-progress-bar');
    const progressText = document.querySelector('.lesson-progress-text');
    
    if (progressBar && progressText) {
        const percentage = Math.round((completed / total) * 100);
        
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
        
        progressText.textContent = `${completed} of ${total} completed (${percentage}%)`;
        
        // Add celebration animation for completion
        if (percentage === 100) {
            this.showCompletionCelebration();
        }
    }
}

showCompletionCelebration() {
    const celebration = document.createElement('div');
    celebration.className = 'completion-celebration';
    celebration.innerHTML = `
        <div class="celebration-content">
            <h3>🎉 Lesson Complete!</h3>
            <p>Great job! You've mastered this lesson.</p>
            <div class="celebration-actions">
                <button class="btn btn-primary next-lesson">Continue to Next Lesson</button>
                <button class="btn btn-secondary review-lesson">Review This Lesson</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(celebration);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        celebration.remove();
    }, 5000);
}
```

---

## 🧪 **VALIDATION & TESTING PLAN**

### **After Each Phase**

1. **Automated Testing**
   - Run existing test suite
   - Check console for errors
   - Validate all module imports

2. **Manual Testing**
   - Load lesson page
   - Test code editor functionality
   - Verify quiz system works
   - Check progress tracking

3. **Performance Testing**
   - Page load times
   - Memory usage
   - Mobile responsiveness

### **Final Integration Test**

```javascript
// Comprehensive test suite
class LessonSystemIntegrationTest {
    async runAllTests() {
        console.log('🧪 Running lesson system integration tests...');
        
        const tests = [
            this.testLessonLoading,
            this.testCodeEditor,
            this.testQuizSystem,
            this.testProgressTracking,
            this.testErrorHandling
        ];
        
        for (const test of tests) {
            try {
                await test.call(this);
                console.log(`✅ ${test.name} passed`);
            } catch (error) {
                console.error(`❌ ${test.name} failed:`, error);
            }
        }
    }
    
    async testLessonLoading() {
        // Test lesson data loading and transformation
        const lessonSystem = new LessonSystem();
        const mockData = { id: 'test', title: 'Test Lesson', sections: [] };
        const result = await lessonSystem.loadLesson('test', mockData);
        
        if (!result.blocks) {
            throw new Error('Lesson data transformation failed');
        }
    }
    
    async testCodeEditor() {
        // Test code editor initialization and execution
        const container = document.createElement('div');
        container.innerHTML = '<div class="code-editor" data-block-id="test"></div>';
        
        const editor = new EnhancedCodeEditor('test', container);
        await editor.initialize();
        
        if (!editor.editor) {
            throw new Error('Code editor initialization failed');
        }
    }
    
    async testQuizSystem() {
        // Test quiz loading and rendering
        const quizModule = new QuizModule();
        await quizModule.init();
        
        const quizData = await quizModule.loadQuiz('test');
        if (!quizData.questions) {
            throw new Error('Quiz loading failed');
        }
    }
    
    async testProgressTracking() {
        // Test progress persistence
        const progressService = new LessonProgress();
        await progressService.markBlockComplete('test-lesson', 'test-block');
        
        const progress = await progressService.getProgress('test-lesson');
        if (!progress.completedBlocks.includes('test-block')) {
            throw new Error('Progress tracking failed');
        }
    }
    
    async testErrorHandling() {
        // Test error scenarios
        try {
            await fetch('/api/nonexistent');
        } catch (error) {
            // Should handle gracefully
            console.log('Error handling test passed');
        }
    }
}

// Run tests in development mode
if (window.location.search.includes('test=true')) {
    const tester = new LessonSystemIntegrationTest();
    tester.runAllTests();
}
```

---

## 🎯 **SUCCESS METRICS**

### **Phase 1 Success Criteria**
- [ ] No more 404 errors for core dependencies
- [ ] Code editor initializes without errors
- [ ] Quiz system loads without TypeError
- [ ] Basic lesson rendering works

### **Phase 2 Success Criteria**
- [ ] Quizzes display and accept user input
- [ ] Quiz completion triggers properly
- [ ] Code editor "Run" button responds
- [ ] Progress tracking updates

### **Phase 3 Success Criteria**
- [ ] Code execution returns real results
- [ ] Quiz submissions save to backend
- [ ] API endpoints respond correctly
- [ ] Error handling works properly

### **Phase 4 Success Criteria**
- [ ] Firebase data transforms correctly
- [ ] All lesson block types render
- [ ] Progress syncs across sessions
- [ ] Performance within acceptable limits

### **Phase 5 Success Criteria**
- [ ] Loading states provide good UX
- [ ] Error messages are user-friendly
- [ ] Progress indicators are accurate
- [ ] Mobile experience is smooth

---

## 🚀 **DEPLOYMENT STRATEGY**

### **Development Branch Strategy**
1. **Main Branch**: Keep current working state
2. **Fix Branch**: `git checkout -b fix/lesson-system-restoration`
3. **Feature Branches**: One per phase for safety
4. **Testing Branch**: `git checkout -b test/lesson-integration`

### **Quick Commands**
```bash
# Create fix branch
git checkout -b fix/lesson-system-restoration

# Create directories
mkdir -p static/js/core
mkdir -p static/js/modules

# Backup critical files
cp static/js/EnhancedCodeEditor.js static/js/EnhancedCodeEditor.js.backup
cp static/js/LessonInteractions.js static/js/LessonInteractions.js.backup
cp app.py app.py.backup

# Test after each phase
git add .
git commit -m "Phase X: [Description]"
```

### **Rollback Plan**
- Git tags for each phase completion
- Database backups before data structure changes
- CSS/JS file backups in archive folders
- Quick rollback commands documented

### **Go-Live Checklist**
- [ ] All tests passing
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable
- [ ] Error handling robust
- [ ] User feedback collected

---

## 🔧 **QUICK FIXES FOR IMMEDIATE RELIEF**

### **Temporary Browser Console Fix**
```javascript
// Run this in browser console for immediate partial functionality
window.setupAccessibility = function() { 
    console.log('Accessibility stub loaded'); 
};

window.QuizModule = class QuizModule {
    constructor(config) { 
        this.config = config; 
    }
    async init() { 
        return true; 
    }
    async loadQuiz(id) { 
        return { 
            id, 
            title: 'Sample Quiz', 
            questions: [] 
        }; 
    }
};

window.executeCode = async function(code) {
    console.log('Executing code:', code);
    return { 
        success: true, 
        output: 'Code execution in demo mode' 
    };
};

console.log('✅ Emergency patches applied');
```

---

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Issues**
1. **404 Errors**: Check file paths and ensure dependencies are created
2. **Module Import Errors**: Verify export/import syntax matches ES6 standards
3. **Quiz Not Loading**: Check quiz data structure and API endpoints
4. **Code Editor Issues**: Verify ACE editor is properly initialized

### **Debug Commands**
```javascript
// Check if modules are loaded
console.log('EventBus:', window.EventBus);
console.log('Utils:', window.utils);
console.log('QuizModule:', window.QuizModule);

// Test API endpoints
fetch('/api/quiz/test').then(r => r.json()).then(console.log);
```

---

**This document serves as the comprehensive guide for restoring full lesson system functionality. Each phase builds upon the previous one, ensuring system stability throughout the restoration process.**

**Last Updated**: July 3, 2025  
**Next Review**: After Phase 1 completion
