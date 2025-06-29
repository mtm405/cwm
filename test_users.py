#!/usr/bin/env python3
"""
Test script to check users in Firebase
"""
from services.firebase_service import FirebaseService
from config import get_config

def main():
    config = get_config()
    fs = FirebaseService(config.FIREBASE_CONFIG)
    
    if fs.is_available():
        print("🔥 Firebase connection successful!")
        
        # Get existing users
        users_ref = fs.db.collection('users').limit(10)
        users = list(users_ref.stream())
        
        print(f"\n👥 Users in Firebase ({len(users)} found):")
        for doc in users:
            user_data = doc.to_dict()
            print(f"- ID: {doc.id}")
            print(f"  Username: {user_data.get('username', 'No username')}")
            print(f"  Email: {user_data.get('email', 'No email')}")
            print(f"  XP: {user_data.get('xp', 0)}")
            print(f"  Level: {user_data.get('level', 1)}")
            print()
    else:
        print("❌ Firebase connection failed")

if __name__ == '__main__':
    main()
