from flask import Blueprint, request, jsonify, render_template, redirect, url_for, session
from models.user import get_current_user
from datetime import datetime
import json

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('/')
def get_profile():
    """Get user profile data"""
    try:
        # Get current user
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'User not authenticated'}), 401
        
        # Create profile data structure
        profile_data = {
            'user_id': user.get('uid'),
            'email': user.get('email'),
            'display_name': user.get('display_name') or user.get('username'),
            'bio': user.get('bio', 'Learning ES6 and loving it!'),
            'avatar_url': user.get('avatar_url'),
            'location': user.get('location'),
            'website': user.get('website'),
            'profile_public': user.get('profile_public', True),
            'show_progress': user.get('show_progress', True),
            'show_achievements': user.get('show_achievements', True),
            'created_at': user.get('created_at', datetime.now().isoformat())
        }
        
        # Create stats data structure
        stats_data = {
            'user_id': user.get('uid'),
            'lessons_completed': user.get('completed_lessons_count', 0),
            'total_xp': user.get('xp', 0),
            'current_streak': user.get('streak', 0),
            'max_streak': user.get('max_streak', 0),
            'total_time_spent': user.get('total_time_spent', 0),
            'code_executions': user.get('code_executions', 0),
            'achievements_unlocked': user.get('achievements_unlocked', 0),
            'recent_lessons': 5,
            'recent_executions': 12,
            'recent_time': 180,
            'progress_by_category': {
                'ES6 Basics': {'completed': 8, 'total': 10, 'time_spent': 120},
                'Advanced Features': {'completed': 3, 'total': 8, 'time_spent': 90},
                'Async Programming': {'completed': 2, 'total': 6, 'time_spent': 60}
            }
        }
        
        return jsonify({
            'success': True,
            'profile': profile_data,
            'stats': stats_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_bp.route('/update', methods=['PUT'])
def update_profile():
    """Update user profile"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'User not authenticated'}), 401
        
        data = request.get_json()
        
        # In a real app, you would update the user in Firebase/database
        # For now, we'll just return success
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_bp.route('/avatar', methods=['POST'])
def upload_avatar():
    """Upload user avatar"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'User not authenticated'}), 401
        
        # In a real app, you would handle file upload
        # For now, we'll return a mock avatar URL
        
        return jsonify({
            'success': True,
            'avatar_url': '/static/img/default-avatar.png',
            'message': 'Avatar uploaded successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_bp.route('/stats')
def get_stats():
    """Get user statistics"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'User not authenticated'}), 401
        
        # Get time range parameter
        time_range = request.args.get('range', '7d')
        
        # Mock stats data based on time range
        stats_data = {
            'lessons_completed': user.get('completed_lessons_count', 0),
            'code_executions': user.get('code_executions', 0),
            'total_time': user.get('total_time_spent', 0),
            'current_streak': user.get('streak', 0),
            'recent_lessons': 5,
            'recent_executions': 12,
            'recent_time': 180,
            'daily_progress': [
                {'date': '2025-07-01', 'lessons_completed': 2, 'time_spent': 45},
                {'date': '2025-07-02', 'lessons_completed': 3, 'time_spent': 60},
                {'date': '2025-07-03', 'lessons_completed': 1, 'time_spent': 30}
            ],
            'activity_heatmap': [
                {'date': '2025-07-01', 'activity_count': 5},
                {'date': '2025-07-02', 'activity_count': 8},
                {'date': '2025-07-03', 'activity_count': 3}
            ],
            'skills_progress': {
                'ES6 Basics': 85,
                'Arrow Functions': 90,
                'Destructuring': 75,
                'Async/Await': 60,
                'Modules': 80
            },
            'weekly_activity': [
                {'week': 1, 'total_time': 180},
                {'week': 2, 'total_time': 220},
                {'week': 3, 'total_time': 160}
            ]
        }
        
        return jsonify({
            'success': True,
            'stats': stats_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_bp.route('/achievements')
def get_achievements():
    """Get user achievements"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'User not authenticated'}), 401
        
        # Mock achievements data
        achievements = [
            {
                'id': 'first_lesson',
                'name': 'First Steps',
                'description': 'Complete your first lesson',
                'icon': 'star',
                'category': 'Learning',
                'rarity': 'common',
                'unlocked': True,
                'unlocked_date': '2025-07-01',
                'progress': 1,
                'requirements': {'target': 1}
            },
            {
                'id': 'code_runner',
                'name': 'Code Runner',
                'description': 'Execute code 10 times',
                'icon': 'code',
                'category': 'Practice',
                'rarity': 'common',
                'unlocked': True,
                'unlocked_date': '2025-07-02',
                'progress': 10,
                'requirements': {'target': 10}
            },
            {
                'id': 'streak_starter',
                'name': 'Streak Starter',
                'description': 'Maintain a 3-day learning streak',
                'icon': 'fire',
                'category': 'Consistency',
                'rarity': 'rare',
                'unlocked': False,
                'progress': 2,
                'requirements': {'target': 3}
            },
            {
                'id': 'es6_master',
                'name': 'ES6 Master',
                'description': 'Complete all ES6 lessons',
                'icon': 'crown',
                'category': 'Mastery',
                'rarity': 'legendary',
                'unlocked': False,
                'progress': 5,
                'requirements': {'target': 20}
            }
        ]
        
        # Mock progress data
        progress = {
            'first_lesson': {'unlocked': True, 'progress': 1, 'unlocked_date': '2025-07-01'},
            'code_runner': {'unlocked': True, 'progress': 10, 'unlocked_date': '2025-07-02'},
            'streak_starter': {'unlocked': False, 'progress': 2},
            'es6_master': {'unlocked': False, 'progress': 5}
        }
        
        return jsonify({
            'success': True,
            'achievements': achievements,
            'progress': progress
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_bp.route('/achievements/check', methods=['POST'])
def check_achievements():
    """Check for new achievements"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'User not authenticated'}), 401
        
        data = request.get_json()
        action = data.get('action')
        
        # Mock achievement checking logic
        # In a real app, this would check against actual achievement requirements
        
        return jsonify({
            'success': True,
            'new_achievements': [],
            'updated_progress': {}
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_bp.route('/activity')
def get_activity():
    """Get user activity feed"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'User not authenticated'}), 401
        
        # Mock activity data
        activities = [
            {
                'id': 1,
                'type': 'lesson_completed',
                'title': 'Lesson Completed',
                'description': 'Completed "Arrow Functions" lesson',
                'timestamp': '2025-07-03T10:30:00Z'
            },
            {
                'id': 2,
                'type': 'achievement_unlocked',
                'title': 'Achievement Unlocked',
                'description': 'Unlocked "Code Runner" achievement',
                'timestamp': '2025-07-02T15:45:00Z'
            },
            {
                'id': 3,
                'type': 'code_executed',
                'title': 'Code Executed',
                'description': 'Ran ES6 arrow function example',
                'timestamp': '2025-07-02T14:20:00Z'
            },
            {
                'id': 4,
                'type': 'quiz_passed',
                'title': 'Quiz Passed',
                'description': 'Passed ES6 Basics quiz with 85%',
                'timestamp': '2025-07-01T16:10:00Z'
            }
        ]
        
        return jsonify({
            'success': True,
            'activities': activities
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@profile_bp.route('/settings', methods=['GET', 'POST'])
def profile_settings():
    """Get or update profile settings"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'User not authenticated'}), 401
        
        if request.method == 'GET':
            # Return current settings
            settings = {
                'notifications': {
                    'email_notifications': True,
                    'push_notifications': True,
                    'achievement_notifications': True
                },
                'privacy': {
                    'profile_public': True,
                    'show_progress': True,
                    'show_achievements': True
                },
                'preferences': {
                    'theme': 'dark',
                    'language': 'en',
                    'timezone': 'UTC'
                }
            }
            return jsonify({
                'success': True,
                'settings': settings
            })
        
        else:  # POST
            data = request.get_json()
            # In a real app, you would update the settings in Firebase/database
            return jsonify({
                'success': True,
                'message': 'Settings updated successfully'
            })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
