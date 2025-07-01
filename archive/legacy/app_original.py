import os
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore, auth
from datetime import datetime, timedelta
import json
import random

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Dev mode flag
DEV_MODE = os.environ.get('DEV_MODE', 'True') == 'True'

# Initialize Firebase only if not in dev mode
if not DEV_MODE:
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate('serviceAccountKey.json')
            firebase_admin.initialize_app(cred)
        db = firestore.client()
    except Exception as e:
        print(f"Firebase initialization failed: {e}")
        DEV_MODE = True
        db = None
else:
    db = None

# Mock user for development
DEV_USER = {
    'uid': 'dev-user-001',
    'email': 'dev@codewithmorais.com',
    'username': 'DevUser',
    'xp': 1500,
    'pycoins': 100,
    'level': 5,
    'streak': 3,
    'last_login': datetime.now().isoformat(),
    'theme': 'dark',
    'completed_lessons': ['python-basics'],
    'quiz_scores': {}
}

def get_current_user():
    """Get current user data - returns dev user in dev mode"""
    if DEV_MODE:
        return DEV_USER
    
    if 'user_id' in session:
        user_ref = db.collection('users').document(session['user_id'])
        user_data = user_ref.get().to_dict()
        return user_data
    return None

def update_user_data(user_id, data):
    """Update user data in Firestore"""
    if DEV_MODE:
        # In dev mode, update the mock user
        DEV_USER.update(data)
        return
    
    if db:
        user_ref = db.collection('users').document(user_id)
        user_ref.update(data)

def award_xp_and_coins(user_id, xp=0, coins=0):
    """Award XP and PyCoins to user"""
    user = get_current_user()
    if user:
        new_xp = user.get('xp', 0) + xp
        new_coins = user.get('pycoins', 0) + coins
        update_user_data(user_id, {
            'xp': new_xp,
            'pycoins': new_coins
        })
        return {'xp': new_xp, 'coins': new_coins}
    return None

@app.route('/')
def index():
    """Landing page"""
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    """User dashboard"""
    user = get_current_user()
    
    # Get leaderboard data
    if DEV_MODE:
        leaderboard = [
            {'username': 'DevUser', 'xp': 1500},
            {'username': 'AlexPython', 'xp': 1200},
            {'username': 'CodeMaster', 'xp': 1000},
            {'username': 'PyNinja', 'xp': 850},
            {'username': 'ScriptKid', 'xp': 750}
        ]
    else:
        if db:
            users_ref = db.collection('users').order_by('xp', direction=firestore.Query.DESCENDING).limit(10)
            leaderboard = [{'username': u.to_dict().get('username'), 'xp': u.to_dict().get('xp', 0)} 
                          for u in users_ref.stream()]
        else:
            leaderboard = []
    
    # Get daily challenge
    daily_challenge = get_daily_challenge()
    
    # Get recent activity
    recent_activity = get_recent_activity(user['uid'] if user else 'dev-user-001')
    
    return render_template('dashboard.html', 
                         user=user, 
                         leaderboard=leaderboard,
                         daily_challenge=daily_challenge,
                         recent_activity=recent_activity)

def get_daily_challenge():
    """Get today's daily challenge"""
    today = datetime.now().strftime('%Y-%m-%d')
    
    if DEV_MODE:
        return {
            'id': f'daily_{today}',
            'title': 'Print Pattern Challenge',
            'description': 'Create a function that prints a pyramid pattern',
            'xp_reward': 100,
            'coin_reward': 25,
            'difficulty': 'medium'
        }
    
    # In production, fetch from Firestore
    challenge_ref = db.collection('daily_challenges').document(today)
    challenge = challenge_ref.get()
    
    if challenge.exists:
        return challenge.to_dict()
    
    return None

def get_recent_activity(user_id):
    """Get user's recent activity"""
    return [
        {
            'type': 'lesson', 
            'message': 'Completed "Variables and Data Types"', 
            'timestamp': datetime.now() - timedelta(hours=1),
            'icon': 'book'
        },
        {
            'type': 'achievement', 
            'message': 'Earned "First Steps" badge', 
            'timestamp': datetime.now() - timedelta(hours=2),
            'icon': 'trophy'
        },
        {
            'type': 'quiz', 
            'message': 'Scored 90% on "Python Basics Quiz"', 
            'timestamp': datetime.now() - timedelta(days=1),
            'icon': 'clipboard-check'
        },
        {
            'type': 'challenge', 
            'message': 'Completed Daily Challenge', 
            'timestamp': datetime.now() - timedelta(days=1),
            'icon': 'calendar-day'
        }
    ]

