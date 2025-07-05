#!/usr/bin/env python3
"""
Delete All Lessons Script
Removes all lessons from Firestore to prepare for new module upload
"""

import os
import sys
import json
from datetime import datetime

# Add the parent directory to the path to import our services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from services.firebase_service import FirebaseService
    from config.settings import get_settings
except ImportError as e:
    print(f"❌ Error importing modules: {e}")
    print("Make sure you're running this from the project root directory")
    sys.exit(1)

def delete_all_lessons():
    """Delete all lessons from Firestore"""
    print("🗑️ Starting lesson deletion process...")
    print("=" * 50)
    
    # Initialize Firebase service
    firebase_service = FirebaseService()
    
    if not firebase_service.is_available():
        print("❌ Firebase service is not available")
        print("Make sure your Firebase credentials are set up correctly")
        return False
    
    try:
        # Get all lessons first
        print("📋 Fetching all existing lessons...")
        lessons = firebase_service.get_all_lessons()
        
        if not lessons:
            print("✅ No lessons found to delete")
            return True
        
        print(f"📊 Found {len(lessons)} lessons to delete:")
        for lesson in lessons:
            print(f"  - {lesson.get('id', 'Unknown ID')}: {lesson.get('title', 'Untitled')}")
        
        # Confirm deletion
        print("\n⚠️  WARNING: This will permanently delete ALL lessons from Firestore!")
        confirmation = input("Type 'DELETE ALL LESSONS' to confirm: ")
        
        if confirmation != "DELETE ALL LESSONS":
            print("❌ Deletion cancelled")
            return False
        
        # Delete each lesson
        print("\n🗑️ Deleting lessons...")
        deleted_count = 0
        failed_count = 0
        
        for lesson in lessons:
            lesson_id = lesson.get('id')
            lesson_title = lesson.get('title', 'Untitled')
            
            try:
                # Delete from Firestore
                firebase_service.db.collection('lessons').document(lesson_id).delete()
                print(f"✅ Deleted: {lesson_id} ({lesson_title})")
                deleted_count += 1
                
            except Exception as e:
                print(f"❌ Failed to delete {lesson_id}: {str(e)}")
                failed_count += 1
        
        # Summary
        print("\n" + "=" * 50)
        print("🎯 DELETION SUMMARY")
        print(f"✅ Successfully deleted: {deleted_count} lessons")
        if failed_count > 0:
            print(f"❌ Failed to delete: {failed_count} lessons")
        
        # Also delete related collections (optional)
        delete_related = input("\nDelete related user progress data? (y/N): ").lower().strip()
        if delete_related == 'y':
            delete_user_progress()
        
        print("\n🎉 Lesson deletion completed!")
        return True
        
    except Exception as e:
        print(f"❌ Error during deletion process: {str(e)}")
        return False

def delete_user_progress():
    """Delete all user progress data"""
    print("\n🗑️ Deleting user progress data...")
    
    firebase_service = FirebaseService()
    
    try:
        # Get all user progress documents
        users_ref = firebase_service.db.collection('user_progress')
        users = users_ref.stream()
        
        deleted_users = 0
        for user_doc in users:
            user_id = user_doc.id
            
            # Delete all lesson progress for this user
            lessons_ref = users_ref.document(user_id).collection('lessons')
            lessons = lessons_ref.stream()
            
            lesson_count = 0
            for lesson_doc in lessons:
                lesson_doc.reference.delete()
                lesson_count += 1
            
            # Delete the user progress document if it's empty
            if lesson_count > 0:
                print(f"✅ Deleted progress for user {user_id} ({lesson_count} lessons)")
                deleted_users += 1
        
        if deleted_users > 0:
            print(f"✅ Deleted progress data for {deleted_users} users")
        else:
            print("ℹ️ No user progress data found")
            
    except Exception as e:
        print(f"❌ Error deleting user progress: {str(e)}")

def backup_lessons_before_deletion():
    """Create a backup of all lessons before deletion"""
    print("💾 Creating backup of existing lessons...")
    
    firebase_service = FirebaseService()
    
    try:
        lessons = firebase_service.get_all_lessons()
        
        if not lessons:
            print("ℹ️ No lessons to backup")
            return True
        
        # Create backup file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = f"lessons_backup_{timestamp}.json"
        backup_path = os.path.join(os.path.dirname(__file__), backup_file)
        
        backup_data = {
            "backup_date": datetime.now().isoformat(),
            "total_lessons": len(lessons),
            "lessons": lessons
        }
        
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"✅ Backup created: {backup_file}")
        print(f"📁 Location: {backup_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error creating backup: {str(e)}")
        return False

def main():
    """Main execution function"""
    print("🚀 Lesson Deletion Script")
    print("=" * 50)
    
    # Create backup first
    if not backup_lessons_before_deletion():
        print("⚠️ Failed to create backup. Continue anyway? (y/N): ", end="")
        if input().lower().strip() != 'y':
            print("❌ Operation cancelled")
            return
    
    # Delete lessons
    success = delete_all_lessons()
    
    if success:
        print("\n🎉 All done! You can now upload your first module.")
        print("\n📝 Next steps:")
        print("1. Prepare your lesson JSON files")
        print("2. Use upload_lessons.py to upload the new module")
        print("3. Test the lessons in your application")
    else:
        print("\n❌ Deletion process failed. Check the errors above.")

if __name__ == "__main__":
    main()
