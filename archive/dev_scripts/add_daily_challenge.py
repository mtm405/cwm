#!/usr/bin/env python3
"""
Quick script to add today's daily challenge to Firebase
"""

import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

def add_todays_challenge():
    """Add today's challenge to Firebase"""
    try:
        # Initialize Firebase (if not already initialized)
        try:
            app = firebase_admin.get_app()
            print("✅ Using existing Firebase app")
        except ValueError:
            cred = credentials.Certificate("serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
            print("✅ Initialized Firebase app")
        
        db = firestore.client()
        
        # Today's challenge data
        today = datetime.now().strftime('%Y-%m-%d')
        challenge_data = {
            'id': f'daily_{today}',
            'date': today,
            'title': 'Function Decorator Challenge',
            'description': 'Create a decorator function that measures and prints the execution time of any function it decorates.',
            'difficulty': 'medium',
            'code_template': 'import time\n\n# Create your decorator here\ndef timing_decorator(func):\n    # Your code here\n    pass\n\n# Test the decorator\n@timing_decorator\ndef slow_function():\n    time.sleep(1)\n    return "Task completed"\n\n# Call the function\nresult = slow_function()\nprint(result)',
            'solution': 'import time\n\ndef timing_decorator(func):\n    def wrapper(*args, **kwargs):\n        start_time = time.time()\n        result = func(*args, **kwargs)\n        end_time = time.time()\n        print(f"{func.__name__} took {end_time - start_time:.4f} seconds")\n        return result\n    return wrapper',
            'expected_output': 'slow_function took 1.0xxx seconds\\nTask completed',
            'xp_reward': 100,
            'pycoins_reward': 20,
            'hints': [
                'Decorators are functions that modify other functions',
                'Use time.time() to measure execution time',
                'Don\'t forget to return the original function\'s result',
                'The wrapper function should accept *args and **kwargs'
            ],
            'completed_by': [],
            'created_at': datetime.now().isoformat()
        }
        
        # Add to Firebase
        challenge_ref = db.collection('daily_challenges').document(today)
        challenge_ref.set(challenge_data)
        
        print(f"✅ Successfully added daily challenge for {today}")
        print(f"   Title: {challenge_data['title']}")
        print(f"   Difficulty: {challenge_data['difficulty']}")
        print(f"   XP Reward: {challenge_data['xp_reward']}")
        
    except Exception as e:
        print(f"❌ Error adding challenge: {e}")

if __name__ == "__main__":
    add_todays_challenge()
