// Handles lesson data transformation and normalization

export function transformLessonDataToBlocks(lesson) {
    if (!lesson) return null;
    if (lesson.blocks && Array.isArray(lesson.blocks)) return lesson;
    lesson.blocks = [];
    let blockOrder = 0;
    if (lesson.content) {
        lesson.blocks.push({
            id: `${lesson.id}-intro`,
            type: 'text',
            title: 'Introduction',
            content: lesson.content,
            order: blockOrder++,
            subtopic_index: 0
        });
    }
    if (lesson.code_examples && Array.isArray(lesson.code_examples)) {
        lesson.code_examples.forEach((example, index) => {
            lesson.blocks.push({
                id: `${lesson.id}-code-${index}`,
                type: 'code_example',
                title: example.title || `Example ${index + 1}`,
                code: example.code,
                explanation: example.explanation,
                language: 'python',
                order: blockOrder++,
                subtopic_index: 0
            });
        });
    }
    if (lesson.exercises && Array.isArray(lesson.exercises)) {
        lesson.exercises.forEach((exercise, index) => {
            lesson.blocks.push({
                id: `${lesson.id}-exercise-${index}`,
                type: 'interactive',
                title: exercise.title,
                instructions: exercise.description,
                starter_code: exercise.starter_code,
                solution: exercise.solution,
                hints: exercise.hints,
                language: 'python',
                order: blockOrder++,
                subtopic_index: 1,
                challenge_type: 'Exercise',
                difficulty: lesson.difficulty
            });
        });
    }
    if (lesson.quiz_id) {
        lesson.blocks.push({
            id: `${lesson.id}-quiz`,
            type: 'quiz',
            quiz_id: lesson.quiz_id,
            title: 'Knowledge Check',
            description: 'Test your understanding of this lesson',
            order: blockOrder++,
            subtopic_index: 2
        });
    }
    if (!lesson.subtopics || lesson.subtopics.length === 0) {
        lesson.subtopics = ['Introduction', 'Practice', 'Assessment'];
    } else if (lesson.subtopics && Array.isArray(lesson.subtopics)) {
        lesson.subtopics = lesson.subtopics.map((subtopic) => {
            if (typeof subtopic === 'string') return subtopic;
            return subtopic.title || subtopic;
        });
    }
    return lesson;
}

export function normalizeLessonData(lesson, DataStructureNormalizer) {
    if (DataStructureNormalizer && lesson) {
        try {
            const validation = DataStructureNormalizer.validateLessonData(lesson);
            if (validation.errors.length > 0) {
                return DataStructureNormalizer.normalizeLessonDataComprehensive(lesson);
            } else {
                return DataStructureNormalizer.normalizeLessonData(lesson);
            }
        } catch (error) {
            return lesson;
        }
    }
    return lesson;
}
