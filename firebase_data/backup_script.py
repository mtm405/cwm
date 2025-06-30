#!/usr/bin/env python3
"""
Firebase Backup Script
Creates JSON backups of all Firestore collections
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
import os
from datetime import datetime

def backup_firestore():
    """Create a complete backup of Firestore data"""
    
    # Initialize Firebase
    if not firebase_admin._apps:
        cred = credentials.Certificate('../serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    
    # Create backup directory
    backup_dir = f"backups/{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}"
    os.makedirs(backup_dir, exist_ok=True)
    
    collections = ['users', 'lessons', 'quizzes', 'daily_challenges', 'activities', 'user_achievements']
    
    print("🔄 Creating Firestore backup...")
    
    for collection_name in collections:
        try:
            docs = db.collection(collection_name).get()
            collection_data = []
            
            for doc in docs:
                data = doc.to_dict()
                data['_id'] = doc.id  # Preserve document ID
                collection_data.append(data)
            
            # Save to JSON file
            backup_file = f"{backup_dir}/{collection_name}.json"
            with open(backup_file, 'w', encoding='utf-8') as f:
                json.dump(collection_data, f, indent=2, default=str)
            
            print(f"✅ Backed up {collection_name}: {len(collection_data)} documents")
            
        except Exception as e:
            print(f"❌ Error backing up {collection_name}: {e}")
    
    print(f"\n💾 Backup completed: {backup_dir}")
    
    # Create backup summary
    summary = {
        "backup_date": datetime.now().isoformat(),
        "collections": collections,
        "backup_directory": backup_dir
    }
    
    with open(f"{backup_dir}/backup_summary.json", 'w') as f:
        json.dump(summary, f, indent=2)

if __name__ == "__main__":
    backup_firestore()
