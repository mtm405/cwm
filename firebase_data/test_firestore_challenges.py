#!/usr/bin/env python3
"""
Test script to verify Daily Challenges are in Firestore
"""
import sys
import os
from datetime import datetime

# Add project root to path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, project_root)

def test_firestore_challenges():
    """Test if challenges are properly stored in Firestore"""
    try:
        # Initialize the Flask app to get Firebase service
        from app import create_app
        
        app = create_app()
        
        with app.app_context():
            from services.firebase_service import get_firebase_service
            
            firebase_service = get_firebase_service()
            if not firebase_service or not firebase_service.is_available():
                print("❌ Firebase service not available")
                return False
            
            print("🔍 Testing Firestore Daily Challenges")
            print("=" * 50)
            
            # Test 1: Check if daily_challenges collection exists and has documents
            print("\n1. Checking daily_challenges collection...")
            
            try:
                challenges_ref = firebase_service.db.collection('daily_challenges')
                all_challenges = list(challenges_ref.stream())
                
                print(f"   Found {len(all_challenges)} challenges in Firestore")
                
                if all_challenges:
                    print("   ✅ Collection exists and has data")
                    
                    # Show first few challenges
                    for i, doc in enumerate(all_challenges[:3]):
                        challenge_data = doc.to_dict()
                        print(f"   📅 {doc.id}: {challenge_data.get('title', 'No title')}")
                        print(f"      Type: {challenge_data.get('type', 'MISSING')}")
                        print(f"      Difficulty: {challenge_data.get('difficulty', 'MISSING')}")
                else:
                    print("   ❌ Collection is empty or doesn't exist")
                    return False
                    
            except Exception as e:
                print(f"   ❌ Error accessing collection: {str(e)}")
                return False
            
            # Test 2: Check today's specific challenge
            today = datetime.now().strftime('%Y-%m-%d')
            print(f"\n2. Looking for today's challenge ({today})...")
            
            try:
                # Method 1: Direct document access
                challenge_ref = firebase_service.db.collection('daily_challenges').document(today)
                challenge_doc = challenge_ref.get()
                
                if challenge_doc.exists:
                    challenge_data = challenge_doc.to_dict()
                    print("   ✅ Found today's challenge via direct access!")
                    print(f"      Title: {challenge_data.get('title', 'No title')}")
                    print(f"      Type: {challenge_data.get('type', 'MISSING')}")
                    print(f"      ID: {challenge_doc.id}")
                    
                    # Test the firebase service method
                    service_challenge = firebase_service.get_daily_challenge(today)
                    if service_challenge:
                        print("   ✅ Firebase service method also works!")
                    else:
                        print("   ⚠️  Firebase service method failed")
                        
                    return True
                else:
                    print(f"   ❌ No challenge found for {today}")
                    
                    # Try to find any challenge close to today
                    print("   🔍 Looking for challenges near today...")
                    for doc in all_challenges:
                        doc_id = doc.id
                        print(f"      Available: {doc_id}")
                    
                    return False
                    
            except Exception as e:
                print(f"   ❌ Error getting today's challenge: {str(e)}")
                return False
                
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_api_endpoint():
    """Test the challenge API endpoint"""
    try:
        print("\n3. Testing API endpoint...")
        
        # Import the Flask app
        from app import create_app
        
        app = create_app()
        
        with app.test_client() as client:
            response = client.get('/api/challenges/daily')
            
            print(f"   Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.get_json()
                print(f"   Success: {data.get('success', False)}")
                
                if data.get('success'):
                    challenge = data.get('challenge', {})
                    print("   ✅ API returned challenge successfully!")
                    print(f"      Title: {challenge.get('title', 'No title')}")
                    print(f"      Type: {challenge.get('type', 'MISSING')}")
                    print(f"      Source: {'Firestore' if challenge.get('id', '').startswith('challenge-') else 'Fallback'}")
                    return True
                else:
                    print(f"   ❌ API returned success=False: {data.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"   ❌ API request failed")
                print(f"      Response: {response.get_data(as_text=True)}")
                return False
                
    except Exception as e:
        print(f"   ❌ API test failed: {str(e)}")
        return False

if __name__ == '__main__':
    print("🧪 Testing Daily Challenge Firestore Integration")
    print("=" * 60)
    
    # Test Firestore access
    firestore_success = test_firestore_challenges()
    
    # Test API endpoint
    api_success = test_api_endpoint()
    
    print("\n" + "=" * 60)
    print("📋 Test Results:")
    print(f"   Firestore Access: {'✅ PASS' if firestore_success else '❌ FAIL'}")
    print(f"   API Endpoint: {'✅ PASS' if api_success else '❌ FAIL'}")
    
    if firestore_success and api_success:
        print("\n🎉 All tests passed! Daily Challenge should work correctly.")
    else:
        print("\n⚠️  Some tests failed. Daily Challenge may not work properly.")
        if not firestore_success:
            print("💡 Try uploading challenges: python firebase_data/simple_fix_challenges.py")
        if not api_success:
            print("💡 Check Flask app configuration and Firebase connection.")
