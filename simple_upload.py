import json
import sys
sys.path.append('.')

from services.firebase_service import FirebaseService

print("🚀 Starting lesson upload...")

# Load the lesson
try:
    with open('firebase_data/Lessons/Domain 1/Lesson 1 - Fixed.json', 'r') as f:
        lesson_data = json.load(f)
    print("✅ Lesson data loaded successfully")
except Exception as e:
    print(f"❌ Error loading lesson: {e}")
    sys.exit(1)

print(f"📚 Lesson: {lesson_data['title']}")
print(f"🆔 ID: {lesson_data['id']}")
print(f"📝 Subtopics: {len(lesson_data['subtopics'])}")

# Upload to Firebase
try:
    firebase_service = FirebaseService()
    
    if not firebase_service.is_available():
        print('❌ Firebase not available')
        sys.exit(1)
    
    print("🔥 Firebase is available, uploading...")
    
    # Use the direct Firebase admin method
    import firebase_admin
    from firebase_admin import firestore
    
    db = firestore.client()
    
    # Upload to lessons collection
    doc_ref = db.collection('lessons').document(lesson_data['id'])
    doc_ref.set(lesson_data)
    
    print('✅ Lesson uploaded directly to Firebase!')
    
    # Verify upload
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        print(f"✅ Verification: Lesson '{data.get('title')}' found in Firebase")
    else:
        print("❌ Verification failed: Lesson not found after upload")
        
except Exception as e:
    print(f"❌ Error uploading: {e}")
    import traceback
    traceback.print_exc()
