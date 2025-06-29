"""
Challenge model for Code with Morais
"""
from datetime import datetime
from services.firebase_service import db

def get_daily_challenge():
    """Get today's daily challenge"""
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Fetch from Firestore
    if db:
        challenge_ref = db.collection('daily_challenges').document(today)
        challenge = challenge_ref.get()
        
        if challenge.exists:
            return challenge.to_dict()
    
    # Default challenge if none exists in the database
    return {
        'id': f'daily_{today}',
        'title': 'Print Pattern Challenge',
        'description': 'Create a function that prints a pyramid pattern',
        'xp_reward': 100,
        'coin_reward': 25,
        'difficulty': 'medium'
    }
