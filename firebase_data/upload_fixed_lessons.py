#!/usr/bin/env python3
"""
Upload fixed Domain 1 lessons to Firebase
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

def upload_fixed_lessons():
    """Upload the fixed lessons to Firebase"""
    try:
        # Initialize Firebase
        if not firebase_admin._apps:
            service_account_paths = [
                'secure/serviceAccountKey.json',
                '../secure/serviceAccountKey.json', 
                'serviceAccountKey.json'
            ]
            
            cred = None
            for path in service_account_paths:
                if os.path.exists(path):
                    cred = credentials.Certificate(path)
                    break
            
            if cred:
                firebase_admin.initialize_app(cred)
            else:
                print('❌ No service account key found')
                return False
        
        db = firestore.client()
        
        # Upload the fixed lesson
        print('🔄 Uploading fixed Lesson 3...')
        lesson_file = 'firebase_data/Lessons/Domain 1/Lesson3_fixed.json'
        
        with open(lesson_file, 'r', encoding='utf-8') as f:
            lesson_data = json.load(f)
        
        # Add required fields
        lesson_data['has_subtopics'] = True
        lesson_data['total_subtopics'] = len(lesson_data['subtopics'])
        
        # Upload to Firebase
        lesson_ref = db.collection('lessons').document(lesson_data['id'])
        lesson_ref.set(lesson_data)
        
        print(f'✅ Successfully uploaded lesson: {lesson_data["id"]}')
        print(f'   Title: {lesson_data["title"]}')
        print(f'   Subtopics: {lesson_data["total_subtopics"]}')
        
        return True
        
    except Exception as e:
        print(f'❌ Error: {e}')
        return False

if __name__ == '__main__':
    success = upload_fixed_lessons()
    if success:
        print('🎉 Fixed lessons uploaded successfully!')
    else:
        print('❌ Failed to upload fixed lessons')
