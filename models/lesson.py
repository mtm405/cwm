"""
Lesson model for Code with Morais
"""
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

# Firebase service will be injected from app.py
firebase_service = None

def set_firebase_service(service):
    """Set the Firebase service instance"""
    global firebase_service
    firebase_service = service

def get_mock_lessons():
    """Get mock lessons for development"""
    lessons = [
        {
            'id': 'python-basics',
            'title': 'Python Basics',
            'description': 'Learn the fundamentals of Python programming',
            'order': 1,
            'xp_reward': 100,
            'subtopics': ['Variables', 'Data Types', 'Basic Operations'],
            'total_subtopics': 3,
            'color': '#3498db',
            'icon': 'fas fa-code'
        },
        {
            'id': 'control-flow',
            'title': 'Control Flow',
            'description': 'Master if statements, loops, and program flow',
            'order': 2,
            'xp_reward': 150,
            'subtopics': ['If Statements', 'For Loops', 'While Loops'],
            'total_subtopics': 3,
            'color': '#e74c3c',
            'icon': 'fas fa-route'
        },
        {
            'id': 'functions',
            'title': 'Functions',
            'description': 'Create reusable code with functions',
            'order': 3,
            'xp_reward': 200,
            'subtopics': ['Defining Functions', 'Parameters', 'Return Values'],
            'total_subtopics': 3,
            'color': '#f39c12',
            'icon': 'fas fa-cogs'
        }
    ]
    
    # Enhance each lesson
    for lesson in lessons:
        _enhance_lesson_data(lesson)
    
    return lessons

def get_mock_lesson(lesson_id):
    """Get mock lesson data for development"""
    lessons = {
        'python-basics': {
            'id': 'python-basics',
            'title': 'Python Basics',
            'content': [
                {
                    'type': 'text',
                    'content': '# Welcome to Python Basics!\n\nPython is a powerful, versatile programming language that is perfect for beginners.'
                },
                {
                    'type': 'code_example',
                    'language': 'python',
                    'code': '# This is a comment\nprint("Hello, World!")\n\n# Variables\nname = "Code with Morais"\nage = 16\nprint(f"Welcome to {name}!")'
                },
                {
                    'type': 'interactive_challenge',
                    'id': 'hello_world_challenge',
                    'instructions': 'Write a program that prints your name',
                    'starter_code': '# Write your code here\n',
                    'test_cases': [
                        {'input': '', 'expected_output': 'Hello'}
                    ]
                },
                {
                    'type': 'quiz',
                    'quiz_id': 'python-basics-quiz'
                }
            ],
            'subtopics': [
                {'id': 'variables', 'title': 'Variables', 'order': 1},
                {'id': 'data-types', 'title': 'Data Types', 'order': 2},
                {'id': 'operations', 'title': 'Basic Operations', 'order': 3}
            ]
        },
        'python-basics-01': {
            'id': 'python-basics-01',
            'title': 'Python Basics - Chapter 1',
            'content': [
                {
                    'type': 'text',
                    'content': '# Welcome to Python Basics - Chapter 1!\n\nThis is the first chapter of our Python basics series.'
                },
                {
                    'type': 'code_example',
                    'language': 'python',
                    'code': '# Chapter 1: Introduction\nprint("Welcome to Python!")\n\n# Your first variable\nmy_name = "Student"\nprint(f"Hello, {my_name}!")'
                }
            ],
            'subtopics': [
                {'id': 'introduction', 'title': 'Introduction', 'order': 1},
                {'id': 'first-steps', 'title': 'First Steps', 'order': 2}
            ]
        },
        'flow-control': {
            'id': 'flow-control',
            'title': 'Flow Control',
            'content': [
                {
                    'type': 'text',
                    'content': '# Flow Control in Python\n\nLearn how to control the flow of your programs with conditions and loops.'
                },
                {
                    'type': 'code_example',
                    'language': 'python',
                    'code': '# If statements\nage = 18\nif age >= 18:\n    print("You are an adult")\nelse:\n    print("You are a minor")\n\n# For loops\nfor i in range(5):\n    print(f"Count: {i}")'
                }
            ],
            'subtopics': [
                {'id': 'if-statements', 'title': 'If Statements', 'order': 1},
                {'id': 'for-loops', 'title': 'For Loops', 'order': 2},
                {'id': 'while-loops', 'title': 'While Loops', 'order': 3}
            ]
        },
        'functions': {
            'id': 'functions',
            'title': 'Functions',
            'content': [
                {
                    'type': 'text',
                    'content': '# Functions in Python\n\nCreate reusable blocks of code with functions.'
                },
                {
                    'type': 'code_example',
                    'language': 'python',
                    'code': 'def greet(name):\n    """Function to greet a person"""\n    print(f"Hello, {name}!")\n\ngreet("Code with Morais")'
                }
            ],
            'subtopics': [
                {'id': 'defining-functions', 'title': 'Defining Functions', 'order': 1},
                {'id': 'parameters', 'title': 'Parameters', 'order': 2},
                {'id': 'return-values', 'title': 'Return Values', 'order': 3}
            ]
        }
    }
    return lessons.get(lesson_id)

