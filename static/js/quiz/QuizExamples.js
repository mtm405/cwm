/**
 * Quiz System Usage Example
 * Demonstrates how to use the consolidated quiz system
 */

// Example usage of the quiz system
document.addEventListener('DOMContentLoaded', async () => {
    
    // Sample quiz data
    const sampleQuizData = {
        id: 'javascript_basics_quiz',
        title: 'JavaScript Basics Quiz',
        description: 'Test your knowledge of JavaScript fundamentals',
        timeLimit: 300000, // 5 minutes
        allowReview: true,
        allowSkip: false,
        allowBack: true,
        shuffleQuestions: false,
        shuffleOptions: true,
        immediateHybrid: false,
        lessonId: 'js_lesson_01',
        questions: [
            {
                id: 'q1',
                type: 'multiple_choice',
                question: 'What is the correct way to declare a variable in JavaScript?',
                options: [
                    'var myVariable;',
                    'variable myVariable;',
                    'v myVariable;',
                    'declare myVariable;'
                ],
                correctAnswer: 0,
                explanation: 'The "var" keyword is used to declare variables in JavaScript.',
                points: 1,
                difficulty: 'easy',
                tags: ['variables', 'syntax']
            },
            {
                id: 'q2',
                type: 'true_false',
                question: 'JavaScript is a statically typed language.',
                correctAnswer: false,
                explanation: 'JavaScript is a dynamically typed language, meaning variable types are determined at runtime.',
                points: 1,
                difficulty: 'medium',
                tags: ['types', 'fundamentals']
            },
            {
                id: 'q3',
                type: 'fill_blank',
                question: 'Complete the function: function greet(name) { return "Hello, " + [name] + ["!"]; }',
                correctAnswer: ['name', '!'],
                explanation: 'The function should concatenate the name parameter with the greeting text.',
                points: 2,
                difficulty: 'medium',
                tags: ['functions', 'strings']
            },
            {
                id: 'q4',
                type: 'multiple_choice',
                question: 'Which of the following is **NOT** a primitive data type in JavaScript?',
                options: [
                    'string',
                    'number',
                    'object',
                    'boolean'
                ],
                correctAnswer: 2,
                explanation: 'Object is not a primitive data type. The primitive types are: string, number, boolean, null, undefined, symbol, and bigint.',
                points: 2,
                difficulty: 'hard',
                tags: ['types', 'primitives']
            }
        ]
    };

    // Initialize quiz controller
    const quizController = new QuizController('quiz-container', {
        showProgress: true,
        showTimer: true,
        allowNavigation: true,
        animateTransitions: true,
        keyboardShortcuts: true
    });

    // Load the quiz
    try {
        await quizController.loadQuiz(sampleQuizData, {
            autoSave: true,
            analytics: true,
            submitResults: true
        });

        console.log('Quiz loaded successfully!');

        // Listen for quiz events
        quizController.on('quiz:completed', (results) => {
            console.log('Quiz completed:', results);
            
            // Handle quiz completion
            showQuizResults(results);
        });

        quizController.on('quiz:error', (error) => {
            console.error('Quiz error:', error);
            showErrorMessage('An error occurred during the quiz.');
        });

    } catch (error) {
        console.error('Failed to load quiz:', error);
        showErrorMessage('Failed to load the quiz. Please try again.');
    }

    // Helper functions
    function showQuizResults(results) {
        // Display results in a modal or separate page
        console.log('Final Results:', {
            score: results.score,
            percentage: results.percentage,
            achievements: results.achievements,
            recommendations: results.recommendations
        });

        // Send analytics
        if (window.gtag) {
            gtag('event', 'quiz_completed', {
                quiz_id: results.quizId,
                score: results.score,
                percentage: results.percentage,
                time_spent: results.totalTime
            });
        }

        // Show celebration for high scores
        if (results.percentage >= 90) {
            showCelebration('Excellent work! 🎉');
        } else if (results.percentage >= 70) {
            showCelebration('Good job! 👏');
        }
    }

    function showErrorMessage(message) {
        // Show error notification
        if (window.notificationComponent) {
            notificationComponent.show({
                type: 'error',
                title: 'Quiz Error',
                message: message,
                duration: 5000
            });
        } else {
            alert(message);
        }
    }

    function showCelebration(message) {
        // Show celebration notification
        if (window.notificationComponent) {
            notificationComponent.show({
                type: 'success',
                title: 'Congratulations!',
                message: message,
                duration: 3000
            });
        }
    }
});

