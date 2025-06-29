"""
Content uploader for migrating mock data to Firebase
"""
import sys
import os
from datetime import datetime

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService
from config import get_config
import logging

logger = logging.getLogger(__name__)

class ContentUploader:
    def __init__(self):
        self.config = get_config()
        try:
            self.firebase = FirebaseService(self.config.FIREBASE_CONFIG)
            self.firebase_available = True
            print("✅ Firebase connection established")
        except Exception as e:
            print(f"⚠️  Firebase connection failed: {e}")
            print("📝 Running in mock mode - will show what would be uploaded")
            self.firebase = None
            self.firebase_available = False
    
    def upload_mock_lessons_to_firebase(self):
        """Upload all mock lessons to Firebase for testing"""
        try:
            from models.lesson import get_mock_lesson
            
            # List of lesson IDs to upload
            lesson_ids = ['python-basics', 'control-flow', 'functions']
            uploaded = []
            
            for lesson_id in lesson_ids:
                try:
                    lesson_data = get_mock_lesson(lesson_id)
                    if lesson_data:
                        # Add metadata
                        lesson_data.update({
                            'created_at': datetime.now(),
                            'updated_at': datetime.now(),
                            'version': '1.0',
                            'status': 'published'
                        })
                        
                        if self.firebase_available:
                            if self.firebase.save_lesson(lesson_id, lesson_data):
                                uploaded.append(lesson_id)
                                print(f"✅ Uploaded lesson: {lesson_id}")
                            else:
                                print(f"❌ Failed to upload lesson: {lesson_id}")
                        else:
                            uploaded.append(lesson_id)
                            print(f"📝 Would upload lesson: {lesson_id} - {lesson_data.get('title', 'No title')}")
                    else:
                        print(f"⚠️  No data found for lesson: {lesson_id}")
                        
                except Exception as e:
                    print(f"❌ Error uploading lesson {lesson_id}: {str(e)}")
            
            return uploaded
            
        except Exception as e:
            print(f"❌ Error in upload_mock_lessons_to_firebase: {str(e)}")
            return []
    
    def upload_mock_quizzes_to_firebase(self):
        """Upload all mock quizzes to Firebase"""
        try:
            from models.quiz import get_mock_quiz
            
            quiz_ids = ['python-basics-quiz']
            uploaded = []
            
            for quiz_id in quiz_ids:
                try:
                    quiz_data = get_mock_quiz(quiz_id)
                    if quiz_data:
                        # Add metadata
                        quiz_data.update({
                            'created_at': datetime.now(),
                            'updated_at': datetime.now(),
                            'version': '1.0',
                            'status': 'published'
                        })
                        
                        if self.firebase.save_quiz(quiz_id, quiz_data):
                            uploaded.append(quiz_id)
                            print(f"✅ Uploaded quiz: {quiz_id}")
                        else:
                            print(f"❌ Failed to upload quiz: {quiz_id}")
                    else:
                        print(f"⚠️  No data found for quiz: {quiz_id}")
                        
                except Exception as e:
                    print(f"❌ Error uploading quiz {quiz_id}: {str(e)}")
            
            return uploaded
            
        except Exception as e:
            print(f"❌ Error in upload_mock_quizzes_to_firebase: {str(e)}")
            return []
    
    def create_sample_users(self):
        """Create sample users for testing"""
        if not self.firebase.is_available():
            print("❌ Firebase not available for user creation")
            return []
        
        try:
            from firebase_admin import firestore
            
            sample_users = [
                {
                    'uid': 'dev_user_001',
                    'email': 'test1@codewithmorais.com',
                    'username': 'PythonLearner',
                    'xp': 150,
                    'pycoins': 75,
                    'level': 2,
                    'streak': 1,
                    'lesson_progress': {},
                    'quiz_scores': {},
                    'created_at': firestore.SERVER_TIMESTAMP,
                    'last_login': firestore.SERVER_TIMESTAMP
                },
                {
                    'uid': 'dev_user_002', 
                    'email': 'test2@codewithmorais.com',
                    'username': 'CodeNinja',
                    'xp': 450,
                    'pycoins': 200,
                    'level': 4,
                    'streak': 5,
                    'lesson_progress': {
                        'python-basics': {
                            'completed': True, 
                            'progress': 100,
                            'completed_subtopics': ['variables', 'data-types']
                        }
                    },
                    'quiz_scores': {
                        'python-basics-quiz': 85
                    },
                    'created_at': firestore.SERVER_TIMESTAMP,
                    'last_login': firestore.SERVER_TIMESTAMP
                }
            ]
            
            created = []
            for user in sample_users:
                try:
                    if self.firebase.create_user(user['uid'], user):
                        created.append(user['username'])
                        print(f"✅ Created sample user: {user['username']}")
                    else:
                        print(f"❌ Failed to create user: {user['username']}")
                except Exception as e:
                    print(f"❌ Error creating user {user['username']}: {str(e)}")
            
            return created
            
        except Exception as e:
            print(f"❌ Error in create_sample_users: {str(e)}")
            return []
    
    def create_daily_challenges(self):
        """Create sample daily challenges"""
        if not self.firebase.is_available():
            print("❌ Firebase not available for daily challenges")
            return []
        
        try:
            from datetime import datetime, timedelta
            
            # Create challenges for the next 7 days
            challenges = []
            base_date = datetime.now()
            
            sample_challenges = [
                {
                    'title': 'Hello World Challenge',
                    'description': 'Write a program that prints "Hello, World!"',
                    'difficulty': 'beginner',
                    'xp_reward': 50,
                    'coin_reward': 10,
                    'code_template': '# Write your code here\n',
                    'expected_output': 'Hello, World!',
                    'test_cases': [
                        {'input': '', 'expected': 'Hello, World!'}
                    ]
                },
                {
                    'title': 'Variables Practice',
                    'description': 'Create variables and print their values',
                    'difficulty': 'beginner',
                    'xp_reward': 75,
                    'coin_reward': 15,
                    'code_template': '# Create variables name and age\n# Print them',
                    'expected_output': 'Name: Python\nAge: 30',
                    'test_cases': [
                        {'input': '', 'expected': 'Name: Python\nAge: 30'}
                    ]
                }
            ]
            
            for i, challenge_data in enumerate(sample_challenges):
                date_str = (base_date + timedelta(days=i)).strftime('%Y-%m-%d')
                
                challenge_data.update({
                    'date': date_str,
                    'created_at': datetime.now(),
                    'status': 'active'
                })
                
                challenge_ref = self.firebase.db.collection('daily_challenges').document(date_str)
                challenge_ref.set(challenge_data)
                challenges.append(date_str)
                print(f"✅ Created daily challenge for {date_str}")
            
            return challenges
            
        except Exception as e:
            print(f"❌ Error creating daily challenges: {str(e)}")
            return []
    
    def verify_upload(self):
        """Verify that data was uploaded correctly"""
        print("\n🔍 Verifying upload...")
        
        # Check lessons
        lessons = self.firebase.get_all_lessons()
        print(f"📚 Lessons in Firebase: {len(lessons)}")
        for lesson in lessons:
            print(f"   - {lesson.get('id')}: {lesson.get('title')}")
        
        # Check users
        if self.firebase.is_available():
            try:
                users_count = 0
                users_ref = self.firebase.db.collection('users')
                for doc in users_ref.limit(10).stream():
                    users_count += 1
                print(f"👥 Sample users created: {users_count}")
            except Exception as e:
                print(f"❌ Error checking users: {str(e)}")
        
        print("✅ Verification complete")

# Quick script to upload content
if __name__ == '__main__':
    print("🚀 Content Uploader for Code with Morais")
    print("=" * 50)
    
    uploader = ContentUploader()
    
    if not uploader.firebase.is_available():
        print("❌ Firebase not available. Check your .env configuration.")
        sys.exit(1)
    
    try:
        # Upload lessons
        print("\n📚 Uploading lessons...")
        lessons = uploader.upload_mock_lessons_to_firebase()
        
        # Upload quizzes  
        print("\n🧠 Uploading quizzes...")
        quizzes = uploader.upload_mock_quizzes_to_firebase()
        
        # Create sample users
        print("\n👥 Creating sample users...")
        users = uploader.create_sample_users()
        
        # Create daily challenges
        print("\n🎯 Creating daily challenges...")
        challenges = uploader.create_daily_challenges()
        
        # Verify
        uploader.verify_upload()
        
        print(f"\n🎉 Upload completed successfully!")
        print(f"   - Lessons: {len(lessons)}")
        print(f"   - Quizzes: {len(quizzes)}")
        print(f"   - Users: {len(users)}")
        print(f"   - Challenges: {len(challenges)}")
        
    except Exception as e:
        print(f"❌ Upload failed: {str(e)}")
        sys.exit(1)
