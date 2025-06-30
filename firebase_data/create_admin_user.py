#!/usr/bin/env python3
"""
Create Admin User Script
Manually creates an admin user in Firebase for testing
"""

import firebase_admin
from firebase_admin import credentials, firestore
import uuid
from datetime import datetime

def create_admin_user(email, name):
    """Create an admin user manually"""
    
    # Initialize Firebase
    if not firebase_admin._apps:
        cred = credentials.Certificate('../serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    
    # Generate a user ID (in real app, this comes from Google OAuth)
    user_id = f"admin_{uuid.uuid4().hex[:8]}"
    
    admin_user_data = {
        'username': name,
        'display_name': name,
        'email': email,
        'profile_picture': f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&size=200&background=4f46e5&color=ffffff",
        'xp': 10000,  # Give admin high XP
        'level': 10,   # High level
        'pycoins': 1000,
        'streak': 0,
        'lessons_completed': [],
        'quizzes_completed': [],
        'achievements': [],
        'is_admin': True,  # Make this user an admin
        'created_at': firestore.SERVER_TIMESTAMP,
        'updated_at': firestore.SERVER_TIMESTAMP,
        'last_login': firestore.SERVER_TIMESTAMP,
        'total_time_spent': 0,
        'join_date': datetime.now().isoformat()
    }
    
    try:
        # Create the user document
        db.collection('users').document(user_id).set(admin_user_data)
        print(f"✅ Admin user created successfully!")
        print(f"   User ID: {user_id}")
        print(f"   Email: {email}")
        print(f"   Name: {name}")
        print(f"   Admin: True")
        print(f"\n🔐 Use this User ID to manually set session['user_id'] = '{user_id}' for testing")
        
        return user_id
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        return None

def list_all_users():
    """List all current users"""
    
    if not firebase_admin._apps:
        cred = credentials.Certificate('../serviceAccountKey.json')
        firebase_admin.initialize_app(cred)
    
    db = firestore.client()
    
    users = db.collection('users').get()
    
    if not users:
        print("❌ No users found in Firebase")
        return
    
    print(f"👥 Found {len(users)} users:")
    print("=" * 50)
    
    for user in users:
        data = user.to_dict()
        print(f"ID: {user.id}")
        print(f"Name: {data.get('display_name', 'N/A')}")
        print(f"Email: {data.get('email', 'N/A')}")
        print(f"XP: {data.get('xp', 0)}")
        print(f"Level: {data.get('level', 1)}")
        print(f"Admin: {data.get('is_admin', False)}")
        print("-" * 30)

if __name__ == "__main__":
    print("🔥 Firebase User Management")
    print("=" * 40)
    
    choice = input("\n1. List all users\n2. Create admin user\nChoose (1/2): ").strip()
    
    if choice == "1":
        list_all_users()
    elif choice == "2":
        email = input("Enter admin email: ").strip()
        name = input("Enter admin name: ").strip()
        
        if email and name:
            create_admin_user(email, name)
        else:
            print("❌ Email and name are required")
    else:
        print("❌ Invalid choice")
