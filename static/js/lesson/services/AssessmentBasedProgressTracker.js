/**
 * Assessment-Based Progress Tracking System
 * Ensures students complete meaningful assessments before marking blocks as complete
 */

export class AssessmentBasedProgressTracker {
    constructor() {
        this.assessmentRequirements = new Map();
        this.completionStrategies = new Map();
        this.assessmentScores = new Map();
        this.minimumScoreThreshold = 70; // 70% minimum to pass
        this.initialized = false;
        
        this.initializeAssessmentStrategies();
    }
    
    /**
     * Initialize assessment strategies for different block types
     */
    initializeAssessmentStrategies() {
        // Quiz blocks - require passing grade
        this.completionStrategies.set('quiz', {
            requiresAssessment: true,
            assessmentType: 'score_based',
            minimumScore: 70,
            allowRetries: true,
            maxRetries: 3,
            validateCompletion: (blockId, results) => {
                return results.score >= this.minimumScoreThreshold && results.passed;
            }
        });
        
        // Code challenge blocks - require tests to pass
        this.completionStrategies.set('code_challenge', {
            requiresAssessment: true,
            assessmentType: 'test_based',
            minimumTestsPassed: 80, // 80% of tests must pass
            allowRetries: true,
            maxRetries: 5,
            validateCompletion: (blockId, results) => {
                const testPassRate = (results.tests_passed / results.total_tests) * 100;
                return testPassRate >= 80 && results.success;
            }
        });
        
        // Interactive code blocks - require successful execution
        this.completionStrategies.set('interactive_code', {
            requiresAssessment: true,
            assessmentType: 'execution_based',
            requiresOutput: true,
            allowRetries: true,
            maxRetries: 10,
            validateCompletion: (blockId, results) => {
                return results.success && !results.error && results.output;
            }
        });
        
        // Fill-in-the-blank or coding exercises
        this.completionStrategies.set('coding_exercise', {
            requiresAssessment: true,
            assessmentType: 'validation_based',
            requiresCorrectAnswer: true,
            allowRetries: true,
            maxRetries: 3,
            validateCompletion: (blockId, results) => {
                return results.correct || results.validation_passed;
            }
        });
        
        // Text blocks with comprehension questions
        this.completionStrategies.set('text_with_questions', {
            requiresAssessment: true,
            assessmentType: 'comprehension_based',
            minimumScore: 60,
            allowRetries: true,
            maxRetries: 2,
            validateCompletion: (blockId, results) => {
                return results.score >= 60;
            }
        });
        
        // Pure text blocks - require engagement proof
        this.completionStrategies.set('text', {
            requiresAssessment: false,
            assessmentType: 'engagement_based',
            minimumTimeSpent: 30, // 30 seconds minimum
            requiresInteraction: true,
            validateCompletion: (blockId, results) => {
                return results.timeSpent >= 30 && results.scrolledToBottom;
            }
        });
        
        // Video blocks - require watching completion
        this.completionStrategies.set('video', {
            requiresAssessment: false,
            assessmentType: 'completion_based',
            minimumWatchPercentage: 80,
            validateCompletion: (blockId, results) => {
                return results.watchPercentage >= 80;
            }
        });
        
        console.log('✅ Assessment strategies initialized');
    }
    
    /**
     * Initialize tracking for a specific lesson
     */
    initializeLessonAssessments(lessonData) {
        if (!lessonData || !lessonData.blocks) {
            console.error('Invalid lesson data provided');
            return;
        }
        
        console.log(`🎯 Initializing assessment tracking for lesson: ${lessonData.id}`);
        
        // Set up assessment requirements for each block
        lessonData.blocks.forEach(block => {
            this.setupBlockAssessment(block);
        });
        
        this.initialized = true;
        console.log(`✅ Assessment tracking initialized for ${lessonData.blocks.length} blocks`);
    }
    
    /**
     * Set up assessment requirements for a specific block
     */
    setupBlockAssessment(block) {
        const blockType = this.determineBlockType(block);
        const strategy = this.completionStrategies.get(blockType);
        
        if (!strategy) {
            console.warn(`No assessment strategy found for block type: ${blockType}`);
            return;
        }
        
        const requirements = {
            blockId: block.id,
            blockType: blockType,
            requiresAssessment: strategy.requiresAssessment,
            assessmentType: strategy.assessmentType,
            strategy: strategy,
            attempts: 0,
            maxAttempts: strategy.maxRetries || 1,
            isCompleted: false,
            lastAttempt: null,
            bestScore: 0,
            timeSpent: 0,
            startTime: null
        };
        
        this.assessmentRequirements.set(block.id, requirements);
        console.log(`📋 Assessment requirements set for block ${block.id} (${blockType})`);
    }
    
