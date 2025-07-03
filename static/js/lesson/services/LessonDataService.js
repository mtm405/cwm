/**
 * Firebase Data Service for Lessons
 * Handles all Firebase operations for lesson data with API fallback
 */

export class LessonDataService {
    constructor() {
        this.db = null;
        this.auth = null;
        this.initialized = false;
        this.cache = new Map();
        this.config = null;
    }
    
    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🔥 Initializing LessonDataService...');
            
            // Check if Firebase SDK is available
            if (typeof firebase === 'undefined') {
                console.warn('⚠️ Firebase SDK not loaded, using API fallback');
                this.initialized = true;
                return;
            }
            
            // Get Firebase config from backend
            const configResponse = await fetch('/api/firebase-config');
            if (configResponse.ok) {
                this.config = await configResponse.json();
                
                // Initialize Firebase if not already done
                if (!firebase.apps.length) {
                    firebase.initializeApp(this.config);
                    console.log('✅ Firebase initialized with config');
                }
                
                this.db = firebase.firestore();
                this.auth = firebase.auth();
                
            } else {
                console.warn('⚠️ Could not get Firebase config, using API fallback');
            }
            
            this.initialized = true;
            console.log('✅ LessonDataService initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Firebase:', error);
            this.initialized = true; // Mark as initialized to use API fallback
        }
    }
    
    async fetchLesson(lessonId) {
        if (!lessonId) {
            throw new Error('Lesson ID is required');
        }
        
        // Check cache first
        if (this.cache.has(lessonId)) {
            console.log(`📦 Returning cached lesson: ${lessonId}`);
            return this.cache.get(lessonId);
        }
        
        // Try to get from window data first (server-rendered)
        if (window.lessonData && window.lessonData.id === lessonId) {
            console.log(`📄 Using server-rendered lesson data: ${lessonId}`);
            this.cache.set(lessonId, window.lessonData);
            return window.lessonData;
        }
        
        // Initialize Firebase if not already done
        await this.initialize();
        
        try {
            let lessonData;
            
            if (this.db) {
                // Fetch from Firebase
                console.log(`🔥 Fetching lesson from Firebase: ${lessonId}`);
                const doc = await this.db.collection('lessons').doc(lessonId).get();
                
                if (!doc.exists) {
                    throw new Error(`Lesson ${lessonId} not found in Firebase`);
                }
                
                lessonData = { id: doc.id, ...doc.data() };
            } else {
                // Fallback to API
                console.log(`🌐 Fetching lesson from API: ${lessonId}`);
                const response = await fetch(`/api/lessons/${lessonId}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch lesson: ${response.status} ${response.statusText}`);
                }
                
                lessonData = await response.json();
            }
            
            // Transform and cache the result
            lessonData = this.transformLessonData(lessonData);
            this.cache.set(lessonId, lessonData);
            
            console.log(`✅ Lesson fetched successfully: ${lessonId}`);
            return lessonData;
            
        } catch (error) {
            console.error(`❌ Error fetching lesson ${lessonId}:`, error);
            throw error;
        }
    }
    
    transformLessonData(data) {
        if (!data) return null;
        
        // Ensure consistent block structure
        if (!data.blocks && (data.content || data.code_examples || data.exercises)) {
            data.blocks = this.convertToBlocks(data);
        }
        
        // Ensure required fields
        data.blocks = data.blocks || [];
        data.title = data.title || 'Untitled Lesson';
        data.description = data.description || '';
        data.difficulty = data.difficulty || 'beginner';
        
        return data;
    }
    
    convertToBlocks(lessonData) {
        const blocks = [];
        let order = 0;
        
        // Convert content to text blocks
        if (lessonData.content) {
            blocks.push({
                id: `${lessonData.id}-intro`,
                type: 'text',
                title: 'Introduction',
                content: lessonData.content,
                order: order++
            });
        }
        
        // Convert code examples
        if (lessonData.code_examples && Array.isArray(lessonData.code_examples)) {
            lessonData.code_examples.forEach((example, idx) => {
                blocks.push({
                    id: `${lessonData.id}-code-${idx}`,
                    type: 'code_example',
                    title: example.title || `Code Example ${idx + 1}`,
                    code: example.code,
                    language: example.language || 'python',
                    explanation: example.explanation,
                    order: order++
                });
            });
        }
        
        // Convert exercises
        if (lessonData.exercises && Array.isArray(lessonData.exercises)) {
            lessonData.exercises.forEach((exercise, idx) => {
                blocks.push({
                    id: `${lessonData.id}-exercise-${idx}`,
                    type: 'interactive',
                    title: exercise.title || `Exercise ${idx + 1}`,
                    instructions: exercise.instructions,
                    starter_code: exercise.starter_code,
                    language: exercise.language || 'python',
                    tests: exercise.tests,
                    order: order++
                });
            });
        }
        
        // Add quiz if exists
        if (lessonData.quiz_id) {
            blocks.push({
                id: `${lessonData.id}-quiz`,
                type: 'quiz',
                title: 'Knowledge Check',
                quiz_id: lessonData.quiz_id,
                order: order++
            });
        }
        
        return blocks;
    }
    
    // Clear cache (useful for development)
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Lesson data cache cleared');
    }
    
    // Get cache info for debugging
    getCacheInfo() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}
