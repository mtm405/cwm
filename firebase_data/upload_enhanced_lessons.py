#!/usr/bin/env python3
"""
Upload Enhanced Lessons to Firebase
Code with Morais - Enhanced lesson structure with proper blocks
"""
import sys
import os
import json
from datetime import datetime, timezone

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService
from config import get_config
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def upload_enhanced_lessons():
    """Upload enhanced lessons with proper block structure to Firebase"""
    
    print("🚀 Uploading Enhanced Lessons to Firebase...")
    print("=" * 50)
    
    # Initialize Firebase service
    try:
        config = get_config()
        firebase_service = FirebaseService(config.FIREBASE_CONFIG)
        
        if not firebase_service.is_available():
            print("❌ Firebase not available. Check your configuration.")
            return False
            
        print(f"✅ Connected to Firebase project")
        
    except Exception as e:
        print(f"❌ Failed to initialize Firebase: {e}")
        return False
    
    # Load enhanced lessons
    try:
        with open('enhanced_lessons.json', 'r', encoding='utf-8') as f:
            lessons_data = json.load(f)
        
        print(f"📚 Loaded {len(lessons_data['lessons'])} lessons from enhanced_lessons.json")
        
    except Exception as e:
        print(f"❌ Failed to load lessons file: {e}")
        return False
    
    # Upload each lesson
    uploaded_count = 0
    total_lessons = len(lessons_data['lessons'])
    
    for lesson_id, lesson_data in lessons_data['lessons'].items():
        try:
            # Add server timestamps
            lesson_data['created_at'] = datetime.now(timezone.utc)
            lesson_data['updated_at'] = datetime.now(timezone.utc)
            
            # Upload to Firebase
            lesson_ref = firebase_service.db.collection('lessons').document(lesson_id)
            lesson_ref.set(lesson_data)
            
            print(f"  ✅ Uploaded: {lesson_data['title']}")
            print(f"     - Blocks: {len(lesson_data.get('blocks', []))}")
            print(f"     - Code Examples: {len(lesson_data.get('code_examples', []))}")
            print(f"     - Exercises: {len(lesson_data.get('exercises', []))}")
            
            uploaded_count += 1
            
        except Exception as e:
            print(f"  ❌ Failed to upload {lesson_id}: {e}")
    
    print(f"\n📊 Upload Summary:")
    print(f"   Total lessons: {total_lessons}")
    print(f"   Successfully uploaded: {uploaded_count}")
    print(f"   Failed: {total_lessons - uploaded_count}")
    
    if uploaded_count == total_lessons:
        print(f"\n🎉 All lessons uploaded successfully!")
        print(f"💡 You can now test the lesson page: /lesson/variables-02")
        return True
    else:
        print(f"\n⚠️  Some lessons failed to upload. Check the errors above.")
        return False

def verify_lesson_structure():
    """Verify that uploaded lessons have the correct structure"""
    
    print("\n🔍 Verifying lesson structure...")
    
    try:
        config = get_config()
        firebase_service = FirebaseService(config.FIREBASE_CONFIG)
        
        # Test with variables-02 lesson
        lesson_doc = firebase_service.db.collection('lessons').document('variables-02').get()
        
        if lesson_doc.exists:
            lesson_data = lesson_doc.to_dict()
            
            # Check required fields
            required_fields = ['id', 'title', 'description', 'blocks', 'code_examples', 'exercises']
            missing_fields = [field for field in required_fields if field not in lesson_data]
            
            if missing_fields:
                print(f"  ❌ Missing fields: {missing_fields}")
                return False
            
            # Check blocks structure
            blocks = lesson_data.get('blocks', [])
            if not blocks:
                print(f"  ❌ No blocks found in lesson")
                return False
            
            print(f"  ✅ Lesson structure verified:")
            print(f"     - Title: {lesson_data['title']}")
            print(f"     - Blocks: {len(blocks)}")
            print(f"     - Block types: {[block.get('type') for block in blocks]}")
            
            # Check if all block types are present
            block_types = set(block.get('type') for block in blocks)
            expected_types = {'text', 'code_example', 'interactive', 'quiz'}
            
            if expected_types.issubset(block_types):
                print(f"     - All expected block types present: {expected_types}")
            else:
                missing_types = expected_types - block_types
                print(f"     - Missing block types: {missing_types}")
            
            return True
            
        else:
            print(f"  ❌ Lesson 'variables-02' not found in Firebase")
            return False
            
    except Exception as e:
        print(f"  ❌ Verification failed: {e}")
        return False

def main():
    """Main execution function"""
    
    # Ensure we're in the right directory
    if not os.path.exists('enhanced_lessons.json'):
        # Try to find the file in parent directory
        if os.path.exists('../firebase_data/enhanced_lessons.json'):
            os.chdir('../firebase_data')
        elif os.path.exists('firebase_data/enhanced_lessons.json'):
            os.chdir('firebase_data')
    
    print("🔥 Enhanced Lessons Uploader")
    print("📝 This will upload lessons with proper block structure for the lesson page")
    print("=" * 70)
    
    # Ask for confirmation
    response = input("🤔 Upload enhanced lessons to Firebase? (y/N): ")
    if response.lower() != 'y':
        print("❌ Cancelled by user.")
        return False
    
    # Upload lessons
    success = upload_enhanced_lessons()
    
    if success:
        # Verify structure
        verify_lesson_structure()
        
        print("\n🎉 Enhanced lessons uploaded and verified!")
        print("\n📋 Next steps:")
        print("1. Restart your Flask application")
        print("2. Test the lesson page: https://dev.codewithmorais.com/lesson/variables-02")
        print("3. Check that all blocks render correctly")
        print("4. Verify interactive exercises work")
        
    return success

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
