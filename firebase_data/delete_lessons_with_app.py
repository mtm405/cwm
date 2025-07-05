#!/usr/bin/env python3
"""
Enhanced Lesson Deletion Script
Uses existing app configuration to delete all lessons
"""

import os
import sys
import json
from datetime import datetime

# Add the parent directory to the path so we can import from the app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    # Import from our app
    from services.firebase_service import FirebaseService
    from config import get_config
except ImportError as e:
    print(f"❌ Failed to import app modules: {e}")
    print("Make sure you're running from the correct directory")
    exit(1)

def delete_all_lessons_with_app():
    """Delete all lessons using the app's Firebase service"""
    print("🗑️ Enhanced Lesson Deletion Script")
    print("=" * 40)
    
    try:
        # Get configuration
        config = get_config()
        
        # Initialize Firebase service
        firebase_service = FirebaseService(config)
        
        # Get all lessons
        print("📋 Fetching all lessons...")
        lessons_data = firebase_service.get_all_lessons()
        
        if not lessons_data:
            print("✅ No lessons found to delete")
            return True
        
        print(f"📊 Found {len(lessons_data)} lessons:")
        for lesson in lessons_data:
            title = lesson.get('title', 'Untitled')
            lesson_id = lesson.get('id', 'Unknown ID')
            print(f"  - {lesson_id}: {title}")
        
        # Confirm deletion
        print(f"\n⚠️  This will delete {len(lessons_data)} lessons permanently!")
        print("⚠️  This action cannot be undone!")
        confirm = input("Type 'DELETE' to confirm deletion: ").strip()
        
        if confirm != 'DELETE':
            print("❌ Deletion cancelled")
            return False
        
        # Create backup before deletion
        backup_file = f"lessons_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        print(f"\n💾 Creating backup: {backup_file}")
        with open(backup_file, 'w') as f:
            json.dump(lessons_data, f, indent=2)
        print(f"✅ Backup created: {backup_file}")
        
        # Delete lessons
        print("\n🗑️ Deleting lessons...")
        deleted_count = 0
        
        for lesson in lessons_data:
            lesson_id = lesson.get('id')
            if lesson_id:
                try:
                    success = firebase_service.delete_lesson(lesson_id)
                    if success:
                        print(f"✅ Deleted: {lesson_id}")
                        deleted_count += 1
                    else:
                        print(f"❌ Failed to delete: {lesson_id}")
                except Exception as e:
                    print(f"❌ Error deleting {lesson_id}: {e}")
        
        print(f"\n🎉 Deletion complete! Deleted {deleted_count} lessons")
        print(f"💾 Backup saved as: {backup_file}")
        
        # Also delete user progress
        print("\n🗑️ Cleaning up user progress...")
        try:
            firebase_service.delete_all_user_progress()
            print("✅ User progress cleaned up")
        except Exception as e:
            print(f"❌ Error cleaning up user progress: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during deletion: {e}")
        return False

if __name__ == "__main__":
    # Change to the correct directory
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    delete_all_lessons_with_app()
