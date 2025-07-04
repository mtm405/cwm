"""
Quiz API routes for Code with Morais
Provides endpoints for quiz data and submission
"""
from flask import Blueprint, request, jsonify, current_app
from models.quiz import get_quiz
from services.firebase_service import get_firebase_service
import logging

# Create blueprint
quiz_api = Blueprint('quiz_api', __name__)
logger = logging.getLogger(__name__)

@quiz_api.route('/api/quiz/<quiz_id>', methods=['GET'])
def get_quiz_data(quiz_id):
    """Get quiz data by ID"""
    try:
        quiz_data = get_quiz(quiz_id)
        
        if not quiz_data:
            return jsonify({
                'error': 'Quiz not found',
                'message': f'Quiz with ID {quiz_id} does not exist'
            }), 404
        
        return jsonify(quiz_data)
        
    except Exception as e:
        logger.error(f"Error getting quiz {quiz_id}: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to retrieve quiz data'
        }), 500

@quiz_api.route('/api/quiz/<quiz_id>/submit', methods=['POST'])
def submit_quiz_result(quiz_id):
    """Submit quiz results"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Request body is empty'
            }), 400
        
        # Extract required fields
        user_id = data.get('userId')
        answers = data.get('answers', {})
        score = data.get('score', 0)
        percentage = data.get('percentage', 0)
        duration = data.get('duration', 0)
        
        # Basic validation
        if not user_id:
            return jsonify({
                'error': 'Missing user ID',
                'message': 'User ID is required'
            }), 400
        
        # Get Firebase service
        firebase_service = get_firebase_service()
        
        # Create result record
        result_data = {
            'quiz_id': quiz_id,
            'user_id': user_id,
            'answers': answers,
            'score': score,
            'percentage': percentage,
            'duration': duration,
            'submitted_at': data.get('timestamp', None),
            'passed': percentage >= 70  # 70% pass threshold
        }
        
        # Save result to Firebase
        success = False
        if firebase_service and firebase_service.is_available():
            try:
                # Save to quiz results collection
                result_id = f"{user_id}_{quiz_id}_{int(data.get('timestamp', 0))}"
                firebase_service.save_quiz_result(result_id, result_data)
                success = True
                logger.info(f"Quiz result saved: {result_id}")
            except Exception as e:
                logger.error(f"Firebase save error: {str(e)}")
        
        # Calculate rewards
        xp_earned = calculate_xp(score, percentage)
        coins_earned = calculate_coins(score, percentage)
        
        # Response data
        response_data = {
            'success': success,
            'quiz_id': quiz_id,
            'score': score,
            'percentage': percentage,
            'passed': result_data['passed'],
            'xp_earned': xp_earned,
            'coins_earned': coins_earned,
            'message': 'Quiz submitted successfully' if success else 'Quiz submitted but not saved'
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error submitting quiz {quiz_id}: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to submit quiz results'
        }), 500

@quiz_api.route('/api/quiz/results', methods=['POST'])
def save_quiz_results():
    """Save quiz results (alternative endpoint)"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        # Extract quiz ID from data
        quiz_id = data.get('quizId')
        if not quiz_id:
            return jsonify({
                'error': 'Quiz ID is required'
            }), 400
        
        # Redirect to the main submit endpoint
        return submit_quiz_result(quiz_id)
        
    except Exception as e:
        logger.error(f"Error in quiz results endpoint: {str(e)}")
        return jsonify({
            'error': 'Internal server error'
        }), 500

def calculate_xp(score, percentage):
    """Calculate XP earned based on score and percentage"""
    base_xp = 50  # Base XP for attempting
    
    if percentage >= 90:
        return base_xp + 150  # Excellent
    elif percentage >= 80:
        return base_xp + 100  # Good
    elif percentage >= 70:
        return base_xp + 50   # Pass
    else:
        return base_xp        # Attempt
    
def calculate_coins(score, percentage):
    """Calculate coins earned based on score and percentage"""
    base_coins = 10  # Base coins for attempting
    
    if percentage >= 90:
        return base_coins + 50  # Excellent
    elif percentage >= 80:
        return base_coins + 30  # Good
    elif percentage >= 70:
        return base_coins + 15  # Pass
    else:
        return base_coins       # Attempt
