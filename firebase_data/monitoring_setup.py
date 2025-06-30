#!/usr/bin/env python3
"""
Firebase Monitoring & Health Check Script
Run this periodically to monitor your Firebase setup
"""

import firebase_admin
from firebase_admin import credentials, firestore
import json
import time
from datetime import datetime

def check_firebase_health():
    """Check Firebase connection and basic operations"""
    try:
        # Initialize Firebase (if not already done)
        if not firebase_admin._apps:
            cred = credentials.Certificate('../serviceAccountKey.json')
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        
        print("🔥 Firebase Health Check")
        print("=" * 40)
        
        # Test 1: Read a user document
        try:
            users = db.collection('users').limit(1).get()
            print("✅ Users collection: Accessible")
        except Exception as e:
            print(f"❌ Users collection error: {e}")
        
        # Test 2: Read lessons
        try:
            lessons = db.collection('lessons').limit(1).get()
            print("✅ Lessons collection: Accessible")
        except Exception as e:
            print(f"❌ Lessons collection error: {e}")
        
        # Test 3: Check indexes (indirect via query performance)
        start_time = time.time()
        try:
            # This query should use the users index
            top_users = db.collection('users').order_by('xp', direction=firestore.Query.DESCENDING).limit(5).get()
            query_time = (time.time() - start_time) * 1000
            print(f"✅ Leaderboard query: {query_time:.1f}ms")
            if query_time > 1000:
                print("⚠️  Query might be slow - check if indexes are ready")
        except Exception as e:
            print(f"❌ Leaderboard query error: {e}")
        
        print(f"\n🕒 Health check completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
    except Exception as e:
        print(f"❌ Firebase initialization error: {e}")

if __name__ == "__main__":
    check_firebase_health()
