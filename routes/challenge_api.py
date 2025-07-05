"""
Challenge API - Daily coding challenges and gamification features
Provides endpoints for daily challenges, leaderboards, and challenge submissions
"""

from flask import Blueprint, jsonify, request, current_app
from datetime import datetime, timedelta
import logging
from functools import wraps

from services.firebase_service import get_firebase_service
from services.achievement_service import check_achievement_progress
from models.user import get_current_user
from config import get_config

logger = logging.getLogger(__name__)

# Create the blueprint
challenge_api = Blueprint('challenge_api', __name__, url_prefix='/api/challenges')

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        return f(user, *args, **kwargs)
    return decorated_function

@challenge_api.route('/daily', methods=['GET'])
def get_daily_challenge():
    """Get today's daily challenge"""
    try:
        config = get_config()
        firebase_service = get_firebase_service()
        
        # Get today's date
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Try to get challenge from Firebase
        challenge = None
        if firebase_service and firebase_service.is_available():
            challenge = firebase_service.get_daily_challenge(today)
        
        # If no challenge found, use fallback
        if not challenge:
            challenge = get_fallback_challenge(today)
        
        # Add helper costs if not present
        if 'hint_cost' not in challenge:
            challenge['hint_cost'] = 25
        if 'skip_cost' not in challenge:
            challenge['skip_cost'] = 50
        
        return jsonify({
            'success': True,
            'challenge': challenge,
            'date': today
        })
        
    except Exception as e:
        logger.error(f"Error getting daily challenge: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to load daily challenge'
        }), 500

@challenge_api.route('/helper-status', methods=['GET'])
@require_auth
def get_helper_status(user):
    """Get helper usage status for today"""
    try:
        today = datetime.now().strftime('%Y-%m-%d')
        firebase_service = get_firebase_service()
        
        # Check if user has used helper today
        helper_used = False
        if firebase_service and firebase_service.is_available():
            # Check user's challenge history for today
            user_doc = firebase_service.db.collection('users').document(user['uid']).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                daily_helpers = user_data.get('daily_helpers', {})
                helper_used = daily_helpers.get(today, False)
        
        return jsonify({
            'success': True,
            'helper_used': helper_used,
            'date': today
        })
        
    except Exception as e:
        logger.error(f"Error getting helper status: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to get helper status'
        }), 500

@challenge_api.route('/use-helper', methods=['POST'])
@require_auth
def use_helper(user):
    """Use a helper (hint or skip) for today's challenge"""
    try:
        data = request.get_json()
        helper_type = data.get('type')  # 'hint' or 'skip'
        
        if helper_type not in ['hint', 'skip']:
            return jsonify({
                'success': False,
                'error': 'Invalid helper type'
            }), 400
        
        today = datetime.now().strftime('%Y-%m-%d')
        firebase_service = get_firebase_service()
        
        # Check if user has already used a helper today
        if firebase_service and firebase_service.is_available():
            user_doc = firebase_service.db.collection('users').document(user['uid']).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                daily_helpers = user_data.get('daily_helpers', {})
                if daily_helpers.get(today, False):
                    return jsonify({
                        'success': False,
                        'error': 'Helper already used today'
                    }), 400
        
        # Get challenge to determine cost
        challenge = None
        if firebase_service and firebase_service.is_available():
            challenge = firebase_service.get_daily_challenge(today)
        
        if not challenge:
            challenge = get_fallback_challenge(today)
        
        # Determine cost
        cost = challenge.get('hint_cost', 25) if helper_type == 'hint' else challenge.get('skip_cost', 50)
        
        # Check if user has enough PyCoins
        current_coins = user.get('pycoins', 0)
        if current_coins < cost:
            return jsonify({
                'success': False,
                'error': f'Insufficient PyCoins. Need {cost}, have {current_coins}'
            }), 400
        
        # Deduct PyCoins and mark helper as used
        new_coins = current_coins - cost
        
        if firebase_service and firebase_service.is_available():
            # Update user document
            user_ref = firebase_service.db.collection('users').document(user['uid'])
            user_ref.update({
                'pycoins': new_coins,
                f'daily_helpers.{today}': helper_type
            })
        else:
            # Update in-memory user data for dev mode
            user['pycoins'] = new_coins
        
        # Get hint/skip content
        response_data = {
            'success': True,
            'helper_type': helper_type,
            'cost': cost,
            'new_balance': new_coins,
            'date': today
        }
        
        if helper_type == 'hint':
            hints = challenge.get('hints', ['Try breaking down the problem into smaller steps'])
            response_data['hint'] = hints[0] if hints else 'No hint available'
        else:  # skip
            response_data['message'] = 'Challenge skipped! You can try again tomorrow.'
            response_data['solution'] = challenge.get('solution', 'Solution not available')
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error using helper: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to use helper'
        }), 500

