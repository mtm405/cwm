#!/usr/bin/env python3
"""
Firebase Lessons Cleanup Script
Deletes all lessons from Firebase to prepare for new uploads
Code with Morais - Python Learning Platform
"""

import os
import sys
import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

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
            print("Please ensure serviceAccountKey.json is in one of these locations:")
            for path in service_account_paths:
                print(f"  - {path}")
            return None
        
        # Initialize Firebase
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        print("✅ Firebase initialized successfully")
        return db
        
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        return None

def get_project_info(db):
    """Get Firebase project information"""
    try:
        # Try to get project info by reading a small document
        test_doc = db.collection('_meta').document('info').get()
        project_id = db._client.project
        return project_id
    except Exception as e:
        print(f"⚠️ Could not get project info: {e}")
        return "unknown-project"

def delete_all_lessons(db):
    """Delete all lessons from Firebase"""
    collections_to_clean = [
        'lessons',
        'enhanced_lessons', 
        'lesson_blocks',
        'lesson_progress'  # Also clean up progress to avoid orphaned data
    ]
    
    total_deleted = 0
    
    for collection_name in collections_to_clean:
        print(f"\n🔄 Cleaning collection: {collection_name}")
        
        try:
            # Get all documents in the collection
            docs = db.collection(collection_name).get()
            
            if not docs:
                print(f"  ✅ Collection '{collection_name}' is already empty")
                continue
            
            print(f"  📊 Found {len(docs)} documents in '{collection_name}'")
            
            # Delete documents in batches
            batch = db.batch()
            batch_count = 0
            
            for doc in docs:
                batch.delete(doc.reference)
                batch_count += 1
                
                # Commit batch every 400 documents (Firestore limit is 500)
                if batch_count >= 400:
                    batch.commit()
                    print(f"    ✅ Deleted batch of {batch_count} documents")
                    total_deleted += batch_count
                    batch = db.batch()
                    batch_count = 0
            
            # Commit remaining documents
            if batch_count > 0:
                batch.commit()
                print(f"    ✅ Deleted final batch of {batch_count} documents")
                total_deleted += batch_count
            
            print(f"  ✅ Collection '{collection_name}' cleaned successfully")
            
        except Exception as e:
            print(f"  ❌ Error cleaning collection '{collection_name}': {e}")
    
    return total_deleted

def cleanup_subcollections(db):
    """Clean up any subcollections that might exist"""
    print(f"\n🔄 Checking for lesson subcollections...")
    
    try:
        # Check for lessons with blocks subcollections
        lessons = db.collection('lessons').get()
        subcollection_count = 0
        
        for lesson_doc in lessons:
            # Check if this lesson has a blocks subcollection
            blocks = lesson_doc.reference.collection('blocks').get()
            if blocks:
                print(f"  🗂️ Found {len(blocks)} blocks in lesson: {lesson_doc.id}")
                
                # Delete blocks subcollection
                batch = db.batch()
                for block in blocks:
                    batch.delete(block.reference)
                    subcollection_count += 1
                
                batch.commit()
                print(f"    ✅ Deleted blocks subcollection for lesson: {lesson_doc.id}")
        
        if subcollection_count > 0:
            print(f"  ✅ Cleaned {subcollection_count} subcollection documents")
        else:
            print(f"  ✅ No subcollections found")
            
    except Exception as e:
        print(f"  ⚠️ Error checking subcollections: {e}")

def create_backup_info(db, total_deleted):
    """Create a backup info document"""
    try:
        backup_info = {
            'cleanup_date': datetime.now().isoformat(),
            'documents_deleted': total_deleted,
            'cleanup_reason': 'Preparing for Domain 1 template lessons',
            'collections_cleaned': ['lessons', 'enhanced_lessons', 'lesson_blocks', 'lesson_progress']
        }
        
        # Store backup info
        db.collection('_cleanup_history').document(datetime.now().strftime('%Y%m%d_%H%M%S')).set(backup_info)
        print(f"📝 Cleanup info saved to _cleanup_history")
        
    except Exception as e:
        print(f"⚠️ Could not save cleanup info: {e}")

def main():
    """Main execution function"""
    print("🔥 Firebase Lessons Cleanup Tool")
    print("=" * 50)
    print("This tool will DELETE ALL LESSONS from Firebase")
    print("Use this to prepare for uploading Domain 1 template lessons")
    print("=" * 50)
    
    # Initialize Firebase
    db = initialize_firebase()
    if not db:
        print("❌ Failed to initialize Firebase. Exiting.")
        return False
    
    # Get project info
    project_id = get_project_info(db)
    print(f"🎯 Connected to Firebase project: {project_id}")
    
    # Safety confirmation
    print("\n⚠️  WARNING: This will permanently delete:")
    print("  - All lesson documents")
    print("  - All enhanced lesson documents") 
    print("  - All lesson blocks")
    print("  - All lesson progress data")
    print("  - Any lesson subcollections")
    print("\n🔄 This action CANNOT be undone!")
    
    # Double confirmation
    print(f"\nTo confirm deletion, type the project ID: {project_id}")
    user_input = input("Project ID: ").strip()
    
    if user_input != project_id:
        print("❌ Project ID does not match. Deletion cancelled.")
        return False
    
    # Final confirmation
    confirm = input("\nType 'DELETE ALL LESSONS' to proceed: ").strip()
    if confirm != 'DELETE ALL LESSONS':
        print("❌ Confirmation phrase does not match. Deletion cancelled.")
        return False
    
    print("\n🚀 Starting lesson cleanup...")
    
    # Clean up subcollections first
    cleanup_subcollections(db)
    
    # Delete all lessons
    total_deleted = delete_all_lessons(db)
    
    # Create backup info
    create_backup_info(db, total_deleted)
    
    print(f"\n✅ Cleanup completed successfully!")
    print(f"📊 Total documents deleted: {total_deleted}")
    print(f"🕒 Cleanup time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n🎯 Firebase is now ready for Domain 1 template lessons!")
    print("💡 You can now upload your JSON lesson files.")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("\n🎉 Ready to upload Domain 1 lessons!")
        else:
            print("\n❌ Cleanup was cancelled or failed.")
    except KeyboardInterrupt:
        print("\n\n⏹️ Cleanup cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
