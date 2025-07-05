#!/usr/bin/env python3
"""
Verify uploaded lesson in Firebase
"""

import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService
from config import get_config

def verify_lesson():
    """Verify the uploaded lesson"""
    try:
        # Initialize Firebase service
        config = get_config()
        firebase_service = FirebaseService(config.FIREBASE_CONFIG)
        
        if not firebase_service.is_available():
            print("❌ Firebase service is not available")
            return False
        
        # Get lesson data
        lesson_id = "python-datatypes-operators-01"
        lesson_data = firebase_service.get_lesson(lesson_id)
        
        if lesson_data:
            print(f"✅ Lesson found: {lesson_data['title']}")
            print(f"📝 Blocks: {len(lesson_data['blocks'])}")
            print(f"🎯 Difficulty: {lesson_data['difficulty']}")
            print(f"⏱️ Estimated time: {lesson_data['estimated_time']} minutes")
            print(f"📋 Subtopics: {len(lesson_data['subtopics'])}")
            
            # Check block types
            block_types = {}
            for block in lesson_data['blocks']:
                block_type = block['type']
                if block_type in block_types:
                    block_types[block_type] += 1
                else:
                    block_types[block_type] = 1
            
            print("\n🧱 Block Types Distribution:")
            for block_type, count in block_types.items():
                print(f"  {block_type}: {count}")
                
            # Check subtopics
            print("\n📑 Subtopics:")
            for i, subtopic in enumerate(lesson_data['subtopics']):
                print(f"  {i+1}. {subtopic}")
                
            return True
        else:
            print(f"❌ Lesson not found: {lesson_id}")
            return False
            
    except Exception as e:
        print(f"❌ Error verifying lesson: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔍 Verifying uploaded lesson...")
    success = verify_lesson()
    
    if success:
        print("\n🎉 Lesson verification completed successfully!")
        print("The lesson is now available at: /lesson/python-datatypes-operators-01")
    else:
        print("\n💥 Lesson verification failed!")
