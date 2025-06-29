#!/usr/bin/env python3
"""
Test auth blueprint directly
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from routes.auth_routes import auth_bp
    print("✅ Auth blueprint imported successfully")
    
    # Check blueprint routes
    print(f"Blueprint name: {auth_bp.name}")
    print(f"Blueprint url_prefix: {auth_bp.url_prefix}")
    
    # List blueprint routes
    print("Blueprint routes:")
    for rule in auth_bp.url_map.iter_rules():
        print(f"  {rule.endpoint} -> {rule.rule} [{', '.join(rule.methods)}]")
        
except Exception as e:
    print(f"❌ Error importing auth blueprint: {e}")
    import traceback
    traceback.print_exc()
