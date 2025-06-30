# Firebase Data Structure Guide

This folder contains JSON files that represent the data structure for your Firebase Firestore database. These files serve as templates and examples for how to organize your data in Firebase.

## 📁 Files Overview

### `users.json`
Contains user profile data including:
- Basic info (name, email, username)
- Progress tracking (XP, level, pycoins, streak)
- Lesson progress and quiz scores
- Achievements and settings
- Admin status and timestamps

### `lessons.json`
Lesson content and metadata:
- Lesson content and structure
- Prerequisites and difficulty
- XP/PyCoins rewards
- Code examples and exercises
- Associated quiz IDs

### `quizzes.json`
Quiz data and questions:
- Multiple choice, true/false, and code completion questions
- Scoring and time limits
- Explanations for each answer
- Rewards for completion

### `daily_challenges.json`
Daily coding challenges:
- Challenge descriptions and solutions
- Difficulty levels and hints
- Completion tracking
- XP/PyCoins rewards

### `user_activities.json`
Activity feed data:
- User actions and achievements
- Timestamps and metadata
- Progress tracking
- Score and time information

## 🔥 How to Use These Files

### Option 1: Firebase Console Import
1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Use the "Import" feature to upload these JSON files
4. Each file becomes a collection in Firestore

### Option 2: Firebase Admin SDK (Recommended)
Use the provided `FirebaseService` class to programmatically populate data:

```python
from services.firebase_service import FirebaseService
import json

# Initialize Firebase service
firebase_service = FirebaseService(your_config)

# Load and upload users
with open('firebase_data/users.json', 'r') as f:
    users_data = json.load(f)
    
for user_id, user_data in users_data['users'].items():
    firebase_service.create_user(user_id, user_data)

# Similarly for lessons, quizzes, etc.
```

### Option 3: Firestore CLI
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Import data
firebase firestore:import firebase_data/ --project your-project-id
```

## 📊 Collection Structure in Firebase

```
/users/{userId}          → Individual user documents
/lessons/{lessonId}      → Lesson content and metadata  
/quizzes/{quizId}        → Quiz questions and config
/daily_challenges/{date} → Daily challenges by date
/user_activities/{id}    → Activity feed entries
```

## 🔄 Data Relationships

- **Users** ↔ **Lessons**: `lesson_progress` field tracks completion
- **Lessons** ↔ **Quizzes**: `quiz_id` field links lesson to quiz
- **Users** ↔ **Activities**: `user_id` field tracks user actions
- **Users** ↔ **Daily Challenges**: `completed_by` array tracks completions

## 🛠 Development Workflow

1. **Modify JSON files** as needed for your content
2. **Update FirebaseService** methods to handle new fields
3. **Test with sample data** using the provided examples
4. **Deploy to production** when ready

## 🔐 Security Rules

Remember to set up proper Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Lessons are public read, admin write
    match /lessons/{lessonId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }
    
    // Quizzes are public read, admin write
    match /quizzes/{quizId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }
    
    // Daily challenges are public read, admin write
    match /daily_challenges/{challengeId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }
    
    // Activities are user-specific
    match /user_activities/{activityId} {
      allow read, write: if request.auth != null && 
                            resource.data.user_id == request.auth.uid;
    }
  }
}
```

## 🎯 Next Steps

1. Review and customize the sample data for your needs
2. Set up Firebase project and import the data
3. Configure security rules
4. Test the dashboard with real Firebase data
5. Add more lessons, quizzes, and challenges as needed

This structure provides a solid foundation for a scalable, Firebase-powered learning platform!
