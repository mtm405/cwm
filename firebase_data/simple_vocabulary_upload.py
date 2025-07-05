"""
Simple script to upload vocabulary terms to Firebase
"""
import os
import sys
import json
from datetime import datetime

# Add the parent directory to the path to import the services module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except ImportError:
    print("Firebase admin SDK not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "firebase-admin"])
    import firebase_admin
    from firebase_admin import credentials, firestore

# Initialize Firebase if not already initialized
if not firebase_admin._apps:
    # Get the absolute path to the service account key
    service_account_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                                       'secure', 'serviceAccountKey.json')
    
    # Initialize Firebase with the service account
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)

# Get Firestore database
db = firestore.client()

def upload_vocabulary():
    """Upload vocabulary terms to Firebase Firestore"""
    # Sample vocabulary terms
    terms = [
        {
            "term": "Variable",
            "description": "A container that stores information that can be used elsewhere in code.",
            "category": "Variables",
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        },
        {
            "term": "Function",
            "description": "A block of code that can be called upon multiple times within a program.",
            "category": "Functions",
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        },
        {
            "term": "Loop",
            "description": "A programming construct that repeats a group of commands.",
            "category": "Control Flow",
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        },
        {
            "term": "List",
            "description": "A variable that stores a collection of items in a defined order.",
            "category": "Data Structures",
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        },
        {
            "term": "Dictionary",
            "description": "A list of data that stores values in key-value pairs.",
            "category": "Data Structures",
            "created_at": firestore.SERVER_TIMESTAMP,
            "updated_at": firestore.SERVER_TIMESTAMP
        }
    ]
    
    # Create a batch operation
    batch = db.batch()
    
    # Add terms to vocabulary collection
    for term in terms:
        doc_ref = db.collection('vocabulary').document(term['term'].lower().replace(' ', '_'))
        batch.set(doc_ref, term)
    
    # Commit the batch
    batch.commit()
    
    print(f"Successfully uploaded {len(terms)} vocabulary terms to Firebase.")

if __name__ == "__main__":
    upload_vocabulary()
    print("Done!")
