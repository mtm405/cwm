"""
Dashboard API routes for Code with Morais
Provides API endpoints for dashboard data
"""
from flask import Blueprint, jsonify, request, current_app
from models.user import get_current_user, get_user_progress
from models.lesson import get_all_lessons, calculate_overall_progress
from models.activity import get_recent_activity
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
dashboard_api_bp = Blueprint('dashboard_api', __name__, url_prefix='/api/dashboard')

@dashboard_api_bp.route('/stats')
def get_dashboard_stats():
    """Get user dashboard statistics"""
    try:
        user = get_current_user()
        if not user:
            # Return guest stats for unauthenticated users
            return jsonify({
                'user': {
                    'username': 'Guest Student',
                    'xp': 0,
                    'pycoins': 0,
                    'level': 1,
                    'streak': 0
                },
                'progress': {
                    'overall_progress': 0,
                    'completed_lessons': 0,
                    'total_lessons': len(get_all_lessons())
                },
                'guest_mode': True,
                'timestamp': datetime.now().isoformat()
            })
        
        # Get user progress
        user_progress = get_user_progress(user['uid'])
        
        # Calculate statistics
        stats = {
            'user': {
                'username': user.get('username', 'Student'),
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

@dashboard_api_bp.route('/leaderboard')
def get_leaderboard():
    """Get leaderboard data"""
    try:
        firebase_service = current_app.firebase_service
        
        if firebase_service and firebase_service.is_available():
            leaderboard = firebase_service.get_leaderboard(limit=10)
        else:
            # Mock leaderboard for development
            leaderboard = [
                {'username': 'CodeMaster', 'xp': 2500, 'level': 8},
                {'username': 'PythonPro', 'xp': 2200, 'level': 7},
                {'username': 'DevStudent', 'xp': 1800, 'level': 6},
                {'username': 'TechExplorer', 'xp': 1500, 'level': 5},
                {'username': 'CodingNinja', 'xp': 1200, 'level': 4}
            ]
        
        return jsonify({
            'leaderboard': leaderboard,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting leaderboard: {str(e)}")
        return jsonify({'error': 'Failed to load leaderboard'}), 500

@dashboard_api_bp.route('/daily-challenge')
def get_daily_challenge():
    """Get today's daily challenge"""
    try:
        firebase_service = current_app.firebase_service
        today = datetime.now().strftime('%Y-%m-%d')
        
        if firebase_service and firebase_service.is_available():
            challenge = firebase_service.get_daily_challenge(today)
        else:
            # Mock challenge for development
            challenge = {
                'id': f'daily-{today}',
                'title': 'Python Variables Practice',
                'description': 'Create variables for storing personal information',
                'difficulty': 'beginner',
                'xp_reward': 75,
                'coin_reward': 10,
                'code_template': '# Create variables for your name, age, and favorite color\n# Print them in a formatted string\n',
                'test_cases': [
                    {'input': '', 'expected_contains': ['name', 'age', 'color']}
                ]
            }
        
        return jsonify({
            'challenge': challenge,
            'date': today,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting daily challenge: {str(e)}")
        return jsonify({'error': 'Failed to load daily challenge'}), 500

@dashboard_api_bp.route('/activity-feed')
def get_activity_feed():
    """Get user activity feed"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Get recent activity
        activities = get_recent_activity(user['uid'], limit=10)
        
        return jsonify({
            'activities': activities,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting activity feed: {str(e)}")
        return jsonify({'error': 'Failed to load activity feed'}), 500

@dashboard_api_bp.route('/next-lesson')
def get_next_lesson():
    """Get the next recommended lesson for the user"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        user_progress = get_user_progress(user['uid'])
        all_lessons = get_all_lessons()
        
        # Find the first incomplete lesson
        next_lesson = None
        for lesson in sorted(all_lessons, key=lambda x: x.get('order', 0)):
            lesson_id = lesson['id']
            if lesson_id not in user_progress or not user_progress[lesson_id].get('completed', False):
                next_lesson = lesson
                break
        
        if not next_lesson and all_lessons:
            # All lessons completed, suggest the first one for review
            next_lesson = all_lessons[0]
            next_lesson['is_review'] = True
        
        return jsonify({
            'next_lesson': next_lesson,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting next lesson: {str(e)}")
        return jsonify({'error': 'Failed to get next lesson'}), 500
