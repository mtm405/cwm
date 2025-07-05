# Lesson Upload Guide for Code with Morais

## 🚀 Quick Start

Your Firestore database is now clean and ready for uploading lessons. This guide provides the complete structure and examples for uploading lessons to your platform.

## 📋 Available Lesson Block Types

Your platform supports these lesson block types:

### 1. **Text Block** (`text`)
Basic text content with markdown support
```json
{
  "type": "text",
  "content": "This is a **markdown** formatted text block.",
  "subtopic_index": 0
}
```

### 2. **Code Example Block** (`code_example`)
Display code with syntax highlighting
```json
{
  "type": "code_example",
  "code": "print('Hello, World!')\nname = 'Python'\nprint(f'Welcome to {name}')",
  "language": "python",
  "explanation": "This example demonstrates basic Python print statements and f-strings.",
  "subtopic_index": 0
}
```

### 3. **Interactive Block** (`interactive`)
Code that users can run and modify
```json
{
  "type": "interactive",
  "code": "# Try changing this message\nmessage = 'Hello, World!'\nprint(message)",
  "language": "python",
  "instructions": "Modify the message variable and run the code to see the output.",
  "subtopic_index": 0
}
```

### 4. **Quiz Block** (`quiz`)
Multiple choice questions
```json
{
  "type": "quiz",
  "question": "What is the output of print(type(42))?",
  "options": [
    "<class 'int'>",
    "<class 'float'>",
    "<class 'str'>",
    "42"
  ],
  "correct": 0,
  "explanation": "The type() function returns the data type of an object. 42 is an integer.",
  "subtopic_index": 0
}
```

### 5. **Code Challenge Block** (`code_challenge`)
Programming exercises with test cases
```json
{
  "type": "code_challenge",
  "title": "Create a Greeting Function",
  "description": "Write a function that takes a name and returns a greeting message.",
  "starter_code": "def greet(name):\n    # Your code here\n    pass",
  "solution": "def greet(name):\n    return f'Hello, {name}!'",
  "tests": [
    {
      "input": "greet('Alice')",
      "expected": "Hello, Alice!"
    },
    {
      "input": "greet('Bob')",
      "expected": "Hello, Bob!"
    }
  ],
  "subtopic_index": 0
}
```

### 6. **Video Block** (`video`)
Embed video content
```json
{
  "type": "video",
  "url": "https://www.youtube.com/embed/VIDEO_ID",
  "title": "Introduction to Python Variables",
  "description": "Watch this video to learn about Python variables.",
  "subtopic_index": 0
}
```

### 7. **Text with Questions Block** (`text_with_questions`)
Text content with inline questions
```json
{
  "type": "text_with_questions",
  "content": "Python variables are containers for storing data values. Unlike other programming languages, Python has no command for declaring a variable.",
  "questions": [
    {
      "question": "What are Python variables used for?",
      "options": [
        "Storing data values",
        "Executing functions",
        "Creating loops",
        "Importing modules"
      ],
      "correct": 0,
      "explanation": "Variables in Python are containers that store data values."
    }
  ],
  "subtopic_index": 0
}
```

### 8. **Interactive Diagram Block** (`interactive_diagram`)
Visual learning elements
```json
{
  "type": "interactive_diagram",
  "title": "Python Data Types Hierarchy",
  "description": "Explore the relationship between different Python data types.",
  "diagram_data": {
    "nodes": [
      {"id": "object", "label": "object", "x": 200, "y": 50},
      {"id": "int", "label": "int", "x": 100, "y": 150},
      {"id": "float", "label": "float", "x": 300, "y": 150}
    ],
    "connections": [
      {"from": "object", "to": "int"},
      {"from": "object", "to": "float"}
    ]
  },
  "subtopic_index": 0
}
```

## 🏗️ Lesson Structure

