"""
Quiz model for Code with Morais
"""
import logging
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

# Firebase service will be injected from app.py
firebase_service = None

def set_firebase_service(service):
    """Set the Firebase service instance"""
    global firebase_service
    firebase_service = service

def get_quiz(quiz_id: str) -> Optional[Dict[str, Any]]:
    """Get quiz from Firebase or fallback to mock"""
    
    # Try Firebase first
    if firebase_service and firebase_service.is_available():
        quiz_data = firebase_service.get_quiz(quiz_id)
        if quiz_data:
            logger.info(f"Loaded quiz {quiz_id} from Firebase")
            return quiz_data
        else:
            logger.warning(f"Quiz {quiz_id} not found in Firebase, trying mock data")
    
    # Fallback to mock data
    quiz_data = get_mock_quiz(quiz_id)
    if quiz_data:
        logger.info(f"Loaded quiz {quiz_id} from mock data")
        return quiz_data
    
    logger.error(f"Quiz {quiz_id} not found anywhere")
    return None

def save_quiz(quiz_id: str, quiz_data: Dict[str, Any]) -> bool:
    """Save quiz to Firebase"""
    if firebase_service and firebase_service.is_available():
        return firebase_service.save_quiz(quiz_id, quiz_data)
    else:
        logger.warning("Firebase not available, cannot save quiz")
        return False

def submit_quiz_result(user_id: str, quiz_id: str, answers: Dict[str, Any], score: float) -> bool:
    """Submit quiz result to Firebase"""
    if not firebase_service or not firebase_service.is_available():
        logger.warning("Firebase not available, cannot save quiz result")
        return False
    
    try:
        result_data = {
            'user_id': user_id,
            'quiz_id': quiz_id,
            'answers': answers,
            'score': score,
            'submitted_at': datetime.now(),
            'timestamp': datetime.now()
        }
        
        return firebase_service.save_quiz_result(user_id, quiz_id, result_data)
        
    except Exception as e:
        logger.error(f"Error submitting quiz result: {str(e)}")
        return False

def save_quiz_result(result_id: str, result_data: Dict[str, Any]) -> bool:
    """Save quiz result to Firebase"""
    if firebase_service and firebase_service.is_available():
        return firebase_service.save_quiz_result(result_id, result_data)
    else:
        logger.warning("Firebase not available, cannot save quiz result")
        return False

def get_mock_quiz(quiz_id):
    """Get mock quiz data for development"""
    quizzes = {
        'python-basics-quiz': {
            'id': 'python-basics-quiz',
            'title': 'Python Basics Quiz',
            'description': 'Test your knowledge of Python basics',
            'passing_score': 70,
            'xp_reward': 100,
            'coin_reward': 20,
            'questions': [
                {
                    'type': 'multiple_choice',
                    'question': 'What is the correct way to print "Hello World" in Python?',
                    'options': [
                        'echo "Hello World"',
                        'print("Hello World")',
                        'console.log("Hello World")',
                        'printf("Hello World")'
                    ],
                    'correct_answer': 'print("Hello World")'
                },
                {
                    'type': 'true_false',
                    'question': 'Python is a case-sensitive language',
                    'correct_answer': 'True'
                },
                {
                    'type': 'fill_blank',
                    'question': 'To create a variable in Python, you use the _____ operator',
                    'correct_answer': '='
                }
            ]
        }
    }
    return quizzes.get(quiz_id)
