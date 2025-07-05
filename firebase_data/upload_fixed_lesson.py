"""
Firebase Lesson Upload Tool
This script uploads the fixed lesson structure to Firebase
"""

import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os
import sys
from datetime import datetime

# Initialize Firebase
try:
    # Use the service account from the secure directory
    cred = credentials.Certificate('./secure/serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"❌ Error initializing Firebase: {str(e)}")
    sys.exit(1)

def upload_lesson(file_path):
    """Upload a lesson from a JSON file to Firebase"""
    try:
        # Load lesson data from JSON file
        with open(file_path, 'r') as f:
            lesson_data = json.load(f)
            
        # Get lesson ID
        lesson_id = lesson_data.get('id')
        if not lesson_id:
            print("❌ Error: No lesson ID found in the JSON file")
            return False
            
        print(f"🔄 Uploading lesson: {lesson_id}")
        
        # Add timestamp if not present
        if 'created_at' not in lesson_data:
            lesson_data['created_at'] = datetime.now().isoformat()
        if 'updated_at' not in lesson_data:
            lesson_data['updated_at'] = datetime.now().isoformat()
            
        # Add to Firestore
        lesson_ref = db.collection('lessons').document(lesson_id)
        lesson_ref.set(lesson_data)
        
        print(f"✅ Lesson '{lesson_id}' uploaded successfully")
        return True
    except Exception as e:
        print(f"❌ Error uploading lesson: {str(e)}")
        return False

if __name__ == "__main__":
    # File path to the fixed lesson JSON
    file_path = './firebase_data/lesson_block_fixed.json'
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found: {file_path}")
        sys.exit(1)
        
    # Upload the lesson
    success = upload_lesson(file_path)
    
    if success:
        print("✅ Lesson upload completed successfully")
    else:
        print("❌ Lesson upload failed")
