"""
Dashboard API routes for Code with Morais
Provides API endpoints for dashboard data with Firebase integration
"""
from flask import Blueprint, jsonify, request, current_app
from models.user import get_current_user, get_user_progress
from models.lesson import get_all_lessons, calculate_overall_progress
from models.activity import get_recent_activity, track_activity
from services.firebase_service import FirebaseService
from config import get_config
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
dashboard_api_bp = Blueprint('dashboard_api', __name__, url_prefix='/api/dashboard')

def get_firebase_service():
    """Get Firebase service instance"""
    config = get_config()
    return FirebaseService(config.FIREBASE_CONFIG if hasattr(config, 'FIREBASE_CONFIG') else {})

@dashboard_api_bp.route('/stats')
def get_dashboard_stats():
    """Get user dashboard statistics with Firebase integration"""
    try:
        user = get_current_user()
        firebase_service = get_firebase_service()
        
        if not user:
            # Return guest stats for unauthenticated users
            return jsonify({
                'user': {
                    'username': 'Guest Student',
                    'display_name': 'Guest Student',
                    'first_name': 'Guest',
                    'xp': 0,
                    'pycoins': 0,
                    'level': 1,
                    'streak': 0
                },
                'progress': {
                    'overall_progress': 0,
                    'completed_lessons': 0,
                    'total_lessons': 10
                },
                'guest_mode': True,
                'firebase_available': firebase_service.is_available(),
                'timestamp': datetime.now().isoformat()
            })
        
        # Get fresh user data from Firebase if available
        user_progress = {}  # Initialize user_progress for all code paths
        
        if firebase_service.is_available():
            firebase_user = firebase_service.get_user(user['uid'])
            if firebase_user:
                user.update(firebase_user)
            
            # Get lesson progress from Firebase
            user_progress = user.get('lesson_progress', {})
            completed_lessons = len(user_progress)
            total_lessons = len(firebase_service.get_all_lessons())
        else:
            # Fallback to local data
            user_progress = get_user_progress(user['uid'])
            completed_lessons = len([p for p in user_progress.values() if p.get('completed', False)])
            total_lessons = len(get_all_lessons())
        
        # Calculate overall progress
        overall_progress = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
        
        # Extract first name from display_name or username
        first_name = user.get('first_name')
        if not first_name:
            display_name = user.get('display_name') or user.get('username', 'Student')
            first_name = display_name.split(' ')[0] if display_name else 'Student'
        
        # Calculate statistics
        stats = {
            'user': {
                'uid': user.get('uid'),
                'username': user.get('username', 'Student'),
                'display_name': user.get('display_name', user.get('username', 'Student')),
                'first_name': first_name,
                'profile_picture': user.get('profile_picture', ''),
                'xp': user.get('xp', 0),
                'pycoins': user.get('pycoins', 0),
                'level': user.get('level', 1),
                'streak': user.get('streak', 0)
            },
            'progress': {
                'overall_progress': calculate_overall_progress(user['uid'], user_progress),
                'completed_lessons': len([p for p in user_progress.values() if p.get('completed', False)]),
                'total_lessons': len(get_all_lessons())
            },
            'guest_mode': False,
            'authenticated': True,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        return jsonify({'error': 'Failed to load stats'}), 500

@dashboard_api_bp.route('/exam-objectives')
def get_exam_objectives():
    """Get IT Specialist exam objectives with progress"""
    try:
        user = get_current_user()
        if not user:
            # Return objectives without progress for unauthenticated users
            objectives = [
                {
                    'id': 'python-fundamentals',
                    'title': 'Python Fundamentals',
                    'description': 'Variables, data types, basic operations, comments',
                    'lessons': ['python-basics-variables', 'python-basics-operators'],
                    'category': 'fundamentals',
                    'weight': 20,
                    'progress': 0,
                    'completed_lessons': 0,
                    'total_lessons': 2,
                    'status': 'not-started'
                },
                {
                    'id': 'control-flow',
                    'title': 'Control Flow and Logic',
                    'description': 'Conditional statements, loops, logical operators',
                    'lessons': ['control-flow', 'loops', 'conditionals'],
                    'category': 'control-flow',
                    'weight': 25,
                    'progress': 0,
                    'completed_lessons': 0,
                    'total_lessons': 3,
                    'status': 'not-started'
                },
                {
                    'id': 'data-structures',
                    'title': 'Data Structures',
                    'description': 'Lists, dictionaries, tuples, sets',
                    'lessons': ['lists', 'dictionaries', 'tuples'],
                    'category': 'data-structures',
                    'weight': 20,
                    'progress': 0,
                    'completed_lessons': 0,
                    'total_lessons': 3,
                    'status': 'not-started'
                },
                {
                    'id': 'functions-modules',
                    'title': 'Functions and Modules',
                    'description': 'Function definition, parameters, modules, packages',
                    'lessons': ['functions', 'modules', 'packages'],
                    'category': 'functions',
                    'weight': 15,
                    'progress': 0,
                    'completed_lessons': 0,
                    'total_lessons': 3,
                    'status': 'not-started'
                },
                {
                    'id': 'file-io',
                    'title': 'File I/O and Error Handling',
                    'description': 'File operations, exception handling, debugging',
                    'lessons': ['file-io', 'error-handling', 'debugging'],
                    'category': 'io-error',
                    'weight': 10,
                    'progress': 0,
                    'completed_lessons': 0,
                    'total_lessons': 3,
                    'status': 'not-started'
                },
                {
                    'id': 'oop-concepts',
                    'title': 'Object-Oriented Programming',
                    'description': 'Classes, objects, inheritance, encapsulation',
                    'lessons': ['classes', 'inheritance', 'polymorphism'],
                    'category': 'oop',
                    'weight': 10,
                    'progress': 0,
                    'completed_lessons': 0,
                    'total_lessons': 3,
                    'status': 'not-started'
                }
            ]
            
            return jsonify({
                'objectives': objectives,
                'overall_exam_readiness': 0,
                'guest_mode': True,
                'timestamp': datetime.now().isoformat()
            })
        
        # Define IT Specialist exam objectives
        objectives = [
            {
                'id': 'python-fundamentals',
                'title': 'Python Fundamentals',
                'description': 'Variables, data types, basic operations, comments',
                'lessons': ['python-basics-variables', 'python-basics-operators'],
                'category': 'fundamentals',
                'weight': 20
            },
            {
                'id': 'control-flow',
                'title': 'Control Flow and Logic',
                'description': 'Conditional statements, loops, logical operators',
                'lessons': ['control-flow', 'loops', 'conditionals'],
                'category': 'control-flow',
                'weight': 25
            },
            {
                'id': 'data-structures',
                'title': 'Data Structures',
                'description': 'Lists, dictionaries, tuples, sets',
                'lessons': ['lists', 'dictionaries', 'tuples'],
                'category': 'data-structures',
                'weight': 20
            },
            {
                'id': 'functions-modules',
                'title': 'Functions and Modules',
                'description': 'Function definition, parameters, modules, packages',
                'lessons': ['functions', 'modules', 'packages'],
                'category': 'functions',
                'weight': 15
            },
            {
                'id': 'file-io',
                'title': 'File I/O and Error Handling',
                'description': 'File operations, exception handling, debugging',
                'lessons': ['file-io', 'error-handling', 'debugging'],
                'category': 'io-error',
                'weight': 10
            },
            {
                'id': 'oop-concepts',
                'title': 'Object-Oriented Programming',
                'description': 'Classes, objects, inheritance, encapsulation',
                'lessons': ['classes', 'inheritance', 'polymorphism'],
                'category': 'oop',
                'weight': 10
            }
        ]
        
        # Get user progress
        user_progress = get_user_progress(user['uid'])
        
        # Calculate progress for each objective
        for objective in objectives:
            completed_lessons = 0
            total_lessons = len(objective['lessons'])
            
            for lesson_id in objective['lessons']:
                if lesson_id in user_progress and user_progress[lesson_id].get('completed', False):
                    completed_lessons += 1
            
            progress_percentage = int((completed_lessons / total_lessons) * 100) if total_lessons > 0 else 0
            objective['progress'] = progress_percentage
            objective['completed_lessons'] = completed_lessons
            objective['total_lessons'] = total_lessons
            objective['status'] = 'completed' if progress_percentage == 100 else 'in-progress' if progress_percentage > 0 else 'not-started'
        
        return jsonify({
            'objectives': objectives,
            'overall_exam_readiness': sum(obj['progress'] * obj['weight'] / 100 for obj in objectives),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting exam objectives: {str(e)}")
        return jsonify({'error': 'Failed to load exam objectives'}), 500

@dashboard_api_bp.route('/activity-feed')
def get_activity_feed():
    """Get user's activity feed"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'activities': [], 'guest_mode': True})
        
        activities = get_recent_activity(user['uid'])
        
        return jsonify({
            'activities': activities,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting activity feed: {str(e)}")
        return jsonify({'error': 'Failed to load activity feed'}), 500

@dashboard_api_bp.route('/leaderboard')
def get_leaderboard():
    """Get leaderboard data"""
    try:
        from config import get_config
        config = get_config()
        
        if config.DEV_MODE:
            leaderboard = [
                {'username': 'DevUser', 'xp': 1500, 'level': 5},
                {'username': 'AlexPython', 'xp': 1200, 'level': 4},
                {'username': 'CodeMaster', 'xp': 1000, 'level': 3},
                {'username': 'PyNinja', 'xp': 850, 'level': 3},
                {'username': 'ScriptKid', 'xp': 750, 'level': 2}
            ]
        else:
            # Get from Firebase
            firebase_service = current_app.config.get('firebase_service')
            if firebase_service and firebase_service.is_available():
                leaderboard = firebase_service.get_leaderboard(10)
            else:
                leaderboard = []
        
        return jsonify({
            'leaderboard': leaderboard,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {str(e)}")
        return jsonify({'error': 'Failed to load leaderboard'}), 500

@dashboard_api_bp.route('/daily-challenge')
def get_daily_challenge_api():
    """Get daily challenge"""
    try:
        from models.challenge import get_daily_challenge
        challenge = get_daily_challenge()
        
        return jsonify({
            'challenge': challenge,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting daily challenge: {str(e)}")
        return jsonify({'error': 'Failed to load daily challenge'}), 500

@dashboard_api_bp.route('/next-lesson')
def get_next_lesson():
    """Get user's next lesson"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'next_lesson': None, 'guest_mode': True})
        
        # Get user's progress
        user_progress = get_user_progress(user['uid'])
        all_lessons = get_all_lessons()
        
        # Find next incomplete lesson
        next_lesson = None
        for lesson in all_lessons:
            lesson_id = lesson.get('id')
            if lesson_id not in user_progress or not user_progress[lesson_id].get('completed', False):
                next_lesson = {
                    'id': lesson_id,
                    'title': lesson.get('title', 'Untitled Lesson'),
                    'description': lesson.get('description', ''),
                    'is_review': False
                }
                break
        
        # If all lessons complete, suggest review
        if not next_lesson and all_lessons:
            # Find least recently accessed lesson
            next_lesson = {
                'id': all_lessons[0].get('id'),
                'title': all_lessons[0].get('title', 'Review Lesson'),
                'description': 'Review this lesson to reinforce your knowledge',
                'is_review': True
            }
        
        return jsonify({
            'next_lesson': next_lesson,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting next lesson: {str(e)}")
        return jsonify({'error': 'Failed to load next lesson'}), 500

@dashboard_api_bp.route('/award-xp', methods=['POST'])
def award_xp():
    """Award XP and coins to user"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        xp = data.get('xp', 0)
        coins = data.get('coins', 0)
        reason = data.get('reason', 'Activity completion')
        
        # Award XP and coins
        from models.user import award_xp_and_coins
        result = award_xp_and_coins(user['uid'], xp, coins)
        
        if result:
            # Track activity
            track_activity(user['uid'], 'xp_gain', {
                'message': f'Earned +{xp} XP: {reason}',
                'xp': xp,
                'coins': coins,
                'reason': reason
            })
            
            return jsonify({
                'success': True,
                'new_totals': result,
                'message': f'Awarded {xp} XP and {coins} coins!'
            })
        else:
            return jsonify({'success': False, 'error': 'Failed to award XP'}), 500
        
    except Exception as e:
        logger.error(f"Error awarding XP: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to award XP'}), 500

@dashboard_api_bp.route('/refresh', methods=['POST'])
def refresh_dashboard():
    """Refresh dashboard data with latest information from Firebase"""
    try:
        user = get_current_user()
        firebase_service = get_firebase_service()
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'Authentication required'
            }), 401
        
        # Get fresh user data from Firebase
        user_data = firebase_service.get_user_by_id(user.get('uid'))
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'Failed to fetch user data'
            }), 500
        
        # Get fresh dashboard data
        dashboard_data = firebase_service.get_user_dashboard_data(user.get('uid'))
        
        # Track refresh activity
        track_activity(user.get('uid'), 'dashboard_refresh', {
            'timestamp': datetime.now().isoformat(),
            'user_agent': request.headers.get('User-Agent', 'Unknown')
        })
        
        logger.info(f"Dashboard refreshed for user: {user.get('uid')}")
        
        return jsonify({
            'success': True,
            'data': {
                'user': user_data,
                'dashboard': dashboard_data,
                'refresh_time': datetime.now().isoformat()
            },
            'message': 'Dashboard refreshed successfully'
        })
        
    except Exception as e:
        logger.error(f"Error refreshing dashboard: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to refresh dashboard data'
        }), 500
