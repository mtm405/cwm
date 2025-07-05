"""
Main application file for Code with Morais
A gamified Python learning platform for teenagers
"""
import os
import logging
import re
import mimetypes
from flask import Flask, request, jsonify, render_template, flash, redirect, url_for, session, g
from flask_caching import Cache
from config import get_config, setup_logging
from services.firebase_service import FirebaseService
from flask_login import LoginManager, login_user, logout_user, current_user, login_required

# Import auth debugging
try:
    from debug_auth_token import integrate_auth_debugger, AuthTokenDebugger
    from system_auth_fix import integrate_system_auth_fix
    AUTH_DEBUG_AVAILABLE = True
except ImportError:
    AUTH_DEBUG_AVAILABLE = False
    # Will log warning after logger is set up

# CRITICAL: Fix MIME types for JavaScript modules
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('application/javascript', '.mjs')
mimetypes.add_type('text/css', '.css')

# Get configuration based on environment
config = get_config()

# Set up logging
setup_logging(config)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = config.SECRET_KEY

# Initialize auth debugger if available
if AUTH_DEBUG_AVAILABLE:
    try:
        integrate_auth_debugger(app)
        integrate_system_auth_fix(app)
        logger.info("✅ Auth debugging and fixing integrated successfully")
    except Exception as e:
        logger.warning(f"Failed to integrate auth debugging: {e}")
else:
    logger.warning("Auth debugging not available - debug_auth_token.py not found")

# Enhanced MIME type handler for ES6 modules
@app.after_request
def fix_mime_types(response):
    """Fix MIME types for static files and ES6 modules"""
    if hasattr(response, 'direct_passthrough') and response.direct_passthrough:
        return response
        
    # Fix JavaScript MIME types - critical for ES6 modules
    if response.headers.get('Content-Type') == 'application/json' and \
       any(request.path.endswith(ext) for ext in ['.js', '.mjs']):
        response.headers['Content-Type'] = 'application/javascript; charset=utf-8'
    elif request.path.endswith('.js') or request.path.endswith('.mjs'):
        response.headers['Content-Type'] = 'application/javascript; charset=utf-8'
    elif request.path.endswith('.css'):
        response.headers['Content-Type'] = 'text/css; charset=utf-8'
    
    return response

# Initialize caching
app.config.update(config.TEMPLATE_CACHE_CONFIG)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})
logger.info("Template caching initialized")

# Make cache available to templates
app.jinja_env.globals['cache'] = cache

# Add template filters
@app.template_filter('markdown')
def markdown_filter(text):
    """Simple markdown filter for basic formatting"""
    if not text:
        return ""
    
    # Simple markdown processing
    import re
    
    # Convert **bold** to <strong>
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    
    # Convert *italic* to <em>
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    
    # Convert `code` to <code>
    text = re.sub(r'`(.*?)`', r'<code>\1</code>', text)
    
    # Convert line breaks to <br>
    text = text.replace('\n', '<br>')
    
    return text

# Initialize Firebase service
firebase_service = None
try:
    # Force load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check DEV_MODE directly from environment
    dev_mode = os.environ.get('DEV_MODE', 'True').lower() == 'true'
    logger.info(f"DEV_MODE from environment: {dev_mode}")
    
    # Initialize Firebase even in dev mode for Google OAuth to work
    if config.validate_firebase_config():
        firebase_service = FirebaseService(config.FIREBASE_CONFIG)
        logger.info("Firebase service initialized successfully")
    else:
        logger.warning("Firebase configuration invalid - Google OAuth will not work")
        logger.info("Required Firebase env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, etc.")
except Exception as e:
    logger.error(f"Failed to initialize Firebase service: {str(e)}")
    firebase_service = None

# Make Firebase service available to routes
app.config['firebase_service'] = firebase_service

# Set global firebase service for backward compatibility
from services.firebase_service import set_firebase_service
set_firebase_service(firebase_service)

