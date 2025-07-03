"""
Firebase connection status check utility
"""
import logging
from flask import Blueprint, jsonify, current_app
from config import get_config

logger = logging.getLogger(__name__)
firebase_check_bp = Blueprint('firebase_check', __name__, url_prefix='/api')

@firebase_check_bp.route('/firebase-status')
def check_firebase_status():
    """Check Firebase connection status and availability"""
    try:
        # Get Firebase service from app config
        firebase_service = current_app.config.get('firebase_service')
        
        # Check if Firebase service exists and is available
        if not firebase_service:
            return jsonify({
                'firebase_available': False,
                'status': 'unavailable',
                'message': 'Firebase service is not initialized',
                'dev_mode': get_config().DEV_MODE
            })
        
        # Check if Firebase is available (has a valid DB connection)
        is_available = firebase_service.is_available()
        
        if is_available:
            # Try to fetch a test document to verify connectivity
            try:
                # Test connection by reading from lessons collection
                test_result = firebase_service.db.collection('lessons').limit(1).get()
                connected = True  # If we get here, connection is working
                
                # If connected, provide frontend config
                if connected:
                    # Get frontend Firebase config (public keys only)
                    frontend_config = {
                        'apiKey': 'your-web-api-key',  # TODO: Get from Firebase console - Web app config
                        'authDomain': 'code-with-morais-405.firebaseapp.com',
                        'projectId': 'code-with-morais-405',
                        'storageBucket': 'code-with-morais-405.appspot.com',
                        'messagingSenderId': '114488945232289439046',
                        'appId': '1:114488945232289439046:web:your-web-app-id'  # TODO: Get from Firebase console
                    }
                    
                    return jsonify({
                        'firebase_available': True,
                        'status': 'connected',
                        'message': 'Firebase service is connected and working',
                        'config': frontend_config,
                        'dev_mode': get_config().DEV_MODE
                    })
                else:
                    return jsonify({
                        'firebase_available': False,
                        'status': 'connection_failed',
                        'message': 'Firebase is initialized but connection test failed',
                        'dev_mode': get_config().DEV_MODE
                    })
                    
            except Exception as e:
                logger.error(f"Error testing Firebase connection: {str(e)}")
                return jsonify({
                    'firebase_available': False,
                    'status': 'error',
                    'message': f'Firebase connection test failed: {str(e)}',
                    'dev_mode': get_config().DEV_MODE
                })
        else:
            return jsonify({
                'firebase_available': False,
                'status': 'error',
                'message': 'Firebase service is initialized but not available',
                'dev_mode': get_config().DEV_MODE
            })
            
    except Exception as e:
        logger.error(f"Error checking Firebase status: {str(e)}")
        return jsonify({
            'firebase_available': False,
            'status': 'error',
            'message': f'Error checking Firebase status: {str(e)}',
            'dev_mode': get_config().DEV_MODE
        }), 500

@firebase_check_bp.route('/firebase-config')
def get_firebase_config():
    """Get Firebase configuration for frontend (public keys only)"""
    try:
        # Check if Firebase service is available
        firebase_service = current_app.config.get('firebase_service')
        
        if not firebase_service or not firebase_service.is_available():
            return jsonify({
                'error': 'Firebase not available',
                'config': None
            }), 503
        
        # Return frontend-safe Firebase config
        frontend_config = {
            'apiKey': 'your-web-api-key',  # TODO: Replace with actual API key from Firebase console
            'authDomain': 'code-with-morais-405.firebaseapp.com',
            'projectId': 'code-with-morais-405',
            'storageBucket': 'code-with-morais-405.appspot.com',
            'messagingSenderId': '114488945232289439046',
            'appId': '1:114488945232289439046:web:your-web-app-id'
        }
        
        return jsonify(frontend_config)
        
    except Exception as e:
        logger.error(f"Error getting Firebase config: {str(e)}")
        return jsonify({
            'error': 'Failed to get Firebase config',
            'config': None
        }), 500
