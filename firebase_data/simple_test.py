#!/usr/bin/env python3
"""
Simple test to check if daily challenges are in Firestore
"""
import sys
import os

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

def simple_test():
    """Simple test of daily challenges"""
    try:
        print("🔍 Simple Daily Challenge Test")
        print("=" * 40)
        
        # Test Firebase service directly
        from services.firebase_service import FirebaseService
        
        firebase_service = FirebaseService()
        
        if not firebase_service.is_available():
            print("❌ Firebase service not available")
            return False
        
        print("✅ Firebase service is available")
        
        # Get all challenges
        challenges_ref = firebase_service.db.collection('daily_challenges')
        all_challenges = list(challenges_ref.stream())
        
        print(f"📊 Found {len(all_challenges)} challenges in Firestore")
        
        if all_challenges:
            print("\n📋 First few challenges:")
            for i, doc in enumerate(all_challenges[:3]):
                challenge_data = doc.to_dict()
                print(f"   {i+1}. {doc.id}")
                print(f"      Title: {challenge_data.get('title', 'No title')}")
                print(f"      Type: {challenge_data.get('type', 'MISSING')}")
                print(f"      Difficulty: {challenge_data.get('difficulty', 'MISSING')}")
                print(f"      Estimated Time: {challenge_data.get('estimated_time', 'MISSING')}")
                print()
            
            # Test getting today's challenge
            from datetime import datetime
            today = datetime.now().strftime('%Y-%m-%d')
            print(f"🗓️  Looking for today's challenge ({today})...")
            
            today_challenge = firebase_service.get_daily_challenge(today)
            if today_challenge:
                print("✅ Found today's challenge!")
                print(f"   Title: {today_challenge.get('title', 'No title')}")
                print(f"   Type: {today_challenge.get('type', 'MISSING')}")
            else:
                print("❌ No challenge found for today")
                print("Available dates:")
                for doc in all_challenges:
                    print(f"   - {doc.id}")
            
            return True
        else:
            print("❌ No challenges found in Firestore")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = simple_test()
    if success:
        print("\n🎉 Daily challenges are properly configured!")
    else:
        print("\n⚠️  Daily challenges need to be fixed.")
