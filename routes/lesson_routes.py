"""
Lesson routes for Code with Morais
"""
import os
import traceback
from datetime import datetime
from flask import Blueprint, render_template, request, jsonify, session, current_app
from models.user import get_current_user, get_user_progress
from models.lesson import get_lesson, get_all_lessons, calculate_overall_progress
from models.activity import track_activity
from config import get_config

lesson_bp = Blueprint('lesson', __name__)

@lesson_bp.route('/lessons')
def lessons():
    """Lessons overview page"""
    current_app.logger.info("=== LESSONS ROUTE STARTED ===")
    try:
        current_app.logger.info("Getting config...")
        config = get_config()
        
        current_app.logger.info("Getting current user...")
        user = get_current_user()
        
        current_app.logger.info("Getting all lessons...")
        lessons_data = get_all_lessons()
        current_app.logger.info(f"Retrieved {len(lessons_data)} lessons for /lessons route")
        
        # Debug: Print first lesson structure
        if lessons_data:
            first_lesson = lessons_data[0]
            current_app.logger.info(f"First lesson: {first_lesson.get('title', 'No title')} with fields: {list(first_lesson.keys())}")
        else:
            current_app.logger.warning("No lessons data retrieved!")
        
        current_app.logger.info("Getting user progress...")
        user_progress = get_user_progress(user['uid'] if user else 'dev-user-001')
        
        current_app.logger.info("Enhancing lessons with user progress...")
        # Enhance lessons with user progress
        for lesson in lessons_data:
            lesson_id = lesson['id']
            if lesson_id in user_progress:
                progress_data = user_progress[lesson_id]
                lesson['completed'] = progress_data.get('completed', False)
                lesson['completed_subtopics'] = len(progress_data.get('completed_subtopics', []))
                lesson['progress'] = progress_data.get('progress', 0)
            else:
                lesson['completed'] = False
                lesson['completed_subtopics'] = 0
                lesson['progress'] = 0
        
        current_app.logger.info("Calculating overall progress...")
        # Calculate overall progress
        overall_progress = calculate_overall_progress(user['uid'] if user else 'dev-user-001', user_progress)
        
        current_app.logger.info(f"Rendering lessons template with {len(lessons_data)} lessons and {overall_progress}% progress")
        
        # Get Google Client ID for auth
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        
        result = render_template('pages/lessons.html', 
                             user=user, 
                             lessons=lessons_data,
                             overall_progress=overall_progress,
                             google_client_id=google_client_id)
        current_app.logger.info("Template rendered successfully")
        return result
    except Exception as e:
        current_app.logger.error(f"EXCEPTION in lessons route: {str(e)}")
        current_app.logger.error(f"Exception type: {type(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': 'Failed to load lessons'}), 500

@lesson_bp.route('/lesson-view/<lesson_id>')
def lesson_view(lesson_id):
    """Individual lesson page - renamed to avoid conflicts"""
    try:
        current_app.logger.info(f"=== LESSON VIEW ROUTE STARTED for lesson_id: {lesson_id} ===")
        
        config = get_config()
        current_app.logger.info("Got config")
        
        user = get_current_user()
        current_app.logger.info(f"Got user: {user.get('name', 'Anonymous') if user else 'None'}")
        
        # Get lesson data using the lesson model
        current_app.logger.info(f"Loading lesson data for: {lesson_id}")
        lesson_data = get_lesson(lesson_id)
        current_app.logger.info(f"Lesson data loaded: {bool(lesson_data)}")
        
        if not lesson_data:
            current_app.logger.error(f"Lesson {lesson_id} not found")
            return "Lesson not found", 404
        
        current_app.logger.info(f"Lesson title: {lesson_data.get('title', 'No title')}")
        
        # Get user progress for this lesson
        current_app.logger.info("Loading user progress")
        user_progress = get_user_progress(user['uid'] if user else 'dev-user-001')
        lesson_progress = user_progress.get(lesson_id, {})
        current_app.logger.info(f"User progress for lesson: {lesson_progress}")
        
        # Track lesson start if Firebase is available
        firebase_service = current_app.config.get('firebase_service')
        if user and firebase_service and firebase_service.is_available():
            current_app.logger.info("Tracking lesson start activity")
            track_activity(user['uid'], 'lesson_started', {
                'lesson_id': lesson_id,
                'lesson_title': lesson_data.get('title', '')
            })
        else:
            current_app.logger.info("Skipping activity tracking (no Firebase or no user)")
        
        current_app.logger.info("Rendering lesson template")
        # Get Google Client ID for auth
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        
        return render_template('lesson.html', 
                             user=user, 
                             lesson=lesson_data,
                             lesson_progress=lesson_progress,
                             google_client_id=google_client_id)
    except Exception as e:
        current_app.logger.error(f"Error in lesson route: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return "Error loading lesson", 500

@lesson_bp.route('/lesson/<lesson_id>')
@lesson_bp.route('/lesson/<lesson_id>/<subtopic_id>')
def lesson_fixed(lesson_id, subtopic_id=None):
    """Individual lesson page with Firebase block transformation and subtopic support"""
    try:
        current_app.logger.info(f"=== LESSON ROUTE STARTED for lesson_id: {lesson_id}, subtopic_id: {subtopic_id} ===")
        
        config = get_config()
        current_app.logger.info("Got config")
        
        user = get_current_user()
        current_app.logger.info(f"Got user: {user.get('name', 'Anonymous') if user else 'None'}")
        
        # Get lesson data using the lesson model
        current_app.logger.info(f"Loading lesson data for: {lesson_id}")
        lesson_data = get_lesson(lesson_id)
        current_app.logger.info(f"Lesson data loaded: {bool(lesson_data)}")
        
        if not lesson_data:
            current_app.logger.error(f"Lesson {lesson_id} not found")
            return "Lesson not found", 404
            
        # Handle subtopic navigation
        if subtopic_id:
            # Validate subtopic exists
            valid_subtopic = False
            if 'subtopics' in lesson_data:
                for subtopic in lesson_data['subtopics']:
                    if subtopic.get('id') == subtopic_id:
                        valid_subtopic = True
                        break
            
            if not valid_subtopic:
                current_app.logger.error(f"Subtopic {subtopic_id} not found in lesson {lesson_id}")
                return f"Subtopic {subtopic_id} not found", 404
                
            current_app.logger.info(f"Valid subtopic found: {subtopic_id}")
        
        # Add subtopic navigation info to lesson data
        if 'subtopics' in lesson_data and lesson_data['subtopics']:
            lesson_data['has_subtopics'] = True
            lesson_data['current_subtopic'] = subtopic_id
            
            # Find current subtopic index
            current_subtopic_index = 0
            if subtopic_id:
                for i, subtopic in enumerate(lesson_data['subtopics']):
                    if subtopic.get('id') == subtopic_id:
                        current_subtopic_index = i
                        break
            
            lesson_data['current_subtopic_index'] = current_subtopic_index
        else:
            lesson_data['has_subtopics'] = False
            lesson_data['current_subtopic'] = None
            lesson_data['current_subtopic_index'] = 0

        current_app.logger.info(f"Lesson title: {lesson_data.get('title', 'No title')}")
        
        # Get user progress for this lesson
        current_app.logger.info("Loading user progress")
        user_progress = get_user_progress(user['uid'] if user else 'dev-user-001')
        lesson_progress = user_progress.get(lesson_id, {})
        current_app.logger.info(f"User progress for lesson: {lesson_progress}")
        
        # CRITICAL FIX: Only transform to blocks if requested by frontend
        firebase_service = current_app.config.get('firebase_service')
        if (
            firebase_service and firebase_service.is_available() and not lesson_data.get('blocks')
            and request.args.get('format') == 'blocks'
        ):
            current_app.logger.info("🔄 Transforming Firebase lesson data to blocks format (on request)...")
            lesson_data = transform_lesson_to_blocks(lesson_data)
            current_app.logger.info(f"✅ Transformation complete. Blocks created: {len(lesson_data.get('blocks', []))}")
        
        # Get user progress for this lesson
        current_app.logger.info("Loading user progress")
        user_progress = get_user_progress(user['uid'] if user else 'dev-user-001')
        lesson_progress = user_progress.get(lesson_id, {})
        current_app.logger.info(f"User progress for lesson: {lesson_progress}")
        
        # Track lesson start if Firebase is available
        if user and firebase_service and firebase_service.is_available():
            current_app.logger.info("Tracking lesson start activity")
            track_activity(user['uid'], 'lesson_started', {
                'lesson_id': lesson_id,
                'lesson_title': lesson_data.get('title', '')
            })
        else:
            current_app.logger.info("Skipping activity tracking (no Firebase or no user)")
        
        current_app.logger.info("Rendering lesson template")
        # Get Google Client ID for auth
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        
        return render_template('lesson.html', 
                             user=user, 
                             lesson=lesson_data,
                             lesson_progress=lesson_progress,
                             google_client_id=google_client_id)
    except Exception as e:
        current_app.logger.error(f"Error in lesson route: {str(e)}")
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return "Error loading lesson", 500

@lesson_bp.route('/api/lesson/complete-subtopic', methods=['POST'])
def complete_subtopic():
    """Mark a lesson subtopic as complete"""
    try:
        config = get_config()
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        data = request.json
        lesson_id = data.get('lesson_id')
        subtopic_id = data.get('subtopic_id')
        
        if not lesson_id or not subtopic_id:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Get Firebase service
        firebase_service = current_app.config.get('firebase_service')
        
        # In dev mode or if Firebase unavailable, return mock response
        if config.DEV_MODE or not (firebase_service and firebase_service.is_available()):
            return jsonify({
                'success': True,
                'xp_earned': 50,
                'new_progress': 66,
                'lesson_completed': False
            })
        
        # Update user progress using Firebase service
        user_data = firebase_service.get_user(user['uid'])
        if not user_data:
            return jsonify({'error': 'User not found'}), 404
        
        # Get or create lesson progress
        lesson_progress = user_data.get('lesson_progress', {})
        if lesson_id not in lesson_progress:
            lesson_progress[lesson_id] = {
                'completed': False,
                'completed_subtopics': [],
                'progress': 0
            }
        
        # Add subtopic if not already completed
        if subtopic_id not in lesson_progress[lesson_id]['completed_subtopics']:
            lesson_progress[lesson_id]['completed_subtopics'].append(subtopic_id)
            
            # Calculate progress - get lesson info
            lesson_data = get_lesson(lesson_id)
            total_subtopics = len(lesson_data.get('subtopics', [])) if lesson_data else 3
            completed_count = len(lesson_progress[lesson_id]['completed_subtopics'])
            progress = int((completed_count / total_subtopics) * 100) if total_subtopics > 0 else 0
            
            lesson_progress[lesson_id]['progress'] = progress
            
            # Check if lesson is complete
            lesson_completed = completed_count >= total_subtopics
            if lesson_completed:
                lesson_progress[lesson_id]['completed'] = True
                xp_earned = lesson_data.get('xp_reward', 100) if lesson_data else 100
            else:
                xp_earned = 50  # XP for subtopic completion
            
            # Update user data
            update_data = {
                'lesson_progress': lesson_progress,
                'xp': user_data.get('xp', 0) + xp_earned
            }
            
            if firebase_service.update_user(user['uid'], update_data):
                # Track activity
                track_activity(user['uid'], 'subtopic_completed', {
                    'lesson_id': lesson_id,
                    'subtopic_id': subtopic_id,
                    'xp_earned': xp_earned
                })
                
                return jsonify({
                    'success': True,
                    'xp_earned': xp_earned,
                    'new_progress': progress,
                    'lesson_completed': lesson_completed
                })
            else:
                return jsonify({'error': 'Failed to update progress'}), 500
        
        # Subtopic already completed
        return jsonify({
            'success': False,
            'message': 'Subtopic already completed'
        })
        
    except Exception as e:
        current_app.logger.error(f"Error in complete_subtopic: {str(e)}")
        return jsonify({'error': 'Failed to complete subtopic'}), 500

@lesson_bp.route('/lesson-debug/<lesson_id>')
def lesson_debug(lesson_id):
    """Debug lesson page with simple template"""
    try:
        current_app.logger.info(f"=== LESSON DEBUG ROUTE for lesson_id: {lesson_id} ===")
        
        user = get_current_user()
        lesson_data = get_lesson(lesson_id)
        
        if not lesson_data:
            return "Lesson not found", 404
        
        # Use main lesson template for debug
        # Get Google Client ID for auth
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        
        return render_template('lesson.html', 
                             user=user, 
                             lesson=lesson_data,
                             lesson_progress={},
                             google_client_id=google_client_id)
    except Exception as e:
        current_app.logger.error(f"Error in debug lesson route: {str(e)}")
        return f"Debug Error: {str(e)}", 500

@lesson_bp.route('/lesson-minimal/<lesson_id>')
def lesson_minimal(lesson_id):
    """Minimal lesson page for testing"""
    try:
        current_app.logger.info(f"=== LESSON MINIMAL ROUTE for lesson_id: {lesson_id} ===")
        
        user = get_current_user()
        lesson_data = get_lesson(lesson_id)
        
        if not lesson_data:
            return "Lesson not found", 404
        
        # Use minimal test template
        # Get Google Client ID for auth
        google_client_id = os.environ.get('GOOGLE_CLIENT_ID')
        
        return render_template('test_minimal.html', 
                             user=user, 
                             lesson=lesson_data,
                             google_client_id=google_client_id)
    except Exception as e:
        current_app.logger.error(f"Error in minimal lesson route: {str(e)}")
        return f"Minimal Error: {str(e)}", 500

@lesson_bp.route('/api/lesson/<lesson_id>')
def api_get_lesson(lesson_id):
    """API endpoint to get lesson data in JSON format"""
    try:
        current_app.logger.info(f"=== API LESSON REQUEST for lesson_id: {lesson_id} ===")
        
        # Get lesson data using the lesson model
        lesson_data = get_lesson(lesson_id)
        
        if not lesson_data:
            current_app.logger.error(f"Lesson {lesson_id} not found via API")
            return jsonify({'error': 'Lesson not found'}), 404
        
        # Ensure lesson data is in blocks format for API consumers
        if not lesson_data.get('blocks') or not isinstance(lesson_data['blocks'], list):
            lesson_data = transform_lesson_to_blocks(lesson_data)
            
        # Create default blocks if there are none
        if not lesson_data.get('blocks') or len(lesson_data.get('blocks', [])) == 0:
            current_app.logger.info(f"Creating default blocks for lesson {lesson_id}")
            lesson_data['blocks'] = [
                {
                    'id': 'intro-block',
                    'type': 'text',
                    'title': 'Introduction',
                    'content': lesson_data.get('description', 'Welcome to this lesson!'),
                    'order': 0
                }
            ]
            
            # If there's content, add it as a block
            if lesson_data.get('content'):
                lesson_data['blocks'].append({
                    'id': 'content-block',
                    'type': 'text',
                    'title': 'Content',
                    'content': lesson_data.get('content'),
                    'order': 1
                })
        
        current_app.logger.info(f"API returning lesson data for: {lesson_data.get('title', 'Unknown')} with {len(lesson_data.get('blocks', []))} blocks")
        return jsonify(lesson_data)
        
    except Exception as e:
        current_app.logger.error(f"Error in API lesson route: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@lesson_bp.route('/api/lesson/<lesson_id>/progress')
def api_get_lesson_progress(lesson_id):
    """API endpoint to get user progress for a lesson"""
    try:
        current_app.logger.info(f"=== API PROGRESS REQUEST for lesson_id: {lesson_id} ===")
        
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Not authenticated'}), 401
        
        # Get user progress for this lesson
        user_progress = get_user_progress(user['uid'])
        lesson_progress = user_progress.get(lesson_id, {
            'completed': False,
            'progress': 0,
            'completed_blocks': [],
            'current_block': None,
            'time_spent': 0,
            'last_accessed': None
        })
        
        current_app.logger.info(f"API returning progress for lesson {lesson_id}")
        return jsonify({'progress': lesson_progress})
        
    except Exception as e:
        current_app.logger.error(f"Error in API progress route: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@lesson_bp.route('/api/execute', methods=['POST'])
def api_execute_code():
    """API endpoint to execute Python code (simple simulation)"""
    try:
        data = request.json
        code = data.get('code', '')
        
        if not code.strip():
            return jsonify({'error': 'No code provided'}), 400
        
        # Simple simulation - in production, use a sandboxed execution environment
        current_app.logger.info(f"Code execution request: {code[:50]}...")
        
        # Simulate successful execution
        return jsonify({
            'success': True,
            'output': f'Code executed successfully!\nOutput: Hello, World!',
            'execution_time': 0.05
        })
        
    except Exception as e:
        current_app.logger.error(f"Error in code execution: {str(e)}")
        return jsonify({'error': 'Execution failed'}), 500

def transform_lesson_to_blocks(lesson_data):
    """Transform Firebase lesson format to unified block structure for frontend"""
    current_app.logger.info("🔄 Starting lesson transformation to blocks...")
    
    if not lesson_data:
        return lesson_data
    
    # If blocks already exist, return as-is
    if lesson_data.get('blocks') and isinstance(lesson_data['blocks'], list):
        current_app.logger.info("✅ Lesson already has blocks structure")
        return lesson_data

    blocks = []
    block_id_counter = 0
    
    # 1. Convert content string to text blocks
    if lesson_data.get('content') and isinstance(lesson_data['content'], str):
        current_app.logger.info("📝 Converting content string to text blocks...")
        
        # Split content into meaningful sections
        content_sections = lesson_data['content'].split('\n\n')
        for section in content_sections:
            section = section.strip()
            if section:  # Only add non-empty sections
                blocks.append({
                    'id': f'text-{block_id_counter}',
                    'type': 'text',
                    'content': section,
                    'order': block_id_counter,
                    'completed': False
                })
                block_id_counter += 1
        
        current_app.logger.info(f"📝 Created {len([b for b in blocks if b['type'] == 'text'])} text blocks")
    
    # 2. Convert code_examples to code blocks
    if lesson_data.get('code_examples') and isinstance(lesson_data['code_examples'], list):
        current_app.logger.info("💻 Converting code examples to code blocks...")
        
        for example in lesson_data['code_examples']:
            blocks.append({
                'id': f'code-{block_id_counter}',
                'type': 'code_example',
                'title': example.get('title', f'Code Example {block_id_counter}'),
                'code': example.get('code', ''),
                'explanation': example.get('explanation', ''),
                'language': example.get('language', 'python'),
                'order': block_id_counter,
                'completed': False,
                'interactive': True,
                'can_run': True,
                'can_copy': True
            })
            block_id_counter += 1
        
        current_app.logger.info(f"💻 Created {len([b for b in blocks if b['type'] == 'code_example'])} code blocks")
    
    # 3. Convert exercises to interactive blocks
    if lesson_data.get('exercises') and isinstance(lesson_data['exercises'], list):
        current_app.logger.info("🚀 Converting exercises to interactive blocks...")
        
        for exercise in lesson_data['exercises']:
            blocks.append({
                'id': f'exercise-{block_id_counter}',
                'type': 'interactive',
                'title': exercise.get('title', f'Exercise {block_id_counter}'),
                'description': exercise.get('description', ''),
                'instructions': exercise.get('instructions', exercise.get('description', '')),
                'starter_code': exercise.get('starter_code', ''),
                'solution': exercise.get('solution', ''),
                'hints': exercise.get('hints', []),
                'test_cases': exercise.get('tests', []),
                'order': block_id_counter,
                'completed': False,
                'interactive': True,
                'requires_completion': True,
                'editor_settings': {
                    'language': 'python',
                    'theme': 'monokai',
                    'fontSize': 14,
                    'showLineNumbers': True
                }
            })
            block_id_counter += 1
        
        current_app.logger.info(f"🚀 Created {len([b for b in blocks if b['type'] == 'interactive'])} interactive blocks")
    
    # 4. Add quiz block if quiz_id exists
    if lesson_data.get('quiz_id'):
        current_app.logger.info("🧠 Adding quiz block...")
        
        blocks.append({
            'id': f'quiz-{lesson_data["quiz_id"]}',
            'type': 'quiz',
            'quiz_id': lesson_data['quiz_id'],
            'title': 'Knowledge Check',
            'description': 'Test your understanding of this lesson',
            'order': block_id_counter,
            'completed': False,
            'interactive': True,
            'requires_completion': True,
            'scoring': {
                'passing_score': 70,
                'max_attempts': 3,
                'show_correct_answers': True
            }
        })
        block_id_counter += 1
        
        current_app.logger.info("🧠 Created quiz block")
    
    # 5. Add navigation blocks for better UX
    if len(blocks) > 0:
        # Add lesson summary block at the end
        blocks.append({
            'id': 'lesson-summary',
            'type': 'summary',
            'title': 'Lesson Summary',
            'description': f'You have completed {lesson_data.get("title", "this lesson")}!',
            'order': block_id_counter,
            'completed': False,
            'summary_points': [
                f'Completed {len([b for b in blocks if b["type"] == "text"])} concept sections',
                f'Practiced with {len([b for b in blocks if b["type"] == "code_example"])} code examples',
                f'Solved {len([b for b in blocks if b["type"] == "interactive"])} exercises'
            ],
            'rewards': {
                'xp': lesson_data.get('xp_reward', 50),
                'pycoins': lesson_data.get('pycoins_reward', 10)
            }
        })
        block_id_counter += 1

    # Sort blocks by order to ensure proper sequence
    blocks.sort(key=lambda x: x.get('order', 0))
    
    # Add metadata to lesson
    lesson_data.update({
        'blocks': blocks,
        'total_blocks': len(blocks),
        'interactive_blocks': len([b for b in blocks if b.get('interactive', False)]),
        'estimated_completion_time': len(blocks) * 2,  # 2 minutes per block estimate
        'block_types': list(set(block['type'] for block in blocks)),
        'transformation_timestamp': datetime.now().isoformat(),
        'version': '2.0'
    })
    
    current_app.logger.info(f"✅ Transformation complete! Created {len(blocks)} total blocks:")
    for block in blocks:
        current_app.logger.info(f"  - {block['type']}: {block.get('title', block.get('id'))}")
    
    return lesson_data
