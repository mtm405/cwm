#!/usr/bin/env python3
"""
Domain 1 Lessons Upload Script
Upload Domain 1 template lessons to Firebase
Code with Morais - Python Learning Platform
"""

import os
import sys
import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import glob

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def initialize_firebase():
    """Initialize Firebase connection"""
    try:
        # Check if already initialized
        if firebase_admin._apps:
            return firestore.client()
        
        # Try service account from secure directory
        service_account_paths = [
            '../secure/serviceAccountKey.json',
            'secure/serviceAccountKey.json',
            '../serviceAccountKey.json',
            'serviceAccountKey.json'
        ]
        
        cred = None
        for path in service_account_paths:
            if os.path.exists(path):
                print(f"✅ Found service account key: {path}")
                cred = credentials.Certificate(path)
                break
        
        if not cred:
            print("❌ Service account key not found!")
            return None
        
        # Initialize Firebase
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        print("✅ Firebase initialized successfully")
        return db
        
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        return None

def find_domain1_lessons():
    """Find all Domain 1 lesson JSON files"""
    possible_paths = [
        'firebase_data/Lessons/Domain 1/*.json',
        'Lessons/Domain 1/*.json',
        'firebase_data/domain1/*.json',
        'domain1/*.json',
        'firebase_data/*domain1*.json',
        'firebase_data/*Domain1*.json'
    ]
    
    lessons = []
    
    for pattern in possible_paths:
        files = glob.glob(pattern, recursive=True)
        for file in files:
            if os.path.isfile(file):
                lessons.append(file)
    
    # Also check current directory for any lesson files
    current_dir_files = glob.glob('*.json')
    for file in current_dir_files:
        if 'lesson' in file.lower() and 'domain' in file.lower():
            lessons.append(file)
    
    # Remove duplicates
    lessons = list(set(lessons))
    
    return lessons

def validate_lesson_structure(lesson_data, filename):
    """Validate that lesson has required structure"""
    errors = []
    
    # Check required fields
    required_fields = ['id', 'title', 'description']
    for field in required_fields:
        if field not in lesson_data:
            errors.append(f"Missing required field: {field}")
    
    # Check if has subtopics structure
    if 'subtopics' in lesson_data:
        subtopics = lesson_data['subtopics']
        if isinstance(subtopics, list) and len(subtopics) > 0:
            lesson_data['has_subtopics'] = True
            
            # Ensure subtopics are properly structured
            for i, subtopic in enumerate(subtopics):
                if isinstance(subtopic, str):
                    # Convert string to object
                    subtopics[i] = {
                        'id': f'subtopic-{i}',
                        'title': subtopic,
                        'order': i
                    }
                elif isinstance(subtopic, dict):
                    # Ensure object has required fields
                    if 'id' not in subtopic:
                        subtopic['id'] = f'subtopic-{i}'
                    if 'order' not in subtopic:
                        subtopic['order'] = i
        else:
            lesson_data['has_subtopics'] = False
    else:
        lesson_data['has_subtopics'] = False
    
    # Add metadata if missing
    if 'created_at' not in lesson_data:
        lesson_data['created_at'] = datetime.now().isoformat()
    if 'updated_at' not in lesson_data:
        lesson_data['updated_at'] = datetime.now().isoformat()
    
    # Add default values for lesson cards
    if 'xp_reward' not in lesson_data:
        lesson_data['xp_reward'] = 100
    if 'difficulty' not in lesson_data:
        lesson_data['difficulty'] = 'beginner'
    if 'estimated_time' not in lesson_data:
        lesson_data['estimated_time'] = 30
    if 'category' not in lesson_data:
        lesson_data['category'] = 'python'
    if 'order' not in lesson_data:
        lesson_data['order'] = 1
    
    # Ensure total_subtopics field
    if lesson_data.get('has_subtopics'):
        lesson_data['total_subtopics'] = len(lesson_data.get('subtopics', []))
    else:
        lesson_data['total_subtopics'] = 0
    
    return errors, lesson_data

