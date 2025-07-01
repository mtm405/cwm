#!/usr/bin/env python3
"""
🔍 Route Debug Script - Code with Morais
Test specific routes and their responses
"""

import requests
import json
import sys
from pprint import pprint

def test_routes():
    print("🔍 ROUTE TESTING DEBUG")
    print("=" * 30)
    
    base_url = "http://localhost:5000"
    lesson_id = "python-basics-01"
    
    routes_to_test = [
        f"/lesson/{lesson_id}",
        f"/lesson-view/{lesson_id}",
        f"/api/lessons/{lesson_id}",
        f"/api/lessons/{lesson_id}/progress",
        "/api/lessons"
    ]
    
    for route in routes_to_test:
        print(f"\n📍 Testing route: {route}")
        try:
            response = requests.get(f"{base_url}{route}", timeout=5)
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                
                if 'application/json' in content_type:
                    try:
                        data = response.json()
                        print(f"✅ JSON Response")
                        print(f"Keys: {list(data.keys()) if isinstance(data, dict) else 'Array with ' + str(len(data)) + ' items'}")
                        
                        if route.endswith(lesson_id):
                            print(f"Title: {data.get('title', 'NO TITLE')}")
                            print(f"Subtopics: {data.get('subtopics', [])}")
                            print(f"Has blocks: {bool(data.get('blocks', []))}")
                            print(f"Content length: {len(data.get('content', ''))}")
                            
                    except json.JSONDecodeError:
                        print("❌ Invalid JSON response")
                        
                elif 'text/html' in content_type:
                    html = response.text
                    print(f"✅ HTML Response ({len(html)} chars)")
                    
                    # Check for key elements
                    html_checks = {
                        'lesson-container': 'lesson-container' in html,
                        'subtopic-tabs': 'subtopic-tabs' in html,
                        'lesson-integration.js': 'lesson-integration.js' in html,
                        'content-renderer.js': 'content-renderer.js' in html,
                        'lessonData': 'lessonData = ' in html,
                        'built-in method error': 'built-in method title' in html
                    }
                    
                    for check, found in html_checks.items():
                        status = "✅" if found else "❌"
                        print(f"  {status} {check}")
                        
            else:
                print(f"❌ Error: {response.status_code}")
                if response.text:
                    print(f"Error content: {response.text[:200]}...")
                    
        except requests.exceptions.RequestException as e:
            print(f"❌ Request failed: {e}")
            print("💡 Make sure Flask app is running: python app.py")

if __name__ == "__main__":
    test_routes()
