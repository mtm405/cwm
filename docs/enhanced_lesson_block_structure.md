# Enhanced Lesson Block Structure Documentation

This document outlines the structure and block types available in the enhanced lesson system.

## Lesson Structure

Each lesson consists of:

1. **Lesson Metadata**: Top-level information about the lesson
2. **Blocks**: Individual content units organized in a specific order

### Lesson Metadata Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier for the lesson |
| title | string | Title of the lesson |
| description | string | Brief description of the lesson content |
| order | number | Position in the course sequence |
| difficulty | string | "beginner", "intermediate", or "advanced" |
| estimated_time | number | Estimated completion time in minutes |
| prerequisites | array | List of lesson IDs that should be completed first |
| tags | array | Keywords related to the lesson content |
| xp_reward | number | Experience points gained upon completion |
| pycoins_reward | number | PyCoins currency gained upon completion |
| quiz_id | string | ID of the associated quiz (if any) |
| created_at | string | ISO timestamp when the lesson was created |
| updated_at | string | ISO timestamp when the lesson was last updated |
| is_published | boolean | Whether the lesson is visible to users |

## Block Types

Each block has common fields:
- `id`: Unique identifier
- `type`: The block type
- `order`: Position in the lesson sequence
- `title`: Title/heading for the block

### 1. Text Block

Basic text content with Markdown support.

```json
{
  "id": "intro-text",
  "type": "text",
  "order": 0,
  "title": "Introduction",
  "content": "# Heading\n\nThis is markdown content with **bold** and *italic* text."
}
```

### 2. Code Example Block

Code snippets with explanations.

```json
{
  "id": "example-code-1",
  "type": "code_example",
  "order": 1,
  "title": "Hello World Example",
  "language": "python",
  "code": "print('Hello, World!')",
  "explanation": "This code prints a greeting message to the console."
}
```

### 3. Interactive Block

Interactive coding exercises with starter code, solutions, and hints.

```json
{
  "id": "exercise-1",
  "type": "interactive",
  "order": 2,
  "title": "Your First Function",
  "instructions": "Write a function that returns the sum of two numbers.",
  "starter_code": "def add_numbers(a, b):\n    # Your code here\n    pass",
  "solution": "def add_numbers(a, b):\n    return a + b",
  "hints": [
    "Use the + operator to add the two numbers",
    "Don't forget to return the result"
  ]
}
```

### 4. Quiz Block

A reference to a quiz from the quizzes collection.

```json
{
  "id": "knowledge-check",
  "type": "quiz",
  "order": 3,
  "title": "Knowledge Check",
  "description": "Test your understanding of the concepts",
  "quiz_id": "python-basics-quiz"
}
```

### 5. Video Block

Embedded video content with description.

```json
{
  "id": "video-tutorial",
  "type": "video",
  "order": 4,
  "title": "Visual Guide to Functions",
  "video_url": "https://example.com/videos/python-functions",
  "thumbnail": "https://example.com/thumbnails/python-functions.jpg",
  "duration": 320,
  "description": "This video explains Python functions with examples."
}
```

### 6. Text with Questions Block

Text content with embedded questions for self-assessment.

```json
{
  "id": "concept-check",
  "type": "text_with_questions",
  "order": 5,
  "title": "Understanding Key Concepts",
  "content": "Functions in Python are defined using the def keyword...",
  "questions": [
    {
      "question": "What keyword is used to define a function in Python?",
      "answer": "The 'def' keyword is used to define a function in Python."
    }
  ]
}
```

### 7. Code Challenge Block

More complex coding challenges with test cases.

```json
{
  "id": "coding-challenge-1",
  "type": "code_challenge",
  "order": 6,
  "title": "Fibonacci Sequence",
  "description": "Write a function to generate the Fibonacci sequence.",
  "instructions": "Create a function that returns the first n Fibonacci numbers.",
  "starter_code": "def fibonacci(n):\n    # Your code here\n    pass",
  "solution": "def fibonacci(n):\n    result = []\n    a, b = 0, 1\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result",
  "test_cases": [
    {
      "input": "5",
      "expected_output": "[0, 1, 1, 2, 3]"
    }
  ],
  "difficulty": "medium"
}
```

### 8. Interactive Diagram Block

Visual diagrams that users can interact with.

```json
{
  "id": "flow-diagram",
  "type": "interactive_diagram",
  "order": 7,
  "title": "Function Execution Flow",
  "diagram_type": "flowchart",
  "diagram_data": {
    "nodes": [
      {"id": "start", "label": "Start", "type": "start"},
      {"id": "process", "label": "Process Data", "type": "process"},
      {"id": "end", "label": "End", "type": "end"}
    ],
    "edges": [
      {"from": "start", "to": "process"},
      {"from": "process", "to": "end"}
    ]
  },
  "description": "This diagram shows the execution flow of a function."
}
```

## Implementing New Block Types

When adding new block types, follow these steps:

1. Define the JSON structure for the new block type
2. Update the renderer component in the frontend code
3. Add appropriate UI components for the new block type
4. Test the rendering of the new block type in the app
5. Document the new block type in this guide

## Best Practices

- Keep block content focused and concise
- Use a mix of block types to maintain engagement
- Place interactive blocks after explanatory content
- Use the quiz block as a checkpoint for understanding
- Maintain a logical progression through the lesson

## Migration Considerations

When migrating from the old lesson structure:

1. Ensure all lesson metadata is properly transferred
2. Convert content sections to appropriate block types
3. Update references to quizzes with the correct quiz_id
4. Test rendering of all block types after migration
