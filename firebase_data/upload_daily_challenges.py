"""
Script to upload enhanced daily challenges to Firebase
"""
import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta

# Initialize Firebase
def initialize_firebase():
    """Initialize the Firebase app if not already initialized"""
    if not firebase_admin._apps:
        # Get the path to the service account key file
        service_account_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 
                                         'secure', 'serviceAccountKey.json')
        
        # Initialize the app with the service account key
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
    
    # Get Firestore client
    return firestore.client()

def upload_challenges(challenges_data):
    """Upload challenges to Firestore"""
    db = initialize_firebase()
    challenges_collection = db.collection('daily_challenges')
    
    # Upload each challenge
    for challenge_id, challenge_data in challenges_data['daily_challenges'].items():
        print(f"Uploading challenge: {challenge_id}")
        challenges_collection.document(challenge_id).set(challenge_data)
    
    print(f"Successfully uploaded {len(challenges_data['daily_challenges'])} challenges")

def generate_upcoming_challenges():
    """Generate challenges for the upcoming week"""
    challenges = {
        "daily_challenges": {}
    }
    
    # Challenge templates
    code_challenge_template = {
        "title": "Python List Comprehension",
        "description": "Practice your Python skills with list comprehension",
        "type": "code_challenge",
        "difficulty": "intermediate",
        "xp_reward": 50,
        "coin_reward": 25,
        "content": {
            "instructions": "Create a function called 'square_even_numbers' that takes a list of integers and returns a new list containing the squares of only the even numbers from the original list. Use list comprehension.",
            "initial_code": "def square_even_numbers(numbers):\n    # Your code here\n    pass",
            "test_cases": [
                {"name": "Basic even numbers", "input": [1, 2, 3, 4, 5, 6], "expected": [4, 16, 36]},
                {"name": "Only odd numbers", "input": [1, 3, 5, 7], "expected": []},
                {"name": "Only even numbers", "input": [2, 4, 6, 8], "expected": [4, 16, 36, 64]},
                {"name": "Empty list", "input": [], "expected": []}
            ],
            "hint": "You can use the modulo operator (%) to check if a number is even. Then use list comprehension with a condition."
        },
        "estimated_time": 5,
        "max_attempts": 3,
        "passing_score": 75
    }
    
    quiz_challenge_template = {
        "title": "Python Concepts Quiz",
        "description": "Test your knowledge of Python concepts",
        "type": "quiz",
        "difficulty": "beginner",
        "xp_reward": 30,
        "coin_reward": 15,
        "content": {
            "instructions": "Answer the following questions about Python concepts",
            "questions": [
                {
                    "text": "Which of the following is NOT a built-in data type in Python?",
                    "options": ["List", "Dictionary", "Tuple", "Array"],
                    "correct_answer": 3
                },
                {
                    "text": "What does the 'len()' function return when used on a dictionary?",
                    "options": ["The number of key-value pairs", "The number of keys", "The number of values", "The size in bytes"],
                    "correct_answer": 0
                },
                {
                    "text": "Which of these is the correct way to define a function in Python?",
                    "options": ["function my_func():", "def my_func():", "define my_func():", "func my_func():"],
                    "correct_answer": 1
                },
                {
                    "text": "What is the output of print(3 * '7')?",
                    "options": ["21", "777", "3*7", "Error"],
                    "correct_answer": 1
                }
            ],
            "correct_answers": [3, 0, 1, 1]
        },
        "estimated_time": 3,
        "max_attempts": 2,
        "passing_score": 75
    }
    
    # Generate challenges for the next 7 days
    today = datetime.now().date()
    
    for i in range(7):
        # Alternate between code challenges and quizzes
        template = code_challenge_template if i % 2 == 0 else quiz_challenge_template
        
        # Create a copy of the template
        challenge = template.copy()
        
        # Set dates
        date = today + timedelta(days=i)
        challenge_id = f"challenge-{date.strftime('%Y%m%d')}"
        challenge["active_date"] = date.strftime('%Y-%m-%d')
        challenge["expiration_date"] = (date + timedelta(days=1)).strftime('%Y-%m-%d')
        
        # Add some variety to the title
        if i % 2 == 0:
            topics = ["List Comprehension", "Dictionary Manipulation", "String Operations", 
                      "Function Creation", "Error Handling", "File Operations", "Data Analysis"]
            challenge["title"] = f"Python {topics[i % len(topics)]}"
        
        # Add to challenges dict
        challenges["daily_challenges"][challenge_id] = challenge
    
    return challenges

def main():
    """Main function to upload daily challenges"""
    try:
        # Path to the daily challenges file
        challenges_file = os.path.join(os.path.dirname(__file__), 'daily_challenges.json')
        
        # Load the challenges data
        with open(challenges_file, 'r') as f:
            challenges_data = json.load(f)
        
        # Generate additional upcoming challenges for testing
        today = datetime.now()
        for i in range(1, 8):  # Generate for next 7 days
            # Calculate the date
            challenge_date = today + timedelta(days=i)
            date_str = challenge_date.strftime('%Y-%m-%d')
            
            # Skip if already exists
            if date_str in challenges_data['daily_challenges']:
                continue
            
            # Alternate between code and quiz challenges
            if i % 2 == 0:
                template = challenges_data['daily_challenges'].get('2025-06-30', {}).copy()
                template['title'] = f"Code Challenge for {date_str}"
            else:
                template = challenges_data['daily_challenges'].get('2025-06-28', {}).copy()
                template['title'] = f"Quiz Challenge for {date_str}"
            
            # Add the challenge
            challenges_data['daily_challenges'][date_str] = template
            
            # Add date fields
            challenges_data['daily_challenges'][date_str]['active_date'] = date_str
            expiration = challenge_date + timedelta(days=1)
            challenges_data['daily_challenges'][date_str]['expiration_date'] = expiration.strftime('%Y-%m-%d')
        
        # Upload the challenges
        upload_challenges(challenges_data)
        print("Successfully uploaded daily challenges!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
    # Generate challenges
    challenges_data = generate_upcoming_challenges()
    
    # Upload to Firebase
    upload_challenges(challenges_data)
    
    # Save to file for reference
    with open('generated_daily_challenges.json', 'w') as f:
        json.dump(challenges_data, f, indent=2)
    
    print("Daily challenges generated and uploaded successfully!")
