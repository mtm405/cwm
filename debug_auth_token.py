"""
Auth Token Debug Script
Comprehensive debugging for Flask auth token issues
"""

import logging
from flask import session, request, g, jsonify
from datetime import datetime, timedelta
import json

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class AuthTokenDebugger:
    """Debug auth token storage and retrieval issues"""
    
    def __init__(self, app):
        self.app = app
        self.debug_log = []
        
    def log_debug(self, message, data=None):
        """Log debug message with timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = {
            'time': timestamp,
            'message': message,
            'data': data
        }
        self.debug_log.append(log_entry)
        logger.debug(f"[{timestamp}] {message}: {data}")
        
    def check_token_storage(self):
        """Check all possible token storage locations"""
        storage_check = {
            'session': {},
            'cookies': {},
            'headers': {},
            'localStorage_hints': []
        }
        
        # Check session
        if 'auth_token' in session:
            storage_check['session']['auth_token'] = session['auth_token'][:20] + '...'
        
        # Check alternative session keys
        session_keys = ['cwm_user_token', 'token', 'access_token', 'firebase_token']
        for key in session_keys:
            if key in session:
                storage_check['session'][key] = session[key][:20] + '...'
        
        # Check cookies
        cookie_keys = ['auth_token', 'cwm_user_token', 'session', 'token']
        for key in cookie_keys:
            if key in request.cookies:
                storage_check['cookies'][key] = request.cookies[key][:20] + '...'
        
        # Check headers
        auth_header = request.headers.get('Authorization')
        if auth_header:
            storage_check['headers']['Authorization'] = auth_header[:30] + '...'
        
        # Check for custom headers
        custom_headers = ['X-Auth-Token', 'X-Access-Token', 'X-Firebase-Token']
        for header in custom_headers:
            if header in request.headers:
                storage_check['headers'][header] = request.headers[header][:20] + '...'
        
        self.log_debug("Token storage check", storage_check)
        return storage_check
    
    def get_unified_token(self):
        """Try to get token from all possible sources"""
        token_sources = [
            ('session:auth_token', lambda: session.get('auth_token')),
            ('session:cwm_user_token', lambda: session.get('cwm_user_token')),
            ('cookie:auth_token', lambda: request.cookies.get('auth_token')),
            ('cookie:cwm_user_token', lambda: request.cookies.get('cwm_user_token')),
            ('header:Authorization', lambda: request.headers.get('Authorization', '').replace('Bearer ', '')),
            ('header:X-Auth-Token', lambda: request.headers.get('X-Auth-Token')),
        ]
        
        for source_name, get_token_func in token_sources:
            try:
                token = get_token_func()
                if token:
                    self.log_debug(f"Token found in {source_name}", token[:20] + '...')
                    return token, source_name
            except Exception as e:
                self.log_debug(f"Error checking {source_name}", str(e))
        
        self.log_debug("No token found in any source", None)
        return None, None
    
    def verify_session_config(self):
        """Check Flask session configuration"""
        session_config = {
            'SECRET_KEY': bool(self.app.config.get('SECRET_KEY')),
            'SESSION_TYPE': self.app.config.get('SESSION_TYPE', 'default'),
            'SESSION_PERMANENT': self.app.config.get('SESSION_PERMANENT', False),
            'SESSION_USE_SIGNER': self.app.config.get('SESSION_USE_SIGNER', True),
            'SESSION_COOKIE_SECURE': self.app.config.get('SESSION_COOKIE_SECURE', False),
            'SESSION_COOKIE_HTTPONLY': self.app.config.get('SESSION_COOKIE_HTTPONLY', True),
            'SESSION_COOKIE_SAMESITE': self.app.config.get('SESSION_COOKIE_SAMESITE', 'Lax'),
        }
        
        self.log_debug("Session configuration", session_config)
        return session_config
    
    def trace_auth_flow(self):
        """Trace the authentication flow"""
        flow_data = {
            'current_user': bool(g.get('current_user')),
            'session_keys': list(session.keys()),
            'session_id': request.cookies.get('session'),
            'user_agent': request.headers.get('User-Agent', '')[:50] + '...',
            'referer': request.headers.get('Referer', ''),
            'request_path': request.path,
            'request_method': request.method,
        }
        
        self.log_debug("Auth flow trace", flow_data)
        return flow_data
    
    def generate_debug_report(self):
        """Generate comprehensive debug report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'token_storage': self.check_token_storage(),
            'unified_token': self.get_unified_token(),
            'session_config': self.verify_session_config(),
            'auth_flow': self.trace_auth_flow(),
            'debug_log': self.debug_log[-10:],  # Last 10 entries
        }
        
        return report


