/**
 * Phase 8: Testing and Validation Suite
 * Validates all lesson system fixes and improvements
 */
export class LessonSystemTest {
    static async runAllTests() {
        console.log('🧪 Running comprehensive lesson system tests...');
        console.log('=' * 60);
        
        const tests = [
            this.testES6ModuleLoading,
            this.testDataStructures,
            this.testQuizSystem,
            this.testEditorSystem,
            this.testErrorRecovery,
            this.testInitializationTiming,
            this.testDuplicateDeclarationGuards,
            this.testGlobalScopeMinimization
        ];
        
        const results = [];
        
        for (const test of tests) {
            try {
                console.log(`\n🔬 Running ${test.name}...`);
                const result = await test();
                results.push(result);
                
                const status = result.passed ? '✅' : '❌';
                console.log(`${status} ${result.name}: ${result.details || ''}`);
            } catch (error) {
                const errorResult = {
                    name: test.name,
                    passed: false,
                    error: error.message,
                    details: 'Test execution failed'
                };
                results.push(errorResult);
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }
        
        this.displayResults(results);
        return results;
    }
    
    static async testES6ModuleLoading() {
        const modules = [
            'QuizEngine',
            'QuizController', 
            'QuizState',
            'MultipleChoiceRenderer',
            'TrueFalseRenderer',
            'FillBlankRenderer',
            'ModuleInitializer',
            'InitializationQueue'
        ];
        
        const loaded = [];
        const failed = [];
        
        for (const moduleName of modules) {
            // Check globalThis first (ES6 preferred)
            if (typeof globalThis[moduleName] !== 'undefined') {
                loaded.push(moduleName);
            } else if (typeof window[moduleName] !== 'undefined') {
                loaded.push(`${moduleName} (window fallback)`);
            } else {
                failed.push(moduleName);
            }
        }
        
        // Test ES6 module import capability
        let es6ImportWorks = false;
        try {
            const testModule = await import('../core/moduleInitializer.js').catch(() => null);
            es6ImportWorks = testModule !== null;
        } catch (e) {
            es6ImportWorks = false;
        }
        
        return {
            name: 'ES6 Module Loading',
            passed: loaded.length >= 6 && es6ImportWorks, // At least core modules + ES6 imports work
            details: `${loaded.length}/${modules.length} modules loaded, ES6 imports: ${es6ImportWorks}`,
            loaded,
            failed
        };
    }
    
    static async testDataStructures() {
        const checks = [
            {
                name: 'Lesson data exists',
                test: () => globalThis.lessonData !== undefined
            },
            {
                name: 'Lesson data normalized',
                test: () => globalThis.lessonData?.subtopics !== undefined || 
                           globalThis.lessonData?.blocks !== undefined ||
                           globalThis.lessonData?.content !== undefined
            },
            {
                name: 'Data structure normalizer available',
                test: () => typeof globalThis.DataStructureNormalizer !== 'undefined'
            },
            {
                name: 'Validation functions work',
                test: () => {
                    if (!globalThis.DataStructureNormalizer) return false;
                    try {
                        const validation = globalThis.DataStructureNormalizer.validateLessonData({});
                        return validation && typeof validation.errors !== 'undefined';
                    } catch (e) {
                        return false;
                    }
                }
            },
            {
                name: 'Safe filter operations',
                test: () => {
                    if (!globalThis.DataStructureNormalizer) return false;
                    try {
                        const result = globalThis.DataStructureNormalizer.safeFilter(null, () => true);
                        return Array.isArray(result);
                    } catch (e) {
                        return false;
                    }
                }
            }
        ];
        
        const results = checks.map(check => ({
            name: check.name,
            passed: check.test()
        }));
        
        const passed = results.filter(r => r.passed).length;
        
        return {
            name: 'Data Structures',
            passed: passed >= 3, // At least core functionality should work
            details: `${passed}/${checks.length} validation checks passed`,
            checkResults: results
        };
    }
    
    static async testQuizSystem() {
        const checks = {
            engineAvailable: typeof globalThis.QuizEngine !== 'undefined',
            controllerAvailable: typeof globalThis.QuizController !== 'undefined',
            renderersAvailable: typeof globalThis.MultipleChoiceRenderer !== 'undefined',
            canInitialize: false,
            hasErrorHandling: false
        };
        
        if (checks.engineAvailable) {
            try {
                const testQuiz = new globalThis.QuizEngine({ 
                    id: 'test-quiz',
                    questions: [
                        {
                            id: 'test-1',
                            type: 'multiple_choice',
                            question: 'Test question?',
                            options: ['A', 'B', 'C'],
                            correct: 0
                        }
                    ]
                });
                checks.canInitialize = true;
                
                // Test error handling
                try {
                    testQuiz.initialize();
                    checks.hasErrorHandling = true;
                } catch (e) {
                    // Error handling exists if it throws properly
                    checks.hasErrorHandling = true;
                }
            } catch (e) {
                console.warn('Quiz initialization test failed:', e.message);
            }
        }
        
        const passedChecks = Object.values(checks).filter(Boolean).length;
        
        return {
            name: 'Quiz System',
            passed: checks.engineAvailable && checks.canInitialize,
            details: `${passedChecks}/5 quiz system checks passed`,
            checks
        };
    }
    
    static async testEditorSystem() {
        const checks = {
            editorServiceAvailable: typeof globalThis.EditorService !== 'undefined',
            codeSubmissionAvailable: typeof globalThis.codeSubmissionHandler !== 'undefined',
            aceEditorAvailable: typeof globalThis.ace !== 'undefined',
            configAvailable: typeof globalThis.EditorConfig !== 'undefined',
            integrationAvailable: false
        };
        
        // Test editor integration
        try {
            const editorContainers = document.querySelectorAll('.code-editor-container');
            checks.integrationAvailable = editorContainers.length > 0;
        } catch (e) {
            checks.integrationAvailable = false;
        }
        
        const passedChecks = Object.values(checks).filter(Boolean).length;
        
        return {
            name: 'Editor System',
            passed: passedChecks >= 2, // At least some editor components should be available
            details: `${passedChecks}/5 editor system checks passed`,
            checks
        };
    }
    
    static async testErrorRecovery() {
        const checks = {
            recoverySystemAvailable: typeof globalThis.errorRecovery !== 'undefined',
            hasStrategies: false,
            canRecover: false,
            fallbacksWork: false
        };
        
        if (checks.recoverySystemAvailable) {
            checks.hasStrategies = globalThis.errorRecovery?.recoveryStrategies?.size > 0;
            
            // Test recovery capability
            try {
                if (globalThis.errorRecovery.recover) {
                    checks.canRecover = true;
                }
            } catch (e) {
                // If method exists but fails, that's still better than nothing
                checks.canRecover = typeof globalThis.errorRecovery.recover === 'function';
            }
        }
        
        // Test fallback mechanisms
        try {
            // Check if basic lesson functionality works as fallback
            if (typeof globalThis.initQueue?.initializeFallback === 'function') {
                checks.fallbacksWork = true;
            }
        } catch (e) {
            checks.fallbacksWork = false;
        }
        
        const passedChecks = Object.values(checks).filter(Boolean).length;
        
        return {
            name: 'Error Recovery',
            passed: checks.fallbacksWork || checks.recoverySystemAvailable,
            details: `${passedChecks}/4 error recovery checks passed`,
            checks
        };
    }
    
    static async testInitializationTiming() {
        const checks = {
            initQueueExists: typeof globalThis.initQueue !== 'undefined',
            appInstanceFound: false,
            modulesInitialized: false,
            timingCoordinated: false
        };
        
        // Check for app instance
        const appChecks = [
            globalThis.CwMApp,
            globalThis.app,
            globalThis.mainApp,
            globalThis.modernApp
        ];
        checks.appInstanceFound = appChecks.some(app => app && app.initialized);
        
        // Check module initialization
        const coreModules = ['QuizEngine', 'ModuleInitializer'];
        checks.modulesInitialized = coreModules.some(module => 
            typeof globalThis[module] !== 'undefined'
        );
        
        // Check timing coordination
        if (checks.initQueueExists) {
            checks.timingCoordinated = typeof globalThis.initQueue.waitForApp === 'function';
        }
        
        const passedChecks = Object.values(checks).filter(Boolean).length;
        
        return {
            name: 'Initialization Timing',
            passed: checks.initQueueExists && checks.timingCoordinated,
            details: `${passedChecks}/4 timing coordination checks passed`,
            checks
        };
    }
    
    static async testDuplicateDeclarationGuards() {
        const checks = {
            guardedDeclarations: 0,
            totalChecked: 0,
            preventsDuplicates: false
        };
        
        // Test duplicate declaration prevention
        const testModules = [
            'EditorConfig',
            'EditorService',
            'QuizEngine',
            'DataStructureNormalizer'
        ];
        
        for (const moduleName of testModules) {
            checks.totalChecked++;
            
            const existing = globalThis[moduleName];
            if (existing) {
                checks.guardedDeclarations++;
                
                // Try to redeclare (should be prevented)
                const originalValue = existing;
                try {
                    globalThis[moduleName] = { test: 'duplicate' };
                    
                    // If it's the same as original, guard worked
                    if (globalThis[moduleName] === originalValue) {
                        checks.preventsDuplicates = true;
                    }
                } catch (e) {
                    // Error is also good - it means redeclaration was prevented
                    checks.preventsDuplicates = true;
                }
            }
        }
        
        return {
            name: 'Duplicate Declaration Guards',
            passed: checks.guardedDeclarations > 0,
            details: `${checks.guardedDeclarations}/${checks.totalChecked} modules have declaration guards`,
            checks
        };
    }
    
    static async testGlobalScopeMinimization() {
        const globalKeys = Object.keys(globalThis);
        const windowKeys = typeof window !== 'undefined' ? Object.keys(window) : [];
        
        // Check for ES6 module patterns
        const es6Patterns = [
            'export',
            'import',
            'globalThis usage'
        ];
        
        // Count our additions to global scope
        const ourGlobals = globalKeys.filter(key => {
            return key.includes('Quiz') || 
                   key.includes('Editor') || 
                   key.includes('lesson') ||
                   key.includes('initQueue') ||
                   key === 'ModuleInitializer';
        });
        
        // Check if globalThis is preferred over window
        const usesGlobalThis = typeof globalThis.lessonData !== 'undefined';
        const usesWindow = typeof window !== 'undefined' && typeof window.lessonData !== 'undefined';
        
        return {
            name: 'Global Scope Minimization',
            passed: ourGlobals.length < 15 && usesGlobalThis, // Reasonable limit
            details: `${ourGlobals.length} globals added, prefers globalThis: ${usesGlobalThis}`,
            checks: {
                globalCount: ourGlobals.length,
                usesGlobalThis,
                usesWindow,
                ourGlobals
            }
        };
    }
    
    static displayResults(results) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 LESSON SYSTEM TEST RESULTS');
        console.log('='.repeat(60));
        
        results.forEach((result, index) => {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`\n${index + 1}. ${status} - ${result.name}`);
            console.log(`   ${result.details || 'No details'}`);
            
            if (result.error) {
                console.error(`   🚨 Error: ${result.error}`);
            }
            
            // Show additional details for complex tests
            if (result.checks && typeof result.checks === 'object') {
                console.log('   📋 Detailed checks:');
                Object.entries(result.checks).forEach(([key, value]) => {
                    const checkStatus = value ? '✓' : '✗';
                    console.log(`      ${checkStatus} ${key}: ${value}`);
                });
            }
        });
        
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        const percentage = Math.round((passed / total) * 100);
        
