# Code Editor Module

A comprehensive code editor system built with ACE editor, featuring modular architecture, robust error handling, and advanced code submission capabilities.

## Overview

The Code Editor Module consists of three main components:

- **EditorService**: Manages ACE editor instances and configurations
- **CodeSubmissionHandler**: Handles code execution, validation, and testing
- **EditorConfig**: Centralized configuration management

## Files Structure

```
js/editor/
├── editorService.js          # Core editor management
├── codeSubmissionHandler.js  # Code execution and testing
├── editorConfig.js          # Configuration management
└── editorIntegration.js     # Integration utilities and examples
```

## Features

### EditorService
- ✅ Multiple editor instance management
- ✅ ACE editor configuration and themes
- ✅ Keyboard shortcuts and commands
- ✅ Real-time code validation
- ✅ Event-driven architecture
- ✅ Performance metrics tracking

### CodeSubmissionHandler
- ✅ Asynchronous code execution
- ✅ Test case validation
- ✅ Error handling and display
- ✅ Progress tracking
- ✅ Submission history
- ✅ Batch processing queue

### EditorConfig
- ✅ Language-specific configurations
- ✅ Theme management
- ✅ Mobile optimization settings
- ✅ Security configurations
- ✅ Feature flags

## Quick Start

### Basic Setup

```html
<!-- Include required dependencies -->
<script src="/static/libs/ace/ace.js"></script>
<script src="/static/js/eventBus.js"></script>
<script src="/static/js/config.js"></script>
<script src="/static/js/constants.js"></script>

<!-- Include editor modules -->
<script src="/static/js/editor/editorConfig.js"></script>
<script src="/static/js/editor/editorService.js"></script>
<script src="/static/js/editor/codeSubmissionHandler.js"></script>
<script src="/static/js/editor/editorIntegration.js"></script>
```

### HTML Structure

```html
<div class="code-editor-container">
    <!-- Editor element -->
    <div id="code-editor-1" 
         data-editor="true"
         data-language="python"
         data-block-id="lesson-1-block-1"
         data-enable-tests="true">
        # Initial code here
        print("Hello, World!")
    </div>
    
    <!-- Controls -->
    <div class="editor-controls">
        <button id="run-btn-lesson-1-block-1" class="btn btn-primary">Run Code</button>
        <button id="reset-btn-lesson-1-block-1" class="btn btn-secondary">Reset</button>
        <button id="hint-btn-lesson-1-block-1" class="btn btn-info">Hint</button>
    </div>
    
    <!-- Output areas -->
    <div id="output-code-editor-1" class="code-output"></div>
    <div id="tests-code-editor-1" class="test-results"></div>
</div>
```

### JavaScript Usage

```javascript
// Create a single editor
const editor = EditorUtils.initialize('code-editor-1', 'lesson-1-block-1', {
    language: 'python',
    theme: 'github',
    enableTests: true,
    code: 'print("Hello, World!")'
});

// Initialize all editors on page
EditorUtils.initializeAll();

// Run code programmatically
codeSubmissionHandler.submitCode('code-editor-1');

// Get editor content
const code = editorService.getCode('code-editor-1');

// Set editor content
editorService.setCode('code-editor-1', 'print("New code")');
```

## Configuration

### Language Configuration

```javascript
// Python configuration
const pythonConfig = {
    language: 'python',
    mode: 'ace/mode/python',
    theme: 'ace/theme/github',
    executionEndpoint: '/run_python',
    placeholder: '# Write your Python code here...',
    keywords: ['def', 'class', 'if', 'for', 'while', 'try', 'except']
};

// Create editor with custom config
editorService.createEditor('my-editor', pythonConfig);
```

### Theme Configuration

```javascript
// Apply dark theme to all editors
editorService.updateAllEditorsTheme('dark');

// Custom theme configuration
EditorConfig.ui.themes.custom = {
    background: '#2d3748',
    foreground: '#e2e8f0',
    accent: '#4299e1'
};
```

### Mobile Configuration

```javascript
// Mobile-optimized settings
const mobileConfig = EditorConfig.getMobileConfig();

// Apply mobile settings
editorService.createEditor('mobile-editor', {
    ...mobileConfig,
    options: {
        ...mobileConfig.options,
        fontSize: 16,
        scrollPastEnd: 0.5
    }
});
```

## Event System

The editor module uses an event-driven architecture with the following events:

### Editor Events

```javascript
// Listen for editor creation
eventBus.on('editor:created', (data) => {
    console.log('Editor created:', data.editorId);
});

// Listen for code changes
eventBus.on('editor:change', (data) => {
    console.log('Code changed in:', data.editorId);
});

// Listen for validation results
eventBus.on('editor:validation', (data) => {
    if (data.validation.errors.length > 0) {
        console.log('Validation errors:', data.validation.errors);
    }
});
```

### Submission Events

