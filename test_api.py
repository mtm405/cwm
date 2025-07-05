#!/usr/bin/env python3
"""
Simple Daily Challenge API Test
"""
import requests
import json
from datetime import datetime

def test_daily_challenge_api():
    """Test the daily challenge API endpoint"""
    try:
        # Test the API endpoint
        url = "http://localhost:8080/api/challenges/daily"
        
        print("🧪 Testing Daily Challenge API")
        print("=" * 40)
        print(f"Testing URL: {url}")
        
        response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response received: {json.dumps(data, indent=2)}")
            
            if data.get('success'):
                challenge = data.get('challenge', {})
                print("\n✅ API Test Results:")
                print(f"   Success: {data.get('success')}")
                print(f"   Challenge ID: {challenge.get('id', 'N/A')}")
                print(f"   Title: {challenge.get('title', 'N/A')}")
                print(f"   Type: {challenge.get('type', 'N/A')}")
                print(f"   Difficulty: {challenge.get('difficulty', 'N/A')}")
                print(f"   Estimated Time: {challenge.get('estimated_time', 'N/A')}")
                print(f"   XP Reward: {challenge.get('xp_reward', 'N/A')}")
                print(f"   Coin Reward: {challenge.get('coin_reward', 'N/A')}")
                
                # Check if it's from Firestore or fallback
                # Firestore challenges have these additional fields
                if challenge.get('active_date') or challenge.get('expiration_date') or challenge.get('hints') or challenge.get('solution'):
                    print("   Source: ✅ Firestore")
                else:
                    print("   Source: ⚠️  Fallback")
                
                return True
            else:
                print(f"❌ API returned error: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ API request failed with status: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Error text: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - Flask app may not be running")
        print("💡 Start the Flask app with: python app.py")
        return False
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

if __name__ == '__main__':
    success = test_daily_challenge_api()
    
    if success:
        print("\n🎉 Daily Challenge API is working correctly!")
    else:
        print("\n⚠️  Daily Challenge API needs attention.")
        print("\n🔧 Next steps:")
        print("1. Start Flask app: python app.py")
        print("2. Upload challenges: python firebase_data/simple_fix_challenges.py")
        print("3. Check Firebase configuration")
