#!/usr/bin/env python3
"""
Upload the Python Basics Quiz to Firebase
Code with Morais - Quiz uploader
"""
import sys
import os
import json
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from services.firebase_service import FirebaseService
    from config import get_config
    import logging

    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)

    def upload_python_basics_quiz():
        """Upload python-basics-quiz to Firebase"""
        
        print("🚀 Uploading Python Basics Quiz to Firebase...")
        print("=" * 60)
        
        # Initialize Firebase service
        try:
            config = get_config()
            firebase_service = FirebaseService(config.FIREBASE_CONFIG)
            
            if not firebase_service.is_available():
                print("❌ Firebase service is not available")
                return False
                
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            return False
        
        # Load the quiz
        quiz_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), 
            "python_basics_quiz.json"
        )
        
        try:
            with open(quiz_path, 'r', encoding='utf-8-sig') as file:
                quiz_data = json.load(file)
        except Exception as e:
            logger.error(f"Failed to load quiz data: {e}")
            return False
        
        # Get quiz ID
        quiz_id = quiz_data.get("id")
        if not quiz_id:
            print("❌ No quiz ID found in the JSON file")
            return False
        
        print(f"📝 Uploading quiz: {quiz_id}")
        
        # Add timestamps if not present
        current_time = datetime.now().isoformat()
        if 'created_at' not in quiz_data:
            quiz_data['created_at'] = current_time
        if 'updated_at' not in quiz_data:
            quiz_data['updated_at'] = current_time
        
        # Upload to Firebase
        try:
            # Save to Firestore
            result = firebase_service.save_quiz(quiz_id, quiz_data)
            
            if result:
                print(f"✅ Successfully uploaded quiz '{quiz_id}'")
                print(f"\n📌 Next steps:")
                print("  1. Verify the quiz is accessible via the API: /api/quiz/{quiz_id}")
                print("  2. Test the quiz in a lesson")
                return True
            else:
                print(f"❌ Failed to upload quiz to Firebase")
                return False
                
        except Exception as e:
            logger.error(f"Error uploading quiz data: {e}")
            return False

    if __name__ == "__main__":
        upload_python_basics_quiz()

except ImportError as e:
    print(f"❌ Error importing required modules: {e}")
    print("Make sure you're running this script from the project root directory.")
    sys.exit(1)
