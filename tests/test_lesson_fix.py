#!/usr/bin/env python3
"""
Test script to verify the lesson loading fix
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from models.lesson import get_all_lessons
from services.firebase_service import FirebaseService
from config import get_config

def test_lesson_loading():
    """Test if lesson loading correctly handles empty Firebase"""
    print("🔍 Testing lesson loading fix...")
    
    # Initialize config and Firebase
    config = get_config()
    firebase_config = {
        'type': os.environ.get('FIREBASE_TYPE'),
        'project_id': os.environ.get('FIREBASE_PROJECT_ID'),
        'private_key_id': os.environ.get('FIREBASE_PRIVATE_KEY_ID'),
        'private_key': os.environ.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
        'client_email': os.environ.get('FIREBASE_CLIENT_EMAIL'),
        'client_id': os.environ.get('FIREBASE_CLIENT_ID'),
        'auth_uri': os.environ.get('FIREBASE_AUTH_URI'),
        'token_uri': os.environ.get('FIREBASE_TOKEN_URI'),
        'auth_provider_x509_cert_url': os.environ.get('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
        'client_x509_cert_url': os.environ.get('FIREBASE_CLIENT_X509_CERT_URL')
    }
    
    try:
        firebase_service = FirebaseService(firebase_config)
        
        # Set the global firebase service for lesson model
        from models import lesson
        lesson.set_firebase_service(firebase_service)
        
        print(f"📊 Firebase available: {firebase_service.is_available()}")
        
        if firebase_service.is_available():
            # Test Firebase lessons directly
            firebase_lessons = firebase_service.get_all_lessons()
            print(f"📝 Firebase lessons count: {len(firebase_lessons)}")
            
            # Test lesson model
            all_lessons = get_all_lessons()
            print(f"🎯 Lesson model lessons count: {len(all_lessons)}")
            
            if len(firebase_lessons) == 0 and len(all_lessons) == 3:
                print("❌ BUG: Firebase has 0 lessons but lesson model returns 3 (mock fallback)")
                print("🔍 Lesson IDs from model:")
                for lesson in all_lessons:
                    print(f"  - {lesson.get('id')}: {lesson.get('title')}")
            elif len(firebase_lessons) == len(all_lessons):
                print("✅ FIX WORKING: Firebase and lesson model return same count")
            else:
                print(f"⚠️  Mismatch: Firebase={len(firebase_lessons)}, Model={len(all_lessons)}")
                
        else:
            print("❌ Firebase not available - cannot test fix")
            
    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_lesson_loading()