@challenge_api.route('/submit', methods=['POST'])
@require_auth
def submit_challenge(user):
    """Submit a challenge solution"""
    try:
        data = request.get_json()
        challenge_id = data.get('challenge_id')
        solution = data.get('solution')
        challenge_type = data.get('type', 'code_challenge')
        
        if not challenge_id or not solution:
            return jsonify({
                'success': False,
                'error': 'Missing challenge ID or solution'
            }), 400
        
        # Get the challenge
        today = datetime.now().strftime('%Y-%m-%d')
        firebase_service = get_firebase_service()
        
        challenge = None
        if firebase_service and firebase_service.is_available():
            challenge = firebase_service.get_daily_challenge(today)
        
        if not challenge:
            challenge = get_fallback_challenge(today)
        
        # Validate solution based on challenge type
        is_correct = False
        feedback = ""
        
        if challenge_type == 'code_challenge':
            # For code challenges, check if solution matches expected output
            expected_output = challenge.get('expected_output', '')
            # In a real implementation, you'd execute the code safely
            # For now, we'll do a simple string comparison
            is_correct = solution.strip() == expected_output.strip()
            feedback = "Correct!" if is_correct else "Not quite right. Try again!"
        
        elif challenge_type == 'quiz':
            # For quiz challenges, check answers
            correct_answers = challenge.get('content', {}).get('correct_answers', [])
            user_answers = data.get('answers', [])
            is_correct = user_answers == correct_answers
            feedback = f"You got {sum(1 for i, ans in enumerate(user_answers) if i < len(correct_answers) and ans == correct_answers[i])}/{len(correct_answers)} correct!"
        
        elif challenge_type == 'question':
            # For text questions, accept any non-empty answer
            is_correct = len(solution.strip()) > 0
            feedback = "Answer submitted!" if is_correct else "Please provide an answer."
        
        # Award XP and coins if correct
        xp_awarded = 0
        coins_awarded = 0
        
        if is_correct:
            xp_awarded = challenge.get('xp_reward', 50)
            coins_awarded = challenge.get('coin_reward', challenge.get('pycoins_reward', 10))
            
            # Update user stats
            if firebase_service and firebase_service.is_available():
                user_ref = firebase_service.db.collection('users').document(user['uid'])
                user_ref.update({
                    'xp': user.get('xp', 0) + xp_awarded,
                    'pycoins': user.get('pycoins', 0) + coins_awarded,
                    f'completed_challenges.{today}': {
                        'challenge_id': challenge_id,
                        'completed_at': datetime.now().isoformat(),
                        'xp_awarded': xp_awarded,
                        'coins_awarded': coins_awarded
                    }
                })
            else:
                # Update in-memory user data for dev mode
                user['xp'] = user.get('xp', 0) + xp_awarded
                user['pycoins'] = user.get('pycoins', 0) + coins_awarded
            
            # Check for achievements
            try:
                check_achievement_progress(user['uid'], 'daily_challenge_completed')
            except Exception as e:
                logger.warning(f"Achievement check failed: {str(e)}")
        
        return jsonify({
            'success': True,
            'correct': is_correct,
            'feedback': feedback,
            'xp_awarded': xp_awarded,
            'coins_awarded': coins_awarded,
            'new_xp': user.get('xp', 0) + xp_awarded,
            'new_coins': user.get('pycoins', 0) + coins_awarded
        })
        
    except Exception as e:
        logger.error(f"Error submitting challenge: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to submit challenge'
        }), 500

def get_fallback_challenge(date_str):
    """Get a fallback challenge when Firebase is not available"""
    return {
        'id': f'fallback_{date_str}',
        'title': 'FizzBuzz Classic',
        'description': 'Write a program that prints numbers 1 to 20, but for multiples of 3 print "Fizz", for multiples of 5 print "Buzz", and for multiples of both print "FizzBuzz".',
        'type': 'code_challenge',
        'difficulty': 'medium',
        'content': {
            'instructions': 'Write a program that implements the FizzBuzz logic for numbers 1 to 20.',
            'initial_code': '# Write your FizzBuzz solution here\nfor i in range(1, 21):\n    # Your code here\n    pass'
        },
        'xp_reward': 75,
        'coin_reward': 15,
        'estimated_time': 15,
        'hint_cost': 25,
        'skip_cost': 50,
        'hints': [
            'Use the modulo operator (%) to check if a number is divisible by another',
            'Check for multiples of both 3 and 5 first, then individual multiples',
            'Use if-elif-else statements to handle different cases'
        ],
        'expected_output': '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz',
        'solution': 'for i in range(1, 21):\n    if i % 15 == 0:\n        print("FizzBuzz")\n    elif i % 3 == 0:\n        print("Fizz")\n    elif i % 5 == 0:\n        print("Buzz")\n    else:\n        print(i)',
        'date': date_str,
        'created_at': datetime.now().isoformat()
    }