// Alternative: Manual quiz setup for more control
async function setupCustomQuiz() {
    // Create quiz engine directly
    const quizEngine = new QuizEngine();
    
    // Initialize with custom options
    await quizEngine.initialize(customQuizData, {
        autoSave: false,
        analytics: true,
        debugMode: true
    });

    // Register custom renderers
    quizEngine.registerRenderer('code_completion', new CodeCompletionRenderer({
        language: 'javascript',
        theme: 'dark'
    }));

    // Start quiz
    quizEngine.start();

    // Handle events manually
    quizEngine.state.addEventListener('answer_submitted', (data) => {
        console.log('Answer submitted:', data);
        
        // Custom feedback logic
        if (data.isCorrect) {
            showCustomFeedback('Correct! Well done.', 'success');
        } else {
            showCustomFeedback('Not quite right. Try again!', 'error');
        }
    });

    return quizEngine;
}

// Example: Creating a quiz from lesson content
function createQuizFromLesson(lessonData) {
    const questions = [];

    // Extract quiz questions from lesson content
    if (lessonData.sections) {
        lessonData.sections.forEach(section => {
            if (section.quiz && section.quiz.questions) {
                questions.push(...section.quiz.questions);
            }
        });
    }

    // Create quiz data
    const quizData = {
        id: `${lessonData.id}_quiz`,
        title: `${lessonData.title} - Quiz`,
        description: `Test your understanding of ${lessonData.title}`,
        lessonId: lessonData.id,
        questions: questions,
        timeLimit: questions.length * 60000, // 1 minute per question
        allowReview: true,
        allowSkip: true,
        shuffleQuestions: true
    };

    return quizData;
}

// Example: Adaptive quiz that adjusts difficulty
class AdaptiveQuizEngine extends QuizEngine {
    constructor() {
        super();
        this.performanceHistory = [];
        this.difficultyAdjustment = 0;
    }

    async submitAnswer(answer) {
        // Call parent method
        await super.submitAnswer(answer);

        // Track performance
        const currentAnswer = this.state.getCurrentAnswer();
        this.performanceHistory.push({
            isCorrect: currentAnswer.isCorrect,
            timeSpent: currentAnswer.timeSpent,
            difficulty: this.state.getCurrentQuestion().difficulty
        });

        // Adjust difficulty based on recent performance
        this.adjustDifficulty();
    }

    adjustDifficulty() {
        const recentAnswers = this.performanceHistory.slice(-3);
        const correctCount = recentAnswers.filter(a => a.isCorrect).length;
        
        if (correctCount >= 3) {
            // Increase difficulty
            this.difficultyAdjustment = Math.min(this.difficultyAdjustment + 1, 2);
        } else if (correctCount <= 1) {
            // Decrease difficulty
            this.difficultyAdjustment = Math.max(this.difficultyAdjustment - 1, -2);
        }

        // Apply difficulty adjustment to remaining questions
        this.applyDifficultyFilter();
    }

    applyDifficultyFilter() {
        // Filter upcoming questions based on adjusted difficulty
        // Implementation depends on how difficulty levels are defined
    }
}

// Example: Quiz with custom validation
class CustomValidationRenderer extends MultipleChoiceRenderer {
    constructor(options = {}) {
        super(options);
        this.customValidation = options.customValidation;
    }

    validateAnswer(question, answer) {
        // Apply custom validation logic
        if (this.customValidation) {
            return this.customValidation(question, answer);
        }
        
        // Fall back to default validation
        return super.validateAnswer(question, answer);
    }
}

// Export examples for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupCustomQuiz,
        createQuizFromLesson,
        AdaptiveQuizEngine,
        CustomValidationRenderer
    };
}
