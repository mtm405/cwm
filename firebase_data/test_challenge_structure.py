#!/usr/bin/env python3
"""
Quick test for the daily challenge fix
"""
import json
import os

def test_challenge_structure():
    """Test the fixed challenge structure"""
    try:
        # Load the fixed challenges
        script_dir = os.path.dirname(os.path.abspath(__file__))
        challenges_file = os.path.join(script_dir, 'fixed_daily_challenges.json')
        
        print("🧪 Testing Fixed Challenge Structure")
        print("=" * 50)
        
        with open(challenges_file, 'r') as f:
            data = json.load(f)
        
        challenges = data['daily_challenges']
        
        # Test today's challenge (July 5, 2025)
        today_challenge = challenges.get('2025-07-05')
        
        if not today_challenge:
            print("❌ No challenge found for today (2025-07-05)")
            return False
        
        print("✅ Found today's challenge!")
        print(f"   Title: {today_challenge.get('title', 'MISSING')}")
        print(f"   Type: {today_challenge.get('type', 'MISSING')}")
        print(f"   Difficulty: {today_challenge.get('difficulty', 'MISSING')}")
        print(f"   Estimated time: {today_challenge.get('estimated_time', 'MISSING')} mins")
        print(f"   XP reward: {today_challenge.get('xp_reward', 'MISSING')}")
        print(f"   Coin reward: {today_challenge.get('coin_reward', 'MISSING')}")
        
        # Check content structure
        content = today_challenge.get('content', {})
        print(f"   Has content: {'content' in today_challenge}")
        print(f"   Has instructions: {'instructions' in content}")
        print(f"   Has initial_code: {'initial_code' in content}")
        
        # Check required fields
        required_fields = ['id', 'type', 'estimated_time', 'content', 'xp_reward', 'coin_reward']
        missing_fields = []
        
        for field in required_fields:
            if field not in today_challenge:
                missing_fields.append(field)
        
        if missing_fields:
            print(f"❌ Missing required fields: {missing_fields}")
            return False
        else:
            print("✅ All required fields present!")
        
        # Test content structure
        content_fields = ['instructions', 'initial_code']
        missing_content = []
        
        for field in content_fields:
            if field not in content:
                missing_content.append(field)
        
        if missing_content:
            print(f"❌ Missing content fields: {missing_content}")
            return False
        else:
            print("✅ All content fields present!")
        
        print("\n🎉 Challenge structure test PASSED!")
        print("💡 This structure should fix the 'undefined' errors.")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

if __name__ == '__main__':
    test_challenge_structure()
