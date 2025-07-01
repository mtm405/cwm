#!/usr/bin/env python3
"""
Simple Firebase Lesson Seeder
Populate Firebase with lesson data from lessons.json
"""

import json
import os
import sys
import firebase_admin
from firebase_admin import credentials, firestore

def seed_lessons():
    print("🔥 Firebase Lesson Seeder")
    print("=" * 40)
    
    # Initialize Firebase
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate("serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        print("✅ Connected to Firebase")
    except Exception as e:
        print(f"❌ Firebase connection error: {e}")
        return False
    
    # Load lesson data
    try:
        with open("firebase_data/lessons.json", "r", encoding="utf-8") as f:
            data = json.load(f)
        
        lessons = data.get("lessons", {})
        print(f"📚 Found {len(lessons)} lessons to seed")
    except Exception as e:
        print(f"❌ Error loading lessons.json: {e}")
        return False
    
    # Seed lessons
    success_count = 0
    for lesson_id, lesson_data in lessons.items():
        try:
            # Ensure the lesson has an ID field
            lesson_data['id'] = lesson_id
            
            # Add timestamps if missing
            if 'created_at' not in lesson_data:
                lesson_data['created_at'] = "2025-06-30T10:00:00Z"
            if 'updated_at' not in lesson_data:
                lesson_data['updated_at'] = "2025-06-30T10:00:00Z"
            
            # Upload to Firebase
            doc_ref = db.collection('lessons').document(lesson_id)
            doc_ref.set(lesson_data)
            
            print(f"✅ Seeded: {lesson_id} - {lesson_data.get('title', 'No Title')}")
            success_count += 1
            
        except Exception as e:
            print(f"❌ Error seeding {lesson_id}: {e}")
    
    print(f"\n🎯 Seeding Complete: {success_count}/{len(lessons)} lessons uploaded")
    
    # Verify the data
    try:
        lessons_ref = db.collection('lessons')
        docs = lessons_ref.stream()
        doc_count = sum(1 for _ in docs)
        print(f"✅ Verification: {doc_count} lessons in Firebase")
        return True
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

if __name__ == "__main__":
    success = seed_lessons()
    if success:
        print("\n🎊 Firebase lessons seeded successfully!")
        print("💡 You should now see Firebase lessons in your app")
    else:
        print("\n❌ Seeding failed. Check errors above.")
