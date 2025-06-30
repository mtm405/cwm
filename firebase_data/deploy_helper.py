#!/usr/bin/env python3
"""
Firebase Rules and Indexes Deployment Helper
Code with Morais - Python Learning Platform
"""

import webbrowser
import os

def open_firebase_console():
    """Open Firebase Console for manual setup."""
    project_id = "code-with-morais-405"
    
    urls = {
        "Rules": f"https://console.firebase.google.com/project/{project_id}/firestore/rules",
        "Indexes": f"https://console.firebase.google.com/project/{project_id}/firestore/indexes",
        "Database": f"https://console.firebase.google.com/project/{project_id}/firestore/data"
    }
    
    print("🔥 Firebase Console Quick Access")
    print("=" * 40)
    print(f"Project: {project_id}")
    print()
    
    for name, url in urls.items():
        print(f"Opening {name}...")
        try:
            webbrowser.open(url)
            print(f"✅ {name} opened in browser")
        except Exception as e:
            print(f"❌ Could not open {name}: {e}")
            print(f"   Manual URL: {url}")
        print()

def show_setup_instructions():
    """Display setup instructions."""
    print("📋 FIREBASE SETUP INSTRUCTIONS")
    print("=" * 50)
    print()
    
    print("🔐 SECURITY RULES SETUP:")
    print("1. Go to Firestore Database > Rules")
    print("2. Copy content from 'firestore.rules' file")
    print("3. Paste into the Firebase Console")
    print("4. Click 'Publish'")
    print()
    
    print("🗂️ INDEXES SETUP:")
    print("Create these indexes in Firestore Database > Indexes:")
    print()
    
    indexes = [
        {
            "name": "Users Leaderboard",
            "collection": "users",
            "fields": [("xp", "Descending"), ("level", "Descending")]
        },
        {
            "name": "User Activities",
            "collection": "activities", 
            "fields": [("user_id", "Ascending"), ("timestamp", "Descending")]
        },
        {
            "name": "Lessons Order",
            "collection": "lessons",
            "fields": [("category", "Ascending"), ("order", "Ascending")]
        }
    ]
    
    for i, index in enumerate(indexes, 1):
        print(f"INDEX {i}: {index['name']}")
        print(f"  Collection: {index['collection']}")
        print(f"  Fields:")
        for field, order in index['fields']:
            print(f"    - {field}: {order}")
        print()
    
    print("⏱️ Index creation may take 5-10 minutes for large datasets")
    print()

def check_files():
    """Check if required files exist."""
    print("📁 CHECKING FILES:")
    print("-" * 20)
    
    files = {
        "firestore.rules": "Security rules configuration",
        "firestore.indexes.json": "Index definitions for Firebase CLI",
        "SETUP_GUIDE.md": "Detailed setup instructions"
    }
    
    all_exist = True
    for file, description in files.items():
        if os.path.exists(file):
            print(f"✅ {file} - {description}")
        else:
            print(f"❌ {file} - Missing!")
            all_exist = False
    
    print()
    return all_exist

def main():
    """Main execution."""
    print("🚀 Firebase Setup Helper")
    print("=" * 30)
    print()
    
    # Check files
    if not check_files():
        print("❌ Some files are missing. Please run the seeding script first.")
        return
    
    # Show instructions
    show_setup_instructions()
    
    # Ask if user wants to open console
    choice = input("Open Firebase Console automatically? (y/n): ").lower().strip()
    
    if choice in ['y', 'yes']:
        print()
        open_firebase_console()
        print()
        print("🎯 Next Steps:")
        print("1. Follow the setup instructions above")
        print("2. Deploy the rules and create the indexes")
        print("3. Test your dashboard performance")
        print("4. Monitor Firebase usage")
    else:
        print()
        print("Manual URLs:")
        project_id = "code-with-morais-405"
        print(f"Rules:   https://console.firebase.google.com/project/{project_id}/firestore/rules")
        print(f"Indexes: https://console.firebase.google.com/project/{project_id}/firestore/indexes")
    
    print()
    print("✨ Setup helper complete!")

if __name__ == "__main__":
    main()
