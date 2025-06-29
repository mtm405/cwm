"""
Lesson API routes for Code with Morais
Provides API endpoints for lesson data
"""
from flask import Blueprint, jsonify, request, current_app
from models.user import get_current_user, get_user_progress
from models.lesson import get_all_lessons, get_lesson, calculate_overall_progress
from models.quiz import get_quiz
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
        from models.user import update_lesson_progress
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
