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
       
    3. Track migration progress:
       from config_migration import migrate_module
       migrate_module('your_module_name')  # Mark as migrated
"""
import warnings
import os
import json
import logging
from datetime import datetime
from pathlib import Path

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

# Migration tracking
MIGRATION_FILE = os.path.join('config', 'migration_status.json')
logger = logging.getLogger(__name__)

def get_migration_status():
    """Get the current migration status of all modules."""
    if not os.path.exists(MIGRATION_FILE):
        return {}
    
    try:
        with open(MIGRATION_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"Error reading migration status file: {e}")
        return {}

def save_migration_status(status):
    """Save the migration status to the tracking file."""
    # Create config directory if it doesn't exist
    os.makedirs(os.path.dirname(MIGRATION_FILE), exist_ok=True)
    
    try:
        with open(MIGRATION_FILE, 'w') as f:
            json.dump(status, f, indent=2)
    except IOError as e:
        logger.error(f"Error writing migration status file: {e}")

def migrate_module(module_name, migrated=True):
    """
    Mark a module as migrated to the new configuration system.
    
    Args:
        module_name (str): The name of the module being migrated
        migrated (bool): Whether the module has been migrated (True) or reverted (False)
    
    Returns:
        bool: True if the operation was successful
    """
    status = get_migration_status()
    status[module_name] = {
        'migrated': migrated,
        'timestamp': datetime.now().isoformat()
    }
    save_migration_status(status)
    
    print(f"Module '{module_name}' marked as {'migrated' if migrated else 'not migrated'}")
    return True

def get_migration_report():
    """Generate a report of migration status."""
    status = get_migration_status()
    total = len(status)
    migrated = sum(1 for module in status.values() if module.get('migrated', False))
    
    report = [
        "Configuration Migration Status:",
        f"- {migrated}/{total} modules migrated ({migrated/total*100:.1f}% complete)" if total > 0 else "- No modules tracked yet",
        "\nModule Details:"
    ]
    
    for module, info in sorted(status.items()):
        status_symbol = "✅" if info.get('migrated', False) else "❌"
        timestamp = info.get('timestamp', 'N/A')
        report.append(f"- {status_symbol} {module}: {'Migrated' if info.get('migrated', False) else 'Pending'} ({timestamp})")
    
    return "\n".join(report)

def print_migration_report():
    """Print the migration report."""
    print(get_migration_report())

def scan_for_config_imports():
    """
    Scan the project for imports from the old config module.
    
    Returns:
        dict: A dictionary mapping file paths to the type of import used
    """
    results = {}
    root_dir = Path('.')
    
    # Skip these directories
    skip_dirs = {'.git', '.vscode', 'node_modules', '__pycache__', 'env', 'venv', 'dist', 'archive'}
    
    for path in root_dir.rglob('*.py'):
        # Skip directories in the skip list
        if any(part in skip_dirs for part in path.parts):
            continue
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Check for different types of imports
                has_direct_import = 'import config' in content or 'import config as' in content
                has_from_import = 'from config import' in content
                has_migration_import = 'import config_migration' in content or 'from config_migration import' in content
                
                if has_direct_import or has_from_import or has_migration_import:
                    results[str(path)] = {
                        'direct_import': has_direct_import,
                        'from_import': has_from_import,
                        'migration_import': has_migration_import
                    }
        except (UnicodeDecodeError, IOError):
            # Skip files that can't be read
            continue
    
    return results

def print_import_report():
    """Print a report of files still using old imports."""
    imports = scan_for_config_imports()
    
    if not imports:
        print("No files found with imports from config modules.")
        return
    
    print(f"Found {len(imports)} files with config imports:")
    
    for file_path, import_types in sorted(imports.items()):
        import_details = []
        if import_types.get('direct_import'):
            import_details.append("direct import")
        if import_types.get('from_import'):
            import_details.append("from import")
        if import_types.get('migration_import'):
            import_details.append("migration import")
            
        print(f"- {file_path}: {', '.join(import_details)}")

# Export all symbols from config
__all__ = ['get_config', 'setup_logging', 'Config', 'SECRET_KEY', 'DEV_MODE']

# If this file is run directly, print reports
if __name__ == "__main__":
    print_migration_report()
    print("\n" + "-"*50 + "\n")
    print_import_report()