def upload_lesson(db, lesson_file):
    """Upload a single lesson to Firebase"""
    try:
        print(f"\n📖 Processing: {lesson_file}")
        
        # Load lesson data
        with open(lesson_file, 'r', encoding='utf-8') as f:
            lesson_data = json.load(f)
        
        # Validate and enhance lesson structure
        errors, lesson_data = validate_lesson_structure(lesson_data, lesson_file)
        
        if errors:
            print(f"  ❌ Validation errors:")
            for error in errors:
                print(f"    - {error}")
            return False
        
        lesson_id = lesson_data['id']
        lesson_title = lesson_data.get('title', 'Untitled')
        
        print(f"  📝 Lesson ID: {lesson_id}")
        print(f"  🎯 Title: {lesson_title}")
        print(f"  📊 Has subtopics: {lesson_data['has_subtopics']}")
        if lesson_data['has_subtopics']:
            print(f"  🗂️ Subtopics: {lesson_data['total_subtopics']}")
        
        # Upload to Firebase
        lesson_ref = db.collection('lessons').document(lesson_id)
        lesson_ref.set(lesson_data)
        
        print(f"  ✅ Uploaded successfully")
        return True
        
    except json.JSONDecodeError as e:
        print(f"  ❌ Invalid JSON: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Upload error: {e}")
        return False

def upload_domain1_lessons(db, lesson_files):
    """Upload all Domain 1 lessons"""
    print(f"\n🚀 Uploading {len(lesson_files)} Domain 1 lessons...")
    
    success_count = 0
    failed_count = 0
    
    for lesson_file in lesson_files:
        if upload_lesson(db, lesson_file):
            success_count += 1
        else:
            failed_count += 1
    
    print(f"\n📊 Upload Summary:")
    print(f"  ✅ Successful: {success_count}")
    print(f"  ❌ Failed: {failed_count}")
    print(f"  📝 Total: {len(lesson_files)}")
    
    return success_count, failed_count

def main():
    """Main execution function"""
    print("🚀 Domain 1 Lessons Upload Tool")
    print("=" * 40)
    print("Upload Domain 1 template lessons to Firebase")
    print("=" * 40)
    
    # Initialize Firebase
    db = initialize_firebase()
    if not db:
        print("❌ Failed to initialize Firebase. Exiting.")
        return False
    
    # Find Domain 1 lesson files
    print("\n🔍 Searching for Domain 1 lesson files...")
    lesson_files = find_domain1_lessons()
    
    if not lesson_files:
        print("❌ No Domain 1 lesson files found!")
        print("\n💡 Make sure your lesson JSON files are in one of these locations:")
        print("  - firebase_data/Lessons/Domain 1/")
        print("  - Lessons/Domain 1/")
        print("  - firebase_data/domain1/")
        print("  - Or current directory with 'lesson' and 'domain' in filename")
        return False
    
    print(f"✅ Found {len(lesson_files)} lesson files:")
    for i, file in enumerate(lesson_files, 1):
        print(f"  {i}. {file}")
    
    # Confirm upload
    response = input(f"\n🤔 Upload these {len(lesson_files)} lessons to Firebase? (y/N): ")
    if response.lower() != 'y':
        print("❌ Upload cancelled.")
        return False
    
    # Upload lessons
    success_count, failed_count = upload_domain1_lessons(db, lesson_files)
    
    if success_count > 0:
        print(f"\n✅ Successfully uploaded {success_count} Domain 1 lessons!")
        print("🎯 These lessons are now available as templates.")
        print("💡 You can now test the subtopic tabs and styling.")
        
        if failed_count > 0:
            print(f"⚠️ {failed_count} lessons failed to upload. Check the errors above.")
    else:
        print(f"\n❌ No lessons were uploaded successfully.")
    
    return success_count > 0

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n🎉 Domain 1 lessons are ready!")
            print("🔗 Visit: http://localhost:5000/lessons")
        else:
            print("\n❌ Upload failed or was cancelled.")
    except KeyboardInterrupt:
        print("\n\n⏹️ Upload cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
