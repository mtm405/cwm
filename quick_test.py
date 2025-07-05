import sys
sys.path.append('.')
from models.lesson import get_all_lessons

lessons = get_all_lessons()
print(f'Found {len(lessons)} lessons:')
for lesson in lessons:
    print(f'- {lesson.get("id")}: {lesson.get("title")}')
