# 📖 Lesson Template - Implementation Plan

## 🎯 **Overview**
A dynamic, interactive lesson page that fetches content from Firebase, tracks progress in real-time, and provides an engaging learning experience with integrated quizzes, code challenges, and debugging exercises.

## 📊 **Current System Analysis**

### **Existing Features (from lesson.html)**
- ✅ Dynamic content blocks (text, code examples, quizzes, debugging)
- ✅ Subtopic navigation with tabs
- ✅ ACE code editor integration
- ✅ Quiz system with multiple question types
- ✅ Progress tracking per subtopic
- ✅ Code execution with output display
- ✅ Debug challenges with solution reveal

### **Firebase Integration Points**
- Lesson content from `lessons` collection
- Quiz data from `quizzes` collection
- Progress tracking in `users.lesson_progress`
- Activity logging to `activities` collection
- XP/PyCoins rewards system

## 🏗️ **Page Architecture**

### **URL Structure**
```
/lesson/{lesson_id}
/lesson/{lesson_id}/{subtopic_id}  (optional for direct subtopic access)
```

### **Data Flow**
```
1. User visits /lesson/python-basics
2. Fetch lesson data from Firebase
3. Check user's progress for this lesson
4. Render appropriate content blocks
5. Track interactions in real-time
6. Update progress and rewards
```

## 🎨 **Layout Structure**

```
┌─────────────────────────────────────────────────┐
│                  Top Navigation                  │
├─────────────────────────────────────────────────┤
│          Lesson Header & Progress Bar            │
│  ┌──────────────────────────────────────────┐  │
│  │ 🐍 Python Basics: Variables & Data Types │  │
│  │ ████████████░░░░░░ 60% Complete         │  │
│  └──────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│              Subtopic Tabs (if any)             │
│  [Intro] [Variables] [Data Types] [Practice]   │
├─────────────────────────────────────────────────┤
│                                                 │
│              Dynamic Content Area               │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │          Content Blocks Render Here       │  │
│  │                                          │  │
│  │  • Text explanations                     │  │
│  │  • Code examples with syntax highlight   │  │
│  │  • Interactive code editors              │  │
│  │  • Quizzes and challenges               │  │
│  │  • Debug exercises                       │  │
│  │                                          │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
├─────────────────────────────────────────────────┤
│          Lesson Navigation Controls             │
│  [← Previous Lesson]        [Next Lesson →]    │
└─────────────────────────────────────────────────┘
```

## 💻 **Technical Implementation**

### **1. Route Handler**
```python
# routes/lesson_routes.py
@app.route('/lesson/<lesson_id>')
@app.route('/lesson/<lesson_id>/<subtopic_id>')
def lesson(lesson_id, subtopic_id=None):
    # Get lesson from Firebase
    lesson_data = firebase_service.get_lesson(lesson_id)
    
    # Get user progress
    user_progress = firebase_service.get_user_lesson_progress(
        current_user.id, lesson_id
    )
    
    # Get associated quiz if any
    quiz_data = None
    if lesson_data.get('quiz_id'):
        quiz_data = firebase_service.get_quiz(lesson_data['quiz_id'])
    
    return render_template('lesson.html',
        lesson=lesson_data,
        progress=user_progress,
        quiz=quiz_data,
        current_subtopic=subtopic_id
    )
```

### **2. Firebase Data Structure**
```javascript
// Lesson document structure
{
  id: "python-basics",
  title: "Python Basics: Variables and Data Types",
  description: "Learn the fundamentals...",
  category: "fundamentals",
  difficulty: "beginner",
  estimated_time: 30,
  xp_reward: 100,
  coin_reward: 25,
  
  // Subtopics (optional)
  subtopics: [
    {
      id: "intro",
      title: "Introduction",
      order: 1,
      blocks: [...]
    },
    {
      id: "variables",
      title: "Variables",
      order: 2,
      blocks: [...]
    }
  ],
  
  // Content blocks
  blocks: [
    {
      id: "block_1",
      type: "text",
      content: "Welcome to Python basics..."
    },
    {
      id: "block_2",
      type: "code_example",
      language: "python",
      code: "x = 5\nprint(x)",
      explanation: "This creates a variable..."
    },
    {
      id: "block_3",
      type: "interactive",
      instructions: "Try creating your own variable",
      starter_code: "# Create a variable named 'age'\n",
      solution: "age = 25\nprint(age)",
      tests: [
        {
          input: "",
          expected_output: "25"
        }
      ]
    },
    {
      id: "block_4",
      type: "quiz",
      quiz_id: "python-basics-quiz-1"
    },
    {
      id: "block_5",
      type: "debug",
      label: "Fix the Bug",
      instructions: "This code has an error. Can you fix it?",
      buggy_code: "prin(\"Hello World\")",
      correct_code: "print(\"Hello World\")",
      hint: "Check the function name carefully"
    }
  ]
}
```

