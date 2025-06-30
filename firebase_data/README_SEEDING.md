# Firebase Database Cleanup & Seeding Configuration
# Code with Morais - Python Learning Platform

## 🎯 Quick Setup Guide

### 1. **Configure the Script**
Edit `seed_firebase.py` and update:
```python
FIREBASE_PROJECT_ID = "your-actual-project-id"  # Replace with your Firebase project ID
```

### 2. **Ensure Required Files**
Make sure these files exist in your `firebase_data/` folder:
- ✅ `serviceAccountKey.json` (Firebase credentials)
- ✅ `lessons.json`
- ✅ `quizzes.json` 
- ✅ `daily_challenges.json`
- ✅ `users.json`

### 3. **Install Dependencies**
```bash
pip install firebase-admin
```

### 4. **Run the Seeding Script**
```bash
cd firebase_data
python seed_firebase.py
```

### 5. **Manual Steps After Seeding**
1. **Create Indexes** in Firebase Console:
   - Go to Firestore > Indexes
   - Create composite indexes as suggested by the script

2. **Upload Security Rules**:
   - Go to Firestore > Rules
   - Copy-paste the generated `firestore.rules` content

3. **Test Your Application**:
   - Restart your Flask app
   - Check dashboard functionality
   - Verify data is loading correctly

## 🔄 **Data Migration Strategy**

### **Backup First!**
```bash
# Export existing data (if needed)
firebase firestore:export gs://your-bucket/backup-$(date +%Y%m%d)
```

### **Progressive Migration**
1. **Phase 1**: Clean collections and upload base structure
2. **Phase 2**: Migrate existing user data (if any)
3. **Phase 3**: Update application to use new structure
4. **Phase 4**: Add indexes and security rules

## 🛡️ **Safety Features**

- ✅ **Confirmation Required**: Script asks for "YES" confirmation
- ✅ **Batch Operations**: Uses Firestore batch writes (500 docs/batch)
- ✅ **Error Handling**: Comprehensive try-catch blocks
- ✅ **Validation**: Checks data integrity after upload
- ✅ **Rollback Ready**: Generate security rules for immediate deployment

## 📊 **What This Script Does**

1. **🧹 Cleanup**: Removes all existing documents from key collections
2. **📚 Seed Lessons**: Uploads structured lesson content
3. **🧠 Seed Quizzes**: Uploads quiz questions and answers
4. **🎯 Seed Challenges**: Uploads daily coding challenges  
5. **👤 Seed Users**: Uploads sample user data for testing
6. **🗂️ Create Indexes**: Generates index recommendations
7. **🔐 Security Rules**: Creates comprehensive Firestore rules
8. **✅ Validate**: Checks data integrity and required fields

## 🎯 **Benefits**

- **Clean Structure**: Matches your website architecture perfectly
- **Performance**: Optimized queries with proper indexes
- **Security**: Comprehensive access control rules
- **Scalability**: Designed for real-world user loads
- **Maintainability**: Clear separation of concerns

## ⚠️ **Important Notes**

- This will **DELETE ALL EXISTING DATA** in your Firebase project
- Make sure to backup any important data first
- Test the script on a development Firebase project first
- The script is idempotent - safe to run multiple times

## 🚀 **Next Steps After Seeding**

1. Update your Flask app to use the new data structure
2. Test dashboard functionality with real Firebase data
3. Configure your production environment
4. Set up monitoring and analytics
5. Deploy with confidence!

Happy coding! 🐍✨
