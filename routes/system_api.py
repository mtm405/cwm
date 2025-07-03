"""
System API - Backend system-level operations and monitoring
Provides endpoints for system status, health checks, and system management
"""
from flask import Blueprint, jsonify, request, current_app
import platform
import psutil
import os
import sys
import logging
from datetime import datetime
import time

logger = logging.getLogger(__name__)
system_api_bp = Blueprint('system_api', __name__, url_prefix='/api/system')

# System startup time
STARTUP_TIME = datetime.now()

@system_api_bp.route('/status', methods=['GET'])
def system_status():
    """Get comprehensive system status information"""
    try:
        # Basic app info
        app_info = {
            'name': 'Code with Morais',
            'version': current_app.config.get('APP_VERSION', '1.0.0'),
            'environment': current_app.config.get('ENV', 'production'),
            'debug_mode': current_app.config.get('DEBUG', False),
            'uptime_seconds': (datetime.now() - STARTUP_TIME).total_seconds(),
            'python_version': sys.version,
            'platform': platform.platform()
        }
        
        # System resources
        system_resources = {
            'cpu_usage': psutil.cpu_percent(interval=0.1),
            'memory_usage': dict(psutil.virtual_memory()._asdict()),
            'disk_usage': dict(psutil.disk_usage('/')._asdict())
        }
        
        # Service status
        firebase_service = current_app.config.get('firebase_service')
        firebase_status = 'available' if firebase_service and firebase_service.is_available() else 'unavailable'
        
        services_status = {
            'firebase': firebase_status,
            'database': firebase_status,  # Using Firebase as database for now
            'authentication': firebase_status,  # Auth is through Firebase too
        }
        
        return jsonify({
            'status': 'operational',
            'timestamp': datetime.now().isoformat(),
            'app_info': app_info,
            'system_resources': system_resources,
            'services': services_status
        })
    except Exception as e:
        logger.error(f"Error getting system status: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error retrieving system status: {str(e)}",
            'timestamp': datetime.now().isoformat()
        }), 500


@system_api_bp.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint for monitoring and load balancers"""
    try:
        # Check services that are critical for operation
        firebase_service = current_app.config.get('firebase_service')
        
        # Only check firebase if we're not in dev mode
        if not current_app.config.get('DEV_MODE', False):
            if not firebase_service or not firebase_service.is_available():
                return jsonify({
                    'status': 'degraded',
                    'message': 'Firebase service unavailable',
                    'timestamp': datetime.now().isoformat()
                }), 200  # Still return 200 to prevent cascading failures
        
        # All checks passed
        return jsonify({
            'status': 'healthy',
            'message': 'All systems operational',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@system_api_bp.route('/logs', methods=['GET'])
def get_logs():
    """Get recent application logs"""
    try:
        # Check if user is authenticated and admin
        from models.user import get_current_user
        user = get_current_user()
        
        if not user or not user.get('is_admin', False):
            return jsonify({
                'status': 'error',
                'message': 'Unauthorized access',
                'timestamp': datetime.now().isoformat()
            }), 403
        
        # Log files location
        log_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'app.log')
        
        # Lines to retrieve (default 100, max 1000)
        lines = min(int(request.args.get('lines', 100)), 1000)
        
        if os.path.exists(log_file):
            with open(log_file, 'r') as f:
                # Get the last 'lines' lines
                recent_logs = ''.join(f.readlines()[-lines:])
                
            return jsonify({
                'status': 'success',
                'log_file': log_file,
                'lines': lines,
                'logs': recent_logs,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Log file not found',
                'timestamp': datetime.now().isoformat()
            }), 404
    except Exception as e:
        logger.error(f"Error retrieving logs: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500


@system_api_bp.route('/js-errors', methods=['POST'])
def log_js_error():
    """Log JavaScript errors from client-side"""
    try:
        error_data = request.json
        
        if not error_data:
            return jsonify({
                'status': 'error',
                'message': 'No error data provided',
                'timestamp': datetime.now().isoformat()
            }), 400
            
        # Add timestamp and log the error
        error_data['server_timestamp'] = datetime.now().isoformat()
        
        # Log error to server logs
        logger.error(f"Client-side error: {error_data.get('message')} | "
                    f"URL: {error_data.get('url')} | "
                    f"Line: {error_data.get('line')} | "
                    f"Column: {error_data.get('column')} | "
                    f"Stack: {error_data.get('stack')}")
        
        # Optionally store in Firebase
        firebase_service = current_app.config.get('firebase_service')
        if firebase_service and firebase_service.is_available():
            try:
                firebase_service.db.collection('js_errors').add(error_data)
            except Exception as e:
                logger.error(f"Failed to store JS error in Firebase: {str(e)}")
        
        return jsonify({
            'status': 'success',
            'message': 'Error logged successfully',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error logging client error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500
