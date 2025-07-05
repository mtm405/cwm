#!/usr/bin/env python3
"""
Test Subtopic Tab Fix
Quick test to verify the subtopic tabs are working after the ES6 fix
"""

import requests
import json

def test_lesson_endpoints():
    """Test the lesson endpoints with subtopic support"""
    
    base_url = "http://localhost:8080"
    lesson_id = "python-basics-01"  # Using a test lesson
    
    print("🧪 Testing Subtopic Tab Fix...")
    print("=" * 50)
    
    # Test main lesson endpoint
    print(f"\n1. Testing main lesson page: /lesson/{lesson_id}")
    try:
        response = requests.get(f"{base_url}/lesson/{lesson_id}")
        if response.status_code == 200:
            print("✅ Main lesson page loads successfully")
            
            # Check if subtopic tabs are present
            if "subtopic-tabs-container" in response.text:
                print("✅ Subtopic tabs container found in HTML")
                
                # Check for has_subtopics flag
                if "has_subtopics" in response.text:
                    print("✅ has_subtopics flag found in template")
                else:
                    print("⚠️ has_subtopics flag NOT found in template")
                    
                # Check for subtopic tab buttons
                if "subtopic-tab" in response.text:
                    print("✅ Subtopic tab buttons found in HTML")
                else:
                    print("❌ Subtopic tab buttons NOT found in HTML")
                    
                # Check for window.lessonData
                if "window.lessonData" in response.text:
                    print("✅ window.lessonData injection found")
                else:
                    print("❌ window.lessonData injection NOT found")
                    
            else:
                print("❌ Subtopic tabs container NOT found in HTML")
        else:
            print(f"❌ Main lesson page failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing main lesson: {e}")
    
    # Test API lesson endpoint to check data structure
    print(f"\n2. Testing API lesson endpoint: /api/lesson/{lesson_id}")
    try:
        response = requests.get(f"{base_url}/api/lesson/{lesson_id}")
        if response.status_code == 200:
            data = response.json()
            print("✅ API endpoint works")
            print(f"📊 Lesson has {len(data.get('subtopics', []))} subtopics")
            print(f"🏷️ has_subtopics flag: {data.get('has_subtopics', 'Not set')}")
            
            # Check subtopic structure
            subtopics = data.get('subtopics', [])
            if subtopics:
                first_subtopic = subtopics[0]
                if isinstance(first_subtopic, dict) and 'id' in first_subtopic:
                    print("✅ Subtopics have proper object structure with IDs")
                elif isinstance(first_subtopic, str):
                    print("⚠️ Subtopics are still strings (will be converted by frontend)")
                else:
                    print(f"❓ Subtopic structure unknown: {type(first_subtopic)}")
        else:
            print(f"❌ API endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing API: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")
    print("\nNext steps:")
    print("1. Open a lesson in your browser")
    print("2. Check the browser console for subtopic tab debug logs")
    print("3. Look for the subtopic tabs container with red debug border")
    print("4. Verify tabs are clickable and functional")

if __name__ == "__main__":
    test_lesson_endpoints()
