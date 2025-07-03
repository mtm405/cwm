#!/usr/bin/env python
"""
Config Migration Helper Script

This script helps with the migration from config.py to the config package.
It provides commands to check migration status, scan for old imports,
and mark modules as migrated.

Usage:
    python migrate_config.py status     # Show migration status
    python migrate_config.py scan       # Scan for old imports
    python migrate_config.py migrate <module_name>   # Mark module as migrated
    python migrate_config.py unmigrate <module_name> # Mark module as not migrated
"""
import sys
import os
from pathlib import Path
import argparse

# Add parent directory to path so we can import config_migration
sys.path.insert(0, str(Path(__file__).parent))

from config_migration import (
    get_migration_report, 
    print_migration_report,
    migrate_module, 
    scan_for_config_imports,
    print_import_report
)

def main():
    parser = argparse.ArgumentParser(description="Config migration helper")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Show migration status")
    
    # Scan command
    scan_parser = subparsers.add_parser("scan", help="Scan for old imports")
    
    # Migrate command
    migrate_parser = subparsers.add_parser("migrate", help="Mark module as migrated")
    migrate_parser.add_argument("module", help="Module name to mark as migrated")
    
    # Unmigrate command
    unmigrate_parser = subparsers.add_parser("unmigrate", help="Mark module as not migrated")
    unmigrate_parser.add_argument("module", help="Module name to mark as not migrated")
    
    args = parser.parse_args()
    
    if args.command == "status":
        print_migration_report()
    elif args.command == "scan":
        print_import_report()
    elif args.command == "migrate":
        migrate_module(args.module, True)
        print(f"Module {args.module} marked as migrated")
    elif args.command == "unmigrate":
        migrate_module(args.module, False)
        print(f"Module {args.module} marked as not migrated")
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
