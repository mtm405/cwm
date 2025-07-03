/**
 * Module Initializer - Handles ES6 module initialization and exposes to global scope
 */
export class ModuleInitializer {
    static async initializeQuizModules() {
        try {
            // Import modules dynamically
            const [
                { QuizEngine },
                { QuizController },
                { QuizState },
                { MultipleChoiceRenderer },
                { TrueFalseRenderer },
                { FillBlankRenderer }
            ] = await Promise.all([
                import('../quiz/QuizEngine.js'),
                import('../quiz/QuizController.js'),
                import('../quiz/QuizState.js'),
                import('../quiz/renderers/MultipleChoiceRenderer.js'),
                import('../quiz/renderers/TrueFalseRenderer.js'),
                import('../quiz/renderers/FillBlankRenderer.js')
            ]);

            // Expose to global scope for backward compatibility
            window.QuizEngine = QuizEngine;
            window.QuizController = QuizController;
            window.QuizState = QuizState;
            window.MultipleChoiceRenderer = MultipleChoiceRenderer;
            window.TrueFalseRenderer = TrueFalseRenderer;
            window.FillBlankRenderer = FillBlankRenderer;

            console.log('✅ Quiz modules initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize quiz modules:', error);
            return false;
        }
    }

    static async initializeEditorModules() {
        try {
            const { codeSubmissionHandler } = await import('../editor/codeSubmissionHandler.js');
            window.codeSubmissionHandler = codeSubmissionHandler;
            console.log('✅ Editor modules initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize editor modules:', error);
            return false;
        }
    }
}

// Auto-initialize on import
ModuleInitializer.initializeQuizModules();
ModuleInitializer.initializeEditorModules();
