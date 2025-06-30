#!/usr/bin/env python3
"""
Debug script to test lessons route directly
"""
import sys
import os
sys.path.append(os.getcwd())

from app import app
from models.lesson import get_all_lessons, set_firebase_service
from services.firebase_service import FirebaseService
from config import get_config

def test_lessons_route():
    """Test the lessons route directly"""
    print("🔍 Testing Lessons Route Debug")
    print("=" * 50)
    
    # Initialize app context
    with app.app_context():
        # Initialize Firebase
        config = get_config()
        firebase_service = FirebaseService(config)
        set_firebase_service(firebase_service)
        
        # Test lesson retrieval
        print("📚 Testing lesson retrieval...")
        lessons = get_all_lessons()
        print(f"✅ Retrieved {len(lessons)} lessons")
        
        for i, lesson in enumerate(lessons):
            print(f"\n{i+1}. Lesson: {lesson.get('title', 'No Title')}")
            print(f"   ID: {lesson.get('id', 'No ID')}")
            print(f"   Fields: {list(lesson.keys())}")
            
            # Check required template fields
            required_fields = ['color', 'icon', 'total_subtopics', 'xp_reward']
            missing = [field for field in required_fields if field not in lesson]
            if missing:
                print(f"   ❌ Missing: {missing}")
            else:
                print(f"   ✅ All template fields present")
        
        # Test route directly
        print(f"\n🌐 Testing /lessons route...")
        with app.test_client() as client:
            response = client.get('/lessons')
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                content = response.data.decode('utf-8')
                
                # Check if lessons are in the content
                lesson_cards = content.count('lesson-card')
                print(f"Lesson cards found: {lesson_cards}")
                
                # Check lessons grid content
                import re
                grid_match = re.search(r'<div class="lessons-grid">(.*?)</div>', content, re.DOTALL)
                if grid_match:
                    grid_content = grid_match.group(1).strip()
                    if grid_content:
                        print(f"✅ Lessons grid has content ({len(grid_content)} chars)")
                        # Show first 500 chars of grid content
                        print(f"Grid content: {grid_content[:500]}...")
                    else:
                        print("❌ Lessons grid is empty!")
                        # Let's see if lesson-card appears elsewhere
                        if 'lesson-card' in content:
                            print("🔍 lesson-card found elsewhere in page")
                            # Find all lesson-card occurrences
                            card_matches = re.findall(r'<div class="lesson-card.*?</div>', content, re.DOTALL)
                            print(f"Found {len(card_matches)} lesson-card divs")
                            if card_matches:
                                print(f"First card preview: {card_matches[0][:200]}...")
                else:
                    print("❌ Could not find lessons-grid div")
                    # Check if the grid div exists at all
                    if 'lessons-grid' in content:
                        print("🔍 lessons-grid class found somewhere in content")
                    else:
                        print("❌ lessons-grid class not found anywhere")
                    
                # Check for template errors
                if 'error' in content.lower() or 'exception' in content.lower():
                    print("❌ Template may have errors")
                    
            else:
                print(f"❌ Route returned status {response.status_code}")
                print(f"Response: {response.data.decode('utf-8')}")

if __name__ == "__main__":
    test_lessons_route()
