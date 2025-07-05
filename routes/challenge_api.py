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
        
        # Try to get challenge from Firebase first
        challenge = None
        if firebase_service and firebase_service.is_available():
            # Try to get challenge with today's date as document ID
            challenge_ref = firebase_service.db.collection('daily_challenges').document(today)
            challenge_doc = challenge_ref.get()
            
            if challenge_doc.exists:
                challenge = challenge_doc.to_dict()
                challenge['id'] = challenge_doc.id
            else:
                # Try to find a challenge for today in the collection
                challenges_ref = firebase_service.db.collection('daily_challenges')
                query = challenges_ref.where('date', '==', today).limit(1)
                challenges = list(query.stream())
                
                if challenges:
                    challenge = challenges[0].to_dict()
                    challenge['id'] = challenges[0].id
        
        # If no challenge found, use fallback
        if not challenge:
            challenge = get_fallback_challenge(today)
        
        # Ensure the challenge has the required fields and normalize the data structure
        if not challenge:
            challenge = get_fallback_challenge(today)
        
        # Normalize challenge data structure for compatibility
        normalized_challenge = normalize_challenge_data(challenge)
        
        return jsonify({
            'success': True,
            'challenge': normalized_challenge,
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
        helper_type = data.get('helperType') or data.get('type')  # Support both formats
        
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
            challenge_ref = firebase_service.db.collection('daily_challenges').document(today)
            challenge_doc = challenge_ref.get()
            
            if challenge_doc.exists:
                challenge = challenge_doc.to_dict()
                challenge['id'] = challenge_doc.id
        
        if not challenge:
            challenge = get_fallback_challenge(today)
        
        # Normalize challenge data
        challenge = normalize_challenge_data(challenge)
        
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
            response_data['xpAwarded'] = challenge.get('xp_reward', 25)  # Award some XP for participation
            response_data['currentStreak'] = 1  # TODO: Implement proper streak calculation
        
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
        challenge_id = data.get('challengeId') or data.get('challenge_id')
        solution = data.get('code') or data.get('solution')
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
            challenge_ref = firebase_service.db.collection('daily_challenges').document(today)
            challenge_doc = challenge_ref.get()
            
            if challenge_doc.exists:
                challenge = challenge_doc.to_dict()
                challenge['id'] = challenge_doc.id
        
        if not challenge:
            challenge = get_fallback_challenge(today)
        
        # Normalize challenge data
        challenge = normalize_challenge_data(challenge)
        
        # Validate solution based on challenge type
        is_correct = False
        feedback = ""
        test_results = []
        
        if challenge_type == 'code_challenge':
            # For code challenges, execute the code and check output
            try:
                import io
                import sys
                from contextlib import redirect_stdout
                
                # Create a string buffer to capture output
                output_buffer = io.StringIO()
                
                # Redirect stdout to capture print statements
                with redirect_stdout(output_buffer):
                    # Execute the code
                    exec(solution)
                
                # Get the output
                actual_output = output_buffer.getvalue().strip()
                expected_output = challenge.get('expected_output', '').strip()
                
                is_correct = actual_output == expected_output
                
                # Create test results
                if is_correct:
                    test_results.append({
                        'name': 'Output Test',
                        'passed': True,
                        'expected': expected_output,
                        'output': actual_output
                    })
                    feedback = "Perfect! Your solution produces the correct output."
                else:
                    test_results.append({
                        'name': 'Output Test',
                        'passed': False,
                        'expected': expected_output,
                        'output': actual_output
                    })
                    feedback = "Your solution runs but doesn't produce the expected output."
                    
            except Exception as e:
                test_results.append({
                    'name': 'Execution Test',
                    'passed': False,
                    'error': str(e)
                })
                feedback = f"Code execution error: {str(e)}"
        
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
            'message': feedback,
            'testResults': test_results,
            'xp_earned': xp_awarded,
            'coins_earned': coins_awarded,
            'new_balance': user.get('pycoins', 0) + coins_awarded,
            'streak': 1  # TODO: Implement proper streak calculation
        })
        
    except Exception as e:
        logger.error(f"Error submitting challenge: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to submit challenge'
        }), 500

@challenge_api.route('/run-code', methods=['POST'])
@require_auth
def run_code(user):
    """Execute user code and return output"""
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if not code.strip():
            return jsonify({
                'success': False,
                'error': 'No code provided'
            }), 400
            
        # For security, we'll use a simple eval approach (in production, use a sandboxed environment)
        # This is a basic implementation - in production you'd want to use Docker or a proper sandbox
        
        try:
            # Capture output
            import io
            import sys
            from contextlib import redirect_stdout
            
            # Create a string buffer to capture output
            output_buffer = io.StringIO()
            
            # Redirect stdout to capture print statements
            with redirect_stdout(output_buffer):
                # Execute the code
                exec(code)
            
            # Get the output
            output = output_buffer.getvalue()
            
            return jsonify({
                'success': True,
                'output': output,
                'error': None
            })
            
        except Exception as e:
            return jsonify({
                'success': False,
                'output': '',
                'error': str(e)
            })
            
    except Exception as e:
        logger.error(f"Error running code: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to execute code'
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

def normalize_challenge_data(challenge):
    """Normalize challenge data to ensure consistent structure"""
    if not challenge:
        return None
    
    # Create a normalized copy
    normalized = challenge.copy()
    
    # Ensure required fields exist
    if 'type' not in normalized:
        normalized['type'] = 'code_challenge'  # Default type
    
    if 'estimated_time' not in normalized:
        normalized['estimated_time'] = 15  # Default 15 minutes
    
    if 'hint_cost' not in normalized:
        normalized['hint_cost'] = 25
    
    if 'skip_cost' not in normalized:
        normalized['skip_cost'] = 50
    
    # Normalize reward fields
    if 'coin_reward' not in normalized:
        normalized['coin_reward'] = normalized.get('pycoins_reward', 10)
    
    if 'xp_reward' not in normalized:
        normalized['xp_reward'] = 50
    
    # Normalize content structure for code challenges
    if normalized['type'] == 'code_challenge':
        if 'content' not in normalized:
            normalized['content'] = {}
        
        # If we have old-style code_template, convert to new structure
        if 'code_template' in normalized and 'initial_code' not in normalized['content']:
            normalized['content']['initial_code'] = normalized['code_template']
        
        # Ensure initial_code exists
        if 'initial_code' not in normalized['content']:
            normalized['content']['initial_code'] = '# Write your code here\npass'
        
        # Ensure instructions exist
        if 'instructions' not in normalized['content']:
            normalized['content']['instructions'] = normalized.get('description', 'Complete the coding challenge.')
    
    return normalized