```javascript
// Listen for submission start
eventBus.on('submission:start', (data) => {
    console.log('Code execution started:', data.submissionId);
});

// Listen for submission completion
eventBus.on('submission:complete', (data) => {
    console.log('Execution completed:', data.success);
});

// Listen for test results
eventBus.on('submission:tests:complete', (data) => {
    console.log(`Tests: ${data.passedTests}/${data.totalTests} passed`);
});
```

## API Endpoints

The module expects the following backend endpoints:

### Code Execution
- `POST /run_python` - Execute Python code
- `POST /run_javascript` - Execute JavaScript code
- `POST /run_java` - Execute Java code

### Validation and Testing
- `POST /api/validate-code` - Validate code syntax
- `POST /api/execute-test` - Execute test cases
- `GET /api/lesson-blocks/{id}/tests` - Get test cases for a block

### Request/Response Format

```javascript
// Execution request
{
    "code": "print('Hello, World!')",
    "language": "python",
    "inputs": "",
    "timeout": 10000
}

// Execution response
{
    "success": true,
    "output": "Hello, World!\n",
    "error": null,
    "executionTime": 150
}

// Test case format
{
    "name": "Test basic output",
    "testCode": "assert output.strip() == 'Hello, World!'",
    "expected": "Hello, World!",
    "setup": "# Setup code here"
}
```

## Keyboard Shortcuts

Default keyboard shortcuts (configurable in EditorConfig):

- **Ctrl/Cmd + Enter**: Run code
- **Ctrl/Cmd + /**: Toggle comment
- **F1**: Show hint
- **Ctrl/Cmd + R**: Reset code
- **Ctrl/Cmd + Shift + S**: Show solution
- **F11**: Toggle fullscreen
- **Ctrl/Cmd + S**: Save code
- **Ctrl/Cmd + Shift + F**: Format code

## Error Handling

The module provides comprehensive error handling:

### Client-Side Validation
- Syntax checking
- Indentation validation
- Basic structure analysis

### Execution Errors
- Timeout handling
- Network error recovery
- Server error display

### User-Friendly Messages
- Clear error descriptions
- Line number references
- Helpful suggestions

## Performance Metrics

Track editor and submission performance:

```javascript
// Get comprehensive metrics
const metrics = EditorUtils.getMetrics();

console.log('Editor Metrics:', {
    activeEditors: metrics.editors.activeEditors,
    totalSubmissions: metrics.submissions.totalSubmissions,
    successRate: metrics.submissions.successRate,
    averageExecutionTime: metrics.submissions.averageExecutionTime
});
```

## Customization

### Custom Language Support

```javascript
// Add new language configuration
EditorConfig.languageConfigs.rust = {
    mode: 'ace/mode/rust',
    theme: 'ace/theme/github',
    executionEndpoint: '/run_rust',
    keywords: ['fn', 'let', 'mut', 'if', 'else', 'loop', 'while', 'for'],
    placeholder: '// Write your Rust code here...\nfn main() {\n    println!("Hello, World!");\n}'
};
```

### Custom Themes

```javascript
// Add custom theme
EditorConfig.ui.themes.myTheme = {
    background: '#1a1a1a',
    foreground: '#f0f0f0',
    accent: '#ff6b6b',
    success: '#51cf66',
    warning: '#ffd93d',
    error: '#ff6b6b'
};
```

### Custom Validation

```javascript
// Override validation function
CodeSubmissionHandler.prototype.performClientValidation = function(code, language) {
    // Custom validation logic
    const errors = [];
    const warnings = [];
    
    // Your validation rules here
    
    return { errors, warnings };
};
```

## Best Practices

1. **Initialize Early**: Load editor modules after DOM content is ready
2. **Error Handling**: Always wrap editor operations in try-catch blocks
3. **Memory Management**: Destroy editors when no longer needed
4. **Performance**: Use debouncing for real-time validation
5. **Accessibility**: Ensure keyboard navigation works properly
6. **Mobile**: Test touch interactions on mobile devices

## Troubleshooting

### Common Issues

1. **ACE Not Loading**: Ensure ACE library is loaded before editor modules
2. **Editor Not Found**: Check element IDs match configuration
3. **Submission Fails**: Verify backend endpoints are available
4. **Tests Not Running**: Check test case format and API endpoints

### Debug Mode

```javascript
// Enable debug logging
EditorConfig.debug = true;

// Get detailed metrics
console.log('Debug Info:', {
    editors: editorService.getMetrics(),
    submissions: codeSubmissionHandler.getMetrics(),
    activeSubmissions: codeSubmissionHandler.activeSubmissions.size
});
```

## Dependencies

- **ACE Editor**: Code editing functionality
- **EventBus**: Event communication system
- **Config**: Application configuration
- **Constants**: API endpoints and constants

## Browser Support

- Modern browsers with ES6+ support
- Mobile browsers with touch support
- Internet Explorer 11+ (with polyfills)

## Contributing

When contributing to the editor module:

1. Follow the existing code style
2. Add comprehensive error handling
3. Include event emissions for tracking
4. Update configuration as needed
5. Test across different browsers and devices
