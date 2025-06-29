"""
Main application file for Code with Morais
A gamified Python learning platform for teenagers
"""
import os
import logging
from flask import Flask, request, jsonify, render_template
from config import get_config, setup_logging
from services.firebase_service import FirebaseService

# Get configuration based on environment
config = get_config()

# Set up logging
setup_logging(config)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = config.SECRET_KEY

# Initialize Firebase service
firebase_service = None
try:
    # Force load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Initialize Firebase for Google OAuth to work
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
    from routes.main_routes import main_bp
    from routes.lesson_routes import lesson_bp
    from routes.lesson_api import lesson_api_bp
    from routes.dashboard_api import dashboard_api_bp
    from routes.auth_routes import auth_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(lesson_bp)
    app.register_blueprint(lesson_api_bp)
    app.register_blueprint(dashboard_api_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    logger.info("Blueprints registered successfully (including auth)")
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
        rendered = render_template('index.html', user=user, google_client_id=google_client_id)
        
        # Extract just the relevant part with the client ID
        import re
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

@app.route('/debug_env_vars')
def debug_env_vars():
    """Debug endpoint to check environment variables (safely)"""
    try:
        env_status = {
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
            'firebase_available': firebase_service is not None and firebase_service.is_available() if firebase_service else False,
            'timestamp': logging.time.time()
        }
        return jsonify(health_status)
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

# Security headers middleware
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    
    if os.environ.get('FLASK_ENV') == 'production':
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

# Main entry point
if __name__ == '__main__':
    try:
        logger.info("Starting Code with Morais application")
        logger.info(f"Environment: {os.environ.get('FLASK_ENV', 'development')}")
        logger.info(f"Firebase available: {firebase_service is not None and firebase_service.is_available() if firebase_service else False}")
        
        # Production vs Development settings
        port = int(os.environ.get('PORT', 8080))
        host = os.environ.get('HOST', '0.0.0.0')
        
        if os.environ.get('FLASK_ENV') == 'development':
            app.run(host=host, port=port, debug=True)
        else:
            # Production settings
            app.run(host=host, port=port, debug=False, threaded=True)
            
    except Exception as e:
        logger.critical(f"Failed to start application: {str(e)}")
        raise
