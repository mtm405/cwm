# Lesson Creation Guide
**Code with Morais - Python Learning Platform**

This guide provides complete instructions for creating, structuring, and uploading lessons to the Firebase-based learning platform.

## Table of Contents
1. [Lesson Structure Overview](#lesson-structure-overview)
2. [Available Block Types](#available-block-types)
3. [Subtopic System](#subtopic-system)
4. [Complete Lesson Example](#complete-lesson-example)
5. [Upload Instructions](#upload-instructions)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Lesson Structure Overview

Each lesson consists of:
- **Metadata**: Basic information about the lesson
- **Blocks**: Individual content units (text, code, exercises, quizzes)
- **Subtopics**: Tab-based organization of content

### Required Lesson Fields

```json
{
  "id": "unique-lesson-id",
  "title": "Lesson Title",
  "description": "Brief description of what students will learn",
  "order": 1,
  "difficulty": "beginner|intermediate|advanced",
  "estimated_time": 30,
  "prerequisites": ["lesson-id-1", "lesson-id-2"],
  "tags": ["python", "basics", "variables"],
  "xp_reward": 50,
  "pycoins_reward": 10,
  "quiz_id": "associated-quiz-id",
  "has_subtopics": true,
  "subtopics": ["Introduction", "Practice", "Assessment"],
  "current_subtopic_index": 0,
  "created_at": "2025-07-05T12:00:00Z",
  "updated_at": "2025-07-05T12:00:00Z",
  "is_published": true,
  "blocks": [...]
}
```

---

## Available Block Types

### 1. Text Block
Basic text content with Markdown support and optional key points.

```json
{
  "id": "intro-text",
  "type": "text",
  "order": 0,
  "subtopic_index": 0,
  "title": "Introduction to Python",
  "content": "# Welcome to Python\n\nPython is a **powerful** programming language that's easy to learn.\n\n- Simple syntax\n- Great for beginners\n- Used in many industries",
  "key_points": [
    "Python is interpreted, not compiled",
    "Great for beginners and experts alike",
    "Used in web development, data science, and AI"
  ]
}
```

### 2. Code Example Block
Code snippets with syntax highlighting and explanations.

```json
{
  "id": "hello-world-example",
  "type": "code_example",
  "order": 1,
  "subtopic_index": 0,
  "title": "Your First Python Program",
  "language": "python",
  "code": "# This is a comment\nprint(\"Hello, World!\")\nprint(\"Welcome to Python programming!\")",
  "explanation": "This code demonstrates the print() function, which displays text on the screen. Comments start with # and are ignored by Python."
}
```

### 3. Interactive Block
Coding exercises with starter code, solutions, and hints.

```json
{
  "id": "create-variable-exercise",
  "type": "interactive",
  "order": 2,
  "subtopic_index": 1,
  "title": "Create Your First Variable",
  "instructions": "Create a variable called 'name' with your name, then print a greeting message using that variable.",
  "starter_code": "# Create a variable with your name\nname = \n\n# Print a greeting\nprint()",
  "solution": "# Create a variable with your name\nname = \"Your Name\"\n\n# Print a greeting\nprint(f\"Hello, {name}! Welcome to Python!\")",
  "hints": [
    "Use quotes around string values: \"Your Name\"",
    "Use f-strings for formatting: f\"Hello, {name}!\"",
    "Don't forget to assign a value to the name variable"
  ],
  "language": "python",
  "challenge_type": "Exercise",
  "difficulty": "beginner"
}
```

### 4. Quiz Block
References a quiz from the quizzes collection.

```json
{
  "id": "knowledge-check",
  "type": "quiz",
  "order": 3,
  "subtopic_index": 2,
  "title": "Knowledge Check",
  "description": "Test your understanding of Python basics with this interactive quiz.",
  "quiz_id": "python-basics-quiz"
}
```

### 5. Code Challenge Block
Advanced coding challenges with test cases.

```json
{
  "id": "fibonacci-challenge",
  "type": "code_challenge",
  "order": 4,
  "subtopic_index": 1,
  "title": "Fibonacci Sequence Challenge",
  "description": "Write a function to generate the Fibonacci sequence",
  "instructions": "Create a function called `fibonacci(n)` that returns the first n numbers in the Fibonacci sequence as a list.",
  "starter_code": "def fibonacci(n):\n    \"\"\"\n    Generate the first n Fibonacci numbers\n    Args: n (int) - number of Fibonacci numbers to generate\n    Returns: list - first n Fibonacci numbers\n    \"\"\"\n    # Your code here\n    pass\n\n# Test your function\nprint(fibonacci(5))  # Should output: [0, 1, 1, 2, 3]",
  "solution": "def fibonacci(n):\n    if n <= 0:\n        return []\n    elif n == 1:\n        return [0]\n    elif n == 2:\n        return [0, 1]\n    \n    sequence = [0, 1]\n    for i in range(2, n):\n        sequence.append(sequence[i-1] + sequence[i-2])\n    \n    return sequence",
  "tests": [
    {"input": [5], "expected": [0, 1, 1, 2, 3]},
    {"input": [1], "expected": [0]},
    {"input": [0], "expected": []},
    {"input": [8], "expected": [0, 1, 1, 2, 3, 5, 8, 13]}
  ],
  "language": "python",
  "challenge_type": "Algorithm",
  "difficulty": "intermediate"
}
```

### 6. Video Block
Embedded video content with metadata.

```json
{
  "id": "python-intro-video",
  "type": "video",
  "order": 1,
  "subtopic_index": 0,
  "title": "Python Introduction Video",
  "description": "Watch this introduction to Python programming",
  "video_id": "kqtD5dpn9C8",
  "source": "youtube",
  "duration": 600,
  "thumbnail": "https://img.youtube.com/vi/kqtD5dpn9C8/maxresdefault.jpg",
  "captions_available": true
}
```

### 7. Text with Questions Block
Text content with embedded interactive questions.

```json
{
  "id": "variables-concept-check",
  "type": "text_with_questions",
  "order": 3,
  "subtopic_index": 1,
  "title": "Understanding Variables",
  "content": "## What are Variables?\n\nVariables in Python are containers that store data values. Unlike other programming languages, Python has no command for declaring a variable - it is created when you assign a value to it.\n\n```python\nx = 5\nname = \"Alice\"\nis_student = True\n```\n\nPython is dynamically typed, meaning you don't need to specify the variable type.",
  "questions": [
    {
      "id": "var-declaration",
      "type": "multiple_choice",
      "question": "How do you create a variable in Python?",
      "options": [
        "var x = 5",
        "int x = 5",
        "x = 5",
        "declare x = 5"
      ],
      "correct_answer": 2,
      "explanation": "In Python, you simply assign a value to a variable name. No declaration keyword is needed."
    },
    {
      "id": "dynamic-typing",
      "type": "true_false",
      "question": "Python requires you to declare the type of a variable when creating it.",
      "correct_answer": false,
      "explanation": "Python is dynamically typed - it automatically determines the variable type based on the assigned value."
    }
  ]
}
```

---

## Subtopic System

Subtopics organize lesson content into tabs. Each block has a `subtopic_index` that determines which tab it appears in.

### Subtopic Structure
```json
{
  "has_subtopics": true,
  "subtopics": ["Introduction", "Variables", "Practice", "Assessment"],
  "current_subtopic_index": 0
}
```

### Mapping Blocks to Subtopics
- `subtopic_index: 0` → "Introduction" tab
- `subtopic_index: 1` → "Variables" tab
- `subtopic_index: 2` → "Practice" tab
- `subtopic_index: 3` → "Assessment" tab

---

## Complete Lesson Example

Here's a complete lesson with all components:

```json
{
  "id": "python-variables-complete",
  "title": "Python Variables: Complete Guide",
  "description": "Learn about Python variables, data types, and basic operations",
  "order": 2,
  "difficulty": "beginner",
  "estimated_time": 45,
  "prerequisites": ["python-basics-01"],
  "tags": ["python", "variables", "data-types", "basics"],
  "xp_reward": 75,
  "pycoins_reward": 15,
  "quiz_id": "python-variables-quiz",
  "has_subtopics": true,
  "subtopics": ["Introduction", "Creating Variables", "Practice", "Assessment"],
  "current_subtopic_index": 0,
  "created_at": "2025-07-05T12:00:00Z",
  "updated_at": "2025-07-05T12:00:00Z",
  "is_published": true,
  "blocks": [
    {
      "id": "intro-text",
      "type": "text",
      "order": 0,
      "subtopic_index": 0,
      "title": "What are Variables?",
      "content": "# Python Variables\n\nVariables are containers for storing data values. In Python, creating a variable is simple - you just assign a value to it!\n\n## Key Concepts:\n- Variables store data\n- No declaration needed\n- Dynamic typing\n- Case-sensitive names",
      "key_points": [
        "Variables store data values",
        "Python uses dynamic typing",
        "Variable names are case-sensitive",
        "No declaration keyword needed"
      ]
    },
    {
      "id": "basic-example",
      "type": "code_example",
      "order": 1,
      "subtopic_index": 0,
      "title": "Basic Variable Example",
      "language": "python",
      "code": "# Creating variables\nname = \"Alice\"\nage = 25\nheight = 5.6\nis_student = True\n\n# Using variables\nprint(f\"Name: {name}\")\nprint(f\"Age: {age}\")\nprint(f\"Height: {height} feet\")\nprint(f\"Is student: {is_student}\")",
      "explanation": "This example shows how to create variables of different types and use them in print statements with f-string formatting."
    },
    {
      "id": "variable-types",
      "type": "text",
      "order": 2,
      "subtopic_index": 1,
      "title": "Variable Types",
      "content": "## Python Data Types\n\nPython has several built-in data types:\n\n- **String (str)**: Text data - `\"Hello\"`\n- **Integer (int)**: Whole numbers - `42`\n- **Float (float)**: Decimal numbers - `3.14`\n- **Boolean (bool)**: True/False values\n- **List**: Ordered collection - `[1, 2, 3]`\n- **Dictionary**: Key-value pairs - `{\"name\": \"Alice\"}`"
    },
    {
      "id": "type-example",
      "type": "code_example",
      "order": 3,
      "subtopic_index": 1,
      "title": "Data Types Example",
      "language": "python",
      "code": "# Different data types\ntext = \"Hello, World!\"          # String\nnumber = 42                     # Integer\ndecimal = 3.14159              # Float\nis_active = True               # Boolean\ncolors = [\"red\", \"green\", \"blue\"] # List\nperson = {\"name\": \"Bob\", \"age\": 30} # Dictionary\n\n# Check types\nprint(type(text))    # <class 'str'>\nprint(type(number))  # <class 'int'>\nprint(type(decimal)) # <class 'float'>",
      "explanation": "The type() function shows the data type of a variable. Python automatically determines the type based on the value assigned."
    },
    {
      "id": "create-variables-exercise",
      "type": "interactive",
      "order": 4,
      "subtopic_index": 2,
      "title": "Create Your Variables",
      "instructions": "Create variables for a student profile:\n1. Create a 'student_name' variable with your name\n2. Create an 'age' variable with your age\n3. Create a 'gpa' variable with a decimal GPA\n4. Create an 'is_enrolled' variable set to True\n5. Print all variables using f-strings",
      "starter_code": "# Create student profile variables\nstudent_name = \nage = \ngpa = \nis_enrolled = \n\n# Print the profile\nprint(f\"Student: {student_name}\")\nprint(f\"Age: {age}\")\nprint(f\"GPA: {gpa}\")\nprint(f\"Enrolled: {is_enrolled}\")",
      "solution": "# Create student profile variables\nstudent_name = \"Your Name\"\nage = 18\ngpa = 3.75\nis_enrolled = True\n\n# Print the profile\nprint(f\"Student: {student_name}\")\nprint(f\"Age: {age}\")\nprint(f\"GPA: {gpa}\")\nprint(f\"Enrolled: {is_enrolled}\")",
      "hints": [
        "Use quotes for string values: \"Your Name\"",
        "Use integers for whole numbers: 18",
        "Use floats for decimals: 3.75",
        "Use True/False for boolean values (capitalized)"
      ],
      "language": "python",
      "challenge_type": "Exercise",
      "difficulty": "beginner"
    },
    {
      "id": "variable-operations",
      "type": "interactive",
      "order": 5,
      "subtopic_index": 2,
      "title": "Variable Operations",
      "instructions": "Practice variable operations:\n1. Create two number variables\n2. Calculate their sum, difference, product, and quotient\n3. Store results in new variables\n4. Print all results",
      "starter_code": "# Create two numbers\nnum1 = 15\nnum2 = 4\n\n# Calculate operations\nsum_result = \ndifference = \nproduct = \nquotient = \n\n# Print results\nprint(f\"{num1} + {num2} = {sum_result}\")\nprint(f\"{num1} - {num2} = {difference}\")\nprint(f\"{num1} * {num2} = {product}\")\nprint(f\"{num1} / {num2} = {quotient}\")",
      "solution": "# Create two numbers\nnum1 = 15\nnum2 = 4\n\n# Calculate operations\nsum_result = num1 + num2\ndifference = num1 - num2\nproduct = num1 * num2\nquotient = num1 / num2\n\n# Print results\nprint(f\"{num1} + {num2} = {sum_result}\")\nprint(f\"{num1} - {num2} = {difference}\")\nprint(f\"{num1} * {num2} = {product}\")\nprint(f\"{num1} / {num2} = {quotient}\")",
      "hints": [
        "Use + for addition",
        "Use - for subtraction", 
        "Use * for multiplication",
        "Use / for division"
      ],
      "language": "python",
      "challenge_type": "Exercise",
      "difficulty": "beginner"
    },
    {
      "id": "knowledge-check",
      "type": "quiz",
      "order": 6,
      "subtopic_index": 3,
      "title": "Variables Knowledge Check",
      "description": "Test your understanding of Python variables and data types",
      "quiz_id": "python-variables-quiz"
    }
  ]
}
```

---

## Upload Instructions

### Method 1: Using Upload Scripts

1. **Save your lesson** as a JSON file in `firebase_data/` directory
2. **Run the upload script**:
   ```bash
   cd firebase_data
   python upload_enhanced_lessons.py
   ```

### Method 2: Manual Upload

1. **Create a new Python script** in `firebase_data/`:

```python
#!/usr/bin/env python3
"""
Upload Custom Lesson to Firebase
"""
import json
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService
from config import get_config

def upload_custom_lesson():
    """Upload your custom lesson to Firebase"""
    
    # Load lesson data
    with open('your_lesson.json', 'r', encoding='utf-8') as f:
        lesson_data = json.load(f)
    
    # Initialize Firebase
    config = get_config()
    firebase_service = FirebaseService(config.FIREBASE_CONFIG)
    
    # Upload lesson
    lesson_id = lesson_data['id']
    lesson_ref = firebase_service.db.collection('lessons').document(lesson_id)
    lesson_ref.set(lesson_data)
    
    print(f"✅ Successfully uploaded lesson: {lesson_id}")
    print(f"🔗 URL: /lesson/{lesson_id}")

if __name__ == "__main__":
    upload_custom_lesson()
```

### Method 3: Direct Firebase Console
1. Go to Firebase Console → Firestore Database
2. Navigate to `lessons` collection
3. Add new document with your lesson ID
4. Paste your JSON data

---

## Best Practices

### 1. Lesson Structure
- **Start with text blocks** to introduce concepts
- **Follow with code examples** to demonstrate
- **Add interactive exercises** for practice
- **End with quizzes** for assessment

### 2. Block Organization
- Use **logical order numbers** (0, 1, 2, 3...)
- Group related content in **same subtopics**
- Keep **subtopic content balanced**

### 3. Content Guidelines
- **Clear, concise explanations** in text blocks
- **Well-commented code** examples
- **Progressive difficulty** in exercises
- **Relevant hints** for challenging tasks

### 4. Subtopic Design
- **3-4 subtopics** work best
- Common pattern: "Introduction → Practice → Advanced → Assessment"
- **Meaningful tab names** that describe content

### 5. IDs and Naming
- Use **kebab-case** for IDs: `python-variables-01`
- **Descriptive block IDs**: `create-variable-exercise`
- **Consistent naming** across lessons

---

## Troubleshooting

### Common Issues

1. **Lesson not appearing**
   - Check `is_published: true`
   - Verify lesson ID is unique
   - Ensure all required fields are present

2. **Blocks not rendering**
   - Verify block `type` is valid
   - Check `order` and `subtopic_index` values
   - Ensure block has required fields for its type

3. **Subtopics not working**
   - Set `has_subtopics: true`
   - Ensure `subtopics` array matches content
   - Check `subtopic_index` values in blocks

4. **Interactive blocks failing**
   - Verify `starter_code` and `solution` are valid Python
   - Check that `hints` is an array
   - Ensure `language` is specified

5. **Quiz blocks not loading**
   - Verify `quiz_id` exists in quizzes collection
   - Check quiz is published and accessible

### Validation Checklist

Before uploading, verify:
- [ ] All required metadata fields present
- [ ] Block IDs are unique within lesson
- [ ] Block order numbers are sequential
- [ ] Subtopic indices map correctly
- [ ] Code examples are syntactically correct
- [ ] Interactive exercises have valid starter code
- [ ] Quiz IDs reference existing quizzes
- [ ] JSON syntax is valid

### Testing Your Lesson

1. **Upload to development environment** first
2. **Test each block type** renders correctly
3. **Verify subtopic navigation** works
4. **Check interactive exercises** run properly
5. **Ensure quiz integration** functions
6. **Test on mobile devices** for responsiveness

---

## Quick Reference

### Minimum Lesson Structure
```json
{
  "id": "lesson-id",
  "title": "Lesson Title", 
  "description": "Brief description",
  "difficulty": "beginner",
  "estimated_time": 30,
  "blocks": [
    {
      "id": "block-1",
      "type": "text",
      "order": 0,
      "title": "Introduction",
      "content": "Lesson content here..."
    }
  ]
}
```

### Block Types Quick List
- `text` - Basic content with Markdown
- `code_example` - Code snippets with explanations
- `interactive` - Coding exercises
- `quiz` - Knowledge assessments
- `code_challenge` - Advanced coding challenges
- `video` - Embedded videos
- `text_with_questions` - Interactive reading

### Required Block Fields
- `id` - Unique identifier
- `type` - Block type
- `order` - Position in lesson
- Additional fields based on block type

---

**Happy lesson creating! 🚀**

For questions or support, check the codebase documentation or contact the development team.
