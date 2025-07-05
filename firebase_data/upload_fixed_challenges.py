#!/usr/bin/env python3
"""
Upload fixed daily challenges with correct data structure
"""
import json
import os
import sys
from datetime import datetime

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def upload_fixed_challenges():
    """Upload the fixed daily challenges to Firebase"""
    try:
        # Import Firebase service - adjust path for script location
        import sys
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        sys.path.insert(0, project_root)
        
        from services.firebase_service import get_firebase_service
        
        firebase_service = get_firebase_service()
        if not firebase_service or not firebase_service.is_available():
            print("❌ Firebase service not available")
            return False
        
        # Load the fixed challenges
        script_dir = os.path.dirname(os.path.abspath(__file__))
        challenges_file = os.path.join(script_dir, 'fixed_daily_challenges.json')
        
        with open(challenges_file, 'r') as f:
            data = json.load(f)
        
        challenges = data['daily_challenges']
        
        print(f"🚀 Uploading {len(challenges)} fixed daily challenges...")
        print("=" * 60)
        
        uploaded_count = 0
        
        for date_str, challenge_data in challenges.items():
            try:
                # Upload to Firebase using the date as document ID
                challenge_ref = firebase_service.db.collection('daily_challenges').document(date_str)
                challenge_ref.set(challenge_data)
                
                print(f"✅ Uploaded challenge for {date_str}: {challenge_data['title']}")
                print(f"   Type: {challenge_data['type']}")
                print(f"   Difficulty: {challenge_data['difficulty']}")
                print(f"   Time: {challenge_data['estimated_time']} mins")
                print(f"   XP: {challenge_data['xp_reward']}, Coins: {challenge_data['coin_reward']}")
                print()
                
                uploaded_count += 1
                
            except Exception as e:
                print(f"❌ Failed to upload challenge for {date_str}: {str(e)}")
        
        print("=" * 60)
        print(f"🎯 Upload complete! {uploaded_count}/{len(challenges)} challenges uploaded successfully.")
        
        if uploaded_count == len(challenges):
            print("✅ All challenges uploaded successfully!")
            print("🎮 The Daily Challenge feature should now work correctly.")
        else:
            print("⚠️  Some challenges failed to upload. Check the errors above.")
        
        return uploaded_count == len(challenges)
        
    except Exception as e:
        print(f"❌ Upload failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_challenge_loading():
    """Test loading today's challenge after upload"""
    try:
        import sys
        import os
        script_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(script_dir)
        sys.path.insert(0, project_root)
        
        from services.firebase_service import get_firebase_service
        from datetime import datetime
        
        firebase_service = get_firebase_service()
        if not firebase_service or not firebase_service.is_available():
            print("❌ Firebase service not available for testing")
            return False
        
        # Try to load today's challenge
        today = datetime.now().strftime('%Y-%m-%d')
        challenge = firebase_service.get_daily_challenge(today)
        
        print(f"\n🧪 Testing challenge loading for {today}...")
        
        if challenge:
            print("✅ Challenge loaded successfully!")
            print(f"   Title: {challenge.get('title', 'N/A')}")
            print(f"   Type: {challenge.get('type', 'N/A')}")
            print(f"   Difficulty: {challenge.get('difficulty', 'N/A')}")
            print(f"   Estimated time: {challenge.get('estimated_time', 'N/A')} mins")
            print(f"   Has content: {'content' in challenge}")
            
            content = challenge.get('content', {})
            if content:
                print(f"   Has initial code: {'initial_code' in content}")
                print(f"   Has instructions: {'instructions' in content}")
            
            return True
        else:
            print(f"❌ No challenge found for {today}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

if __name__ == '__main__':
    print("🔧 Fixing Daily Challenge Data Structure")
    print("=" * 60)
    
    # Upload fixed challenges
    upload_success = upload_fixed_challenges()
    
    if upload_success:
        # Test loading
        test_challenge_loading()
        
        print("\n" + "=" * 60)
        print("🎉 Daily Challenge fix complete!")
        print("💡 Try accessing the dashboard to see the working challenge.")
        print("🔗 Go to: http://localhost:5000/dashboard")
    else:
        print("\n❌ Fix failed. Check the errors above.")
