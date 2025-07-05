#!/usr/bin/env python3
"""
Lesson Upload Helper Script
Upload lessons from JSON files to Firestore
"""

import json
import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from config import get_config
except ImportError as e:
    print(f"❌ Failed to import required modules: {e}")
    sys.exit(1)

def upload_lesson(lesson_file_path):
    """Upload a lesson from JSON file"""
    try:
        # Check if file exists
        if not os.path.exists(lesson_file_path):
            print(f"❌ File not found: {lesson_file_path}")
            return False
        
        # Load lesson data
        print(f"📋 Loading lesson from: {lesson_file_path}")
        with open(lesson_file_path, 'r', encoding='utf-8') as f:
            lesson_data = json.load(f)
        
        # Validate required fields
        required_fields = ['id', 'title', 'blocks']
        for field in required_fields:
            if field not in lesson_data:
                print(f"❌ Missing required field: {field}")
                return False
        
        # Initialize Firebase if needed
        if not firebase_admin._apps:
            try:
                config = get_config()
                
                # Try service account key file first
                service_key_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'serviceAccountKey.json')
                
                if os.path.exists(service_key_path):
                    print(f"📋 Using service account key file")
                    cred = credentials.Certificate(service_key_path)
                    firebase_admin.initialize_app(cred)
                else:
                    print(f"📋 Using environment variables")
                    cred = credentials.Certificate(config.FIREBASE_CONFIG)
                    firebase_admin.initialize_app(cred)
                
                print("✅ Firebase initialized successfully")
                
            except Exception as e:
                print(f"❌ Failed to initialize Firebase: {e}")
                return False
        
        db = firestore.client()
        
        # Add timestamps if not present
        if 'created_at' not in lesson_data:
            lesson_data['created_at'] = datetime.now().isoformat()
        lesson_data['updated_at'] = datetime.now().isoformat()
        
        # Upload lesson
        lesson_id = lesson_data['id']
        print(f"📤 Uploading lesson: {lesson_id}")
        
        db.collection('lessons').document(lesson_id).set(lesson_data)
        
        print(f"✅ Lesson uploaded successfully!")
        print(f"   📝 ID: {lesson_id}")
        print(f"   📚 Title: {lesson_data.get('title', 'Unknown')}")
        print(f"   🧩 Blocks: {len(lesson_data.get('blocks', []))}")
        print(f"   📑 Subtopics: {len(lesson_data.get('subtopics', []))}")
        
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON format: {e}")
        return False
    except Exception as e:
        print(f"❌ Error uploading lesson: {e}")
        return False

def upload_multiple_lessons(directory_path):
    """Upload all JSON files in a directory"""
    if not os.path.exists(directory_path):
        print(f"❌ Directory not found: {directory_path}")
        return False
    
    json_files = [f for f in os.listdir(directory_path) if f.endswith('.json')]
    
    if not json_files:
        print(f"❌ No JSON files found in: {directory_path}")
        return False
    
    print(f"📋 Found {len(json_files)} JSON files to upload")
    
    success_count = 0
    failed_files = []
    
    for json_file in json_files:
        file_path = os.path.join(directory_path, json_file)
        print(f"\n📤 Processing: {json_file}")
        
        if upload_lesson(file_path):
            success_count += 1
        else:
            failed_files.append(json_file)
    
    print(f"\n🎉 Upload Summary:")
    print(f"   📊 Total files: {len(json_files)}")
    print(f"   ✅ Successful: {success_count}")
    print(f"   ❌ Failed: {len(failed_files)}")
    
    if failed_files:
        print(f"\n❌ Failed files: {', '.join(failed_files)}")
    
    return len(failed_files) == 0

def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("📚 Lesson Upload Helper")
        print("=" * 30)
        print("Usage:")
        print("  python upload_lesson.py <lesson_file.json>")
        print("  python upload_lesson.py <directory_path>")
        print("\nExamples:")
        print("  python upload_lesson.py my_lesson.json")
        print("  python upload_lesson.py ./lessons/")
        sys.exit(1)
    
    target_path = sys.argv[1]
    
    # Change to parent directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    os.chdir(parent_dir)
    
    print(f"📚 Lesson Upload Helper")
    print("=" * 30)
    print(f"📁 Working directory: {os.getcwd()}")
    
    if os.path.isfile(target_path):
        # Upload single file
        success = upload_lesson(target_path)
        sys.exit(0 if success else 1)
    elif os.path.isdir(target_path):
        # Upload all files in directory
        success = upload_multiple_lessons(target_path)
        sys.exit(0 if success else 1)
    else:
        print(f"❌ Path not found: {target_path}")
        sys.exit(1)

if __name__ == "__main__":
    main()