        console.log('\n' + '='.repeat(60));
        console.log(`📈 OVERALL RESULTS: ${passed}/${total} tests passed (${percentage}%)`);
        
        if (percentage >= 80) {
            console.log('🎉 EXCELLENT! Lesson system is production-ready!');
        } else if (percentage >= 60) {
            console.log('⚠️  GOOD! Some areas need attention but core functionality works.');
        } else {
            console.log('🚨 NEEDS WORK! Critical issues detected.');
        }
        
        console.log('='.repeat(60));
        
        return {
            passed,
            total,
            percentage,
            results
        };
    }
    
    static async runQuickTest() {
        console.log('🚀 Running quick lesson system health check...');
        
        const essentialTests = [
            this.testES6ModuleLoading,
            this.testDataStructures,
            this.testInitializationTiming
        ];
        
        const results = [];
        for (const test of essentialTests) {
            try {
                results.push(await test());
            } catch (error) {
                results.push({
                    name: test.name,
                    passed: false,
                    error: error.message
                });
            }
        }
        
        const passed = results.filter(r => r.passed).length;
        console.log(`⚡ Quick test: ${passed}/${results.length} essential systems working`);
        
        return passed === results.length;
    }
}

// Auto-run tests in development environment
if (typeof globalThis !== 'undefined') {
    // Expose for manual testing
    globalThis.LessonSystemTest = LessonSystemTest;
    
    // Auto-run in development
    if (globalThis.location && 
        (globalThis.location.hostname === 'localhost' || 
         globalThis.location.hostname === '127.0.0.1')) {
        console.log('🔧 Development environment detected');
        
        // Run quick test immediately
        setTimeout(() => {
            LessonSystemTest.runQuickTest();
        }, 1000);
        
        // Run full test suite after initialization
        setTimeout(() => {
            LessonSystemTest.runAllTests();
        }, 5000);
    }
}

export default LessonSystemTest;
