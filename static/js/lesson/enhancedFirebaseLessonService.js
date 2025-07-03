/**
 * Enhanced Firebase Lesson Service
 * Handles Firebase integration for lesson data
 */

export class EnhancedFirebaseLessonService {
    constructor() {
        this.db = null;
        this.initialized = false;
        this.cache = new Map();
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            // Check if Firebase is available
            if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
                this.db = firebase.firestore();
                this.initialized = true;
                console.log('✅ Firebase Lesson Service initialized');
            } else {
                console.warn('⚠️ Firebase not available, using API fallback');
            }
        } catch (error) {
            console.error('❌ Firebase initialization failed:', error);
        }
    }

    async fetchLesson(lessonId) {
        if (!lessonId) {
            throw new Error('Lesson ID is required');
        }

        // Check cache first
        if (this.cache.has(lessonId)) {
            return this.cache.get(lessonId);
        }

        try {
            let lessonData;

            if (this.db) {
                // Fetch from Firebase
                const doc = await this.db.collection('lessons').doc(lessonId).get();
                if (doc.exists) {
                    lessonData = { id: doc.id, ...doc.data() };
                } else {
                    throw new Error(`Lesson ${lessonId} not found in Firebase`);
                }
            } else {
                // Fallback to API
                const response = await fetch(`/api/lessons/${lessonId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch lesson: ${response.status}`);
                }
                lessonData = await response.json();
            }

            // Cache the result
            this.cache.set(lessonId, lessonData);
            return lessonData;

        } catch (error) {
            console.error(`❌ Error fetching lesson ${lessonId}:`, error);
            throw error;
        }
    }

    async fetchUserProgress(lessonId, userId) {
        if (!userId) {
            console.warn('No user ID provided, returning empty progress');
            return { completed_blocks: [], progress: 0 };
        }

        try {
            if (this.db) {
                const doc = await this.db
                    .collection('user_progress')
                    .doc(userId)
                    .collection('lessons')
                    .doc(lessonId)
                    .get();

                return doc.exists ? doc.data() : { completed_blocks: [], progress: 0 };
            } else {
                // Fallback to API
                const response = await fetch(`/api/lessons/${lessonId}/progress`);
                if (response.ok) {
                    return await response.json();
                }
                return { completed_blocks: [], progress: 0 };
            }
        } catch (error) {
            console.error(`❌ Error fetching user progress for lesson ${lessonId}:`, error);
            return { completed_blocks: [], progress: 0 };
        }
    }

    async updateUserProgress(lessonId, userId, progressData) {
        if (!userId) {
            console.warn('No user ID provided, cannot update progress');
            return false;
        }

        try {
            if (this.db) {
                await this.db
                    .collection('user_progress')
                    .doc(userId)
                    .collection('lessons')
                    .doc(lessonId)
                    .set(progressData, { merge: true });
                
                console.log(`✅ Progress updated for lesson ${lessonId}`);
                return true;
            } else {
                // Fallback to API
                const response = await fetch(`/api/lessons/${lessonId}/progress`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(progressData)
                });
                
                return response.ok;
            }
        } catch (error) {
            console.error(`❌ Error updating progress for lesson ${lessonId}:`, error);
            return false;
        }
    }
}