### **3. Content Block Renderers**

```javascript
// static/js/lesson-renderer.js
class LessonRenderer {
    constructor(lessonData, userProgress) {
        this.lesson = lessonData;
        this.progress = userProgress || {};
        this.completedBlocks = new Set(this.progress.completed_blocks || []);
        this.editors = {};
        this.quizManager = new QuizManager();
    }

    renderLesson() {
        const container = document.getElementById('lesson-content');
        container.innerHTML = '';
        
        const blocks = this.getCurrentBlocks();
        blocks.forEach((block, index) => {
            const element = this.createBlockElement(block, index);
            container.appendChild(element);
        });
        
        this.initializeEditors();
        this.updateProgressBar();
    }

    createBlockElement(block, index) {
        const wrapper = document.createElement('div');
        wrapper.className = `content-block ${block.type}-block`;
        wrapper.dataset.blockId = block.id;
        
        if (this.completedBlocks.has(block.id)) {
            wrapper.classList.add('completed');
        }
        
        switch(block.type) {
            case 'text':
                wrapper.innerHTML = this.renderTextBlock(block);
                break;
            case 'code_example':
                wrapper.innerHTML = this.renderCodeExample(block);
                break;
            case 'interactive':
                wrapper.innerHTML = this.renderInteractive(block);
                break;
            case 'quiz':
                wrapper.innerHTML = this.renderQuiz(block);
                break;
            case 'debug':
                wrapper.innerHTML = this.renderDebug(block);
                break;
        }
        
        return wrapper;
    }
}
```

### **4. Progress Tracking System**

```javascript
// Progress tracking with Firebase
class ProgressTracker {
    constructor(lessonId, userId) {
        this.lessonId = lessonId;
        this.userId = userId;
        this.completedBlocks = new Set();
        this.startTime = Date.now();
    }

    async markBlockComplete(blockId) {
        this.completedBlocks.add(blockId);
        
        // Update Firebase
        await firebase.firestore()
            .collection('users')
            .doc(this.userId)
            .update({
                [`lesson_progress.${this.lessonId}.completed_blocks`]: 
                    firebase.firestore.FieldValue.arrayUnion(blockId),
                [`lesson_progress.${this.lessonId}.last_accessed`]: 
                    firebase.firestore.FieldValue.serverTimestamp()
            });
        
        // Check if lesson complete
        if (this.isLessonComplete()) {
            await this.completeLessonWithRewards();
        }
    }

    async completeLessonWithRewards() {
        const lessonDoc = await firebase.firestore()
            .collection('lessons')
            .doc(this.lessonId)
            .get();
        
        const lesson = lessonDoc.data();
        
        // Award XP and PyCoins
        await firebase.firestore()
            .collection('users')
            .doc(this.userId)
            .update({
                xp: firebase.firestore.FieldValue.increment(lesson.xp_reward),
                pycoins: firebase.firestore.FieldValue.increment(lesson.coin_reward),
                [`lesson_progress.${this.lessonId}.completed`]: true,
                [`lesson_progress.${this.lessonId}.completion_date`]: 
                    firebase.firestore.FieldValue.serverTimestamp()
            });
        
        // Show completion animation
        this.showCompletionReward(lesson.xp_reward, lesson.coin_reward);
    }
}
```

### **5. Interactive Code Editor**

```javascript
// Enhanced ACE editor integration
class InteractiveCodeEditor {
    constructor(blockId, config) {
        this.blockId = blockId;
        this.config = config;
        this.editor = null;
        this.outputElement = null;
    }

    initialize() {
        const editorId = `editor-${this.blockId}`;
        this.editor = ace.edit(editorId);
        
        // Configure editor
        this.editor.setTheme("ace/theme/monokai");
        this.editor.session.setMode(`ace/mode/${this.config.language}`);
        this.editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            fontSize: "14px",
            showPrintMargin: false
        });
        
        // Set starter code
        if (this.config.starter_code) {
            this.editor.setValue(this.config.starter_code, -1);
        }
        
        // Auto-save to localStorage
        this.editor.on('change', () => {
            this.saveProgress();
        });
    }

    async runCode() {
        const code = this.editor.getValue();
        this.showLoading();
        
        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    language: this.config.language,
                    lesson_id: this.lessonId,
                    block_id: this.blockId
                })
            });
            
            const result = await response.json();
            this.displayOutput(result);
            
            // Check if tests pass
            if (this.config.tests && this.runTests(result.output)) {
                this.markComplete();
            }
        } catch (error) {
            this.displayError(error);
        }
    }
}
```

### **6. Quiz Integration**

