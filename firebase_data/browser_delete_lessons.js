/**
 * Browser-based Lesson Deletion Script
 * Run this in your browser console on a page where Firebase is initialized
 */

async function deleteAllLessons() {
    console.log('🗑️ Starting lesson deletion from browser...');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase not available in browser');
        return false;
    }
    
    if (!firebase.apps.length) {
        console.error('❌ Firebase not initialized');
        return false;
    }
    
    const db = firebase.firestore();
    
    try {
        // Get all lessons
        console.log('📋 Fetching all lessons...');
        const lessonsSnapshot = await db.collection('lessons').get();
        
        if (lessonsSnapshot.empty) {
            console.log('✅ No lessons found to delete');
            return true;
        }
        
        const lessons = [];
        lessonsSnapshot.forEach(doc => {
            const data = doc.data();
            lessons.push({
                id: doc.id,
                title: data.title || 'Untitled'
            });
        });
        
        console.log(`📊 Found ${lessons.length} lessons:`);
        lessons.forEach(lesson => {
            console.log(`  - ${lesson.id}: ${lesson.title}`);
        });
        
        // Confirm deletion
        const confirmed = confirm(
            `⚠️ This will permanently delete ${lessons.length} lessons!\n\n` +
            'Are you sure you want to continue?'
        );
        
        if (!confirmed) {
            console.log('❌ Deletion cancelled');
            return false;
        }
        
        // Delete lessons
        console.log('🗑️ Deleting lessons...');
        let deleted = 0;
        let failed = 0;
        
        for (const lesson of lessons) {
            try {
                await db.collection('lessons').doc(lesson.id).delete();
                console.log(`✅ Deleted: ${lesson.id}`);
                deleted++;
            } catch (error) {
                console.error(`❌ Failed to delete ${lesson.id}:`, error);
                failed++;
            }
        }
        
        console.log('\n📊 DELETION SUMMARY:');
        console.log(`✅ Successfully deleted: ${deleted} lessons`);
        if (failed > 0) {
            console.log(`❌ Failed to delete: ${failed} lessons`);
        }
        
        console.log('🎉 Deletion completed!');
        return true;
        
    } catch (error) {
        console.error('❌ Error during deletion:', error);
        return false;
    }
}

// Also delete user progress if needed
async function deleteAllUserProgress() {
    console.log('🗑️ Deleting user progress data...');
    
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error('❌ Firebase not available');
        return false;
    }
    
    const db = firebase.firestore();
    
    try {
        const userProgressSnapshot = await db.collection('user_progress').get();
        
        if (userProgressSnapshot.empty) {
            console.log('✅ No user progress data found');
            return true;
        }
        
        let deletedUsers = 0;
        
        for (const userDoc of userProgressSnapshot.docs) {
            const userId = userDoc.id;
            
            // Delete all lesson progress for this user
            const lessonsSnapshot = await db
                .collection('user_progress')
                .doc(userId)
                .collection('lessons')
                .get();
            
            let deletedLessons = 0;
            for (const lessonDoc of lessonsSnapshot.docs) {
                await lessonDoc.ref.delete();
                deletedLessons++;
            }
            
            if (deletedLessons > 0) {
                console.log(`✅ Deleted progress for user ${userId} (${deletedLessons} lessons)`);
                deletedUsers++;
            }
        }
        
        console.log(`✅ Deleted progress data for ${deletedUsers} users`);
        return true;
        
    } catch (error) {
        console.error('❌ Error deleting user progress:', error);
        return false;
    }
}

// Main deletion function
async function cleanFirestoreForNewModule() {
    console.log('🚀 FIRESTORE CLEANUP FOR NEW MODULE');
    console.log('=' .repeat(50));
    
    // Delete lessons
    const lessonsDeleted = await deleteAllLessons();
    
    if (lessonsDeleted) {
        // Ask about user progress
        const deleteProgress = confirm(
            'Do you also want to delete all user progress data?\n\n' +
            'This will remove all completion records for all users.'
        );
        
        if (deleteProgress) {
            await deleteAllUserProgress();
        }
        
        console.log('\n🎉 Cleanup completed!');
        console.log('📝 You can now upload your new module lessons.');
    }
}

// Instructions
console.log(`
🔥 FIRESTORE LESSON DELETION SCRIPT

Instructions:
1. Make sure you're on a page where Firebase is initialized (like a lesson page)
2. Run: cleanFirestoreForNewModule()
3. Follow the prompts to confirm deletion

Available functions:
- cleanFirestoreForNewModule() - Complete cleanup
- deleteAllLessons() - Delete only lessons  
- deleteAllUserProgress() - Delete only user progress

⚠️  WARNING: This will permanently delete data!
`);

// Auto-export to window for easy access
window.deleteAllLessons = deleteAllLessons;
window.deleteAllUserProgress = deleteAllUserProgress;
window.cleanFirestoreForNewModule = cleanFirestoreForNewModule;
