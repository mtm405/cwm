from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash
from flask_login import login_required, current_user
from services.firebase_service import firebase_service
from models.user import get_current_user, User
from models.user_profile import UserProfile, UserStats, Achievement, ActivityFeed
from services.achievement_service import AchievementService
from datetime import datetime
import json
import os

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

@profile_bp.route('/')
@login_required
def my_profile():
    """Redirect to current user's profile"""
    return redirect(url_for('profile.view_profile', username=current_user.username))

@profile_bp.route('/<username>')
def view_profile(username):
    """View user profile page"""
    try:
        # Get user data
        user = User.query.filter_by(username=username).first()
        if not user:
            flash('User not found', 'error')
            return redirect(url_for('main.dashboard'))
        
        # Get profile data from Firebase
        profile_data = firebase_service.get_user_profile(user.id)
        
        # Get user stats
        stats = firebase_service.get_user_stats(user.id)
        
        # Get achievements
        achievements = firebase_service.get_user_achievements(user.id)
        
        # Get recent activity
        recent_activity = firebase_service.get_user_activity(user.id, limit=10)
        
        # Check if viewing own profile
        is_own_profile = current_user.is_authenticated and current_user.id == user.id
        
        # Get Google Client ID for auth
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        
        return render_template('profile.html',
                             user=user,
                             profile_data=profile_data,
                             stats=stats,
                             achievements=achievements,
                             recent_activity=recent_activity,
                             is_own_profile=is_own_profile,
                             google_client_id=google_client_id)
    
    except Exception as e:
        flash('Error loading profile', 'error')
        return redirect(url_for('main.dashboard'))

@profile_bp.route('/api/profile/<int:user_id>')
@login_required
def get_profile_data(user_id):
    """Get profile data API endpoint"""
    try:
        # Check if user can access this profile
        if current_user.id != user_id:
            user = User.query.get(user_id)
            if not user or not user.profile_public:
                return jsonify({'error': 'Profile not accessible'}), 403
        
        # Get profile data
        profile_data = firebase_service.get_user_profile(user_id)
        stats = firebase_service.get_user_stats(user_id)
        
        return jsonify({
            'profile': profile_data,
            'stats': stats,
            'success': True
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/api/profile/update', methods=['POST'])
@login_required
def update_profile():
    """Update user profile"""
    try:
        data = request.get_json()
        
        # Validate data
        allowed_fields = ['display_name', 'bio', 'location', 'website', 'social_links', 'profile_public']
        profile_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        # Update profile in Firebase
        firebase_service.update_user_profile(current_user.id, profile_data)
        
        # Update local user model if needed
        if 'display_name' in profile_data:
            current_user.display_name = profile_data['display_name']
            current_user.save()
        
        return jsonify({'success': True, 'message': 'Profile updated successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/api/profile/avatar', methods=['POST'])
@login_required
def upload_avatar():
    """Upload user avatar"""
    try:
        if 'avatar' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['avatar']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif'}
        if not file.filename.lower().endswith(tuple(allowed_extensions)):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Upload to Firebase Storage
        avatar_url = firebase_service.upload_avatar(current_user.id, file)
        
        # Update user profile
        firebase_service.update_user_profile(current_user.id, {'avatar_url': avatar_url})
        
        return jsonify({'success': True, 'avatar_url': avatar_url})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/api/profile/achievements')
@login_required
def get_achievements():
    """Get user achievements"""
    try:
        user_id = request.args.get('user_id', current_user.id)
        
        # Check access permissions
        if int(user_id) != current_user.id:
            user = User.query.get(user_id)
            if not user or not user.profile_public:
                return jsonify({'error': 'Achievements not accessible'}), 403
        
        achievements = firebase_service.get_user_achievements(user_id)
        return jsonify({'achievements': achievements, 'success': True})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/api/profile/stats')
@login_required
def get_stats():
    """Get user statistics"""
    try:
        user_id = request.args.get('user_id', current_user.id)
        
        # Check access permissions
        if int(user_id) != current_user.id:
            user = User.query.get(user_id)
            if not user or not user.profile_public:
                return jsonify({'error': 'Stats not accessible'}), 403
        
        stats = firebase_service.get_user_stats(user_id)
        return jsonify({'stats': stats, 'success': True})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/api/profile/activity')
@login_required
def get_activity():
    """Get user activity feed"""
    try:
        user_id = request.args.get('user_id', current_user.id)
        limit = request.args.get('limit', 20, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Check access permissions
        if int(user_id) != current_user.id:
            user = User.query.get(user_id)
            if not user or not user.profile_public:
                return jsonify({'error': 'Activity not accessible'}), 403
        
        activities = firebase_service.get_user_activity(user_id, limit=limit, offset=offset)
        return jsonify({'activities': activities, 'success': True})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@profile_bp.route('/api/profile/settings', methods=['POST'])
@login_required
def update_settings():
    """Update profile settings"""
    try:
        data = request.get_json()
        
        # Validate settings data
        allowed_settings = ['profile_public', 'show_achievements', 'show_activity', 'show_stats']
        settings = {k: v for k, v in data.items() if k in allowed_settings}
        
        # Update settings in Firebase
        firebase_service.update_user_settings(current_user.id, settings)
        
        return jsonify({'success': True, 'message': 'Settings updated successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
