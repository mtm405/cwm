"""
Activity model for Code with Morais
"""
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Firebase service will be injected from app.py
firebase_service = None

def set_firebase_service(service):
    """Set the Firebase service instance"""
    global firebase_service
    firebase_service = service

def track_activity(user_id: str, activity_type: str, details: Dict[str, Any]) -> bool:
    """Track user activity in Firebase"""
    try:
        if not firebase_service or not firebase_service.is_available():
            logger.warning("Firebase not available for activity tracking")
            return False
        
        activity_data = {
            'user_id': user_id,
            'type': activity_type,
            'details': details,
            'timestamp': firebase_service.get_server_timestamp(),
            'created_at': datetime.now()
        }
        
        firebase_service.db.collection('activities').add(activity_data)
        logger.info(f"Tracked activity {activity_type} for user {user_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error tracking activity: {str(e)}")
        return False

def get_recent_activity(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Get user's recent activity from Firebase"""
    try:
        # If Firebase is not available or no user_id provided, return mock data
        if not firebase_service or not firebase_service.is_available() or not user_id:
            logger.warning("Firebase not available for activity retrieval, returning mock data")
            return [
                {
                    'type': 'lesson', 
                    'message': 'Completed "Variables and Data Types"', 
                    'timestamp': datetime.now() - timedelta(minutes=30),
                    'icon': 'book'
                },
                {
                    'type': 'achievement', 
                    'message': 'Earned "First Steps" badge', 
                    'timestamp': datetime.now() - timedelta(hours=2),
                    'icon': 'trophy'
                },
                {
                    'type': 'quiz', 
                    'message': 'Scored 90% on "Python Basics Quiz"', 
                    'timestamp': datetime.now() - timedelta(days=1),
                    'icon': 'clipboard-check'
                },
                {
                    'type': 'xp_gain',
                    'message': 'Earned +50 XP from lesson completion',
                    'timestamp': datetime.now() - timedelta(hours=3),
                    'icon': 'star'
                },
                {
                    'type': 'challenge', 
                    'message': 'Completed Daily Challenge', 
                    'timestamp': datetime.now() - timedelta(days=1),
                    'icon': 'calendar-day'
                }
            ]
        
        # Get activities from Firebase
        activities_ref = firebase_service.db.collection('activities')
        query = activities_ref.where('user_id', '==', user_id).order_by('timestamp', direction='DESCENDING').limit(limit)
        
        activities = []
        for doc in query.stream():
            activity_data = doc.to_dict()
            activities.append({
                'type': activity_data.get('type', 'unknown'),
                'message': activity_data.get('details', {}).get('message', 'Activity'),
                'timestamp': activity_data.get('timestamp'),
                'icon': get_activity_icon(activity_data.get('type', 'unknown'))
            })
        
        return activities
        
    except Exception as e:
        logger.error(f"Error getting recent activity: {str(e)}")
        return []

def get_activity_icon(activity_type: str) -> str:
    """Get icon for activity type"""
    icons = {
        'lesson': 'book',
        'quiz': 'clipboard-check',
        'challenge': 'calendar-day',
        'achievement': 'trophy',
        'xp_gain': 'star',
        'level_up': 'arrow-up',
        'badge': 'medal',
        'streak': 'fire'
    }
    return icons.get(activity_type, 'code')
    icons = {
        'lesson': 'book',
        'quiz': 'clipboard-check',
        'challenge': 'calendar-day',
        'achievement': 'trophy',
        'xp_gain': 'star',
        'level_up': 'arrow-up',
        'badge': 'medal',
        'streak': 'fire'
    }
    return icons.get(activity_type, 'code')
