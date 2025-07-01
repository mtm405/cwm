import json

# Load and check lesson data
with open('firebase_data/lessons.json') as f:
    data = json.load(f)

lesson = data['lessons']['python-basics-01']
print("🔍 LESSON DATA ANALYSIS")
print("=" * 30)
print(f"Title: {lesson['title']}")
print(f"Has subtopics field: {'subtopics' in lesson}")
print(f"Lesson keys: {list(lesson.keys())}")

if 'subtopics' in lesson:
    print(f"Subtopics: {lesson['subtopics']}")
    print(f"Subtopics type: {type(lesson['subtopics'])}")
else:
    print("❌ NO SUBTOPICS FIELD - this is the issue!")
    
print(f"\nContent length: {len(lesson.get('content', ''))}")
print(f"Code examples: {len(lesson.get('code_examples', []))}")
print(f"Exercises: {len(lesson.get('exercises', []))}")
