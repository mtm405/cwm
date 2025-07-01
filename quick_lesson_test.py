#!/usr/bin/env python3
"""
Quick lesson content test - Check if lesson renders without the forEach error
"""
import requests
import time

def test_lesson_rendering():
    """Test if the lesson page renders content correctly"""
    print("=== TESTING LESSON CONTENT RENDERING ===")
    
    url = "http://127.0.0.1:8080/lesson/python-basics-01"
    
    try:
        print(f"Testing: {url}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            content = response.text
            
            # Check for error indicators
            error_indicators = [
                'contentArray.forEach is not a function',
                'Unable to Load Lesson',
                'lesson-error-state',
                'Content Not Available'
            ]
            
            found_errors = []
            for error in error_indicators:
                if error in content:
                    found_errors.append(error)
            
            if found_errors:
                print("❌ Found error indicators:")
                for error in found_errors:
                    print(f"  - {error}")
            else:
                print("✅ No error indicators found")
            
            # Check for positive indicators
            positive_indicators = [
                'lesson-content-container',
                'content-block',
                'Python Basics',
                'renderLessonContent'
            ]
            
            found_positive = []
            for indicator in positive_indicators:
                if indicator in content:
                    found_positive.append(indicator)
            
            print(f"✅ Found {len(found_positive)}/{len(positive_indicators)} positive indicators:")
            for indicator in found_positive:
                print(f"  - {indicator}")
            
            # Check JavaScript initialization
            js_checks = [
                'LessonPageManager',
                'ProgressTracker',
                'ContentBlockRenderer'
            ]
            
            for js_check in js_checks:
                if js_check in content:
                    print(f"✅ {js_check} present")
                else:
                    print(f"❌ {js_check} missing")
                    
        else:
            print(f"❌ Request failed with status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_lesson_rendering()