```javascript
// Enhanced quiz system
class QuizManager {
    constructor() {
        this.currentQuiz = null;
        this.answers = {};
        this.startTime = null;
    }

    async loadQuiz(quizId) {
        const quizDoc = await firebase.firestore()
            .collection('quizzes')
            .doc(quizId)
            .get();
        
        this.currentQuiz = quizDoc.data();
        this.startTime = Date.now();
        this.renderQuiz();
    }

    renderQuiz() {
        // Dynamic quiz rendering based on question types
        const container = document.getElementById(`quiz-${this.currentQuiz.id}`);
        
        this.currentQuiz.questions.forEach((question, index) => {
            const questionElement = this.createQuestionElement(question, index);
            container.appendChild(questionElement);
        });
    }

    async submitQuiz() {
        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);
        const score = this.calculateScore();
        
        // Save results to Firebase
        await firebase.firestore()
            .collection('quiz_attempts')
            .add({
                user_id: currentUser.id,
                quiz_id: this.currentQuiz.id,
                lesson_id: currentLesson.id,
                score: score,
                answers: this.answers,
                time_taken: timeTaken,
                attempted_at: firebase.firestore.FieldValue.serverTimestamp()
            });
        
        // Update user progress
        if (score >= this.currentQuiz.passing_score) {
            await this.awardQuizRewards();
        }
        
        this.showResults(score);
    }
}
```

## 🎨 **UI/UX Features**

### **Visual Enhancements**
```css
/* Glassmorphism for content blocks */
.content-block {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem;
    transition: all 0.3s ease;
}

.content-block:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* Progress indicator */
.block-progress-indicator {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--bg-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
}

.block-progress-indicator.completed {
    background: var(--success-color);
    animation: checkmark 0.5s ease;
}

/* Code editor enhancements */
.code-editor-wrapper {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.editor-toolbar {
    background: var(--bg-secondary);
    padding: 0.5rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Output console */
.output-console {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 0 0 12px 12px;
    font-family: 'Consolas', 'Monaco', monospace;
    min-height: 100px;
    max-height: 300px;
    overflow-y: auto;
}
```

### **Interactive Features**

1. **Real-time Progress Bar**
   - Updates as user completes blocks
   - Shows XP gained in real-time
   - Milestone animations

2. **Smart Hints System**
   - Progressive hints (consume PyCoins)
   - Context-aware suggestions
   - AI-powered help (future)

3. **Code Validation**
   - Syntax checking before run
   - Test case visualization
   - Performance metrics

4. **Gamification Elements**
   - Block completion animations
   - Streak bonuses for consecutive correct answers
   - Achievement popups
   - Sound effects (optional)

## 🔄 **API Endpoints**

### **Lesson Management**
```python
# Get lesson content
GET /api/lesson/<lesson_id>

# Update lesson progress
POST /api/lesson/<lesson_id>/progress
{
    "block_id": "block_1",
    "completed": true,
    "time_spent": 120
}

# Run code
POST /api/lesson/<lesson_id>/run-code
{
    "block_id": "block_3",
    "code": "print('Hello')",
    "language": "python"
}

# Submit quiz
POST /api/lesson/<lesson_id>/submit-quiz
{
    "quiz_id": "quiz_1",
    "answers": {...},
    "time_taken": 300
}

# Get hint
POST /api/lesson/<lesson_id>/hint
{
    "block_id": "block_5",
    "hint_level": 1
}
```

## 📱 **Mobile Responsive Design**

### **Breakpoints**
- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

### **Mobile Optimizations**
- Swipeable subtopic tabs
- Collapsible code examples
- Touch-friendly quiz interface
- Simplified code editor
- Bottom sheet for output

## 🚀 **Implementation Phases**

### **Phase 1: Core Functionality**
- [ ] Basic lesson rendering from Firebase
- [ ] Text and code example blocks
- [ ] Simple navigation
- [ ] Progress tracking

### **Phase 2: Interactive Elements**
- [ ] ACE editor integration
- [ ] Code execution
- [ ] Quiz system
- [ ] Debug challenges

### **Phase 3: Enhanced Features**
- [ ] Real-time progress sync
- [ ] Hint system
- [ ] Achievements
- [ ] Social sharing

### **Phase 4: Advanced**
- [ ] AI-powered hints
- [ ] Peer code review
- [ ] Live collaboration
- [ ] Video explanations

## 🔐 **Security Considerations**
- Validate all code execution server-side
- Rate limit API calls
- Sanitize user input
- Secure Firebase rules
- XSS prevention in rendered content

## 📊 **Performance Optimizations**
- Lazy load content blocks
- Cache lesson data locally
- Preload next lesson
- Optimize Firebase queries
- CDN for static assets

## 🎯 **Success Metrics**
- Average time per lesson
- Completion rates
- Quiz scores
- Code submission success
- User retention