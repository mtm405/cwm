"""
User model for Code with Morais
"""
import logging
from datetime import datetime
from flask import session
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Firebase service will be injected from app.py
firebase_service = None

def set_firebase_service(service):
    """Set the Firebase service instance"""
    global firebase_service
    firebase_service = service

# Mock user for development
DEV_USER = {
    'uid': 'dev-user-001',
    'email': 'dev@codewithmorais.com',
    'username': 'DevUser',
    'xp': 1500,
    'pycoins': 100,
    'level': 5,
    'streak': 3,
    'last_login': datetime.now().isoformat(),
    'theme': 'dark',
    'completed_lessons': ['python-basics'],
    'lesson_progress': {
        'python-basics': {
            'completed': True,
            'progress': 100,
            'completed_subtopics': ['variables', 'data-types']
        }
    },
    'quiz_scores': {
        'python-basics-quiz': 85
    }
}

def get_current_user() -> Optional[Dict[str, Any]]:
    """Get current user data from Firebase or dev user in dev mode"""
    
    # Check if we have a user ID in session
    user_id = session.get('user_id')
    logger.debug(f"get_current_user called, session user_id: {user_id}")
    logger.debug(f"Session keys: {list(session.keys())}")
    
    if not user_id:
        # Return dev user if in development mode
        from config import get_config
        config = get_config()
        if config.DEV_MODE:
            logger.debug("No user in session, returning dev user")
            return DEV_USER
        logger.debug("No user in session and not in dev mode")
        return None
    
    # Try to get user from Firebase
    if firebase_service and firebase_service.is_available():
        logger.debug(f"Attempting to retrieve user {user_id} from Firebase")
        user_data = firebase_service.get_user(user_id)
        if user_data:
            logger.debug(f"Successfully retrieved user {user_id} from Firebase")
            # Ensure uid is set for consistency
            user_data['uid'] = user_id
            return user_data
        else:
            logger.warning(f"User {user_id} not found in Firebase")
    else:
        logger.warning("Firebase service not available")
    
    # If Firebase fails but we have session data, create basic user from session
    if session.get('authenticated'):
        logger.info("Creating user data from session information")
        return {
            'uid': user_id,
            'email': session.get('user_email', ''),
            'username': session.get('user_name', 'Unknown User'),
            'display_name': session.get('user_name', 'Unknown User'),
            'profile_picture': session.get('user_picture', ''),
            'xp': 0,
            'level': 1,
            'pycoins': 100,
            'streak': 0,
            'is_admin': session.get('is_admin', False)
        }
    
    # Fallback to dev user in dev mode
    from config import get_config
    config = get_config()
    if config.DEV_MODE:
        logger.info("Firebase unavailable, using dev user")
        return DEV_USER
    
    logger.error(f"User {user_id} not found anywhere")
    return None

def update_user_data(user_id: str, data: Dict[str, Any]) -> bool:
    """Update user data in Firebase"""
    
    # Update dev user in dev mode
    from config import get_config
    config = get_config()
    if config.DEV_MODE and user_id == DEV_USER['uid']:
        DEV_USER.update(data)
        logger.debug(f"Updated dev user data: {list(data.keys())}")
        return True
    
    # Update in Firebase
    if firebase_service and firebase_service.is_available():
        return firebase_service.update_user(user_id, data)
    else:
        logger.warning("Firebase not available, cannot update user data")
        return False

def create_user(user_id: str, user_data: Dict[str, Any]) -> bool:
    """Create new user in Firebase"""
    if firebase_service and firebase_service.is_available():
        return firebase_service.create_user(user_id, user_data)
    else:
        logger.warning("Firebase not available, cannot create user")
        return False

