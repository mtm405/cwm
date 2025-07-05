"""
Authentication routes for Code with Morais
Handles Google OAuth authentication and user sessions
"""
import os
import jwt
import datetime
from flask import Blueprint, request, jsonify, session, current_app, render_template
from firebase_admin import auth as firebase_auth
import logging
from typing import Optional, Dict, Any
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

# Get Firebase service from app context
def get_firebase_service():
    return current_app.config.get('firebase_service')

def generate_jwt_token(user_id: str, user_email: str, user_data: Dict[str, Any]) -> str:
    """Generate a JWT token for the user"""
    try:
        secret_key = current_app.config.get('SECRET_KEY', 'fallback-secret-key')
        
        payload = {
            'sub': user_id,  # Subject (user ID)
            'email': user_email,
            'name': user_data.get('display_name', user_data.get('username', user_email)),
            'picture': user_data.get('profile_picture', ''),
            'given_name': user_data.get('display_name', '').split(' ')[0] if user_data.get('display_name') else '',
            'family_name': ' '.join(user_data.get('display_name', '').split(' ')[1:]) if user_data.get('display_name') and len(user_data.get('display_name', '').split(' ')) > 1 else '',
            'is_admin': user_data.get('is_admin', False),
            'xp': user_data.get('xp', 0),
            'level': user_data.get('level', 1),
            'iat': datetime.datetime.utcnow(),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)  # Token expires in 7 days
        }
        
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        logger.info(f"Generated JWT token for user: {user_email}")
        return token
        
    except Exception as e:
        logger.error(f"Error generating JWT token: {str(e)}")
        return None

