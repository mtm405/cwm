#!/usr/bin/env python3
"""
Route verification script for Code with Morais
Tests that lesson_backup.html is being used correctly
"""

import requests
import json

def test_routes():
    base_url = "http://127.0.0.1:8080"
    
    print("🔍 Testing Code with Morais Routes...")
    print("=" * 50)
    
    # Test lessons overview
    try:
        response = requests.get(f"{base_url}/lessons", timeout=5)
        print(f"📚 /lessons - Status: {response.status_code}")
        if response.status_code == 200:
            print("   ✅ Lessons page loading successfully")
        else:
            print(f"   ❌ Lessons page error: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Lessons page error: {e}")
    
    # Test specific lesson routes
    lesson_ids = ["python-basics", "flow-control", "functions"]
    
    for lesson_id in lesson_ids:
        try:
            response = requests.get(f"{base_url}/lesson/{lesson_id}", timeout=5)
            print(f"📖 /lesson/{lesson_id} - Status: {response.status_code}")
            
            if response.status_code == 200:
                # Check if our modern template features are present
                content = response.text
                modern_features = [
                    'lesson-container',  # Main container class
                    'lesson-header',     # Header section
                    'subtopic-tabs',     # Navigation tabs
                    'lesson-progress',   # Progress tracking
                    'lesson-manager.js', # Our JavaScript
                    'lesson.css'         # Our CSS
                ]
                
                found_features = []
                for feature in modern_features:
                    if feature in content:
                        found_features.append(feature)
                
                print(f"   ✅ Modern features found: {len(found_features)}/{len(modern_features)}")
                
                if len(found_features) >= 4:
                    print(f"   🎉 lesson_backup.html template is loading correctly!")
                else:
                    print(f"   ⚠️  Some modern features missing: {set(modern_features) - set(found_features)}")
                    
            else:
                print(f"   ❌ Lesson error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Lesson {lesson_id} error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 Route Analysis Complete!")
    print("\n📋 What to check in your browser:")
    print("1. Go to: http://127.0.0.1:8080/lessons")
    print("2. Click on any lesson card")
    print("3. Look for:")
    print("   - Modern gradient header with badges")
    print("   - Subtopic navigation tabs")
    print("   - Progress bar at top")
    print("   - Responsive design")
    print("   - Interactive elements")
    
    print("\n🔧 If you don't see modern features:")
    print("1. Hard refresh browser (Ctrl+F5)")
    print("2. Clear browser cache")
    print("3. Check browser console (F12) for errors")

if __name__ == "__main__":
    test_routes()