# Inject Firebase service into models
if firebase_service:
    from models.user import set_firebase_service as set_user_firebase_service
    from models.lesson import set_firebase_service as set_lesson_firebase_service  
    from models.quiz import set_firebase_service as set_quiz_firebase_service
    
    set_user_firebase_service(firebase_service)
    set_lesson_firebase_service(firebase_service)
    set_quiz_firebase_service(firebase_service)
    logger.info("Firebase service injected into all models")
else:
    logger.warning("Firebase service not available - models will use fallback data")

# Register blueprints with error handling
try:
    # Import and register all route blueprints
    from routes.main_routes import main_bp
    from routes.auth_routes import auth_bp
    from routes.lesson_routes import lesson_bp
    from routes.dashboard_api import dashboard_api_bp
    from routes.lesson_api import lesson_api_bp
    from routes.docs_routes import docs_bp
    from routes.firebase_check import firebase_check_bp
    from routes.system_api import system_api_bp
    from routes.recommendation_api import recommendation_api_bp
    from routes.profile_routes_api import profile_bp
    from routes.quiz_api import quiz_api
    from routes.challenge_api import challenge_api
    from routes.vocabulary_api import vocabulary_api
    from routes.user_streak_api import user_streak_api
    
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(lesson_bp)
    app.register_blueprint(dashboard_api_bp)
    app.register_blueprint(lesson_api_bp)
    app.register_blueprint(docs_bp)
    app.register_blueprint(firebase_check_bp)
    app.register_blueprint(system_api_bp)
    app.register_blueprint(recommendation_api_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(quiz_api)
    app.register_blueprint(challenge_api)
    app.register_blueprint(vocabulary_api)
    app.register_blueprint(user_streak_api)
    
    logger.info("Blueprints registered successfully")
except Exception as e:
    logger.error(f"Failed to register blueprints: {str(e)}")
    raise

# Register API route for code execution with security validation
from services.code_execution import execute_python_code

@app.route('/run_python', methods=['POST'])
def run_python():
    """Run Python code submitted by the user with security validation"""
    try:
        # Validate request
        if not request.is_json:
            logger.warning("Invalid request format - not JSON")
            return jsonify({'error': 'Request must be JSON'}), 400
        
        data = request.json
        code = data.get('code', '')
        inputs = data.get('inputs', '')
        
        # Security validation
        if len(code) > config.MAX_CODE_LENGTH:
            logger.warning(f"Code length exceeded limit: {len(code)}")
            return jsonify({'error': 'Code length exceeds maximum limit'}), 400
        
        if not code.strip():
            return jsonify({'error': 'Code cannot be empty'}), 400
        
        # Execute the code
        result = execute_python_code(code, inputs)
        
        # Log successful execution (without exposing code content)
        logger.info(f"Code execution completed - status: {result.get('status', 'unknown')}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in code execution endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Debug endpoint for Google OAuth
@app.route('/debug_google_oauth')
def debug_google_oauth():
    """Debug endpoint to check Google OAuth client ID and environment."""
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        debug_info = {
            'GOOGLE_CLIENT_ID_env': os.environ.get('GOOGLE_CLIENT_ID'),
            'GOOGLE_CLIENT_ID_length': len(os.environ.get('GOOGLE_CLIENT_ID', '')),
            'host': os.environ.get('HOST'),
            'port': os.environ.get('PORT'),
            'dev_mode': config.DEV_MODE,
            'flask_env': os.environ.get('FLASK_ENV'),
            'cwd': os.getcwd(),
            'env_file_exists': os.path.exists('.env'),
            'all_env_vars': {k: v for k, v in os.environ.items() if 'GOOGLE' in k or 'CLIENT' in k}
        }
        return jsonify(debug_info)
    except Exception as e:
        return jsonify({'error': str(e), 'type': type(e).__name__})

# Debug endpoint to check what data is being passed to the template
@app.route('/debug_template')
def debug_template():
    """Debug what the template receives for google_client_id"""
    try:
        from routes.main_routes import get_current_user
        user = get_current_user()
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        
        debug_info = {
            'google_client_id_passed_to_template': google_client_id,
            'google_client_id_length': len(google_client_id) if google_client_id else 0,
            'user': user,
            'template_context': {
                'user': user,
                'google_client_id': google_client_id
            }
        }
        return jsonify(debug_info)
    except Exception as e:
        return jsonify({'error': str(e), 'type': type(e).__name__})

# Debug endpoint to check the actual rendered HTML and see what client ID is in the data-client_id attribute
@app.route('/debug_rendered_html')
def debug_rendered_html():
    """Debug the actual rendered HTML to see the client ID in context"""
    try:
        from routes.main_routes import get_current_user
        
        user = get_current_user()
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        
        # Get a snippet of the actual rendered template
        rendered = render_template('pages/index.html', user=user, google_client_id=google_client_id)
        
        # Extract just the relevant part with the client ID
        client_id_matches = re.findall(r'data-client_id="([^"]*)"', rendered)
        
        debug_info = {
            'client_id_in_html': client_id_matches,
            'client_id_count': len(client_id_matches),
            'google_client_id_env': google_client_id,
            'html_snippet': rendered[rendered.find('data-client_id'):rendered.find('data-client_id')+200] if 'data-client_id' in rendered else 'NOT FOUND'
        }
        return jsonify(debug_info)
    except Exception as e:
        return jsonify({'error': str(e), 'type': type(e).__name__})

# Debug endpoints for troubleshooting
@app.route('/debug_firebase_status')
def debug_firebase_status():
    """Debug endpoint to check Firebase initialization status"""
    try:
        import firebase_admin
        from firebase_admin import auth as firebase_auth
        
        status = {
            'firebase_apps_initialized': len(firebase_admin._apps) > 0,
            'firebase_service_available': firebase_service is not None,
            'firebase_service_is_available': firebase_service.is_available() if firebase_service else False,
            'dev_mode': config.DEV_MODE,
            'firebase_config_valid': config.validate_firebase_config(),
            'firebase_project_id': config.FIREBASE_CONFIG.get('project_id', 'Not set'),
            'firebase_client_email': config.FIREBASE_CONFIG.get('client_email', 'Not set')
        }
        
        # Test Firebase Auth directly
        try:
            # Try to verify a dummy token to test if auth is working
            # This will fail but tells us if the service is accessible
            firebase_auth.verify_id_token("dummy_token")
        except Exception as e:
            status['firebase_auth_test_error'] = str(e)
            status['firebase_auth_error_type'] = type(e).__name__
        
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e), 'type': type(e).__name__})

