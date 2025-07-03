"""
Lesson API routes for Code with Morais
Provides API endpoints for lesson data
"""
from flask import Blueprint, jsonify, request, current_app
from models.user import get_current_user, get_user_progress, update_lesson_progress
from models.lesson import get_all_lessons, get_lesson, calculate_overall_progress
from models.quiz import get_quiz
from services.firebase_service import FirebaseService
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
lesson_api_bp = Blueprint('lesson_api', __name__, url_prefix='/api')

@lesson_api_bp.route('/lessons')
def get_lessons_api():
    """Get all lessons with progress information"""
    try:
        user = get_current_user()
        user_id = user['uid'] if user else 'dev-user-001'
        
        # Get all lessons
        lessons = get_all_lessons()
        
        # Get user progress
        user_progress = get_user_progress(user_id)
        
        # Enhance lessons with progress data
        enhanced_lessons = []
        for lesson in lessons:
            lesson_id = lesson.get('id')
            progress_data = user_progress.get(lesson_id, {})
            
            enhanced_lesson = {
                'id': lesson_id,
                'title': lesson.get('title', ''),
                'description': lesson.get('description', ''),
                'difficulty': lesson.get('difficulty', 'beginner'),
                'category': lesson.get('category', 'python'),
                'duration': lesson.get('duration', 30),
                'xp_reward': lesson.get('xp_reward', 50),
                'progress': progress_data.get('progress', 0),
                'completed': progress_data.get('completed', False),
                'completed_subtopics': progress_data.get('completed_subtopics', []),
                'last_accessed': progress_data.get('last_accessed'),
                'quiz_completed': progress_data.get('quiz_completed', False)
            }
            enhanced_lessons.append(enhanced_lesson)
        
        return jsonify({
            'lessons': enhanced_lessons,
            'total_count': len(enhanced_lessons),
            'completed_count': len([l for l in enhanced_lessons if l['completed']]),
            'overall_progress': calculate_overall_progress(user_id, user_progress),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting lessons API data: {str(e)}")
        return jsonify({'error': 'Failed to load lessons'}), 500

@lesson_api_bp.route('/lessons/<lesson_id>')
def get_lesson_api(lesson_id):
    """Get specific lesson with detailed information"""
    try:
        user = get_current_user()
        user_id = user['uid'] if user else 'dev-user-001'
        
        # Get lesson data
        lesson = get_lesson(lesson_id)
        if not lesson:
            return jsonify({'error': 'Lesson not found'}), 404
        
        # Get user progress for this lesson
        user_progress = get_user_progress(user_id)
        lesson_progress = user_progress.get(lesson_id, {})
        
        # Get associated quiz if exists
        quiz_data = None
        if lesson.get('quiz_id'):
            quiz_data = get_quiz(lesson['quiz_id'])
        
        # Ensure lesson has blocks
        if not lesson.get('blocks') or not isinstance(lesson.get('blocks'), list):
            from routes.lesson_routes import transform_lesson_to_blocks
            lesson = transform_lesson_to_blocks(lesson)
            
        # Create default blocks if there are none
        if not lesson.get('blocks') or len(lesson.get('blocks', [])) == 0:
            logger.info(f"Creating default blocks for lesson {lesson_id}")
            lesson['blocks'] = [
                {
                    'id': 'intro-block',
                    'type': 'text',
                    'title': 'Introduction',
                    'content': lesson.get('description', 'Welcome to this lesson!'),
                    'order': 0
                }
            ]
            
            # If there's content, add it as a block
            if lesson.get('content'):
                lesson['blocks'].append({
                    'id': 'content-block',
                    'type': 'text',
                    'title': 'Content',
                    'content': lesson.get('content'),
                    'order': 1
                })
        
        enhanced_lesson = {
            'id': lesson_id,
            'title': lesson.get('title', ''),
            'description': lesson.get('description', ''),
            'content': lesson.get('content', ''),
            'difficulty': lesson.get('difficulty', 'beginner'),
            'category': lesson.get('category', 'python'),
            'duration': lesson.get('duration', 30),
            'xp_reward': lesson.get('xp_reward', 50),
            'objectives': lesson.get('objectives', []),
            'prerequisites': lesson.get('prerequisites', []),
            'tags': lesson.get('tags', []),
            'code_examples': lesson.get('code_examples', []),
            'blocks': lesson.get('blocks', []),
            'quiz': quiz_data,
            'progress': {
                'percentage': lesson_progress.get('progress', 0),
                'completed': lesson_progress.get('completed', False),
                'completed_subtopics': lesson_progress.get('completed_subtopics', []),
                'time_spent': lesson_progress.get('time_spent', 0),
                'last_accessed': lesson_progress.get('last_accessed'),
                'quiz_completed': lesson_progress.get('quiz_completed', False),
                'quiz_score': lesson_progress.get('quiz_score', 0)
            }
        }
        
        return jsonify(enhanced_lesson)
        
    except Exception as e:
        logger.error(f"Error getting lesson {lesson_id}: {str(e)}")
        return jsonify({'error': 'Failed to load lesson'}), 500

@lesson_api_bp.route('/lessons/<lesson_id>/progress', methods=['POST'])
def update_lesson_progress(lesson_id):
    """Update lesson progress for current user"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update progress in user model
        success = update_lesson_progress(
            user['uid'],
            lesson_id,
            data.get('progress', 0),
            data.get('completed', False),
            data.get('completed_subtopics', []),
            data.get('time_spent', 0)
        )
        
        if success:
            return jsonify({'message': 'Progress updated successfully'})
        else:
            return jsonify({'error': 'Failed to update progress'}), 500
            
    except Exception as e:
        logger.error(f"Error updating lesson progress: {str(e)}")
        return jsonify({'error': 'Failed to update progress'}), 500

@lesson_api_bp.route('/categories')
def get_lesson_categories():
    """Get all lesson categories with counts"""
    try:
        lessons = get_all_lessons()
        
        # Count lessons by category
        categories = {}
        for lesson in lessons:
            category = lesson.get('category', 'uncategorized')
            if category not in categories:
                categories[category] = {
                    'name': category.title(),
                    'count': 0,
                    'lessons': []
                }
            categories[category]['count'] += 1
            categories[category]['lessons'].append({
                'id': lesson.get('id'),
                'title': lesson.get('title'),
                'difficulty': lesson.get('difficulty', 'beginner')
            })
        
        return jsonify({
            'categories': list(categories.values()),
            'total_categories': len(categories),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error getting lesson categories: {str(e)}")
        return jsonify({'error': 'Failed to load categories'}), 500

@lesson_api_bp.route('/search')
def search_lessons():
    """Search lessons by title, description, or tags"""
    try:
        query = request.args.get('q', '').lower()
        category = request.args.get('category', '')
        difficulty = request.args.get('difficulty', '')
        
        if not query and not category and not difficulty:
            return jsonify({'error': 'No search criteria provided'}), 400
        
        lessons = get_all_lessons()
        filtered_lessons = []
        
        for lesson in lessons:
            # Text search
            text_match = True
            if query:
                title_match = query in lesson.get('title', '').lower()
                desc_match = query in lesson.get('description', '').lower()
                tags_match = any(query in tag.lower() for tag in lesson.get('tags', []))
                text_match = title_match or desc_match or tags_match
            
            # Category filter
            category_match = True
            if category:
                category_match = lesson.get('category', '') == category
            
            # Difficulty filter
            difficulty_match = True
            if difficulty:
                difficulty_match = lesson.get('difficulty', '') == difficulty
            
            if text_match and category_match and difficulty_match:
                filtered_lessons.append({
                    'id': lesson.get('id'),
                    'title': lesson.get('title'),
                    'description': lesson.get('description'),
                    'category': lesson.get('category'),
                    'difficulty': lesson.get('difficulty'),
                    'duration': lesson.get('duration'),
                    'xp_reward': lesson.get('xp_reward')
                })
        
        return jsonify({
            'lessons': filtered_lessons,
            'total_count': len(filtered_lessons),
            'search_query': query,
            'filters': {
                'category': category,
                'difficulty': difficulty
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error searching lessons: {str(e)}")
        return jsonify({'error': 'Failed to search lessons'}), 500

@lesson_api_bp.route('/update-theme', methods=['POST'])
def update_theme():
    """Update user theme preference"""
    try:
        data = request.get_json()
        if not data or 'theme' not in data:
            return jsonify({'error': 'Theme not provided'}), 400
        
        theme = data['theme']
        if theme not in ['light', 'dark', 'auto']:
            return jsonify({'error': 'Invalid theme'}), 400
        
        # In a real app, you'd save this to user preferences
        # For now, just return success
        return jsonify({'message': 'Theme updated successfully', 'theme': theme})
        
    except Exception as e:
        logger.error(f"Error updating theme: {str(e)}")
        return jsonify({'error': 'Failed to update theme'}), 500

@lesson_api_bp.route('/lessons/<lesson_id>/complete-block', methods=['POST'])
def complete_lesson_block(lesson_id):
    """Mark a specific block as completed and calculate rewards"""
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.get_json()
        if not data or 'block_id' not in data:
            return jsonify({'error': 'Block ID required'}), 400
        
        block_id = data['block_id']
        block_type = data.get('block_type', 'text')
        user_id = user['uid']
        
        # Get current lesson progress
        user_progress = get_user_progress(user_id)
        lesson_progress = user_progress.get(lesson_id, {})
        completed_blocks = set(lesson_progress.get('completed_blocks', []))
        
        # Check if block is already completed
        if block_id in completed_blocks:
            return jsonify({'error': 'Block already completed'}), 400
        
        # Calculate rewards based on block type
        rewards = calculate_block_rewards(block_type, lesson_id)
        
        # Add block to completed set
        completed_blocks.add(block_id)
        
        # Get lesson data to calculate progress
        lesson = get_lesson(lesson_id)
        total_blocks = len(lesson.get('blocks', [])) if lesson else 1
        progress_percentage = (len(completed_blocks) / total_blocks) * 100
        
        # Check for milestones
        milestone = check_milestone(progress_percentage)
        
        # Update user progress
        update_data = {
            'completed_blocks': list(completed_blocks),
            'progress': progress_percentage,
            'completed': progress_percentage >= 100,
            'last_accessed': datetime.now().isoformat(),
            'xp_earned': lesson_progress.get('xp_earned', 0) + rewards['xp'],
            'coins_earned': lesson_progress.get('coins_earned', 0) + rewards['coins']
        }
        
        success = update_lesson_progress(user_id, lesson_id, **update_data)
        
        if success:
            # Update user's total XP and coins
            update_user_rewards(user_id, rewards['xp'], rewards['coins'])
            
            response_data = {
                'message': 'Block completed successfully',
                'block_id': block_id,
                'rewards': rewards,
                'progress': progress_percentage,
                'milestone': milestone,
                'lesson_completed': progress_percentage >= 100
            }
            
            return jsonify(response_data)
        else:
            return jsonify({'error': 'Failed to update progress'}), 500
            
    except Exception as e:
        logger.error(f"Error completing block {block_id} in lesson {lesson_id}: {str(e)}")
        return jsonify({'error': 'Failed to complete block'}), 500

@lesson_api_bp.route('/lessons/<lesson_id>/progress')
def get_lesson_progress(lesson_id):
    """Get detailed lesson progress including block-level completion"""
    try:
        user = get_current_user()
        user_id = user['uid'] if user else 'dev-user-001'
        
        # Get user progress
        user_progress = get_user_progress(user_id)
        lesson_progress = user_progress.get(lesson_id, {})
        
        # Get lesson data for block information
        lesson = get_lesson(lesson_id)
        if not lesson:
            return jsonify({'error': 'Lesson not found'}), 404
        
        blocks = lesson.get('blocks', [])
        completed_blocks = set(lesson_progress.get('completed_blocks', []))
        
        # Build detailed block progress
        block_progress = []
        for i, block in enumerate(blocks):
            block_id = block.get('id', f"block_{i}")
            block_progress.append({
                'id': block_id,
                'type': block.get('type', 'text'),
                'title': block.get('title', f"Block {i+1}"),
                'completed': block_id in completed_blocks,
                'order': i
            })
        
        progress_data = {
            'lesson_id': lesson_id,
            'progress_percentage': lesson_progress.get('progress', 0),
            'completed': lesson_progress.get('completed', False),
            'completed_blocks': list(completed_blocks),
            'total_blocks': len(blocks),
            'block_progress': block_progress,
            'time_spent': lesson_progress.get('time_spent', 0),
            'last_accessed': lesson_progress.get('last_accessed'),
            'xp_earned': lesson_progress.get('xp_earned', 0),
            'coins_earned': lesson_progress.get('coins_earned', 0),
            'current_block': get_current_block(blocks, completed_blocks)
        }
        
        return jsonify(progress_data)
        
    except Exception as e:
        logger.error(f"Error getting progress for lesson {lesson_id}: {str(e)}")
        return jsonify({'error': 'Failed to load progress'}), 500

@lesson_api_bp.route('/lessons/<lesson_id>/next')
def get_next_lesson(lesson_id):
    """Get next recommended lesson based on progress and prerequisites"""
    try:
        user = get_current_user()
        user_id = user['uid'] if user else 'dev-user-001'
        
        # Get all lessons
        lessons = get_all_lessons()
        user_progress = get_user_progress(user_id)
        
        # Find current lesson
        current_lesson = next((l for l in lessons if l.get('id') == lesson_id), None)
        if not current_lesson:
            return jsonify({'error': 'Current lesson not found'}), 404
        
        # Get recommendations based on:
        # 1. Same category progression
        # 2. Difficulty progression  
        # 3. Prerequisites completion
        next_lessons = []
        
        for lesson in lessons:
            lesson_id_check = lesson.get('id')
            
            # Skip current lesson
            if lesson_id_check == lesson_id:
                continue
                
            # Skip already completed lessons
            if user_progress.get(lesson_id_check, {}).get('completed', False):
                continue
            
            # Check prerequisites
            prerequisites = lesson.get('prerequisites', [])
            prerequisites_met = all(
                user_progress.get(prereq, {}).get('completed', False) 
                for prereq in prerequisites
            )
            
            if prerequisites_met:
                # Calculate recommendation score
                score = calculate_recommendation_score(
                    current_lesson, lesson, user_progress
                )
                
                next_lessons.append({
                    'id': lesson_id_check,
                    'title': lesson.get('title'),
                    'description': lesson.get('description'),
                    'difficulty': lesson.get('difficulty'),
                    'category': lesson.get('category'),
                    'duration': lesson.get('duration'),
                    'xp_reward': lesson.get('xp_reward'),
                    'recommendation_score': score,
                    'reason': get_recommendation_reason(current_lesson, lesson)
                })
        
        # Sort by recommendation score
        next_lessons.sort(key=lambda x: x['recommendation_score'], reverse=True)
        
        return jsonify({
            'next_lessons': next_lessons[:5],  # Top 5 recommendations
            'current_lesson_id': lesson_id,
            'total_available': len(next_lessons)
        })
        
    except Exception as e:
        logger.error(f"Error getting next lesson recommendations: {str(e)}")
        return jsonify({'error': 'Failed to get recommendations'}), 500

# Add quiz API endpoint
@lesson_api_bp.route('/quiz/<quiz_id>')
def get_quiz_api(quiz_id):
    """Get quiz data by ID"""
    try:
        quiz_data = get_quiz(quiz_id)
        
        if not quiz_data:
            return jsonify({'error': 'Quiz not found'}), 404
        
        # Don't expose correct answers - they'll be validated server-side
        sanitized_quiz = {
            'id': quiz_data.get('id'),
            'title': quiz_data.get('title'),
            'description': quiz_data.get('description'),
            'difficulty': quiz_data.get('difficulty'),
            'time_limit': quiz_data.get('time_limit'),
            'xp_reward': quiz_data.get('xp_reward'),
            'pycoins_reward': quiz_data.get('pycoins_reward'),
            'questions': []
        }
        
        # Sanitize questions (remove correct answers)
        for question in quiz_data.get('questions', []):
            sanitized_question = {
                'id': question.get('id'),
                'type': question.get('type'),
                'question': question.get('question'),
                'options': question.get('options', []),
                'code_template': question.get('code_template'),
                'sample_solution': question.get('sample_solution')
            }
            sanitized_quiz['questions'].append(sanitized_question)
        
        return jsonify(sanitized_quiz)
        
    except Exception as e:
        logger.error(f"Error getting quiz {quiz_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@lesson_api_bp.route('/quiz/<quiz_id>/submit', methods=['POST'])
def submit_quiz_api(quiz_id):
    """Submit quiz answers for validation"""
    try:
        user = get_current_user()
        user_id = user['uid'] if user else 'dev-user-001'
        
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
        
        data = request.json
        answers = data.get('answers', {})
        
        # Get quiz data with correct answers
        quiz_data = get_quiz(quiz_id)
        if not quiz_data:
            return jsonify({'error': 'Quiz not found'}), 404
        
        # Validate answers and calculate score
        total_questions = len(quiz_data.get('questions', []))
        correct_answers = 0
        results = []
        
        for question in quiz_data.get('questions', []):
            question_id = question.get('id')
            user_answer = answers.get(question_id)
            correct_answer = question.get('correct_answer')
            
            is_correct = False
            if question.get('type') == 'multiple_choice':
                is_correct = user_answer == correct_answer
            elif question.get('type') == 'code_completion':
                # For code completion, we'll do a simple string comparison
                # In a real system, you'd want more sophisticated validation
                is_correct = user_answer and user_answer.strip() != ''
            
            if is_correct:
                correct_answers += 1
            
            results.append({
                'question_id': question_id,
                'correct': is_correct,
                'explanation': question.get('explanation', '')
            })
        
        # Calculate final score
        score = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
        passing_score = quiz_data.get('passing_score', 70)
        passed = score >= passing_score
        
        # Update user progress
        lesson_id = quiz_data.get('lesson_id')
        if lesson_id:
            current_progress = get_user_progress(user_id).get(lesson_id, {})
            current_progress['quiz_completed'] = passed
            current_progress['quiz_score'] = score
            current_progress['quiz_attempts'] = current_progress.get('quiz_attempts', 0) + 1
            
            update_lesson_progress(user_id, lesson_id, current_progress)
        
        # Award XP and coins if passed
        rewards = {}
        if passed:
            rewards = {
                'xp': quiz_data.get('xp_reward', 0),
                'pycoins': quiz_data.get('pycoins_reward', 0)
            }
        
        return jsonify({
            'score': score,
            'passed': passed,
            'passing_score': passing_score,
            'correct_answers': correct_answers,
            'total_questions': total_questions,
            'results': results,
            'rewards': rewards
        })
        
    except Exception as e:
        logger.error(f"Error submitting quiz {quiz_id}: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Helper functions
def calculate_block_rewards(block_type, lesson_id):
    """Calculate XP and PyCoins rewards for completing a block"""
    base_rewards = {
        'text': {'xp': 5, 'coins': 1},
        'code_example': {'xp': 8, 'coins': 2},
        'interactive': {'xp': 15, 'coins': 4},
        'quiz': {'xp': 12, 'coins': 3},
        'debug': {'xp': 18, 'coins': 5},
        'video': {'xp': 6, 'coins': 1}
    }
    
    return base_rewards.get(block_type, {'xp': 5, 'coins': 1})

def check_milestone(progress_percentage):
    """Check if progress percentage hits a milestone"""
    milestones = [25, 50, 75, 100]
    for milestone in milestones:
        if abs(progress_percentage - milestone) < 0.1:
            return milestone
    return None

def get_current_block(blocks, completed_blocks):
    """Get the next incomplete block"""
    for i, block in enumerate(blocks):
        block_id = block.get('id', f"block_{i}")
        if block_id not in completed_blocks:
            return {
                'id': block_id,
                'index': i,
                'type': block.get('type'),
                'title': block.get('title')
            }
    return None

def calculate_recommendation_score(current_lesson, candidate_lesson, user_progress):
    """Calculate recommendation score for lesson ordering"""
    score = 0
    
    # Same category bonus
    if current_lesson.get('category') == candidate_lesson.get('category'):
        score += 10
    
    # Difficulty progression bonus
    difficulty_order = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
    current_diff = difficulty_order.get(current_lesson.get('difficulty', 'beginner'), 1)
    candidate_diff = difficulty_order.get(candidate_lesson.get('difficulty', 'beginner'), 1)
    
    if candidate_diff == current_diff:
        score += 5
    elif candidate_diff == current_diff + 1:
        score += 8
    
    # Recently accessed bonus
    last_accessed = user_progress.get(candidate_lesson.get('id'), {}).get('last_accessed')
    if last_accessed:
        score += 3
    
    return score

def get_recommendation_reason(current_lesson, candidate_lesson):
    """Get human-readable reason for recommendation"""
    if current_lesson.get('category') == candidate_lesson.get('category'):
        return f"Next in {candidate_lesson.get('category', 'this')} series"
    
    difficulty_order = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
    current_diff = difficulty_order.get(current_lesson.get('difficulty', 'beginner'), 1)
    candidate_diff = difficulty_order.get(candidate_lesson.get('difficulty', 'beginner'), 1)
    
    if candidate_diff > current_diff:
        return "Ready for next difficulty level"
    
    return "Recommended based on your progress"

def update_user_rewards(user_id, xp_gained, coins_gained):
    """Update user's total XP and PyCoins"""
    try:
        firebase_service = FirebaseService()
        firebase_service.update_user_rewards(user_id, xp_gained, coins_gained)
    except Exception as e:
        logger.error(f"Failed to update user rewards: {str(e)}")
