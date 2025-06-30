#!/usr/bin/env python3
"""
Firebase Database Cleanup and Seeding Script
Code with Morais - Python Learning Platform

This script will:
1. Clean up existing Firebase collections
2. Upload new structured data
3. Create proper indexes and security rules
4. Validate data integrity
"""

import json
import os
import sys
from datetime import datetime, timezone
from typing import Dict, List, Any
import firebase_admin
from firebase_admin import credentials, firestore
from pathlib import Path

class FirebaseSeeder:
    """Firebase database seeder and cleanup utility."""
    
    def __init__(self, project_id: str, credentials_path: str):
        """Initialize Firebase connection."""
        self.project_id = project_id
        self.db = None
        self._initialize_firebase(credentials_path)
        
    def _initialize_firebase(self, credentials_path: str):
        """Initialize Firebase admin SDK."""
        try:
            if not firebase_admin._apps:
                cred = credentials.Certificate(credentials_path)
                firebase_admin.initialize_app(cred, {
                    'projectId': self.project_id
                })
            self.db = firestore.client()
            print(f"✅ Connected to Firebase project: {self.project_id}")
        except Exception as e:
            print(f"❌ Error initializing Firebase: {e}")
            sys.exit(1)
    
    def cleanup_collections(self, collections_to_clean: List[str] = None):
        """Clean up existing collections."""
        if collections_to_clean is None:
            collections_to_clean = [
                'users', 'lessons', 'quizzes', 'daily_challenges', 
                'activities', 'user_achievements', 'leaderboard'
            ]
        
        print("\n🧹 Starting Firebase cleanup...")
        
        for collection_name in collections_to_clean:
            try:
                # Get all documents in collection
                docs = self.db.collection(collection_name).stream()
                batch = self.db.batch()
                doc_count = 0
                
                for doc in docs:
                    batch.delete(doc.reference)
                    doc_count += 1
                    
                    # Commit in batches of 500 (Firestore limit)
                    if doc_count % 500 == 0:
                        batch.commit()
                        batch = self.db.batch()
                
                # Commit remaining docs
                if doc_count % 500 != 0:
                    batch.commit()
                
                print(f"  🗑️  Cleaned '{collection_name}' collection ({doc_count} documents)")
                
            except Exception as e:
                print(f"  ⚠️  Error cleaning '{collection_name}': {e}")
    
    def seed_lessons(self, lessons_file: str):
        """Upload lessons data."""
        print("\n📚 Seeding lessons...")
        
        try:
            with open(lessons_file, 'r', encoding='utf-8') as f:
                lessons_data = json.load(f)
            
            lessons_collection = self.db.collection('lessons')
            
            for lesson_id, lesson_data in lessons_data.get('lessons', {}).items():
                # Add timestamps
                lesson_data['created_at'] = datetime.now(timezone.utc)
                lesson_data['updated_at'] = datetime.now(timezone.utc)
                lesson_data['id'] = lesson_id
                
                lessons_collection.document(lesson_id).set(lesson_data)
                print(f"  ✅ Added lesson: {lesson_data.get('title', lesson_id)}")
                
        except Exception as e:
            print(f"  ❌ Error seeding lessons: {e}")
    
    def seed_quizzes(self, quizzes_file: str):
        """Upload quizzes data."""
        print("\n🧠 Seeding quizzes...")
        
        try:
            with open(quizzes_file, 'r', encoding='utf-8') as f:
                quizzes_data = json.load(f)
            
            quizzes_collection = self.db.collection('quizzes')
            
            for quiz_id, quiz_data in quizzes_data.get('quizzes', {}).items():
                quiz_data['created_at'] = datetime.now(timezone.utc)
                quiz_data['id'] = quiz_id
                
                quizzes_collection.document(quiz_id).set(quiz_data)
                print(f"  ✅ Added quiz: {quiz_data.get('title', quiz_id)}")
                
        except Exception as e:
            print(f"  ❌ Error seeding quizzes: {e}")
    
    def seed_daily_challenges(self, challenges_file: str):
        """Upload daily challenges."""
        print("\n🎯 Seeding daily challenges...")
        
        try:
            with open(challenges_file, 'r', encoding='utf-8') as f:
                challenges_data = json.load(f)
            
            challenges_collection = self.db.collection('daily_challenges')
            
            for challenge_id, challenge_data in challenges_data.get('daily_challenges', {}).items():
                challenge_data['created_at'] = datetime.now(timezone.utc)
                challenge_data['id'] = challenge_id
                
                challenges_collection.document(challenge_id).set(challenge_data)
                print(f"  ✅ Added challenge: {challenge_data.get('title', challenge_id)}")
                
        except Exception as e:
            print(f"  ❌ Error seeding challenges: {e}")
    
    def seed_sample_users(self, users_file: str):
        """Upload sample users (for development/testing)."""
        print("\n👤 Seeding sample users...")
        
        try:
            with open(users_file, 'r', encoding='utf-8') as f:
                users_data = json.load(f)
            
            users_collection = self.db.collection('users')
            
            for user_id, user_data in users_data.get('users', {}).items():
                # Add timestamps
                user_data['created_at'] = datetime.now(timezone.utc)
                user_data['updated_at'] = datetime.now(timezone.utc)
                user_data['last_login'] = datetime.now(timezone.utc)
                
                users_collection.document(user_id).set(user_data)
                print(f"  ✅ Added user: {user_data.get('display_name', user_id)}")
                
        except Exception as e:
            print(f"  ❌ Error seeding users: {e}")
    
    def create_indexes(self):
        """Create necessary Firestore indexes."""
        print("\n🗂️  Creating indexes...")
        
        # Note: Indexes are typically created through Firebase Console or CLI
        # This is informational - you'll need to create these manually
        
        indexes_needed = [
            {
                'collection': 'users',
                'fields': [
                    {'field': 'xp', 'order': 'desc'},
                    {'field': 'level', 'order': 'desc'}
                ]
            },
            {
                'collection': 'activities', 
                'fields': [
                    {'field': 'user_id', 'order': 'asc'},
                    {'field': 'timestamp', 'order': 'desc'}
                ]
            },
            {
                'collection': 'lessons',
                'fields': [
                    {'field': 'category', 'order': 'asc'},
                    {'field': 'order', 'order': 'asc'}
                ]
            }
        ]
        
        print("  📋 Indexes needed (create these in Firebase Console):")
        for index in indexes_needed:
            print(f"    - Collection: {index['collection']}")
            for field in index['fields']:
                print(f"      Field: {field['field']} ({field['order']})")
    
    def validate_data(self):
        """Validate uploaded data."""
        print("\n✅ Validating uploaded data...")
        
        collections_to_check = ['users', 'lessons', 'quizzes', 'daily_challenges']
        
        for collection_name in collections_to_check:
            try:
                docs = list(self.db.collection(collection_name).limit(5).stream())
                count = len(docs)
                print(f"  📊 {collection_name}: {count} documents found")
                
                if count > 0:
                    sample_doc = docs[0].to_dict()
                    required_fields = self._get_required_fields(collection_name)
                    
                    missing_fields = []
                    for field in required_fields:
                        if field not in sample_doc:
                            missing_fields.append(field)
                    
                    if missing_fields:
                        print(f"    ⚠️  Missing fields: {missing_fields}")
                    else:
                        print(f"    ✅ All required fields present")
                        
            except Exception as e:
                print(f"  ❌ Error validating {collection_name}: {e}")
    
    def _get_required_fields(self, collection_name: str) -> List[str]:
        """Get required fields for each collection."""
        required_fields = {
            'users': ['uid', 'email', 'display_name', 'xp', 'level', 'pycoins'],
            'lessons': ['id', 'title', 'description', 'difficulty', 'xp_reward'],
            'quizzes': ['id', 'lesson_id', 'title', 'questions'],
            'daily_challenges': ['id', 'title', 'difficulty', 'xp_reward']
        }
        return required_fields.get(collection_name, [])
    
    def generate_security_rules(self):
        """Generate Firestore security rules."""
        rules = """rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // For leaderboard
    }
    
    // Lessons are public read, admin write only
    match /lessons/{lessonId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }
    
    // Quizzes are public read, admin write only
    match /quizzes/{quizId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }
    
    // Daily challenges are public read, admin write only
    match /daily_challenges/{challengeId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }
    
    // Activities are user-specific
    match /activities/{activityId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.user_id == request.auth.uid;
    }
    
    // User achievements are user-specific read, system write
    match /user_achievements/{achievementId} {
      allow read: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }
  }
}"""
        
        with open('firestore.rules', 'w') as f:
            f.write(rules)
        
        print("\n🔐 Generated firestore.rules file")
        print("   Upload this to Firebase Console > Firestore > Rules")


