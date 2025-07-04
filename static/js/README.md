# JavaScript Architecture - Code with Morais

## Overview

This document describes the JavaScript architecture for the Code with Morais learning platform. The system uses modern ES6 modules with a focus on maintainability, performance, and user experience.

## Architecture Principles

- **ES6 Modules**: All JavaScript uses modern ES6 import/export syntax
- **Single Entry Point**: Each feature has one main entry point
- **Service-Oriented**: Business logic separated into services
- **Event-Driven**: Components communicate via custom events
- **Progressive Enhancement**: Works without JavaScript, enhanced with it
- **Error Resilience**: Graceful fallbacks for all features

## Directory Structure

```
static/js/
├── lesson/                          # Lesson System (Main Feature)
│   ├── lesson-system.js            # 🚀 Main Entry Point
│   ├── services/                   # Business Logic
│   │   ├── LessonDataService.js    # Data fetching & caching
│   │   └── LessonProgress.js       # Progress tracking
│   ├── components/                 # UI Components
│   │   ├── LessonRenderer.js       # DOM rendering
│   │   └── LessonInteractions.js   # User interactions
│   ├── debug/                      # Development Tools
│   │   ├── lessonSystemTest.js     # Test suite
│   │   └── lessonDebugger.js       # Debug utilities
│   └── legacy/                     # Legacy compatibility
│       └── lessonFallback.js       # Fallback systems
├── quiz/                           # Quiz System
│   ├── QuizEngine.js               # Quiz logic
│   ├── QuizController.js           # Quiz management
│   ├── QuizState.js                # State management
│   └── renderers/                  # Quiz UI components
├── profile/                        # User Profile
│   └── ProgressVisualization.js    # Progress charts
├── services/                       # Shared Services
│   ├── SecureCodeSubmission.js     # Code execution
│   └── firebaseLessonService.js    # Firebase integration
├── utils/                          # Utilities
│   ├── performance-monitor.js      # Performance tracking
│   ├── errorRecoverySystem.js      # Error handling
│   └── css-lazy-loader.js          # Dynamic CSS loading
└── compatibility/                  # Browser compatibility
    └── legacy-lesson-renderer.js   # Legacy browser support
```

## Core Systems

### 1. Lesson System (`lesson/lesson-system.js`)

**Purpose**: Main entry point for all lesson functionality

**Key Features**:
- Lesson data loading and caching
- Progress tracking with Firebase sync
- Interactive element management
- Quiz system integration
- Code editor integration
- Error handling and fallbacks

**Usage**:
```javascript
import LessonSystem from '/static/js/lesson/lesson-system.js';

const lessonSystem = new LessonSystem();
await lessonSystem.initialize();

// Access public API
const api = lessonSystem.getApi();
api.markBlockCompleted('block-1');
```

**Events**:
- `lesson-initialized` - System ready
- `block-completed` - Block completion
- `progress-updated` - Progress changes
- `lesson-error` - Error occurred

### 2. Quiz System (`quiz/`)

**Purpose**: Interactive quiz functionality

**Components**:
- `QuizEngine.js` - Core quiz logic
- `QuizController.js` - Quiz management
- `QuizState.js` - State management
- `renderers/` - UI components for different question types

**Integration**:
```javascript
// Automatically loaded by lesson system when needed
document.addEventListener('quiz-completed', (event) => {
    const { blockId, score, passed } = event.detail;
    // Handle quiz completion
});
```

### 3. Services Layer

**Purpose**: Shared business logic and external integrations

**Key Services**:
- `LessonDataService.js` - Data fetching with caching
- `LessonProgress.js` - Progress tracking and sync
- `SecureCodeSubmission.js` - Code execution
- `firebaseLessonService.js` - Firebase integration

## Integration with Templates

### HTML Template Integration

```html
<!-- lesson.html -->
{% block extra_css %}
<!-- Consolidated CSS -->
<link rel="stylesheet" href="{{ url_for('static', filename='css/lessons.css') }}">
<link rel="stylesheet" href="{{ url_for('static', filename='css/components.css') }}">
{% endblock %}

<!-- Data injection -->
<script>
window.lessonData = {{ lesson | tojson if lesson else 'null' }};
window.lessonProgress = {{ lesson_progress | tojson if lesson_progress else '{}' }};
window.currentUser = {{ current_user | tojson if current_user else 'null' }};
</script>

<!-- Main system -->
<script type="module">
import LessonSystem from '{{ url_for("static", filename="js/lesson/lesson-system.js") }}';

document.addEventListener('DOMContentLoaded', async () => {
    const lessonSystem = new LessonSystem();
    await lessonSystem.initialize();
    
    // Global API access
    window.lessonSystem = lessonSystem;
    window.lessonAPI = lessonSystem.getApi();
});
</script>
```

### CSS Integration

**Consolidated CSS Architecture**:
- `lessons.css` - All lesson-specific styles
- `components.css` - Shared UI components
- `main.css` - Core imports and critical styles

## Performance Optimizations

### 1. Lazy Loading

