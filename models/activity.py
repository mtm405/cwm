"""
Activity model for Code with Morais
"""
from datetime import datetime, timedelta
from services.firebase_service import db
from config import DEV_MODE

def track_activity(user_id, activity_type, details):
    """Track user activity in Firebase"""
    if DEV_MODE or not db:
        return
    
    activity_data = {
        'user_id': user_id,
        'type': activity_type,
        'details': details,
        'timestamp': datetime.now()
    }
    
    db.collection('activities').add(activity_data)

def get_recent_activity(user_id):
    """Get user's recent activity"""
    # In a production app, you'd fetch from the database
    return [
        {
            'type': 'lesson', 
            'message': 'Completed "Variables and Data Types"', 
            'timestamp': datetime.now() - timedelta(hours=1),
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
            'type': 'challenge', 
            'message': 'Completed Daily Challenge', 
            'timestamp': datetime.now() - timedelta(days=1),
            'icon': 'calendar-day'
        }
    ]