def get_mock_lessons():
    """Get mock lessons for development"""
    return [
        {
            'id': 'python-basics',
            'title': 'Python Basics',
            'description': 'Learn the fundamentals of Python programming',
            'order': 1,
            'xp_reward': 100,
            'subtopics': ['Variables', 'Data Types', 'Basic Operations']
        },
        {
            'id': 'control-flow',
            'title': 'Control Flow',
            'description': 'Master if statements, loops, and program flow',
            'order': 2,
            'xp_reward': 150,
            'subtopics': ['If Statements', 'For Loops', 'While Loops']
        },
        {
            'id': 'functions',
            'title': 'Functions',
            'description': 'Create reusable code with functions',
            'order': 3,
            'xp_reward': 200,
            'subtopics': ['Defining Functions', 'Parameters', 'Return Values']
        }
    ]

def get_user_progress(user_id):
    """Get user's progress across all lessons"""
    if DEV_MODE:
        # Mock progress for development
        return {
            'python-basics': {'completed': True, 'completed_subtopics': ['variables', 'data-types'], 'progress': 66},
            'flow-control': {'completed': False, 'completed_subtopics': ['if-statements'], 'progress': 33},
            'io-operations': {'completed': False, 'completed_subtopics': [], 'progress': 0},
            'code-structure': {'completed': False, 'completed_subtopics': [], 'progress': 0},
            'error-handling': {'completed': False, 'completed_subtopics': [], 'progress': 0},
            'module-operations': {'completed': False, 'completed_subtopics': [], 'progress': 0}
        }
    
    if db:
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        if user_doc.exists:
            data = user_doc.to_dict()
            return data.get('lesson_progress', {})
    return {}

def calculate_overall_progress(user_id):
    """Calculate overall course progress percentage"""
    lessons = get_mock_lessons()
    progress = get_user_progress(user_id)
    
    total_subtopics = sum(lesson['total_subtopics'] for lesson in lessons)
    completed_subtopics = 0
    
    for lesson_id, lesson_progress in progress.items():
        completed_subtopics += len(lesson_progress.get('completed_subtopics', []))
    
    return int((completed_subtopics / total_subtopics) * 100) if total_subtopics > 0 else 0

@app.route('/lessons')
def lessons():
    """Lessons overview page"""
    user = get_current_user()
    lessons_data = get_mock_lessons()
    user_progress = get_user_progress(user['uid'] if user else 'dev-user-001')
    
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
    
    # Calculate overall progress
    overall_progress = calculate_overall_progress(user['uid'] if user else 'dev-user-001')
    
    return render_template('lessons.html', 
                         user=user, 
                         lessons=lessons_data,
                         overall_progress=overall_progress)

@app.route('/lesson/<lesson_id>')
def lesson(lesson_id):
    """Individual lesson page"""
    user = get_current_user()
    
    # Get lesson data
    if DEV_MODE:
        lesson_data = get_mock_lesson(lesson_id)
    else:
        lesson_ref = db.collection('lessons').document(lesson_id)
        lesson_data = lesson_ref.get().to_dict()
    
    if not lesson_data:
        return "Lesson not found", 404
    
    # Get user progress for this lesson
    user_progress = get_user_progress(user['uid'] if user else 'dev-user-001')
    lesson_progress = user_progress.get(lesson_id, {})
    
    # Track lesson start
    if user and not DEV_MODE:
        track_activity(user['uid'], 'lesson_started', {
            'lesson_id': lesson_id,
            'lesson_title': lesson_data.get('title', '')
        })
    
    return render_template('lesson.html', 
                         user=user, 
                         lesson=lesson_data,
                         lesson_progress=lesson_progress)

