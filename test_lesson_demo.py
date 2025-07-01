#!/usr/bin/env python3
"""
Test Lesson Demo - Shows all the powerful features we built
Run this to see the lesson template in action with rich content
"""

# Sample lesson data to demonstrate all features
DEMO_LESSON = {
    "id": "demo-python-basics",
    "title": "Python Fundamentals - Interactive Demo",
    "description": "Experience all the powerful features of our lesson template",
    "difficulty": "beginner",
    "estimated_time": 45,
    "xp_reward": 150,
    "icon": "python",
    
    "subtopics": [
        {
            "id": "variables",
            "title": "Variables & Data Types",
        },
        {
            "id": "functions", 
            "title": "Functions & Logic",
        },
        {
            "id": "practice",
            "title": "Hands-on Practice",
        }
    ],
    
    "content": [
        {
            "type": "text",
            "content": """
                <h2>🚀 Welcome to Python Fundamentals!</h2>
                <p>This interactive lesson demonstrates all the powerful features we've built:</p>
                <ul>
                    <li>✨ <strong>Dynamic Content Rendering</strong> - Smart content blocks</li>
                    <li>🎮 <strong>Interactive Code Editors</strong> - Real-time code execution</li>
                    <li>📊 <strong>Progress Tracking</strong> - Gamified learning experience</li>
                    <li>🏆 <strong>Celebration System</strong> - Achievements and rewards</li>
                    <li>📱 <strong>Mobile Optimized</strong> - Works great on Chromebooks</li>
                    <li>🎯 <strong>Quiz Integration</strong> - Test your knowledge</li>
                </ul>
                <div class="alert alert-info">
                    <strong>🎊 New Features Active:</strong> Try the navigation, code execution, and mobile features!
                </div>
            """
        },
        {
            "type": "code_example",
            "language": "python",
            "code": """# Python Variables Demo
name = "Code with Morais"
age = 25
is_student = True
grades = [95, 87, 92, 88]

print(f"Hello {name}!")
print(f"Age: {age}")
print(f"Average grade: {sum(grades) / len(grades)}")

# Try changing the values and see the results!"""
        },
        {
            "type": "interactive_challenge",
            "id": "variables-challenge",
            "instructions": "Create variables for your name, favorite number, and a list of hobbies. Then print them!",
            "starter_code": "# Write your code here\nname = \nfavorite_number = \nhobbies = []\n\n# Print your variables\nprint(f\"Name: {name}\")",
            "hints": [
                "Remember to use quotes for strings",
                "Lists use square brackets: ['hobby1', 'hobby2']",
                "Use f-strings for formatted printing"
            ]
        },
        {
            "type": "quiz",
            "quiz_id": "python-variables-quiz",
            "title": "Variables Knowledge Check",
            "questions": [
                {
                    "type": "multiple_choice",
                    "question": "Which of these is a valid Python variable name?",
                    "options": ["2user", "user-name", "user_name", "user name"],
                    "correct_index": 2,
                    "points": 10
                }
            ],
            "passing_score": 70,
            "total_points": 10
        }
    ]
}

print("🎯 Demo Lesson Structure:")
print(f"📚 Title: {DEMO_LESSON['title']}")
print(f"🔧 Subtopics: {len(DEMO_LESSON['subtopics'])}")
print(f"📝 Content Blocks: {len(DEMO_LESSON['content'])}")
print(f"⭐ XP Reward: {DEMO_LESSON['xp_reward']}")

print("\n✨ Features to Test:")
print("1. 📱 Responsive design (resize browser window)")
print("2. 🎮 Interactive code editor (click 'Run Code')")
print("3. 📊 Progress tracking (complete sections)")
print("4. 🏆 Celebration animations (finish lesson)")
print("5. 📱 Touch navigation (swipe on mobile/tablet)")
print("6. 🎯 Quiz system (answer questions)")
print("7. 📂 Offline caching (disconnect internet)")

print("\n🌐 Open in browser: http://127.0.0.1:8080/lessons")
print("🔍 Look for interactive elements and modern UI!")
