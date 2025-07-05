#!/usr/bin/env python3
"""
Simple script to upload fixed daily challenges
"""
import json
import os
import sys
from datetime import datetime

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

def main():
    """Main function to upload fixed challenges"""
    try:
        # Initialize the Flask app to get Firebase service
        from app import app
        
        with app.app_context():
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
            
            # Test loading today's challenge
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
                
                print("\n🎉 Daily Challenge fix complete!")
                print("💡 The challenge should now display correctly in the dashboard.")
                print("🔗 Go to: http://localhost:5000/dashboard")
                return True
            else:
                print(f"❌ No challenge found for {today}")
                return False
            
    except Exception as e:
        print(f"❌ Upload failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("🔧 Fixing Daily Challenge Data Structure")
    print("=" * 60)
    main()