def award_xp_and_coins(user_id: str, xp: int = 0, coins: int = 0) -> Optional[Dict[str, int]]:
    """Award XP and PyCoins to user"""
    user = get_current_user()
    if not user:
        logger.warning(f"Cannot award XP/coins - user {user_id} not found")
        return None
    
    try:
        new_xp = user.get('xp', 0) + xp
        new_coins = user.get('pycoins', 0) + coins
        
        # Calculate new level (100 XP per level)
        new_level = max(1, new_xp // 100)
        
        update_data = {
            'xp': new_xp,
            'pycoins': new_coins,
            'level': new_level,
            'last_activity': datetime.now()
        }
        
        if update_user_data(user_id, update_data):
            logger.info(f"Awarded {xp} XP and {coins} coins to user {user_id}")
            return {'xp': new_xp, 'coins': new_coins, 'level': new_level}
        else:
            logger.error(f"Failed to award XP/coins to user {user_id}")
            return None
            
    except Exception as e:
        logger.error(f"Error awarding XP/coins: {str(e)}")
        return None

def update_user_progress(user_id: str, lesson_id: str, progress_data: Dict[str, Any]) -> bool:
    """Update user's lesson progress"""
    if firebase_service and firebase_service.is_available():
        return firebase_service.update_user_progress(user_id, lesson_id, progress_data)
    else:
        # Update dev user in dev mode
        from config import get_config
        config = get_config()
        if config.DEV_MODE and user_id == DEV_USER['uid']:
            if 'lesson_progress' not in DEV_USER:
                DEV_USER['lesson_progress'] = {}
            DEV_USER['lesson_progress'][lesson_id] = progress_data
            logger.debug(f"Updated dev user progress for lesson {lesson_id}")
            return True
        
        logger.warning("Firebase not available, cannot update user progress")
        return False

def get_user_progress(user_id):
    """Get user's progress across all lessons"""
    from config import get_config
    config = get_config()
    
    if config.DEV_MODE:
        # Mock progress for development
        return {
            'python-basics': {'completed': True, 'completed_subtopics': ['variables', 'data-types'], 'progress': 66},
            'flow-control': {'completed': False, 'completed_subtopics': ['if-statements'], 'progress': 33},
            'io-operations': {'completed': False, 'completed_subtopics': [], 'progress': 0},
            'code-structure': {'completed': False, 'completed_subtopics': [], 'progress': 0},
            'error-handling': {'completed': False, 'completed_subtopics': [], 'progress': 0},
            'module-operations': {'completed': False, 'completed_subtopics': [], 'progress': 0}
        }
    
    # Try Firebase
    if firebase_service and firebase_service.is_available():
        user_data = firebase_service.get_user(user_id)
        if user_data:
            return user_data.get('lesson_progress', {})
    return {}

def update_lesson_progress(user_id: str, lesson_id: str, progress: int, completed: bool, completed_subtopics: list, time_spent: int = 0) -> bool:
    """Update lesson progress for a user"""
    from config import get_config
    config = get_config()
    
    try:
        progress_data = {
            'progress': progress,
            'completed': completed,
            'completed_subtopics': completed_subtopics,
            'time_spent': time_spent,
            'last_accessed': datetime.now().isoformat()
        }
        
        if config.DEV_MODE and user_id == DEV_USER['uid']:
            # Update dev user progress
            if 'lesson_progress' not in DEV_USER:
                DEV_USER['lesson_progress'] = {}
            DEV_USER['lesson_progress'][lesson_id] = progress_data
            logger.debug(f"Updated dev user lesson progress for {lesson_id}")
            return True
        
        # Update in Firebase
        if firebase_service and firebase_service.is_available():
            user_data = firebase_service.get_user(user_id)
            if user_data:
                if 'lesson_progress' not in user_data:
                    user_data['lesson_progress'] = {}
                user_data['lesson_progress'][lesson_id] = progress_data
                return firebase_service.update_user(user_id, {'lesson_progress': user_data['lesson_progress']})
        
        return False
        
    except Exception as e:
        logger.error(f"Error updating lesson progress: {str(e)}")
        return False
