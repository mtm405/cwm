#!/usr/bin/env python3
"""
Upload Domain 1 lessons to Firebase
"""
import json
import os
import sys
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from config import get_config
from services.firebase_service import FirebaseService

def upload_lesson(lesson_file_path):
    """Upload a single lesson to Firebase"""
    try:
        # Load lesson data
        with open(lesson_file_path, 'r', encoding='utf-8') as f:
            lesson_data = json.load(f)
        
        lesson_id = lesson_data.get('id')
        if not lesson_id:
            print(f"❌ No lesson ID found in {lesson_file_path}")
            return False
        
        # Initialize Firebase
        config = get_config()
        firebase_service = FirebaseService()
        
        if not firebase_service.is_available():
            print("❌ Firebase service is not available")
            return False
        
        # Upload lesson
        success = firebase_service.save_lesson(lesson_id, lesson_data)
        
        if success:
            print(f"✅ Uploaded lesson: {lesson_data.get('title', lesson_id)}")
            print(f"   ID: {lesson_id}")
            print(f"   Subtopics: {len(lesson_data.get('subtopics', []))}")
            return True
        else:
            print(f"❌ Failed to upload lesson: {lesson_id}")
            return False
            
    except Exception as e:
        print(f"❌ Error uploading {lesson_file_path}: {str(e)}")
        return False

def main():
    """Upload all Domain 1 lessons"""
    print("🚀 Starting Domain 1 lesson upload...")
    
    # Get the lessons directory
    lessons_dir = Path(__file__).parent / "Lessons" / "Domain 1"
    
    if not lessons_dir.exists():
        print(f"❌ Lessons directory not found: {lessons_dir}")
        return
    
    # Find all JSON files
    lesson_files = list(lessons_dir.glob("*.json"))
    
    if not lesson_files:
        print(f"❌ No JSON files found in {lessons_dir}")
        return
    
    print(f"📁 Found {len(lesson_files)} lesson files:")
    for file in lesson_files:
        print(f"   - {file.name}")
    
    # Upload each lesson
    successful_uploads = 0
    
    for lesson_file in lesson_files:
        print(f"\n📤 Uploading {lesson_file.name}...")
        if upload_lesson(lesson_file):
            successful_uploads += 1
    
    print(f"\n🎉 Upload complete!")
    print(f"✅ Successfully uploaded: {successful_uploads}/{len(lesson_files)} lessons")
    
    if successful_uploads < len(lesson_files):
        print(f"❌ Failed uploads: {len(lesson_files) - successful_uploads}")

if __name__ == "__main__":
    main()