@app.route('/api/lesson/complete-subtopic', methods=['POST'])
def complete_subtopic():
    """Mark a lesson subtopic as complete"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.json
    lesson_id = data.get('lesson_id')
    subtopic_id = data.get('subtopic_id')
    
    if not lesson_id or not subtopic_id:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Update user progress
    if DEV_MODE:
        # In dev mode, just return success
        return jsonify({
            'success': True,
            'xp_earned': 50,
            'new_progress': 66,
            'lesson_completed': False
        })
    
    # Update in Firebase
    user_ref = db.collection('users').document(user['uid'])
    user_doc = user_ref.get()
    user_data = user_doc.to_dict() or {}
    
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
        
        # Calculate progress
        lesson_data = get_mock_lesson(lesson_id)  # Get lesson info
        total_subtopics = len(lesson_data.get('subtopics', []))
        completed_count = len(lesson_progress[lesson_id]['completed_subtopics'])
        progress = int((completed_count / total_subtopics) * 100) if total_subtopics > 0 else 0
        
        lesson_progress[lesson_id]['progress'] = progress
        
        # Check if lesson is complete
        lesson_completed = completed_count >= total_subtopics
        if lesson_completed:
            lesson_progress[lesson_id]['completed'] = True
            xp_earned = lesson_data.get('xp_reward', 100)
        else:
            xp_earned = 50  # XP for subtopic completion
        
        # Update user data
        user_ref.update({
            'lesson_progress': lesson_progress,
            'xp': firestore.Increment(xp_earned)
        })
        
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
    
    # Subtopic already completed
    return jsonify({
        'success': False,
        'message': 'Subtopic already completed'
    })

def track_activity(user_id, activity_type, details):
    """Track user activity in Firebase"""
    if DEV_MODE or not db:
        return
    
    activity_data = {
        'user_id': user_id,
        'type': activity_type,
        'details': details,
        'timestamp': datetime.now()
    }
    
    db.collection('activities').add(activity_data)

def get_mock_lesson(lesson_id):
    """Get mock lesson data for development"""
    lessons = {
        'python-basics': {
            'id': 'python-basics',
            'title': 'Python Basics',
            'content': [
                {
                    'type': 'text',
                    'content': '# Welcome to Python Basics!\n\nPython is a powerful, versatile programming language that is perfect for beginners.'
                },
                {
                    'type': 'code_example',
                    'language': 'python',
                    'code': '# This is a comment\nprint("Hello, World!")\n\n# Variables\nname = "Code with Morais"\nage = 16\nprint(f"Welcome to {name}!")'
                },
                {
                    'type': 'interactive_challenge',
                    'id': 'hello_world_challenge',
                    'instructions': 'Write a program that prints your name',
                    'starter_code': '# Write your code here\n',
                    'test_cases': [
                        {'input': '', 'expected_output': 'Hello'}
                    ]
                },
                {
                    'type': 'quiz',
                    'quiz_id': 'python-basics-quiz'
                }
            ],
            'subtopics': [
                {'id': 'variables', 'title': 'Variables', 'order': 1},
                {'id': 'data-types', 'title': 'Data Types', 'order': 2},
                {'id': 'operations', 'title': 'Basic Operations', 'order': 3}
            ]
        },
        'flow-control': {
            'id': 'flow-control',
            'title': 'Flow Control',
            'content': [
                {
                    'type': 'text',
                    'content': '# Flow Control in Python\n\nLearn how to control the flow of your programs with conditions and loops.'
                },
                {
                    'type': 'code_example',
                    'language': 'python',
                    'code': '# If statements\nage = 18\nif age >= 18:\n    print("You are an adult")\nelse:\n    print("You are a minor")\n\n# For loops\nfor i in range(5):\n    print(f"Count: {i}")'
                }
            ],
            'subtopics': [
                {'id': 'if-statements', 'title': 'If Statements', 'order': 1},
                {'id': 'for-loops', 'title': 'For Loops', 'order': 2},
                {'id': 'while-loops', 'title': 'While Loops', 'order': 3}
            ]
        },
        'functions': {
            'id': 'functions',
            'title': 'Functions',
            'content': [
                {
                    'type': 'text',
                    'content': '# Functions in Python\n\nCreate reusable blocks of code with functions.'
                },
                {
                    'type': 'code_example',
                    'language': 'python',
                    'code': 'def greet(name):\n    """Function to greet a person"""\n    print(f"Hello, {name}!")\n\ngreet("Code with Morais")'
                }
            ],
            'subtopics': [
                {'id': 'defining-functions', 'title': 'Defining Functions', 'order': 1},
                {'id': 'parameters', 'title': 'Parameters', 'order': 2},
                {'id': 'return-values', 'title': 'Return Values', 'order': 3}
            ]
        }
    }
    return lessons.get(lesson_id)

def get_mock_quiz(quiz_id):
    """Get mock quiz data for development"""
    quizzes = {
        'python-basics-quiz': {
            'id': 'python-basics-quiz',
            'title': 'Python Basics Quiz',
            'description': 'Test your knowledge of Python basics',
            'passing_score': 70,
            'xp_reward': 100,
            'coin_reward': 20,
            'questions': [
                {
                    'type': 'multiple_choice',
                    'question': 'What is the correct way to print "Hello World" in Python?',
                    'options': [
                        'echo "Hello World"',
                        'print("Hello World")',
                        'console.log("Hello World")',
                        'printf("Hello World")'
                    ],
                    'correct_answer': 'print("Hello World")'
                },
                {
                    'type': 'true_false',
                    'question': 'Python is a case-sensitive language',
                    'correct_answer': 'True'
                },
                {
                    'type': 'fill_blank',
                    'question': 'To create a variable in Python, you use the _____ operator',
                    'correct_answer': '='
                }
            ]
        }
    }
    return quizzes.get(quiz_id)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