```javascript
// Dependencies loaded only when needed
if (this.needsQuizSystem()) {
    await this.loadQuizSystem();
}

if (this.needsCodeEditor()) {
    await this.loadCodeEditor();
}
```

### 2. Efficient DOM Updates

```javascript
// Batch DOM updates
const fragment = document.createDocumentFragment();
blocks.forEach(block => {
    fragment.appendChild(createBlockElement(block));
});
container.appendChild(fragment);
```

### 3. Event Delegation

```javascript
// Single event listener for all blocks
document.addEventListener('click', (event) => {
    if (event.target.matches('.lesson-block')) {
        handleBlockClick(event);
    }
});
```

## Error Handling Strategy

### 1. Graceful Degradation

```javascript
try {
    await lessonSystem.initialize();
} catch (error) {
    console.error('❌ Lesson initialization failed:', error);
    showFallbackUI();
}
```

### 2. Service Fallbacks

```javascript
// Firebase fallback
async loadLessonData() {
    try {
        return await this.services.data.fetchLesson(this.lessonId);
    } catch (error) {
        console.warn('⚠️ Firebase unavailable, using template data');
        return window.lessonData;
    }
}
```

### 3. User-Friendly Messages

```javascript
handleLessonError(event) {
    const { error, blockId } = event.detail;
    this.services.renderer.showBlockError(blockId, 
        'Something went wrong. Please try again.');
}
```

## Development Guidelines

### 1. ES6 Module Standards

```javascript
// ✅ Good: Named exports for utilities
export { renderBlock, updateProgress };

// ✅ Good: Default export for main classes
export default class LessonSystem {
    // ...
}

// ✅ Good: Explicit imports
import { renderBlock } from './renderer.js';
import LessonSystem from './lesson-system.js';
```

### 2. Event-Driven Communication

```javascript
// ✅ Good: Custom events for loose coupling
document.dispatchEvent(new CustomEvent('block-completed', {
    detail: { blockId: 'block-1' }
}));

// ✅ Good: Event listeners for responses
document.addEventListener('block-completed', handleBlockCompleted);
```

### 3. Service Pattern

```javascript
// ✅ Good: Services for business logic
class LessonDataService {
    async fetchLesson(id) {
        // Data fetching logic
    }
    
    async cacheLesson(lesson) {
        // Caching logic
    }
}
```

## Testing Strategy

### 1. Unit Tests

```javascript
// lesson/debug/lessonSystemTest.js
export class LessonSystemTest {
    async runAllTests() {
        await this.testLessonLoading();
        await this.testProgressTracking();
        await this.testQuizIntegration();
    }
}
```

### 2. Integration Tests

```javascript
// Test lesson system with real data
const testLesson = {
    id: 'test-lesson',
    blocks: [
        { id: 'block-1', type: 'text', content: 'Test content' }
    ]
};

window.lessonData = testLesson;
const lessonSystem = new LessonSystem();
await lessonSystem.initialize();
```

### 3. Debug Mode

```javascript
// Access via URL: /lesson/python-basics?test=true
if (window.location.search.includes('test=true')) {
    const tester = new LessonSystemTest();
    await tester.runAllTests();
}
```

## Security Considerations

### 1. Code Execution

```javascript
// Secure code submission service
const codeResult = await secureCodeSubmission.execute(userCode, {
    timeout: 5000,
    sandbox: true,
    allowedModules: ['math', 'datetime']
});
```

### 2. Data Validation

```javascript
// Validate lesson data
transformLessonData(lessonData) {
    return {
        id: this.sanitizeId(lessonData.id),
        blocks: this.validateBlocks(lessonData.blocks),
        // ... more validation
    };
}
```

## Future Enhancements

### 1. Web Workers

```javascript
// Offload heavy computations
const worker = new Worker('/static/js/workers/lesson-processor.js');
worker.postMessage({ action: 'processLesson', data: lessonData });
```

### 2. Service Workers

```javascript
// Offline support
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/js/sw.js');
}
```

### 3. WebAssembly

```javascript
// High-performance code execution
const wasmModule = await WebAssembly.instantiateStreaming(
    fetch('/static/wasm/code-executor.wasm')
);
```

## Migration Notes

### From Legacy System

1. **CSS**: Migrated from 19 files to 12 consolidated files
2. **JS**: Converted from mixed ES5/ES6 to pure ES6 modules
3. **Templates**: Updated to use consolidated assets
4. **APIs**: Centralized through `lessonAPI` global object

### Compatibility

- **Modern Browsers**: Full ES6 support
- **Legacy Browsers**: Fallback scripts in `compatibility/`
- **Mobile**: Responsive design with touch support
- **Offline**: Service worker caching (planned)

## Performance Metrics

- **Initial Load**: ~200ms (target)
- **Lesson Render**: ~50ms (target)
- **Progress Update**: ~10ms (target)
- **Bundle Size**: ~400KB total CSS+JS

## Conclusion

This architecture provides a solid foundation for the Code with Morais learning platform, with room for future enhancements while maintaining backward compatibility and performance.