def setup_auth_debug_routes(app):
    """Setup debug routes for auth token debugging"""
    
    debugger = AuthTokenDebugger(app)
    
    @app.route('/debug/auth-comprehensive')
    def debug_auth_comprehensive():
        """Comprehensive auth debug endpoint"""
        return jsonify(debugger.generate_debug_report())
    
    @app.route('/debug/auth-token-fix')
    def debug_auth_token_fix():
        """Try to fix common auth token issues"""
        fixes_applied = []
        
        # Fix 1: Check for token in alternative locations
        token, source = debugger.get_unified_token()
        if token and source != 'session:auth_token':
            session['auth_token'] = token
            fixes_applied.append(f"Copied token from {source} to session:auth_token")
        
        # Fix 2: Check for user data without token
        if 'current_user' in session and not session.get('auth_token'):
            # Generate a temporary token or flag for re-authentication
            session['needs_reauth'] = True
            fixes_applied.append("Flagged for re-authentication due to missing token")
        
        # Fix 3: Clear inconsistent session data
        if session.get('auth_token') and not session.get('current_user'):
            session.clear()
            fixes_applied.append("Cleared inconsistent session data")
        
        return jsonify({
            'fixes_applied': fixes_applied,
            'debug_report': debugger.generate_debug_report()
        })
    
    @app.route('/debug/auth-monitor-data')
    def debug_auth_monitor_data():
        """Provide data for the auth monitor"""
        token, source = debugger.get_unified_token()
        
        return jsonify({
            'has_token': bool(token),
            'token_source': source,
            'token_preview': token[:20] + '...' if token else None,
            'session_active': bool(session.get('current_user')),
            'recommendations': get_auth_recommendations(token, session.get('current_user'))
        })
    
    @app.before_request
    def monitor_auth_requests():
        """Monitor auth state on every request"""
        if request.path.startswith('/debug/'):
            return  # Skip debug routes
        
        token, source = debugger.get_unified_token()
        g.auth_token = token
        g.auth_token_source = source
        g.has_auth_token = bool(token)
        
        # Log auth state for debugging
        if not token and session.get('current_user'):
            logger.warning(f"User session without token on {request.path}")


def get_auth_recommendations(token, user):
    """Get recommendations based on auth state"""
    recommendations = []
    
    if user and not token:
        recommendations.append("User found but no token - check token storage/generation")
    
    if token and not user:
        recommendations.append("Token found but no user - verify token and load user data")
    
    if not token and not user:
        recommendations.append("No auth data found - user needs to login")
    
    return recommendations


# Flask app integration example
def integrate_auth_debugger(app):
    """Integrate the auth debugger with your Flask app"""
    
    # Setup debug routes
    setup_auth_debug_routes(app)
    
    # Add error handlers
    @app.errorhandler(401)
    def handle_unauthorized(error):
        debugger = AuthTokenDebugger(app)
        debug_data = debugger.generate_debug_report()
        
        # Log the unauthorized access attempt
        logger.warning(f"Unauthorized access attempt: {debug_data}")
        
        return jsonify({
            'error': 'Unauthorized',
            'debug_data': debug_data if app.debug else None
        }), 401
    
    print("✅ Auth debugger integrated successfully")
    print("📝 Available debug endpoints:")
    print("  - /debug/auth-comprehensive")
    print("  - /debug/auth-token-fix")
    print("  - /debug/auth-monitor-data")
