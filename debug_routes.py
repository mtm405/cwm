#!/usr/bin/env python3
"""
Debug Flask routes for Code with Morais
"""
import requests
import sys
import os

# Add the current directory to the path to import our modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def list_routes():
    """List all registered routes"""
    try:
        from app import app
        
        print("🔍 Registered Flask Routes:")
        print("=" * 50)
        
        with app.app_context():
            for rule in app.url_map.iter_rules():
                methods = ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
                print(f"{rule.endpoint:30} {methods:15} {rule.rule}")
        
        print("\n" + "=" * 50)
        
    except Exception as e:
        print(f"Error listing routes: {e}")

def test_auth_endpoints():
    """Test authentication endpoints"""
    print("\n🔐 Testing Auth Endpoints:")
    print("=" * 50)
    
    base_url = "http://localhost:8080"
    
    endpoints_to_test = [
        "/auth/status",
        "/auth/sessionLogin", 
        "/auth/logout",
        "/status",
        "/sessionLogin",
        "/logout"
    ]
    
    for endpoint in endpoints_to_test:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            print(f"✅ {endpoint:20} -> {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {endpoint:20} -> {str(e)}")

if __name__ == "__main__":
    list_routes()
    test_auth_endpoints()
