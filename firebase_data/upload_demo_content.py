"""
Firebase Content Upload Tool
This script uploads both the demo lesson and quiz to Firebase
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

def upload_content(file_path, collection):
    """Upload content from a JSON file to Firebase"""
    try:
        # Load data from JSON file
        with open(file_path, 'r') as f:
            content_data = json.load(f)
            
        # Get content ID
        content_id = content_data.get('id')
        if not content_id:
            print(f"❌ Error: No ID found in the JSON file: {file_path}")
            return False
            
        print(f"🔄 Uploading {collection} content: {content_id}")
        
        # Add timestamp if not present
        if 'created_at' not in content_data:
            content_data['created_at'] = datetime.now().isoformat()
        if 'updated_at' not in content_data:
            content_data['updated_at'] = datetime.now().isoformat()
            
        # Add to Firestore
        content_ref = db.collection(collection).document(content_id)
        content_ref.set(content_data)
        
        print(f"✅ {collection.capitalize()} '{content_id}' uploaded successfully")
        return True
    except Exception as e:
        print(f"❌ Error uploading {collection}: {str(e)}")
        return False

def upload_lesson(file_path):
    """Upload a lesson from a JSON file to Firebase"""
    return upload_content(file_path, 'lessons')

def upload_quiz(file_path):
    """Upload a quiz from a JSON file to Firebase"""
    return upload_content(file_path, 'quizzes')

if __name__ == "__main__":
    # File paths
    lesson_file_path = './firebase_data/all_block_types_demo.json'
    quiz_file_path = './firebase_data/python_basics_quiz.json'
    
    # Check if files exist
    if not os.path.exists(lesson_file_path):
        print(f"❌ Error: File not found: {lesson_file_path}")
        sys.exit(1)
        
    if not os.path.exists(quiz_file_path):
        print(f"❌ Error: File not found: {quiz_file_path}")
        sys.exit(1)
    
    # Upload the quiz first (since the lesson references it)
    quiz_success = upload_quiz(quiz_file_path)
    
    if quiz_success:
        print("✅ Quiz upload completed successfully")
    else:
        print("❌ Quiz upload failed")
        sys.exit(1)
    
    # Upload the lesson
    lesson_success = upload_lesson(lesson_file_path)
    
    if lesson_success:
        print("✅ Lesson upload completed successfully")
    else:
        print("❌ Lesson upload failed")
        sys.exit(1)
    
    print("✅ All content uploaded successfully!")
