"""
Enhanced vocabulary upload script with comprehensive Python terms
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

def load_vocabulary_from_json():
    """Load vocabulary data from JSON file"""
    json_path = os.path.join(os.path.dirname(__file__), 'vocabulary.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('python_vocabulary', [])
    except FileNotFoundError:
        print(f"Vocabulary JSON file not found at {json_path}")
        return []
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON file: {e}")
        return []

def upload_vocabulary():
    """Upload vocabulary terms to Firebase Firestore"""
    print("Loading vocabulary from JSON file...")
    terms = load_vocabulary_from_json()
    
    if not terms:
        print("No vocabulary terms found. Exiting.")
        return
    
    print(f"Found {len(terms)} vocabulary terms to upload...")
    
    # Create a batch operation
    batch = db.batch()
    
    # Add terms to vocabulary collection
    for term in terms:
        # Add timestamp fields
        term_data = {
            **term,
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        
        # Use the term ID as document ID, or generate from term name
        doc_id = term.get('id', term['term'].lower().replace(' ', '_'))
        doc_ref = db.collection('vocabulary').document(doc_id)
        batch.set(doc_ref, term_data)
    
    # Commit the batch
    try:
        batch.commit()
        print(f"✅ Successfully uploaded {len(terms)} vocabulary terms to Firebase.")
    except Exception as e:
        print(f"❌ Error uploading vocabulary: {e}")

def clear_vocabulary():
    """Clear all existing vocabulary terms (use with caution)"""
    print("Clearing existing vocabulary...")
    
    # Get all documents in vocabulary collection
    vocab_ref = db.collection('vocabulary')
    docs = vocab_ref.stream()
    
    # Delete in batches
    batch = db.batch()
    count = 0
    
    for doc in docs:
        batch.delete(doc.reference)
        count += 1
        
        # Commit every 500 operations (Firestore limit)
        if count % 500 == 0:
            batch.commit()
            batch = db.batch()
    
    # Commit remaining operations
    if count % 500 != 0:
        batch.commit()
    
    print(f"Cleared {count} existing vocabulary terms.")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Upload vocabulary to Firebase')
    parser.add_argument('--clear', action='store_true', help='Clear existing vocabulary before upload')
    args = parser.parse_args()
    
    if args.clear:
        clear_vocabulary()
    
    upload_vocabulary()
    print("Done!")
