#!/usr/bin/env python3
"""
Direct Firebase test without Flask
"""
import sys
import os
from datetime import datetime

# Add project root to path
project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, project_root)

def test_direct_firebase():
    """Test Firebase directly"""
    try:
        print("🔍 Testing Firebase directly...")
        
        import firebase_admin
        from firebase_admin import credentials, firestore
        from config import get_config
        
        # Get the config
        config = get_config()
        
        # Initialize Firebase Admin SDK
        if not firebase_admin._apps:
            # Try to get credential path
            cred_path = config.FIREBASE_CREDENTIALS_PATH
            if cred_path and os.path.exists(cred_path):
                print(f"✅ Using Firebase credentials from: {cred_path}")
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            else:
                print("❌ Firebase credentials not found")
                return False
        
        # Get Firestore database
        db = firestore.client()
        print("✅ Connected to Firestore")
        
        # Check daily_challenges collection
        challenges_ref = db.collection('daily_challenges')
        challenges = list(challenges_ref.stream())
        
        print(f"📊 Found {len(challenges)} challenges in Firestore")
        
        if challenges:
            print("\n📋 Challenge list:")
            for i, doc in enumerate(challenges):
                challenge_data = doc.to_dict()
                print(f"   {i+1}. {doc.id}")
                print(f"      Title: {challenge_data.get('title', 'No title')}")
                print(f"      Type: {challenge_data.get('type', 'MISSING')}")
                print(f"      Difficulty: {challenge_data.get('difficulty', 'MISSING')}")
                print(f"      Estimated Time: {challenge_data.get('estimated_time', 'MISSING')}")
                print()
            
            # Test for today's challenge
            today = datetime.now().strftime('%Y-%m-%d')
            print(f"🗓️  Checking for today's challenge ({today})...")
            
            today_ref = db.collection('daily_challenges').document(today)
            today_doc = today_ref.get()
            
            if today_doc.exists:
                print("✅ Found today's challenge!")
                data = today_doc.to_dict()
                print(f"   Title: {data.get('title', 'No title')}")
                print(f"   Type: {data.get('type', 'MISSING')}")
            else:
                print("❌ No challenge found for today")
                print("Available dates:")
                for doc in challenges:
                    print(f"   - {doc.id}")
            
            return True
        else:
            print("❌ No challenges found")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("🧪 Direct Firebase Test")
    print("=" * 40)
    
    success = test_direct_firebase()
    
    if success:
        print("\n🎉 Firebase connection and challenges are working!")
    else:
        print("\n⚠️  Firebase connection or challenges need fixing.")