def main():
    """Main execution function."""
    print("🔥 Firebase Database Cleanup & Seeding Tool")
    print("=" * 50)
    
    # Configuration
    FIREBASE_PROJECT_ID = "code-with-morais-405"  # Your Firebase project
    CREDENTIALS_PATH = "serviceAccountKey.json"
    
    # Data files (current directory)
    current_dir = Path(".")
    
    # Initialize seeder
    seeder = FirebaseSeeder(FIREBASE_PROJECT_ID, CREDENTIALS_PATH)
    
    # Ask for confirmation
    print(f"\n⚠️  This will DELETE ALL DATA in Firebase project: {FIREBASE_PROJECT_ID}")
    confirmation = input("Are you sure you want to continue? (type 'YES' to confirm): ")
    
    if confirmation != "YES":
        print("❌ Cancelled by user")
        return
    
    try:
        # Step 1: Cleanup existing data
        seeder.cleanup_collections()
        
        # Step 2: Seed new data
        seeder.seed_lessons(current_dir / "lessons.json")
        seeder.seed_quizzes(current_dir / "quizzes.json") 
        seeder.seed_daily_challenges(current_dir / "daily_challenges.json")
        seeder.seed_sample_users(current_dir / "users.json")
        
        # Step 3: Create indexes info
        seeder.create_indexes()
        
        # Step 4: Validate data
        seeder.validate_data()
        
        # Step 5: Generate security rules
        seeder.generate_security_rules()
        
        print("\n🎉 Firebase database successfully cleaned and seeded!")
        print("\n📋 Next steps:")
        print("1. Create the suggested indexes in Firebase Console")
        print("2. Upload the generated firestore.rules file")
        print("3. Test your application with the new data structure")
        
    except Exception as e:
        print(f"\n❌ Error during seeding process: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
