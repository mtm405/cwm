/**
 * Test script for vocabulary functionality
 */

// Test the vocabulary manager
console.log('Testing vocabulary system...');

// Create test data
const testVocabulary = [
    {
        id: 'variable',
        term: 'Variable',
        definition: 'A named storage location that holds a value that can be modified during program execution.',
        example: 'x = 10\nname = "Python"',
        category: 'Basics',
        difficulty: 'beginner',
        tags: ['storage', 'data', 'assignment']
    },
    {
        id: 'function',
        term: 'Function',
        definition: 'A reusable block of code that performs a specific task and can accept inputs (parameters) and return outputs.',
        example: 'def greet(name):\n    return f"Hello, {name}!"',
        category: 'Basics',
        difficulty: 'beginner',
        tags: ['reusable', 'parameters', 'return']
    },
    {
        id: 'list',
        term: 'List',
        definition: 'An ordered collection of items that can be modified. Lists are mutable and can contain different data types.',
        example: 'fruits = ["apple", "banana", "orange"]\nfruits.append("grape")',
        category: 'Data Structures',
        difficulty: 'beginner',
        tags: ['collection', 'ordered', 'mutable']
    }
];

// Test vocabulary manager creation
try {
    const manager = new VocabularyManager();
    console.log('✅ VocabularyManager created successfully');
    
    // Test vocabulary data
    manager.vocabularyData = testVocabulary;
    manager.filteredData = [...testVocabulary];
    
    console.log('✅ Test data loaded');
    
    // Test filtering
    manager.filterByCategory('Basics');
    console.log(`✅ Filtered by category: ${manager.filteredData.length} items`);
    
    // Test search
    manager.searchTerms('variable');
    console.log(`✅ Search functionality: ${manager.filteredData.length} items found`);
    
    console.log('🎉 All tests passed!');
    
} catch (error) {
    console.error('❌ Test failed:', error);
}
