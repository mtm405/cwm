#!/usr/bin/env python3
"""
Upload Enhanced Lesson with Subtopics to Firebase
This script uploads the enhanced lesson structure with subtopic support
"""

import json
import sys
import os

# Add the parent directory to the path so we can import from the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService
from config import get_config

def upload_enhanced_lesson():
    """Upload the enhanced lesson with subtopics to Firebase"""
    
    # Initialize Firebase service
    config = get_config()
    firebase_service = FirebaseService(config)
    
    if not firebase_service.is_available():
        print("❌ Firebase service is not available")
        return False
    
    # Load the enhanced lesson data
    lesson_file = "Lessons/Domain 1/Lesson 1 - Enhanced.json"
    
    try:
        with open(lesson_file, 'r', encoding='utf-8') as f:
            lesson_data = json.load(f)
        
        print(f"📖 Loaded lesson: {lesson_data.get('title', 'Unknown')}")
        print(f"📊 Subtopics: {len(lesson_data.get('subtopics', []))}")
        
        # Upload to Firebase
        lesson_id = lesson_data['id']
        
        # Add to lessons collection
        success = firebase_service.add_lesson(lesson_id, lesson_data)
        
        if success:
            print(f"✅ Successfully uploaded lesson: {lesson_id}")
            print(f"🔗 URL: /lesson/{lesson_id}")
            
            # List subtopics
            print("\n📑 Subtopics:")
            for i, subtopic in enumerate(lesson_data.get('subtopics', [])):
                print(f"  {i+1}. {subtopic.get('title', 'Untitled')}")
                print(f"     🔗 URL: /lesson/{lesson_id}/{subtopic.get('id', 'unknown')}")
            
            return True
        else:
            print(f"❌ Failed to upload lesson: {lesson_id}")
            return False
            
    except FileNotFoundError:
        print(f"❌ Lesson file not found: {lesson_file}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in lesson file: {e}")
        return False
    except Exception as e:
        print(f"❌ Error uploading lesson: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Uploading Enhanced Lesson with Subtopics...")
    success = upload_enhanced_lesson()
    
    if success:
        print("\n✅ Upload completed successfully!")
        print("🔍 You can now test the subtopic tabs at:")
        print("   - http://localhost:5000/lesson/python-datatypes-01")
        print("   - http://localhost:5000/lesson/python-datatypes-01/introduction")
        print("   - http://localhost:5000/lesson/python-datatypes-01/strings")
    else:
        print("\n❌ Upload failed!")
        sys.exit(1)
