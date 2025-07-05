#!/usr/bin/env python3
"""
Simple Lesson Deletion Script
Alternative method using Firebase Admin SDK directly
"""

import json
import os
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("❌ Firebase Admin SDK not installed")
    print("Install with: pip install firebase-admin")
    exit(1)

def delete_all_lessons_simple():
    """Delete all lessons using Firebase Admin SDK"""
    print("🗑️ Simple Lesson Deletion Script")
    print("=" * 40)
    
    # Initialize Firebase Admin (if not already initialized)
    if not firebase_admin._apps:
        try:
            # Try to use default credentials
            cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin initialized")
        except Exception as e:
            print(f"❌ Failed to initialize Firebase Admin: {e}")
            print("Make sure you have GOOGLE_APPLICATION_CREDENTIALS set")
            return False
    
    # Get Firestore client
    db = firestore.client()
    
    try:
        # Get all lessons
        print("📋 Fetching all lessons...")
        lessons_ref = db.collection('lessons')
        lessons = lessons_ref.stream()
        
        lesson_ids = []
        for lesson in lessons:
            lesson_data = lesson.to_dict()
            lesson_ids.append({
                'id': lesson.id,
                'title': lesson_data.get('title', 'Untitled')
            })
        
        if not lesson_ids:
            print("✅ No lessons found to delete")
            return True
        
        print(f"📊 Found {len(lesson_ids)} lessons:")
        for lesson in lesson_ids:
            print(f"  - {lesson['id']}: {lesson['title']}")
        
        # Confirm deletion
        print(f"\n⚠️  This will delete {len(lesson_ids)} lessons permanently!")
        confirm = input("Type 'yes' to confirm deletion: ").lower().strip()
        
        if confirm != 'yes':
            print("❌ Deletion cancelled")
            return False
        
        # Delete lessons
        print("\n🗑️ Deleting lessons...")
        deleted_count = 0
        
        for lesson in lesson_ids:
            try:
                lessons_ref.document(lesson['id']).delete()
                print(f"✅ Deleted: {lesson['id']}")
                deleted_count += 1
            except Exception as e:
                print(f"❌ Failed to delete {lesson['id']}: {e}")
        
        print(f"\n🎉 Deletion complete! Deleted {deleted_count} lessons")
        return True
        
    except Exception as e:
        print(f"❌ Error during deletion: {e}")
        return False

if __name__ == "__main__":
    delete_all_lessons_simple()
