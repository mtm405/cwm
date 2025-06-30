#!/usr/bin/env python3
"""
Simple Firebase Setup Runner
Direct execution of the seeding process with minimal dependencies.
"""

import os
import sys
import subprocess
import json

def check_python_packages():
    """Check and install required Python packages."""
    print("Checking Python packages...")
    
    try:
        import firebase_admin
        print("✓ firebase-admin package already installed")
        return True
    except ImportError:
        print("Installing firebase-admin package...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "firebase-admin"])
            print("✓ firebase-admin package installed successfully")
            return True
        except subprocess.CalledProcessError:
            print("✗ Failed to install firebase-admin package")
            return False

def check_files():
    """Check if all required files exist."""
    print("\nChecking required files...")
    
    # Check for serviceAccountKey.json in parent directory
    service_key_path = "../serviceAccountKey.json"
    if os.path.exists(service_key_path):
        print(f"✓ Found: serviceAccountKey.json (in parent directory)")
    elif os.path.exists("serviceAccountKey.json"):
        print(f"✓ Found: serviceAccountKey.json")
        service_key_path = "serviceAccountKey.json"
    else:
        print(f"✗ Missing: serviceAccountKey.json")
        return False, ["serviceAccountKey.json"], None
    
    required_files = [
        "lessons.json", 
        "quizzes.json",
        "daily_challenges.json",
        "users.json"
    ]
    
    missing_files = []
    for file in required_files:
        if os.path.exists(file):
            print(f"✓ Found: {file}")
        else:
            print(f"✗ Missing: {file}")
            missing_files.append(file)
    
    return len(missing_files) == 0, missing_files, service_key_path

def get_project_id(service_key_path):
    """Get Firebase project ID from service account key."""
    try:
        with open(service_key_path, "r") as f:
            service_account = json.load(f)
        return service_account.get("project_id")
    except Exception as e:
        print(f"✗ Error reading {service_key_path}: {e}")
        return None

def main():
    """Main execution function."""
    print("=" * 50)
    print("Firebase Database Cleanup & Seeding Tool")
    print("Code with Morais - Python Learning Platform")
    print("=" * 50)
    
    # Check Python packages
    if not check_python_packages():
        print("\nSetup failed - required packages not available")
        input("Press Enter to exit...")
        return
    
    # Check files
    files_ok, missing_files, service_key_path = check_files()
    if not files_ok:
        print(f"\nSetup failed - missing required files:")
        for file in missing_files:
            print(f"  - {file}")
        print("\nPlease ensure all files are present and run again.")
        input("Press Enter to exit...")
        return
    
    # Get project ID
    project_id = get_project_id(service_key_path)
    if not project_id:
        print("\nSetup failed - could not determine Firebase project ID")
        input("Press Enter to exit...")
        return
    
    print(f"\nFirebase Project: {project_id}")
    
    # Warning
    print("\n" + "!" * 50)
    print("WARNING: This will DELETE ALL DATA in Firebase!")
    print("!" * 50)
    print("This will remove:")
    print("  - All users (except authenticated Google accounts)")
    print("  - All lessons and quizzes")
    print("  - All daily challenges")  
    print("  - All user activities and progress")
    print("\nThis action cannot be undone!")
    
    # Confirmation
    print(f"\nTo confirm, type the project ID: {project_id}")
    confirmation = input("Project ID: ").strip()
    
    if confirmation != project_id:
        print("✗ Cancelled - project ID mismatch")
        input("Press Enter to exit...")
        return
    
    # Run the seeding script
    print(f"\nStarting Firebase database cleanup and seeding...")
    print("This may take a few minutes...")
    
    try:
        # Import and run the seeding process directly
        import firebase_admin
        from firebase_admin import credentials, firestore
        from datetime import datetime, timezone
        from pathlib import Path
        
        # Initialize Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate(service_key_path)
            firebase_admin.initialize_app(cred, {'projectId': project_id})
        
        db = firestore.client()
        print(f"✓ Connected to Firebase project: {project_id}")
        
        # Simple cleanup and seeding
        collections_to_clean = ['users', 'lessons', 'quizzes', 'daily_challenges', 'activities']
        
        print("\nCleaning collections...")
        for collection_name in collections_to_clean:
            try:
                docs = list(db.collection(collection_name).stream())
                batch = db.batch()
                for doc in docs:
                    batch.delete(doc.reference)
                if docs:
                    batch.commit()
                print(f"✓ Cleaned '{collection_name}' collection ({len(docs)} documents)")
            except Exception as e:
                print(f"⚠ Error cleaning '{collection_name}': {e}")
        
        # Seed data
        data_files = {
            'lessons': 'lessons.json',
            'quizzes': 'quizzes.json', 
            'daily_challenges': 'daily_challenges.json',
            'users': 'users.json'
        }
        
        print("\nSeeding new data...")
        for collection_name, file_name in data_files.items():
            try:
                with open(file_name, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                collection = db.collection(collection_name)
                root_key = collection_name if collection_name in data else list(data.keys())[0]
                
                for doc_id, doc_data in data.get(root_key, {}).items():
                    doc_data['created_at'] = datetime.now(timezone.utc)
                    doc_data['updated_at'] = datetime.now(timezone.utc)
                    doc_data['id'] = doc_id
                    
                    collection.document(doc_id).set(doc_data)
                
                count = len(data.get(root_key, {}))
                print(f"✓ Seeded '{collection_name}' collection ({count} documents)")
                
            except Exception as e:
                print(f"⚠ Error seeding '{collection_name}': {e}")
        
        print("\n" + "=" * 50)
        print("✓ Firebase database successfully cleaned and seeded!")
        print("=" * 50)
        
        print("\nNext steps:")
        print("1. Open Firebase Console and verify data upload")
        print("2. Create Firestore indexes for better performance:")
        print("   - users: xp (desc), level (desc)")
        print("   - activities: user_id (asc), timestamp (desc)")
        print("   - lessons: category (asc), order (asc)")
        print("3. Update Firestore security rules if needed")
        print("4. Restart your Flask application")
        print("5. Test dashboard functionality")
        
    except Exception as e:
        print(f"\n✗ Error during seeding process: {e}")
        print("Check your internet connection and Firebase permissions.")
    
    print(f"\nSetup complete!")
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()
