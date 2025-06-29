"""
Lesson model for Code with Morais
"""
import logging
from typing import Optional, List, Dict, Any
from services.firebase_service import db

logger = logging.getLogger(__name__)

# Firebase service will be injected from app.py
firebase_service = None

def set_firebase_service(service):
    """Set the Firebase service instance"""
    global firebase_service
    firebase_service = service

def get_mock_lessons():
    """Get mock lessons for development"""
    return [
        {
            'id': 'python-basics',
            'title': 'Python Basics',
            'description': 'Learn the fundamentals of Python programming',
            'order': 1,
            'xp_reward': 100,
            'subtopics': ['Variables', 'Data Types', 'Basic Operations'],
            'total_subtopics': 3
        },
        {
            'id': 'control-flow',
            'title': 'Control Flow',
            'description': 'Master if statements, loops, and program flow',
            'order': 2,
            'xp_reward': 150,
            'subtopics': ['If Statements', 'For Loops', 'While Loops'],
            'total_subtopics': 3
        },
        {
            'id': 'functions',
            'title': 'Functions',
            'description': 'Create reusable code with functions',
            'order': 3,
            'xp_reward': 200,
            'subtopics': ['Defining Functions', 'Parameters', 'Return Values'],
            'total_subtopics': 3
        }
    ]

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
            logger.info(f"Loaded lesson {lesson_id} from Firebase")
            return lesson_data
        else:
            logger.warning(f"Lesson {lesson_id} not found in Firebase, trying mock data")
    
    # Fallback to mock data
    lesson_data = get_mock_lesson(lesson_id)
    if lesson_data:
        logger.info(f"Loaded lesson {lesson_id} from mock data")
        return lesson_data
    
    logger.error(f"Lesson {lesson_id} not found anywhere")
    return None

def get_all_lessons() -> List[Dict[str, Any]]:
    """Get all lessons from Firebase or mock"""
    
    # Try Firebase first
    if firebase_service and firebase_service.is_available():
        lessons = firebase_service.get_all_lessons()
        if lessons:
            logger.info(f"Loaded {len(lessons)} lessons from Firebase")
            return lessons
        else:
            logger.warning("No lessons found in Firebase, using mock data")
    
    # Fallback to mock
    lessons = get_mock_lessons()
    logger.info(f"Loaded {len(lessons)} lessons from mock data")
    return lessons

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
