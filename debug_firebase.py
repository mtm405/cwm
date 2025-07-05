import sys
sys.path.append('.')

from services.firebase_service import FirebaseService

# Test Firebase directly
firebase_service = FirebaseService()
print("🔥 Firebase Service Status:")
print(f"   Available: {firebase_service.is_available()}")

if firebase_service.is_available():
    print("\n📚 Getting all lessons from Firebase...")
    lessons = firebase_service.get_all_lessons()
    
    if lessons is None:
        print("❌ get_all_lessons returned None")
    elif len(lessons) == 0:
        print("⚠️ Firebase returned empty list - no lessons found")
        
        # Try to see what's in Firebase
        try:
            import firebase_admin
            from firebase_admin import firestore
            
            db = firestore.client()
            docs = list(db.collection('lessons').stream())
            print(f"📊 Raw Firebase check: {len(docs)} documents in 'lessons' collection")
            
            for doc in docs:
                print(f"   - {doc.id}: {doc.to_dict().get('title', 'No title')}")
                
        except Exception as e:
            print(f"❌ Error accessing Firebase directly: {e}")
    else:
        print(f"✅ Found {len(lessons)} lessons:")
        for lesson in lessons:
            print(f"   - {lesson.get('id', 'No ID')}: {lesson.get('title', 'No title')}")
else:
    print("❌ Firebase not available")
