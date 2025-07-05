#!/usr/bin/env python3
"""
Quick Firebase check
"""
import sys
import os

# Add project root to path
sys.path.append('.')

try:
    from services.firebase_service import FirebaseService
    
    print("1. Creating Firebase service...")
    fs = FirebaseService()
    
    print("2. Checking availability...")
    available = fs.is_available()
    print(f"   Firebase available: {available}")
    
    if available:
        print("3. Getting challenges...")
        challenges = list(fs.db.collection('daily_challenges').stream())
        print(f"   Challenges count: {len(challenges)}")
        
        if challenges:
            print("4. Sample challenges:")
            for i, doc in enumerate(challenges[:2]):
                data = doc.to_dict()
                print(f"   - {doc.id}: {data.get('title', 'No title')}")
        else:
            print("4. No challenges found")
    else:
        print("3. Firebase not available")
        
except Exception as e:
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()

print("Done.")
