    # 🔥 Firebase Architecture Plan - Code with Morais

## 📊 **Firebase Collections Structure**

### 👤 **users** Collection
```json
{
  "uid": "user_google_id",
  "email": "marco.morais@imaginenorthport.com",
  "username": "marco_morais",
  "display_name": "Marco Morais", 
  "first_name": "Marco",
  "last_name": "Morais",
  "profile_picture": "https://lh3.googleusercontent.com/...",
  "xp": 1250,
  "level": 8,
  "pycoins": 450,
  "streak": 5,
  "is_admin": false,
  "email_verified": true,
  "auth_provider": "google",
  "theme": "dark",
  "completed_lessons": ["python-basics", "control-flow"],
  "lesson_progress": {
    "python-basics": {
      "completed": true,
      "progress": 100,
      "completed_subtopics": ["variables", "data-types", "operators"],
      "time_spent": 1800,
      "last_accessed": "2025-06-29T10:30:00Z"
    },
    "functions": {
      "completed": false,
      "progress": 45,
      "completed_subtopics": ["defining-functions"],
      "time_spent": 900,
      "last_accessed": "2025-06-29T15:20:00Z"
    }
  },
  "quiz_scores": {
    "python-basics-quiz": 92,
    "control-flow-quiz": 87
  },
  "achievements": ["first-lesson", "quiz-master", "streak-warrior"],
  "settings": {
    "notifications": true,
    "email_digest": "weekly",
    "privacy_level": "public"
  },
  "created_at": "2025-06-01T08:00:00Z",
  "updated_at": "2025-06-29T16:45:00Z",
  "last_login": "2025-06-29T16:45:00Z"
}
```

### 📚 **lessons** Collection
```json
{
  "id": "python-basics",
  "title": "Python Basics: Variables and Data Types",
  "description": "Learn the fundamentals of Python programming",
  "category": "fundamentals",
  "difficulty": "beginner",
  "order": 1,
  "estimated_time": 30,
  "xp_reward": 100,
  "coin_reward": 25,
  "prerequisites": [],
  "objectives": ["Understand variables", "Learn data types", "Practice basic operations"],
  "content": {
    "introduction": "Welcome to Python basics...",
    "sections": [
      {
        "title": "Variables",
        "content": "Variables are containers...",
        "code_examples": ["x = 5", "name = 'Python'"],
        "interactive_code": "# Try it yourself\nx = 10\nprint(x)"
      }
    ]
  },
  "quiz_id": "python-basics-quiz",
  "next_lesson": "control-flow",
  "tags": ["python", "basics", "variables"],
  "status": "published",
  "created_at": "2025-06-01T00:00:00Z",
  "updated_at": "2025-06-29T12:00:00Z"
}
```

### 🧠 **quizzes** Collection
```json
{
  "id": "python-basics-quiz",
  "lesson_id": "python-basics",
  "title": "Python Basics Quiz",
  "description": "Test your understanding of Python basics",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "Which of the following is a valid variable name?",
      "options": ["2name", "name_2", "name-2", "name 2"],
      "correct_answer": 1,
      "explanation": "Variable names can contain letters, numbers, and underscores..."
    }
  ],
  "time_limit": 600,
  "passing_score": 70,
  "xp_reward": 50,
  "coin_reward": 15,
  "created_at": "2025-06-01T00:00:00Z"
}
```

### 🎯 **daily_challenges** Collection
```json
{
  "id": "2025-06-29",
  "title": "List Comprehension Challenge",
  "description": "Create a list of squares using list comprehension",
  "difficulty": "intermediate",
  "problem_statement": "Given a list of numbers...",
  "starter_code": "numbers = [1, 2, 3, 4, 5]\n# Your code here",
  "expected_output": "[1, 4, 9, 16, 25]",
  "test_cases": [
    {"input": "[1,2,3]", "output": "[1,4,9]"}
  ],
  "xp_reward": 150,
  "coin_reward": 50,
  "expires_at": "2025-06-30T00:00:00Z",
  "created_at": "2025-06-29T00:00:00Z"
}
```

### 📊 **activities** Collection
```json
{
  "id": "auto_generated",
  "user_id": "user_google_id",
  "type": "lesson_completed",
  "details": {
    "lesson_id": "python-basics",
    "lesson_title": "Python Basics",
    "xp_earned": 100,
    "coins_earned": 25,
    "time_spent": 1800,
    "completion_percentage": 100
  },
  "message": "Completed 'Python Basics' lesson",
  "icon": "book",
  "timestamp": "2025-06-29T16:45:00Z",
  "is_public": true
}
```

### 🏆 **user_achievements** Collection
```json
{
  "user_id": "user_google_id",
  "achievement_id": "first-lesson",
  "title": "First Steps",
  "description": "Completed your first lesson",
  "icon": "trophy",
  "earned_at": "2025-06-29T10:30:00Z",
  "xp_bonus": 50,
  "coin_bonus": 10
}
```

## 🔄 **Real-time Dashboard Data Flow**

### 1. **User Login Flow:**
```
Google OAuth → Firebase Auth → Create/Update User → Store in users collection → Dashboard loads user data
```

### 2. **Progress Tracking:**
```
User Action → Track in activities collection → Update user progress → Real-time dashboard update
```

### 3. **XP & Coin System:**
```
Complete Action → Calculate rewards → Update user stats → Add activity entry → Trigger notifications
```

## 🛠️ **Implementation Strategy**

### Phase 1: **Data Structure Setup** (Immediate)
1. **Create Firebase seed data** using existing JSON files
2. **Upload sample lessons, quizzes, and challenges**
3. **Migrate existing user data structure**

### Phase 2: **Dashboard Integration** (Current)
1. **Real-time user stats** from Firebase
2. **Activity feed** from activities collection
3. **Progress tracking** with live updates

### Phase 3: **Interactive Features**
1. **Lesson progress tracking**
2. **Quiz result storage**
3. **Daily challenge submissions**
4. **Achievement system**

## 📁 **File Organization Recommendation**

Keep your existing `firebase_data/` folder but organize it better:

```
firebase_data/
├── collections/
│   ├── users.json           # Sample user data
│   ├── lessons.json         # All lessons
│   ├── quizzes.json         # All quizzes  
│   ├── daily_challenges.json # Challenge templates
│   └── achievements.json    # Achievement definitions
├── schemas/
│   ├── user_schema.json     # User document structure
│   ├── lesson_schema.json   # Lesson document structure
│   └── activity_schema.json # Activity document structure
└── seed_data/
    └── upload_script.py     # Script to upload to Firebase
```

## 🚀 **Benefits of This Approach**

1. **Real-time Updates**: Dashboard reflects live user progress
2. **Scalability**: Firebase handles concurrent users automatically  
3. **Analytics**: Rich data for user behavior analysis
4. **Offline Support**: Firebase handles offline/online sync
5. **Security**: Built-in Firebase security rules
6. **Performance**: Optimized queries and indexing

## 🔐 **Security Rules Example**

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
    
    // Activities are user-specific
    match /activities/{activityId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
  }
}
```

This architecture gives you a robust, scalable foundation that grows with your user base while maintaining excellent performance and real-time capabilities!
