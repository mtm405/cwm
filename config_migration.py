"""
config_migration.py - Migration script for config.py to config/settings.py

This file helps transition from the old config.py in the root directory
to the new config package structure. It imports from the new location
but maintains backward compatibility.

Usage:
    1. Replace imports in your code:
       from config_migration import get_config, setup_logging, Config
       
    2. After all files are updated, you can import directly from config:
       from config import get_config, setup_logging, Config
"""
import warnings

# Import from the new location
from config import get_config, setup_logging, Config

# Show deprecation warning
warnings.warn(
    "Importing from config_migration.py is deprecated. "
    "Please update your imports to use 'from config import ...' instead.",
    DeprecationWarning,
    stacklevel=2
)

# For backward compatibility
SECRET_KEY = Config.SECRET_KEY
DEV_MODE = Config.DEV_MODE

# Export all symbols from config
__all__ = ['get_config', 'setup_logging', 'Config', 'SECRET_KEY', 'DEV_MODE']
