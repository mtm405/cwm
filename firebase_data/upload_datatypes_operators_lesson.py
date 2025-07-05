#!/usr/bin/env python3
"""
Upload Python Data Types and Operators Lesson to Firebase
This script uploads a comprehensive lesson on Python data types and operators
"""

import json
import sys
import os
from datetime import datetime

# Add the parent directory to the path so we can import from the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.firebase_service import FirebaseService
from config import get_config

def get_lesson_data():
    """Return the lesson data for Python Data Types and Operators"""
    return {
        "id": "python-datatypes-operators-01",
        "title": "Operations using Data Types and Operators",
        "description": "Master Python's data types, type operations, operator precedence, and operator selection for effective programming",
        "order": 1,
        "difficulty": "intermediate",
        "estimated_time": 90,
        "prerequisites": [],
        "tags": ["python", "data-types", "operators", "type-conversion", "lists", "precedence"],
        "xp_reward": 200,
        "pycoins_reward": 50,
        "quiz_id": "datatypes-operators-quiz",
        "has_subtopics": True,
        "subtopics": ["Data Types & Identification", "Type Operations & Lists", "Operator Precedence", "Selecting Operators"],
        "current_subtopic_index": 0,
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "is_published": True,
        "blocks": [
            {
                "id": "intro-datatypes",
                "type": "text",
                "order": 0,
                "subtopic_index": 0,
                "title": "Introduction to Python Data Types",
                "content": "# Python Data Types\n\nEvery value in Python has a type that determines what operations you can perform with it. Python's four fundamental data types are:\n\n## Core Data Types\n\n1. **str (String)** - Text data enclosed in quotes\n   - `\"Hello\"` or `'World'` or `'''Multi-line'''`\n   \n2. **int (Integer)** - Whole numbers without decimal points\n   - `42`, `-17`, `0`, `1_000_000`\n   \n3. **float (Floating-point)** - Numbers with decimal points\n   - `3.14`, `-0.5`, `1.0`, `2.5e-4`\n   \n4. **bool (Boolean)** - True or False values\n   - `True`, `False` (note the capitalization!)\n\n## Why Data Types Matter\n\n- **Operations**: Different types support different operations\n- **Memory**: Python allocates memory based on type\n- **Behavior**: Types determine how values interact\n- **Errors**: Using wrong types causes TypeErrors",
                "key_points": [
                    "Every value in Python has a specific type",
                    "Python uses dynamic typing - variables can change types",
                    "The type() function reveals any value's type",
                    "Strings in quotes, integers without decimals, floats with decimals, booleans True/False"
                ]
            },
            {
                "id": "datatypes-example",
                "type": "code_example",
                "order": 1,
                "subtopic_index": 0,
                "title": "Identifying Data Types",
                "language": "python",
                "code": "# Creating variables of different types\nname = \"Alice\"              # String\nage = 16                    # Integer\nheight = 5.7               # Float\nis_student = True          # Boolean\n\n# Checking types with type() function\nprint(f\"name: {name}, Type: {type(name)}\")\nprint(f\"age: {age}, Type: {type(age)}\")\nprint(f\"height: {height}, Type: {type(height)}\")\nprint(f\"is_student: {is_student}, Type: {type(is_student)}\")\n\n# Common mistake - numbers in quotes are strings!\nage_text = \"16\"\nprint(f\"\\nage_text: {age_text}, Type: {type(age_text)}\")\nprint(f\"Is age == age_text? {age == age_text}\")  # False!",
                "explanation": "The type() function returns the class of any value. Notice that '16' in quotes is a string, not a number. This is a common source of bugs when reading user input or file data."
            },
            {
                "id": "dynamic-typing",
                "type": "code_example",
                "order": 2,
                "subtopic_index": 0,
                "title": "Dynamic Typing in Python",
                "language": "python",
                "code": "# Variables can change types\nx = 42          # x is now an integer\nprint(f\"x = {x}, type: {type(x).__name__}\")\n\nx = \"hello\"     # x is now a string\nprint(f\"x = {x}, type: {type(x).__name__}\")\n\nx = 3.14        # x is now a float\nprint(f\"x = {x}, type: {type(x).__name__}\")\n\nx = True        # x is now a boolean\nprint(f\"x = {x}, type: {type(x).__name__}\")\n\n# Collections can hold mixed types\nmixed_list = [42, \"hello\", 3.14, True, [1, 2, 3]]\nprint(\"\\nMixed list contents:\")\nfor item in mixed_list:\n    print(f\"  {item} is type {type(item).__name__}\")",
                "explanation": "Python is dynamically typed, meaning variables don't have fixed types. A variable is just a name that refers to an object, and can refer to objects of different types at different times."
            },
            {
                "id": "type-identification-exercise",
                "type": "interactive",
                "order": 3,
                "subtopic_index": 0,
                "title": "Type Detective Challenge",
                "instructions": "Create a function that analyzes a list of values and returns a dictionary counting how many of each type are present.",
                "starter_code": "def count_types(values):\n    \"\"\"\n    Count occurrences of each data type in a list\n    \n    Args:\n        values: list of mixed type values\n    \n    Returns:\n        dict: counts of each type found\n    \"\"\"\n    # Your code here\n    # Hint: Initialize a dictionary to store counts\n    # Hint: Use type(value).__name__ to get type name as string\n    pass\n\n# Test your function\ntest_data = [1, \"hello\", 3.14, True, \"world\", 42, False, 2.5, \"Python\"]\nresult = count_types(test_data)\nprint(result)\n# Expected: {'int': 2, 'str': 3, 'float': 2, 'bool': 2}",
                "solution": "def count_types(values):\n    \"\"\"\n    Count occurrences of each data type in a list\n    \n    Args:\n        values: list of mixed type values\n    \n    Returns:\n        dict: counts of each type found\n    \"\"\"\n    type_counts = {}\n    \n    for value in values:\n        type_name = type(value).__name__\n        if type_name in type_counts:\n            type_counts[type_name] += 1\n        else:\n            type_counts[type_name] = 1\n    \n    return type_counts\n\n# Test your function\ntest_data = [1, \"hello\", 3.14, True, \"world\", 42, False, 2.5, \"Python\"]\nresult = count_types(test_data)\nprint(result)\n# Output: {'int': 2, 'str': 3, 'float': 2, 'bool': 2}",
                "hints": [
                    "Initialize an empty dictionary to store counts",
                    "Loop through each value in the list",
                    "Use type(value).__name__ to get the type name as a string",
                    "Check if the type is already in your dictionary before adding"
                ],
                "language": "python",
                "challenge_type": "Exercise",
                "difficulty": "beginner"
            },
            {
                "id": "type-conversion-intro",
                "type": "text",
                "order": 4,
                "subtopic_index": 1,
                "title": "Type Conversion and Operations",
                "content": "# Data Type Operations\n\n## Type Conversion (Casting)\n\nConverting between data types is essential for:\n- Processing user input (always strings)\n- Mathematical operations\n- Data formatting\n- File I/O operations\n\n### Conversion Functions\n- `int()` - Convert to integer\n- `float()` - Convert to float\n- `str()` - Convert to string\n- `bool()` - Convert to boolean\n\n### Important Rules\n1. Not all conversions are valid (`int(\"hello\")` fails)\n2. Division always returns float\n3. Empty values convert to False\n4. Non-empty values convert to True",
                "key_points": [
                    "Type conversion is also called 'casting'",
                    "Invalid conversions raise ValueError",
                    "Empty strings, 0, and empty lists are False",
                    "Division (/) always returns float, use // for integer division"
                ]
            },
            {
                "id": "type-conversion-example",
                "type": "code_example",
                "order": 5,
                "subtopic_index": 1,
                "title": "Type Conversion Examples",
                "language": "python",
                "code": "# String to number conversions\nage_str = \"18\"\nage_int = int(age_str)      # String to integer\nprint(f\"String '{age_str}' to int: {age_int}\")\n\nprice_str = \"19.99\"\nprice_float = float(price_str)  # String to float\nprint(f\"String '{price_str}' to float: {price_float}\")\n\n# Number to string conversions\nscore = 95\nscore_str = str(score)      # Integer to string\nprint(f\"\\nInteger {score} to string: '{score_str}'\")\n\n# Boolean conversions - empty vs non-empty\nprint(\"\\nBoolean conversions:\")\nprint(f\"bool(''): {bool('')}\")          # Empty string -> False\nprint(f\"bool('Hello'): {bool('Hello')}\") # Non-empty -> True\nprint(f\"bool(0): {bool(0)}\")            # Zero -> False\nprint(f\"bool(42): {bool(42)}\")          # Non-zero -> True\nprint(f\"bool([]): {bool([])}\")          # Empty list -> False\nprint(f\"bool([1,2]): {bool([1,2])}\")    # Non-empty -> True",
                "explanation": "Type conversion allows you to transform values between types. Remember that bool() conversion is based on 'truthiness' - empty/zero values are False, everything else is True."
            },
            {
                "id": "indexing-slicing",
                "type": "code_example",
                "order": 6,
                "subtopic_index": 1,
                "title": "Indexing and Slicing",
                "language": "python",
                "code": "# Indexing - accessing individual elements\ntext = \"Python\"\n# Positive:  0  1  2  3  4  5\n# Letters:   P  y  t  h  o  n\n# Negative: -6 -5 -4 -3 -2 -1\n\nprint(\"Indexing examples:\")\nprint(f\"text[0] = '{text[0]}'\")\nprint(f\"text[5] = '{text[5]}'\")\nprint(f\"text[-1] = '{text[-1]}'\")\nprint(f\"text[-6] = '{text[-6]}'\")\n\n# Slicing - extracting portions\nphrase = \"Python Programming\"\nprint(\"\\nSlicing examples:\")\nprint(f\"phrase[0:6] = '{phrase[0:6]}'\")\nprint(f\"phrase[7:] = '{phrase[7:]}'\")\nprint(f\"phrase[:6] = '{phrase[:6]}'\")\nprint(f\"phrase[::2] = '{phrase[::2]}'\")\nprint(f\"phrase[::-1] = '{phrase[::-1]}'\")\n\n# List slicing works the same way\nnumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]\nprint(f\"\\nnumbers[2:7] = {numbers[2:7]}\")\nprint(f\"numbers[::3] = {numbers[::3]}\")",
                "explanation": "Indexing uses square brackets to access individual elements. Slicing uses [start:end:step] syntax where end is exclusive. Negative indices count from the end."
            },
            {
                "id": "list-operations",
                "type": "code_example",
                "order": 7,
                "subtopic_index": 1,
                "title": "List Operations",
                "language": "python",
                "code": "# Creating and modifying lists\nfruits = [\"apple\", \"banana\", \"orange\"]\nprint(f\"Original: {fruits}\")\n\n# Appending - add to end\nfruits.append(\"grape\")\nprint(f\"After append: {fruits}\")\n\n# Inserting - add at specific position\nfruits.insert(1, \"mango\")\nprint(f\"After insert at 1: {fruits}\")\n\n# Removing - remove first occurrence\nfruits.remove(\"banana\")\nprint(f\"After remove 'banana': {fruits}\")\n\n# Sorting and reversing\nnumbers = [45, 23, 67, 12, 89, 34]\nprint(f\"\\nOriginal numbers: {numbers}\")\n\nnumbers.sort()\nprint(f\"After sort: {numbers}\")\n\nnumbers.reverse()\nprint(f\"After reverse: {numbers}\")\n\n# Finding min/max\nprint(f\"\\nMaximum: {max(numbers)}\")\nprint(f\"Minimum: {min(numbers)}\")\nprint(f\"Sum: {sum(numbers)}\")\nprint(f\"Average: {sum(numbers) / len(numbers):.2f}\")",
                "explanation": "Lists are mutable sequences that support many operations. Methods like append(), sort(), and reverse() modify the list in place. Functions like max(), min(), and sum() return values without changing the list."
            },
            {
                "id": "list-processing-exercise",
                "type": "interactive",
                "order": 8,
                "subtopic_index": 1,
                "title": "Smart List Processor",
                "instructions": "Create a function that takes a list of mixed strings and numbers. Convert numeric strings to appropriate types (int or float), remove non-numeric strings, and return statistics about the numeric values.",
                "starter_code": "def process_list(mixed_list):\n    \"\"\"\n    Process a mixed list of strings and numbers\n    \n    Returns a dictionary with:\n    - numbers: list of all numeric values (properly typed)\n    - sum: sum of all numbers\n    - average: average of all numbers\n    - max: maximum value\n    - min: minimum value\n    \"\"\"\n    # Your code here\n    pass\n\n# Test your function\ntest_data = [\"42\", 3.14, \"hello\", \"7.5\", 10, \"world\", \"-5\"]\nresult = process_list(test_data)\nprint(result)\n# Expected: numbers contain [42, 3.14, 7.5, 10, -5]\n# with appropriate sum, average, max, min",
                "solution": "def process_list(mixed_list):\n    \"\"\"\n    Process a mixed list of strings and numbers\n    \n    Returns a dictionary with:\n    - numbers: list of all numeric values (properly typed)\n    - sum: sum of all numbers\n    - average: average of all numbers\n    - max: maximum value\n    - min: minimum value\n    \"\"\"\n    numbers = []\n    \n    for item in mixed_list:\n        # If already a number, add it\n        if isinstance(item, (int, float)):\n            numbers.append(item)\n        # If string, try to convert\n        elif isinstance(item, str):\n            try:\n                # Try int first\n                if '.' not in item:\n                    numbers.append(int(item))\n                else:\n                    numbers.append(float(item))\n            except ValueError:\n                # Skip non-numeric strings\n                pass\n    \n    # Calculate statistics\n    if numbers:\n        return {\n            'numbers': numbers,\n            'sum': sum(numbers),\n            'average': sum(numbers) / len(numbers),\n            'max': max(numbers),\n            'min': min(numbers)\n        }\n    else:\n        return {\n            'numbers': [],\n            'sum': 0,\n            'average': 0,\n            'max': None,\n            'min': None\n        }\n\n# Test your function\ntest_data = [\"42\", 3.14, \"hello\", \"7.5\", 10, \"world\", \"-5\"]\nresult = process_list(test_data)\nfor key, value in result.items():\n    print(f\"{key}: {value}\")",
                "hints": [
                    "Use isinstance() to check if item is already a number",
                    "For strings, check if '.' is present to decide between int() and float()",
                    "Use try-except to handle conversion errors gracefully",
                    "Don't forget to handle the case of an empty numbers list"
                ],
                "language": "python",
                "challenge_type": "Exercise",
                "difficulty": "intermediate"
            },
            {
                "id": "precedence-intro",
                "type": "text",
                "order": 9,
                "subtopic_index": 2,
                "title": "Understanding Operator Precedence",
                "content": "# Operator Precedence in Python\n\n## Order of Operations\n\nJust like in mathematics (PEMDAS/BODMAS), Python evaluates expressions in a specific order:\n\n### Precedence Hierarchy (Highest to Lowest)\n\n1. **Parentheses** `()` - Override all other precedence\n2. **Exponentiation** `**`\n3. **Unary operators** `+x`, `-x`, `not`\n4. **Multiplication/Division** `*`, `/`, `//`, `%`\n5. **Addition/Subtraction** `+`, `-`\n6. **Comparisons** `<`, `>`, `<=`, `>=`, `==`, `!=`\n7. **Boolean AND** `and`\n8. **Boolean OR** `or`\n9. **Assignment** `=`, `+=`, `-=`, etc.\n\n## Key Rules\n\n- Operations of same precedence: left to right\n- Parentheses always win\n- When in doubt, use parentheses for clarity",
                "key_points": [
                    "Multiplication comes before addition",
                    "Exponentiation has very high precedence",
                    "Comparisons come before logical operators",
                    "Use parentheses to make code clearer"
                ]
            },
            {
                "id": "precedence-examples",
                "type": "code_example",
                "order": 10,
                "subtopic_index": 2,
                "title": "Precedence in Action",
                "language": "python",
                "code": "# Basic arithmetic precedence\nprint(\"Arithmetic Precedence:\")\nprint(f\"2 + 3 * 4 = {2 + 3 * 4}\")          # 14 (not 20)\nprint(f\"(2 + 3) * 4 = {(2 + 3) * 4}\")      # 20\n\n# Exponentiation precedence\nprint(\"\\nExponentiation:\")\nprint(f\"2 * 3 ** 2 = {2 * 3 ** 2}\")        # 18 (not 36)\nprint(f\"(2 * 3) ** 2 = {(2 * 3) ** 2}\")    # 36\n\n# Tricky: unary minus and exponentiation\nprint(\"\\nUnary operators:\")\nprint(f\"-2 ** 2 = {-2 ** 2}\")              # -4 (not 4!)\nprint(f\"(-2) ** 2 = {(-2) ** 2}\")          # 4\n\n# Complex expression step by step\nprint(\"\\nComplex expression: 10 + 5 * 2 ** 2 // 3\")\nprint(f\"Step 1: 2 ** 2 = {2 ** 2}\")\nprint(f\"Step 2: 5 * 4 = {5 * 4}\")\nprint(f\"Step 3: 20 // 3 = {20 // 3}\")\nprint(f\"Step 4: 10 + 6 = {10 + 6}\")\nprint(f\"Final result: {10 + 5 * 2 ** 2 // 3}\")",
                "explanation": "Understanding precedence helps avoid bugs. The expression -2 ** 2 equals -4 because exponentiation happens before the unary minus is applied: -(2 ** 2) = -(4) = -4."
            },
            {
                "id": "logical-precedence",
                "type": "code_example",
                "order": 11,
                "subtopic_index": 2,
                "title": "Logical Operator Precedence",
                "language": "python",
                "code": "# Comparison and logical operators\nx = 5\ny = 10\nz = 3\n\nprint(\"Logical Precedence:\")\n# Comparisons before logical operators\nresult1 = x < y and y > z\nprint(f\"x < y and y > z = {result1}\")\nprint(f\"Evaluated as: ({x < y}) and ({y > z}) = {True} and {True} = {result1}\")\n\n# 'not' has highest precedence among logical operators\nresult2 = not False and True\nprint(f\"\\nnot False and True = {result2}\")\nprint(f\"Evaluated as: (not False) and True = True and True = {result2}\")\n\n# 'and' has higher precedence than 'or'\nresult3 = True or False and False\nprint(f\"\\nTrue or False and False = {result3}\")\nprint(f\"Evaluated as: True or (False and False) = True or False = {result3}\")\n\n# Complex boolean expression\nage = 25\nhas_license = True\nis_insured = False\n\ncan_rent = age >= 21 and has_license or is_insured\nprint(f\"\\nCan rent car: {can_rent}\")\nprint(f\"Evaluated as: ({age >= 21} and {has_license}) or {is_insured}\")\nprint(f\"= (True and True) or False = True\")",
                "explanation": "Logical operators follow the order: not → and → or. Comparisons are evaluated before logical operators. Understanding this prevents logic errors in conditions."
            },
            {
                "id": "precedence-challenge",
                "type": "interactive",
                "order": 12,
                "subtopic_index": 2,
                "title": "Expression Evaluator Challenge",
                "instructions": "Create a function that takes an expression as a string and breaks down its evaluation step by step, showing how precedence affects the result.",
                "starter_code": "def evaluate_step_by_step(expression, variables):\n    \"\"\"\n    Evaluate an expression showing each step\n    \n    Args:\n        expression: string containing the expression\n        variables: dict of variable names and values\n    \n    Returns:\n        list of steps showing the evaluation process\n    \"\"\"\n    # For this exercise, handle these expressions:\n    # \"a + b * c\"\n    # \"a * b + c * d\"\n    # \"a + b > c and d < e\"\n    \n    # Your code here\n    pass\n\n# Test cases\nvars1 = {'a': 2, 'b': 3, 'c': 4}\nsteps1 = evaluate_step_by_step(\"a + b * c\", vars1)\nfor step in steps1:\n    print(step)\n# Should show: b * c = 12, then a + 12 = 14\n\nvars2 = {'a': 5, 'b': 2, 'c': 10, 'd': 3, 'e': 8}\nsteps2 = evaluate_step_by_step(\"a + b > c and d < e\", vars2)\nfor step in steps2:\n    print(step)",
                "solution": "def evaluate_step_by_step(expression, variables):\n    \"\"\"\n    Evaluate an expression showing each step\n    \n    Args:\n        expression: string containing the expression\n        variables: dict of variable names and values\n    \n    Returns:\n        list of steps showing the evaluation process\n    \"\"\"\n    steps = []\n    \n    # Replace variables with values for display\n    display_expr = expression\n    for var, val in variables.items():\n        display_expr = display_expr.replace(var, str(val))\n    \n    steps.append(f\"Original: {expression}\")\n    steps.append(f\"With values: {display_expr}\")\n    \n    # Handle different expression patterns\n    if \"a + b * c\" in expression:\n        b_times_c = variables['b'] * variables['c']\n        steps.append(f\"Step 1: b * c = {variables['b']} * {variables['c']} = {b_times_c}\")\n        result = variables['a'] + b_times_c\n        steps.append(f\"Step 2: a + {b_times_c} = {variables['a']} + {b_times_c} = {result}\")\n        steps.append(f\"Final result: {result}\")\n        \n    elif \"a * b + c * d\" in expression:\n        a_times_b = variables['a'] * variables['b']\n        c_times_d = variables['c'] * variables['d']\n        steps.append(f\"Step 1: a * b = {variables['a']} * {variables['b']} = {a_times_b}\")\n        steps.append(f\"Step 2: c * d = {variables['c']} * {variables['d']} = {c_times_d}\")\n        result = a_times_b + c_times_d\n        steps.append(f\"Step 3: {a_times_b} + {c_times_d} = {result}\")\n        steps.append(f\"Final result: {result}\")\n        \n    elif \"a + b > c and d < e\" in expression:\n        a_plus_b = variables['a'] + variables['b']\n        steps.append(f\"Step 1: a + b = {variables['a']} + {variables['b']} = {a_plus_b}\")\n        comp1 = a_plus_b > variables['c']\n        steps.append(f\"Step 2: {a_plus_b} > {variables['c']} = {comp1}\")\n        comp2 = variables['d'] < variables['e']\n        steps.append(f\"Step 3: {variables['d']} < {variables['e']} = {comp2}\")\n        result = comp1 and comp2\n        steps.append(f\"Step 4: {comp1} and {comp2} = {result}\")\n        steps.append(f\"Final result: {result}\")\n    \n    return steps\n\n# Test cases\nprint(\"Expression 1:\")\nvars1 = {'a': 2, 'b': 3, 'c': 4}\nsteps1 = evaluate_step_by_step(\"a + b * c\", vars1)\nfor step in steps1:\n    print(f\"  {step}\")\n\nprint(\"\\nExpression 2:\")\nvars2 = {'a': 5, 'b': 2, 'c': 10, 'd': 3, 'e': 8}\nsteps2 = evaluate_step_by_step(\"a + b > c and d < e\", vars2)\nfor step in steps2:\n    print(f\"  {step}\")",
                "hints": [
                    "Start by replacing variable names with their values",
                    "Identify operations in order of precedence",
                    "Show each operation as a separate step",
                    "Build up to the final result step by step"
                ],
                "language": "python",
                "challenge_type": "Exercise",
                "difficulty": "intermediate"
            },
            {
                "id": "operators-intro",
                "type": "text",
                "order": 13,
                "subtopic_index": 3,
                "title": "Selecting the Right Operator",
                "content": "# Python Operators Complete Guide\n\n## Categories of Operators\n\n### 1. Arithmetic Operators\n- `+` Addition\n- `-` Subtraction  \n- `*` Multiplication\n- `/` Division (always returns float)\n- `//` Floor division (integer division)\n- `%` Modulo (remainder)\n- `**` Exponentiation (power)\n\n### 2. Assignment Operators\n- `=` Basic assignment\n- `+=`, `-=`, `*=`, `/=` Compound assignments\n- `//=`, `%=`, `**=` More compound assignments\n\n### 3. Comparison Operators\n- `==` Equal to\n- `!=` Not equal to\n- `<`, `>` Less than, Greater than\n- `<=`, `>=` Less/Greater than or equal\n\n### 4. Logical Operators\n- `and` - Both conditions must be True\n- `or` - At least one condition must be True\n- `not` - Inverts boolean value\n\n### 5. Identity & Membership\n- `is`, `is not` - Object identity\n- `in`, `not in` - Membership testing",
                "key_points": [
                    "Choose operators based on the task at hand",
                    "Division (/) always returns float, use // for integer division",
                    "Use 'is' for None checks, '==' for value equality",
                    "Logical operators use short-circuit evaluation"
                ]
            },
            {
                "id": "arithmetic-operators",
                "type": "code_example",
                "order": 14,
                "subtopic_index": 3,
                "title": "Arithmetic Operators in Action",
                "language": "python",
                "code": "# Basic arithmetic operations\na, b = 17, 5\n\nprint(\"Basic Arithmetic:\")\nprint(f\"{a} + {b} = {a + b}\")      # Addition\nprint(f\"{a} - {b} = {a - b}\")      # Subtraction  \nprint(f\"{a} * {b} = {a * b}\")      # Multiplication\nprint(f\"{a} / {b} = {a / b}\")      # Division (float)\nprint(f\"{a} // {b} = {a // b}\")    # Floor division\nprint(f\"{a} % {b} = {a % b}\")      # Modulo (remainder)\nprint(f\"{b} ** 3 = {b ** 3}\")      # Exponentiation\n\n# Practical applications\nprint(\"\\nPractical Uses:\")\n# Check if number is even/odd\nnum = 42\nif num % 2 == 0:\n    print(f\"{num} is even\")\nelse:\n    print(f\"{num} is odd\")\n\n# Calculate average\ngrades = [85, 92, 78, 95, 88]\naverage = sum(grades) / len(grades)\nprint(f\"Average grade: {average:.2f}\")\n\n# Convert minutes to hours and minutes\ntotal_minutes = 135\nhours = total_minutes // 60\nminutes = total_minutes % 60\nprint(f\"{total_minutes} minutes = {hours} hours and {minutes} minutes\")",
                "explanation": "Arithmetic operators perform mathematical calculations. The modulo operator (%) is particularly useful for checking divisibility, creating cycles, and extracting remainders."
            },
            {
                "id": "assignment-operators",
                "type": "code_example",
                "order": 15,
                "subtopic_index": 3,
                "title": "Assignment and Compound Operators",
                "language": "python",
                "code": "# Basic assignment\nx = 10\nprint(f\"Initial x = {x}\")\n\n# Compound assignment operators\nx += 5    # Same as: x = x + 5\nprint(f\"After x += 5: {x}\")\n\nx *= 2    # Same as: x = x * 2\nprint(f\"After x *= 2: {x}\")\n\nx //= 3   # Same as: x = x // 3\nprint(f\"After x //= 3: {x}\")\n\n# Practical example: Running total\nprint(\"\\nShopping cart total:\")\ntotal = 0\nprices = [19.99, 5.50, 12.75, 8.00]\n\nfor item, price in enumerate(prices, 1):\n    total += price\n    print(f\"Item {item}: ${price:.2f} (Total: ${total:.2f})\")\n\nprint(f\"\\nFinal total: ${total:.2f}\")\n\n# Multiple assignment\na = b = c = 0  # All get same value\nx, y, z = 1, 2, 3  # Tuple unpacking\nprint(f\"\\nMultiple assignment: a={a}, b={b}, c={c}\")\nprint(f\"Tuple unpacking: x={x}, y={y}, z={z}\")",
                "explanation": "Compound operators provide a concise way to update variables. They're not just shorter - they're also more efficient as the variable is only evaluated once."
            },
            {
                "id": "comparison-logical",
                "type": "code_example",
                "order": 16,
                "subtopic_index": 3,
                "title": "Comparison and Logical Operators",
                "language": "python",
                "code": "# Comparison operators\nage = 18\nrequired_age = 21\n\nprint(\"Comparison Operators:\")\nprint(f\"age == required_age: {age == required_age}\")\nprint(f\"age != required_age: {age != required_age}\")\nprint(f\"age < required_age: {age < required_age}\")\nprint(f\"age >= 18: {age >= 18}\")\n\n# Logical operators with short-circuit evaluation\nprint(\"\\nLogical Operators:\")\nhas_license = True\nhas_insurance = False\n\n# 'and' - both must be True\ncan_drive = age >= 16 and has_license\nprint(f\"Can drive (age >= 16 AND has_license): {can_drive}\")\n\n# 'or' - at least one must be True\nneeds_parent = age < 18 or not has_insurance\nprint(f\"Needs parent (age < 18 OR no insurance): {needs_parent}\")\n\n# Complex conditions\ncan_rent_car = age >= 25 and has_license and has_insurance\nprint(f\"Can rent car: {can_rent_car}\")\n\n# Short-circuit demonstration\nprint(\"\\nShort-circuit evaluation:\")\nresult = False and print(\"This won't print\")\nresult = True or print(\"This won't print either\")\nresult = True and print(\"This will print\")",
                "explanation": "Comparison operators return boolean values. Logical operators combine conditions using short-circuit evaluation - 'and' stops at first False, 'or' stops at first True."
            },
            {
                "id": "identity-membership",
                "type": "code_example",
                "order": 17,
                "subtopic_index": 3,
                "title": "Identity and Membership Operators",
                "language": "python",
                "code": "# Identity operators: is, is not\nprint(\"Identity Operators:\")\n\n# With immutable objects\na = 1000\nb = 1000\nc = a\n\nprint(f\"a == b: {a == b}\")  # True (same value)\nprint(f\"a is b: {a is b}\")  # False (different objects)\nprint(f\"a is c: {a is c}\")  # True (same object)\n\n# With None (always use 'is' for None)\nvalue = None\nprint(f\"\\nvalue is None: {value is None}\")  # Correct way\nprint(f\"value == None: {value == None}\")    # Works but not recommended\n\n# Membership operators: in, not in\nprint(\"\\nMembership Operators:\")\n\n# With strings\ntext = \"Python Programming\"\nprint(f\"'Python' in text: {'Python' in text}\")\nprint(f\"'java' in text: {'java' in text}\")\nprint(f\"'gram' in text: {'gram' in text}\")\n\n# With lists\nfruits = ['apple', 'banana', 'orange']\nprint(f\"\\n'banana' in fruits: {'banana' in fruits}\")\nprint(f\"'grape' not in fruits: {'grape' not in fruits}\")\n\n# With dictionaries (checks keys by default)\nscores = {'Alice': 92, 'Bob': 87, 'Charlie': 95}\nprint(f\"\\n'Alice' in scores: {'Alice' in scores}\")\nprint(f\"92 in scores.values(): {92 in scores.values()}\")",
                "explanation": "Use 'is' for identity checks (same object in memory), especially with None. Use 'in' for membership testing in sequences and collections. For dictionaries, 'in' checks keys by default."
            },
            {
                "id": "operator-selection-exercise",
                "type": "interactive",
                "order": 18,
                "subtopic_index": 3,
                "title": "Smart Calculator",
                "instructions": "Create a calculator that selects the appropriate operator based on a string command and handles edge cases properly.",
                "starter_code": "def smart_calculate(a, b, operation):\n    \"\"\"\n    Perform calculation based on operation string\n    \n    Operations: 'add', 'subtract', 'multiply', 'divide',\n                'power', 'modulo', 'floor_divide'\n    \n    Handle edge cases like division by zero\n    Return result or error message\n    \"\"\"\n    # Your code here\n    pass\n\n# Test cases\nprint(smart_calculate(10, 3, 'add'))        # 13\nprint(smart_calculate(10, 3, 'divide'))     # 3.333...\nprint(smart_calculate(10, 0, 'divide'))     # Error message\nprint(smart_calculate(2, 8, 'power'))       # 256\nprint(smart_calculate(17, 5, 'modulo'))     # 2\nprint(smart_calculate(10, 3, 'invalid'))    # Error message",
                "solution": "def smart_calculate(a, b, operation):\n    \"\"\"\n    Perform calculation based on operation string\n    \n    Operations: 'add', 'subtract', 'multiply', 'divide',\n                'power', 'modulo', 'floor_divide'\n    \n    Handle edge cases like division by zero\n    Return result or error message\n    \"\"\"\n    # Dictionary mapping operations to functions\n    operations = {\n        'add': lambda x, y: x + y,\n        'subtract': lambda x, y: x - y,\n        'multiply': lambda x, y: x * y,\n        'power': lambda x, y: x ** y\n    }\n    \n    # Handle operations that might cause errors\n    if operation == 'divide':\n        if b == 0:\n            return \"Error: Division by zero\"\n        return a / b\n    elif operation == 'floor_divide':\n        if b == 0:\n            return \"Error: Division by zero\"\n        return a // b\n    elif operation == 'modulo':\n        if b == 0:\n            return \"Error: Division by zero\"\n        return a % b\n    elif operation in operations:\n        return operations[operation](a, b)\n    else:\n        return f\"Error: Unknown operation '{operation}'\"\n\n# Test cases\nprint(f\"10 + 3 = {smart_calculate(10, 3, 'add')}\")        \nprint(f\"10 / 3 = {smart_calculate(10, 3, 'divide')}\")     \nprint(f\"10 / 0 = {smart_calculate(10, 0, 'divide')}\")     \nprint(f\"2 ** 8 = {smart_calculate(2, 8, 'power')}\")       \nprint(f\"17 % 5 = {smart_calculate(17, 5, 'modulo')}\")     \nprint(f\"invalid = {smart_calculate(10, 3, 'invalid')}\")",
                "hints": [
                    "Use if-elif statements or a dictionary to map operations",
                    "Check for division by zero before performing division operations",
                    "Return clear error messages for invalid operations",
                    "Consider using lambda functions for simple operations"
                ],
                "language": "python",
                "challenge_type": "Exercise",
                "difficulty": "intermediate"
            },
            {
                "id": "comprehensive-exercise",
                "type": "code_challenge",
                "order": 19,
                "subtopic_index": 3,
                "title": "Grade Analysis System",
                "description": "Build a comprehensive grade analysis system using all concepts learned",
                "instructions": "Create a complete grade analysis system that:\n1. Accepts mixed input (strings and numbers)\n2. Converts data types appropriately\n3. Uses various operators for calculations\n4. Respects operator precedence\n5. Returns detailed analysis",
                "starter_code": "def analyze_grades(raw_scores, attendance_rate, extra_credit=0):\n    \"\"\"\n    Analyze student grades with various calculations\n    \n    Args:\n        raw_scores: list of scores (can be strings or numbers)\n        attendance_rate: percentage (0-100)\n        extra_credit: bonus points to add\n    \n    Returns:\n        Dictionary with:\n        - valid_scores: list of numeric scores\n        - average: average score\n        - letter_grade: A, B, C, D, or F\n        - passed: True if grade >= 60\n        - attendance_bonus: points added for good attendance\n        - final_grade: grade after all adjustments\n    \"\"\"\n    # Your code here\n    pass\n\n# Test your function\nscores1 = [\"85\", 92, \"78.5\", \"invalid\", 88, \"95\"]\nresult1 = analyze_grades(scores1, 95, extra_credit=5)\nprint(\"Result 1:\")\nfor key, value in result1.items():\n    print(f\"  {key}: {value}\")\n\nscores2 = [65, \"70\", \"62\", 68, \"72.5\"]\nresult2 = analyze_grades(scores2, 65, extra_credit=0)\nprint(\"\\nResult 2:\")\nfor key, value in result2.items():\n    print(f\"  {key}: {value}\")",
                "solution": "def analyze_grades(raw_scores, attendance_rate, extra_credit=0):\n    \"\"\"\n    Analyze student grades with various calculations\n    \n    Args:\n        raw_scores: list of scores (can be strings or numbers)\n        attendance_rate: percentage (0-100)\n        extra_credit: bonus points to add\n    \n    Returns:\n        Dictionary with analysis results\n    \"\"\"\n    # Convert valid scores to numbers\n    valid_scores = []\n    \n    for score in raw_scores:\n        if isinstance(score, (int, float)):\n            valid_scores.append(float(score))\n        elif isinstance(score, str):\n            try:\n                valid_scores.append(float(score))\n            except ValueError:\n                pass  # Skip invalid strings\n    \n    # Calculate average\n    if not valid_scores:\n        return {\"error\": \"No valid scores found\"}\n    \n    average = sum(valid_scores) / len(valid_scores)\n    \n    # Calculate attendance bonus (2% for 90%+ attendance)\n    attendance_bonus = 2 if attendance_rate >= 90 else 0\n    \n    # Calculate final grade with precedence\n    # Formula: (average + extra_credit) * (1 + attendance_bonus/100)\n    final_grade = (average + extra_credit) * (1 + attendance_bonus / 100)\n    \n    # Ensure grade doesn't exceed 100\n    final_grade = min(final_grade, 100)\n    \n    # Determine letter grade\n    if final_grade >= 90:\n        letter_grade = 'A'\n    elif final_grade >= 80:\n        letter_grade = 'B'\n    elif final_grade >= 70:\n        letter_grade = 'C'\n    elif final_grade >= 60:\n        letter_grade = 'D'\n    else:\n        letter_grade = 'F'\n    \n    # Check if passed\n    passed = final_grade >= 60\n    \n    return {\n        'valid_scores': valid_scores,\n        'average': round(average, 2),\n        'letter_grade': letter_grade,\n        'passed': passed,\n        'attendance_bonus': f\"{attendance_bonus}%\",\n        'final_grade': round(final_grade, 2),\n        'scores_processed': f\"{len(valid_scores)}/{len(raw_scores)}\"\n    }\n\n# Test cases\nscores1 = [\"85\", 92, \"78.5\", \"invalid\", 88, \"95\"]\nresult1 = analyze_grades(scores1, 95, extra_credit=5)\nprint(\"Result 1:\")\nfor key, value in result1.items():\n    print(f\"  {key}: {value}\")\n\nscores2 = [65, \"70\", \"62\", 68, \"72.5\"]\nresult2 = analyze_grades(scores2, 65, extra_credit=0)\nprint(\"\\nResult 2:\")\nfor key, value in result2.items():\n    print(f\"  {key}: {value}\")",
                "tests": [
                    {
                        "input": "([\"85\", 92, \"78.5\", \"invalid\", 88, \"95\"], 95, 5)",
                        "expected": "{'passed': True, 'letter_grade': 'A'}"
                    },
                    {
                        "input": "([65, \"70\", \"62\", 68, \"72.5\"], 65, 0)",
                        "expected": "{'passed': True, 'letter_grade': 'D'}"
                    }
                ],
                "hints": [
                    "Use try-except for safe type conversion",
                    "Calculate attendance bonus based on the rate",
                    "Apply operator precedence correctly in final grade calculation",
                    "Use min() to cap the grade at 100"
                ],
                "language": "python",
                "challenge_type": "Algorithm",
                "difficulty": "intermediate"
            },
            {
                "id": "final-quiz",
                "type": "quiz",
                "order": 20,
                "subtopic_index": 3,
                "title": "Comprehensive Knowledge Check",
                "description": "Test your understanding of all concepts covered in this lesson",
                "quiz_id": "datatypes-operators-quiz"
            }
        ]
    }

