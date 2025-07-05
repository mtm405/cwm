#!/usr/bin/env python3
"""
Simple test for Daily Challenge API endpoints
"""
import requests
import json

def test_daily_challenge_simple():
    """Test basic daily challenge functionality"""
    print("🧪 Testing Daily Challenge Feature (Simple)")
    print("=" * 50)
    
    # Test the daily challenge API endpoint
    base_url = "http://localhost:5000"
    
    try:
        print("\n1. Testing daily challenge API endpoint...")
        response = requests.get(f"{base_url}/api/challenges/daily", timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Success: {data.get('success', False)}")
            if data.get('success'):
                challenge = data.get('challenge', {})
                print(f"   Challenge ID: {challenge.get('id', 'N/A')}")
                print(f"   Challenge Title: {challenge.get('title', 'N/A')}")
                print(f"   Challenge Type: {challenge.get('type', 'N/A')}")
                print(f"   XP Reward: {challenge.get('xp_reward', 'N/A')}")
                print(f"   Coin Reward: {challenge.get('coin_reward', 'N/A')}")
                print("   ✅ Daily challenge API works!")
            else:
                print(f"   ❌ API returned success=False: {data.get('error', 'Unknown error')}")
        else:
            print(f"   ❌ API request failed with status {response.status_code}")
    
    except requests.exceptions.ConnectionError:
        print("   ❌ Connection failed - Flask server not running")
        print("   💡 Start the Flask server first: python app.py")
    except Exception as e:
        print(f"   ❌ Test failed: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🎯 Test Complete!")
    print("If you see ✅, the Daily Challenge API is working!")
    print("If you see ❌, check the error messages above.")

if __name__ == '__main__':
    test_daily_challenge_simple()
