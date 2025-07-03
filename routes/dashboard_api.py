"""
Dashboard API routes for Code with Morais
Provides API endpoints for dashboard data with Firebase integration
"""
from flask import Blueprint, jsonify, request, current_app, session
from models.user import get_current_user, get_user_progress
from models.lesson import get_all_lessons, calculate_overall_progress
from models.activity import get_recent_activity, track_activity
from services.firebase_service import FirebaseService
from config import get_config
from datetime import datetime, timedelta
from typing import Dict, List, Optional
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
        
        # Get current user for marking
        current_user_uid = None
        if 'user' in session:
            current_user_uid = session['user'].get('uid')
        
        if config.DEV_MODE:
            leaderboard = [
                {
                    'uid': 'dev-user-1',
                    'username': 'DevUser', 
                    'display_name': 'Dev User',
                    'xp': 1500, 
                    'level': 5,
                    'pycoins': 2500,
                    'avatar_url': None,
                    'is_current_user': current_user_uid == 'dev-user-1'
                },
                {
                    'uid': 'alex-python',
                    'username': 'AlexPython', 
                    'display_name': 'Alex Python',
                    'xp': 1200, 
                    'level': 4,
                    'pycoins': 2000,
                    'avatar_url': None,
                    'is_current_user': current_user_uid == 'alex-python'
                },
                {
                    'uid': 'code-master',
                    'username': 'CodeMaster', 
                    'display_name': 'Code Master',
                    'xp': 1000, 
                    'level': 3,
                    'pycoins': 1800,
                    'avatar_url': None,
                    'is_current_user': current_user_uid == 'code-master'
                },
                {
                    'uid': 'py-ninja',
                    'username': 'PyNinja', 
                    'display_name': 'Python Ninja',
                    'xp': 850, 
                    'level': 3,
                    'pycoins': 1500,
                    'avatar_url': None,
                    'is_current_user': current_user_uid == 'py-ninja'
                },
                {
                    'uid': 'script-kid',
                    'username': 'ScriptKid', 
                    'display_name': 'Script Kid',
                    'xp': 750, 
                    'level': 2,
                    'pycoins': 1200,
                    'avatar_url': '/static/img/default-avatar.svg',
                    'is_current_user': current_user_uid == 'script-kid'
                }
            ]
            
            # If current user is not in the mock data, add them at a reasonable position
            if current_user_uid and not any(user['is_current_user'] for user in leaderboard):
                current_user = session.get('user', {})
                user_xp = current_user.get('xp', 100)
                current_user_entry = {
                    'uid': current_user_uid,
                    'username': current_user.get('username', 'You'),
                    'display_name': current_user.get('display_name', current_user.get('username', 'You')),
                    'xp': user_xp,
                    'level': current_user.get('level', 1),
                    'pycoins': current_user.get('pycoins', 0),
                    'avatar_url': current_user.get('profile_picture') or '/static/img/default-avatar.svg',
                    'is_current_user': True
                }
                
                # Insert user in correct position based on XP
                inserted = False
                for i, user in enumerate(leaderboard):
                    if user_xp > user['xp']:
                        leaderboard.insert(i, current_user_entry)
                        inserted = True
                        break
                
                if not inserted:
                    leaderboard.append(current_user_entry)
                    
        else:
            # Get from Firebase
            firebase_service = current_app.config.get('firebase_service')
            if firebase_service and firebase_service.is_available():
                leaderboard = firebase_service.get_leaderboard(10)
                
                # Mark current user
                for user in leaderboard:
                    user['is_current_user'] = user.get('uid') == current_user_uid
            else:
                leaderboard = []
        
        return jsonify({
            'success': True,
            'users': leaderboard,  # Changed from 'leaderboard' to 'users' to match frontend
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

@dashboard_api_bp.route('/ping')
def ping():
    """Simple ping endpoint to check server availability"""
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

@dashboard_api_bp.route('/suggestions')
def get_personalized_suggestions():
    """Get personalized learning suggestions for the user"""
    try:
        user = get_current_user()
        user_id = user['uid'] if user else 'dev-user-001'
        
        # Get user's progress and preferences
        user_progress = get_user_progress(user_id)
        all_lessons = get_all_lessons()
        
        # Find learning paths and recommendations based on user's progress
        completed_lessons_count = len([p for p in user_progress.values() if p.get('completed', False)])
        total_lessons = len(all_lessons)
        
        # Get time of day
        hour = datetime.now().hour
        time_based_suggestions = []
        
        if hour >= 5 and hour < 12:
            time_based_suggestions = [
                "Start your morning with a quick Python challenge",
                "Morning is perfect for learning new concepts",
                "Fresh mind, fresh code - let's start with a new lesson"
            ]
        elif hour >= 12 and hour < 17:
            time_based_suggestions = [
                "Take a midday break with some Python practice",
                "Afternoon is great for problem-solving",
                "Power through your afternoon with a coding session"
            ]
        elif hour >= 17 and hour < 22:
            time_based_suggestions = [
                "Wind down your day with some relaxed coding",
                "Evening is perfect for reviewing what you've learned",
                "Solidify today's knowledge with a quick review"
            ]
        else:
            time_based_suggestions = [
                "Night owl coding session? Let's make progress!",
                "Late night is great for focused learning",
                "Quiet hours are perfect for deep concentration"
            ]
        
        # Find incomplete lessons
        incomplete_lessons = []
        for lesson in all_lessons:
            lesson_id = lesson.get('id')
            if lesson_id not in user_progress or not user_progress[lesson_id].get('completed', False):
                incomplete_lessons.append({
                    'id': lesson_id,
                    'title': lesson.get('title', 'Untitled Lesson'),
                    'description': lesson.get('description', ''),
                    'difficulty': lesson.get('difficulty', 'beginner')
                })
        
        # Find lessons in progress (started but not completed)
        in_progress_lessons = []
        for lesson_id, progress in user_progress.items():
            if progress.get('progress', 0) > 0 and not progress.get('completed', False):
                lesson = next((l for l in all_lessons if l.get('id') == lesson_id), None)
                if lesson:
                    in_progress_lessons.append({
                        'id': lesson_id,
                        'title': lesson.get('title', 'Untitled Lesson'),
                        'description': lesson.get('description', ''),
                        'progress': progress.get('progress', 0)
                    })
        
        # Calculate progress-based suggestions
        progress_percentage = (completed_lessons_count / total_lessons * 100) if total_lessons > 0 else 0
        progress_suggestions = []
        
        if progress_percentage < 25:
            progress_suggestions = [
                "You're just getting started - keep up the momentum!",
                "Building foundations is important - keep learning!",
                "The beginning of your Python journey looks promising"
            ]
        elif progress_percentage < 50:
            progress_suggestions = [
                "You're making great progress - keep it up!",
                "You're on your way to Python mastery",
                "Keep the learning streak going strong"
            ]
        elif progress_percentage < 75:
            progress_suggestions = [
                "You're well on your way to becoming a Python pro",
                "Your dedication is paying off - you've learned a lot!",
                "You're in the advanced territory now"
            ]
        else:
            progress_suggestions = [
                "You're almost a Python master!",
                "Impressive progress - you're near completion",
                "You've come so far - just a little more to go!"
            ]
        
        # Prepare personalized suggestions
        import random
        suggestions = {
            'time_based': random.choice(time_based_suggestions),
            'progress_based': random.choice(progress_suggestions),
            'next_lessons': incomplete_lessons[:3],
            'in_progress_lessons': in_progress_lessons[:3],
            'progress_percentage': progress_percentage,
            'completed_lessons_count': completed_lessons_count,
            'total_lessons': total_lessons,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(suggestions)
        
    except Exception as e:
        logger.error(f"Error getting personalized suggestions: {str(e)}")
        return jsonify({
            'time_based': "Ready to continue your Python journey?",
            'progress_based': "Keep learning and growing!",
            'next_lessons': [],
            'in_progress_lessons': [],
            'error': str(e)
        }), 500

@dashboard_api_bp.route('/ai-recommendations')
def get_ai_recommendations():
    """Get AI-powered personalized learning recommendations"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({
                'recommendations': [],
                'guest_mode': True,
                'message': 'Login to get personalized recommendations'
            })
        
        user_id = user['uid']
        
        # Get user progress and lessons
        user_progress = get_user_progress(user_id)
        all_lessons = get_all_lessons()
        
        # Simple recommendations without AI engine
        recommendations = _get_simple_recommendations(user_progress, all_lessons)
        
        # Simple learning insights
        learning_insights = _get_simple_learning_insights(user_progress, all_lessons)
        
        # Format recommendations for frontend
        formatted_recommendations = []
        for rec in recommendations:
            formatted_recommendations.append({
                'id': rec.get('lesson_id'),
                'title': rec.get('display_title'),
                'description': rec.get('display_description'),
                'reason': rec.get('reason'),
                'confidence': rec.get('confidence', 0.5),
                'priority': rec.get('priority', 'medium'),
                'type': rec.get('type', 'general'),
                'estimated_time': rec.get('estimated_time', 30),
                'xp_reward': rec.get('xp_reward', 50),
                'score': rec.get('score', 0.5),
                'url': f"/lesson/{rec.get('lesson_id')}"
            })
        
        logger.info(f"Generated {len(formatted_recommendations)} AI recommendations for user {user_id}")
        
        return jsonify({
            'recommendations': formatted_recommendations,
            'insights': learning_insights,
            'user_analysis': {
                'completion_rate': learning_insights.get('completion_rate', 0),
                'consistency_score': learning_insights.get('consistency_score', 0),
                'preferred_difficulty': learning_insights.get('preferred_difficulty', 'beginner'),
                'active_hours': learning_insights.get('active_hours', 'morning'),
                'strengths': learning_insights.get('strengths', []),
                'skill_gaps': learning_insights.get('skill_gaps', [])
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting AI recommendations: {str(e)}")
        return jsonify({
            'error': 'Failed to generate recommendations',
            'recommendations': [],
            'insights': {},
            'user_analysis': {}
        }), 500

@dashboard_api_bp.route('/learning-insights')
def get_learning_insights():
    """Get detailed learning insights and analytics"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({
                'insights': {},
                'guest_mode': True,
                'message': 'Login to view learning insights'
            })
        
        user_id = user['uid']
        
        # Get user progress and lessons
        user_progress = get_user_progress(user_id)
        all_lessons = get_all_lessons()
        
        # Simple learning insights without AI engine
        learning_insights = _get_simple_learning_insights(user_progress, all_lessons)
        
        # Add additional analytics
        analytics_data = {
            'progress_trends': _calculate_progress_trends(user_progress),
            'learning_streaks': _calculate_learning_streaks(user_progress),
            'performance_metrics': _calculate_performance_metrics(user_progress, all_lessons),
            'time_analytics': _calculate_time_analytics(user_progress)
        }
        
        return jsonify({
            'insights': learning_insights,
            'analytics': analytics_data,
            'user_profile': learning_insights,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting learning insights: {str(e)}")
        return jsonify({
            'error': 'Failed to generate learning insights',
            'insights': {},
            'analytics': {}
        }), 500

def _calculate_progress_trends(user_progress: Dict) -> Dict:
    """Calculate user's progress trends over time"""
    trends = {
        'weekly_progress': 0,
        'monthly_progress': 0,
        'acceleration': 'stable',
        'projected_completion': None
    }
    
    try:
        # Get completed lessons with timestamps
        completed_lessons = []
        for lesson_id, progress in user_progress.items():
            if progress.get('completed', False) and progress.get('last_accessed'):
                try:
                    completion_time = datetime.fromisoformat(progress['last_accessed'])
                    completed_lessons.append(completion_time)
                except:
                    pass
        
        if len(completed_lessons) > 1:
            completed_lessons.sort()
            
            # Calculate recent progress
            now = datetime.now()
            week_ago = now - timedelta(weeks=1)
            month_ago = now - timedelta(weeks=4)
            
            weekly_completions = len([dt for dt in completed_lessons if dt >= week_ago])
            monthly_completions = len([dt for dt in completed_lessons if dt >= month_ago])
            
            trends['weekly_progress'] = weekly_completions
            trends['monthly_progress'] = monthly_completions
            
            # Determine acceleration
            if len(completed_lessons) > 2:
                recent_rate = weekly_completions / 1  # per week
                historical_rate = len(completed_lessons) / max(1, (now - completed_lessons[0]).days / 7)
                
                if recent_rate > historical_rate * 1.2:
                    trends['acceleration'] = 'accelerating'
                elif recent_rate < historical_rate * 0.8:
                    trends['acceleration'] = 'decelerating'
                else:
                    trends['acceleration'] = 'stable'
    
    except Exception as e:
        logger.error(f"Error calculating progress trends: {str(e)}")
    
    return trends

def _calculate_learning_streaks(user_progress: Dict) -> Dict:
    """Calculate learning streaks and consistency metrics"""
    streaks = {
        'current_streak': 0,
        'longest_streak': 0,
        'consistency_score': 0,
        'active_days': 0
    }
    
    try:
        # Get all activity dates
        activity_dates = set()
        for lesson_id, progress in user_progress.items():
            if progress.get('last_accessed'):
                try:
                    date = datetime.fromisoformat(progress['last_accessed']).date()
                    activity_dates.add(date)
                except:
                    pass
        
        if activity_dates:
            sorted_dates = sorted(activity_dates)
            streaks['active_days'] = len(sorted_dates)
            
            # Calculate current streak
            current_date = datetime.now().date()
            current_streak = 0
            check_date = current_date
            
            while check_date in activity_dates:
                current_streak += 1
                check_date -= timedelta(days=1)
            
            streaks['current_streak'] = current_streak
            
            # Calculate longest streak
            longest_streak = 0
            current_streak = 0
            
            for i in range(1, len(sorted_dates)):
                if (sorted_dates[i] - sorted_dates[i-1]).days == 1:
                    current_streak += 1
                else:
                    longest_streak = max(longest_streak, current_streak)
                    current_streak = 0
            
            streaks['longest_streak'] = max(longest_streak, current_streak)
            
            # Calculate consistency score (0-1)
            if len(sorted_dates) > 1:
                total_days = (sorted_dates[-1] - sorted_dates[0]).days + 1
                streaks['consistency_score'] = len(sorted_dates) / total_days
    
    except Exception as e:
        logger.error(f"Error calculating learning streaks: {str(e)}")
    
    return streaks

def _calculate_performance_metrics(user_progress: Dict, all_lessons: List) -> Dict:
    """Calculate performance metrics"""
    metrics = {
        'completion_rate': 0,
        'average_progress': 0,
        'efficiency_score': 0,
        'difficulty_distribution': {}
    }
    
    try:
        total_lessons = len(all_lessons)
        completed_lessons = len([p for p in user_progress.values() if p.get('completed', False)])
        
        if total_lessons > 0:
            metrics['completion_rate'] = completed_lessons / total_lessons
        
        # Calculate average progress
        all_progress = [p.get('progress', 0) for p in user_progress.values()]
        if all_progress:
            metrics['average_progress'] = sum(all_progress) / len(all_progress)
        
        # Calculate efficiency score (completion rate vs time spent)
        time_spent = sum(p.get('time_spent', 0) for p in user_progress.values())
        if time_spent > 0:
            metrics['efficiency_score'] = (completed_lessons * 30) / time_spent  # 30 min baseline
        
        # Difficulty distribution
        difficulty_counts = {'beginner': 0, 'intermediate': 0, 'advanced': 0}
        for lesson in all_lessons:
            lesson_id = lesson.get('id')
            if lesson_id in user_progress and user_progress[lesson_id].get('completed', False):
                difficulty = lesson.get('difficulty', 'beginner')
                difficulty_counts[difficulty] = difficulty_counts.get(difficulty, 0) + 1
        
        metrics['difficulty_distribution'] = difficulty_counts
    
    except Exception as e:
        logger.error(f"Error calculating performance metrics: {str(e)}")
    
    return metrics

def _calculate_time_analytics(user_progress: Dict) -> Dict:
    """Calculate time-based analytics"""
    analytics = {
        'total_time_spent': 0,
        'average_session_time': 0,
        'most_active_hour': None,
        'learning_velocity': 0
    }
    
    try:
        # Total time spent
        total_time = sum(p.get('time_spent', 0) for p in user_progress.values())
        analytics['total_time_spent'] = total_time
        
        # Average session time
        completed_lessons = [p for p in user_progress.values() if p.get('completed', False)]
        if completed_lessons:
            session_times = [p.get('time_spent', 0) for p in completed_lessons if p.get('time_spent', 0) > 0]
            if session_times:
                analytics['average_session_time'] = sum(session_times) / len(session_times)
        
        # Most active hour
        access_hours = []
        for progress in user_progress.values():
            if progress.get('last_accessed'):
                try:
                    hour = datetime.fromisoformat(progress['last_accessed']).hour
                    access_hours.append(hour)
                except:
                    pass
        
        if access_hours:
            from collections import Counter
            hour_counts = Counter(access_hours)
            analytics['most_active_hour'] = hour_counts.most_common(1)[0][0]
        
        # Learning velocity (lessons per week)
        if len(completed_lessons) > 1:
            first_completion = None
            last_completion = None
            
            for progress in completed_lessons:
                if progress.get('last_accessed'):
                    try:
                        completion_time = datetime.fromisoformat(progress['last_accessed'])
                        if first_completion is None or completion_time < first_completion:
                            first_completion = completion_time
                        if last_completion is None or completion_time > last_completion:
                            last_completion = completion_time
                    except:
                        pass
            
            if first_completion and last_completion:
                weeks = max(1, (last_completion - first_completion).days / 7)
                analytics['learning_velocity'] = len(completed_lessons) / weeks
    
    except Exception as e:
        logger.error(f"Error calculating time analytics: {str(e)}")
    
    return analytics
