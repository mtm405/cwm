#!/usr/bin/env python3
"""
Upload lesson to Firebase for testing
"""
import json
import sys
import os
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
from datetime import datetime

def upload_lesson():
    """Upload the lesson to Firebase"""
    
    # Initialize Firebase
    try:
        service_account_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            'secure',
            'serviceAccountKey.json'
        )
        
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            db = firestore.client()
            print("✅ Firebase initialized successfully")
        else:
            print(f"❌ Service account key not found at: {service_account_path}")
            return False
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        return False
    
    lesson_data = {
        "id": "python-datatypes-operators-01",
        "title": "Operations using Data Types and Operators",
        "description": "Master Python's data types, type operations, operator precedence, and operator selection for effective programming",
        "order": 1,
        "difficulty": "intermediate",
        "estimated_time": 90,
        "prerequisites": [],
        "tags": ["python", "data-types", "operators", "type-conversion", "lists", "precedence"],
        "xp_reward": 200,
        "pycoins_reward": 50,
        "quiz_id": "datatypes-operators-quiz",
        "has_subtopics": True,
        "subtopics": ["Data Types & Identification", "Type Operations & Lists", "Operator Precedence", "Selecting Operators"],
        "current_subtopic_index": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "is_published": True,
        "blocks": [
            {
                "id": "intro-datatypes",
                "type": "text",
                "order": 0,
                "subtopic_index": 0,
                "title": "Introduction to Python Data Types",
                "content": "# Python Data Types\n\nEvery value in Python has a type that determines what operations you can perform with it. Python's four fundamental data types are:\n\n## Core Data Types\n\n1. **str (String)** - Text data enclosed in quotes\n   - `\"Hello\"` or `'World'` or `'''Multi-line'''`\n   \n2. **int (Integer)** - Whole numbers without decimal points\n   - `42`, `-17`, `0`, `1_000_000`\n   \n3. **float (Floating-point)** - Numbers with decimal points\n   - `3.14`, `-0.5`, `1.0`, `2.5e-4`\n   \n4. **bool (Boolean)** - True or False values\n   - `True`, `False` (note the capitalization!)\n\n## Why Data Types Matter\n\n- **Operations**: Different types support different operations\n- **Memory**: Python allocates memory based on type\n- **Behavior**: Types determine how values interact\n- **Errors**: Using wrong types causes TypeErrors",
                "key_points": [
                    "Every value in Python has a specific type",
                    "Python uses dynamic typing - variables can change types",
                    "The type() function reveals any value's type",
                    "Strings in quotes, integers without decimals, floats with decimals, booleans True/False"
                ]
            },
            {
                "id": "datatypes-example",
                "type": "code_example",
                "order": 1,
                "subtopic_index": 0,
                "title": "Identifying Data Types",
                "language": "python",
                "code": "# Creating variables of different types\nname = \"Alice\"              # String\nage = 16                    # Integer\nheight = 5.7               # Float\nis_student = True          # Boolean\n\n# Checking types with type() function\nprint(f\"name: {name}, Type: {type(name)}\")\nprint(f\"age: {age}, Type: {type(age)}\")\nprint(f\"height: {height}, Type: {type(height)}\")\nprint(f\"is_student: {is_student}, Type: {type(is_student)}\")\n\n# Common mistake - numbers in quotes are strings!\nage_text = \"16\"\nprint(f\"\\nage_text: {age_text}, Type: {type(age_text)}\")\nprint(f\"Is age == age_text? {age == age_text}\")  # False!",
                "explanation": "The type() function returns the class of any value. Notice that '16' in quotes is a string, not a number. This is a common source of bugs when reading user input or file data."
            }
        ]
    }
    
    # Upload to Firebase
    print("🚀 Uploading lesson to Firebase...")
    try:
        lesson_ref = db.collection('lessons').document(lesson_data['id'])
        lesson_ref.set(lesson_data)
        
        print("✅ Lesson uploaded successfully!")
        print(f"📄 Lesson ID: {lesson_data['id']}")
        
        # Test the lesson by checking if it exists
        print("\n🔍 Verifying lesson in database...")
        retrieved_lesson = lesson_ref.get()
        if retrieved_lesson.exists:
            print("✅ Lesson verified in database!")
            print(f"📋 Title: {retrieved_lesson.get('title')}")
            print(f"🔢 Blocks: {len(retrieved_lesson.get('blocks', []))}")
            
            # Check for subtopic tabs setup
            if retrieved_lesson.get('has_subtopics'):
                print("✅ Lesson has subtopics enabled!")
                subtopics = retrieved_lesson.get('subtopics', [])
                print(f"📑 Subtopics: {subtopics}")
            else:
                print("⚠️ Lesson does not have subtopics enabled")
                
            return True
        else:
            print("❌ Lesson not found in database after upload!")
            return False
            
    except Exception as e:
        print(f"❌ Error uploading lesson: {e}")
        return False

if __name__ == "__main__":
    success = upload_lesson()
    sys.exit(0 if success else 1)