def verify_google_token(id_token_str: str) -> Optional[Dict[str, Any]]:
    """Verify Google OAuth ID token using the google-auth library."""
    try:
        request = google_requests.Request()
        expected_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        
        id_info = id_token.verify_oauth2_token(
            id_token_str, request, expected_client_id)
        
        logger.info(f"Google token verified successfully for user: {id_info.get('email')}")
        return id_info
        
    except ValueError as e:
        # Token is invalid
        logger.error(f"Google token verification failed: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"An unexpected error occurred during token verification: {str(e)}")
        return None

def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode a JWT token"""
    try:
        secret_key = current_app.config.get('SECRET_KEY', 'fallback-secret-key')
        
        # Decode and verify the token
        payload = jwt.decode(token, secret_key, algorithms=['HS256'])
        
        # Check if token is expired
        if 'exp' in payload:
            exp_timestamp = payload['exp']
            if isinstance(exp_timestamp, datetime.datetime):
                exp_timestamp = exp_timestamp.timestamp()
            
            if exp_timestamp < datetime.datetime.utcnow().timestamp():
                logger.warning("JWT token is expired")
                return None
        
        logger.info(f"JWT token verified successfully for user: {payload.get('email')}")
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("JWT token is expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid JWT token: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Error verifying JWT token: {str(e)}")
        return None

@auth_bp.route('/google/callback', methods=['POST'])
def google_callback():
    """Handle Google OAuth callback and create user session"""
    try:
        data = request.get_json()
        if not data or 'token' not in data:
            logger.error("No ID token provided in request")
            return jsonify({'success': False, 'error': 'ID token required'}), 400
        
        id_token = data['token']
        logger.info(f"Received ID token for verification (length: {len(id_token)})")
        
        # Verify the ID token with Google OAuth
        logger.info("Attempting to verify ID token with Google OAuth API")
        token_info = verify_google_token(id_token)
        
        if not token_info:
            logger.error("Google token verification failed")
            return jsonify({'success': False, 'error': 'Invalid token'}), 401
        
        logger.info("Google token verification successful")
        
        # Extract user information from Google token
        user_id = token_info.get('sub')
        user_email = token_info.get('email')
        user_name = token_info.get('name', user_email)
        user_picture = token_info.get('picture', '')
        email_verified = token_info.get('email_verified', 'false') == 'true'
        
        logger.info(f"Token verified successfully - User: {user_email}, Google ID: {user_id}")
        
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
                    
                    # Retry getting user data after creation (handle eventual consistency)
                    user_data = None
                    import time
                    for attempt in range(3):
                        user_data = firebase_service.get_user(user_id)
                        if user_data:
                            break
                        time.sleep(0.1)  # Small delay for Firestore consistency
                    
                    if not user_data:
                        logger.warning(f"User created but not immediately retrievable: {user_id}")
                        # Still proceed with basic user info
                        user_data = {
                            'username': user_name,
                            'display_name': user_name,
                            'profile_picture': user_picture,
                            'xp': 0,
                            'level': 1,
                            'pycoins': 100,
                            'streak': 0,
                            'is_admin': False
                        }
                    logger.info(f"Created new user: {user_email}")
                else:
                    # Update last login for existing user
                    update_data = {
                        'last_login': firebase_service.get_server_timestamp(),
                        'updated_at': firebase_service.get_server_timestamp()
                    }
                    firebase_service.update_user(user_id, update_data)
                    logger.info(f"Updated user {user_id} with {len(update_data)} fields")
                    
                    user_data = existing_user
                    logger.info(f"Updated existing user login: {user_email}")
                
                # Set session information with user data
                session['user_id'] = user_id
                session['user_email'] = user_email
                session['user_name'] = user_data.get('username', user_name)
                session['user_picture'] = user_data.get('profile_picture', user_picture)
                session['is_admin'] = user_data.get('is_admin', False)
                session['authenticated'] = True
                
                # Force session save
                session.permanent = True
                
                # Generate JWT token
                jwt_token = generate_jwt_token(user_id, user_email, user_data)
                
                response_data = {
                    'success': True,
                    'redirect_url': '/dashboard',
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
                }
                
                # Add JWT token if generated successfully
                if jwt_token:
                    response_data['token'] = jwt_token
                    response_data['user_token'] = jwt_token  # For compatibility with existing code
                    logger.info(f"JWT token included in response for user: {user_email}")
                else:
                    logger.warning(f"Failed to generate JWT token for user: {user_email}")
                
                return jsonify(response_data)
            except Exception as e:
                logger.error(f"Error managing user data: {str(e)}")
                # Still set basic session even if user data fails
                session['user_id'] = user_id
                session['user_email'] = user_email
                session['user_name'] = user_name
                session['user_picture'] = user_picture
                session['is_admin'] = False
                session['authenticated'] = True
                session.permanent = True
                
                # Generate fallback JWT token with basic data
                basic_user_data = {
                    'username': user_name,
                    'display_name': user_name,
                    'profile_picture': user_picture,
                    'is_admin': False,
                    'xp': 0,
                    'level': 1
                }
                jwt_token = generate_jwt_token(user_id, user_email, basic_user_data)
                
                response = {
                    'success': True, 
                    'redirect_url': '/dashboard',
                    'warning': 'User data sync failed'
                }
                
                if jwt_token:
                    response['token'] = jwt_token
                    response['user_token'] = jwt_token
                
                return jsonify(response)
        else:
            # Firebase not available, set basic session
            session['user_id'] = user_id
            session['user_email'] = user_email
            session['user_name'] = user_name
            session['user_picture'] = user_picture
            session['is_admin'] = False
            session['authenticated'] = True
            session.permanent = True
            
            # Generate JWT token with basic data
            basic_user_data = {
                'username': user_name,
                'display_name': user_name,
                'profile_picture': user_picture,
                'is_admin': False,
                'xp': 0,
                'level': 1
            }
            jwt_token = generate_jwt_token(user_id, user_email, basic_user_data)
            
            response = {
                'success': True, 
                'redirect_url': '/dashboard',
                'warning': 'Firebase unavailable'
            }
            
            if jwt_token:
                response['token'] = jwt_token
                response['user_token'] = jwt_token
            
            return jsonify(response)
    except Exception as e:
        logger.error(f"Google callback error: {str(e)}")
        return jsonify({'success': False, 'error': 'Authentication failed'}), 500

@auth_bp.route('/sessionLogin', methods=['POST'])
def session_login():
    """Handle Google OAuth login and create user session"""
    try:
        # Placeholder implementation
        return jsonify({'success': True, 'message': 'Session login placeholder'})
    except Exception as e:
        logger.error(f"Session login error: {str(e)}")
        return jsonify({'success': False, 'error': 'Session login failed'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Clear user session"""
    try:
        # Clear the session
        session.clear()
        return jsonify({'success': True, 'message': 'Logged out successfully'})
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'success': False, 'error': 'Logout failed'}), 500

