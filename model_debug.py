import sys
sys.path.append('.')

# Test the lesson model processing
from models.lesson import get_lesson

print("🔍 LESSON MODEL DEBUG")
print("=" * 25)

lesson_data = get_lesson('python-basics-01')
if lesson_data:
    print(f"✅ Lesson model returned data")
    print(f"Title: {lesson_data['title']}")
    print(f"Has subtopics: {'subtopics' in lesson_data}")
    
    if 'subtopics' in lesson_data:
        subtopics = lesson_data['subtopics']
        print(f"Subtopics: {subtopics}")
        print(f"Subtopics type: {type(subtopics)}")
        print(f"Subtopics length: {len(subtopics)}")
        
        # Test the issue
        for i, subtopic in enumerate(subtopics):
            print(f"{i+1}. {subtopic} (type: {type(subtopic)})")
            # This is what's causing the issue:
            if hasattr(subtopic, 'title'):
                print(f"   subtopic.title = {subtopic.title}")
            else:
                print(f"   subtopic.title would be: {subtopic.title if isinstance(subtopic, str) else 'N/A'}")
else:
    print("❌ No lesson data returned")
