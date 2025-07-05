"""
Flask Auth Token Fix Integration
Add this to your main Flask app to enable comprehensive auth debugging
"""

from flask import Flask, request, session, jsonify, g
import logging
from debug_auth_token import integrate_auth_debugger, AuthTokenDebugger

# Add this to your main Flask app file (app.py)

def setup_auth_debugging(app):
    """Setup comprehensive auth debugging for Flask app"""
    
    # Enable debug logging
    logging.basicConfig(level=logging.DEBUG)
    logger = logging.getLogger(__name__)
    
    # Create debugger instance
    auth_debugger = AuthTokenDebugger(app)
    
    # Integrate debug routes
    integrate_auth_debugger(app)
    
    @app.route('/api/auth/status')
    def auth_status():
        """Get current auth status"""
        token, source = auth_debugger.get_unified_token()
        user = session.get('current_user') or g.get('current_user')
        
        return jsonify({
            'authenticated': bool(token and user),
            'has_token': bool(token),
            'token_source': source,
            'has_user': bool(user),
            'user_id': user.get('id') if user else None,
            'session_id': request.cookies.get('session'),
            'debug_mode': app.debug
        })
    
    @app.route('/api/auth/validate', methods=['POST'])
    def validate_auth():
        """Validate current authentication"""
        token, source = auth_debugger.get_unified_token()
        
        if not token:
            return jsonify({
                'valid': False,
                'reason': 'No token found',
                'debug_info': auth_debugger.generate_debug_report() if app.debug else None
            }), 401
        
        # Add your token validation logic here
        # For now, just check if token exists
        try:
            # Example validation - replace with your actual validation
            if len(token) > 10:  # Basic check
                return jsonify({
                    'valid': True,
                    'token_source': source,
                    'expires_at': None  # Add expiry if available
                })
            else:
                return jsonify({
                    'valid': False,
                    'reason': 'Invalid token format'
                }), 401
                
        except Exception as e:
            return jsonify({
                'valid': False,
                'reason': str(e),
                'debug_info': auth_debugger.generate_debug_report() if app.debug else None
            }), 401
    
    @app.route('/api/auth/refresh', methods=['POST'])
    def refresh_auth():
        """Refresh authentication token"""
        try:
            # Check if user has a session but no token
            user = session.get('current_user')
            if user and not auth_debugger.get_unified_token()[0]:
                # Generate new token (implement your token generation logic)
                new_token = generate_new_token(user)  # You need to implement this
                session['auth_token'] = new_token
                
                return jsonify({
                    'success': True,
                    'message': 'Token refreshed successfully'
                })
            else:
                return jsonify({
                    'success': False,
                    'message': 'No user session found'
                }), 401
                
        except Exception as e:
            return jsonify({
                'success': False,
                'message': str(e)
            }), 500
    
    @app.before_request
    def before_request_auth_check():
        """Check auth state before each request"""
        # Skip for debug and static routes
        if request.path.startswith('/debug/') or request.path.startswith('/static/'):
            return
        
        token, source = auth_debugger.get_unified_token()
        user = session.get('current_user')
        
        # Store in g for use in templates and other functions
        g.auth_token = token
        g.auth_token_source = source
        g.current_user = user
        g.is_authenticated = bool(token and user)
        
        # Log inconsistent states
        if user and not token:
            logger.warning(f"User session without token on {request.path}")
        elif token and not user:
            logger.warning(f"Token without user session on {request.path}")
    
    @app.context_processor
    def inject_auth_data():
        """Inject auth data into templates"""
        return {
            'is_authenticated': g.get('is_authenticated', False),
            'current_user': g.get('current_user'),
            'auth_token_source': g.get('auth_token_source'),
            'debug_mode': app.debug
        }
    
    print("✅ Auth debugging setup complete")
    print("📝 Available debug endpoints:")
    print("  - /debug/auth-comprehensive - Full debug report")
    print("  - /debug/auth-token-fix - Auto-fix token issues")
    print("  - /debug/auth-monitor-data - Data for client monitor")
    print("  - /api/auth/status - Current auth status")
    print("  - /api/auth/validate - Validate token")
    print("  - /api/auth/refresh - Refresh token")


def generate_new_token(user):
    """
    Generate a new authentication token
    Replace this with your actual token generation logic
    """
    import uuid
    import time
    
    # This is a placeholder - implement your actual token generation
    # For Firebase, you might use Firebase Admin SDK
    # For JWT, you might use PyJWT
    
    token_data = {
        'user_id': user.get('id'),
        'issued_at': time.time(),
        'session_id': str(uuid.uuid4())
    }
    
    # For demo purposes, just return a UUID
    # In production, use proper token generation
    return str(uuid.uuid4())


# Add this to your main app initialization
if __name__ == '__main__':
    app = Flask(__name__)
    
    # Your existing app configuration
    app.config['SECRET_KEY'] = 'your-secret-key-here'
    app.config['DEBUG'] = True
    
    # Setup auth debugging
    setup_auth_debugging(app)
    
    # Your existing routes and setup
    
    app.run(debug=True)
