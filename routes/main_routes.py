"""
Main routes for Code with Morais
"""
from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, current_app
from models.user import get_current_user, get_user_progress
from models.activity import get_recent_activity
from models.challenge import get_daily_challenge
from models.lesson import get_mock_lessons, calculate_overall_progress
from services.firebase_service import db
from config import get_config
import os

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def index():
    """Landing page"""
    user = get_current_user()
    # Pass the Google client ID for OAuth from environment
    google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
    return render_template('index.html', user=user, google_client_id=google_client_id)

@main_bp.route('/dashboard')
def dashboard():
    """User dashboard"""
    user = get_current_user()
    
    # Redirect to login if no user and not in dev mode
    from config import get_config
    config = get_config()
    if not user and not config.DEV_MODE:
        return redirect(url_for('main.index'))
    
    # Ensure we have a valid user object
    if not user:
        user = {
            'uid': 'guest',
            'username': 'Guest Student',
            'display_name': 'Guest Student',
            'email': '',
            'xp': 0,
            'pycoins': 0,
            'level': 1,
            'streak': 0,
            'is_admin': False,
            'profile_picture': ''
        }
    
    # Get leaderboard data
    if config.DEV_MODE:
        leaderboard = [
            {'username': 'DevUser', 'xp': 1500},
            {'username': 'AlexPython', 'xp': 1200},
            {'username': 'CodeMaster', 'xp': 1000},
            {'username': 'PyNinja', 'xp': 850},
            {'username': 'ScriptKid', 'xp': 750}
        ]
    else:
        if db:
            from firebase_admin import firestore
            users_ref = db.collection('users').order_by('xp', direction=firestore.Query.DESCENDING).limit(10)
            leaderboard = [{'username': u.to_dict().get('username'), 'xp': u.to_dict().get('xp', 0)} 
                          for u in users_ref.stream()]
        else:
            leaderboard = []
    
    # Get daily challenge
    daily_challenge = get_daily_challenge()
    
    # Get recent activity
    recent_activity = get_recent_activity(user['uid'] if user else 'dev-user-001')
    
    return render_template('dashboard.html', 
                         user=user, 
                         leaderboard=leaderboard,
                         daily_challenge=daily_challenge,
                         recent_activity=recent_activity)

@main_bp.route('/lessons')
def lessons():
    """Lessons page"""
    user = get_current_user()
    return render_template('lessons.html', user=user)

@main_bp.route('/lesson/<lesson_id>')
def lesson_detail(lesson_id):
    """Individual lesson page"""
    user = get_current_user()
    return render_template('lesson.html', user=user, lesson_id=lesson_id)