def get_lesson(lesson_id: str) -> Optional[Dict[str, Any]]:
    """Get lesson from Firebase or fallback to mock"""
    
    # Try Firebase first
    if firebase_service and firebase_service.is_available():
        lesson_data = firebase_service.get_lesson(lesson_id)
        if lesson_data:
            _enhance_lesson_data(lesson_data)
            logger.info(f"Loaded lesson {lesson_id} from Firebase")
            return lesson_data
        else:
            logger.warning(f"Lesson {lesson_id} not found in Firebase, trying mock data")
    else:
        logger.warning(f"Firebase not available, using mock data for lesson {lesson_id}")
    
    # Fallback to mock data
    lesson_data = get_mock_lesson(lesson_id)
    if lesson_data:
        _enhance_lesson_data(lesson_data)
        logger.info(f"Loaded mock lesson {lesson_id}")
        return lesson_data
    
    # If we reach here, no data was found
    logger.error(f"Lesson {lesson_id} not found in either Firebase or mock data")
    
    # Return a basic error lesson as last resort
    return {
        'id': lesson_id,
        'title': 'Lesson Not Found',
        'description': 'This lesson could not be found in our database.',
        'error': True,
        'content': [
            {
                'type': 'text',
                'content': '# Lesson Not Found\n\nWe apologize, but the lesson you are looking for could not be found. This could be because:\n\n* The lesson ID is invalid\n* Firebase connection is not available\n* Mock data for this lesson ID does not exist\n\nPlease try another lesson or contact support if you believe this is an error.'
            }
        ],
        'subtopics': [
            {'id': 'error', 'title': 'Error', 'order': 1}
        ]
    }

def get_all_lessons() -> List[Dict[str, Any]]:
    """Get all lessons from Firebase or mock"""
    
    # Try Firebase first
    if firebase_service and firebase_service.is_available():
        lessons = firebase_service.get_all_lessons()
        if lessons is not None and len(lessons) > 0:  # Only use Firebase if it has lessons
            # Enhance lessons with missing fields needed for the template
            for lesson in lessons:
                _enhance_lesson_data(lesson)
            logger.info(f"Loaded {len(lessons)} lessons from Firebase")
            return lessons
        else:
            logger.warning(f"Firebase available but returned {len(lessons) if lessons else 'None'} lessons, falling back to mock")
    else:
        logger.warning("Firebase not available, using mock data")
    
    # Fallback to mock data
    lessons = get_mock_lessons()
    logger.info(f"Loaded {len(lessons)} lessons from mock data")
    return lessons
    logger.info(f"Loaded {len(lessons)} lessons from mock data")
    return lessons

def _enhance_lesson_data(lesson: Dict[str, Any]) -> None:
    """Enhance lesson data with fields needed for template rendering"""
    
    # Default colors and icons for lessons
    lesson_styles = {
        'python-basics-01': {'color': '#3498db', 'icon': 'fas fa-code'},
        'variables-02': {'color': '#e74c3c', 'icon': 'fas fa-database'},
        'functions-03': {'color': '#f39c12', 'icon': 'fas fa-cogs'},
        'python-basics': {'color': '#3498db', 'icon': 'fas fa-code'},
        'control-flow': {'color': '#e74c3c', 'icon': 'fas fa-route'},
        'functions': {'color': '#f39c12', 'icon': 'fas fa-cogs'},
        'flow-control': {'color': '#e74c3c', 'icon': 'fas fa-route'},
    }
    
    lesson_id = lesson.get('id', '')
    
    # Add color and icon based on lesson ID or use defaults
    if lesson_id in lesson_styles:
        lesson['color'] = lesson_styles[lesson_id]['color']
        lesson['icon'] = lesson_styles[lesson_id]['icon']
    else:
        # Default style for unknown lessons
        lesson['color'] = '#9b59b6'
        lesson['icon'] = 'fas fa-book'
    
    # Ensure total_subtopics field exists
    if 'total_subtopics' not in lesson:
        subtopics = lesson.get('subtopics', [])
        if isinstance(subtopics, list):
            lesson['total_subtopics'] = len(subtopics)
        else:
            lesson['total_subtopics'] = 0
    
    # Ensure subtopics field exists (required by template)
    if 'subtopics' not in lesson or not lesson['subtopics']:
        # Create default subtopics based on lesson content or use generic ones
        lesson['subtopics'] = [
            'Introduction', 
            'Practice', 
            'Assessment'
        ]
        # Update total_subtopics to match
        lesson['total_subtopics'] = len(lesson['subtopics'])
    
    # Convert string subtopics to objects with IDs if needed
    if lesson['subtopics'] and isinstance(lesson['subtopics'][0], str):
        lesson['subtopics'] = [
            {
                'id': f"subtopic-{i}",
                'title': title,
                'order': i
            }
            for i, title in enumerate(lesson['subtopics'])
        ]
    
    # Set has_subtopics flag based on subtopics array
    lesson['has_subtopics'] = len(lesson.get('subtopics', [])) > 1
    
    # Ensure xp_reward exists
    if 'xp_reward' not in lesson:
        lesson['xp_reward'] = 100  # Default XP reward

def save_lesson(lesson_id: str, lesson_data: Dict[str, Any]) -> bool:
    """Save lesson to Firebase"""
    if firebase_service and firebase_service.is_available():
        return firebase_service.save_lesson(lesson_id, lesson_data)
    else:
        logger.warning("Firebase not available, cannot save lesson")
        return False

def calculate_overall_progress(user_id: str, user_progress: Dict[str, Any] = None) -> int:
    """Calculate overall course progress percentage"""
    try:
        if not user_progress:
            # If no progress data provided, assume 0%
            return 0
        
        all_lessons = get_all_lessons()
        if not all_lessons:
            return 0
        
        total_lessons = len(all_lessons)
        completed_lessons = 0
        
        for lesson in all_lessons:
            lesson_id = lesson.get('id')
            if lesson_id in user_progress:
                lesson_progress = user_progress[lesson_id]
                if lesson_progress.get('completed', False):
                    completed_lessons += 1
        
        if total_lessons == 0:
            return 0
        
        progress = int((completed_lessons / total_lessons) * 100)
        logger.debug(f"Overall progress for user {user_id}: {progress}%")
        return progress
        
    except Exception as e:
        logger.error(f"Error calculating overall progress: {str(e)}")
        return 0
