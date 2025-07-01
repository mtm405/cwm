#!/usr/bin/env python3
"""
Test Firebase initialization directly
"""
import os
import sys
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_firebase_init():
    """Test Firebase initialization"""
    try:
        print("🔥 Testing Firebase initialization...")
        
        # Import configuration
        from config import Config
        config = Config()
        
        print(f"Service account key file exists: {os.path.exists('serviceAccountKey.json')}")
        print(f"Firebase config validation: {config.validate_firebase_config()}")
        
        # Try to initialize Firebase service
        from services.firebase_service import FirebaseService
        firebase_service = FirebaseService(config.FIREBASE_CONFIG)
        
        print(f"Firebase service created: {firebase_service is not None}")
        print(f"Firebase service available: {firebase_service.is_available()}")
        
        if firebase_service.is_available():
            print("✅ Firebase initialized successfully!")
            
            # Try to get lessons
            try:
                lessons_ref = firebase_service.db.collection('lessons')
                lessons = lessons_ref.limit(1).get()
                print(f"Found {len(lessons)} lessons in Firebase")
                if lessons:
                    lesson_data = lessons[0].to_dict()
                    print(f"Sample lesson: {lesson_data.get('title', 'No title')}")
            except Exception as e:
                print(f"Error accessing lessons: {e}")
        else:
            print("❌ Firebase not available")
            
    except Exception as e:
        print(f"❌ Error testing Firebase: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_firebase_init()
