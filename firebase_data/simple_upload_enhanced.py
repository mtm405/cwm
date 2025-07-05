"""
Quick script to upload the enhanced lesson with quiz to Firebase
"""
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import json
import os
import sys

def upload_lesson_to_firebase():
    # Initialize Firebase if not already initialized
    try:
        firebase_admin.get_app()
    except ValueError:
        # Path to the service account key
        service_account_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            'secure',
            'serviceAccountKey.json'
        )
        
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    
    # Get Firestore client
    db = firestore.client()
    
    # Path to the enhanced lesson file
    lesson_file_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        'enhanced_lesson_with_quiz.json'
    )
    
    print(f"Loading lesson data from {lesson_file_path}...")
    
    try:
        # Load lesson data from JSON file
        with open(lesson_file_path, 'r', encoding='utf-8') as file:
            lesson_data = json.load(file)
            
        # Get lesson ID from metadata
        lesson_id = lesson_data["lesson_metadata"]["id"]
        quiz_id = lesson_data["lesson_metadata"]["quiz_id"]
        
        print(f"Uploading lesson: {lesson_id} with quiz: {quiz_id}")
        
        # Copy metadata to the top level
        top_level_data = {k: v for k, v in lesson_data["lesson_metadata"].items()}
        
        # Create a separate blocks collection
        blocks_data = lesson_data["blocks"]
        
        # Add lesson document to 'enhanced_lessons' collection
        lesson_ref = db.collection('enhanced_lessons').document(lesson_id)
        lesson_ref.set(top_level_data)
        
        # Add blocks as a subcollection
        blocks_collection = lesson_ref.collection('blocks')
        
        # Delete any existing blocks
        existing_blocks = blocks_collection.stream()
        for block in existing_blocks:
            block.reference.delete()
        
        # Add new blocks
        for block in blocks_data:
            block_id = block["id"]
            blocks_collection.document(block_id).set(block)
            
        print(f"Successfully uploaded enhanced lesson '{lesson_id}' with {len(blocks_data)} blocks")
        print(f"The lesson uses quiz_id: '{quiz_id}' for its quiz block")
        
        # Verify that the quiz exists
        quiz_ref = db.collection('quizzes').document(quiz_id)
        quiz_doc = quiz_ref.get()
        
        if quiz_doc.exists:
            print(f"Verified quiz {quiz_id} exists in Firestore")
        else:
            print(f"Warning: Quiz {quiz_id} does not exist in Firestore. You may need to upload it.")
        
    except Exception as e:
        print(f"Error uploading lesson data: {e}")
        sys.exit(1)

if __name__ == "__main__":
    upload_lesson_to_firebase()
