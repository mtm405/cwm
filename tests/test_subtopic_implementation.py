#!/usr/bin/env python3
"""
Test Subtopic Tab Implementation
Quick test to verify the subtopic system is working
"""

import requests
import json

def test_lesson_endpoints():
    """Test the lesson endpoints with subtopic support"""
    
    base_url = "http://localhost:8080"
    lesson_id = "python-datatypes-01"
    
    print("🧪 Testing Subtopic Tab Implementation...")
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
            else:
                print("❌ Subtopic tabs container NOT found in HTML")
        else:
            print(f"❌ Main lesson page failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing main lesson: {e}")
    
    # Test subtopic-specific endpoints
    subtopics = ["introduction", "strings", "integers", "floats", "booleans", "practice"]
    
    for subtopic in subtopics:
        print(f"\n2. Testing subtopic page: /lesson/{lesson_id}/{subtopic}")
        try:
            response = requests.get(f"{base_url}/lesson/{lesson_id}/{subtopic}")
            if response.status_code == 200:
                print(f"✅ Subtopic '{subtopic}' page loads successfully")
            else:
                print(f"❌ Subtopic '{subtopic}' page failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing subtopic '{subtopic}': {e}")
    
    # Test API endpoint
    print(f"\n3. Testing API endpoint: /api/lesson/{lesson_id}")
    try:
        response = requests.get(f"{base_url}/api/lesson/{lesson_id}")
        if response.status_code == 200:
            data = response.json()
            print("✅ API endpoint works")
            print(f"📊 Lesson has {len(data.get('subtopics', []))} subtopics")
        else:
            print(f"❌ API endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing API: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")

if __name__ == "__main__":
    test_lesson_endpoints()
