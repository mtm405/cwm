#!/usr/bin/env python3
"""
🔍 Lesson Data Debug Script - Code with Morais
This script checks the lesson data structure and identifies issues
"""

import sys
import json
import traceback
from pprint import pprint

def debug_lesson_data():
    print("🔍 LESSON DATA STRUCTURE DEBUG")
    print("=" * 40)
    
    try:
        # Test lesson model import
        print("\n📦 Testing imports...")
        from models.lesson import get_lesson, get_mock_lesson
        print("✅ Lesson model imported successfully")
        
        # Test getting a specific lesson
        lesson_id = "python-basics-01"
        print(f"\n📖 Getting lesson data for: {lesson_id}")
        
        lesson_data = get_lesson(lesson_id)
        
        if lesson_data:
            print("✅ Lesson data retrieved successfully")
            print(f"\n📊 LESSON DATA STRUCTURE:")
            print("-" * 30)
            
            # Check basic fields
            print(f"ID: {lesson_data.get('id', 'MISSING')}")
            print(f"Title: {lesson_data.get('title', 'MISSING')}")
            print(f"Description: {lesson_data.get('description', 'MISSING')[:100]}...")
            print(f"Difficulty: {lesson_data.get('difficulty', 'MISSING')}")
            
            # Check subtopics
            subtopics = lesson_data.get('subtopics', [])
            print(f"\n📋 SUBTOPICS ({len(subtopics)} items):")
            for i, subtopic in enumerate(subtopics):
                print(f"  {i+1}. Type: {type(subtopic)} | Value: {subtopic}")
                if hasattr(subtopic, 'title'):
                    print(f"     Has .title attribute: {subtopic.title}")
                else:
                    print(f"     No .title attribute (it's a {type(subtopic)})")
            
            # Check for blocks (new system)
            blocks = lesson_data.get('blocks', [])
            print(f"\n🧱 BLOCKS ({len(blocks)} items):")
            if blocks:
                for i, block in enumerate(blocks):
                    print(f"  {i+1}. Type: {block.get('type', 'NO TYPE')} | ID: {block.get('id', 'NO ID')}")
            else:
                print("  No blocks found - using legacy subtopic system")
            
            # Check content
            content = lesson_data.get('content', '')
            print(f"\n📄 CONTENT LENGTH: {len(content)} characters")
            if content:
                print(f"Content preview: {content[:200]}...")
            
            # Check code examples
            code_examples = lesson_data.get('code_examples', [])
            print(f"\n💻 CODE EXAMPLES: {len(code_examples)} items")
            
            # Check exercises
            exercises = lesson_data.get('exercises', [])
            print(f"\n🎯 EXERCISES: {len(exercises)} items")
            
            print(f"\n📋 FULL DATA KEYS:")
            print(list(lesson_data.keys()))
            
        else:
            print("❌ No lesson data returned")
            
            # Try mock data
            print("\n🎭 Trying mock lesson data...")
            mock_data = get_mock_lesson()
            if mock_data:
                print("✅ Mock data available")
                print(f"Mock subtopics: {mock_data.get('subtopics', [])}")
            else:
                print("❌ No mock data available")
        
    except Exception as e:
        print(f"❌ Error in lesson data debug: {e}")
        print(f"Traceback: {traceback.format_exc()}")

def debug_firebase_connection():
    print("\n\n🔥 FIREBASE CONNECTION DEBUG")
    print("=" * 40)
    
    try:
        from services.firebase_service import firebase_service
        print("✅ Firebase service imported")
        
        is_available = firebase_service.is_available()
        print(f"🔗 Firebase available: {is_available}")
        
        if is_available:
            try:
                db = firebase_service.get_db()
                print("✅ Firebase database connection successful")
                
                # Try to get lessons collection
                lessons_ref = db.collection('lessons')
                docs = lessons_ref.limit(1).get()
                
                if docs:
                    print(f"✅ Lessons collection accessible: {len(docs)} sample docs")
                    for doc in docs:
                        doc_data = doc.to_dict()
                        print(f"Sample lesson ID: {doc.id}")
                        print(f"Sample lesson title: {doc_data.get('title', 'NO TITLE')}")
                        print(f"Sample lesson keys: {list(doc_data.keys())}")
                else:
                    print("⚠️ Lessons collection is empty")
                    
            except Exception as e:
                print(f"❌ Firebase query error: {e}")
        else:
            print("❌ Firebase not available - using mock data")
            
    except Exception as e:
        print(f"❌ Firebase debug error: {e}")

def debug_template_rendering():
    print("\n\n🎨 TEMPLATE RENDERING DEBUG")
    print("=" * 40)
    
    try:
        from app import app
        
        with app.test_client() as client:
            print("✅ Test client created")
            
            # Test lesson route
            response = client.get('/lesson/python-basics-01')
            print(f"📍 Lesson route status: {response.status_code}")
            
            if response.status_code == 200:
                html_content = response.data.decode('utf-8')
                
                # Check for key elements
                checks = {
                    'lesson-container': 'lesson-container' in html_content,
                    'subtopic-tabs': 'subtopic-tabs' in html_content,
                    'lesson-content': 'lesson-content' in html_content,
                    'JavaScript loaded': 'lesson-manager.js' in html_content,
                    'Content renderer': 'content-renderer.js' in html_content,
                    'Progress tracker': 'progress-tracker.js' in html_content,
                    'Lesson data': 'lessonData' in html_content,
                    'Built-in method error': 'built-in method title' in html_content
                }
                
                print("\n🔍 HTML CONTENT CHECKS:")
                for check, result in checks.items():
                    status = "✅" if result else "❌"
                    print(f"  {status} {check}: {result}")
                
                # Extract lesson data from HTML
                if 'lessonData = ' in html_content:
                    start = html_content.find('lessonData = ') + 13
                    end = html_content.find('};', start) + 1
                    if end > start:
                        lesson_data_str = html_content[start:end]
                        try:
                            lesson_data = json.loads(lesson_data_str)
                            print(f"\n📊 EXTRACTED LESSON DATA:")
                            print(f"  Title: {lesson_data.get('title', 'MISSING')}")
                            print(f"  Subtopics: {lesson_data.get('subtopics', [])}")
                            print(f"  Content length: {len(lesson_data.get('content', ''))}")
                        except json.JSONDecodeError as e:
                            print(f"❌ Failed to parse lesson data JSON: {e}")
                
            else:
                print(f"❌ Route returned error: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Template debug error: {e}")

if __name__ == "__main__":
    debug_lesson_data()
    debug_firebase_connection()
    debug_template_rendering()
    
    print("\n\n🏁 DEBUG COMPLETE!")
    print("Check the output above for issues and fixes needed.")
