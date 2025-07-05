#!/usr/bin/env python3
"""
Script to upload a test lesson with the new block-based structure to Firebase
"""

import os
import json
import sys
from dotenv import load_dotenv

# Add the parent directory to the path so we can import from services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.firebase_service import FirebaseService

# Load environment variables
load_dotenv()

def upload_test_lesson():
    print("Uploading test lesson with block-based structure to Firebase...")
    
    # Build Firebase config from environment
    firebase_config = {
        "type": os.environ.get('FIREBASE_TYPE', 'service_account'),
        "project_id": os.environ.get('FIREBASE_PROJECT_ID'),
        "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID'),
        "private_key": os.environ.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
        "client_email": os.environ.get('FIREBASE_CLIENT_EMAIL'),
        "client_id": os.environ.get('FIREBASE_CLIENT_ID'),
        "auth_uri": os.environ.get('FIREBASE_AUTH_URI', 'https://accounts.google.com/o/oauth2/auth'),
        "token_uri": os.environ.get('FIREBASE_TOKEN_URI', 'https://oauth2.googleapis.com/token'),
        "auth_provider_x509_cert_url": os.environ.get('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
        "client_x509_cert_url": os.environ.get('FIREBASE_CLIENT_X509_CERT_URL'),
        "universe_domain": os.environ.get('FIREBASE_UNIVERSE_DOMAIN', 'googleapis.com')
    }
    
    # Initialize Firebase service
    firebase_service = FirebaseService(firebase_config)
    
    # Load the test lesson
    with open('firebase_data/lesson_block_test.json', 'r') as f:
        test_lesson_data = json.load(f)
    
    # Extract metadata and blocks
    lesson_metadata = test_lesson_data['lesson_metadata']
    blocks = test_lesson_data['blocks']
    
    # Set the lesson ID
    lesson_id = lesson_metadata['id']
    
    # Method 1: Upload as a single document with blocks array
    # This is the current approach in your system
    print(f"Method 1: Uploading lesson '{lesson_id}' as a single document...")
    
    # Combine metadata and blocks
    complete_lesson = {**lesson_metadata, 'blocks': blocks}
    
    # Upload to Firebase
    success = firebase_service.save_lesson(lesson_id, complete_lesson)
    
    if success:
        print(f"✅ Successfully uploaded lesson '{lesson_id}' to Firebase!")
        print(f"✅ You can now view it at /lesson/{lesson_id}")
    else:
        print(f"❌ Failed to upload lesson '{lesson_id}'")
    
    """
    # Method 2: Upload using collection/subcollection approach
    # This would be the recommended approach for future migration
    print(f"Method 2: Uploading lesson '{lesson_id}' using collection/subcollection...")
    
    # Get Firestore database
    db = firebase_service.db
    
    # 1. Create the lesson document with metadata
    lesson_ref = db.collection('lessons').document(lesson_id)
    lesson_ref.set(lesson_metadata)
    
    # 2. Create a blocks subcollection
    blocks_collection = lesson_ref.collection('blocks')
    
    # 3. Add each block as a separate document
    for block in blocks:
        block_id = block['id']
        blocks_collection.document(block_id).set(block)
    
    print(f"✅ Successfully uploaded lesson '{lesson_id}' with {len(blocks)} blocks!")
    """

if __name__ == "__main__":
    upload_test_lesson()
