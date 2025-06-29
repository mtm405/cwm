"""
Authentication routes for Code with Morais
Handles Google OAuth authentication and user sessions
"""
from flask import Blueprint, request, jsonify, session, redirect, url_for, current_app
from firebase_admin import auth as firebase_auth
import logging
import requests
import jwt
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

# Get Firebase service from app context
def get_firebase_service():
    return current_app.config.get('firebase_service')

def verify_google_token(id_token: str) -> Optional[Dict[str, Any]]:
    """Verify Google OAuth ID token directly with Google"""
    try:
        # Verify with Google's tokeninfo endpoint
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            token_info = response.json()
            
            # Verify the audience (client ID) matches our app
            import os
            expected_client_id = os.environ.get('GOOGLE_CLIENT_ID')
            if token_info.get('aud') != expected_client_id:
                logger.error(f"Token audience mismatch. Expected: {expected_client_id}, Got: {token_info.get('aud')}")
                return None
            
            # Verify the issuer
            if token_info.get('iss') not in ['accounts.google.com', 'https://accounts.google.com']:
                logger.error(f"Invalid token issuer: {token_info.get('iss')}")
                return None
            
            # Check if token is still valid (not expired)
            import time
            if int(token_info.get('exp', 0)) < time.time():
                logger.error("Token has expired")
                return None
            
            logger.info(f"Google token verified successfully for user: {token_info.get('email')}")
            return token_info
        else:
            logger.error(f"Google token verification failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        logger.error(f"Error verifying Google token: {str(e)}")
        return None

@auth_bp.route('/sessionLogin', methods=['POST'])
def session_login():
    """Handle Google OAuth login and create user session"""
    try:
        data = request.get_json()
        if not data or 'idToken' not in data:
            logger.error("No ID token provided in request")
            return jsonify({'success': False, 'error': 'ID token required'}), 400
        
        id_token = data['idToken']
        logger.info(f"Received ID token for verification (length: {len(id_token)})")
        
        # Debug: Log first and last few characters of token (safely)
        logger.debug(f"Token starts with: {id_token[:20]}...")
        logger.debug(f"Token ends with: ...{id_token[-20:]}")
        
        # Verify the ID token with Google OAuth
        try:
            logger.info("Attempting to verify ID token with Google OAuth API")
            token_info = verify_google_token(id_token)
            
            if not token_info:
                logger.error("Google token verification failed")
                return jsonify({'success': False, 'error': 'Invalid token'}), 401
            
            logger.info("Google token verification successful")
            
            # Extract user information from Google token
            user_id = token_info.get('sub')  # Google user ID
            user_email = token_info.get('email')
            user_name = token_info.get('name', user_email)
            user_picture = token_info.get('picture', '')
            email_verified = token_info.get('email_verified', 'false') == 'true'
            
            logger.info(f"Token verified successfully - User: {user_email}, Google ID: {user_id}")
            logger.debug(f"Token info fields: {list(token_info.keys())}")
            
        except Exception as e:
            logger.error(f"Google token verification failed with unexpected error: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            return jsonify({'success': False, 'error': 'Token verification failed'}), 401
        
        # Get or create user in Firebase
        firebase_service = get_firebase_service()
        if firebase_service and firebase_service.is_available():
            try:
                # Check if user exists
                existing_user = firebase_service.get_user(user_id)
                
                if not existing_user:
                    # Create new user from Google data
                    google_user_info = {
                        'sub': user_id,
                        'email': user_email,
                        'name': user_name,
                        'picture': user_picture,
                        'email_verified': email_verified
                    }
                    
                    success = firebase_service.create_user_from_google(user_id, google_user_info)
                    if not success:
                        return jsonify({'success': False, 'error': 'Failed to create user'}), 500
                    
                    user_data = firebase_service.get_user(user_id)
                    logger.info(f"Created new user: {user_email}")
                else:
                    # Update last login for existing user
                    firebase_service.update_user(user_id, {
                        'last_login': firebase_service.get_server_timestamp()
                    })
                    user_data = existing_user
                    logger.info(f"Updated existing user login: {user_email}")
                
                # Set session information with user data
                session['user_id'] = user_id
                session['user_email'] = user_email
                session['user_name'] = user_data.get('username', user_name)
                session['user_picture'] = user_data.get('profile_picture', user_picture)
                session['is_admin'] = user_data.get('is_admin', False)
                session['authenticated'] = True
                
                return jsonify({
                    'success': True,
                    'user': {
                        'uid': user_id,
                        'email': user_email,
                        'username': user_data.get('username'),
                        'display_name': user_data.get('display_name'),
                        'profile_picture': user_data.get('profile_picture'),
                        'is_admin': user_data.get('is_admin', False),
                        'xp': user_data.get('xp', 0),
                        'level': user_data.get('level', 1),
                        'pycoins': user_data.get('pycoins', 0),
                        'streak': user_data.get('streak', 0)
                    }
                })
                
            except Exception as e:
                logger.error(f"Error managing user data: {str(e)}")
                # Still set basic session even if user data fails
                session['user_id'] = user_id
                session['user_email'] = user_email
                session['user_name'] = user_name
                session['user_picture'] = user_picture
                session['is_admin'] = False
                session['authenticated'] = True
                
                return jsonify({'success': True, 'warning': 'User data sync failed'})
        else:
            # Firebase not available, set basic session
            session['user_id'] = user_id
            session['user_email'] = user_email
            session['user_name'] = user_name
            session['user_picture'] = user_picture
            session['is_admin'] = False
            session['authenticated'] = True
            
            return jsonify({'success': True, 'warning': 'Firebase unavailable'})
        
    except Exception as e:
        logger.error(f"Session login error: {str(e)}")
        return jsonify({'success': False, 'error': 'Authentication failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Clear user session"""
    try:
        user_email = session.get('user_email', 'unknown')
        session.clear()
        logger.info(f"User logged out: {user_email}")
        return jsonify({'success': True, 'message': 'Logged out successfully'})
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'success': False, 'error': 'Logout failed'}), 500

@auth_bp.route('/status')
def auth_status():
    """Get current authentication status"""
    try:
        if session.get('authenticated'):
            user_id = session.get('user_id')
            firebase_service = get_firebase_service()
            
            if firebase_service and user_id:
                user_data = firebase_service.get_user(user_id)
                if user_data:
                    return jsonify({
                        'authenticated': True,
                        'user': {
                            'uid': user_id,
                            'email': session.get('user_email'),
                            'username': user_data.get('username'),
                            'display_name': user_data.get('display_name'),
                            'profile_picture': user_data.get('profile_picture'),
                            'is_admin': user_data.get('is_admin', False),
                            'xp': user_data.get('xp', 0),
                            'level': user_data.get('level', 1),
                            'pycoins': user_data.get('pycoins', 0),
                            'streak': user_data.get('streak', 0)
                        }
                    })
        
        return jsonify({'authenticated': False})
        
    except Exception as e:
        logger.error(f"Auth status error: {str(e)}")
        return jsonify({'authenticated': False})
def get_user_profile():
    """Get current user profile information"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        firebase_service = get_firebase_service()
        if firebase_service and firebase_service.is_available():
            user_data = firebase_service.get_user(user_id)
            if user_data:
                # Remove sensitive data
                user_data.pop('created_at', None)
                user_data.pop('last_login', None)
                return jsonify({'success': True, 'user': user_data})
        
        # Fallback to session data
        return jsonify({
            'success': True,
            'user': {
                'uid': session.get('user_id'),
                'email': session.get('user_email'),
                'username': session.get('user_name'),
                'picture': session.get('user_picture'),
                'xp': session.get('user_xp', 0),
                'pycoins': session.get('user_pycoins', 0),
                'level': session.get('user_level', 1),
                'is_admin': session.get('is_admin', False)
            }
        })
        
    except Exception as e:
        logger.error(f"Get user profile error: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get profile'}), 500

@auth_bp.route('/api/user/update', methods=['POST'])
def update_user_profile():
    """Update user profile information"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        # Allow only safe fields to be updated
        allowed_fields = ['username', 'theme']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        if not update_data:
            return jsonify({'success': False, 'error': 'No valid fields to update'}), 400
        
        firebase_service = get_firebase_service()
        if firebase_service and firebase_service.is_available():
            if firebase_service.update_user(user_id, update_data):
                # Update session
                if 'username' in update_data:
                    session['user_name'] = update_data['username']
                
                return jsonify({'success': True, 'message': 'Profile updated'})
            else:
                return jsonify({'success': False, 'error': 'Failed to update profile'}), 500
        else:
            return jsonify({'success': False, 'error': 'Database not available'}), 503
        
    except Exception as e:
        logger.error(f"Update user profile error: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to update profile'}), 500
def require_auth(f):
    """Decorator to require authentication"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('authenticated'):
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def require_admin(f):
    """Decorator to require admin privileges"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('authenticated'):
            return jsonify({'error': 'Authentication required'}), 401
        if not session.get('is_admin'):
            return jsonify({'error': 'Admin privileges required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def get_current_user_from_session() -> Optional[Dict[str, Any]]:
    """Get current user from session"""
    if not session.get('authenticated'):
        return None
    
    user_id = session.get('user_id')
    if not user_id:
        return None
    
    try:
        firebase_service = get_firebase_service()
        if firebase_service and firebase_service.is_available():
            return firebase_service.get_user(user_id)
        return None
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}")
        return None

@auth_bp.route('/test')
def auth_test():
    """Simple test endpoint to verify auth blueprint is working"""
    return jsonify({'message': 'Auth blueprint is working!', 'status': 'ok'})