def upload_lesson():
    """Upload the lesson to Firebase"""
    try:
        # Initialize Firebase service
        config = get_config()
        firebase_service = FirebaseService(config.FIREBASE_CONFIG)
        
        if not firebase_service.is_available():
            print("❌ Firebase service is not available")
            return False
        
        # Get lesson data
        lesson_data = get_lesson_data()
        lesson_id = lesson_data['id']
        
        print(f"📚 Uploading lesson: {lesson_data['title']}")
        print(f"🆔 ID: {lesson_id}")
        print(f"📖 Description: {lesson_data['description']}")
        print(f"🎯 Difficulty: {lesson_data['difficulty']}")
        print(f"⏱️ Estimated time: {lesson_data['estimated_time']} minutes")
        print(f"📋 Subtopics: {len(lesson_data['subtopics'])}")
        print(f"📝 Blocks: {len(lesson_data['blocks'])}")
        
        # Upload to Firebase
        success = firebase_service.save_lesson(lesson_id, lesson_data)
        
        if success:
            print(f"\n✅ Successfully uploaded lesson: {lesson_id}")
            print(f"🔗 Access URL: /lesson/{lesson_id}")
            
            # Show subtopics
            print("\n📑 Subtopics:")
            for i, subtopic in enumerate(lesson_data['subtopics']):
                print(f"  {i+1}. {subtopic}")
                
            # Show block types
            block_types = {}
            for block in lesson_data['blocks']:
                block_type = block['type']
                if block_type in block_types:
                    block_types[block_type] += 1
                else:
                    block_types[block_type] = 1
            
            print("\n🧱 Block Types:")
            for block_type, count in block_types.items():
                print(f"  {block_type}: {count}")
                
            return True
        else:
            print(f"❌ Failed to upload lesson: {lesson_id}")
            return False
            
    except Exception as e:
        print(f"❌ Error uploading lesson: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting lesson upload...")
    success = upload_lesson()
    
    if success:
        print("\n🎉 Lesson upload completed successfully!")
    else:
        print("\n💥 Lesson upload failed!")
