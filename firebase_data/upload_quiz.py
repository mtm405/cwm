"""
Firebase Quiz Upload Tool
This script uploads the quiz to Firebase
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

def upload_quiz(file_path):
    """Upload a quiz from a JSON file to Firebase"""
    try:
        # Load quiz data from JSON file
        with open(file_path, 'r') as f:
            quiz_data = json.load(f)
            
        # Get quiz ID
        quiz_id = quiz_data.get('id')
        if not quiz_id:
            print("❌ Error: No quiz ID found in the JSON file")
            return False
            
        print(f"🔄 Uploading quiz: {quiz_id}")
        
        # Add timestamp if not present
        if 'created_at' not in quiz_data:
            quiz_data['created_at'] = datetime.now().isoformat()
        if 'updated_at' not in quiz_data:
            quiz_data['updated_at'] = datetime.now().isoformat()
            
        # Add to Firestore
        quiz_ref = db.collection('quizzes').document(quiz_id)
        quiz_ref.set(quiz_data)
        
        print(f"✅ Quiz '{quiz_id}' uploaded successfully")
        return True
    except Exception as e:
        print(f"❌ Error uploading quiz: {str(e)}")
        return False

if __name__ == "__main__":
    # File path to the quiz JSON
    file_path = './firebase_data/python_basics_quiz.json'
    
    # Check if file exists
    if not os.path.exists(file_path):
        print(f"❌ Error: File not found: {file_path}")
        sys.exit(1)
        
    # Upload the quiz
    success = upload_quiz(file_path)
    
    if success:
        print("✅ Quiz upload completed successfully")
    else:
        print("❌ Quiz upload failed")
