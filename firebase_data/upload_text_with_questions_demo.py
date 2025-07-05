"""
Upload the text_with_questions demo lesson to Firebase
"""

import json
import os
import sys
from pathlib import Path

# Add the project root to the path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Import Firebase service
from services.firebase_service import FirebaseService

def upload_text_with_questions_demo():
    """Upload the text_with_questions demo lesson to Firebase"""
    
    print("Starting upload of text_with_questions demo lesson...")
    
    # Initialize Firebase service
    from config import get_config
    config = get_config()
    firebase_service = FirebaseService(config.FIREBASE_CONFIG if hasattr(config, 'FIREBASE_CONFIG') else {})
    
    # Load lesson data
    try:
        with open('firebase_data/text_with_questions_demo.json', 'r', encoding='utf-8') as file:
            lesson_data = json.load(file)
    except Exception as e:
        print(f"Error loading lesson data: {e}")
        return
    
    if not lesson_data:
        print("No lesson data found.")
        return
    
    # Extract metadata and blocks
    metadata = lesson_data.get('lesson_metadata', {})
    blocks = lesson_data.get('blocks', [])
    
    lesson_id = metadata.get('id')
    if not lesson_id:
        print("Lesson ID is missing.")
        return
    
    print(f"Uploading lesson: {lesson_id} - {metadata.get('title')}")
    
    # Upload lesson metadata
    try:
        # Use the enhanced lesson service to upload
        firebase_service.set_enhanced_lesson(lesson_id, metadata)
        print(f"Uploaded lesson metadata for {lesson_id}")
        
        # Upload each block
        for block in blocks:
            block_id = block.get('id')
            if not block_id:
                print("Warning: Block without ID found, skipping...")
                continue
                
            # Upload block
            firebase_service.set_lesson_block(lesson_id, block_id, block)
            print(f"Uploaded block: {block_id} ({block.get('type')})")
        
        print(f"Successfully uploaded lesson '{lesson_id}' with {len(blocks)} blocks.")
        
    except Exception as e:
        print(f"Error uploading lesson: {e}")

if __name__ == "__main__":
    upload_text_with_questions_demo()
