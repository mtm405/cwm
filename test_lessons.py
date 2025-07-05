import sys
sys.path.append('.')

from services.firebase_service import FirebaseService

# Test Firebase connection
firebase_service = FirebaseService()
if firebase_service.is_available():
    print("✅ Firebase is available")
    
    # Get all lessons
    lessons = firebase_service.get_all_lessons()
    print(f"📚 Found {len(lessons)} lessons:")
    
    for lesson in lessons:
        print(f"  - {lesson.get('title', 'No title')} (ID: {lesson.get('id', 'No ID')})")
        if lesson.get('subtopics'):
            print(f"    Subtopics: {len(lesson['subtopics'])}")
            for i, subtopic in enumerate(lesson['subtopics']):
                print(f"      {i+1}. {subtopic.get('title', 'No title')}")
else:
    print("❌ Firebase not available")
