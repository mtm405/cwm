"""
Script to upload programming vocabulary terms to Firebase.
"""
import sys
import os
import json
from datetime import datetime

# Add the parent directory to the path to import the services module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService
from config import config

def format_vocabulary_data():
    """Format the vocabulary terms and descriptions into a structured format."""
    # Add each vocabulary term with its description
    vocabulary_data = [
        # Logic terms
        {
            "term": "AND",
            "description": "A logical keyword where both sides of the comparison must be true in order for the statement to be true.",
            "category": "Logic",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "OR",
            "description": "A logical keyword where only one of the two possibilities need to be true in an argument for the argument to be true.",
            "category": "Logic",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "NOT",
            "description": "The logical keyword that takes a condition set by the user and checks for its opposite.",
            "category": "Logic",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Operations terms
        {
            "term": "Append",
            "description": "An act that adds items to the end of a list or writes text to the end of a file.",
            "category": "Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Insert",
            "description": "In the context of lists, the act of adding an item to a specified spot within the list.",
            "category": "Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Remove",
            "description": "In the context of lists, the act of deleting an item from a list.",
            "category": "Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # File Operations terms
        {
            "term": "Append Function",
            "description": "In the context of file management, a built-in function that adds content to an existing file.",
            "category": "File Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Close Function",
            "description": "In the context of file management, a built-in function that closes a file and frees the memory space the file occupies.",
            "category": "File Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Open Function",
            "description": "A built-in function that opens a file, usually for reading purposes.",
            "category": "File Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Read Function",
            "description": "In the context of file management, a built-in function that reads the contents of a file or stream.",
            "category": "File Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Write Function",
            "description": "In the context of file management, a built-in function that writes content to a new file or overwrites an existing file.",
            "category": "File Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Operators terms
        {
            "term": "Arithmetic Operator",
            "description": "An operator used to perform basic mathematical operations.",
            "category": "Operators",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Comparison Operator",
            "description": "An operator that is used inside Python to compare arguments. Comparison operators include less than, less than or equal to, greater than, or greater than or equal to.",
            "category": "Operators",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Logical Operator",
            "description": "An operator that compares two conditions using keywords and, or, or not.",
            "category": "Operators",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Identity Operator",
            "description": "An operator in Python that is used to determine if two variables share the same memory space.",
            "category": "Operators",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Containment Operator",
            "description": "An operator that determines if a value is contained in a set of values.",
            "category": "Operators",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Testing terms
        {
            "term": "Assert Test",
            "description": "A type of unit test that compares two values and returns a True or False based on the result of the comparison.",
            "category": "Testing",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "assertEqual",
            "description": "An assert test that determines whether two values are equal to each other.",
            "category": "Testing",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "assertIn",
            "description": "An assert test that determines whether a value is contained in a set of values.",
            "category": "Testing",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "assertIs",
            "description": "An assert test that determines whether two variables share the same memory space.",
            "category": "Testing",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "assertIsInstance",
            "description": "An assert test that determines whether a variable is an instance of a class.",
            "category": "Testing",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "assertTrue",
            "description": "An assert test that determines whether a statement is true.",
            "category": "Testing",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Unit Test",
            "description": "A test done on a small unit of code to see if the code works as intended.",
            "category": "Testing",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Variables terms
        {
            "term": "Assignment",
            "description": "An event which takes place when a variable is set to be equal to a string, number, Boolean operator, list, or date.",
            "category": "Variables",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Boolean Variable",
            "description": "A type of variable with two possible values: true or false. A Boolean variable is often used to determine a course of action within a program.",
            "category": "Variables",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Integer Variable",
            "description": "A type of variable that stores whole numbers.",
            "category": "Variables",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Float Variable",
            "description": "A type of number variable that uses a decimal as part of its storage.",
            "category": "Variables",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "String Variable",
            "description": "A type of variable in Python that is used to store items and information.",
            "category": "Variables",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Variable",
            "description": "A container that stores information that can be used elsewhere in code.",
            "category": "Variables",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Immutable",
            "description": "In the context of variables, a type of variable that cannot be changed without redefining the variable.",
            "category": "Variables",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Control Flow terms
        {
            "term": "Break Statement",
            "description": "A statement used to exit a loop of code.",
            "category": "Control Flow",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Continue Statement",
            "description": "A statement used to skip running the rest of an iteration within a loop.",
            "category": "Control Flow",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Elif Statement",
            "description": "A conditional statement that checks to see if a condition is true based on an if statement's condition not being true.",
            "category": "Control Flow",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Else Statement",
            "description": "A statement used in conjunction with if and elif statements. An else statement provides an action in case no if or elif conditions are true.",
            "category": "Control Flow",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "If Statement",
            "description": "A statement used to check to see if a condition is true, and, if it is, causes a specific action to be performed.",
            "category": "Control Flow",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "For Loop",
            "description": "A loop that runs a block of code a set number of times.",
            "category": "Control Flow",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "While Loop",
            "description": "A loop that runs a block of code so long as a given condition is true.",
            "category": "Control Flow",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Nested If",
            "description": "An if statement that is placed inside of another if statement.",
            "category": "Control Flow",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Nested Loop",
            "description": "A loop that is placed inside of another loop.",
            "category": "Control Flow",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Pass Keyword",
            "description": "A keyword that is used as a placeholder for code to be filled in later. The Pass keyword is often used as part of a loop.",
            "category": "Control Flow",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Functions terms
        {
            "term": "Call Signature",
            "description": "A line of code that calls a function and, when applicable, provides needed arguments for said function.",
            "category": "Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Def Keyword",
            "description": "A keyword used in Python to begin and define a function.",
            "category": "Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Function",
            "description": "A block of code that can be called upon multiple times within a program.",
            "category": "Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Method",
            "description": "A function that belongs to a class.",
            "category": "Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Return Keyword",
            "description": "A keyword that defines the end of a function and holds a value to be used outside of the function.",
            "category": "Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Default Value",
            "description": "A value or item in a function that is set to be constant but can be overridden.",
            "category": "Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Math Functions terms
        {
            "term": "ceil",
            "description": "A math function that returns the next integer up from a decimal number.",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "fabs",
            "description": "A math function that measures the absolute distance from zero and presented as a floating decimal.",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "floor",
            "description": "A math function that returns an integer portion of a number.",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "fmod",
            "description": "A math function that returns the modulus for two numbers and is presented as a floating decimal.",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "frexp",
            "description": "A math function that returns the mantissa and exponent of a number.",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "isnan",
            "description": "A math function that checks to see if a value is a number and returns False if it is a number and True if it is not a number.",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "isqrt",
            "description": "A math function that returns the integer of a square root of a number.",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "pi",
            "description": "A math function that returns pi (3.14159).",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "pow",
            "description": "A math function that returns one number raised to the power of another number.",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "sqrt",
            "description": "A math function that returns the square root of a number.",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "trunc",
            "description": "A math function that returns the next highest positive integer or the next lowest negative integer for a number.",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Data Structures terms
        {
            "term": "Dictionary",
            "description": "A list of data that stores values in key-value pairs.",
            "category": "Data Structures",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "List",
            "description": "A variable that stores a collection of items in a defined order.",
            "category": "Data Structures",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Set",
            "description": "A list of data that stores unique values of data.",
            "category": "Data Structures",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Tuple",
            "description": "A list of data with immutable values.",
            "category": "Data Structures",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Index",
            "description": "The position in which an item is in a list or a character is in within a set of characters. The first index value is always 0.",
            "category": "Data Structures",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Error Handling terms
        {
            "term": "Except",
            "description": "In the context of exception handling, the code block that runs if a Try block fails.",
            "category": "Error Handling",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Finally Keyword",
            "description": "A block of code that runs regardless of whether a try block was successful.",
            "category": "Error Handling",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Logic Error",
            "description": "A type of error in Python that occurs when an argument, calculation, or flow is set incorrectly.",
            "category": "Error Handling",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Raise",
            "description": "A type of keyword that is used to display an error message when an exception occurs.",
            "category": "Error Handling",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Runtime Error",
            "description": "A error type that only occurs when an app runs and often results in the app crashing.",
            "category": "Error Handling",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Syntax Error",
            "description": "An error in programming code that is caused either by a typo or by trying to use an item incorrectly.",
            "category": "Error Handling",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Try",
            "description": "A block of code that attempts to run without any errors being generated.",
            "category": "Error Handling",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Miscellaneous terms
        {
            "term": "Class",
            "description": "A framework for a group of objects and methods that help define those objects.",
            "category": "OOP",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Comment",
            "description": "A symbol used to get an interpreter to ignore a line of code. Comments are often used to explain code.",
            "category": "Style",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Command-Line Argument",
            "description": "A value used to control how a block of code runs via the command line.",
            "category": "Programming Basics",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Compound Conditional",
            "description": "A type of statement that has two or more conditions, separated by logical operators.",
            "category": "Logic",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Datetime Module",
            "description": "A module that provides functionality for dates, times, and date and time formats.",
            "category": "Modules",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Docstring",
            "description": "Also known as a documentation string, a block of code, surrounded by triple quotation marks, that is used to explain what code is doing.",
            "category": "Documentation",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Else",
            "description": "In the context of exception handling, the code block that runs if a Try block succeeds.",
            "category": "Error Handling",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Exists Function",
            "description": "In the context of file management, a built-in function that checks to see if a file or folder exists.",
            "category": "File Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Indentation",
            "description": "The formatting of code in which a block of code knows which statements are part of that block, such as actions within an if statement.",
            "category": "Style",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Io Module",
            "description": "A module that provides functionality for file management.",
            "category": "Modules",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Math Module",
            "description": "A module that provides a means to multiple types of calculations.",
            "category": "Modules",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "nan",
            "description": "An expression that signifies a value is not a number.",
            "category": "Math Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "now",
            "description": "A date function that returns the current date and time.",
            "category": "Date Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Object",
            "description": "A tangible asset used as a building block for an app.",
            "category": "OOP",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Os Module",
            "description": "The operating system (os) module allows the user to perform operating system tasks, such as create a folder.",
            "category": "Modules",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Os.path",
            "description": "A piece of the os module, the os.path is used to help users to find files and folders on specific paths.",
            "category": "Modules",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Pydoc",
            "description": "A feature in Python that acts as a library module. It automatically generates documentation on Python modules or keywords.",
            "category": "Documentation",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Random Library",
            "description": "A library that contains many random number and list-related functions.",
            "category": "Modules",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Slicing",
            "description": "A process that extracts characters from a list, word, or phrase.",
            "category": "Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "strftime",
            "description": "A date function that formats a date and time as a string, with symbols used to manipulate the format of the string.",
            "category": "Date Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "string.format",
            "description": "A method used to format strings of text and place variables in precise positions within text.",
            "category": "String Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "Sys Module",
            "description": "A module used to import built-in system functions that can be used in Python.",
            "category": "Modules",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "weekday",
            "description": "A date function that returns the weekday number for a date, with 1 being Monday.",
            "category": "Date Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "White Space",
            "description": "Empty lines of code found in Python. It can be utilized to make code easier to read.",
            "category": "Style",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "With Statement",
            "description": "A statement block that supports file operations and automatically closes a file when the block of code is complete.",
            "category": "File Operations",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        
        # Random functions
        {
            "term": "choice",
            "description": "A random function that returns one value from a list of values.",
            "category": "Random Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "randint",
            "description": "A random function that returns an integer between a starting value and an ending value.",
            "category": "Random Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "random",
            "description": "A function that returns a random number between 0 and 1.",
            "category": "Random Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "randrange",
            "description": "A random function that returns a number between a starting value and one less than the ending value.",
            "category": "Random Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "sample",
            "description": "A random function that returns a set number of values from a list of values.",
            "category": "Random Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "term": "shuffle",
            "description": "A random function that reorders a list of values randomly.",
            "category": "Random Functions",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    return vocabulary_data

def upload_vocabulary_to_firebase():
    """Upload vocabulary terms to Firebase."""
    # Initialize Firebase service
    firebase_service = FirebaseService(config)
    
    if not firebase_service.is_available():
        print("Firebase is not available. Check your connection and credentials.")
        return False
    
    vocabulary_data = format_vocabulary_data()
    
    # Upload each vocabulary term to Firebase
    batch = firebase_service.db.batch()
    
    # Clear existing vocabulary collection
    existing_docs = firebase_service.db.collection('vocabulary').stream()
    for doc in existing_docs:
        batch.delete(doc.reference)
    
    # Add new vocabulary terms
    for term_data in vocabulary_data:
        # Use term as document ID (converted to lowercase and spaces replaced with underscores)
        doc_id = term_data['term'].lower().replace(' ', '_')
        doc_ref = firebase_service.db.collection('vocabulary').document(doc_id)
        batch.set(doc_ref, term_data)
    
    # Commit the batch
    batch.commit()
    print(f"Successfully uploaded {len(vocabulary_data)} vocabulary terms to Firebase.")
    return True

if __name__ == "__main__":
    success = upload_vocabulary_to_firebase()
    if success:
        print("Vocabulary upload completed successfully!")
    else:
        print("Vocabulary upload failed.")
        vocab_ref = firebase_service.db.collection('vocabulary').document(doc_id)
        batch.set(vocab_ref, term_data)
    
    # Commit batch
    batch.commit()
    
    print(f"Successfully uploaded {len(vocabulary_data)} vocabulary terms to Firebase.")
    return True

def main():
    """Main entry point for the script."""
    print("Starting vocabulary upload to Firebase...")
    success = upload_vocabulary_to_firebase()
    
    if success:
        print("Vocabulary upload completed successfully!")
    else:
        print("Vocabulary upload failed.")

if __name__ == "__main__":
    main()
