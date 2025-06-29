#!/usr/bin/env python3
"""
Pre-deployment validation script for Code with Morais
Ensures all critical components are working before deployment
"""
import os
import sys
import time
import requests
import subprocess
from datetime import datetime

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def check_environment_variables():
    """Check if all required environment variables are set"""
    print("🔍 Checking Environment Variables...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = [
        'SECRET_KEY',
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_CLIENT_ID'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.environ.get(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("📝 Create .env file from .env.example and add your credentials")
        return False
    
    print("✅ All required environment variables are set")
    return True

def check_firebase_connection():
    """Test Firebase connection"""
    print("🔥 Testing Firebase Connection...")
    
    try:
        from config import get_config
        from services.firebase_service import FirebaseService
        
        config = get_config()
        firebase_service = FirebaseService(config.FIREBASE_CONFIG)
        
        if firebase_service.is_available():
            print("✅ Firebase connection successful")
            return True
        else:
            print("❌ Firebase connection failed")
            return False
    except Exception as e:
        print(f"❌ Firebase connection error: {str(e)}")
        return False

def check_activity_model():
    """Test the fixed activity model"""
    print("📊 Testing Activity Model...")
    
    try:
        from models.activity import get_recent_activity, track_activity
        
        # Test with no Firebase (should return mock data)
        activities = get_recent_activity('test-user', 5)
        
        if len(activities) > 0:
            print(f"✅ Activity model working - returned {len(activities)} activities")
            return True
        else:
            print("❌ Activity model not returning data")
            return False
    except Exception as e:
        print(f"❌ Activity model error: {str(e)}")
        return False

def test_app_import():
    """Test that the main app can be imported without errors"""
    print("🐍 Testing App Import...")
    
    try:
        from app import app
        print("✅ Main app imports successfully")
        return True
    except Exception as e:
        print(f"❌ App import error: {str(e)}")
        return False

def test_routes_import():
    """Test that all route blueprints can be imported"""
    print("🛣️ Testing Route Imports...")
    
    try:
        from routes.main_routes import main_bp
        from routes.auth_routes import auth_bp
        from routes.lesson_routes import lesson_bp
        from routes.dashboard_api import dashboard_api_bp
        from routes.lesson_api import lesson_api_bp
        print("✅ All route blueprints import successfully")
        return True
    except Exception as e:
        print(f"❌ Route import error: {str(e)}")
        return False

def test_security_config():
    """Test security configuration"""
    print("🔒 Testing Security Configuration...")
    
    try:
        from config import get_config
        config = get_config()
        
        # Check if SECRET_KEY is not the default
        if config.SECRET_KEY == 'dev-secret-key-change-in-production':
            print("⚠️ WARNING: Using default SECRET_KEY - change this for production!")
            return False
        
        print("✅ Security configuration looks good")
        return True
    except Exception as e:
        print(f"❌ Security config error: {str(e)}")
        return False

def check_required_files():
    """Check if all required files exist"""
    print("📁 Checking Required Files...")
    
    required_files = [
        'app.py',
        'config.py',
        'requirements.txt',
        'cloudflare-tunnel.yml',
        '.env.example'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing required files: {', '.join(missing_files)}")
        return False
    
    print("✅ All required files present")
    return True

def run_basic_functionality_test():
    """Start the app and test basic endpoints"""
    print("🧪 Running Basic Functionality Test...")
    
    try:
        # Start the app in background
        print("   Starting Flask app...")
        
        # Try to test if app can start by importing and checking routes
        from app import app
        
        with app.test_client() as client:
            # Test main routes
            response = client.get('/')
            if response.status_code == 200:
                print("   ✅ Index page loads")
            else:
                print(f"   ❌ Index page failed: {response.status_code}")
                return False
            
            # Test dashboard (should redirect to index if no session)
            response = client.get('/dashboard')
            if response.status_code in [200, 302]:  # 302 is redirect, which is expected
                print("   ✅ Dashboard accessible")
            else:
                print(f"   ❌ Dashboard failed: {response.status_code}")
                return False
            
            # Test API endpoint
            response = client.get('/api/lessons')
            if response.status_code == 200:
                print("   ✅ Lessons API works")
            else:
                print(f"   ❌ Lessons API failed: {response.status_code}")
                return False
        
        print("✅ Basic functionality test passed")
        return True
        
    except Exception as e:
        print(f"❌ Functionality test error: {str(e)}")
        return False

def main():
    """Run all pre-deployment checks"""
    print("🚀 Code with Morais - Pre-Deployment Validation")
    print("=" * 60)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Environment Variables", check_environment_variables),
        ("Required Files", check_required_files),
        ("App Import", test_app_import),
        ("Route Imports", test_routes_import),
        ("Activity Model", check_activity_model),
        ("Firebase Connection", check_firebase_connection),
        ("Security Config", test_security_config),
        ("Basic Functionality", run_basic_functionality_test)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        print("-" * 40)
        
        try:
            if test_func():
                passed += 1
            else:
                print(f"❌ {test_name} failed")
        except Exception as e:
            print(f"❌ {test_name} crashed: {str(e)}")
    
    print("\n" + "=" * 60)
    print(f"📊 VALIDATION RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED - READY FOR DEPLOYMENT!")
        print("\n🚀 Next steps:")
        print("1. Copy .env.example to .env and add your credentials")
        print("2. Run: python app.py")
        print("3. Run: cloudflared tunnel --config cloudflare-tunnel.yml run")
        print("4. Access: https://dev.codewithmorais.com")
        return True
    else:
        print("⚠️ DEPLOYMENT NOT READY - Fix the failed tests first")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
