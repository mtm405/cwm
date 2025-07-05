#!/usr/bin/env python3
"""
Direct Firebase Lesson Deletion Script
Uses Firebase Admin SDK directly with app configuration
"""

import os
import sys
import json
from datetime import datetime

# Add the parent directory to the path so we can import from the app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from config import get_config
except ImportError as e:
    print(f"❌ Failed to import required modules: {e}")
    print("Make sure firebase-admin is installed: pip install firebase-admin")
    exit(1)

def delete_all_lessons_direct():
    """Delete all lessons using Firebase Admin SDK directly"""
    print("🗑️ Direct Firebase Lesson Deletion Script")
    print("=" * 50)
    
    try:
        # Get configuration
        config = get_config()
        
        # Initialize Firebase Admin (if not already initialized)
        if not firebase_admin._apps:
            try:
                # Try to use service account key file first
                service_key_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'serviceAccountKey.json')
                
                if os.path.exists(service_key_path):
                    print(f"📋 Using service account key file: {service_key_path}")
                    cred = credentials.Certificate(service_key_path)
                    firebase_admin.initialize_app(cred)
                else:
                    # Use environment variables
                    print("📋 Using environment variables for Firebase config")
                    firebase_config = config.FIREBASE_CONFIG
                    if not firebase_config.get('project_id'):
                        raise ValueError("Firebase project_id not found in configuration")
                    
                    cred = credentials.Certificate(firebase_config)
                    firebase_admin.initialize_app(cred)
                
                print("✅ Firebase Admin initialized successfully")
                
            except Exception as e:
                print(f"❌ Failed to initialize Firebase Admin: {e}")
                return False
        
        # Get Firestore client
        db = firestore.client()
        
        # Get all lessons
        print("📋 Fetching all lessons...")
        lessons_ref = db.collection('lessons')
        lessons = lessons_ref.stream()
        
        lesson_data = []
        for lesson in lessons:
            data = lesson.to_dict()
            lesson_info = {
                'id': lesson.id,
                'title': data.get('title', 'Untitled'),
                'data': data
            }
            lesson_data.append(lesson_info)
        
        if not lesson_data:
            print("✅ No lessons found to delete")
            return True
        
        print(f"📊 Found {len(lesson_data)} lessons:")
        for lesson in lesson_data:
            print(f"  - {lesson['id']}: {lesson['title']}")
        
        # Confirm deletion
        print(f"\n⚠️  This will delete {len(lesson_data)} lessons permanently!")
        print("⚠️  This action cannot be undone!")
        confirm = input("Type 'DELETE' to confirm deletion: ").strip()
        
        if confirm != 'DELETE':
            print("❌ Deletion cancelled")
            return False
        
        # Create backup before deletion
        backup_file = f"lessons_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        backup_path = os.path.join(os.path.dirname(__file__), backup_file)
        print(f"\n💾 Creating backup: {backup_path}")
        
        backup_data = [lesson['data'] for lesson in lesson_data]
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Backup created: {backup_path}")
        
        # Delete lessons
        print("\n🗑️ Deleting lessons...")
        deleted_count = 0
        failed_deletions = []
        
        for lesson in lesson_data:
            try:
                lessons_ref.document(lesson['id']).delete()
                print(f"✅ Deleted: {lesson['id']} - {lesson['title']}")
                deleted_count += 1
            except Exception as e:
                print(f"❌ Failed to delete {lesson['id']}: {e}")
                failed_deletions.append(lesson['id'])
        
        # Delete user progress
        print("\n🗑️ Cleaning up user progress...")
        try:
            # Delete all user progress documents
            progress_ref = db.collection('user_progress')
            progress_docs = progress_ref.stream()
            
            progress_deleted = 0
            for doc in progress_docs:
                try:
                    doc.reference.delete()
                    progress_deleted += 1
                except Exception as e:
                    print(f"❌ Failed to delete progress for {doc.id}: {e}")
            
            if progress_deleted > 0:
                print(f"✅ Deleted {progress_deleted} user progress documents")
            else:
                print("✅ No user progress documents found")
                
        except Exception as e:
            print(f"❌ Error cleaning up user progress: {e}")
        
        # Summary
        print(f"\n🎉 Deletion Summary:")
        print(f"   📊 Total lessons found: {len(lesson_data)}")
        print(f"   ✅ Successfully deleted: {deleted_count}")
        print(f"   ❌ Failed deletions: {len(failed_deletions)}")
        print(f"   💾 Backup saved as: {backup_path}")
        
        if failed_deletions:
            print(f"\n❌ Failed to delete: {', '.join(failed_deletions)}")
            return False
        
        print("\n🎉 All lessons deleted successfully!")
        print("📝 Your database is now ready for uploading new lessons.")
        return True
        
    except Exception as e:
        print(f"❌ Error during deletion: {e}")
        return False

if __name__ == "__main__":
    # Change to the correct directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    os.chdir(parent_dir)
    
    print(f"📁 Working directory: {os.getcwd()}")
    delete_all_lessons_direct()
