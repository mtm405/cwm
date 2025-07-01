#!/usr/bin/env python3
"""
Firebase Lesson Data Test
Check if lessons are being loaded from Firebase correctly
"""

import os
import sys
sys.path.append('.')

from config import get_config
from services.firebase_service import FirebaseService
from models.lesson import get_all_lessons, get_lesson

def test_firebase_lessons():
    print("🔍 Testing Firebase Lesson Data Loading...")
    print("=" * 60)
    
    # Check configuration
    config = get_config()
    print(f"📊 Configuration loaded: {config.__class__.__name__}")
    print(f"📊 DEV_MODE: {getattr(config, 'DEV_MODE', 'Not set')}")
    
    # Check environment variables
    env_vars = ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL']
    print("\n🔑 Environment Variables:")
    for var in env_vars:
        value = os.environ.get(var)
        if value:
            print(f"   ✅ {var}: {'*' * 20}... (set)")
        else:
            print(f"   ❌ {var}: Not set")
    
    # Test Firebase service
    print("\n🔥 Firebase Service Test:")
    try:
        firebase_service = FirebaseService(config.FIREBASE_CONFIG if hasattr(config, 'FIREBASE_CONFIG') else {})
        print(f"   📊 Firebase available: {firebase_service.is_available()}")
        
        if firebase_service.is_available():
            print("   ✅ Firebase service initialized successfully")
            
            # Test getting lessons directly from Firebase
            try:
                lessons = firebase_service.get_all_lessons()
                print(f"   📚 Firebase lessons found: {len(lessons) if lessons else 0}")
                
                if lessons:
                    for lesson in lessons[:3]:  # Show first 3
                        print(f"      - {lesson.get('id', 'No ID')}: {lesson.get('title', 'No Title')}")
                else:
                    print("   ⚠️  No lessons returned from Firebase")
                    
            except Exception as e:
                print(f"   ❌ Error getting lessons from Firebase: {e}")
                
        else:
            print("   ❌ Firebase service not available")
            
    except Exception as e:
        print(f"   ❌ Firebase service error: {e}")
    
    # Test lesson model
    print("\n📚 Lesson Model Test:")
    try:
        all_lessons = get_all_lessons()
        print(f"   📊 Total lessons from model: {len(all_lessons)}")
        
        if all_lessons:
            print("   📝 Available lessons:")
            for lesson in all_lessons:
                source = "🔥 Firebase" if "firebase" in str(lesson).lower() else "📦 Mock"
                print(f"      {source} - {lesson.get('id', 'No ID')}: {lesson.get('title', 'No Title')}")
        else:
            print("   ❌ No lessons returned from model")
            
    except Exception as e:
        print(f"   ❌ Lesson model error: {e}")
    
    # Test specific lesson
    print("\n🎯 Specific Lesson Test:")
    test_ids = ['python-basics-01', 'variables-02', 'functions-03']
    
    for lesson_id in test_ids:
        try:
            lesson = get_lesson(lesson_id)
            if lesson:
                print(f"   ✅ {lesson_id}: {lesson.get('title', 'No Title')}")
            else:
                print(f"   ❌ {lesson_id}: Not found")
        except Exception as e:
            print(f"   ❌ {lesson_id}: Error - {e}")
    
    print("\n" + "=" * 60)
    print("🎯 Analysis Complete!")
    print("\n💡 Recommendations:")
    print("1. If Firebase is not available, check environment variables")
    print("2. If lessons are from Mock data, Firebase may need seeding")
    print("3. Run seed_firebase.py to populate Firebase with lesson data")
    print("4. Check app logs for detailed Firebase connection errors")

if __name__ == "__main__":
    test_firebase_lessons()
