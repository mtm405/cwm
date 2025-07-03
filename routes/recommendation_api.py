"""
Recommendation API for Code with Morais
Provides personalized learning suggestions based on user progress
"""
from flask import Blueprint, jsonify, request, current_app
from models.user import get_current_user, get_user_progress
from models.lesson import get_all_lessons, calculate_overall_progress
from services.firebase_service import FirebaseService
from datetime import datetime
import random
import logging

logger = logging.getLogger(__name__)
recommendation_api_bp = Blueprint('recommendation_api', __name__, url_prefix='/api/recommendations')

def get_firebase_service():
    """Get Firebase service instance"""
    from config import get_config
    config = get_config()
    return FirebaseService(config.FIREBASE_CONFIG if hasattr(config, 'FIREBASE_CONFIG') else {})

@recommendation_api_bp.route('/next-steps')
def get_next_steps():
    """Get personalized learning recommendations"""
    try:
        user = get_current_user()
        if not user:
            # Return general suggestions for guests
            return jsonify({
                'suggestion': 'Start your Python journey with our beginner tutorials',
                'suggestion_type': 'general',
                'icon': 'fas fa-code-branch',
                'action_url': '/lessons'
            })
        
        # Get user progress and all lessons
        user_progress = get_user_progress(user['uid'])
        all_lessons = get_all_lessons()
        
        # Calculate overall progress
        overall_progress = calculate_overall_progress(user['uid'], user_progress)
        
        # Different suggestion types based on user state
        suggestion = None
        
        # Find incomplete lessons
        incomplete_lessons = [
            lesson for lesson in all_lessons 
            if lesson.get('id') not in user_progress or not user_progress[lesson.get('id')].get('completed', False)
        ]
        
        # Find lessons in progress (started but not completed)
        in_progress_lessons = [
            lesson for lesson in all_lessons 
            if lesson.get('id') in user_progress 
            and user_progress[lesson.get('id')].get('progress', 0) > 0 
            and not user_progress[lesson.get('id')].get('completed', False)
        ]
        
        # 1. If user has lessons in progress, recommend continuing
        if in_progress_lessons:
            lesson = in_progress_lessons[0]
            progress = user_progress[lesson.get('id')].get('progress', 0)
            
            suggestion = {
                'suggestion': f"Continue your '{lesson.get('title')}' lesson ({progress}% complete)",
                'suggestion_type': 'continue_lesson',
                'icon': 'fas fa-laptop-code',
                'action_url': f"/lesson/{lesson.get('id')}"
            }
        
        # 2. If user has completed all lessons or has high progress, suggest coding challenge
        elif overall_progress > 75 or not incomplete_lessons:
            suggestion = {
                'suggestion': "Ready for a coding challenge to test your skills?",
                'suggestion_type': 'challenge',
                'icon': 'fas fa-puzzle-piece',
                'action_url': '/challenges'
            }
        
        # 3. If user has low activity, suggest starting a new lesson
        elif incomplete_lessons:
            lesson = incomplete_lessons[0]
            suggestion = {
                'suggestion': f"Start learning '{lesson.get('title')}' to level up your Python skills",
                'suggestion_type': 'start_lesson',
                'icon': 'fas fa-graduation-cap',
                'action_url': f"/lesson/{lesson.get('id')}"
            }
        
        # 4. Fallback to general motivation
        else:
            motivational_messages = [
                "Review your completed lessons to strengthen your knowledge",
                "Try applying your Python skills to a personal project",
                "Ready to explore advanced Python techniques?",
                "Challenge yourself with our daily coding exercises"
            ]
            
            motivational_icons = [
                "fas fa-sync", "fas fa-project-diagram", 
                "fas fa-rocket", "fas fa-dumbbell"
            ]
            
            index = random.randint(0, len(motivational_messages) - 1)
            
            suggestion = {
                'suggestion': motivational_messages[index],
                'suggestion_type': 'motivation',
                'icon': motivational_icons[index],
                'action_url': '/dashboard'
            }
        
        # Add timestamp
        suggestion['timestamp'] = datetime.now().isoformat()
        
        return jsonify(suggestion)
        
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return jsonify({
            'suggestion': 'Continue your Python journey with our learning resources',
            'suggestion_type': 'error_fallback',
            'icon': 'fas fa-book-reader',
            'action_url': '/lessons'
        })
