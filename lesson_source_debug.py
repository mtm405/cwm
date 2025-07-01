import sys
sys.path.append('.')

print("🔍 DETAILED LESSON SOURCE DEBUG")
print("=" * 35)

import sys
sys.path.append('.')

print("🔍 DETAILED LESSON SOURCE DEBUG")
print("=" * 35)

# Initialize Firebase service properly
try:
    from config import Config
    from services.firebase_service import FirebaseService, set_firebase_service
    from models.lesson import set_firebase_service as set_lesson_firebase_service
    
    config = Config()
    firebase_service = FirebaseService(config.FIREBASE_CONFIG)
    set_firebase_service(firebase_service)
    set_lesson_firebase_service(firebase_service)
    
    print(f"Firebase available: {firebase_service.is_available()}")
except Exception as e:
    print(f"Firebase error: {e}")
    firebase_service = None

# Test lesson model processing
from models.lesson import get_lesson, get_mock_lesson

print(f"\n📖 Testing get_lesson('python-basics-01')...")
lesson = get_lesson('python-basics-01')

print(f"Title: {lesson.get('title', 'NO TITLE')}")
print(f"Source indicators:")
print(f"  - Contains mock indicators: {'mock' in lesson.get('description', '').lower()}")
print(f"  - Has dict subtopics: {isinstance(lesson.get('subtopics', []), list) and len(lesson.get('subtopics', [])) > 0 and isinstance(lesson.get('subtopics', [])[0], dict)}")

# Check raw Firebase JSON
print(f"\n📄 Raw Firebase JSON check...")
import json
with open('firebase_data/lessons.json') as f:
    data = json.load(f)

firebase_lesson = data['lessons']['python-basics-01']
print(f"Firebase JSON title: {firebase_lesson['title']}")
print(f"Firebase JSON has subtopics: {'subtopics' in firebase_lesson}")

print(f"\n🔍 Data source analysis:")
if lesson.get('title') == firebase_lesson.get('title'):
    print("✅ Model is using Firebase JSON data")
    print("❌ But model adds dict subtopics when none exist in JSON")
else:
    print("❌ Model is using mock/fallback data")
    print("   This suggests Firebase service is not working properly")
