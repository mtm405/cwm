#!/usr/bin/env python3
"""
Template identification test
"""
import requests

def identify_template():
    """Check which template is being used by looking for specific markers"""
    print("=== TEMPLATE IDENTIFICATION TEST ===")
    
    url = "http://127.0.0.1:8080/lesson/python-basics-01"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            content = response.text
            
            # Look for template-specific markers
            markers = {
                'lesson_backup.html': [
                    'renderLessonContent()',
                    'runCode(editorId)',
                    'window.progressTracker.init()',
                    'ACE Editor',
                    'contentContainer.innerHTML = contentHTML'
                ],
                'lesson.html': [
                    'lesson-content-blocks',
                    'content-blocks-container',
                    'interactive-container'
                ]
            }
            
            print("Template markers found:")
            for template, marker_list in markers.items():
                found_markers = []
                for marker in marker_list:
                    if marker in content:
                        found_markers.append(marker)
                
                print(f"\n{template}:")
                print(f"  Found {len(found_markers)}/{len(marker_list)} markers")
                for marker in found_markers:
                    print(f"  ✅ {marker}")
                for marker in marker_list:
                    if marker not in found_markers:
                        print(f"  ❌ {marker}")
            
            # Check specific template comments or identifiers
            if '<!-- lesson_backup.html template -->' in content:
                print("\n✅ Found lesson_backup.html template comment")
            elif '<!-- lesson.html template -->' in content:
                print("\n✅ Found lesson.html template comment")
            else:
                print("\n❓ No template comment found")
                
            # Look for template extension patterns
            if 'extends "base.html"' in content:
                print("✅ Template extends base.html")
            
            # Check for our custom functions
            custom_functions = [
                'renderLessonContent',
                'runCode',
                'initializeOfflineSupport',
                'initializeTouchNavigation'
            ]
            
            print("\nCustom functions:")
            for func in custom_functions:
                if func in content:
                    print(f"  ✅ {func}")
                else:
                    print(f"  ❌ {func}")
                    
        else:
            print(f"❌ Request failed with status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    identify_template()
