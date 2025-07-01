#!/usr/bin/env python3
"""
Force refresh test - Check if backend changes reflect on frontend
"""
import requests
import time
import sys

def test_lesson_route():
    """Test the lesson route and template rendering"""
    print("=== TESTING LESSON ROUTE AND TEMPLATE ===")
    
    # Test the route
    url = "http://127.0.0.1:8080/lesson/python-basics"
    
    try:
        print(f"Testing: {url}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            print("✅ Route responds successfully")
            
            # Check template indicators
            content = response.text
            
            # Check if it's using lesson_backup.html
            if 'lesson_backup' in content.lower():
                print("✅ Using lesson_backup.html template")
            else:
                print("❌ Not using lesson_backup.html template")
            
            # Check for JS files
            js_files = [
                'lesson-manager.js',
                'progress-tracker.js',
                'content-renderer.js'
            ]
            
            for js_file in js_files:
                if js_file in content:
                    print(f"✅ {js_file} is included")
                else:
                    print(f"❌ {js_file} is NOT included")
            
            # Check for lessonData
            if 'lessonData' in content:
                print("✅ lessonData is present")
            else:
                print("❌ lessonData is NOT present")
                
            # Check for our custom functions
            functions = [
                'renderLessonContent',
                'runCode'
            ]
            
            for func in functions:
                if func in content:
                    print(f"✅ {func} function is present")
                else:
                    print(f"❌ {func} function is NOT present")
                    
            # Check template structure
            if 'lesson-container' in content:
                print("✅ Lesson container structure is present")
            else:
                print("❌ Lesson container structure is NOT present")
            
        else:
            print(f"❌ Route failed with status: {response.status_code}")
            print(f"Response: {response.text[:500]}")
            
    except Exception as e:
        print(f"❌ Error testing route: {e}")

def test_static_files():
    """Test if static JS files are accessible"""
    print("\n=== TESTING STATIC JS FILES ===")
    
    js_files = [
        'static/js/components/lesson-manager.js',
        'static/js/components/progress-tracker.js',
        'static/js/components/content-renderer.js'
    ]
    
    for js_file in js_files:
        url = f"http://127.0.0.1:8080/{js_file}"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {js_file} accessible")
                
                # Quick syntax check for common issues
                content = response.text
                if 'SyntaxError' in content or 'Unexpected token' in content:
                    print(f"  ⚠️  Potential syntax issues detected")
                
            else:
                print(f"❌ {js_file} NOT accessible (status: {response.status_code})")
        except Exception as e:
            print(f"❌ Error accessing {js_file}: {e}")

if __name__ == "__main__":
    test_lesson_route()
    test_static_files()
    print("\n=== TEST COMPLETE ===")