    /**
     * Determine the assessment type for a block
     */
    determineBlockType(block) {
        // Check explicit block type first
        if (block.type) {
            switch (block.type) {
                case 'quiz':
                    return 'quiz';
                case 'code_challenge':
                case 'interactive_challenge':
                    return 'code_challenge';
                case 'code_example':
                case 'interactive_code':
                    return 'interactive_code';
                case 'coding_exercise':
                    return 'coding_exercise';
                case 'video':
                    return 'video';
                case 'text':
                    // Check if text block has questions
                    if (block.questions && block.questions.length > 0) {
                        return 'text_with_questions';
                    }
                    return 'text';
                default:
                    return 'text';
            }
        }
        
        // Fallback detection based on content
        if (block.quiz_id || block.questions) {
            return 'quiz';
        }
        
        if (block.code || block.starter_code || block.tests) {
            return 'interactive_code';
        }
        
        if (block.video_url || block.video_id) {
            return 'video';
        }
        
        return 'text';
    }
    
    /**
     * Start assessment tracking for a block
     */
    startBlockAssessment(blockId) {
        const requirements = this.assessmentRequirements.get(blockId);
        
        if (!requirements) {
            console.warn(`No assessment requirements found for block: ${blockId}`);
            return false;
        }
        
        requirements.startTime = Date.now();
        requirements.attempts += 1;
        
        console.log(`🎯 Started assessment for block ${blockId} (attempt ${requirements.attempts})`);
        
        return true;
    }
    
    /**
     * Evaluate if a block assessment is complete
     */
    async evaluateBlockCompletion(blockId, results) {
        const requirements = this.assessmentRequirements.get(blockId);
        
        if (!requirements) {
            console.warn(`No assessment requirements found for block: ${blockId}`);
            return false;
        }
        
        // Update time spent
        if (requirements.startTime) {
            requirements.timeSpent += Date.now() - requirements.startTime;
        }
        
        // Update attempt info
        requirements.lastAttempt = {
            timestamp: Date.now(),
            results: results,
            score: results.score || 0
        };
        
        // Update best score
        if (results.score > requirements.bestScore) {
            requirements.bestScore = results.score;
        }
        
        // Validate completion using strategy
        const isComplete = requirements.strategy.validateCompletion(blockId, results);
        
        if (isComplete) {
            requirements.isCompleted = true;
            console.log(`✅ Block ${blockId} assessment completed successfully`);
            
            // Emit completion event
            this.emitAssessmentEvent('assessmentCompleted', {
                blockId: blockId,
                blockType: requirements.blockType,
                attempts: requirements.attempts,
                timeSpent: requirements.timeSpent,
                score: results.score,
                results: results
            });
            
            return true;
        } else {
            console.log(`❌ Block ${blockId} assessment not yet complete`);
            
            // Check if retries are allowed
            if (requirements.attempts >= requirements.maxAttempts) {
                console.log(`⚠️ Block ${blockId} has reached maximum attempts (${requirements.maxAttempts})`);
                this.emitAssessmentEvent('assessmentFailed', {
                    blockId: blockId,
                    blockType: requirements.blockType,
                    attempts: requirements.attempts,
                    maxAttempts: requirements.maxAttempts,
                    bestScore: requirements.bestScore,
                    reason: 'max_attempts_reached'
                });
                
                return false;
            }
            
            // Provide feedback for improvement
            this.provideAssessmentFeedback(blockId, results, requirements);
            
            return false;
        }
    }
    
    /**
     * Check if a block can be marked as complete
     */
    canMarkBlockComplete(blockId) {
        const requirements = this.assessmentRequirements.get(blockId);
        
        if (!requirements) {
            console.warn(`No assessment requirements found for block: ${blockId}`);
            return true; // Allow completion if no requirements set
        }
        
        // If no assessment is required, allow completion
        if (!requirements.requiresAssessment) {
            return true;
        }
        
        // Check if assessment is completed
        return requirements.isCompleted;
    }
    
    /**
     * Get assessment progress for a block
     */
    getBlockAssessmentProgress(blockId) {
        const requirements = this.assessmentRequirements.get(blockId);
        
        if (!requirements) {
            return null;
        }
        
        return {
            blockId: blockId,
            blockType: requirements.blockType,
            requiresAssessment: requirements.requiresAssessment,
            isCompleted: requirements.isCompleted,
            attempts: requirements.attempts,
            maxAttempts: requirements.maxAttempts,
            bestScore: requirements.bestScore,
            timeSpent: requirements.timeSpent,
            canRetry: requirements.attempts < requirements.maxAttempts,
            strategy: requirements.assessmentType
        };
    }
    
    /**
     * Provide feedback for incomplete assessments
     */
    provideAssessmentFeedback(blockId, results, requirements) {
        const feedback = this.generateAssessmentFeedback(requirements.blockType, results, requirements);
        
        // Emit feedback event
        this.emitAssessmentEvent('assessmentFeedback', {
            blockId: blockId,
            feedback: feedback,
            results: results,
            canRetry: requirements.attempts < requirements.maxAttempts,
            attemptsRemaining: requirements.maxAttempts - requirements.attempts
        });
        
        console.log(`💡 Assessment feedback provided for block ${blockId}:`, feedback);
    }
    
