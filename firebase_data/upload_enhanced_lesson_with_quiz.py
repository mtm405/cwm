#!/usr/bin/env python3
"""
Upload the enhanced lesson with quiz integration to Firebase
Code with Morais - Enhanced lesson structure with quiz block
"""
import sys
import os
import json
from datetime import datetime, timezone

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService
from config import get_config
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def upload_enhanced_lesson_with_quiz():
    """Upload enhanced lesson with python-basics-quiz integration to Firebase"""
    
    print("🚀 Uploading Enhanced Lesson with Quiz Integration to Firebase...")
    print("=" * 60)
    
    # Initialize Firebase service
    try:
        config = get_config()
        firebase_service = FirebaseService(config.FIREBASE_CONFIG)
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        return False
    
    # Load the enhanced lesson with quiz
    enhanced_lesson_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), 
        "enhanced_lesson_with_quiz.json"
    )
    
    try:
        with open(enhanced_lesson_path, 'r', encoding='utf-8-sig') as file:
            lesson_data = json.load(file)
    except Exception as e:
        logger.error(f"Failed to load lesson data: {e}")
        return False
    
    # Get lesson ID and quiz ID from metadata
    lesson_id = lesson_data["lesson_metadata"]["id"]
    quiz_id = lesson_data["lesson_metadata"]["quiz_id"]
    
    print(f"📚 Uploading lesson: {lesson_id}")
    print(f"🧩 Using quiz: {quiz_id}")
    
    # Prepare the lesson data
    lesson_doc_data = {k: v for k, v in lesson_data["lesson_metadata"].items()}
    blocks = lesson_data["blocks"]
    
    # Upload the lesson document
    try:
        # Add lesson document
        lesson_ref = firebase_service.db.collection('enhanced_lessons').document(lesson_id)
        lesson_ref.set(lesson_doc_data)
        logger.info(f"Added lesson document: {lesson_id}")
        
        # Clear existing blocks if any
        existing_blocks = lesson_ref.collection('blocks').stream()
        for block in existing_blocks:
            block.reference.delete()
        
        # Add blocks as subcollection
        blocks_ref = lesson_ref.collection('blocks')
        for block in blocks:
            block_id = block["id"]
            blocks_ref.document(block_id).set(block)
        
        logger.info(f"Added {len(blocks)} blocks to lesson {lesson_id}")
        
        # Verify that the quiz exists
        quiz_ref = firebase_service.db.collection('quizzes').document(quiz_id)
        quiz_doc = quiz_ref.get()
        
        if quiz_doc.exists:
            print(f"✅ Successfully verified quiz {quiz_id} exists")
        else:
            print(f"⚠️ Warning: Quiz {quiz_id} does not exist in Firestore. You may need to upload it.")
        
        print(f"\n✅ Successfully uploaded enhanced lesson '{lesson_id}' with {len(blocks)} blocks")
        print(f"📝 The lesson uses quiz_id: '{quiz_id}' for its quiz block")
        
        # Additional guidance
        print("\n📌 Next steps:")
        print("  1. Test the lesson in the web app")
        print("  2. Verify that all block types render correctly")
        print("  3. Ensure the quiz integration works properly")
        
        return True
        
    except Exception as e:
        logger.error(f"Error uploading lesson data: {e}")
        return False

if __name__ == "__main__":
    upload_enhanced_lesson_with_quiz()
