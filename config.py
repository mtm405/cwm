"""
Configuration settings for Code with Morais
"""
import os
import logging
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class."""
    
    # Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEV_MODE = os.environ.get('DEV_MODE', 'True').lower() == 'true'
    
    # Firebase Configuration
    FIREBASE_CONFIG = {
        "type": os.environ.get('FIREBASE_TYPE', 'service_account'),
        "project_id": os.environ.get('FIREBASE_PROJECT_ID'),
        "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID'),
        "private_key": os.environ.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
        "client_email": os.environ.get('FIREBASE_CLIENT_EMAIL'),
        "client_id": os.environ.get('FIREBASE_CLIENT_ID'),
        "auth_uri": os.environ.get('FIREBASE_AUTH_URI', 'https://accounts.google.com/o/oauth2/auth'),
        "token_uri": os.environ.get('FIREBASE_TOKEN_URI', 'https://oauth2.googleapis.com/token'),
        "auth_provider_x509_cert_url": os.environ.get('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
        "client_x509_cert_url": os.environ.get('FIREBASE_CLIENT_X509_CERT_URL'),
        "universe_domain": os.environ.get('FIREBASE_UNIVERSE_DOMAIN', 'googleapis.com')
    }
    
    # External Services
    PISTON_API_URL = os.environ.get('PISTON_API_URL', 'https://emkc.org/api/v2/piston')
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = os.environ.get('LOG_FILE', 'app.log')
    
    # Application Settings
    MAX_CODE_LENGTH = 10000  # Maximum characters for code submission
    MAX_XP_PER_ACTION = 1000  # Maximum XP that can be earned in one action
    SESSION_TIMEOUT = 3600  # Session timeout in seconds
    
    @classmethod
    def validate_firebase_config(cls) -> bool:
        """Validate that all required Firebase configuration is present."""
        required_fields = [
            'project_id', 'private_key_id', 'private_key', 
            'client_email', 'client_id'
        ]
        
        for field in required_fields:
            if not cls.FIREBASE_CONFIG.get(field):
                return False
        return True

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    DEV_MODE = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    DEV_MODE = False
    
    @classmethod
    def validate(cls):
        """Validate production configuration."""
        if not cls.validate_firebase_config():
            raise ValueError("Firebase configuration is incomplete for production")
        
        if cls.SECRET_KEY == 'dev-secret-key-change-in-production':
            raise ValueError("SECRET_KEY must be changed for production")

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEV_MODE = True
    
def get_config() -> Config:
    """Get configuration based on environment."""
    env = os.environ.get('FLASK_ENV', 'development').lower()
    
    if env == 'production':
        config = ProductionConfig()
        config.validate()
        return config
    elif env == 'testing':
        return TestingConfig()
    else:
        return DevelopmentConfig()

def setup_logging(config: Config):
    """Set up application logging."""
    log_level = getattr(logging, config.LOG_LEVEL.upper(), logging.INFO)
    
    # Create formatters
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_formatter = logging.Formatter(
        '%(levelname)s: %(message)s'
    )
    
    # Set up file handler
    file_handler = logging.FileHandler(config.LOG_FILE)
    file_handler.setLevel(log_level)
    file_handler.setFormatter(file_formatter)
    
    # Set up console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(log_level)
    console_handler.setFormatter(console_formatter)
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        handlers=[file_handler, console_handler]
    )
    
    # Suppress noisy loggers in development
    if config.DEV_MODE:
        logging.getLogger('werkzeug').setLevel(logging.WARNING)
        logging.getLogger('urllib3').setLevel(logging.WARNING)

# Legacy support - remove in Phase 2
SECRET_KEY = Config.SECRET_KEY
DEV_MODE = Config.DEV_MODE
