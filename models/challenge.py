"""
Challenge model for Code with Morais
"""
from datetime import datetime
from services.firebase_service import db
import config

def get_daily_challenge():
    """Get today's daily challenge"""
    today = datetime.now().strftime('%Y-%m-%d')
    
    if config.DEV_MODE:
        return {
            'id': f'daily_{today}',
            'title': 'Print Pattern Challenge',
            'description': 'Create a function that prints a pyramid pattern',
            'xp_reward': 100,
            'coin_reward': 25,
            'difficulty': 'medium'
        }
    
    # In production, fetch from Firestore
    if db:
        challenge_ref = db.collection('daily_challenges').document(today)
        challenge = challenge_ref.get()
        
        if challenge.exists:
            return challenge.to_dict()
        else:
            # If no challenge for today, create a default one
            default_challenge = {
                'id': f'daily_{today}',
                'date': today,
                'title': 'Daily Python Challenge',
                'description': 'Practice your Python skills with today\'s coding challenge!',
                'difficulty': 'medium',
                'code_template': '# Write your Python code here\n\ndef solve_challenge():\n    # Complete this function\n    pass\n\nprint(solve_challenge())',
                'xp_reward': 75,
                'pycoins_reward': 15,
                'hints': ['Read the problem carefully', 'Test your solution with different inputs', 'Don\'t forget edge cases'],
                'completed_by': [],
                'created_at': datetime.now().isoformat()
            }
            
            # Save the default challenge to Firestore
            try:
                challenge_ref.set(default_challenge)
                return default_challenge
            except Exception as e:
                print(f"Could not save default challenge: {e}")
                return default_challenge
    
    # Fallback if no database connection
    return {
        'id': f'daily_{today}',
        'title': 'Daily Python Challenge',
        'description': 'Practice your Python skills with today\'s coding challenge!',
        'xp_reward': 75,
        'coin_reward': 15,
        'difficulty': 'medium'
    }
