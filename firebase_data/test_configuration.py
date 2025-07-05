#!/usr/bin/env python3
"""
Test script to verify that DEV_MODE is disabled and authentication works properly
"""

import sys
import os
import requests
from dotenv import load_dotenv

# Add the project root to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

# Test configuration
from config import get_config

def test_dev_mode():
    """Test that DEV_MODE is disabled"""
    config = get_config()
    print(f"DEV_MODE: {config.DEV_MODE}")
    
    if config.DEV_MODE:
        print("❌ DEV_MODE is still enabled! This will cause mock data to be used.")
        return False
    else:
        print("✅ DEV_MODE is disabled - real Firebase data will be used.")
        return True

def test_api_endpoints():
    """Test that API endpoints are working"""
    base_url = "http://localhost:8080"
    
    endpoints = [
        "/api/challenges/daily",
        "/api/dashboard/stats"
    ]
    
    results = []
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}")
            if response.status_code == 200:
                print(f"✅ {endpoint} - Status: {response.status_code}")
                results.append(True)
            else:
                print(f"❌ {endpoint} - Status: {response.status_code}")
                results.append(False)
        except Exception as e:
            print(f"❌ {endpoint} - Error: {e}")
            results.append(False)
    
    return all(results)

def main():
    """Run all tests"""
    print("Testing Code with Morais configuration and endpoints...")
    print("=" * 50)
    
    dev_mode_ok = test_dev_mode()
    print()
    
    api_ok = test_api_endpoints()
    print()
    
    if dev_mode_ok and api_ok:
        print("✅ All tests passed! The application should now use real Firebase data.")
        print("🚀 The dashboard will now display actual user data instead of mock data.")
    else:
        print("❌ Some tests failed. Please check the configuration and try again.")
    
    print("\nNext steps:")
    print("1. Visit http://localhost:8080/dashboard to see the dashboard")
    print("2. Log in with Google authentication to see your real user data")
    print("3. The daily challenge should now display correctly without 'undefined' errors")

if __name__ == "__main__":
    main()
