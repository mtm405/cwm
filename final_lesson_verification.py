#!/usr/bin/env python3
"""
🔍 FINAL LESSON SYSTEM VERIFICATION
===================================
Comprehensive test to verify the lesson system is working correctly.
"""

import sys
import os
import json
import requests
from datetime import datetime

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_lesson_routes():
    """Test all lesson routes and verify they're working."""
    print("🔍 FINAL LESSON SYSTEM VERIFICATION")
    print("===================================")
    
    base_url = "http://127.0.0.1:8080"
    test_lessons = [
        "python-basics-01",
        "python-basics-02", 
        "javascript-intro-01",
        "web-dev-fundamentals-01"
    ]
    
    print(f"\n🌐 Testing lesson routes on {base_url}")
    print("=" * 50)
    
    for lesson_id in test_lessons:
        print(f"\n📖 Testing lesson: {lesson_id}")
        print("-" * 30)
        
        # Test main lesson route
        try:
            url = f"{base_url}/lesson/{lesson_id}"
            response = requests.get(url, timeout=10)
            
            print(f"🔗 URL: {url}")
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                content = response.text
                
                # Check for critical elements
                checks = {
                    "lesson-container": "lesson-container" in content,
                    "subtopic-tabs": "subtopic-tabs" in content,
                    "lesson-content": "lesson-content" in content,
                    "renderLessonContent": "renderLessonContent" in content,
                    "runCode": "runCode" in content,
                    "lesson_backup.html": "lesson_backup.html" in content or "lesson-backup" in content,
                    "lessonData": "lessonData =" in content,
                    "subtopics": '"subtopics"' in content,
                    "no_errors": "built-in method title" not in content
                }
                
                print("🔍 Content checks:")
                for check, passed in checks.items():
                    status = "✅" if passed else "❌"
                    print(f"  {status} {check}")
                
                # Check if lesson data is present
                if "lessonData =" in content:
                    # Extract lesson data
                    start_idx = content.find("lessonData =") + 12
                    end_idx = content.find("};", start_idx) + 1
                    if end_idx > start_idx:
                        try:
                            lesson_data_str = content[start_idx:end_idx].strip()
                            # Basic validation
                            if lesson_data_str.startswith("{") and lesson_data_str.endswith("}"):
                                print("  ✅ Lesson data structure looks valid")
                            else:
                                print("  ❌ Lesson data structure looks invalid")
                        except Exception as e:
                            print(f"  ❌ Error parsing lesson data: {e}")
                
                print(f"📏 Content length: {len(content)} characters")
                
            else:
                print(f"❌ Request failed with status {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Network error: {e}")
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
    
    print(f"\n🏁 VERIFICATION COMPLETE!")
    print("=" * 50)

def test_lesson_api():
    """Test the lesson API endpoints."""
    print(f"\n🔌 Testing lesson API endpoints...")
    print("-" * 30)
    
    base_url = "http://127.0.0.1:8080"
    api_endpoints = [
        "/api/lessons",
        "/api/lesson/python-basics-01"
    ]
    
    for endpoint in api_endpoints:
        try:
            url = f"{base_url}{endpoint}"
            response = requests.get(url, timeout=10)
            
            print(f"🔗 {endpoint}: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        print(f"  📊 JSON keys: {list(data.keys())}")
                    elif isinstance(data, list):
                        print(f"  📊 Array length: {len(data)}")
                    else:
                        print(f"  📊 Data type: {type(data)}")
                except:
                    print("  ❌ Invalid JSON response")
            
        except Exception as e:
            print(f"  ❌ Error: {e}")

def check_firebase_data():
    """Check Firebase data file."""
    print(f"\n🔥 Checking Firebase data file...")
    print("-" * 30)
    
    try:
        with open("firebase_data/lessons.json", "r", encoding="utf-8") as f:
            lessons = json.load(f)
        
        print(f"📊 Total lessons in firebase_data/lessons.json: {len(lessons)}")
        
        if lessons:
            first_lesson = lessons[0]
            print(f"📖 First lesson ID: {first_lesson.get('id', 'N/A')}")
            print(f"📖 First lesson title: {first_lesson.get('title', 'N/A')}")
            print(f"📖 Has subtopics: {'subtopics' in first_lesson}")
            
            if 'subtopics' in first_lesson:
                subtopics = first_lesson['subtopics']
                print(f"📖 Subtopics type: {type(subtopics)}")
                if isinstance(subtopics, list) and subtopics:
                    print(f"📖 First subtopic type: {type(subtopics[0])}")
        
    except Exception as e:
        print(f"❌ Error reading Firebase data: {e}")

if __name__ == "__main__":
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    check_firebase_data()
    test_lesson_routes()
    test_lesson_api()
    
    print(f"\n✅ All tests completed!")
