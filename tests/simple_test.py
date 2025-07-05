#!/usr/bin/env python3
"""
Simple test to check lesson count
"""
import sys
import os

# Add the project directory to Python path
project_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_dir)

try:
    print("🔍 Starting lesson count test...")
    
    # Import and test
    from config import get_config
    print("✅ Config imported")
    
    from models.lesson import get_all_lessons, firebase_service
    print("✅ Lesson model imported")
    
    # Check firebase service
    if firebase_service:
        print(f"📊 Firebase service available: {firebase_service.is_available()}")
        if firebase_service.is_available():
            firebase_lessons = firebase_service.get_all_lessons()
            print(f"📝 Firebase lessons: {len(firebase_lessons)}")
    else:
        print("❌ No Firebase service set")
    
    # Get all lessons via model
    all_lessons = get_all_lessons()
    print(f"🎯 Model lessons: {len(all_lessons)}")
    
    if len(all_lessons) > 0:
        print("📋 Lesson IDs found:")
        for lesson in all_lessons:
            print(f"  - {lesson.get('id')}: {lesson.get('title')}")
    
    print("✅ Test completed")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()