@app.route('/debug/auth-test')
def debug_auth_test():
    """Debug page for comprehensive auth testing"""
    try:
        return render_template('auth-debug-test-page.html')
    except Exception as e:
        logger.error(f"Error rendering auth debug test page: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/debug_env_vars')
def debug_env_vars():
    """Debug endpoint to check environment variables (safely)"""
    try:
        env_status = {
            'DEV_MODE': os.environ.get('DEV_MODE'),
            'FLASK_ENV': os.environ.get('FLASK_ENV'),
            'GOOGLE_CLIENT_ID': os.environ.get('GOOGLE_CLIENT_ID', 'Not set'),
            'FIREBASE_PROJECT_ID': os.environ.get('FIREBASE_PROJECT_ID', 'Not set'),
            'FIREBASE_CLIENT_EMAIL': os.environ.get('FIREBASE_CLIENT_EMAIL', 'Not set'),
            'FIREBASE_PRIVATE_KEY_SET': 'Yes' if os.environ.get('FIREBASE_PRIVATE_KEY') else 'No',
            'FIREBASE_CLIENT_ID_SET': 'Yes' if os.environ.get('FIREBASE_CLIENT_ID') else 'No'
        }
        return jsonify(env_status)
    except Exception as e:
        return jsonify({'error': str(e)})

# Error handlers
@app.errorhandler(404)
def not_found(error):
    logger.info(f"404 error: {request.url}")
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"500 error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    logger.error(f"Unhandled exception: {str(e)}", exc_info=True)
    return jsonify({'error': 'An unexpected error occurred'}), 500

# Health check endpoint
@app.route('/health')
def health_check():
    """Health check endpoint for monitoring"""
    try:
        health_status = {
            'status': 'healthy',
            'dev_mode': config.DEV_MODE,
            'firebase_available': firebase_service is not None and firebase_service.is_available() if firebase_service else False,
            'timestamp': logging.time.time()
        }
        return jsonify(health_status)
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

# Favicon route to prevent 404 errors
@app.route('/favicon.ico')
def favicon():
    """Serve favicon to prevent 404 errors"""
    from flask import send_from_directory, abort
    import os
    
    favicon_path = os.path.join(app.root_path, 'static', 'favicon.ico')
    if os.path.exists(favicon_path):
        return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico')
    else:
        # Return 204 No Content to prevent browser from logging 404 error
        from flask import Response
        return Response(status=204)
        from flask import Response
        return Response(status=204)

# Security headers middleware
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    # Standard security headers
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'  # Changed from DENY to allow Google OAuth popups
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    # Fix CORS issues for Google OAuth
    response.headers['Cross-Origin-Opener-Policy'] = 'unsafe-none'
    response.headers['Cross-Origin-Embedder-Policy'] = 'unsafe-none'
    
    # Cache control for better performance
    if 'Cache-Control' not in response.headers:
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    
    if not config.DEV_MODE:
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    return response

# Template context processor to make google_client_id available globally
@app.context_processor
def inject_google_client_id():
    """Make google_client_id available to all templates"""
    return {
        'google_client_id': os.environ.get('GOOGLE_CLIENT_ID')
    }

# Debug endpoint to test token verification with a sample token
@app.route('/debug_test_token', methods=['POST'])
def debug_test_token():
    """Debug endpoint to test token verification with a sample token"""
    try:
        data = request.get_json()
        test_token = data.get('token', '') if data else ''
        
        if not test_token:
            return jsonify({'error': 'Please provide a token in the request body'}), 400
        
        logger.info(f"Testing token verification with token length: {len(test_token)}")
        
        try:
            from firebase_admin import auth as firebase_auth
            decoded_token = firebase_auth.verify_id_token(test_token)
            
            return jsonify({
                'success': True,
                'decoded_token': {
                    'uid': decoded_token.get('uid'),
                    'email': decoded_token.get('email'),
                    'name': decoded_token.get('name'),
                    'iss': decoded_token.get('iss'),
                    'aud': decoded_token.get('aud'),
                    'exp': decoded_token.get('exp'),
                    'iat': decoded_token.get('iat'),
                    'auth_time': decoded_token.get('auth_time'),
                    'firebase': decoded_token.get('firebase', {})
                }
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e),
                'error_type': type(e).__name__
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Lesson route moved to lesson_routes.py blueprint for ES6 modular system
# @app.route('/lesson/<lesson_id>')
# @login_required 
# def lesson(lesson_id):
#     # This route has been moved to routes/lesson_routes.py
#     # to support the new ES6 modular lesson system
#     pass

@app.route('/test_logout')
def test_logout_page():
    """Test page for logout functionality"""
    return render_template('test_logout.html')

@app.route('/test-interactive')
def test_interactive():
    """Test page for Interactive block debugging"""
    with open('test_interactive_debug.html', 'r', encoding='utf-8') as f:
        content = f.read()
    return content

# Main entry point
if __name__ == '__main__':
    try:
        logger.info("Starting Code with Morais application")
        logger.info(f"Environment: {'Development' if config.DEV_MODE else 'Production'}")
        logger.info(f"Firebase available: {firebase_service is not None and firebase_service.is_available() if firebase_service else False}")
        
        # Production vs Development settings
        port = int(os.environ.get('PORT', 8080))
        host = os.environ.get('HOST', '0.0.0.0')
        
        if config.DEV_MODE:
            app.run(host=host, port=port, debug=True)
        else:
            # Production settings
            app.run(host=host, port=port, debug=False, threaded=True)
            
    except Exception as e:
        logger.critical(f"Failed to start application: {str(e)}")
        raise