    /**
     * Generate specific feedback based on block type and results
     */
    generateAssessmentFeedback(blockType, results, requirements) {
        switch (blockType) {
            case 'quiz':
                if (results.score < requirements.strategy.minimumScore) {
                    return {
                        type: 'improvement_needed',
                        message: `You need ${requirements.strategy.minimumScore}% to pass. You scored ${results.score}%. Review the material and try again.`,
                        suggestions: [
                            'Review the lesson content carefully',
                            'Pay attention to key concepts',
                            'Take notes while studying'
                        ]
                    };
                }
                break;
                
            case 'code_challenge':
                const testPassRate = (results.tests_passed / results.total_tests) * 100;
                if (testPassRate < requirements.strategy.minimumTestsPassed) {
                    return {
                        type: 'code_improvement_needed',
                        message: `${results.tests_passed}/${results.total_tests} tests passed. You need 80% to complete.`,
                        suggestions: [
                            'Check your code logic carefully',
                            'Review the test cases',
                            'Debug step by step',
                            'Ask for help if needed'
                        ]
                    };
                }
                break;
                
            case 'interactive_code':
                if (results.error) {
                    return {
                        type: 'execution_error',
                        message: 'Your code has errors. Fix them to continue.',
                        suggestions: [
                            'Check syntax errors',
                            'Review variable names',
                            'Verify indentation',
                            'Test with simple examples'
                        ]
                    };
                }
                break;
                
            default:
                return {
                    type: 'general_feedback',
                    message: 'Keep trying! You can do this.',
                    suggestions: [
                        'Take your time',
                        'Review the instructions',
                        'Try a different approach'
                    ]
                };
        }
    }
    
    /**
     * Reset assessment for a block (for retries)
     */
    resetBlockAssessment(blockId) {
        const requirements = this.assessmentRequirements.get(blockId);
        
        if (!requirements) {
            console.warn(`No assessment requirements found for block: ${blockId}`);
            return false;
        }
        
        if (requirements.attempts >= requirements.maxAttempts) {
            console.log(`❌ Cannot reset block ${blockId} - maximum attempts reached`);
            return false;
        }
        
        requirements.isCompleted = false;
        requirements.startTime = null;
        
        console.log(`🔄 Reset assessment for block ${blockId}`);
        return true;
    }
    
    /**
     * Get overall lesson assessment progress
     */
    getLessonAssessmentProgress() {
        const blocks = Array.from(this.assessmentRequirements.values());
        const totalBlocks = blocks.length;
        const completedBlocks = blocks.filter(b => b.isCompleted).length;
        const assessmentBlocks = blocks.filter(b => b.requiresAssessment).length;
        const completedAssessments = blocks.filter(b => b.requiresAssessment && b.isCompleted).length;
        
        return {
            totalBlocks: totalBlocks,
            completedBlocks: completedBlocks,
            assessmentBlocks: assessmentBlocks,
            completedAssessments: completedAssessments,
            overallProgress: totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0,
            assessmentProgress: assessmentBlocks > 0 ? Math.round((completedAssessments / assessmentBlocks) * 100) : 0,
            canCompleteLesson: completedAssessments === assessmentBlocks
        };
    }
    
    /**
     * Emit assessment events
     */
    emitAssessmentEvent(eventType, data) {
        const event = new CustomEvent(`assessment:${eventType}`, {
            detail: data
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Configure assessment difficulty
     */
    configureAssessmentDifficulty(difficulty = 'normal') {
        switch (difficulty) {
            case 'easy':
                this.minimumScoreThreshold = 60;
                this.completionStrategies.get('quiz').minimumScore = 60;
                this.completionStrategies.get('code_challenge').minimumTestsPassed = 70;
                break;
                
            case 'normal':
                this.minimumScoreThreshold = 70;
                this.completionStrategies.get('quiz').minimumScore = 70;
                this.completionStrategies.get('code_challenge').minimumTestsPassed = 80;
                break;
                
            case 'hard':
                this.minimumScoreThreshold = 80;
                this.completionStrategies.get('quiz').minimumScore = 80;
                this.completionStrategies.get('code_challenge').minimumTestsPassed = 90;
                break;
        }
        
        console.log(`🎯 Assessment difficulty set to: ${difficulty}`);
    }
    
    /**
     * Get assessment statistics
     */
    getAssessmentStats() {
        const blocks = Array.from(this.assessmentRequirements.values());
        
        return {
            totalBlocks: blocks.length,
            assessmentBlocks: blocks.filter(b => b.requiresAssessment).length,
            completedBlocks: blocks.filter(b => b.isCompleted).length,
            averageAttempts: blocks.reduce((sum, b) => sum + b.attempts, 0) / blocks.length,
            averageScore: blocks.reduce((sum, b) => sum + b.bestScore, 0) / blocks.length,
            totalTimeSpent: blocks.reduce((sum, b) => sum + b.timeSpent, 0),
            blockTypes: this.getBlockTypeDistribution(blocks)
        };
    }
    
    /**
     * Get distribution of block types
     */
    getBlockTypeDistribution(blocks) {
        const distribution = {};
        
        blocks.forEach(block => {
            distribution[block.blockType] = (distribution[block.blockType] || 0) + 1;
        });
        
        return distribution;
    }
}

// Export for use in other modules
export default AssessmentBasedProgressTracker;
