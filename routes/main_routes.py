"""
Main routes for Code with Morais
"""
from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, current_app
from models.user import get_current_user, get_user_progress
from models.lesson import get_mock_lessons, calculate_overall_progress
from config import get_config
import os

main_bp = Blueprint('main', __name__)

@main_bp.route('/test-lesson-system')
def test_lesson_system():
    """Phase 8: Lesson System Test Suite"""
    return render_template('test-lesson-system.html')

@main_bp.route('/')
def index():
    """Landing page"""
    user = get_current_user()
    # Pass the Google client ID for OAuth from environment
    google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
    return render_template('pages/index.html', user=user, google_client_id=google_client_id)

@main_bp.route('/dashboard')
def dashboard():
    """User dashboard with Firebase integration"""
    user = get_current_user()
    
    # Redirect to login if no user and not in dev mode
    from config import get_config
    config = get_config()
    if not user and not config.DEV_MODE:
        return redirect(url_for('main.index'))
    
    # Initialize Firebase service
    from services.firebase_service import FirebaseService
    firebase_service = FirebaseService(config.FIREBASE_CONFIG if hasattr(config, 'FIREBASE_CONFIG') else {})
    
    # Get real user data from Firebase or use fallback
    if user and firebase_service.is_available():
        # Get comprehensive user dashboard data from Firebase
        user_data = firebase_service.get_user_dashboard_data(user['uid'])
        user.update(user_data)
        
        # Get leaderboard from Firebase
        leaderboard = firebase_service.get_leaderboard(limit=10)
        
        # Get daily challenge from Firebase
        daily_challenge = firebase_service.get_daily_challenge()
        
        # Get recent activities from Firebase
        recent_activity = firebase_service.get_user_activities(user['uid'], limit=10)
        
    else:
        # Enhanced fallback for dev mode or when Firebase is unavailable
        user = user or {
            'uid': 'guest',
            'username': 'Guest Student',
            'display_name': 'Guest Student',
            'first_name': 'Guest',
            'last_name': 'Student',
            'email': '',
            'xp': 0,
            'pycoins': 100,
            'level': 1,
            'streak': 0,
            'is_admin': False,
            'profile_picture': '',
            'completed_lessons': [],
            'lesson_progress': {},
            'fallback_mode': True
        }
        
        # Mock data for development
        leaderboard = [
            {'username': 'DevUser', 'xp': 1500, 'level': 15},
            {'username': 'AlexPython', 'xp': 1200, 'level': 12},
            {'username': 'CodeMaster', 'xp': 1000, 'level': 10},
            {'username': 'PyNinja', 'xp': 850, 'level': 8},
            {'username': 'ScriptKid', 'xp': 750, 'level': 7}
        ]
        
        daily_challenge = firebase_service.get_daily_challenge()
        recent_activity = firebase_service.get_user_activities(user['uid'], limit=10)
    
    # Temporary debug - return simple response to test template issue
    # return jsonify({'status': 'template_test', 'user_exists': user is not None})
    
    return render_template('dashboard.html', 
                         user=user, 
                         leaderboard=leaderboard,
                         daily_challenge=daily_challenge,
                         recent_activity=recent_activity)

@main_bp.route('/test-template')
def test_template():
    """Simple test route to check template rendering"""
    return render_template('simple_test.html')

@main_bp.route('/test-js')
def test_js():
    """Test page for JavaScript module loading"""
    google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
    return render_template('test-js.html', google_client_id=google_client_id)

@main_bp.route('/test-google-signin')
def test_google_signin():
    """Test page for Google Sign-In functionality"""
    google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
    return render_template('test-google-signin.html', google_client_id=google_client_id)

@main_bp.route('/profile')
def profile():
    """User profile page"""
    user = get_current_user()
    
    # Redirect to login if no user
    from config import get_config
    config = get_config()
    if not user and not config.DEV_MODE:
        return redirect(url_for('main.index'))
    
    # For development mode, create a mock user if needed
    if config.DEV_MODE and not user:
        user = {
            'uid': 'dev_user_001',
            'email': 'dev@example.com',
            'display_name': 'Development User',
            'bio': 'This is a development user for testing purposes',
            'avatar_url': None,
            'profile_public': True,
            'show_progress': True,
            'show_achievements': True
        }
    
    return render_template('profile.html', user=user)

# Note: /lessons route moved to lesson_routes.py for better organization
# Note: /lesson/<lesson_id> route also moved to lesson_routes.py for proper data handling
