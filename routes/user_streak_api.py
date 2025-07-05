"""
User Streak API
Handles user streak data and tracking for daily challenges
"""

from flask import Blueprint, jsonify, session, request, current_app
from datetime import datetime, timedelta
import traceback

# Import services
from services.firebase_service import get_firestore_instance

# Create blueprint
user_streak_api = Blueprint('user_streak_api', __name__)

@user_streak_api.route('/api/user/streak', methods=['GET'])
def get_user_streak():
    """Get the user's streak data"""
    try:
        # Get user ID from session
        from flask import session
        user_id = session.get('user_id', None)
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'User not authenticated'
            }), 401
        
        # Get streak data from Firestore
        db = get_firestore_instance()
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        user_data = user_doc.to_dict()
        
        # Get user challenge data for completion dates
        user_challenge_ref = db.collection('user_challenges').document(user_id)
        user_challenge_doc = user_challenge_ref.get()
        
        completion_dates = []
        last_completed_date = None
        
        if user_challenge_doc.exists:
            challenge_data = user_challenge_doc.to_dict()
            completed_challenges = challenge_data.get('completed_challenges', {})
            
            # Convert to list of dates
            for date, challenge_id in completed_challenges.items():
                completion_dates.append(date)
            
            last_completed_date = challenge_data.get('last_completed_date')
        
        # Get current and longest streak
        current_streak = user_data.get('streak', 0)
        longest_streak = user_data.get('longest_streak', 0)
        
        # If longest streak not set but current streak exists, update it
        if longest_streak == 0 and current_streak > 0:
            longest_streak = current_streak
            user_ref.update({'longest_streak': current_streak})
        
        return jsonify({
            'success': True,
            'streak': {
                'current': current_streak,
                'longest': longest_streak,
                'lastCompletedDate': last_completed_date,
                'completionDates': completion_dates
            },
            'user': {
                'id': user_id,
                'name': user_data.get('displayName', 'User'),
                'xp': user_data.get('xp', 0),
                'pycoins': user_data.get('pycoins', 0)
            }
        })
    
    except Exception as e:
        current_app.logger.error(f"Error getting user streak: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@user_streak_api.route('/api/user/streak/reset', methods=['POST'])
def reset_user_streak():
    """Reset a user's streak (admin only)"""
    try:
        # Check if admin
        from flask import session
        user_id = session.get('user_id', None)
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'User not authenticated'
            }), 401
        
        # Verify admin status
        db = get_firestore_instance()
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists or not user_doc.to_dict().get('isAdmin', False):
            return jsonify({
                'success': False,
                'error': 'Unauthorized'
            }), 403
        
        # Get target user ID
        target_user_id = request.json.get('userId')
        
        if not target_user_id:
            return jsonify({
                'success': False,
                'error': 'Target user ID required'
            }), 400
        
        # Reset streak for target user
        target_user_ref = db.collection('users').document(target_user_id)
        target_user_doc = target_user_ref.get()
        
        if not target_user_doc.exists:
            return jsonify({
                'success': False,
                'error': 'Target user not found'
            }), 404
        
        # Update streak
        target_user_ref.update({
            'streak': 0,
            'last_streak_date': None
        })
        
        return jsonify({
            'success': True,
            'message': 'Streak reset successfully'
        })
    
    except Exception as e:
        current_app.logger.error(f"Error resetting user streak: {str(e)}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
