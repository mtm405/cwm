#!/usr/bin/env python3
"""
Test script for Daily Challenge feature
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from config import get_config

def test_daily_challenge():
    """Test the daily challenge functionality"""
    print("🧪 Testing Daily Challenge Feature")
    print("=" * 50)
    
    # Create Flask app
    app = create_app()
    
    with app.test_client() as client:
        # Test 1: Get daily challenge
        print("\n1. Testing daily challenge API...")
        response = client.get('/api/challenges/daily')
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.get_json()
            print(f"   Success: {data.get('success', False)}")
            if data.get('success'):
                challenge = data.get('challenge', {})
                print(f"   Challenge ID: {challenge.get('id', 'N/A')}")
                print(f"   Challenge Title: {challenge.get('title', 'N/A')}")
                print(f"   Challenge Type: {challenge.get('type', 'N/A')}")
                print(f"   XP Reward: {challenge.get('xp_reward', 'N/A')}")
                print(f"   Coin Reward: {challenge.get('coin_reward', 'N/A')}")
                print("   ✅ Daily challenge loaded successfully!")
            else:
                print(f"   ❌ API returned success=False: {data.get('error', 'Unknown error')}")
        else:
            print(f"   ❌ API request failed with status {response.status_code}")
            
        # Test 2: Test code execution
        print("\n2. Testing code execution API...")
        test_code = """
print("Hello, World!")
print(2 + 2)
"""
        
        response = client.post('/api/challenges/run-code', 
                              json={'code': test_code, 'language': 'python'},
                              headers={'Content-Type': 'application/json'})
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.get_json()
            print(f"   Success: {data.get('success', False)}")
            if data.get('success'):
                print(f"   Output: {repr(data.get('output', ''))}")
                print("   ✅ Code execution works!")
            else:
                print(f"   ❌ Code execution failed: {data.get('error', 'Unknown error')}")
        else:
            print(f"   ❌ Code execution API failed with status {response.status_code}")
        
        # Test 3: Test dashboard page
        print("\n3. Testing dashboard page...")
        response = client.get('/dashboard')
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            print("   ✅ Dashboard loads successfully!")
            if b'Daily Challenge' in response.data:
                print("   ✅ Daily Challenge section found on dashboard!")
            else:
                print("   ⚠️  Daily Challenge section not found in dashboard HTML")
        else:
            print(f"   ❌ Dashboard failed to load with status {response.status_code}")
    
    print("\n" + "=" * 50)
    print("🎯 Daily Challenge Test Complete!")
    print("If you see ✅ for most tests, the feature is working!")
    print("If you see ❌ errors, check the console output above.")

if __name__ == '__main__':
    test_daily_challenge()