### Complete Lesson Document Structure
```json
{
  "id": "python-variables-basics",
  "title": "Python Variables and Basic Data Types",
  "domain": "Python Programming",
  "subtopic": "Variables and Data Types",
  "description": "Learn about Python variables, how to create them, and understand basic data types including strings, integers, floats, and booleans.",
  "order": 1,
  "estimated_time": 25,
  "difficulty": "beginner",
  "prerequisites": ["basic-python-syntax"],
  "learning_objectives": [
    "Understand what variables are and how to create them",
    "Learn about basic Python data types",
    "Practice variable assignment and reassignment",
    "Understand type conversion between data types"
  ],
  "subtopics": [
    {
      "title": "Introduction to Variables",
      "description": "Understanding the concept of variables in Python"
    },
    {
      "title": "Basic Data Types",
      "description": "Exploring strings, integers, floats, and booleans"
    },
    {
      "title": "Type Conversion",
      "description": "Converting between different data types"
    },
    {
      "title": "Practice Exercises",
      "description": "Hands-on practice with variables and data types"
    }
  ],
  "blocks": [
    {
      "type": "text",
      "content": "# Introduction to Variables\n\nIn Python, variables are containers for storing data values. Unlike other programming languages, Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.",
      "subtopic_index": 0
    },
    {
      "type": "code_example",
      "code": "# Creating variables\nname = 'Alice'\nage = 25\nheight = 5.6\nis_student = True\n\nprint(f'Name: {name}')\nprint(f'Age: {age}')\nprint(f'Height: {height}')\nprint(f'Is student: {is_student}')",
      "language": "python",
      "explanation": "This example shows how to create variables of different types and display their values.",
      "subtopic_index": 0
    },
    {
      "type": "interactive",
      "code": "# Try creating your own variables\nmy_name = 'Your Name'\nmy_age = 0\n\nprint(f'Hello, my name is {my_name} and I am {my_age} years old.')",
      "language": "python",
      "instructions": "Replace 'Your Name' with your actual name and set your age. Then run the code.",
      "subtopic_index": 0
    },
    {
      "type": "text",
      "content": "# Basic Data Types\n\nPython has several built-in data types. The four most common basic types are:\n\n- **str** (string): Text data\n- **int** (integer): Whole numbers\n- **float** (floating-point): Decimal numbers\n- **bool** (boolean): True or False values",
      "subtopic_index": 1
    },
    {
      "type": "quiz",
      "question": "Which of the following is the correct way to create a string variable in Python?",
      "options": [
        "name = 'John'",
        "name = John",
        "str name = 'John'",
        "string name = 'John'"
      ],
      "correct": 0,
      "explanation": "In Python, strings are created by enclosing text in single or double quotes. No type declaration is needed.",
      "subtopic_index": 1
    },
    {
      "type": "code_challenge",
      "title": "Variable Assignment Challenge",
      "description": "Create variables for a person's information and print a formatted message.",
      "starter_code": "# Create variables for:\n# - first_name (string)\n# - last_name (string)\n# - age (integer)\n# - height (float)\n\n# Your code here\n\n# Print a message using these variables\nprint(f'Person: {first_name} {last_name}, Age: {age}, Height: {height}')",
      "solution": "first_name = 'John'\nlast_name = 'Doe'\nage = 30\nheight = 5.9\n\nprint(f'Person: {first_name} {last_name}, Age: {age}, Height: {height}')",
      "tests": [
        {
          "description": "Variables should be created correctly",
          "test_code": "assert isinstance(first_name, str), 'first_name should be a string'\nassert isinstance(last_name, str), 'last_name should be a string'\nassert isinstance(age, int), 'age should be an integer'\nassert isinstance(height, float), 'height should be a float'"
        }
      ],
      "subtopic_index": 1
    }
  ],
  "tags": ["variables", "data-types", "python", "beginner"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## 🎯 Subtopic Tab System

The subtopic tab system is controlled by the `subtopic_index` field in each block:

- **`subtopic_index: 0`** → First tab (e.g., "Introduction to Variables")
- **`subtopic_index: 1`** → Second tab (e.g., "Basic Data Types")
- **`subtopic_index: 2`** → Third tab (e.g., "Type Conversion")
- **`subtopic_index: 3`** → Fourth tab (e.g., "Practice Exercises")

The tabs are defined in the `subtopics` array at the lesson level.

## 📤 Upload Methods

### Method 1: Using the Web Interface
1. Go to your admin panel
2. Navigate to Content Management
3. Click "Upload Lesson"
4. Paste your JSON structure
5. Click "Upload"

### Method 2: Using Upload Script
Save your lesson as a JSON file and use the upload script:

```bash
# In your firebase_data directory
python upload_lesson.py your_lesson.json
```

### Method 3: Direct Firebase Upload
Use the Firebase Admin SDK to upload directly:

```python
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase
cred = credentials.Certificate('path/to/serviceAccountKey.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

# Upload lesson
lesson_data = {
    # Your lesson structure here
}

db.collection('lessons').document(lesson_data['id']).set(lesson_data)
```

## 🎨 Best Practices

### 1. **Lesson Organization**
- Use clear, descriptive IDs (e.g., `python-variables-basics`)
- Set appropriate `order` values for sequence
- Include meaningful `prerequisites`

### 2. **Content Structure**
- Start with a text block explaining the topic
- Follow with code examples
- Include interactive elements for practice
- End with quizzes or challenges

### 3. **Subtopic Design**
- Keep subtopics focused and cohesive
- Balance content across tabs
- Use logical progression from basic to advanced

### 4. **Block Variety**
- Mix different block types for engagement
- Use interactive blocks for hands-on learning
- Include quizzes to reinforce concepts

## 🛠️ Upload Helper Script

Here's a simple script to help you upload lessons:

```python
#!/usr/bin/env python3
"""
Lesson Upload Helper Script
"""

import json
import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import firebase_admin
from firebase_admin import credentials, firestore
from config import get_config

def upload_lesson(lesson_file_path):
    """Upload a lesson from JSON file"""
    try:
        # Load lesson data
        with open(lesson_file_path, 'r', encoding='utf-8') as f:
            lesson_data = json.load(f)
        
        # Initialize Firebase if needed
        if not firebase_admin._apps:
            config = get_config()
            cred = credentials.Certificate(config.FIREBASE_CONFIG)
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        
        # Upload lesson
        lesson_id = lesson_data['id']
        db.collection('lessons').document(lesson_id).set(lesson_data)
        
        print(f"✅ Lesson uploaded successfully: {lesson_id}")
        return True
        
    except Exception as e:
        print(f"❌ Error uploading lesson: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python upload_lesson.py <lesson_file.json>")
        sys.exit(1)
    
    lesson_file = sys.argv[1]
    upload_lesson(lesson_file)
```

## 🚀 Ready to Upload!

Your database is now clean and ready for your first module. Create your lesson JSON following the structure above, and use one of the upload methods to get started.

**Next Steps:**
1. Create your first lesson JSON file
2. Test it with a simple lesson first
3. Upload using your preferred method
4. Verify the lesson appears correctly in your platform

Good luck with your first module! 🎓
