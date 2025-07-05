#!/usr/bin/env python3
"""
Simple vocabulary data upload script for testing
"""
import sys
import os
import json
from datetime import datetime

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService
from config import config

def create_sample_vocabulary():
    """Create sample vocabulary data for testing"""
    return [
        {
            "id": "variable",
            "term": "Variable",
            "definition": "A named storage location that holds a value that can be modified during program execution.",
            "example": "x = 10\nname = \"Python\"",
            "category": "Basics",
            "difficulty": "beginner",
            "tags": ["storage", "data", "assignment"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "function",
            "term": "Function",
            "definition": "A reusable block of code that performs a specific task and can accept inputs (parameters) and return outputs.",
            "example": "def greet(name):\n    return f\"Hello, {name}!\"",
            "category": "Basics",
            "difficulty": "beginner",
            "tags": ["reusable", "parameters", "return"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "list",
            "term": "List",
            "definition": "An ordered collection of items that can be modified. Lists are mutable and can contain different data types.",
            "example": "fruits = [\"apple\", \"banana\", \"orange\"]\nfruits.append(\"grape\")",
            "category": "Data Structures",
            "difficulty": "beginner",
            "tags": ["collection", "ordered", "mutable"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "dictionary",
            "term": "Dictionary",
            "definition": "A collection of key-value pairs where each key is unique. Dictionaries are mutable and unordered.",
            "example": "student = {\"name\": \"Alice\", \"age\": 20, \"grade\": \"A\"}\nprint(student[\"name\"])",
            "category": "Data Structures",
            "difficulty": "beginner",
            "tags": ["key-value", "mutable", "mapping"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "for_loop",
            "term": "For Loop",
            "definition": "A control structure that repeats a block of code for each item in a sequence.",
            "example": "for i in range(5):\n    print(i)",
            "category": "Control Flow",
            "difficulty": "beginner",
            "tags": ["iteration", "repeat", "control"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "while_loop",
            "term": "While Loop",
            "definition": "A control structure that repeats a block of code as long as a condition is true.",
            "example": "count = 0\nwhile count < 5:\n    print(count)\n    count += 1",
            "category": "Control Flow",
            "difficulty": "beginner",
            "tags": ["iteration", "condition", "control"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "if_statement",
            "term": "If Statement",
            "definition": "A conditional statement that executes code only if a specified condition is true.",
            "example": "age = 18\nif age >= 18:\n    print(\"You can vote!\")",
            "category": "Control Flow",
            "difficulty": "beginner",
            "tags": ["conditional", "decision", "control"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "string",
            "term": "String",
            "definition": "A sequence of characters enclosed in quotes, used to represent text data.",
            "example": "message = \"Hello, World!\"\nprint(message)",
            "category": "Data Types",
            "difficulty": "beginner",
            "tags": ["text", "characters", "immutable"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "integer",
            "term": "Integer",
            "definition": "A whole number without a decimal point, can be positive, negative, or zero.",
            "example": "age = 25\ncount = -5\nzero = 0",
            "category": "Data Types",
            "difficulty": "beginner",
            "tags": ["number", "whole", "math"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "float",
            "term": "Float",
            "definition": "A number with a decimal point, used to represent floating-point numbers.",
            "example": "price = 19.99\ntemperature = -10.5",
            "category": "Data Types",
            "difficulty": "beginner",
            "tags": ["number", "decimal", "math"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "boolean",
            "term": "Boolean",
            "definition": "A data type that can only have two values: True or False.",
            "example": "is_student = True\nhas_license = False",
            "category": "Data Types",
            "difficulty": "beginner",
            "tags": ["true", "false", "logical"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "class",
            "term": "Class",
            "definition": "A blueprint for creating objects that defines attributes and methods.",
            "example": "class Person:\n    def __init__(self, name):\n        self.name = name\n    \n    def greet(self):\n        return f\"Hello, I'm {self.name}\"",
            "category": "Object-Oriented Programming",
            "difficulty": "intermediate",
            "tags": ["blueprint", "objects", "oop"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "object",
            "term": "Object",
            "definition": "An instance of a class that contains data (attributes) and functions (methods).",
            "example": "person = Person(\"Alice\")\nprint(person.greet())",
            "category": "Object-Oriented Programming",
            "difficulty": "intermediate",
            "tags": ["instance", "attributes", "methods"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "method",
            "term": "Method",
            "definition": "A function that is defined inside a class and operates on instances of that class.",
            "example": "class Calculator:\n    def add(self, a, b):\n        return a + b",
            "category": "Object-Oriented Programming",
            "difficulty": "intermediate",
            "tags": ["function", "class", "instance"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "inheritance",
            "term": "Inheritance",
            "definition": "A mechanism where a new class inherits properties and methods from an existing class.",
            "example": "class Animal:\n    def speak(self):\n        pass\n\nclass Dog(Animal):\n    def speak(self):\n        return \"Woof!\"",
            "category": "Object-Oriented Programming",
            "difficulty": "advanced",
            "tags": ["extends", "parent", "child"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        },
        {
            "id": "exception",
            "term": "Exception",
            "definition": "An error that occurs during program execution that can be handled gracefully.",
            "example": "try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print(\"Cannot divide by zero!\")",
            "category": "Error Handling",
            "difficulty": "intermediate",
            "tags": ["error", "handling", "try-except"],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    ]

def upload_vocabulary():
    """Upload vocabulary data to Firebase"""
    try:
        print("🚀 Starting vocabulary upload...")
        
        # Initialize Firebase service
        firebase_service = FirebaseService(config)
        
        if not firebase_service.is_available():
            print("❌ Firebase service is not available")
            return False
        
        # Create vocabulary data
        vocabulary_data = create_sample_vocabulary()
        
        print(f"📚 Created {len(vocabulary_data)} vocabulary terms")
        
        # Upload to Firebase
        batch = firebase_service.db.batch()
        
        # Clear existing vocabulary (optional)
        print("🧹 Clearing existing vocabulary...")
        existing_docs = firebase_service.db.collection('vocabulary').stream()
        for doc in existing_docs:
            batch.delete(doc.reference)
        
        # Add new vocabulary terms
        print("📝 Adding new vocabulary terms...")
        for term_data in vocabulary_data:
            doc_ref = firebase_service.db.collection('vocabulary').document(term_data['id'])
            batch.set(doc_ref, term_data)
        
        # Commit batch
        batch.commit()
        
        print(f"✅ Successfully uploaded {len(vocabulary_data)} vocabulary terms!")
        return True
        
    except Exception as e:
        print(f"❌ Error uploading vocabulary: {str(e)}")
        return False

def main():
    """Main function"""
    success = upload_vocabulary()
    if success:
        print("\n🎉 Vocabulary upload completed successfully!")
        print("You can now test the vocabulary system in the dashboard.")
    else:
        print("\n💥 Vocabulary upload failed!")
        print("Please check your Firebase configuration and try again.")

if __name__ == "__main__":
    main()
