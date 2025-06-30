#!/usr/bin/env python3
"""
Quick Firebase Setup Script
Run this to clean and populate your Firebase database with the website structure.
"""

import os
import sys
import json
from pathlib import Path

def check_requirements():
    """Check if all requirements are met."""
    print("🔍 Checking requirements...")
    
    errors = []
    
    # Check if firebase-admin is installed
    try:
        import firebase_admin
        print("  ✅ firebase-admin package installed")
    except ImportError:
        errors.append("firebase-admin package not installed. Run: pip install firebase-admin")
    
    # Check for service account key
    if not os.path.exists("serviceAccountKey.json"):
        errors.append("serviceAccountKey.json not found. Download from Firebase Console > Project Settings > Service Accounts")
    else:
        print("  ✅ serviceAccountKey.json found")
    
    # Check for data files
    required_files = ["lessons.json", "quizzes.json", "daily_challenges.json", "users.json"]
    for file in required_files:
        if not os.path.exists(file):
            errors.append(f"{file} not found")
        else:
            print(f"  ✅ {file} found")
    
    return errors

def get_project_id():
    """Get Firebase project ID from service account key."""
    try:
        with open("serviceAccountKey.json", "r") as f:
            service_account = json.load(f)
        return service_account.get("project_id")
    except Exception:
        return None

def main():
    """Main execution."""
    print("🔥 Firebase Quick Setup Tool")
    print("=" * 40)
    
    # Check requirements
    errors = check_requirements()
    
    if errors:
        print(f"\n❌ Requirements not met:")
        for error in errors:
            print(f"   - {error}")
        print(f"\nPlease fix these issues and run again.")
        return
    
    # Get project ID
    project_id = get_project_id()
    if not project_id:
        print("❌ Could not determine Firebase project ID from serviceAccountKey.json")
        return
    
    print(f"\n🎯 Firebase Project: {project_id}")
    
    # Final confirmation
    print(f"\n⚠️  WARNING: This will DELETE ALL DATA in Firebase project '{project_id}'")
    print("This includes:")
    print("  - All users (except authenticated accounts)")
    print("  - All lessons and quizzes")
    print("  - All daily challenges")
    print("  - All user activities and progress")
    
    confirmation = input(f"\nType '{project_id}' to confirm deletion and re-seeding: ")
    
    if confirmation != project_id:
        print("❌ Cancelled - project ID mismatch")
        return
    
    # Update seed_firebase.py with correct project ID
    seed_file = Path("seed_firebase.py")
    if seed_file.exists():
        content = seed_file.read_text()
        content = content.replace('FIREBASE_PROJECT_ID = "your-project-id"', f'FIREBASE_PROJECT_ID = "{project_id}"')
        seed_file.write_text(content)
        print(f"✅ Updated seed_firebase.py with project ID: {project_id}")
    
    # Run the seeding script
    print(f"\n🚀 Starting Firebase seeding process...")
    try:
        import subprocess
        result = subprocess.run([sys.executable, "seed_firebase.py"], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Seeding completed successfully!")
            print("\n📋 Next steps:")
            print("1. Check Firebase Console to verify data upload")
            print("2. Create indexes as suggested by the script")
            print("3. Upload security rules to Firestore")
            print("4. Restart your Flask application")
            print("5. Test dashboard functionality")
        else:
            print(f"❌ Seeding failed:")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ Error running seeding script: {e}")

if __name__ == "__main__":
    main()
