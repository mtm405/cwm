#!/usr/bin/env python3
"""
API Test Suite for Code with Morais Platform
Tests all endpoints to ensure functionality
"""

import requests
import json
import time

BASE_URL = "http://localhost:8080"

def test_endpoint(endpoint, method="GET", data=None, expected_status=200):
    """Test a single API endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        
        status = response.status_code
        success = status == expected_status
        
        print(f"{'✅' if success else '❌'} {method} {endpoint} - Status: {status}")
        
        if not success:
            print(f"   Expected: {expected_status}, Got: {status}")
            if response.text:
                print(f"   Response: {response.text[:200]}...")
        
        return success, response
        
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {str(e)}")
        return False, None

def main():
    """Run all API tests"""
    print("🚀 Starting Code with Morais API Test Suite")
    print("=" * 50)
    
    # Wait for server to start
    print("⏳ Waiting for server to start...")
    time.sleep(3)
    
    tests = [
        # Basic health check
        ("/health", "GET", None, 200),
        
        # Main pages
        ("/", "GET", None, 200),
        ("/lessons", "GET", None, 200),
        ("/dashboard", "GET", None, 200),
        
        # Lesson API
        ("/api/lessons", "GET", None, 200),
        ("/api/lessons/python-basics-variables", "GET", None, 200),
        ("/api/categories", "GET", None, 200),
        ("/api/search?q=python", "GET", None, 200),
        
        # Dashboard API (will return 401 without auth, which is expected)
        ("/api/dashboard/stats", "GET", None, 401),
        ("/api/dashboard/exam-objectives", "GET", None, 401),
        ("/api/dashboard/leaderboard", "GET", None, 200),  # Leaderboard is public
        
        # Theme API
        ("/api/update-theme", "POST", {"theme": "dark"}, 200),
    ]
    
    passed = 0
    total = len(tests)
    
    print(f"\n📋 Running {total} tests...")
    print("-" * 50)
    
    for endpoint, method, data, expected_status in tests:
        success, response = test_endpoint(endpoint, method, data, expected_status)
        if success:
            passed += 1
    
    print("-" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Platform is ready for deployment!")
    else:
        print(f"⚠️  {total - passed} tests failed. Please check the errors above.")
    
    print("\n🔗 Access URLs:")
    print(f"   Local: {BASE_URL}")
    print(f"   Network: http://192.168.3.170:8080")
    print(f"   Production: https://dev.codewithmorais.com")

if __name__ == "__main__":
    main()
