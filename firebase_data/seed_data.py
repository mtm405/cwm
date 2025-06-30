#!/usr/bin/env python3
"""
Firebase Data Seeder for Code with Morais
Uploads comprehensive seed data to Firebase for development and testing
"""
import sys
import os
from datetime import datetime, timedelta
import json

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService
from config import get_config
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FirebaseSeeder:
    def __init__(self):
        self.config = get_config()
        self.firebase = FirebaseService(self.config.FIREBASE_CONFIG)
        
    def seed_all_data(self):
        """Seed all data to Firebase"""
        if not self.firebase.is_available():
            print("❌ Firebase not available. Check your configuration.")
            return False
            
        print("🌱 Starting Firebase data seeding...")
        
        # Seed in order of dependencies
        success_count = 0
        
        # 1. Upload lessons
        if self.seed_lessons():
            success_count += 1
            
        # 2. Upload quizzes  
        if self.seed_quizzes():
            success_count += 1
            
        # 3. Upload daily challenges
        if self.seed_daily_challenges():
            success_count += 1
            
        # 4. Create sample users
        if self.seed_users():
            success_count += 1
            
        # 5. Create achievements
        if self.seed_achievements():
            success_count += 1
            
        print(f"\n✅ Seeding complete! {success_count}/5 categories successful")
        return success_count == 5
    
    def seed_lessons(self):
        """Upload comprehensive lesson data"""
        print("\n📚 Seeding lessons...")
        
        lessons = [
            {
                "id": "python-basics",
                "title": "Python Basics: Variables and Data Types",
                "description": "Learn the fundamentals of Python programming including variables, data types, and basic operations.",
                "category": "fundamentals",
                "difficulty": "beginner",
                "order": 1,
                "estimated_time": 30,
                "xp_reward": 100,
                "coin_reward": 25,
                "prerequisites": [],
                "objectives": [
                    "Understand Python variables and naming conventions",
                    "Learn different data types (int, float, str, bool)",
                    "Practice basic operations and type conversion"
                ],
                "content": {
                    "introduction": "Welcome to Python! In this lesson, you'll learn the building blocks of Python programming.",
                    "sections": [
                        {
                            "title": "Variables in Python",
                            "content": "Variables are containers for storing data values. In Python, you don't need to declare variables explicitly.",
                            "code_examples": [
                                "# Creating variables\nname = 'Marco'\nage = 25\nheight = 5.9\nis_student = True"
                            ],
                            "interactive_code": "# Try creating your own variables\nmy_name = 'Your Name'\nmy_age = 20\nprint(f'Hello, {my_name}! You are {my_age} years old.')"
                        },
                        {
                            "title": "Data Types",
                            "content": "Python has several built-in data types including integers, floats, strings, and booleans.",
                            "code_examples": [
                                "# Different data types\nnumber = 42          # int\npi = 3.14159        # float\ngreeting = 'Hello'  # str\nis_fun = True       # bool"
                            ],
                            "interactive_code": "# Check the type of variables\nprint(type(42))\nprint(type(3.14))\nprint(type('Hello'))\nprint(type(True))"
                        }
                    ]
                },
                "quiz_id": "python-basics-quiz",
                "next_lesson": "control-flow",
                "tags": ["python", "basics", "variables", "data-types"],
                "status": "published",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "id": "control-flow",
                "title": "Control Flow: If Statements and Loops",
                "description": "Master conditional statements and loops to control program execution.",
                "category": "fundamentals", 
                "difficulty": "beginner",
                "order": 2,
                "estimated_time": 45,
                "xp_reward": 120,
                "coin_reward": 30,
                "prerequisites": ["python-basics"],
                "objectives": [
                    "Write conditional statements using if/elif/else",
                    "Create loops using for and while",
                    "Understand loop control with break and continue"
                ],
                "content": {
                    "introduction": "Learn to control the flow of your programs with conditions and loops.",
                    "sections": [
                        {
                            "title": "If Statements",
                            "content": "Use if statements to execute code based on conditions.",
                            "code_examples": [
                                "age = 18\nif age >= 18:\n    print('You can vote!')\nelse:\n    print('Too young to vote')"
                            ],
                            "interactive_code": "# Try your own if statement\nscore = 85\nif score >= 90:\n    grade = 'A'\nelif score >= 80:\n    grade = 'B'\nelse:\n    grade = 'C'\nprint(f'Your grade: {grade}')"
                        }
                    ]
                },
                "quiz_id": "control-flow-quiz",
                "next_lesson": "functions",
                "tags": ["python", "control-flow", "if-statements", "loops"],
                "status": "published",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            },
            {
                "id": "functions",
                "title": "Functions: Organizing Your Code",
                "description": "Learn to create reusable code with functions and understand scope.",
                "category": "fundamentals",
                "difficulty": "intermediate", 
                "order": 3,
                "estimated_time": 50,
                "xp_reward": 150,
                "coin_reward": 35,
                "prerequisites": ["control-flow"],
                "objectives": [
                    "Define and call functions",
                    "Use parameters and return values", 
                    "Understand variable scope"
                ],
                "content": {
                    "introduction": "Functions help you organize code into reusable blocks.",
                    "sections": [
                        {
                            "title": "Defining Functions",
                            "content": "Use the def keyword to create functions.",
                            "code_examples": [
                                "def greet(name):\n    return f'Hello, {name}!'\n\nmessage = greet('Marco')\nprint(message)"
                            ],
                            "interactive_code": "# Create your own function\ndef calculate_area(length, width):\n    return length * width\n\narea = calculate_area(5, 3)\nprint(f'Area: {area}')"
                        }
                    ]
                },
                "quiz_id": "functions-quiz",
                "next_lesson": "data-structures",
                "tags": ["python", "functions", "scope", "parameters"],
                "status": "published",
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
        ]
        
        uploaded = 0
        for lesson in lessons:
            if self.firebase.save_lesson(lesson["id"], lesson):
                print(f"✅ Uploaded lesson: {lesson['title']}")
                uploaded += 1
            else:
                print(f"❌ Failed to upload lesson: {lesson['title']}")
                
        print(f"📚 Lessons seeded: {uploaded}/{len(lessons)}")
        return uploaded == len(lessons)
    
    def seed_quizzes(self):
        """Upload quiz data"""
        print("\n🧠 Seeding quizzes...")
        
        quizzes = [
            {
                "id": "python-basics-quiz",
                "lesson_id": "python-basics",
                "title": "Python Basics Quiz",
                "description": "Test your understanding of Python variables and data types.",
                "questions": [
                    {
                        "id": 1,
                        "type": "multiple_choice",
                        "question": "Which of the following is a valid variable name in Python?",
                        "options": ["2name", "name_2", "name-2", "name 2"],
                        "correct_answer": 1,
                        "explanation": "Variable names can contain letters, numbers, and underscores, but cannot start with a number or contain spaces/hyphens."
                    },
                    {
                        "id": 2,
                        "type": "multiple_choice", 
                        "question": "What is the data type of the value 3.14?",
                        "options": ["int", "float", "str", "bool"],
                        "correct_answer": 1,
                        "explanation": "3.14 is a floating-point number, so its type is float."
                    },
                    {
                        "id": 3,
                        "type": "code_completion",
                        "question": "Complete the code to create a variable named 'message' with the value 'Hello World':",
                        "starter_code": "___ = ___",
                        "correct_answer": "message = 'Hello World'",
                        "explanation": "Use the assignment operator = to assign the string value to the variable."
                    }
                ],
                "time_limit": 600,
                "passing_score": 70,
                "xp_reward": 50,
                "coin_reward": 15,
                "created_at": datetime.now()
            },
            {
                "id": "control-flow-quiz",
                "lesson_id": "control-flow",
                "title": "Control Flow Quiz",
                "description": "Test your knowledge of if statements and loops.",
                "questions": [
                    {
                        "id": 1,
                        "type": "multiple_choice",
                        "question": "What will this code print?\n\nx = 10\nif x > 5:\n    print('Big')\nelse:\n    print('Small')",
                        "options": ["Big", "Small", "Error", "Nothing"],
                        "correct_answer": 0,
                        "explanation": "Since x (10) is greater than 5, the condition is True and 'Big' is printed."
                    }
                ],
                "time_limit": 600,
                "passing_score": 70,
                "xp_reward": 60,
                "coin_reward": 18,
                "created_at": datetime.now()
            }
        ]
        
        uploaded = 0
        for quiz in quizzes:
            if self.firebase.save_quiz(quiz["id"], quiz):
                print(f"✅ Uploaded quiz: {quiz['title']}")
                uploaded += 1
            else:
                print(f"❌ Failed to upload quiz: {quiz['title']}")
                
        print(f"🧠 Quizzes seeded: {uploaded}/{len(quizzes)}")
        return uploaded == len(quizzes)
    
    def seed_daily_challenges(self):
        """Upload daily challenges"""
        print("\n🎯 Seeding daily challenges...")
        
        # Create challenges for the next 7 days
        challenges = []
        base_date = datetime.now().date()
        
        challenge_templates = [
            {
                "title": "List Comprehension Challenge",
                "description": "Create a list of squares using list comprehension",
                "difficulty": "intermediate",
                "problem_statement": "Given a list of numbers [1, 2, 3, 4, 5], create a new list containing the square of each number using list comprehension.",
                "starter_code": "numbers = [1, 2, 3, 4, 5]\n# Your code here\nsquares = ",
                "expected_output": "[1, 4, 9, 16, 25]",
                "xp_reward": 150,
                "coin_reward": 50
            },
            {
                "title": "String Manipulation",
                "description": "Reverse words in a sentence",
                "difficulty": "beginner",
                "problem_statement": "Write a function that takes a sentence and returns it with each word reversed, but the word order stays the same.",
                "starter_code": "def reverse_words(sentence):\n    # Your code here\n    pass\n\n# Test\nresult = reverse_words('Hello World')\nprint(result)  # Should print: 'olleH dlroW'",
                "expected_output": "olleH dlroW",
                "xp_reward": 100,
                "coin_reward": 30
            },
            {
                "title": "FizzBuzz Classic",
                "description": "Implement the classic FizzBuzz problem",
                "difficulty": "beginner",
                "problem_statement": "Print numbers 1 to 20, but replace multiples of 3 with 'Fizz', multiples of 5 with 'Buzz', and multiples of both with 'FizzBuzz'.",
                "starter_code": "for i in range(1, 21):\n    # Your code here\n    pass",
                "expected_output": "1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz, 16, 17, Fizz, 19, Buzz",
                "xp_reward": 120,
                "coin_reward": 40
            }
        ]
        
        for i, template in enumerate(challenge_templates):
            challenge_date = base_date + timedelta(days=i)
            challenge = {
                "id": challenge_date.strftime('%Y-%m-%d'),
                "date": challenge_date.strftime('%Y-%m-%d'),
                **template,
                "expires_at": datetime.combine(challenge_date + timedelta(days=1), datetime.min.time()),
                "created_at": datetime.now(),
                "is_active": i == 0  # Only today's challenge is active
            }
            challenges.append(challenge)
        
        uploaded = 0
        for challenge in challenges:
            try:
                # Save to daily_challenges collection
                challenge_ref = self.firebase.db.collection('daily_challenges').document(challenge["id"])
                challenge_ref.set(challenge)
                print(f"✅ Uploaded challenge: {challenge['title']} for {challenge['date']}")
                uploaded += 1
            except Exception as e:
                print(f"❌ Failed to upload challenge: {challenge['title']} - {str(e)}")
                
        print(f"🎯 Daily challenges seeded: {uploaded}/{len(challenges)}")
        return uploaded == len(challenges)
    
    def seed_users(self):
        """Create sample users for testing"""
        print("\n👥 Seeding sample users...")
        
        users = [
            {
                "uid": "dev_user_001",
                "email": "test1@codewithmorais.com", 
                "username": "PythonLearner",
                "display_name": "Python Learner",
                "first_name": "Python",
                "last_name": "Learner",
                "xp": 150,
                "level": 2,
                "pycoins": 75,
                "streak": 1,
                "lesson_progress": {
                    "python-basics": {
                        "completed": True,
                        "progress": 100,
                        "completed_subtopics": ["variables", "data-types"],
                        "time_spent": 1800,
                        "last_accessed": datetime.now()
                    }
                },
                "quiz_scores": {
                    "python-basics-quiz": 85
                },
                "achievements": ["first-lesson"],
                "is_admin": False
            },
            {
                "uid": "dev_user_002",
                "email": "test2@codewithmorais.com",
                "username": "CodeNinja", 
                "display_name": "Code Ninja",
                "first_name": "Code",
                "last_name": "Ninja",
                "xp": 450,
                "level": 4,
                "pycoins": 200,
                "streak": 5,
                "lesson_progress": {
                    "python-basics": {
                        "completed": True,
                        "progress": 100,
                        "completed_subtopics": ["variables", "data-types"],
                        "time_spent": 1500,
                        "last_accessed": datetime.now() - timedelta(days=2)
                    },
                    "control-flow": {
                        "completed": True, 
                        "progress": 100,
                        "completed_subtopics": ["if-statements", "loops"],
                        "time_spent": 2400,
                        "last_accessed": datetime.now() - timedelta(days=1)
                    }
                },
                "quiz_scores": {
                    "python-basics-quiz": 92,
                    "control-flow-quiz": 88
                },
                "achievements": ["first-lesson", "quiz-master"],
                "is_admin": False
            }
        ]
        
        uploaded = 0
        for user in users:
            user_data = {
                **user,
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "last_login": datetime.now()
            }
            
            if self.firebase.create_user(user["uid"], user_data):
                print(f"✅ Created user: {user['display_name']}")
                uploaded += 1
            else:
                print(f"❌ Failed to create user: {user['display_name']}")
                
        print(f"👥 Users seeded: {uploaded}/{len(users)}")
        return uploaded == len(users)
    
    def seed_achievements(self):
        """Upload achievement definitions"""
        print("\n🏆 Seeding achievements...")
        
        achievements = [
            {
                "id": "first-lesson",
                "title": "First Steps",
                "description": "Complete your first lesson",
                "icon": "trophy",
                "category": "progress",
                "xp_bonus": 50,
                "coin_bonus": 10,
                "requirements": {
                    "type": "lesson_completion",
                    "count": 1
                }
            },
            {
                "id": "quiz-master", 
                "title": "Quiz Master",
                "description": "Score 90% or higher on any quiz",
                "icon": "brain",
                "category": "performance",
                "xp_bonus": 75,
                "coin_bonus": 25,
                "requirements": {
                    "type": "quiz_score",
                    "minimum_score": 90
                }
            },
            {
                "id": "streak-warrior",
                "title": "Streak Warrior", 
                "description": "Maintain a 7-day learning streak",
                "icon": "fire",
                "category": "consistency",
                "xp_bonus": 200,
                "coin_bonus": 50,
                "requirements": {
                    "type": "streak",
                    "count": 7
                }
            }
        ]
        
        uploaded = 0
        for achievement in achievements:
            try:
                achievement_ref = self.firebase.db.collection('achievements').document(achievement["id"])
                achievement_ref.set({
                    **achievement,
                    "created_at": datetime.now()
                })
                print(f"✅ Uploaded achievement: {achievement['title']}")
                uploaded += 1
            except Exception as e:
                print(f"❌ Failed to upload achievement: {achievement['title']} - {str(e)}")
                
        print(f"🏆 Achievements seeded: {uploaded}/{len(achievements)}")
        return uploaded == len(achievements)

def main():
    print("🌱 Firebase Data Seeder - Code with Morais")
    print("=" * 50)
    
    seeder = FirebaseSeeder()
    
    if not seeder.firebase.is_available():
        print("❌ Firebase not available. Check your .env configuration.")
        return False
    
    print(f"✅ Connected to Firebase project: {seeder.config.FIREBASE_CONFIG.get('project_id')}")
    
    # Ask for confirmation
    response = input("\n🤔 This will upload/overwrite data in Firebase. Continue? (y/N): ")
    if response.lower() != 'y':
        print("❌ Cancelled by user.")
        return False
    
    # Seed all data
    success = seeder.seed_all_data()
    
    if success:
        print("\n🎉 All data seeded successfully!")
        print("🚀 Your Firebase database is ready for development!")
    else:
        print("\n⚠️  Some data failed to seed. Check the logs above.")
    
    return success

if __name__ == '__main__':
    main()
