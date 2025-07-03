/**
 * Firebase Lesson Service
 * Handles all Firebase operations for lessons
 */

// Prevent duplicate declarations - Phase 2 Fix
if (typeof window.FirebaseLessonService === 'undefined') {

class FirebaseLessonService {
    constructor() {
        this.db = null;
        this.auth = null;
        this.initialized = false;
        this.cache = new Map();
    }
    
    /**
     * Initialize Firebase connection
     */
    async init() {
        if (this.initialized) return;
        
        try {
            console.log('🔥 Initializing Firebase Lesson Service...');
            
            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                console.warn('⚠️ Firebase SDK not loaded, using API fallback');
                this.initialized = true;
                return;
            }
            
            // Initialize Firebase app if needed
            if (!firebase.apps.length) {
                const config = await this.getFirebaseConfig();
                firebase.initializeApp(config);
            }
            
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.initialized = true;
            
            console.log('✅ Firebase Lesson Service initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Firebase:', error);
            this.initialized = true; // Mark as initialized to use API fallback
        }
    }
    
    /**
     * Get Firebase configuration
     */
    async getFirebaseConfig() {
        try {
            const response = await fetch('/api/firebase-config');
            if (!response.ok) throw new Error('Failed to get Firebase config');
            return await response.json();
        } catch (error) {
            console.error('❌ Failed to get Firebase config:', error);
            throw error;
        }
    }
    
    /**
     * Load lesson data from Firebase or API
     */
    async loadLesson(lessonId) {
        // Check cache first
        if (this.cache.has(lessonId)) {
            console.log('📦 Returning cached lesson:', lessonId);
            return this.cache.get(lessonId);
        }
        
        try {
            await this.init();
            
            let lessonData;
            
            // Try Firebase first
            if (this.db) {
                console.log('🔥 Loading lesson from Firebase:', lessonId);
                const doc = await this.db.collection('lessons').doc(lessonId).get();
                
                if (doc.exists) {
                    lessonData = { id: doc.id, ...doc.data() };
                } else {
                    throw new Error('Lesson not found in Firebase');
                }
            } else {
                // Fallback to API
                console.log('🌐 Loading lesson from API:', lessonId);
                const response = await fetch(`/api/lessons/${lessonId}`);
                if (!response.ok) throw new Error('Failed to load lesson from API');
                lessonData = await response.json();
            }
            
            // Transform lesson data to ensure consistent structure
            lessonData = this.transformLessonData(lessonData);
            
            // Cache the lesson
            this.cache.set(lessonId, lessonData);
            
            console.log('✅ Lesson loaded successfully:', lessonData.title);
            return lessonData;
            
        } catch (error) {
            console.error('❌ Failed to load lesson:', error);
            throw error;
        }
    }
    
    /**
     * Transform lesson data to consistent block structure
     */
    transformLessonData(lessonData) {
        // Ensure we have blocks array
        if (!lessonData.blocks) {
            lessonData.blocks = [];
            
            // Convert content to blocks
            if (lessonData.content) {
                if (Array.isArray(lessonData.content)) {
                    lessonData.blocks = lessonData.content.map((item, index) => ({
                        id: item.id || `block-${index}`,
                        type: item.type || 'text',
                        ...item
                    }));
                } else if (typeof lessonData.content === 'string') {
                    lessonData.blocks.push({
                        id: 'block-0',
                        type: 'text',
                        content: lessonData.content
                    });
                }
            }
            
            // Add code examples as blocks
            if (lessonData.code_examples) {
                lessonData.code_examples.forEach((example, index) => {
                    lessonData.blocks.push({
                        id: example.id || `code-${index}`,
                        type: 'code_example',
                        ...example
                    });
                });
            }
            
            // Add quizzes as blocks
            if (lessonData.quizzes) {
                lessonData.quizzes.forEach((quiz, index) => {
                    lessonData.blocks.push({
                        id: quiz.id || `quiz-${index}`,
                        type: 'quiz',
                        ...quiz
                    });
                });
            }
        }
        
        return lessonData;
    }
    
    /**
     * Load user progress for a lesson
     */
    async loadUserProgress(lessonId, userId) {
        try {
            await this.init();
            
            if (this.db && this.auth.currentUser) {
                // Load from Firebase
                const doc = await this.db
                    .collection('user_progress')
                    .doc(userId || this.auth.currentUser.uid)
                    .collection('lessons')
                    .doc(lessonId)
                    .get();
                
                if (doc.exists) {
                    return doc.data();
                }
            } else {
                // Load from API
                const response = await fetch(`/api/lessons/${lessonId}/progress`);
                if (response.ok) {
                    return await response.json();
                }
            }
            
            // Return default progress
            return {
                completed_blocks: [],
                current_block: 0,
                completed: false,
                started_at: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Failed to load user progress:', error);
            return {
                completed_blocks: [],
                current_block: 0,
                completed: false
            };
        }
    }
    
    /**
     * Save user progress for a lesson
     */
    async saveUserProgress(lessonId, progress) {
        try {
            await this.init();
            
            const progressData = {
                ...progress,
                updated_at: new Date().toISOString()
            };
            
            if (this.db && this.auth.currentUser) {
                // Save to Firebase
                await this.db
                    .collection('user_progress')
                    .doc(this.auth.currentUser.uid)
                    .collection('lessons')
                    .doc(lessonId)
                    .set(progressData, { merge: true });
            } else {
                // Save via API
                await fetch(`/api/lessons/${lessonId}/progress`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(progressData)
                });
            }
            
            console.log('✅ Progress saved successfully');
            
        } catch (error) {
            console.error('❌ Failed to save progress:', error);
            throw error;
        }
    }
    
    /**
     * Mark a block as complete
     */
    async markBlockComplete(lessonId, blockId) {
        try {
            const progress = await this.loadUserProgress(lessonId);
            
            if (!progress.completed_blocks.includes(blockId)) {
                progress.completed_blocks.push(blockId);
                
                // Calculate completion percentage
                const lesson = await this.loadLesson(lessonId);
                const totalBlocks = lesson.blocks.length;
                progress.completion_percentage = Math.round(
                    (progress.completed_blocks.length / totalBlocks) * 100
                );
                
                // Check if lesson is fully complete
                if (progress.completed_blocks.length === totalBlocks) {
                    progress.completed = true;
                    progress.completed_at = new Date().toISOString();
                }
                
                await this.saveUserProgress(lessonId, progress);
            }
            
            return progress;
            
        } catch (error) {
            console.error('❌ Failed to mark block complete:', error);
            throw error;
        }
    }
}

// Create global instance
window.firebaseLessonService = new FirebaseLessonService();
window.FirebaseLessonService = FirebaseLessonService;

} // End of duplicate declaration guard - Phase 2 Fix