@auth_bp.route('/status')
def auth_status():
    """Get current authentication status"""
    try:
        is_authenticated = session.get('authenticated', False)
        user_id = session.get('user_id')
        
        return jsonify({
            'success': True,
            'authenticated': is_authenticated,
            'user_id': user_id,
            'user': {
                'uid': session.get('user_id'),
                'email': session.get('user_email'),
                'name': session.get('user_name'),
                'picture': session.get('user_picture'),
                'is_admin': session.get('is_admin', False)
            } if is_authenticated else None,
            'session_keys': list(session.keys())
        })
    except Exception as e:
        logger.error(f"Auth status error: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get auth status'}), 500
    except Exception as e:
        logger.error(f"Auth status error: {str(e)}")
        return jsonify({'success': False, 'error': 'Failed to get auth status'}), 500

@auth_bp.route('/api/user/profile')
def get_user_profile():
    """Get current user profile information"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'User not authenticated'}), 401
        
        firebase_service = get_firebase_service()
        if firebase_service and firebase_service.is_available():
            user_data = firebase_service.get_user(user_id)
            if user_data:
                return jsonify({
                    'success': True,
                    'user': user_data
                })
        
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
        return jsonify({'success': False, 'error': 'Failed to get user profile'}), 500

@auth_bp.route('/api/user/update', methods=['POST'])
def update_user_profile():
    """Update user profile information"""
    try:
        if not session.get('authenticated'):
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
            
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'error': 'User ID not found in session'}), 400
            
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
            
        firebase_service = get_firebase_service()
        if firebase_service and firebase_service.is_available():
            # Only allow updating certain fields
            allowed_fields = ['username', 'display_name', 'bio']
            update_data = {k: v for k, v in data.items() if k in allowed_fields}
            
            if not update_data:
                return jsonify({'success': False, 'error': 'No valid fields to update'}), 400
                
            # Add timestamp
            update_data['updated_at'] = firebase_service.get_server_timestamp()
            
            # Update the user
            success = firebase_service.update_user(user_id, update_data)
            if success:
                return jsonify({'success': True, 'message': 'Profile updated successfully'})
            else:
                return jsonify({'success': False, 'error': 'Failed to update profile'}), 500
        else:
            return jsonify({'success': False, 'error': 'Firebase service unavailable'}), 503
            
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

@auth_bp.route('/debug')
def auth_debug():
    """Debug page for authentication issues"""
    try:
        # Get current user
        from routes.main_routes import get_current_user
        user = get_current_user()
        
        # Pass essential authentication parameters
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID', '')
        
        # Get configuration from current app
        config_data = current_app.config
        
        return render_template('auth-debug.html', user=user, google_client_id=google_client_id, config=config_data)
    except Exception as e:
        logger.error(f"Error rendering auth debug page: {str(e)}")
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/validate', methods=['POST'])
def validate_token():
    """Validate a JWT token and return user information"""
    try:
        # Get token from Authorization header or request body
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        else:
            data = request.get_json()
            token = data.get('token') if data else None
        
        if not token:
            return jsonify({'success': False, 'error': 'No token provided'}), 400
        
        # Verify the token
        payload = verify_jwt_token(token)
        if not payload:
            return jsonify({'success': False, 'error': 'Invalid or expired token'}), 401
        
        # Return user information
        return jsonify({
            'success': True,
            'user': {
                'uid': payload.get('sub'),
                'email': payload.get('email'),
                'name': payload.get('name'),
                'picture': payload.get('picture'),
                'is_admin': payload.get('is_admin', False),
                'xp': payload.get('xp', 0),
                'level': payload.get('level', 1)
            }
        })
        
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        return jsonify({'success': False, 'error': 'Token validation failed'}), 500
