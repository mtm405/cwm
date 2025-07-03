/**
 * Data Structure Normalizer
 * Ensures lesson data has consistent structure for filtering operations
 * Phase 3 Enhancement: Enhanced data validation and error handling
 */

// Prevent duplicate declarations - Phase 2 Fix
if (typeof window.DataStructureNormalizer === 'undefined') {

class DataStructureNormalizer {
    /**
     * Normalize lesson data to ensure consistent structure
     */
    static normalizeLessonData(lessonData) {
        if (!lessonData) {
            console.warn('⚠️ No lesson data provided, creating default structure');
            return {
                id: 'unknown',
                title: 'Untitled Lesson',
                subtopics: [],
                blocks: [],
                content: []
            };
        }

        console.log('🔧 Normalizing lesson data structure...');

        // Ensure all required fields exist
        const normalized = {
            id: lessonData.id || 'unknown',
            title: lessonData.title || 'Untitled Lesson',
            difficulty: lessonData.difficulty || 'beginner',
            estimated_time: lessonData.estimated_time || 30,
            xp_reward: lessonData.xp_reward || 100,
            ...lessonData
        };

        // Normalize subtopics array
        normalized.subtopics = this.normalizeSubtopics(lessonData.subtopics || []);

        // Normalize blocks array
        normalized.blocks = this.normalizeBlocks(lessonData.blocks || []);

        // Normalize content array (legacy support)
        normalized.content = this.normalizeContent(lessonData.content || []);

        console.log('✅ Lesson data normalized:', {
            subtopics: normalized.subtopics.length,
            blocks: normalized.blocks.length,
            content: normalized.content.length
        });

        return normalized;
    }

    /**
     * Normalize subtopics array
     */
    static normalizeSubtopics(subtopics) {
        if (!Array.isArray(subtopics)) {
            console.warn('⚠️ Subtopics is not an array, converting:', typeof subtopics);
            return [];
        }

        return subtopics.map((subtopic, index) => {
            // Handle different subtopic formats
            if (typeof subtopic === 'string') {
                return {
                    id: `subtopic-${index}`,
                    title: subtopic,
                    content: []
                };
            }

            if (typeof subtopic === 'object' && subtopic !== null) {
                return {
                    id: subtopic.id || `subtopic-${index}`,
                    title: subtopic.title || `Subtopic ${index + 1}`,
                    content: this.normalizeContent(subtopic.content || []),
                    icon: subtopic.icon || 'book',
                    ...subtopic
                };
            }

            console.warn('⚠️ Invalid subtopic format:', subtopic);
            return {
                id: `subtopic-${index}`,
                title: `Subtopic ${index + 1}`,
                content: []
            };
        });
    }

    /**
     * Normalize blocks array
     */
    static normalizeBlocks(blocks) {
        if (!Array.isArray(blocks)) {
            console.warn('⚠️ Blocks is not an array, converting:', typeof blocks);
            return [];
        }

        return blocks.map((block, index) => this.normalizeContentBlock(block, index))
                    .filter(block => block !== null);
    }

    /**
     * Normalize content array (legacy support)
     */
    static normalizeContent(content) {
        if (!content) return [];
        
        if (typeof content === 'string') {
            // Convert string content to basic text block
            return [{
                id: 'content-main',
                type: 'text',
                content: content,
                order: 1
            }];
        }

        if (!Array.isArray(content)) {
            console.warn('⚠️ Content is not an array, converting:', typeof content);
            return [];
        }

        return content.map((item, index) => this.normalizeContentBlock(item, index))
                     .filter(item => item !== null);
    }

    /**
     * Normalize a single content block
     */
    static normalizeContentBlock(block, index) {
        if (!block) {
            console.warn('⚠️ Null or undefined block at index:', index);
            return null;
        }

        // Handle string blocks
        if (typeof block === 'string') {
            return {
                id: `block-${index}`,
                type: 'text',
                content: block,
                order: index + 1
            };
        }

        // Handle object blocks
        if (typeof block === 'object') {
            const normalized = {
                id: block.id || `block-${index}`,
                type: block.type || 'text',
                order: block.order !== undefined ? block.order : index + 1,
                title: block.title || '',
                content: block.content || '',
                ...block
            };

            // Validate block type
            const validTypes = ['text', 'code_example', 'interactive', 'quiz', 'video', 'debug'];
            if (!validTypes.includes(normalized.type)) {
                console.warn('⚠️ Unknown block type:', normalized.type, 'defaulting to text');
                normalized.type = 'text';
            }

            return normalized;
        }

        console.warn('⚠️ Invalid block format at index:', index, block);
        return null;
    }

    /**
     * Safe filter operation for arrays
     */
    static safeFilter(array, filterFn) {
        try {
            if (!Array.isArray(array)) {
                console.warn('⚠️ safeFilter: Not an array:', typeof array);
                return [];
            }

            return array.filter(filterFn);
        } catch (error) {
            console.error('❌ Error in safeFilter:', error);
            return [];
        }
    }

    /**
     * Validate lesson data structure
     */
    static validateLessonData(lessonData) {
        const errors = [];
        const warnings = [];

        if (!lessonData) {
            errors.push('Lesson data is null or undefined');
            return { isValid: false, errors, warnings };
        }

        // Check required fields
        if (!lessonData.id) warnings.push('Missing lesson ID');
        if (!lessonData.title) warnings.push('Missing lesson title');

        // Check data types
        if (lessonData.subtopics && !Array.isArray(lessonData.subtopics)) {
            errors.push('Subtopics must be an array');
        }

        if (lessonData.blocks && !Array.isArray(lessonData.blocks)) {
            errors.push('Blocks must be an array');
        }

        if (lessonData.content && !Array.isArray(lessonData.content) && typeof lessonData.content !== 'string') {
            warnings.push('Content should be an array or string');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Phase 3 Enhancement: Create comprehensive data structure normalizer
     */
    static normalizeLessonDataComprehensive(lessonData) {
        if (!lessonData) {
            return {
                id: 'unknown',
                title: 'Untitled Lesson',
                subtopics: [],
                blocks: [],
                content: []
            };
        }

        // Ensure all required fields exist
        const normalized = {
            ...lessonData,
            subtopics: lessonData.subtopics || [],
            blocks: lessonData.blocks || [],
            content: lessonData.content || []
        };

        // Normalize subtopics
        normalized.subtopics = normalized.subtopics.map((subtopic, index) => ({
            id: subtopic.id || `subtopic-${index}`,
            title: subtopic.title || `Subtopic ${index + 1}`,
            content: Array.isArray(subtopic.content) ? subtopic.content : []
        }));

        return normalized;
    }

    /**
     * Phase 3 Enhancement: Normalize individual content blocks safely
     */
    static normalizeContentBlockSafe(block) {
        if (!block) return null;
        
        return {
            id: block.id || `block-${Date.now()}`,
            type: block.type || 'text',
            content: block.content || '',
            ...block
        };
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataStructureNormalizer };
} else {
    window.DataStructureNormalizer = DataStructureNormalizer;
}

} // End of duplicate declaration guard - Phase 2 Fix

console.log('📦 DataStructureNormalizer loaded with Phase 3 enhancements');
