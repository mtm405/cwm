#!/usr/bin/env python3
"""
API Endpoint to Delete All Lessons
Add this to your Flask routes or run as standalone script
"""

from flask import Flask, jsonify, request
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from services.firebase_service import FirebaseService
except ImportError:
    print("❌ Could not import FirebaseService")

app = Flask(__name__)

@app.route('/api/admin/delete-all-lessons', methods=['POST'])
def delete_all_lessons_endpoint():
    """API endpoint to delete all lessons"""
    
    # Security check - require admin confirmation
    confirmation = request.json.get('confirmation') if request.json else None
    
    if confirmation != 'DELETE_ALL_LESSONS_CONFIRMED':
        return jsonify({
            'success': False,
            'error': 'Missing or invalid confirmation',
            'required': 'Send POST with {"confirmation": "DELETE_ALL_LESSONS_CONFIRMED"}'
        }), 400
    
    try:
        firebase_service = FirebaseService()
        
        if not firebase_service.is_available():
            return jsonify({
                'success': False,
                'error': 'Firebase service not available'
            }), 500
        
        # Get all lessons first
        lessons = firebase_service.get_all_lessons()
        
        if not lessons:
            return jsonify({
                'success': True,
                'message': 'No lessons found to delete',
                'deleted_count': 0
            })
        
        # Delete each lesson
        deleted_count = 0
        failed_lessons = []
        
        for lesson in lessons:
            lesson_id = lesson.get('id')
            try:
                firebase_service.db.collection('lessons').document(lesson_id).delete()
                deleted_count += 1
            except Exception as e:
                failed_lessons.append({
                    'id': lesson_id,
                    'error': str(e)
                })
        
        result = {
            'success': True,
            'deleted_count': deleted_count,
            'total_lessons': len(lessons),
            'failed_count': len(failed_lessons)
        }
        
        if failed_lessons:
            result['failed_lessons'] = failed_lessons
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/admin/delete-user-progress', methods=['POST'])
def delete_user_progress_endpoint():
    """API endpoint to delete all user progress"""
    
    # Security check
    confirmation = request.json.get('confirmation') if request.json else None
    
    if confirmation != 'DELETE_ALL_PROGRESS_CONFIRMED':
        return jsonify({
            'success': False,
            'error': 'Missing or invalid confirmation',
            'required': 'Send POST with {"confirmation": "DELETE_ALL_PROGRESS_CONFIRMED"}'
        }), 400
    
    try:
        firebase_service = FirebaseService()
        
        if not firebase_service.is_available():
            return jsonify({
                'success': False,
                'error': 'Firebase service not available'
            }), 500
        
        # Delete user progress
        users_ref = firebase_service.db.collection('user_progress')
        users = users_ref.stream()
        
        deleted_users = 0
        total_lessons_deleted = 0
        
        for user_doc in users:
            user_id = user_doc.id
            
            # Delete all lesson progress for this user
            lessons_ref = users_ref.document(user_id).collection('lessons')
            lessons = lessons_ref.stream()
            
            user_lessons_deleted = 0
            for lesson_doc in lessons:
                lesson_doc.reference.delete()
                user_lessons_deleted += 1
            
            if user_lessons_deleted > 0:
                deleted_users += 1
                total_lessons_deleted += user_lessons_deleted
        
        return jsonify({
            'success': True,
            'deleted_users': deleted_users,
            'total_lesson_progress_deleted': total_lessons_deleted
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚀 Lesson Deletion API Server")
    print("=" * 40)
    print("Available endpoints:")
    print("POST /api/admin/delete-all-lessons")
    print("POST /api/admin/delete-user-progress")
    print("\nStarting server on http://localhost:5001")
    app.run(debug=True, port=5001)
